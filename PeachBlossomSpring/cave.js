// ─── Config ───
let RING_COUNT   = 60;
let RING_SPACING = 110;
let PERSPECTIVE  = 700;
let SCROLL_FACTOR = 2.0;
let TOTAL_DEPTH  = RING_COUNT * RING_SPACING;
let BASE_W       = 400;
let BASE_H       = 288;

// ─── Helpers ───
function lerp(a, b, t) { return a + (b - a) * t; }
function easeIn(t) { return t * t; }
function easeOut(t) { return 1 - (1 - t) * (1 - t); }
function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - (2-2*t)*(2-2*t)/2; }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

// ─── Tunnel shape ───
function tunnelHalfWidth(t) {
    if (t < 0.08) return lerp(220, 180, t / 0.08);
    if (t < 0.45) return lerp(180, 55, easeIn((t - 0.08) / 0.37));
    if (t < 0.55) return lerp(55, 50, (t - 0.45) / 0.10);
    if (t < 0.72) return lerp(50, 160, easeIn((t - 0.55) / 0.17));
    return lerp(160, 800, easeOut((t - 0.72) / 0.28));
}
function tunnelHalfHeight(t) { return tunnelHalfWidth(t) * 0.72; }

function sceneBrightness(t) {
    if (t < 0.08) return lerp(0.3, 0.25, t / 0.08);
    if (t < 0.55) return lerp(0.25, 0.15, (t - 0.08) / 0.47);
    if (t < 0.72) return lerp(0.15, 0.4, (t - 0.55) / 0.17);
    return lerp(0.4, 1.0, easeOut((t - 0.72) / 0.28));
}

// ─── Build ring data (all visual properties computed once) ───
let rings = [];
for (let i = 0; i < RING_COUNT; i++) {
    let t = i / (RING_COUNT - 1);
    let hw = tunnelHalfWidth(t);
    let hh = tunnelHalfHeight(t);

    // Jaggedness
    let jag = t < 0.72
        ? 0.28 + (1 - t / 0.72) * 0.08
        : lerp(0.28, 0.08, easeOut((t - 0.72) / 0.28));

    // Organic border-radius (set once, never changes)
    let variation = 15 + jag * 40;
    let rv = [];
    for (let r = 0; r < 8; r++) {
        rv.push((50 - variation / 2 + Math.random() * variation).toFixed(1));
    }
    let borderRadius = rv[0]+"% "+rv[1]+"% "+rv[2]+"% "+rv[3]+"% / "
                     + rv[4]+"% "+rv[5]+"% "+rv[6]+"% "+rv[7]+"%";

    // Border color (set once, never changes)
    let warmth = t > 0.6 ? easeOut((t - 0.6) / 0.4) : 0;
    let cr = Math.round(lerp(130, 190, warmth));
    let cg = Math.round(lerp(120, 175, warmth));
    let cb = Math.round(lerp(100, 145, warmth));
    let color = "rgb(" + cr + "," + cg + "," + cb + ")";

    // Border width (set once, never changes)
    let bw = Math.max(0.3, lerp(1.6, 0.5, t));

    rings.push({
        z: -i * RING_SPACING,
        hw: hw,
        hh: hh,
        t: t,
        borderRadius: borderRadius,
        color: color,
        borderW: bw
    });
}

// ─── Create ring DOM elements ───
// All layout/paint properties are set here ONCE and never touched again.
// The animation loop will ONLY change transform and opacity.
let ringDivs = [];
let vigEl = document.getElementById("vignette");

for (let i = 0; i < RING_COUNT; i++) {
    let div = document.createElement("div");
    div.className = "cave-ring";
    div.style.borderRadius = rings[i].borderRadius;
    div.style.borderColor = rings[i].color;
    div.style.borderWidth = rings[i].borderW + "px";
    document.body.insertBefore(div, vigEl);
    ringDivs.push(div);
}

