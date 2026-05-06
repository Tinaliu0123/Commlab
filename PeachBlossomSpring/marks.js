// --- State ---
let W = window.innerWidth;
let H = window.innerHeight;
let mode = "";
let entityX = 0, entityY = 0;
let targetX = 0, targetY = 0;
let moving = false;
let stepsTaken = 0;
let maxSteps = 10;
let finished = false;
let crossingRiver = false;
let riverNarrationShown = false;

// --- Elements ---
let choiceScreen = document.getElementById("choice-screen");
let mapContainer = document.getElementById("map-container");
let fogOverlay = document.getElementById("fog-overlay");
let mapLayer = document.getElementById("map-layer");
let marksLayer = document.getElementById("marks-layer");
let trailLayer = document.getElementById("trail-layer");
let entity = document.getElementById("entity");
let narrationEl = document.getElementById("narration");
let destinationEl = document.getElementById("destination");
let stepCounter = document.getElementById("step-counter");
let mapHint = document.getElementById("map-hint");
let endScreen = document.getElementById("end-screen");
let endText = document.getElementById("end-text");
let endAgain = document.getElementById("end-again");
let nestLink = document.getElementById("nest-link");

// --- Map data ---
let destX = W * 0.72;
let destY = H * 0.2;
let marks = [];
let markEls = [];
let markSymbol = "\u00d7";
let envElements = [];

let fishermanLines = [
    "This mark... I remember this one.",
    "Or was it the one to the left?",
    "I\u2019ve been here before.",
    "The marks all look the same now.",
    "Which way did I turn here?",
    "...I don\u2019t remember anymore."
];

let birdLines = [
    "\u223f Warmer here.",
    "\u2740 The petals drift that way.",
    "Water, somewhere close \u2248",
    "\u2726 The air smells sweet.",
    "\u2736 Almost home."
];

// --- Seeded random ---
let _seed = 77;
function srand() {
    _seed = (_seed * 16807) % 2147483647;
    return (_seed - 1) / 2147483646;
}

// --- Generate map ---
function generateMarks() {
    marks = [];
    _seed = 77;
    let count = 14;
    for (let i = 0; i < count; i++) {
        let mx = W * 0.08 + srand() * W * 0.72;
        let my = H * 0.1 + srand() * H * 0.7;
        let dx = mx - destX;
        let dy = my - destY;
        if (Math.sqrt(dx * dx + dy * dy) < 100) { mx = mx - 120; my = my + 100; }
        if (mx > W * 0.7 && my > H * 0.65) mx = mx - 150;
        marks.push({
            x: mx, y: my, symbol: markSymbol,
            rotation: (srand() - 0.5) * 40, visited: false
        });
    }
}

