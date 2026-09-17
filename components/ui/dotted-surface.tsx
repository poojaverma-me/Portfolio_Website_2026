"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/use-theme";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type DottedSurfaceProps = Omit<React.ComponentProps<"div">, "ref"> & {
  size?: number;
  opacity?: number;
  sizeAttenuation?: boolean;
  vertexColors?: boolean;
};

const SEPARATION = 150;
const AMOUNTX = 40;
const AMOUNTY = 60;

/** Read a CSS custom property from <html>, so the dots follow the theme tokens. */
function cssColor(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const color = new THREE.Color();
  try {
    color.setStyle(value || fallback);
  } catch {
    color.setStyle(fallback);
  }
  return color;
}

/**
 * Animated wave of dots rendered with three.js. Fills its nearest positioned
 * parent by default (pass className="fixed inset-0 -z-1" for a page backdrop).
 */
export function DottedSurface({
  className,
  size = 8,
  opacity = 0.8,
  sizeAttenuation = true,
  vertexColors = true,
  ...props
}: DottedSurfaceProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = () => Math.max(container.clientWidth, 1);
    const height = () => Math.max(container.clientHeight, 1);

    // Scene setup. Fog fades distant dots into the page background.
    const baseColor = cssColor("--color-base", theme === "dark" ? "#000000" : "#f6f4f1");
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(baseColor, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(60, width() / height(), 1, 10000);
    camera.position.set(0, 355, 1220);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // WebGL unavailable: render nothing rather than crash the page
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width(), height());
    renderer.setClearColor(baseColor, 0);
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // Dots: nearest rows take the accent colour, fading to the label colour
    // toward the horizon. THREE colours are 0 to 1, not 0 to 255.
    const near = cssColor("--color-accent", "#f96b0b");
    const far = cssColor("--color-label", theme === "dark" ? "#f5f5f7" : "#1d1d1f");
    const mixed = new THREE.Color();

    const positions: number[] = [];
    const colors: number[] = [];
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions.push(
          ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
          0, // animated
          iy * SEPARATION - (AMOUNTY * SEPARATION) / 2,
        );
        mixed.copy(far).lerp(near, Math.pow(iy / (AMOUNTY - 1), 2));
        colors.push(mixed.r, mixed.g, mixed.b);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size,
      vertexColors,
      color: vertexColors ? undefined : near,
      transparent: true,
      opacity,
      sizeAttenuation,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const positionAttribute = geometry.attributes.position;
    const array = positionAttribute.array as Float32Array;
    let count = 0;

    const renderWave = () => {
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          array[i * 3 + 1] =
            Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;
          i++;
        }
      }
      positionAttribute.needsUpdate = true;
      renderer.render(scene, camera);
    };

    // Only animate while on screen, and never for reduced-motion visitors.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationId = 0;
    let running = false;

    const loop = () => {
      animationId = requestAnimationFrame(loop);
      renderWave();
      count += 0.1;
    };
    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      animationId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animationId);
    };

    renderWave(); // first frame, also the static frame for reduced motion

    const visibility = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );
    visibility.observe(container);

    const resize = new ResizeObserver(() => {
      camera.aspect = width() / height();
      camera.updateProjectionMatrix();
      renderer.setSize(width(), height());
      if (!running) renderer.render(scene, camera);
    });
    resize.observe(container);

    return () => {
      stop();
      visibility.disconnect();
      resize.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [theme, size, opacity, sizeAttenuation, vertexColors]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      {...props}
    />
  );
}

export default DottedSurface;
