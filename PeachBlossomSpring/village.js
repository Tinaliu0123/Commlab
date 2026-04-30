// ═══════════════════════════════════════
//  INTRO SCROLL PHASE
// ═══════════════════════════════════════

let introEl      = document.getElementById("intro-text");
let introOverlay = document.getElementById("intro-overlay");
let scrollHintEl = document.getElementById("scroll-hint");
let introActive  = true;

let maxScroll = document.body.scrollHeight - window.innerHeight;
window.scrollTo(0, 0);

function easeInIntro(t) { return t * t; }
function easeOutIntro(t) { return 1 - (1 - t) * (1 - t); }

window.addEventListener("scroll", function () {
    if (!introActive) return;

    let scrollProgress = window.scrollY / maxScroll;
    let introProgress = scrollProgress / 0.15;
    if (introProgress > 1) introProgress = 1;

    // Paragraph moves up and fades
    let introY = -introProgress * 120;
    let introAlpha = 1 - easeInIntro(introProgress);
    introEl.style.transform = "translate(-50%, " + (introY - 50) + "%)";
    introEl.style.opacity = introAlpha;

    // Overlay fades, revealing village
    introOverlay.style.opacity = 1 - easeOutIntro(introProgress);

    // Hide scroll hint once scrolling starts
    if (window.scrollY > 60) {
        scrollHintEl.style.opacity = "0";
    }

    // Transition to village mode once fully scrolled through intro
    if (introProgress >= 1) {
        introActive = false;
        introEl.style.display = "none";
        introOverlay.style.display = "none";
        scrollHintEl.style.display = "none";
        document.body.classList.add("village-active");
        window.scrollTo(0, 0);
    }
});

let village = document.getElementById("village");
let hintEl  = document.getElementById("hint");
let W = window.innerWidth;
let H = window.innerHeight;

