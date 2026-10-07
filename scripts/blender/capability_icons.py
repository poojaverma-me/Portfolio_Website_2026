"""
Renders the six capability icons for the homepage's "What I do" cards.

Run headless (from the repo root):
  blender -b --factory-startup --python scripts/blender/capability_icons.py -- <out_dir>

Each icon is a small sculpture in the site's own materials: graphite (the
macOS-style app tiles), clear glass, and ember (#f96b0b, the one accent). The
objects are symbols, not illustrations:

  ai-products   a glass orb with an ember core, set into a graphite tile
  limits        an ember sphere passing through an upright glass gate
  evaluation    graphite bars of rising height, the last one ember
  research      an ember beam bent by a glass prism
  full-stack    three stacked slabs, the top one glass over an ember edge
  workflows     a graphite and a glass ring, linked, with an ember bead

Rendered with Cycles on the GPU at 384 px, transparent background, then
written as PNG for scripts/bake-icons.py (or any converter) to turn into WebP.
"""

import math
import os
import sys

import bpy
from mathutils import Euler, Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "icons")
os.makedirs(OUT, exist_ok=True)
SIZE = 384


def srgb(c):
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c) + (1.0,)


EMBER = srgb((0.976, 0.42, 0.043))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == "METAL"
    sc.cycles.device = "GPU"
    sc.cycles.samples = 128
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.cycles.film_transparent_glass = True
    sc.render.resolution_x = SIZE
    sc.render.resolution_y = SIZE
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    world = bpy.data.worlds.new("studio")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = srgb((0.16, 0.16, 0.18))
    bg.inputs["Strength"].default_value = 0.6
    sc.world = world
    # camera: three-quarter view from the front, a little above
    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 70
    cam = bpy.data.objects.new("cam", cam_data)
    cam.location = (0, -6.2, 4.1)
    cam.rotation_euler = Euler((math.radians(57), 0, 0))
    sc.collection.objects.link(cam)
    sc.camera = cam
    # key light up-left, a cool fill, and an ember rim from behind
    light("key", (-3.5, -3, 5.5), 900, 4.0, (1, 0.97, 0.94))
    light("fill", (4, -2.5, 2), 200, 3.0, (0.85, 0.9, 1.0))
    light("rim", (1.5, 3.5, 2.5), 350, 2.0, (1.0, 0.55, 0.25))
    return sc


def light(name, loc, power, size, color):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.size = size
    data.color = color
    ob = bpy.data.objects.new(name, data)
    ob.location = loc
    direction = -Vector(loc)
    ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(ob)


def material(name, kind):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    b = mat.node_tree.nodes["Principled BSDF"]
    if kind == "graphite":
        b.inputs["Base Color"].default_value = srgb((0.07, 0.07, 0.08))
        b.inputs["Metallic"].default_value = 0.55
        b.inputs["Roughness"].default_value = 0.32
        b.inputs["Coat Weight"].default_value = 1.0
        b.inputs["Coat Roughness"].default_value = 0.08
    elif kind == "glass":
        b.inputs["Base Color"].default_value = srgb((0.98, 0.96, 0.94))
        b.inputs["Transmission Weight"].default_value = 1.0
        b.inputs["Roughness"].default_value = 0.06
        b.inputs["IOR"].default_value = 1.45
    elif kind == "frost":
        b.inputs["Base Color"].default_value = srgb((0.96, 0.95, 0.94))
        b.inputs["Transmission Weight"].default_value = 1.0
        b.inputs["Roughness"].default_value = 0.32
        b.inputs["IOR"].default_value = 1.45
    elif kind == "ember":
        b.inputs["Base Color"].default_value = EMBER
        b.inputs["Emission Color"].default_value = EMBER
        b.inputs["Emission Strength"].default_value = 1.6
        b.inputs["Roughness"].default_value = 0.3
    return mat


def finish(ob, mat, bevel=0.0, smooth=True, subsurf=0):
    if bevel:
        m = ob.modifiers.new("bevel", "BEVEL")
        m.width = bevel
        m.segments = 6
        m.limit_method = "ANGLE"
    if subsurf:
        m = ob.modifiers.new("sub", "SUBSURF")
        m.levels = subsurf
        m.render_levels = subsurf
    if smooth:
        for p in ob.data.polygons:
            p.use_smooth = True
    ob.data.materials.append(mat)
    return ob


