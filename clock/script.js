let clock = document.querySelector("#clock");
let W = clock.clientWidth;
let H = clock.clientHeight;
let centerX = W / 2;
let centerY = H / 2;
let base = Math.min(W, H) * 0.42;
let SQUASH = 0.55;

// ===== ORBIT DEFINITIONS =====
let orbits = [
    { size: 0.30, r: 255, g: 200, b: 130, count: 12, dotSize: 16, scale: 1.0 },
    { size: 0.58, r: 190, g: 170, b: 255, count: 60, dotSize: 13, scale: 0.7 },
    { size: 0.92, r: 150, g: 215, b: 255, count: 60, dotSize: 10, scale: 0.5 }
];

// ===== HELPERS =====
function getPos(frac, size) {
    let angle = frac * Math.PI * 2 - Math.PI / 2; // change 0~1 to 0~2pi, and minus the initial angle (lead to 3am/pm)
    let rx = size * base;
    let ry = size * SQUASH * base;
    let x = centerX + rx * Math.cos(angle);
    let y = centerY + ry * Math.sin(angle);
    return { x, y };
}

function timeColor(h24) {
    if (h24 >= 17 && h24 < 19) {
        return { r: 195, g: 50, b: 75 };  // sunset
    } else if (h24 >= 12 && h24 < 14) {
        return { r: 255, g: 248, b: 220 };  // noon
    } else if (h24 >= 5 && h24 < 8) {
        return { r: 190, g: 85, b: 50 };  // sunrise
    } else if (h24 >= 19 || h24 < 5) {
        return { r: 10, g: 12, b: 45 };  // midnight
    } else {
        return { r: 180, g: 160, b: 120 };  // default
    }
}

function makeDiv(cls) {
    let d = document.createElement("div");
    d.className = cls;
    clock.append(d);
    return d;
}

function placeAt(el, x, y, size) {
    el.style.left = (x - size / 2) + "px";
    el.style.top = (y - size / 2) + "px";
    el.style.width = size + "px";
    el.style.height = size + "px";
}

// ===== CREATE STARS =====
for (let i = 0; i < 120; i++) {
    let star = makeDiv("star");
    let sz = Math.random() * 2 + 0.6;
    star.style.width = sz + "px";
    star.style.height = sz + "px";
    star.style.left = (Math.random() * 100) + "%";
    star.style.top = (Math.random() * 100) + "%";
    let alpha = Math.random() * 0.15 + 0.03;
    star.style.backgroundColor = "rgba(255, 255, 255, " + (alpha * 2) + ")";
    star.style.animationDuration = (Math.random() * 3 + 1) + "s";
    star.style.animationDelay = (Math.random() * 3) + "s";
}

// ===== CREATE ORBIT TRACKS =====
for (let i = 0; i < 3; i++) {
    let o = orbits[i];
    let track = makeDiv("orbit-track");
    let rx = o.size * base;
    let ry = o.size * SQUASH * base;
    let bw = 0.6 + 0.8 * o.scale;
    track.style.width = (rx * 2) + "px";
    track.style.height = (ry * 2) + "px";
    track.style.left = (centerX - rx) + "px";
    track.style.top = (centerY - ry) + "px";
    track.style.borderColor = "rgba(" + o.r + "," + o.g + "," + o.b + ", 0.15)";
    track.style.borderWidth = bw + "px";
}




// ===== CREATE TICK MARKS =====
let allTicks = [[], [], []];

for (let oi = 0; oi < 3; oi++) {
    let o = orbits[oi];
    for (let i = 0; i < o.count; i++) {
        let tick = makeDiv("tick");
        let p = getPos(i / o.count, o.size);
        let cardinal = false;
        if (o.count === 12) {
            if (i % 3 === 0) { cardinal = true; }
        } else {
            if (i % 15 === 0) { cardinal = true; }
        }
        let sz;
        if (cardinal) {
            sz = (2 + 1.5 * o.scale) * 2;
        } else {
            sz = (1.5 + o.scale) * 1.2;
        }
        placeAt(tick, p.x, p.y, sz);
        if (cardinal) {
            tick.style.backgroundColor = "rgba(255, 255, 255, 0.80)";
            tick.style.boxShadow = "0 0 6px rgba(255, 255, 255, 0.6)";
        } else {
            tick.style.backgroundColor = "rgba(255, 255, 255, 0.20)";
        }
        allTicks[oi].push({ el: tick, cardinal: cardinal, size: sz });
    }
}

// ===== CREATE CENTER BODY =====
let centerSize = base * 0.22 * 2;
let centerDiv = makeDiv("center-body");
placeAt(centerDiv, centerX, centerY, centerSize);