function lerp(a, b, t) { return a + (b - a) * t; }
function dist(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

// Seeded random for consistent layout
let _seed = 42;
function srand() {
    _seed = (_seed * 16807) % 2147483647;
    return (_seed - 1) / 2147483646;
}

function px(p) { return p / 100 * W; }
function py(p) { return p / 100 * H; }


// ═══════════════════════════════════════
//  VILLAGE DATA
// ═══════════════════════════════════════

let houses = [
    {
        id: "h1", cx: 28, cy: 30,
        colGap: 4.0, rowGap: 3.2,
        grid: [
            [["roof","fire"],["roof","warmth"],["roof","cooking"],["roof","laughter"]],
            [["roof","humming"],["roof","children"],["roof","old song"],["roof","stories"]],
            [["wall","sleeping"],["wall","dreaming"],["door","welcome"],["wall","quiet"]]
        ]
    },
    {
        id: "h2", cx: 50, cy: 54,
        colGap: 3.8, rowGap: 3.2,
        grid: [
            [["roof","tea"],["roof","reading"],["roof","afternoon"],["roof","ink brush"],["roof","quiet"]],
            [["roof","a letter"],["wall","memory"],["door","come in"],["wall","silence"]]
        ]
    },
    {
        id: "h3", cx: 16, cy: 62,
        colGap: 4.0, rowGap: 3.2,
        grid: [
            [["roof","steam"],["roof","rice"],["roof","boiling"]],
            [["wall","voices"],["wall","three"],["wall","generations"]],
            [["wall","same"],["door","table"],["wall","always"]]
        ]
    },
    {
        id: "h4", cx: 64, cy: 28,
        colGap: 4.0, rowGap: 3.2,
        grid: [
            [["roof","rain"],["roof","safe"],["roof","warm"]],
            [["wall","sleeping"],["door","dreaming"],["wall","peace"]]
        ]
    }
];

let fields = [
    { cx: 84, cy: 32, rows: 10, cols: 6, word: "rice", colGap: 3.2, rowGap: 2.2 },
    { cx: 84, cy: 66, rows: 8,  cols: 5, word: "rice", colGap: 3.2, rowGap: 2.2 },
    { cx: 8,  cy: 34, rows: 6,  cols: 3, word: "bean", colGap: 3.5, rowGap: 2.2 }
];

let ponds = [
    { cx: 42, cy: 12, rx: 10,  ry: 4,   colGap: 4.2, rowGap: 2.6, word: "water" },
    { cx: 62, cy: 78, rx: 4,   ry: 2,   colGap: 4.2, rowGap: 2.4, word: "water" },
    { cx: 8,  cy: 55, rx: 3.5, ry: 1.8, colGap: 4.2, rowGap: 2.4, word: "water" }
];

let paths = [
    { pts: [{x:36,y:30},{x:40,y:29},{x:44,y:29},{x:48,y:28},{x:52,y:28},{x:56,y:28},{x:60,y:28}], word: "path" },
    { pts: [{x:28,y:36},{x:28,y:40},{x:28,y:44},{x:29,y:48}], word: "path" },
    { pts: [{x:24,y:36},{x:22,y:40},{x:20,y:45},{x:18,y:50},{x:17,y:55},{x:16,y:58}], word: "path" },
    { pts: [{x:22,y:66},{x:26,y:64},{x:30,y:62},{x:34,y:60},{x:38,y:58},{x:42,y:56}], word: "path" },
    { pts: [{x:30,y:48},{x:34,y:48},{x:38,y:49},{x:42,y:50},{x:46,y:51},{x:50,y:52}], word: "path" },
    { pts: [{x:58,y:56},{x:62,y:55},{x:66,y:54},{x:70,y:53}], word: "path" },
    { pts: [{x:64,y:32},{x:64,y:36},{x:63,y:40},{x:62,y:44},{x:61,y:48}], word: "path" },
    { pts: [{x:20,y:70},{x:26,y:72},{x:32,y:73},{x:38,y:74},{x:44,y:74},{x:50,y:73},{x:56,y:72},{x:62,y:71}], word: "path" },
    { pts: [{x:30,y:24},{x:33,y:22},{x:36,y:19},{x:39,y:16}], word: "path" }
];

let trees = [
    { cx: 6,  cy: 8,  rows: 3, cols: 2, word: "bamboo",   colGap: 5.0, rowGap: 2.6, species: "bamboo" },
    { cx: 18, cy: 6,  rows: 2, cols: 2, word: "mulberry", colGap: 5.8, rowGap: 2.6, species: "mulberry" },
    { cx: 60, cy: 7,  rows: 2, cols: 2, word: "bamboo",   colGap: 5.0, rowGap: 2.6, species: "bamboo" },
    { cx: 92, cy: 10, rows: 2, cols: 2, word: "willow",   colGap: 5.0, rowGap: 2.6, species: "willow" },
    { cx: 6,  cy: 78, rows: 2, cols: 2, word: "mulberry", colGap: 5.8, rowGap: 2.6, species: "mulberry" },
    { cx: 34, cy: 84, rows: 2, cols: 2, word: "pine",     colGap: 4.2, rowGap: 2.6, species: "pine" },
    { cx: 56, cy: 86, rows: 2, cols: 2, word: "bamboo",   colGap: 5.0, rowGap: 2.6, species: "bamboo" },
    { cx: 92, cy: 82, rows: 2, cols: 2, word: "bamboo",   colGap: 5.0, rowGap: 2.6, species: "bamboo" },
    { cx: 5,  cy: 50, rows: 2, cols: 1, word: "bamboo",   colGap: 5.0, rowGap: 2.6, species: "bamboo" },
    { cx: 96, cy: 48, rows: 2, cols: 1, word: "willow",   colGap: 5.0, rowGap: 2.6, species: "willow" },
    { cx: 74, cy: 80, rows: 2, cols: 2, word: "bamboo",   colGap: 5.0, rowGap: 2.6, species: "bamboo" }
];

let flowerClusters = [
    { cx: 18, cy: 80, rx: 8,   ry: 4,   colGap: 1.6, rowGap: 1.3 },
    { cx: 38, cy: 40, rx: 6,   ry: 3,   colGap: 1.5, rowGap: 1.2 },
    { cx: 68, cy: 66, rx: 5,   ry: 2.5, colGap: 1.5, rowGap: 1.2 },
    { cx: 46, cy: 79, rx: 6,   ry: 3,   colGap: 1.5, rowGap: 1.2 },
    { cx: 76, cy: 50, rx: 5,   ry: 2.5, colGap: 1.5, rowGap: 1.2 },
    { cx: 5,  cy: 47, rx: 4,   ry: 2,   colGap: 1.5, rowGap: 1.2 },
    { cx: 30, cy: 18, rx: 4,   ry: 2,   colGap: 1.5, rowGap: 1.2 },
    { cx: 55, cy: 42, rx: 4,   ry: 2,   colGap: 1.6, rowGap: 1.3 },
    { cx: 12, cy: 20, rx: 4,   ry: 2,   colGap: 1.5, rowGap: 1.2 }
];

let flowerColors = ["#d4728c","#c45a76","#e8a0b0","#d98da3","#c45a76","#e89aad","#cf6b85"];
let flowerSizes  = [12, 14, 11, 15, 13, 14, 12, 16, 13, 14];

let people = [
    {
        id: "elder", cx: 22, cy: 70, word: "elder",
        cycle: ["wrinkled hands","slow smile","plants beans","same spring","same beans","remembers nothing"],
        waypoints: [{x:22,y:70},{x:21,y:71},{x:20,y:70.5},{x:21,y:69.5}],
        speed: 0.0004
    },
    {
        id: "child", cx: 36, cy: 42, word: "child",
        cycle: ["runs","chases","laughs","never seen a wall","doesn't know","there is one"],
        waypoints: [{x:36,y:42},{x:40,y:38},{x:46,y:40},{x:50,y:44},{x:44,y:47},{x:38,y:45}],
        speed: 0.0012
    },
    {
        id: "woman", cx: 56, cy: 58, word: "woman",
        cycle: ["carries water","hums a tune","her mother's tune","same song","same river"],
        waypoints: [{x:56,y:58},{x:52,y:52},{x:48,y:44},{x:44,y:34},{x:42,y:24},{x:40,y:16},{x:42,y:24},{x:46,y:36},{x:50,y:48}],
        speed: 0.0005
    },
    {
        id: "farmer", cx: 80, cy: 58, word: "farmer",
        cycle: ["bends low","counts seasons","same harvest","same seed","enough"],
        waypoints: [{x:80,y:58},{x:84,y:58},{x:88,y:58},{x:88,y:62},{x:84,y:62},{x:80,y:62}],
        speed: 0.0003
    },
    {
        id: "weaver", cx: 34, cy: 32, word: "weaver",
        cycle: ["thread by thread","shuttle clicks","same pattern","her grandmother's","and hers before"],
        waypoints: [{x:34,y:32},{x:34,y:33},{x:33,y:33},{x:33,y:32}],
        speed: 0.0003
    },
    {
        id: "boy", cx: 78, cy: 42, word: "boy",
        cycle: ["chasing dragonflies","muddy feet","asks why","the sky ends","at the mountains"],
        waypoints: [{x:78,y:42},{x:82,y:38},{x:86,y:42},{x:82,y:46},{x:78,y:44}],
        speed: 0.0009
    }
];


// ═══════════════════════════════════════
//  BUILD DOM
// ═══════════════════════════════════════

let allWords = [];
let houseWords = {};
let personEls = {};
let waterWords = [];

function makeWord(text, pctX, pctY, zone, extra) {
    let el = document.createElement("span");
    el.className = "w " + zone;
    el.textContent = text;
    el.style.left = px(pctX) + "px";
    el.style.top  = py(pctY) + "px";
    if (extra && extra.style) {
        for (let s in extra.style) {
            el.style[s] = extra.style[s];
        }
    }
    if (extra && extra.cls) {
        el.classList.add(extra.cls);
    }
    village.appendChild(el);
    let entry = {
        el: el, bx: px(pctX), by: py(pctY), zone: zone,
        houseId: null, exterior: null, interior: null,
        personId: null, cycleWords: null, waypoints: null,
        wpSpeed: 0, wpProgress: 0, currentX: px(pctX), currentY: py(pctY)
    };
    if (extra) {
        for (let k in extra) {
            if (k !== "style" && k !== "cls") {
                entry[k] = extra[k];
            }
        }
    }
    allWords.push(entry);
    return entry;
}

// Houses
for (let hi = 0; hi < houses.length; hi++) {
    let h = houses[hi];
    houseWords[h.id] = [];
    let rows = h.grid.length;
    let cols = h.grid[0].length;
    let tw = (cols - 1) * h.colGap;
    let th = (rows - 1) * h.rowGap;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < h.grid[r].length; c++) {
            let cell = h.grid[r][c];
            let x = h.cx - tw / 2 + c * h.colGap + (srand() - 0.5) * 0.2;
            let y = h.cy - th / 2 + r * h.rowGap + (srand() - 0.5) * 0.15;
            let entry = makeWord(cell[0], x, y, "house", {
                houseId: h.id, exterior: cell[0], interior: cell[1]
            });
            houseWords[h.id].push(entry);
        }
    }
}