function generateEnvironment() {
    envElements = [];
    _seed = 123;

    function nearRiver(px, py) {
        return Math.abs(py - getRiverY(px)) < 40;
    }

    // Stones
    let stoneClusters = [
        { cx: W * 0.1, cy: H * 0.3, count: 5, spread: 40 },
        { cx: W * 0.6, cy: H * 0.15, count: 4, spread: 35 },
        { cx: W * 0.08, cy: H * 0.85, count: 4, spread: 32 },
        { cx: W * 0.5, cy: H * 0.8, count: 6, spread: 50 },
        { cx: W * 0.7, cy: H * 0.7, count: 3, spread: 28 }
    ];
    for (let c = 0; c < stoneClusters.length; c++) {
        let cluster = stoneClusters[c];
        if (nearRiver(cluster.cx, cluster.cy)) continue;
        for (let i = 0; i < cluster.count; i++) {
            let angle = (i / cluster.count) * Math.PI * 2 + srand() * 0.8;
            let dist = cluster.spread * 0.3 + srand() * cluster.spread * 0.7;
            envElements.push({
                x: cluster.cx + Math.cos(angle) * dist,
                y: cluster.cy + Math.sin(angle) * dist * 0.6,
                type: "stone", rotation: srand() * 360
            });
        }
    }

    // Trees
    let treeGroves = [
        { cx: W * 0.15, cy: H * 0.2, count: 5, spread: 55 },
        { cx: W * 0.4, cy: H * 0.15, count: 4, spread: 45 },
        { cx: W * 0.08, cy: H * 0.55, count: 3, spread: 35 },
        { cx: W * 0.6, cy: H * 0.08, count: 4, spread: 40 },
        { cx: W * 0.25, cy: H * 0.85, count: 3, spread: 38 },
        { cx: W * 0.5, cy: H * 0.88, count: 5, spread: 50 },
        { cx: W * 0.7, cy: H * 0.35, count: 4, spread: 45 },
        { cx: W * 0.28, cy: H * 0.45, count: 3, spread: 38 }
    ];
    for (let g = 0; g < treeGroves.length; g++) {
        let grove = treeGroves[g];
        let dd = Math.sqrt((grove.cx - destX) * (grove.cx - destX) + (grove.cy - destY) * (grove.cy - destY));
        if (dd < 100) continue;
        if (nearRiver(grove.cx, grove.cy)) continue;
        for (let i = 0; i < grove.count; i++) {
            let angle = (i / grove.count) * Math.PI * 2 + srand() * 0.6;
            let dist = grove.spread * 0.4 + srand() * grove.spread * 0.6;
            envElements.push({
                x: grove.cx + Math.cos(angle) * dist,
                y: grove.cy + Math.sin(angle) * dist * 0.7,
                type: "tree", rotation: 0
            });
        }
    }

    // Grass
    let grassPatches = [
        { cx: W * 0.12, cy: H * 0.15, count: 6, spread: 35 },
        { cx: W * 0.35, cy: H * 0.85, count: 5, spread: 30 },
        { cx: W * 0.55, cy: H * 0.9, count: 7, spread: 40 },
        { cx: W * 0.18, cy: H * 0.7, count: 4, spread: 28 },
        { cx: W * 0.65, cy: H * 0.2, count: 5, spread: 32 },
        { cx: W * 0.45, cy: H * 0.1, count: 4, spread: 25 },
        { cx: W * 0.32, cy: H * 0.55, count: 5, spread: 30 }
    ];
    for (let g = 0; g < grassPatches.length; g++) {
        let patch = grassPatches[g];
        if (nearRiver(patch.cx, patch.cy)) continue;
        for (let i = 0; i < patch.count; i++) {
            let angle = (i / patch.count) * Math.PI * 2 + srand() * 0.8;
            let dist = patch.spread * 0.3 + srand() * patch.spread * 0.7;
            envElements.push({
                x: patch.cx + Math.cos(angle) * dist,
                y: patch.cy + Math.sin(angle) * dist * 0.6,
                type: "grass", rotation: srand() * 20 - 10
            });
        }
    }

    // Peach blossoms (denser toward destination)
    for (let i = 0; i < 10; i++) {
        let angle = srand() * Math.PI * 2;
        let dist = 30 + srand() * 60;
        envElements.push({
            x: destX + Math.cos(angle) * dist,
            y: destY + Math.sin(angle) * dist * 0.8,
            type: "petal", rotation: srand() * 360
        });
    }
    for (let i = 0; i < 8; i++) {
        let angle = srand() * Math.PI * 2;
        let dist = 80 + srand() * 150;
        envElements.push({
            x: destX + Math.cos(angle) * dist,
            y: destY + Math.sin(angle) * dist * 0.7,
            type: "petal", rotation: srand() * 360
        });
    }
    for (let i = 0; i < 5; i++) {
        let t = 0.3 + srand() * 0.7;
        envElements.push({
            x: destX - t * W * 0.15 + (srand() - 0.5) * 50,
            y: destY + t * H * 0.2 + (srand() - 0.5) * 40,
            type: "petal", rotation: srand() * 360
        });
    }
}

function renderMarks() {
    marksLayer.innerHTML = "";
    markEls = [];
    for (let i = 0; i < marks.length; i++) {
        let m = marks[i];
        let el = document.createElement("div");
        el.className = "mark clickable";
        el.textContent = m.symbol;
        el.style.left = Math.round(m.x) + "px";
        el.style.top = Math.round(m.y) + "px";
        el.style.transform = "rotate(" + Math.round(m.rotation) + "deg)";
        el.setAttribute("data-index", "" + i);
        el.addEventListener("click", function () { onMarkClick(i); });
        marksLayer.appendChild(el);
        markEls.push(el);
    }
}