// ===== CREATE TAIL SEGMENTS =====
let tailCounts = [160, 300, 480];
let allTails = [[], [], []];

for (let oi = 0; oi < 3; oi++) {
    let o = orbits[oi];
    let count = tailCounts[oi];
    for (let i = 0; i < count; i++) {
        let tail = makeDiv("tail");
        let sz = o.dotSize * 0.35;
        tail.style.width = sz + "px";
        tail.style.height = sz + "px";
        tail.style.backgroundColor = "rgba(" + o.r + "," + o.g + "," + o.b + ", 1)";
        tail.style.opacity = "0";
        allTails[oi].push({ el: tail, sz: sz });
    }
}

// ===== CREATE DOTS =====
let dots = [];

for (let oi = 0; oi < 3; oi++) {
    let o = orbits[oi];
    let dot = makeDiv("dot");
    dot.style.width = o.dotSize + "px";
    dot.style.height = o.dotSize + "px";
    dot.style.background = "radial-gradient(circle, rgba(" + o.r + "," + o.g + "," + o.b + ",1) 20%, rgba(255,255,255,0.4) 50%, transparent 80%)";
    let glowSize = 14 + 16 * o.scale;
    dot.style.boxShadow = "0 0 " + glowSize + "px rgba(" + o.r + "," + o.g + "," + o.b + ", 0.45), 0 0 " + (glowSize * 2) + "px rgba(" + o.r + "," + o.g + "," + o.b + ", 0.12)";
    dots.push(dot);
}

// ===== UPDATE FUNCTION =====
function update() {
    let now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();
    let ms = now.getMilliseconds();

    let secSmooth = s + ms / 1000;
    let minSmooth = m + secSmooth / 60;
    let hourSmooth = (h % 12) + minSmooth / 60;

    let fracs = [hourSmooth / 12, minSmooth / 60, secSmooth / 60];
    let rawVals = [h % 12, m, s];

    let col = timeColor(h);


    // ---- update tick marks ----
    for (let oi = 0; oi < 3; oi++) {
        let o = orbits[oi];
        let highlightIdx = rawVals[oi];
        for (let i = 0; i < o.count; i++) {
            let tick = allTicks[oi][i];
            if (i <= highlightIdx) {
                let brightness = 0.5 + 0.5 * (i / Math.max(highlightIdx, 1));
                tick.el.style.backgroundColor = "rgba(" + o.r + "," + o.g + "," + o.b + "," + (0.9 * brightness) + ")";
                if (tick.cardinal) {
                    tick.el.style.boxShadow = "0 0 " + (6 + 4 * o.scale) + "px rgba(" + o.r + "," + o.g + "," + o.b + "," + (0.5 * brightness) + ")";
                } else {
                    tick.el.style.boxShadow = "0 0 " + (3 + 2 * o.scale) + "px rgba(" + o.r + "," + o.g + "," + o.b + "," + (0.3 * brightness) + ")";
                }
            } else {
                if (tick.cardinal) {
                    tick.el.style.backgroundColor = "rgba(255, 255, 255, 0.30)";
                } else {
                    tick.el.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                }
                tick.el.style.boxShadow = "none";
            }
        }
    }

    // ---- update center body ----
    let cr = col.r;
    let cg = col.g;
    let cb = col.b;
    let c80r = Math.min(255, cr + 80);
    let c80g = Math.min(255, cg + 80);
    let c80b = Math.min(255, cb + 80);

    centerDiv.style.background = "radial-gradient(circle, " +
        "rgba(255,255,255,0.8) 0%, " +
        "rgba(" + c80r + "," + c80g + "," + c80b + ",0.6) 20%, " +
        "transparent 40%)";

    // ---- update tails ----
    for (let oi = 0; oi < 3; oi++) {
        let o = orbits[oi];
        let frac = fracs[oi];
        let count = tailCounts[oi];
        for (let i = 0; i < count; i++) {
            let segFrac = (i / count) * frac;
            let p = getPos(segFrac, o.size);
            let t = allTails[oi][i];
            t.el.style.left = (p.x - t.sz / 2) + "px";
            t.el.style.top = (p.y - t.sz / 2) + "px";
            let relPos = i / count;
            let alpha = 0.05 + 0.55 * relPos * relPos;
            t.el.style.opacity = alpha + "";
        }
    }

    // ---- update dots ----
    for (let oi = 0; oi < 3; oi++) {
        let o = orbits[oi];
        let p = getPos(fracs[oi], o.size);
        dots[oi].style.left = (p.x - o.dotSize / 2) + "px";
        dots[oi].style.top = (p.y - o.dotSize / 2) + "px";
    }
}

update();
setInterval(update, 50);