// Fields
for (let fi = 0; fi < fields.length; fi++) {
    let f = fields[fi];
    let tw = (f.cols - 1) * f.colGap;
    let th = (f.rows - 1) * f.rowGap;
    for (let r = 0; r < f.rows; r++) {
        for (let c = 0; c < f.cols; c++) {
            let x = f.cx - tw / 2 + c * f.colGap;
            let y = f.cy - th / 2 + r * f.rowGap;
            if (r % 2 === 1) x += f.colGap * 0.3;
            x += (srand() - 0.5) * 0.3;
            y += (srand() - 0.5) * 0.2;
            makeWord(f.word, x, y, "field");
        }
    }
}

// Ponds (ellipse grids)
for (let pi = 0; pi < ponds.length; pi++) {
    let pond = ponds[pi];
    let pondRows = Math.floor(pond.ry * 2 / pond.rowGap) + 1;
    for (let r = 0; r < pondRows; r++) {
        let yOff = -pond.ry + r * pond.rowGap;
        let ratio = yOff / pond.ry;
        if (Math.abs(ratio) >= 0.95) continue;
        let halfW = pond.rx * Math.sqrt(1 - ratio * ratio);
        let cols = Math.max(1, Math.floor(halfW * 2 / pond.colGap));
        for (let c = 0; c < cols; c++) {
            let xOff = 0;
            if (cols === 1) {
                xOff = 0;
            } else {
                xOff = -halfW + pond.colGap * 0.5 + c * (halfW * 2 - pond.colGap) / (cols - 1);
            }
            let entry = makeWord(pond.word,
                pond.cx + xOff + (srand() - 0.5) * 0.15,
                pond.cy + yOff + (srand() - 0.5) * 0.1,
                "water");
            waterWords.push(entry);
        }
    }
}