def cube(loc, scale, mat, bevel=0.08):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    ob = bpy.context.active_object
    ob.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    return finish(ob, mat, bevel=bevel)


def sphere(loc, r, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=64, ring_count=32)
    return finish(bpy.context.active_object, mat)


def torus(loc, major, minor, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=major, minor_radius=minor,
                                     major_segments=96, minor_segments=32, rotation=rot)
    return finish(bpy.context.active_object, mat)


def cylinder(loc, r, depth, mat, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(location=loc, radius=r, depth=depth, vertices=64, rotation=rot)
    ob = bpy.context.active_object
    return finish(ob, mat, bevel=bevel, smooth=True)


# --- the six icons -----------------------------------------------------------


def ai_products(m):
    cube((0, 0, -0.35), (1.25, 1.25, 0.32), m["graphite"], bevel=0.28)
    sphere((0, 0, 0.55), 0.78, m["glass"])
    sphere((0, 0, 0.55), 0.3, m["ember"])


def limits(m):
    cube((0, 0, -0.95), (1.5, 0.75, 0.16), m["graphite"], bevel=0.12)
    torus((0, 0, 0.2), 1.0, 0.16, m["glass"], rot=(math.radians(90), 0, 0))
    sphere((0.0, -0.05, 0.2), 0.36, m["ember"])
    cube((-1.0, 0, -0.55), (0.12, 0.16, 0.34), m["graphite"], bevel=0.05)
    cube((1.0, 0, -0.55), (0.12, 0.16, 0.34), m["graphite"], bevel=0.05)


def evaluation(m):
    cube((0, 0.1, -1.0), (1.6, 0.85, 0.12), m["graphite"], bevel=0.1)
    heights = [0.55, 0.9, 1.3, 1.85]
    for i, h in enumerate(heights):
        x = -1.05 + i * 0.7
        mat = m["ember"] if i == 3 else m["graphite"]
        cube((x, 0.1, -0.88 + h / 2), (0.24, 0.24, h / 2), mat, bevel=0.07)


def research(m):
    # an equilateral glass prism, with a beam that enters and leaves bent
    import bmesh

    bm = bmesh.new()
    r, depth = 1.05, 0.9
    pts = [(r * math.cos(a), 0, r * math.sin(a)) for a in (math.radians(90), math.radians(210), math.radians(330))]
    front = [bm.verts.new((x, -depth / 2, z)) for x, _, z in pts]
    back = [bm.verts.new((x, depth / 2, z)) for x, _, z in pts]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((front[i], front[j], back[j], back[i]))
    me = bpy.data.meshes.new("prism")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("prism", me)
    bpy.context.collection.objects.link(ob)
    ob.location = (0.15, 0, 0.05)
    finish(ob, m["glass"], bevel=0.05, smooth=False)
    cylinder((-1.08, 0, -0.1), 0.045, 1.05, m["ember"], rot=(0, math.radians(80), 0))
    cylinder((1.3, 0, -0.45), 0.06, 1.0, m["ember"], rot=(0, math.radians(68), 0))


def full_stack(m):
    cube((0, 0, -0.75), (1.2, 1.2, 0.17), m["graphite"], bevel=0.14)
    cube((0.1, 0.1, -0.25), (1.05, 1.05, 0.15), m["graphite"], bevel=0.13)
    cube((0.2, 0.2, 0.2), (0.92, 0.92, 0.04), m["ember"], bevel=0.04)
    cube((0.2, 0.2, 0.38), (0.92, 0.92, 0.13), m["frost"], bevel=0.12)


def workflows(m):
    # an upright graphite ring linked through a glass ring lying flat
    torus((-0.42, 0, 0.25), 0.78, 0.17, m["graphite"], rot=(math.radians(90), 0, math.radians(-18)))
    torus((0.5, 0.05, 0.05), 0.78, 0.17, m["glass"], rot=(math.radians(12), 0, 0))
    sphere((-0.42 - 0.78 * math.sin(math.radians(40)), -0.1, 0.25 + 0.78 * math.cos(math.radians(40))), 0.19, m["ember"])


ICONS = {
    "ai-products": ai_products,
    "limits": limits,
    "evaluation": evaluation,
    "research": research,
    "full-stack": full_stack,
    "workflows": workflows,
}

for name, build in ICONS.items():
    sc = reset()
    mats = {k: material(k, k) for k in ("graphite", "glass", "frost", "ember")}
    build(mats)
    sc.render.filepath = os.path.join(OUT, f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("RENDERED", name)