function renderEnvironment() {
    mapLayer.innerHTML = "";
    for (let i = 0; i < envElements.length; i++) {
        let e = envElements[i];
        let el = document.createElement("div");
        el.className = "env-el env-" + e.type;
        el.style.left = Math.round(e.x) + "px";
        el.style.top = Math.round(e.y) + "px";
        if (e.type === "grass") {
            el.style.transform = "rotate(" + Math.round(e.rotation) + "deg)";
        }
        mapLayer.appendChild(el);
    }
}

// River: diagonal line from top-right to bottom-left
function getRiverY(x) {
    let t = 1 - (x / W);
    return H * 0.1 + t * H * 0.8;
}

function renderRiver() {
    let old = document.getElementById("river-container");
    if (old) old.parentNode.removeChild(old);

    let riverText = mode === "fisherman"
        ? "the marks are still there \u00b7 "
        : "follow the warmth \u00b7 ";
    let fullText = "";
    for (let r = 0; r < 14; r++) fullText += riverText;

    let container = document.createElement("div");
    container.id = "river-container";
    if (mode === "fisherman") container.className = "fisherman-river";

    let riverAngle = Math.atan2(-H * 0.8, W) * (180 / Math.PI);
    let lines = [
        { perpOff: -14, delay: 0 },
        { perpOff: 0, delay: -8 },
        { perpOff: 14, delay: -16 }
    ];

    for (let i = 0; i < lines.length; i++) {
        let cfg = lines[i];
        let wrapper = document.createElement("div");
        wrapper.style.position = "absolute";
        wrapper.style.left = "50%";
        wrapper.style.top = "50%";
        wrapper.style.transform = "translate(-50%, -50%) rotate(" + Math.round(riverAngle) + "deg) translateY(" + cfg.perpOff + "px)";

        let line = document.createElement("div");
        line.className = "river-line";
        if (mode === "fisherman") line.classList.add("revealed");
        line.textContent = fullText;
        line.style.animation = "riverFlow 26s ease-in-out infinite";
        line.style.animationDelay = cfg.delay + "s";

        wrapper.appendChild(line);
        container.appendChild(wrapper);
    }
    mapContainer.appendChild(container);
}

// --- Fog of war (bird mode, CSS mask-image) ---
let revealedSpots = [];

function initFog() {
    revealedSpots = [];
    fogOverlay.style.background = "#ede8df";
    fogOverlay.style.maskImage = "none";
    fogOverlay.style.webkitMaskImage = "none";
}

function drawFog() {
    if (revealedSpots.length === 0) {
        fogOverlay.style.maskImage = "none";
        fogOverlay.style.webkitMaskImage = "none";
        return;
    }
    // Each gradient: transparent circle (hole) + black edge (keeps fog)
    // mask-composite: intersect = hole in ANY layer reveals content
    let masks = [];
    for (let i = 0; i < revealedSpots.length; i++) {
        let spot = revealedSpots[i];
        masks.push(
            "radial-gradient(circle " + spot.r + "px at " + Math.round(spot.x) + "px " + Math.round(spot.y) + "px, " +
            "transparent 0%, transparent 50%, rgba(0,0,0,0.3) 60%, black 100%)"
        );
    }
    let maskStr = masks.join(", ");
    fogOverlay.style.maskImage = maskStr;
    fogOverlay.style.webkitMaskImage = maskStr;
    fogOverlay.style.maskComposite = "intersect";
    fogOverlay.style.webkitMaskComposite = "source-in";
}

function revealAt(x, y, radius) {
    // Merge with nearby spot instead of adding a new gradient layer
    let merged = false;
    for (let i = 0; i < revealedSpots.length; i++) {
        let spot = revealedSpots[i];
        let dx = spot.x - x;
        let dy = spot.y - y;
        let d = Math.sqrt(dx * dx + dy * dy);
        if (d < spot.r * 0.6) {
            // Expand existing spot to cover both areas
            let far = d + radius;
            if (far > spot.r) spot.r = far;
            merged = true;
            break;
        }
    }
    if (!merged) revealedSpots.push({ x: x, y: y, r: radius });
    drawFog();
    // Reveal environment elements in range
    let els = mapLayer.children;
    for (let i = 0; i < envElements.length; i++) {
        let e = envElements[i];
        let dx = e.x - x;
        let dy = e.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < radius) {
            if (els[i]) els[i].classList.add("revealed");
        }
    }
    // Reveal river when bird is near
    let distToRiver = Math.abs(y - getRiverY(x));
    if (distToRiver < radius) {
        let riverLines = document.querySelectorAll(".river-line");
        for (let i = 0; i < riverLines.length; i++) riverLines[i].classList.add("revealed");
    }
    // Check if near destination
    let dd = Math.sqrt((x - destX) * (x - destX) + (y - destY) * (y - destY));
    if (dd < 60) destinationEl.classList.add("revealed");
}