// Paths
for (let pi = 0; pi < paths.length; pi++) {
    let p = paths[pi];
    for (let j = 0; j < p.pts.length; j++) {
        let pt = p.pts[j];
        makeWord(p.word,
            pt.x + (srand() - 0.5) * 0.15,
            pt.y + (srand() - 0.5) * 0.1,
            "path");
    }
}

// Trees
for (let ti = 0; ti < trees.length; ti++) {
    let t = trees[ti];
    let tw = (t.cols - 1) * t.colGap;
    let th = (t.rows - 1) * t.rowGap;
    for (let r = 0; r < t.rows; r++) {
        for (let c = 0; c < t.cols; c++) {
            makeWord(t.word,
                t.cx - tw / 2 + c * t.colGap + (srand() - 0.5) * 0.3,
                t.cy - th / 2 + r * t.rowGap + (srand() - 0.5) * 0.15,
                "tree", { cls: t.species });
        }
    }
}

// Flowers (ellipse clusters)
let flowerIdx = 0;
for (let fi = 0; fi < flowerClusters.length; fi++) {
    let f = flowerClusters[fi];
    let fRows = Math.floor(f.ry * 2 / f.rowGap) + 1;
    for (let r = 0; r < fRows; r++) {
        let yOff = -f.ry + r * f.rowGap;
        let ratio = yOff / f.ry;
        if (Math.abs(ratio) >= 0.95) continue;
        let halfW = f.rx * Math.sqrt(1 - ratio * ratio);
        let cols = Math.max(1, Math.floor(halfW * 2 / f.colGap));
        for (let c = 0; c < cols; c++) {
            let xOff = 0;
            if (cols === 1) {
                xOff = 0;
            } else {
                xOff = -halfW + f.colGap * 0.5 + c * (halfW * 2 - f.colGap) / (cols - 1);
            }
            let ci = flowerIdx % flowerColors.length;
            let si = flowerIdx % flowerSizes.length;
            makeWord("*",
                f.cx + xOff + (srand() - 0.5) * 0.4,
                f.cy + yOff + (srand() - 0.5) * 0.3,
                "flower",
                { style: { color: flowerColors[ci], fontSize: flowerSizes[si] + "px" } });
            flowerIdx++;
        }
    }
}

// People
for (let pi = 0; pi < people.length; pi++) {
    let p = people[pi];
    let entry = makeWord(p.word, p.cx, p.cy, "person", {
        personId: p.id, cycleWords: p.cycle,
        waypoints: p.waypoints, wpSpeed: p.speed,
        wpProgress: srand(), currentX: px(p.cx), currentY: py(p.cy)
    });
    personEls[p.id] = entry;
}


// ═══════════════════════════════════════
//  BIRD
// ═══════════════════════════════════════

