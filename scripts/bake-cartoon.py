"""
Turns the voyage intro's painted sea creatures into the textures the engine
reads. The paintings are top-down character sprites made with Codex's image
model (gpt-image), each on a flat chroma background, kept in

  ~/Projects/portfolio-projects/_cartoon/raw/<name>.png

(prompts and the generator script in scripts/cartoon/). For each animal this
script keys out the background, splits sprite sheets into their parts,
measures them, and writes

  public/voyage/<kind>-albedo.webp  the painting, with a soft alpha edge
  public/voyage/<kind>-shape.webp   rg: a surface normal in the body frame,
                                    raised from the silhouette as a rounded
                                    dome, so the scene's sun still wraps
                                    round the painted shading
  components/voyage/creature-atlas.ts  every part's place in its texture and
                                    its extent in body units

Run from the repo root:  python3 scripts/bake-cartoon.py
Needs numpy, scipy and Pillow. Light work: one image at a time.
"""

import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), "..")
RAW = os.path.expanduser("~/Projects/portfolio-projects/_cartoon/raw")
OUT = os.path.join(ROOT, "public", "voyage")
PAD = 6  # px of clear space round every part, so mipmaps don't bleed

# Swimmers are laid out in "body units": the snout at x = +100 and the tail
# tip at x = -110, 210 units per body length, y down, spine on y = 0.
SNOUT, TAIL = 100.0, -110.0