// ─── Cache DOM ───
let bgWarmEl  = document.getElementById("bg-warm");
let glowEl    = document.getElementById("glow-inner");
let hintEl    = document.getElementById("hint");
let introEl      = document.getElementById("intro-text");
let introOverlay = document.getElementById("intro-overlay");
let titleEl      = document.getElementById("cave-title");
let narEls    = [
    document.getElementById("narrative-0"),
    document.getElementById("narrative-1"),
    document.getElementById("narrative-2"),
    document.getElementById("narrative-3")
];
let echoEls   = [
    document.getElementById("echo-0"),
    document.getElementById("echo-1"),
    document.getElementById("echo-2"),
    document.getElementById("echo-3")
];

// ─── Scroll (normal: scroll DOWN = travel forward) ───
let targetZ  = 0;
let currentZ = 0;
let maxScroll = 0;
let INTRO_FRACTION = 0.08; // first 8% of scroll = intro phase

function updateMaxScroll() {
    maxScroll = document.body.scrollHeight - window.innerHeight;
}
updateMaxScroll();
window.addEventListener("resize", updateMaxScroll);

// Start at top of page
window.scrollTo(0, 0);

window.addEventListener("scroll", function () {
    // Overall scroll progress (0 at top, 1 at bottom)
    let scrollProgress = window.scrollY / maxScroll;

    // Intro phase: first INTRO_FRACTION of scroll
    let introProgress = clamp(scrollProgress / INTRO_FRACTION, 0, 1);

    // Intro text moves up and fades out
    let introY = -introProgress * 120;
    let introAlpha = 1 - easeIn(introProgress);
    introEl.style.transform = "translate(-50%, " + (introY - 50) + "%)";
    introEl.style.opacity = introAlpha;

    // Overlay fades out, revealing the cave beneath
    introOverlay.style.opacity = 1 - easeOut(introProgress);

    // Cave title fades in as intro exits
    if (introProgress > 0.5) {
        titleEl.style.opacity = easeOut((introProgress - 0.5) / 0.5);
    } else {
        titleEl.style.opacity = "0";
    }

    // Tunnel only starts after intro is done
    if (scrollProgress > INTRO_FRACTION) {
        let tunnelProgress = (scrollProgress - INTRO_FRACTION) / (1 - INTRO_FRACTION);
        targetZ = clamp(tunnelProgress * TOTAL_DEPTH, 0, TOTAL_DEPTH);
    } else {
        targetZ = 0;
    }

    // Hide hint once user starts scrolling
    hintEl.style.opacity = window.scrollY > 60 ? "0" : "0.5";
});

// ─── Narrative beats ───
let beats = [
    { start: 0.00, peak: 0.03, end: 0.08, idx: 0 },
    { start: 0.25, peak: 0.38, end: 0.50, idx: 1 },
    { start: 0.55, peak: 0.62, end: 0.70, idx: 2 },
    { start: 0.76, peak: 0.84, end: 0.95, idx: 3 }
];

function updateNarrative(progress) {
    let echoDelay = 0.03; // echo appears slightly after bird text

    for (let b = 0; b < beats.length; b++) {
        let beat = beats[b];
        let el = narEls[beat.idx];
        let echoEl = echoEls[beat.idx];

        // Bird's voice (primary)
        let alpha = 0;
        if (progress >= beat.start && progress <= beat.peak) {
            alpha = easeInOut((progress - beat.start) / (beat.peak - beat.start));
        } else if (progress > beat.peak && progress <= beat.end) {
            alpha = 1 - easeInOut((progress - beat.peak) / (beat.end - beat.peak));
        }
        if (beat.idx === 3 && progress > beat.peak) {
            alpha = 1;
        }
        el.style.opacity = alpha;

        // Human echo (delayed, slightly softer)
        let echoStart = beat.start + echoDelay;
        let echoAlpha = 0;
        if (progress >= echoStart && progress <= beat.peak) {
            echoAlpha = easeInOut((progress - echoStart) / (beat.peak - echoStart));
        } else if (progress > beat.peak && progress <= beat.end) {
            echoAlpha = 1 - easeInOut((progress - beat.peak) / (beat.end - beat.peak));
        }
        if (beat.idx === 3 && progress > beat.peak) {
            echoAlpha = 1;
        }
        echoEl.style.opacity = echoAlpha;

        // Scale up final beat
        if (beat.idx === 3 && progress > beat.start) {
            let sp = clamp((progress - beat.start) / (1 - beat.start), 0, 1);
            let scl = 1 + easeOut(sp) * 0.8;
            el.style.transform = "translate(-50%,-50%) scale(" + scl.toFixed(3) + ")";
            echoEl.style.transform = "translate(-50%,-50%) scale(" + scl.toFixed(3) + ")";
        }
    }
}