let birdEl = document.createElement("div");
birdEl.id = "bird";
village.appendChild(birdEl);

let shadowEl = document.createElement("div");
shadowEl.id = "bird-shadow";
village.appendChild(shadowEl);

let birdX = W * 0.5;
let birdY = H * 0.08;
let birdTX = birdX;
let birdTY = birdY;
let birdVx = 0;
let birdVy = 0;
let birdFlying = false;
let BIRD_SPEED = 4;
let PART_RADIUS = 50;
let PART_STRENGTH = 20;


// ═══════════════════════════════════════
//  HOUSE REVEAL
// ═══════════════════════════════════════

let activeHouse = null;
let houseTimers = [];

function revealHouse(hid, ox, oy) {
    if (activeHouse === hid) return;
    if (activeHouse) revertHouse(activeHouse);
    activeHouse = hid;
    let words = houseWords[hid];
    if (!words) return;
    let sorted = words.slice().sort(function (a, b) {
        return dist(ox, oy, a.bx, a.by) - dist(ox, oy, b.bx, b.by);
    });
    for (let i = 0; i < houseTimers.length; i++) {
        clearTimeout(houseTimers[i]);
    }
    houseTimers = [];
    for (let i = 0; i < sorted.length; i++) {
        (function (w, delay) {
            let t = setTimeout(function () {
                w.el.textContent = w.interior;
                w.el.classList.add("revealed");
            }, delay);
            houseTimers.push(t);
        })(sorted[i], i * 120);
    }
}

function revertHouse(hid) {
    for (let i = 0; i < houseTimers.length; i++) {
        clearTimeout(houseTimers[i]);
    }
    houseTimers = [];
    let words = houseWords[hid];
    if (!words) return;
    for (let i = 0; i < words.length; i++) {
        (function (w, delay) {
            setTimeout(function () {
                w.el.textContent = w.exterior;
                w.el.classList.remove("revealed");
            }, delay);
        })(words[i], i * 80);
    }
    activeHouse = null;
}


// ═══════════════════════════════════════
//  PERSON CYCLE
// ═══════════════════════════════════════

let activePersonId = null;
let personCycleTimer = null;
let personCycleIndex = 0;

function startPersonCycle(pid) {
    if (activePersonId === pid) return;
    stopPersonCycle();
    activePersonId = pid;
    personCycleIndex = 0;
    let entry = personEls[pid];
    if (!entry) return;

    function tick() {
        entry.el.textContent = entry.cycleWords[personCycleIndex % entry.cycleWords.length];
        entry.el.classList.add("revealed");
        personCycleIndex++;
        personCycleTimer = setTimeout(tick, 1600);
    }
    tick();
}

function stopPersonCycle() {
    if (personCycleTimer) clearTimeout(personCycleTimer);
    personCycleTimer = null;
    if (activePersonId) {
        let e = personEls[activePersonId];
        // Find original word
        let origWord = "";
        for (let i = 0; i < people.length; i++) {
            if (people[i].id === activePersonId) {
                origWord = people[i].word;
                break;
            }
        }
        if (origWord) e.el.textContent = origWord;
        e.el.classList.remove("revealed");
    }
    activePersonId = null;
}


// ═══════════════════════════════════════
//  WATER REFLECTION
// ═══════════════════════════════════════

let reflectedList = [];

function isReflected(entry) {
    for (let i = 0; i < reflectedList.length; i++) {
        if (reflectedList[i] === entry) return true;
    }
    return false;
}

function triggerReflection(entry) {
    if (isReflected(entry)) return;
    reflectedList.push(entry);
    entry.el.textContent = "bird";
    entry.el.classList.add("reflected");
    setTimeout(function () {
        entry.el.textContent = "water";
        entry.el.classList.remove("reflected");
        setTimeout(function () {
            // Remove from list
            for (let i = 0; i < reflectedList.length; i++) {
                if (reflectedList[i] === entry) {
                    reflectedList.splice(i, 1);
                    break;
                }
            }
        }, 300);
    }, 800);
}


// ═══════════════════════════════════════
//  CHECK LANDING
// ═══════════════════════════════════════

function checkLanding() {
    let HR = 60;
    let PR = 40;

    for (let hid in houseWords) {
        let words = houseWords[hid];
        for (let i = 0; i < words.length; i++) {
            if (dist(birdX, birdY, words[i].bx, words[i].by) < HR) {
                revealHouse(hid, birdX, birdY);
                return;
            }
        }
    }

    for (let pid in personEls) {
        let pe = personEls[pid];
        if (dist(birdX, birdY, pe.currentX, pe.currentY) < PR) {
            startPersonCycle(pid);
            return;
        }
    }

    if (activeHouse) revertHouse(activeHouse);
    stopPersonCycle();
}


