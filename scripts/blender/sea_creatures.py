"""
Builds the voyage intro's sea creatures in Blender and renders them from
directly above, for scripts/bake-creatures.py to pack into textures.

Run headless (from the repo root):
  blender -b --factory-startup --python scripts/blender/sea_creatures.py -- <out_dir> <textures_dir>

Each animal is a real 3D model in the swim engine's body units divided by
100 (snout at x = +1.0; one body length is 2.1): a lofted body with an
anatomical width and depth profile, and fins built as cambered foils that
attach low on the flank, sweep back and droop, so from above they read as
flippers seen in perspective rather than flat cut-outs. Everything gets a
Subdivision Surface, smooth shading and a skin material: countershading,
mottling and scars, plus fine creases from a Poly Haven CC0 leather normal
map (leather_red_02 / leather_white, by Rob Tuytel).

Two orthographic renders per animal, with transparent film:
  <kind>-lit.png     skin under soft, even, overhead sky light (colour x AO)
  <kind>-normal.png  world normals, raw, for the engine's sun and sheen
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "creature_renders")
TEX = os.path.abspath(argv[1] if len(argv) > 1 else "textures")
os.makedirs(OUT, exist_ok=True)

# texture extents in body units, as the engine maps them (x tail -> snout)
EXTENTS = {
    "whale": (-124.0, 104.0, -62.0, 62.0, 1536),
    "shark": (-114.0, 104.0, -47.0, 47.0, 896),
    "fish": (-114.0, 104.0, -38.0, 38.0, 320),
}


def srgb(c):
    """sRGB 0..1 to linear, for colours picked by eye."""
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c) + (1.0,)


def smooth01(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


# ---------------------------------------------------------------------------
# geometry


def loft(name, rings, cap_start=True, cap_end=True):
    """Joins rings of equal length into a closed, smooth mesh object."""
    bm = bmesh.new()
    verts = [[bm.verts.new(p) for p in ring] for ring in rings]
    m = len(rings[0])
    for a, b in zip(verts, verts[1:]):
        for i in range(m):
            j = (i + 1) % m
            bm.faces.new((a[i], a[j], b[j], b[i]))
    for ring, cap in ((verts[0], cap_start), (verts[-1], cap_end)):
        if cap:
            c = sum((v.co for v in ring), Vector()) / m
            cv = bm.verts.new(c)
            for i in range(m):
                bm.faces.new((ring[i], ring[(i + 1) % m], cv))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    sub = ob.modifiers.new("subsurf", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 3
    return ob


def body(name, length, x_snout, half_w, h_top, h_bot, z_centre, n=72, m=36, p=2.2):
    """A body swept snout to tail; profile functions take t in 0..1."""
    rings = []
    for k in range(n):
        t = (k / (n - 1)) ** 1.15  # more rings near the snout
        x = x_snout - t * length
        w, ht, hb, zc = half_w(t), h_top(t), h_bot(t), z_centre(t)
        ring = []
        for i in range(m):
            a = 2 * math.pi * i / m
            c, s = math.cos(a), math.sin(a)
            y = w * math.copysign(abs(c) ** (2 / p), c)
            h = ht if s > 0 else hb
            z = zc + h * math.copysign(abs(s) ** (2 / p), s)
            ring.append((x, y, z))
        rings.append(ring)
    return loft(name, rings)


def foil(name, root, span_dir, chord_dir, length, chord, thick, sections=26, m=20, lead_bumps=0.0, camber=0.06):
    """
    A fin: airfoil sections along a span. chord(s) and thick(s) take s in 0..1;
    the leading edge faces +chord_dir. Thickness is along span x chord.
    """
    span_dir = Vector(span_dir).normalized()
    chord_dir = (Vector(chord_dir) - Vector(chord_dir).project(span_dir)).normalized()
    up = span_dir.cross(chord_dir).normalized()
    rings = []
    for k in range(sections):
        s = k / (sections - 1)
        c = chord(s)
        if lead_bumps:
            c += lead_bumps * max(0.0, math.sin(s * math.pi * 9)) ** 2 * (1 - s)
        th = thick(s) * c
        # the fin curves back gently toward the tip
        centre = Vector(root) + span_dir * (s * length) - chord_dir * (0.18 * length * s * s)
        ring = []
        for i in range(m):
            a = 2 * math.pi * i / m
            u = math.cos(a)  # +1 leading edge, -1 trailing edge
            v = math.sin(a)
            # rounded leading edge, sharper trailing edge
            along = (0.35 if u > 0 else 0.65) * c * u
            half = th * (1 - u * u) ** 0.5 * (1.0 if u > 0 else (1 + u * 0.6))
            bend = camber * c * (1 - u * u)
            pt = centre + chord_dir * along + up * (v * half + bend)
            ring.append(tuple(pt))
        rings.append(ring)
    return loft(name, rings, cap_start=False)


def blob(name, loc, radius):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc, segments=16, ring_count=8)
    ob = bpy.context.active_object
    ob.name = name
    for poly in ob.data.polygons:
        poly.use_smooth = True
    return ob


# ---------------------------------------------------------------------------
# materials


def node(nt, kind, **props):
    n = nt.nodes.new(kind)
    for k, v in props.items():
        setattr(n, k, v)
    return n


def inp(n, ident):
    for s in n.inputs:
        if s.identifier == ident or s.name == ident:
            return s
    raise KeyError(ident)


def mix_rgb(nt, fac, a, b):
    m = node(nt, "ShaderNodeMix", data_type="RGBA", blend_type="MIX")
    nt.links.new(fac, inp(m, "Factor_Float"))
    for sock, val in (("A_Color", a), ("B_Color", b)):
        if isinstance(val, tuple):
            inp(m, sock).default_value = val
        else:
            nt.links.new(val, inp(m, sock))
    return m.outputs["Result_Color"] if "Result_Color" in m.outputs else m.outputs[2]


def skin(name, dorsal, flank, belly, spots, spot_amount, leather, leather_scale, crease, scars=0.0, bars=0.0, rough=0.38):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    outp = node(nt, "ShaderNodeOutputMaterial")
    bsdf = node(nt, "ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs[0], outp.inputs["Surface"])
    coord = node(nt, "ShaderNodeTexCoord")
    geo = node(nt, "ShaderNodeNewGeometry")
    # countershading: dark where the surface faces the sky, pale beneath
    sep = node(nt, "ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Normal"], sep.inputs[0])
    up = node(nt, "ShaderNodeMapRange")
    nt.links.new(sep.outputs["Z"], up.inputs["Value"])
    up.inputs["From Min"].default_value = -0.35
    up.inputs["From Max"].default_value = 0.75
    col = mix_rgb(nt, up.outputs[0], belly, flank)
    hi = node(nt, "ShaderNodeMapRange")
    nt.links.new(sep.outputs["Z"], hi.inputs["Value"])
    hi.inputs["From Min"].default_value = 0.45
    hi.inputs["From Max"].default_value = 0.95
    col = mix_rgb(nt, hi.outputs[0], col, dorsal)
    # mottling: soft pale spots of several sizes
    nz = node(nt, "ShaderNodeTexNoise")
    nt.links.new(coord.outputs["Object"], nz.inputs["Vector"])
    nz.inputs["Scale"].default_value = 26.0
    nz.inputs["Detail"].default_value = 6.0
    nz.inputs["Roughness"].default_value = 0.62
    ramp = node(nt, "ShaderNodeValToRGB")
    nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
    ramp.color_ramp.elements[0].position = 0.58
    ramp.color_ramp.elements[1].position = 0.72
    sm = node(nt, "ShaderNodeMath", operation="MULTIPLY")
    nt.links.new(ramp.outputs["Color"], sm.inputs[0])
    sm.inputs[1].default_value = spot_amount
    col = mix_rgb(nt, sm.outputs[0], col, spots)
    if scars:
        vo = node(nt, "ShaderNodeTexVoronoi", feature="DISTANCE_TO_EDGE")
        nt.links.new(coord.outputs["Object"], vo.inputs["Vector"])
        vo.inputs["Scale"].default_value = 9.0
        sr = node(nt, "ShaderNodeMapRange")
        nt.links.new(vo.outputs["Distance"], sr.inputs["Value"])
        sr.inputs["From Min"].default_value = 0.012
        sr.inputs["From Max"].default_value = 0.0
        sn = node(nt, "ShaderNodeTexNoise")
        nt.links.new(coord.outputs["Object"], sn.inputs["Vector"])
        sn.inputs["Scale"].default_value = 4.0
        gate = node(nt, "ShaderNodeMapRange")
        nt.links.new(sn.outputs["Fac"], gate.inputs["Value"])
        gate.inputs["From Min"].default_value = 0.55
        gate.inputs["From Max"].default_value = 0.7
        both = node(nt, "ShaderNodeMath", operation="MULTIPLY")
        nt.links.new(sr.outputs[0], both.inputs[0])
        nt.links.new(gate.outputs[0], both.inputs[1])
        amt = node(nt, "ShaderNodeMath", operation="MULTIPLY")
        nt.links.new(both.outputs[0], amt.inputs[0])
        amt.inputs[1].default_value = scars
        col = mix_rgb(nt, amt.outputs[0], col, spots)
    if bars:
        wave = node(nt, "ShaderNodeTexWave", wave_type="BANDS", bands_direction="X")
        nt.links.new(coord.outputs["Object"], wave.inputs["Vector"])
        wave.inputs["Scale"].default_value = 7.0
        wave.inputs["Distortion"].default_value = 9.0
        wave.inputs["Detail"].default_value = 2.0
        br = node(nt, "ShaderNodeMapRange")
        nt.links.new(wave.outputs["Fac"], br.inputs["Value"])
        br.inputs["From Min"].default_value = 0.55
        br.inputs["From Max"].default_value = 0.75
        gate = node(nt, "ShaderNodeMath", operation="MULTIPLY")
        nt.links.new(br.outputs[0], gate.inputs[0])
        nt.links.new(hi.outputs[0], gate.inputs[1])
        amt = node(nt, "ShaderNodeMath", operation="MULTIPLY")
        nt.links.new(gate.outputs[0], amt.inputs[0])
        amt.inputs[1].default_value = bars
        col = mix_rgb(nt, amt.outputs[0], col, (0.004, 0.012, 0.02, 1.0))
    nt.links.new(col, inp(bsdf, "Base Color"))
    inp(bsdf, "Roughness").default_value = rough
    inp(bsdf, "Specular IOR Level").default_value = 0.3
    # fine creases from the Poly Haven leather normal map
    img = bpy.data.images.load(os.path.join(TEX, leather), check_existing=True)
    img.colorspace_settings.name = "Non-Color"
    mp = node(nt, "ShaderNodeMapping")
    nt.links.new(coord.outputs["Object"], mp.inputs["Vector"])
    mp.inputs["Scale"].default_value = (leather_scale, leather_scale, leather_scale)
    tx = node(nt, "ShaderNodeTexImage", interpolation="Cubic", projection="BOX")
    tx.projection_blend = 0.3
    tx.image = img
    nt.links.new(mp.outputs["Vector"], tx.inputs["Vector"])
    nm = node(nt, "ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = crease
    nt.links.new(tx.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], inp(bsdf, "Normal"))
    return mat


def assign(objs, mat):
    for ob in objs:
        ob.data.materials.clear()
        ob.data.materials.append(mat)


# ---------------------------------------------------------------------------
# the animals (units: body units / 100)


def build_whale():
    L = 1.82  # snout to the base of the flukes

    # from above a rorqual's head is a broad, flat U: already two-thirds of the
    # body's width a short way back from the tip
    def front(t):
        return 0.66 + 0.34 * math.sin(min(t / 0.3, 1) * math.pi / 2) ** 0.8

    def cap(t):
        return math.sin(min(t / 0.055, 1) * math.pi / 2) ** 0.55 if t > 0 else 0.0

    def taper(t):
        return 1 - max(0.0, (t - 0.3) / 0.7) ** 1.6 * 0.88

    hw = lambda t: max(0.004, 0.21 * front(t) * cap(t) * taper(t))
    # the head is flatter than the back
    ht = lambda t: max(0.004, 0.15 * (0.55 + 0.45 * smooth01(t / 0.3)) * front(t) * cap(t) * (1 - max(0.0, (t - 0.4) / 0.6) ** 1.5 * 0.8))
    # a deep chest and pleated throat below
    hb = lambda t: max(0.004, 0.19 * front(t) * cap(t) * (1 - max(0.0, (t - 0.35) / 0.65) ** 1.3 * 0.85))
    zc = lambda t: -0.02 * (1 - t)
    # the tail stock runs on into the flukes so they grow out of it
    parts = [body("whale_body", L + 0.1, 1.0, lambda t: hw(min(t * (L + 0.1) / L, 1.0)), lambda t: ht(min(t * (L + 0.1) / L, 1.0)), lambda t: hb(min(t * (L + 0.1) / L, 1.0)) * (0.6 if t * (L + 0.1) / L > 1 else 1), zc)]
    # long flippers: low on the flank, swept back, drooping, knobbed leading edge
    t0 = 0.27
    for side in (-1, 1):
        root = (1.0 - t0 * L, side * hw(t0) * 0.78, zc(t0) - hb(t0) * 0.42)
        sweep, droop = math.radians(50), math.radians(36)
        span = (-math.sin(sweep), side * math.cos(sweep) * math.cos(droop), -math.sin(droop))
        parts.append(
            foil(
                f"whale_flipper_{side}",
                root,
                span,
                (1, 0, 0),
                0.46,
                chord=lambda s: 0.13 * (1 - 0.72 * s**1.2) * (1 - smooth01((s - 0.9) / 0.1) * 0.9),
                thick=lambda s: 0.2 * (1 - 0.4 * s),
                lead_bumps=0.012,
            )
        )
    # flukes: a horizontal crescent with a median notch
    fx = 1.0 - L
    rings = []
    m = 18
    for k in range(41):
        v = -1 + 2 * k / 40
        av = abs(v)
        lead = -0.03 + 0.15 * av**1.8
        chord = max(0.012, 0.18 * max(0.0, 1 - av**2.2) ** 0.6 * (1 - 0.5 * math.exp(-((v * 0.38 / 0.03) ** 2))))
        x_le = fx - lead
        th = 0.11 * chord
        ring = []
        for i in range(m):
            a = 2 * math.pi * i / m
            u = math.cos(a)
            along = (0.35 if u > 0 else 0.65) * chord * u
            half = th * (1 - u * u) ** 0.5
            ring.append((x_le - 0.35 * chord + along, v * 0.38, -0.01 + math.sin(a) * half))
        rings.append(ring)
    parts.append(loft("whale_flukes", rings))
    # small hooked dorsal fin two-thirds back
    tdf = 0.66
    parts.append(
        foil(
            "whale_dorsal",
            (1.0 - tdf * L, 0, zc(tdf) + ht(tdf) * 0.85),
            (-0.5, 0, 0.6),
            (1, 0, 0),
            0.07,
            chord=lambda s: 0.12 * (1 - 0.75 * s),
            thick=lambda s: 0.25,
            camber=0.0,
        )
    )
    # knobs on the head and a splash guard round the blowholes
    knobs = []
    import random

    rnd = random.Random(4)
    for _ in range(9):
        t = 0.02 + rnd.random() * 0.15
        y = (rnd.random() * 2 - 1) * hw(t) * 0.5
        knobs.append(blob("knob", (1.0 - t * L, y, zc(t) + ht(t) * 0.98), 0.004 + rnd.random() * 0.003))
    tb = 0.16
    for side in (-1, 1):
        knobs.append(blob("blowhole_guard", (1.0 - tb * L, side * 0.012, zc(tb) + ht(tb) * 0.98), 0.012))
    mat = skin(
        "whale_skin",
        dorsal=srgb((0.13, 0.2, 0.29)),
        flank=srgb((0.17, 0.24, 0.33)),
        belly=srgb((0.42, 0.47, 0.52)),
        spots=srgb((0.4, 0.47, 0.53)),
        spot_amount=0.55,
        leather="leather_red_02_nor_gl_1k.jpg",
        leather_scale=2.2,
        crease=0.35,
    )
    fin_mat = skin(
        "whale_fin",
        dorsal=srgb((0.16, 0.22, 0.3)),
        flank=srgb((0.5, 0.56, 0.6)),
        belly=srgb((0.86, 0.88, 0.88)),
        spots=srgb((0.78, 0.82, 0.84)),
        spot_amount=0.8,
        leather="leather_red_02_nor_gl_1k.jpg",
        leather_scale=3.0,
        crease=0.25,
    )
    dark = skin(
        "whale_dorsal_fin",
        dorsal=srgb((0.13, 0.2, 0.29)),
        flank=srgb((0.13, 0.2, 0.29)),
        belly=srgb((0.15, 0.22, 0.31)),
        spots=srgb((0.3, 0.37, 0.44)),
        spot_amount=0.3,
        leather="leather_red_02_nor_gl_1k.jpg",
        leather_scale=3.0,
        crease=0.2,
    )
    assign([parts[0], parts[3]] + knobs, mat)
    assign([parts[4]], dark)
    assign(parts[1:3], fin_mat)


def build_shark():
    L = 1.7  # snout to the root of the tail fin

    def front(t):
        return math.sin(min(t / 0.33, 1) * math.pi / 2) ** 0.85

    def taper(t):
        return 1 - max(0.0, (t - 0.33) / 0.67) ** 1.35 * 0.88

    hw = lambda t: max(0.003, 0.125 * front(t) * taper(t))
    ht = lambda t: max(0.003, 0.11 * front(t) * (1 - max(0.0, (t - 0.4) / 0.6) ** 1.3 * 0.78))
    hb = lambda t: max(0.003, 0.11 * front(t) * (1 - max(0.0, (t - 0.38) / 0.62) ** 1.2 * 0.8))
    zc = lambda t: 0.0
    parts = [body("shark_body", L, 1.0, hw, ht, hb, zc, p=2.0)]
    # long sickle pectorals
    t0 = 0.27
    for side in (-1, 1):
        root = (1.0 - t0 * L, side * hw(t0) * 0.8, -hb(t0) * 0.45)
        sweep, droop = math.radians(55), math.radians(18)
        span = (-math.sin(sweep), side * math.cos(sweep) * math.cos(droop), -math.sin(droop))
        parts.append(
            foil(f"shark_pec_{side}", root, span, (1, 0, 0), 0.38,
                 chord=lambda s: 0.15 * (1 - 0.9 * s**0.9) + 0.008, thick=lambda s: 0.14)
        )
        # small pelvic fins
        tp = 0.62
        root = (1.0 - tp * L, side * hw(tp) * 0.6, -hb(tp) * 0.6)
        span = (-0.7, side * 0.6, -0.35)
        parts.append(foil(f"shark_pelvic_{side}", root, span, (1, 0, 0), 0.08,
                          chord=lambda s: 0.06 * (1 - 0.8 * s) + 0.005, thick=lambda s: 0.15))
    # tall first dorsal fin, raked back; a small second dorsal
    parts.append(foil("shark_dorsal", (1.0 - 0.38 * L, 0, ht(0.38) * 0.9), (-0.55, 0, 1), (1, 0, 0), 0.2,
                      chord=lambda s: 0.17 * (1 - 0.92 * s) + 0.006, thick=lambda s: 0.12, camber=0.0))
    parts.append(foil("shark_dorsal2", (1.0 - 0.74 * L, 0, ht(0.74) * 0.9), (-0.6, 0, 1), (1, 0, 0), 0.05,
                      chord=lambda s: 0.05 * (1 - 0.8 * s) + 0.004, thick=lambda s: 0.14, camber=0.0))
    # heterocercal tail: a long upper lobe and a short lower one, both vertical
    tx = 1.0 - L
    parts.append(foil("shark_tail_upper", (tx + 0.02, 0, 0.005), (-0.62, 0, 0.8), (0.6, 0, 1), 0.32,
                      chord=lambda s: 0.1 * (1 - 0.85 * s) + 0.006, thick=lambda s: 0.12, camber=0.0))
    parts.append(foil("shark_tail_lower", (tx + 0.02, 0, -0.005), (-1, 0, -0.75), (0.4, 0, -1), 0.18,
                      chord=lambda s: 0.08 * (1 - 0.8 * s) + 0.005, thick=lambda s: 0.12, camber=0.0))
    mat = skin(
        "shark_skin",
        dorsal=srgb((0.09, 0.19, 0.4)),
        flank=srgb((0.16, 0.32, 0.56)),
        belly=srgb((0.5, 0.58, 0.7)),
        spots=srgb((0.16, 0.28, 0.5)),
        spot_amount=0.15,
        leather="leather_white_nor_gl_1k.jpg",
        leather_scale=5.0,
        crease=0.12,
        rough=0.32,
    )
    dark = skin(
        "shark_fin",
        dorsal=srgb((0.09, 0.19, 0.4)),
        flank=srgb((0.1, 0.2, 0.42)),
        belly=srgb((0.12, 0.23, 0.45)),
        spots=srgb((0.16, 0.28, 0.5)),
        spot_amount=0.0,
        leather="leather_white_nor_gl_1k.jpg",
        leather_scale=5.0,
        crease=0.1,
    )
    assign(parts, mat)
    # fins standing up from the back would otherwise show their pale sides
    assign([p for p in parts if "dorsal" in p.name or "tail" in p.name], dark)


def build_fish():
    L = 1.76

    def front(t):
        return math.sin(min(t / 0.3, 1) * math.pi / 2) ** 0.75

    def taper(t):
        return 1 - max(0.0, (t - 0.3) / 0.7) ** 1.25 * 0.88

    hw = lambda t: max(0.003, 0.15 * front(t) * taper(t))
    ht = lambda t: max(0.003, 0.17 * front(t) * taper(t))
    hb = lambda t: max(0.003, 0.17 * front(t) * taper(t))
    parts = [body("fish_body", L, 1.0, hw, ht, hb, lambda t: 0.0, n=48, m=28, p=2.0)]
    for side in (-1, 1):
        root = (1.0 - 0.3 * L, side * hw(0.3) * 0.8, -0.03)
        parts.append(foil(f"fish_pec_{side}", root, (-0.75, side * 0.6, -0.2), (1, 0, 0), 0.18,
                          chord=lambda s: 0.08 * (1 - 0.7 * s) + 0.006, thick=lambda s: 0.1))
    # forked tail, banked a little so it reads from above, as fish roll as they swim
    tx = 1.0 - L
    roll = math.radians(28)
    for sgn in (1, -1):
        d = Vector((-0.8, 0, sgn * 0.75))
        d.rotate(__import__("mathutils").Euler((roll, 0, 0)))
        c = Vector((0.3, 0, sgn * 1))
        c.rotate(__import__("mathutils").Euler((roll, 0, 0)))
        parts.append(foil(f"fish_tail_{sgn}", (tx + 0.04, 0, 0), d, c, 0.32,
                          chord=lambda s: 0.12 * (1 - 0.8 * s) + 0.006, thick=lambda s: 0.08, camber=0.0))
    mat = skin(
        "fish_skin",
        dorsal=srgb((0.07, 0.22, 0.28)),
        flank=srgb((0.62, 0.7, 0.74)),
        belly=srgb((0.9, 0.92, 0.92)),
        spots=srgb((0.75, 0.8, 0.82)),
        spot_amount=0.1,
        leather="leather_white_nor_gl_1k.jpg",
        leather_scale=8.0,
        crease=0.08,
        bars=0.85,
        rough=0.25,
    )
    assign(parts, mat)


# ---------------------------------------------------------------------------
# rendering


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
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.color_depth = "16"
    sc.render.dither_intensity = 0.0
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    # a soft, even sky: the engine adds the sun, so bake only colour and occlusion
    world = bpy.data.worlds.new("sky")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (1, 1, 1, 1)
    bg.inputs["Strength"].default_value = 1.0
    sc.world = world
    return sc


def camera(sc, kind):
    x0, x1, y0, y1, w = EXTENTS[kind]
    h = round(w * (y1 - y0) / (x1 - x0) / 8) * 8
    cam_data = bpy.data.cameras.new("cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = (x1 - x0) / 100
    cam = bpy.data.objects.new("cam", cam_data)
    cam.location = ((x0 + x1) / 200, 0, 5)
    sc.collection.objects.link(cam)
    sc.camera = cam
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    return w, h


def normal_override():
    mat = bpy.data.materials.new("normals")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    outp = node(nt, "ShaderNodeOutputMaterial")
    geo = node(nt, "ShaderNodeNewGeometry")
    sc = node(nt, "ShaderNodeVectorMath", operation="MULTIPLY_ADD")
    nt.links.new(geo.outputs["Normal"], sc.inputs[0])
    sc.inputs[1].default_value = (0.5, 0.5, 0.5)
    sc.inputs[2].default_value = (0.5, 0.5, 0.5)
    em = node(nt, "ShaderNodeEmission")
    nt.links.new(sc.outputs[0], em.inputs["Color"])
    nt.links.new(em.outputs[0], outp.inputs["Surface"])
    return mat


BUILD = {"whale": build_whale, "shark": build_shark, "fish": build_fish}

for kind, build in BUILD.items():
    sc = reset()
    build()
    w, h = camera(sc, kind)
    sc.cycles.samples = 96
    sc.cycles.use_denoising = True
    sc.render.filepath = os.path.join(OUT, f"{kind}-lit.png")
    bpy.ops.render.render(write_still=True)
    # raw world normals: no lighting, no tone mapping
    sc.view_settings.view_transform = "Raw"
    sc.cycles.samples = 24
    sc.cycles.use_denoising = False
    sc.view_layers[0].material_override = normal_override()
    sc.render.filepath = os.path.join(OUT, f"{kind}-normal.png")
    bpy.ops.render.render(write_still=True)
    print("RENDERED", kind, w, h)