// --- Fisherman interaction ---
function onMarkClick(index) {
    if (mode !== "fisherman" || moving || finished) return;
    if (stepsTaken >= maxSteps) return;
    if (marks[index].visited && stepsTaken > 2) {
        showNarration("I\u2019ve already been here...");
        return;
    }
    marks[index].visited = true;
    markEls[index].classList.add("visited");
    targetX = marks[index].x;
    targetY = marks[index].y;
    moving = true;
    stepsTaken++;
    stepCounter.textContent = "steps: " + stepsTaken + " / " + maxSteps;

    let lineIdx = (stepsTaken - 1) % fishermanLines.length;
    showNarration(fishermanLines[lineIdx]);

    if (stepsTaken >= maxSteps) {
        setTimeout(function () {
            showNarration("...I can\u2019t find it.");
            setTimeout(function () { finishJourney(); }, 2500);
        }, 1500);
    }
}

// --- Bird interaction ---
function onMapClick(e) {
    if (mode !== "bird" || moving || finished) return;
    let rect = mapContainer.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    if (targetX > W - 230 && targetY > H - 180) return;

    moving = true;
    stepsTaken++;

    let dd = Math.sqrt((targetX - destX) * (targetX - destX) + (targetY - destY) * (targetY - destY));
    if (dd < 80 && stepsTaken >= 2) {
        destinationEl.classList.add("revealed");
        setTimeout(function () {
            showNarration(birdLines[4]);
            setTimeout(function () { finishJourney(); }, 2000);
        }, 800);
    } else if (dd < 180) {
        showNarration(birdLines[3]);
    } else if (dd < 300) {
        showNarration(birdLines[1]);
    } else if (stepsTaken === 1) {
        showNarration(birdLines[0]);
    }
}

mapContainer.addEventListener("click", onMapClick);

// --- Movement loop ---
let lastTime = 0;
let speed = 2.5;
let trailTimer = 0;

function update(time) {
    if (!lastTime) lastTime = time;
    lastTime = time;

    if (moving) {
        let dx = targetX - entityX;
        let dy = targetY - entityY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 4) {
            entityX = targetX;
            entityY = targetY;
            moving = false;
            riverNarrationShown = false;
            if (mode === "bird") {
                let dd = Math.sqrt((entityX - destX) * (entityX - destX) + (entityY - destY) * (entityY - destY));
                let radius = 110 + Math.max(0, (300 - dd) * 0.25);
                revealAt(entityX, entityY, radius);
            }
        } else {
            let moveSpeed = mode === "bird" ? 3 : 2.2;

            // Fisherman slows crossing river
            if (mode === "fisherman") {
                let riverY = getRiverY(entityX);
                if (Math.abs(entityY - riverY) < 35) {
                    moveSpeed = 0.7;
                    if (!riverNarrationShown) {
                        riverNarrationShown = true;
                        showNarration("the water is cold...");
                    }
                }
            }

            entityX += (dx / dist) * moveSpeed;
            entityY += (dy / dist) * moveSpeed;

            trailTimer++;
            if (trailTimer % 6 === 0) {
                let dot = document.createElement("div");
                dot.className = "trail-dot " + mode;
                dot.style.left = Math.round(entityX - 1) + "px";
                dot.style.top = Math.round(entityY - 1) + "px";
                trailLayer.appendChild(dot);
            }

            // Bird: reveal along path
            if (mode === "bird" && trailTimer % 10 === 0) {
                revealAt(entityX, entityY, 75);
            }
        }

        entity.style.left = Math.round(entityX - 5) + "px";
        entity.style.top = Math.round(entityY - 5) + "px";
    }

    requestAnimationFrame(update);
}