def key(path):
    """RGBA float image with the flat background keyed out and unblended."""
    rgb = np.asarray(Image.open(path).convert("RGB"), np.float32)
    border = np.concatenate([rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3),
                             rgb[:, :8].reshape(-1, 3), rgb[:, -8:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.linalg.norm(rgb - bg, axis=-1)
    t = np.clip((d - 70) / (190 - 70), 0, 1)
    a = t * t * (3 - 2 * t)
    # small specks and holes: keep solid shapes only
    solid = ndimage.binary_opening(a > 0.5, iterations=1)
    solid = ndimage.binary_fill_holes(solid)
    near = ndimage.binary_dilation(solid, iterations=3)
    a = np.where(near, a, 0)
    a = np.where(solid & (a < 0.98) & ~ndimage.binary_dilation(~solid, iterations=2), 1, a)
    # take the background's share back out of the edge pixels
    safe = np.maximum(a, 1e-3)[..., None]
    fg = np.clip((rgb - (1 - a[..., None]) * bg) / safe, 0, 255)
    fg[a < 0.02] = 0
    return np.dstack([fg / 255, a]), solid


def parts_of(solid, min_frac=0.002):
    """Bounding boxes of the separate shapes on a sheet, biggest first."""
    lab, n = ndimage.label(ndimage.binary_dilation(solid, iterations=4))
    out = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        area = int((lab[sl] == i).sum())
        if area > solid.size * min_frac:
            out.append((area, sl, i))
    out.sort(key=lambda x: -x[0])
    return [(sl, lab == i) for _, sl, i in out]


def crop(img, mask, sl, scale):
    """Crops one part (only its own pixels) with padding, resized by `scale`."""
    y0, y1 = sl[0].start, sl[0].stop
    x0, x1 = sl[1].start, sl[1].stop
    part = img[y0:y1, x0:x1].copy()
    part[~mask[y0:y1, x0:x1]] = 0
    h, w = part.shape[:2]
    W, H = max(1, round(w * scale)), max(1, round(h * scale))
    # resize premultiplied so edges don't darken
    pre = part.copy()
    pre[..., :3] *= pre[..., 3:4]
    im = Image.fromarray((pre * 255 + 0.5).astype(np.uint8), "RGBA").resize((W, H), Image.LANCZOS)
    p = np.asarray(im, np.float32) / 255
    a = p[..., 3:4]
    p[..., :3] = np.where(a > 1e-3, p[..., :3] / np.maximum(a, 1e-3), 0)
    return np.pad(p, ((PAD, PAD), (PAD, PAD), (0, 0)))


def shape_map(part, roundness=0.55):
    """Normals of a rounded dome raised from the silhouette."""
    m = part[..., 3] > 0.5
    d = ndimage.distance_transform_edt(m)
    R = max(2.0, d.max() * roundness)
    x = np.clip(d / R, 0, 1)
    h = R * np.sqrt(1 - (1 - x) ** 2)
    # soften the crease the distance transform leaves along the middle
    h = ndimage.gaussian_filter(h, max(1.2, d.max() * 0.18))
    gy, gx = np.gradient(h)
    n = np.dstack([-gx, -gy, np.ones_like(h)])
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    s = np.zeros(part.shape, np.float32)
    s[..., 0] = n[..., 0] * 0.5 + 0.5
    s[..., 1] = n[..., 1] * 0.5 + 0.5
    s[..., 3] = 1
    s[~(part[..., 3] > 0.01)] = [0.5, 0.5, 0, 1]
    return s


def spine_row(part):
    """The row the spine runs along: the middle of the body's columns."""
    m = part[..., 3] > 0.5
    rows = np.arange(m.shape[0])[:, None]
    cols = m.any(0)
    top = np.where(m, rows, 10**9).min(0)[cols]
    bot = np.where(m, rows, -1).max(0)[cols]
    return float(np.median((top + bot) / 2))


def pack(kind, entries):
    """
    Stacks parts into one atlas. entries: (name, rgba, shape, extent) where
    extent = (x0, x1, y0, y1) in body units across the part's padded box.
    """
    W = max(e[1].shape[1] for e in entries)
    H = sum(e[1].shape[0] for e in entries)
    albedo = np.zeros((H, W, 4), np.float32)
    shape = np.zeros((H, W, 4), np.float32)
    shape[...] = [0.5, 0.5, 0, 1]
    meta = {"w": W, "h": H, "parts": {}}
    y = 0
    for name, rgba, sh, ext in entries:
        h, w = rgba.shape[:2]
        albedo[y:y + h, :w] = rgba
        shape[y:y + h, :w] = sh
        meta["parts"][name] = {
            "u0": 0.0, "v0": round(y / H, 6), "u1": round(w / W, 6), "v1": round((y + h) / H, 6),
            "x0": round(ext[0], 2), "x1": round(ext[1], 2), "y0": round(ext[2], 2), "y1": round(ext[3], 2),
        }
        y += h
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray((albedo * 255 + 0.5).astype(np.uint8), "RGBA").save(
        os.path.join(OUT, f"{kind}-albedo.webp"), quality=88, method=6, alpha_quality=90)
    Image.fromarray((shape * 255 + 0.5).astype(np.uint8), "RGBA").save(
        os.path.join(OUT, f"{kind}-shape.webp"), quality=90, method=6)
    print(f"{kind}: {W}x{H}, parts {list(meta['parts'])}")
    return meta


def swimmer(part, roundness=0.55):
    """A ribbon swimmer's texture and extent: snout at +100, tail tip at -110."""
    h, w = part.shape[:2]
    scale = (SNOUT - TAIL) / (w - 2 * PAD)
    row = spine_row(part)
    ext = (TAIL - PAD * scale, SNOUT + PAD * scale, -row * scale, (h - row) * scale)
    return part, shape_map(part, roundness), ext


def body_profile(part, ext):
    """Half-width of the body along x (body units), for placing fins and columns."""
    m = part[..., 3] > 0.5
    h, w = m.shape
    sx = (ext[1] - ext[0]) / w
    sy = (ext[3] - ext[2]) / h
    out = []
    for c in range(0, w, max(1, w // 60)):
        ys = np.where(m[:, c])[0]
        if len(ys):
            out.append((round(ext[0] + c * sx, 1), round(ext[2] + ys.min() * sy, 1), round(ext[2] + ys.max() * sy, 1)))
    return out


def main():
    atlas = {}

    # --- orca: one painting, about 1024 px nose to tail
    img, solid = key(os.path.join(RAW, "orca2.png"))
    sl, m = parts_of(solid)[0]
    part = crop(img, m, sl, 1024 / (sl[1].stop - sl[1].start))
    atlas["orca"] = pack("orca", [("body", *swimmer(part, 0.6))])
    atlas["orca"]["profile"] = body_profile(part, atlas_ext(atlas["orca"], "body"))

    # --- shark
    img, solid = key(os.path.join(RAW, "shark.png"))
    sl, m = parts_of(solid)[0]
    part = crop(img, m, sl, 640 / (sl[1].stop - sl[1].start))
    atlas["shark"] = pack("shark", [("body", *swimmer(part, 0.6))])

    # --- fish: two variants on one sheet, top and bottom
    img, solid = key(os.path.join(RAW, "fish.png"))
    found = sorted(parts_of(solid)[:2], key=lambda p: p[0][0].start)
    entries = []
    for name, (sl, m) in zip(["a", "b"], found):
        part = crop(img, m, sl, 256 / (sl[1].stop - sl[1].start))
        entries.append((name, *swimmer(part, 0.7)))
    atlas["fish"] = pack("fish", entries)

    # --- turtle: body (shell, head, tail) and one front and one rear flipper;
    # the other side's flippers are the same pictures mirrored
    img, solid = key(os.path.join(RAW, "turtle.png"))
    found = parts_of(solid)[:3]
    body_sl, body_m = found[0]
    flips = sorted(found[1:], key=lambda p: p[0][0].start)  # front is above rear
    bw = body_sl[1].stop - body_sl[1].start
    scale = 560 / bw
    units = 210 / (bw * scale)  # body units per output px: head tip to tail tip = 210
    entries = []
    body = crop(img, body_m, body_sl, scale)
    h, w = body.shape[:2]
    row = spine_row(body)
    entries.append(("body", body, shape_map(body, 0.75),
                    (TAIL - PAD * units, SNOUT + PAD * units, -row * units, (h - row) * units)))
    for name, (sl, m) in zip(["front", "rear"], flips):
        part = crop(img, m, sl, scale)
        h, w = part.shape[:2]
        mid = spine_row(part)
        # root at x = 0, the flipper running out along +x
        entries.append((name, part, shape_map(part, 0.8),
                        (-PAD * units, (w - PAD) * units, -mid * units, (h - mid) * units)))
    atlas["turtle"] = pack("turtle", entries)
    atlas["turtle"]["profile"] = body_profile(body, atlas_ext(atlas["turtle"], "body"))

    # --- jellyfish: the bell, four oral arms, and a painted tentacle strip
    img, solid = key(os.path.join(RAW, "jelly.png"))
    found = parts_of(solid)
    bell_sl, bell_m = found[0]
    arms = sorted(found[1:5], key=lambda p: p[0][0].start)
    bd = bell_sl[1].stop - bell_sl[1].start
    scale = 320 / bd
    units = 200 / (bd * scale)  # bell diameter = 200 units
    entries = []
    bell = crop(img, bell_m, bell_sl, scale)
    h, w = bell.shape[:2]
    entries.append(("bell", bell, shape_map(bell, 0.9),
                    (-w / 2 * units, w / 2 * units, -h / 2 * units, h / 2 * units)))
    for i, (sl, m) in enumerate(arms):
        part = crop(img, m, sl, scale)
        h, w = part.shape[:2]
        mid = spine_row(part)
        entries.append((f"arm{i}", part, shape_map(part, 0.9),
                        (-PAD * units, (w - PAD) * units, -mid * units, (h - mid) * units)))
    entries.append(("tentacle", *tentacle_strip(units)))
    atlas["jelly"] = pack("jelly", entries)

    # the turtle's and orca's outlines, to place fins and flippers by
    for kind in ("orca", "turtle"):
        prof = atlas[kind].pop("profile")
        with open(os.path.join(RAW, "..", f"{kind}-profile.json"), "w") as f:
            json.dump(prof, f)

    ts = os.path.join(ROOT, "components", "voyage", "creature-atlas.ts")
    with open(ts, "w") as f:
        f.write("// Generated by scripts/bake-cartoon.py. Do not edit by hand.\n")
        f.write("// Each part: its rectangle in the texture (u, v) and its extent in body units\n")
        f.write("// (swimmers: snout at x = +100, tail tip at -110; flippers and arms: root at x = 0).\n")
        f.write(f"export const ATLAS = {json.dumps(atlas, indent=2)} as const;\n")


def atlas_ext(meta, name):
    p = meta["parts"][name]
    return (p["x0"], p["x1"], p["y0"], p["y1"])


def tentacle_strip(units):
    """A thin, glowing tentacle painted along x: bright core, soft halo."""
    W, H = 256, 24
    y = (np.arange(H) - (H - 1) / 2)[:, None] / (H / 2)
    x = np.arange(W)[None, :] / (W - 1)
    core = np.exp(-(y / 0.18) ** 2)
    halo = np.exp(-(y / 0.55) ** 2) * 0.35
    fade = 1 - x ** 3
    a = np.clip((core + halo) * fade, 0, 1)
    core = np.broadcast_to(core, (H, W))
    rgb = np.dstack([np.full((H, W), 0.98), 0.78 + 0.18 * core, np.full((H, W), 0.95)])
    rgba = np.dstack([rgb, a]).astype(np.float32)
    rgba = np.pad(rgba, ((PAD, PAD), (PAD, PAD), (0, 0)))
    sh = np.zeros_like(rgba)
    sh[...] = [0.5, 0.5, 0, 1]
    h, w = rgba.shape[:2]
    return rgba, sh, (0.0, 1.0, -0.5, 0.5)


if __name__ == "__main__":
    main()