// ═══════════════════════════════════════════════════
//  ANIMATION LOOP
//  Rule: ONLY touch .style.opacity and .style.transform
//  Everything else was set once during init above.
// ═══════════════════════════════════════════════════
function animate() {
    requestAnimationFrame(animate);

    // Smooth lerp with snap
    let diff = targetZ - currentZ;
    if (diff > -0.5 && diff < 0.5) {
        currentZ = targetZ;
    } else {
        currentZ += diff * 0.055;
    }

    let w = window.innerWidth;
    let h = window.innerHeight;
    let halfW = w * 0.5;
    let halfH = h * 0.5;
    let progress = clamp(currentZ / TOTAL_DEPTH, 0, 1);

    // ─── Background warm overlay: opacity only ───
    bgWarmEl.style.opacity = sceneBrightness(progress);

    // ─── Glow: opacity + transform only ───
    let glowOpacity, glowScale;
    if (progress < 0.55) {
        glowOpacity = 0.03 + progress * 0.12;
        glowScale = 0.03 + progress * 0.07;
    } else {
        let p = easeOut((progress - 0.55) / 0.45);
        glowOpacity = lerp(0.10, 0.7, p);
        glowScale = lerp(0.07, 0.7, p);
    }
    glowEl.style.opacity = glowOpacity;
    glowEl.style.transform = "translate(-50%,-50%) scale(" + glowScale.toFixed(2) + ")";

    // ─── Vignette: opacity only ───
    let vigStrength = progress < 0.55
        ? lerp(0.7, 0.92, progress / 0.55)
        : lerp(0.92, 0.2, easeOut((progress - 0.55) / 0.45));
    vigEl.style.opacity = vigStrength;

    // ─── Rings: transform + opacity ONLY ───
    for (let i = 0; i < RING_COUNT; i++) {
        let ring = rings[i];
        let div  = ringDivs[i];
        let cz   = ring.z + currentZ;

        if (cz > -10 || cz < -TOTAL_DEPTH) {
            div.style.opacity = "0";
            continue;
        }

        // Perspective scale
        let perspScale = PERSPECTIVE / (-cz);

        // Scale the fixed 100x72 div to match projected tunnel size
        let sx = (ring.hw * 2 / BASE_W) * perspScale;
        let sy = (ring.hh * 2 / BASE_H) * perspScale;

        // Translate to center (offset by half the div before scaling)
        let tx = halfW - BASE_W * 0.5;
        let ty = halfH - BASE_H * 0.5;

        // Depth-based opacity
        let dNorm = clamp(-cz / (TOTAL_DEPTH * 0.45), 0, 1);
        let alpha = (1 - dNorm * dNorm) * 0.75;

        if (ring.t > 0.92) {
            alpha *= lerp(1, 0.4, easeOut((ring.t - 0.92) / 0.08));
        }

        if (alpha < 0.005) {
            div.style.opacity = "0";
            continue;
        }

        div.style.opacity = alpha;
        div.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + sx.toFixed(4) + "," + sy.toFixed(4) + ")";
    }

    updateNarrative(progress);
}

animate();