function showNarration(text) {
    narrationEl.textContent = text;
    narrationEl.classList.add("visible");
}

// --- Start / End ---
function startMode(chosenMode) {
    mode = chosenMode;
    finished = false;
    moving = false;
    stepsTaken = 0;
    trailTimer = 0;

    trailLayer.innerHTML = "";
    narrationEl.classList.remove("visible");
    destinationEl.classList.remove("revealed");
    endScreen.classList.remove("visible");
    mapHint.classList.remove("visible");
    nestLink.classList.remove("visible");

    generateMarks();
    generateEnvironment();
    renderEnvironment();

    entityX = W * 0.1;
    entityY = H * 0.65;
    renderRiver();

    if (mode === "fisherman") {
        renderMarks();
        entity.className = "fisherman-entity";
        fogOverlay.style.display = "none";
        mapLayer.style.display = "";
        let els = mapLayer.children;
        for (let i = 0; i < els.length; i++) {
            els[i].classList.add("revealed");
            els[i].style.opacity = "0.15";
        }
        stepCounter.textContent = "steps: 0 / " + maxSteps;
        stepCounter.classList.add("visible");
        mapHint.textContent = "click a mark to follow it";
    } else {
        marksLayer.innerHTML = "";
        entity.className = "bird-entity";
        fogOverlay.style.display = "block";
        mapLayer.style.display = "";
        initFog();
        revealAt(entityX, entityY, 100);
        stepCounter.classList.remove("visible");
        mapHint.textContent = "click anywhere to fly";
    }

    entity.style.left = Math.round(entityX - 5) + "px";
    entity.style.top = Math.round(entityY - 5) + "px";
    entity.style.display = "block";
    destinationEl.style.left = Math.round(destX - 40) + "px";
    destinationEl.style.top = Math.round(destY - 40) + "px";

    choiceScreen.classList.add("hidden");
    setTimeout(function () {
        mapContainer.classList.add("visible");
        setTimeout(function () {
            mapHint.classList.add("visible");
            setTimeout(function () { mapHint.classList.remove("visible"); }, 3000);
        }, 500);
    }, 600);
}

function finishJourney() {
    finished = true;
    setTimeout(function () {
        if (mode === "fisherman") {
            endText.textContent = "He followed every mark he\u2019d made. None led him back.";
        } else {
            endText.textContent = "\u2736 It landed softly among the blossoms. It had never needed a mark \u2740";
        }
        endScreen.classList.add("visible");
        nestLink.classList.add("visible");
    }, 300);
}

// --- Nest ---
function createNest() {
    let _nestSeed = 42;
    function nestRand() {
        _nestSeed = (_nestSeed * 16807) % 2147483647;
        return (_nestSeed - 1) / 2147483646;
    }

    let twigChars = ["~", "~", "~", "\u2212", "~", "\u2212", "~", "~"];
    let twigColors = ["#c45a20", "#b85020", "#d46a30", "#a84a18", "#c45a20", "#d06028"];
    let rings = [
        { count: 24, radius: 80, size: 16 },
        { count: 18, radius: 60, size: 14 },
        { count: 12, radius: 36, size: 13 }
    ];
    let cx = 90, cy = 60;

    for (let r = 0; r < rings.length; r++) {
        let ring = rings[r];
        for (let i = 0; i < ring.count; i++) {
            let angle = (i / ring.count) * Math.PI * 2 + (nestRand() - 0.5) * 0.4;
            let rad = ring.radius + (nestRand() - 0.5) * 8;
            let x = Math.cos(angle) * rad;
            let y = Math.sin(angle) * rad * 0.6;
            let t = document.createElement("div");
            t.className = "twig";
            t.textContent = twigChars[Math.floor(nestRand() * twigChars.length)];
            t.style.fontSize = ring.size + "px";
            t.style.color = twigColors[Math.floor(nestRand() * twigColors.length)];
            t.style.left = Math.round(cx + x) + "px";
            t.style.top = Math.round(cy + y) + "px";
            let deg = (angle * 180 / Math.PI) + 90 + (nestRand() - 0.5) * 40;
            t.style.setProperty("--base-rot", "rotate(" + Math.round(deg) + "deg)");
            t.style.transform = "rotate(" + Math.round(deg) + "deg)";
            t.style.setProperty("--sx", "" + ((nestRand() - 0.5) * 2.5));
            t.style.setProperty("--sy", "" + ((nestRand() - 0.5) * 1.5));
            let swayDur = 3 + nestRand() * 2;
            let swayDelay = nestRand() * 2;
            t.style.animation = "nestSway " + swayDur.toFixed(1) + "s ease-in-out " + swayDelay.toFixed(1) + "s infinite";
            nestLink.appendChild(t);
        }
    }

    let strands = [
        { a: 15, l: 40 }, { a: 70, l: 34 }, { a: 125, l: 38 },
        { a: 165, l: 30 }, { a: 45, l: 28 }, { a: 100, l: 24 }
    ];
    for (let si = 0; si < strands.length; si++) {
        let s = strands[si];
        let srad = s.a * Math.PI / 180;
        for (let i = -1; i <= 1; i++) {
            let t = document.createElement("div");
            t.className = "twig";
            t.textContent = "\u2500";
            t.style.fontSize = "12px";
            t.style.color = twigColors[Math.floor(nestRand() * twigColors.length)];
            t.style.left = Math.round(cx + Math.cos(srad) * s.l * 0.3 * i) + "px";
            t.style.top = Math.round(cy + Math.sin(srad) * s.l * 0.3 * i * 0.6) + "px";
            t.style.transform = "rotate(" + s.a + "deg)";
            t.style.opacity = "0.45";
            nestLink.appendChild(t);
        }
    }
}