// ═══════════════════════════════════════
//  CLICK → FLY
// ═══════════════════════════════════════

document.addEventListener("click", function (e) {
    birdTX = e.clientX;
    birdTY = e.clientY;
    birdFlying = true;
    hintEl.style.opacity = "0";
    if (activeHouse) revertHouse(activeHouse);
    stopPersonCycle();
});


// ═══════════════════════════════════════
//  ANIMATION LOOP
// ═══════════════════════════════════════

function animate() {
    requestAnimationFrame(animate);

    // Bird flight
    if (birdFlying) {
        let dx = birdTX - birdX;
        let dy = birdTY - birdY;
        let d = Math.sqrt(dx * dx + dy * dy);
        if (d < 3) {
            birdFlying = false;
            birdVx = 0;
            birdVy = 0;
            checkLanding();
        } else {
            let sp = Math.min(BIRD_SPEED, d * 0.05);
            birdVx = dx / d * sp;
            birdVy = dy / d * sp;
            birdX += birdVx;
            birdY += birdVy;
        }
    }

    birdEl.style.transform = "translate(" + birdX.toFixed(1) + "px," + birdY.toFixed(1) + "px)";
    shadowEl.style.transform = "translate(" + (birdX + 3).toFixed(1) + "px," + (birdY + 10).toFixed(1) + "px)";

    let birdSpeed = Math.sqrt(birdVx * birdVx + birdVy * birdVy);
    let isMoving = birdSpeed > 0.3;

    // People waypoint animation
    for (let pid in personEls) {
        let pe = personEls[pid];
        if (!pe.waypoints || pe.waypoints.length < 2) continue;
        if (activePersonId === pid) continue;
        pe.wpProgress = (pe.wpProgress + pe.wpSpeed) % 1;
        let wp = pe.waypoints;
        let total = wp.length;
        let raw = pe.wpProgress * total;
        let si = Math.floor(raw) % total;
        let st = raw - Math.floor(raw);
        let ni = (si + 1) % total;
        let nx = lerp(px(wp[si].x), px(wp[ni].x), st);
        let ny = lerp(py(wp[si].y), py(wp[ni].y), st);
        pe.el.style.transform = "translate(" + (nx - pe.bx).toFixed(1) + "px," + (ny - pe.by).toFixed(1) + "px)";
        pe.currentX = nx;
        pe.currentY = ny;
    }

    // Water reflection
    if (isMoving) {
        for (let wi = 0; wi < waterWords.length; wi++) {
            let ww = waterWords[wi];
            if (dist(birdX, birdY, ww.bx, ww.by) < 40) {
                triggerReflection(ww);
            }
        }
    }

    // Parting effect (fields, flowers, trees, water — not houses, people, paths)
    for (let i = 0; i < allWords.length; i++) {
        let w = allWords[i];
        if (w.zone === "house" || w.zone === "person" || w.zone === "path") continue;

        let dd = dist(birdX, birdY, w.bx, w.by);
        if (dd < PART_RADIUS && isMoving) {
            let ax = w.bx - birdX;
            let ay = w.by - birdY;
            let al = Math.sqrt(ax * ax + ay * ay) || 1;
            ax = ax / al;
            ay = ay / al;
            let f = 1 - (dd / PART_RADIUS);
            f = f * f;
            let pushX = ax * PART_STRENGTH * f;
            let pushY = ay * PART_STRENGTH * f;

            if (w.zone === "field") {
                let tilt = Math.atan2(birdVy, birdVx) * (180 / Math.PI) * f * 0.25;
                w.el.style.transform = "translate(" + pushX.toFixed(1) + "px," + pushY.toFixed(1) + "px) rotate(" + tilt.toFixed(1) + "deg)";
            } else {
                w.el.style.transform = "translate(" + pushX.toFixed(1) + "px," + pushY.toFixed(1) + "px)";
            }
            w.el.style.transition = "none";
        } else if (w.el.style.transform && w.el.style.transform !== "none") {
            w.el.style.transition = "transform 0.5s ease";
            w.el.style.transform = "none";
        }
    }
}

animate();

window.addEventListener("resize", function () {
    W = window.innerWidth;
    H = window.innerHeight;
});