// --- Events ---
document.getElementById("btn-fisherman").addEventListener("click", function () { startMode("fisherman"); });
document.getElementById("btn-bird").addEventListener("click", function () { startMode("bird"); });

endAgain.addEventListener("click", function () {
    endScreen.classList.remove("visible");
    mapContainer.classList.remove("visible");
    nestLink.classList.remove("visible");
    entity.style.display = "none";
    fogOverlay.style.display = "none";
    trailLayer.innerHTML = "";
    marksLayer.innerHTML = "";
    mapLayer.innerHTML = "";
    let oldRiver = document.getElementById("river-container");
    if (oldRiver) oldRiver.parentNode.removeChild(oldRiver);
    narrationEl.classList.remove("visible");
    destinationEl.classList.remove("revealed");
    stepCounter.classList.remove("visible");
    setTimeout(function () { choiceScreen.classList.remove("hidden"); }, 500);
});

nestLink.addEventListener("click", function () {
    let hash = window.location.hash.replace("#", "");
    let href = hash ? "bird.html#" + hash : "bird.html#return";
    let flyBird = document.getElementById("flying-bird");

    let nestRect = nestLink.getBoundingClientRect();
    let nestCX = nestRect.left + nestRect.width / 2;
    let nestCY = nestRect.top + nestRect.height / 2;
    let startX = -20;
    let startY = H * 0.3;

    flyBird.style.left = startX + "px";
    flyBird.style.top = startY + "px";
    flyBird.classList.add("active");

    // Animate bird along bezier curve to nest
    let birdStart = Date.now();
    let birdDuration = 1800;
    let prevBX = startX;
    let prevBY = startY;

    function animateFlyBird() {
        let elapsed = Date.now() - birdStart;
        let t = Math.min(elapsed / birdDuration, 1);
        let ease = 1 - (1 - t) * (1 - t);

        let cpX = nestCX * 0.4;
        let cpY = -80;
        let bx = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * cpX + ease * ease * nestCX;
        let by = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * cpY + ease * ease * nestCY;

        let fdx = bx - prevBX;
        let fdy = by - prevBY;
        if (Math.abs(fdx) > 0.1 || Math.abs(fdy) > 0.1) {
            let angle = Math.atan2(fdy, fdx) * (180 / Math.PI) + 90;
            flyBird.style.transform = "rotate(" + Math.round(angle) + "deg)";
        }
        prevBX = bx;
        prevBY = by;
        flyBird.style.left = Math.round(bx) + "px";
        flyBird.style.top = Math.round(by) + "px";

        if (t < 1) {
            requestAnimationFrame(animateFlyBird);
        } else {
            setTimeout(function () { window.location.href = href; }, 400);
        }
    }
    requestAnimationFrame(animateFlyBird);
});

// --- Init ---
createNest();
requestAnimationFrame(update);
