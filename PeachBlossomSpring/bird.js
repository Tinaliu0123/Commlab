let W = window.innerWidth;
let H = window.innerHeight;

// --- Entrance state ---
let hasHash = window.location.hash.replace("#", "").length > 0;
let entranceDone = hasHash;

// --- Bird-view paragraph swap (replace visited paragraphs with bird's perspective) ---
let birdThoughts = {
    cave: "𓅂 The dark does not frighten what was born in it. I fold my wings and the <span class=\"keyword\" data-href=\"cave.html\" data-ink=\"#1a1a20\">cave</span> lets me through. The same gap, every time, the same warm draft pushing upward ∿ I do not squeeze. I fit. The mountain made this cave for something my size.",
    village: "𓇢 The mulberry branch is where I rest after rain. The pond is where I drink when the sun is low ∿ Between the roofs I know every draft, every chimney that sends warm air rising. The old woman hangs cloth and I sit on the line. I have never had to think about where to go next. Everything I need is one wingspan away. This <span class=\"keyword\" data-href=\"village.html\" data-ink=\"#3a3020\">village</span> holds me without asking ꕤ",
    talked: "I was on the rafter when they <span class=\"keyword\" data-href=\"talked.html\" data-ink=\"#4a4035\">talked</span>. The room was warm at first ∿ Their voices rose and mixed like heat from the hearth. Then something changed. The air went still 𓅂 I did not understand a word they said, but I felt the room grow cold around me. So I flew out through the open window ∿",
    marks: "𓅂 I do not carve. I do not stack stones. The way back is the smell of peach bark after rain ∿ the draft that bends left where the stream narrows. I have flown this path so many times my wings remember what my eyes forget ꕤ Every tree is a <span class=\"keyword\" data-href=\"marks.html\" data-ink=\"#5a5045\">marks</span> I read without landing. I do not need to leave anything behind. The world already holds the way ✦"
};

function swapVisitedParagraphs() {
    let hash = window.location.hash.replace("#", "");
    if (!hash) return;
    let visited = hash.split(",");
    let paragraphs = document.querySelectorAll(".paragraph[data-keyword]");
    for (let i = 0; i < paragraphs.length; i++) {
        let p = paragraphs[i];
        let kw = p.getAttribute("data-keyword");
        let found = false;
        for (let j = 0; j < visited.length; j++) {
            if (visited[j] === kw) { found = true; break; }
        }
        if (found && birdThoughts[kw]) {
            p.innerHTML = birdThoughts[kw];
            p.classList.add("bird-thought");
        }
    }
}

swapVisitedParagraphs();

// --- Finale check (all 4 keywords visited) ---
let allKeywords = ["cave", "village", "talked", "marks"];
let finaleReady = false;

function checkFinale() {
    let hash = window.location.hash.replace("#", "");
    if (!hash) return;
    let visited = hash.split(",");
    let allVisited = true;
    for (let i = 0; i < allKeywords.length; i++) {
        let found = false;
        for (let j = 0; j < visited.length; j++) {
            if (visited[j] === allKeywords[i]) { found = true; break; }
        }
        if (!found) { allVisited = false; break; }
    }
    if (allVisited) {
        finaleReady = true;
        let finalP = document.getElementById("final-paragraph");
        finalP.innerHTML = "𓅂 They search because they believe it can be found again. But I never lost it. I never mapped it. I simply live here ∿ The way back is not a path. It is a belonging. And belonging cannot be followed, only felt ꕤ";
        finalP.classList.add("finale-ready");
        finalP.addEventListener("click", function () {
            if (!finaleReady) return;
            startFinale();
        });
    }
}

checkFinale();

function lerp(a, b, t) { return a + (b - a) * t; }
function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

let _seed = 42;
function srand() {
    _seed = (_seed * 16807) % 2147483647;
    return (_seed - 1) / 2147483646;
}

// --- Nest ---
let nestX = W - 140;
let nestY = H - 120;

let nestEl = document.createElement("div");
nestEl.id = "nest";
nestEl.style.left = nestX + "px";
nestEl.style.top = nestY + "px";
document.body.appendChild(nestEl);

let twigChars = ["~", "~", "~", "−", "~", "−", "~", "~"];
let twigColors = ["#c45a20", "#b85020", "#d46a30", "#a84a18", "#c45a20", "#d06028"];

let nestRings = [
    { radius: 80, count: 24, size: 16 },
    { radius: 60, count: 18, size: 14 },
    { radius: 36, count: 12, size: 13 }
];

for (let ri = 0; ri < nestRings.length; ri++) {
    let ring = nestRings[ri];
    for (let i = 0; i < ring.count; i++) {
        let angle = (i / ring.count) * Math.PI * 2 + (srand() - 0.5) * 0.4;
        let r = ring.radius + (srand() - 0.5) * 8;
        let x = Math.cos(angle) * r;
        let y = Math.sin(angle) * r * 0.6;
        let t = document.createElement("span");
        t.className = "twig";
        t.textContent = twigChars[Math.floor(srand() * twigChars.length)];
        t.style.fontSize = ring.size + "px";
        t.style.color = twigColors[Math.floor(srand() * twigColors.length)];
        t.style.left = x + "px";
        t.style.top = y + "px";
        let deg = (angle * 180 / Math.PI) + 90 + (srand() - 0.5) * 40;
        t.style.setProperty("--base-rot", "rotate(" + Math.round(deg) + "deg)");
        t.style.transform = "rotate(" + Math.round(deg) + "deg)";
        t.style.setProperty("--sx", "" + ((srand() - 0.5) * 2.5));
        t.style.setProperty("--sy", "" + ((srand() - 0.5) * 1.5));
        let swayDur = 3 + srand() * 2;
        let swayDelay = srand() * 2;
        t.style.animation = "nestSway " + swayDur + "s ease-in-out " + swayDelay + "s infinite";
        nestEl.appendChild(t);
    }
}

let strands = [
    { a: 15, l: 40 }, { a: 70, l: 34 }, { a: 125, l: 38 },
    { a: 165, l: 30 }, { a: 45, l: 28 }, { a: 100, l: 24 }
];
for (let si = 0; si < strands.length; si++) {
    let s = strands[si];
    let rad = s.a * Math.PI / 180;
    for (let i = -1; i <= 1; i++) {
        let t = document.createElement("span");
        t.className = "twig";
        t.textContent = "─";
        t.style.fontSize = "12px";
        t.style.color = twigColors[Math.floor(srand() * twigColors.length)];
        t.style.left = (Math.cos(rad) * s.l * 0.3 * i) + "px";
        t.style.top = (Math.sin(rad) * s.l * 0.3 * i * 0.6) + "px";
        t.style.transform = "rotate(" + s.a + "deg)";
        t.style.opacity = "0.45";
        nestEl.appendChild(t);
    }
}

// --- Bird ---
let birdGroup = document.createElement("div");
birdGroup.id = "bird-group";
birdGroup.className = "bird-resting";
birdGroup.innerHTML =
    '<div class="wing left"></div>' +
    '<div class="bird-tail"></div>' +
    '<div class="bird-body"></div>' +
    '<div class="bird-head"></div>' +
    '<div class="wing right"></div>';
document.body.appendChild(birdGroup);

let birdShadow = document.createElement("div");
birdShadow.id = "bird-shadow";
birdShadow.innerHTML =
    '<div class="shadow-wing left"></div>' +
    '<div class="shadow-body"></div>' +
    '<div class="shadow-wing right"></div>';
document.body.appendChild(birdShadow);

let birdX, birdY, birdAngle, birdState;

if (entranceDone) {
    birdX = nestX;
    birdY = nestY;
    birdAngle = -90;
    birdState = "resting";
    nestEl.classList.add("visible");
    document.querySelector(".letter-container").classList.add("visible");
    document.getElementById("hint").classList.add("visible");
} else {
    birdX = -60;
    birdY = H * 0.4;
    birdAngle = 0;
    birdState = "entrance";
}

// --- Flight (quadratic bezier) ---
let fStart = { x: 0, y: 0 };
let fEnd   = { x: 0, y: 0 };
let fCtrl  = { x: 0, y: 0 };
let fT = 0;
let fDur = 0;
let fOnLand = null;
let trailTimer = 0;
let transitioning = false;

// --- Keywords (click to fly + transition) ---
let keywordEls = document.querySelectorAll(".keyword");

for (let ki = 0; ki < keywordEls.length; ki++) {
    (function (el) {
        el.addEventListener("click", function (e) {
            e.stopPropagation();
            if (transitioning || !entranceDone) return;
            document.body.style.overflow = "hidden";
            let rect = el.getBoundingClientRect();
            let tx = rect.left + rect.width / 2;
            let ty = rect.top + rect.height / 2;
            flyTo(tx, ty, function () {
                startTransition(el, rect);
            });
            document.getElementById("hint").style.opacity = "0";
        });
    })(keywordEls[ki]);
}

// --- Flight mechanics ---
function flyTo(tx, ty, onLand) {
    fStart.x = birdX;
    fStart.y = birdY;
    fEnd.x = tx;
    fEnd.y = ty;
    let mx = (birdX + tx) / 2;
    let my = (birdY + ty) / 2;
    let d = dist(birdX, birdY, tx, ty);
    let dx = tx - birdX;
    let dy = ty - birdY;
    let nx = -dy / d;
    let ny = dx / d;
    let arc = Math.min(d * 0.25, 90);
    if (ny > 0) { nx = -nx; ny = -ny; }
    fCtrl.x = mx + nx * arc;
    fCtrl.y = my + ny * arc;
    fT = 0;
    fDur = Math.max(1.0, d / 280);
    fOnLand = onLand;
    trailTimer = 0;
    birdState = "flying";
    birdGroup.className = "bird-flying";
}

function bezPt(t) {
    let u = 1 - t;
    return {
        x: u * u * fStart.x + 2 * u * t * fCtrl.x + t * t * fEnd.x,
        y: u * u * fStart.y + 2 * u * t * fCtrl.y + t * t * fEnd.y
    };
}

function bezTan(t) {
    let u = 1 - t;
    return {
        x: 2 * u * (fCtrl.x - fStart.x) + 2 * t * (fEnd.x - fCtrl.x),
        y: 2 * u * (fCtrl.y - fStart.y) + 2 * t * (fEnd.y - fCtrl.y)
    };
}

function spawnDot(x, y) {
    let d = document.createElement("div");
    d.className = "trail-dot";
    d.style.left = x + "px";
    d.style.top = (y + window.scrollY) + "px";
    document.body.appendChild(d);
    requestAnimationFrame(function () {
        requestAnimationFrame(function () { d.classList.add("fading"); });
    });
    setTimeout(function () {
        if (d.parentNode) d.parentNode.removeChild(d);
    }, 2200);
}

// --- Ink circle transition ---
let inkEl  = document.getElementById("transition-ink");
let textEl = document.getElementById("transition-text");

function startTransition(el, rect) {
    transitioning = true;
    let kwText = el.textContent;
    let kwInk  = el.getAttribute("data-ink");
    let kwHref = el.getAttribute("data-href");
    let cx = rect.left + rect.width / 2;
    let cy = rect.top + rect.height / 2;

    el.style.opacity = "0";

    // Keyword text lifts and grows
    textEl.textContent = kwText;
    textEl.style.fontSize = "18px";
    textEl.style.color = "#ede8df";
    textEl.style.left = cx + "px";
    textEl.style.top = cy + "px";
    textEl.style.opacity = "1";
    textEl.style.transition = "none";
    textEl.style.transform = "translate(-50%, -50%) scale(1)";

    // Ink circle expands from keyword center
    let inkSize = Math.max(W, H) * 2;
    inkEl.style.width = inkSize + "px";
    inkEl.style.height = inkSize + "px";
    inkEl.style.left = (cx - inkSize / 2) + "px";
    inkEl.style.top = (cy - inkSize / 2) + "px";
    inkEl.style.background = kwInk;
    inkEl.style.transition = "none";
    inkEl.style.opacity = "1";
    inkEl.style.transform = "scale(0)";

    inkEl.offsetWidth; // force reflow
    inkEl.style.transition = "transform 1.0s cubic-bezier(0.4, 0, 0.2, 1)";
    inkEl.style.transform = "scale(1.5)";

    setTimeout(function () {
        textEl.style.transition = "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        textEl.style.transform = "translate(-50%, -50%) scale(2.5)";
        textEl.style.left = (W / 2) + "px";
        textEl.style.top = (H / 2) + "px";
    }, 200);

    setTimeout(function () {
        birdGroup.style.opacity = "0";
        birdShadow.style.opacity = "0";
    }, 300);

    setTimeout(function () {
        textEl.style.transition = "opacity 0.6s ease";
        textEl.style.opacity = "0";
    }, 1400);

    // Navigate with visited keywords in hash
    setTimeout(function () {
        let hash = window.location.hash.replace("#", "");
        let visited = hash ? hash.split(",") : [];
        let alreadyIn = false;
        for (let v = 0; v < visited.length; v++) {
            if (visited[v] === kwText) { alreadyIn = true; break; }
        }
        if (!alreadyIn) visited.push(kwText);
        window.location.href = kwHref + "#" + visited.join(",");
    }, 2200);
}

// --- Entrance flight (sine-wave path to nest) ---
let entranceT = 0;
let entranceDur = 8.0;
let entranceSettleT = 0;
let entranceSettleDur = 0.6;
let entrancePhase = "fly";

let waypoints = [
    { x: -60, y: H * 0.35 },
    { x: W * 0.25, y: H * 0.2 },
    { x: W * 0.5, y: H * 0.3 },
    { x: W * 0.65, y: H * 0.15 },
    { x: W * 0.8, y: H * 0.35 },
    { x: nestX, y: nestY }
];

function getEntrancePos(t) {
    let segCount = waypoints.length - 1;
    let seg = Math.floor(t * segCount);
    if (seg >= segCount) seg = segCount - 1;
    let segT = (t * segCount) - seg;
    let smooth = segT * segT * (3 - 2 * segT); // smoothstep
    let from = waypoints[seg];
    let to = waypoints[seg + 1];
    let wobble = Math.sin(t * Math.PI * 3) * 10 * (1 - t);
    return {
        x: lerp(from.x, to.x, smooth),
        y: lerp(from.y, to.y, smooth) + wobble
    };
}

function entranceUpdate(dt) {
    if (entrancePhase === "fly") {
        entranceT += dt / entranceDur;
        if (entranceT >= 1) {
            entranceT = 1;
            entrancePhase = "settle";
            entranceSettleT = 0;
            birdGroup.className = "bird-resting";
            nestEl.classList.add("visible");
            stopFlapLoop();
        }

        let eased = entranceT * entranceT * (3 - 2 * entranceT);
        let pos = getEntrancePos(eased);
        birdX = pos.x;
        birdY = pos.y;

        let nextPos = getEntrancePos(Math.min(1, eased + 0.01));
        birdAngle = Math.atan2(nextPos.y - birdY, nextPos.x - birdX) * 180 / Math.PI + 90;

        if (entranceT > 0.85 && birdGroup.className !== "bird-gliding") {
            birdGroup.className = "bird-gliding";
        }

        trailTimer += dt;
        if (trailTimer > 0.1) {
            trailTimer = 0;
            spawnDot(birdX, birdY);
        }
    } else if (entrancePhase === "settle") {
        entranceSettleT += dt / entranceSettleDur;
        birdX = nestX;
        birdY = nestY;
        birdAngle = -90;

        let shake = Math.sin(entranceSettleT * Math.PI * 4) * 2 * (1 - entranceSettleT);
        birdX = nestX + shake;

        if (entranceSettleT >= 1) {
            entrancePhase = "done";
            entranceDone = true;
            birdX = nestX;
            birdY = nestY;
            birdState = "resting";
            document.querySelector(".letter-container").classList.add("visible");
            setTimeout(function () {
                document.getElementById("hint").classList.add("visible");
            }, 800);
        }
    }
}

// --- Wing flap audio ---
let flapSound = new Audio("freesound_community-wings2-7112.mp3");
flapSound.playbackRate = 0.75;
let flapInterval = null;

function startFlapLoop() {
    flapSound.currentTime = 0;
    flapSound.play();
    flapInterval = setInterval(function () {
        flapSound.currentTime = 0;
        flapSound.play();
    }, flapSound.duration ? flapSound.duration * 1000 / 0.75 + 200 : 1200);
}

function stopFlapLoop() {
    if (flapInterval) {
        clearInterval(flapInterval);
        flapInterval = null;
    }
}

if (!entranceDone) {
    birdGroup.className = "bird-flying";
    startFlapLoop();
    trailTimer = 0;
    document.addEventListener("click", function skipEntrance() {
        if (entranceDone) return;
        stopFlapLoop();
        entrancePhase = "done";
        entranceDone = true;
        birdX = nestX;
        birdY = nestY;
        birdAngle = -90;
        birdState = "resting";
        birdGroup.className = "bird-resting";
        nestEl.classList.add("visible");
        document.querySelector(".letter-container").classList.add("visible");
        document.getElementById("hint").classList.add("visible");
        document.removeEventListener("click", skipEntrance);
    });
}

// --- Animation loop ---
let lastTime = performance.now();

function animate(now) {
    requestAnimationFrame(animate);
    let dt = (now - lastTime) / 1000;
    lastTime = now;

    if (!entranceDone) {
        entranceUpdate(dt);
        birdGroup.style.transform = "translate(" + Math.round(birdX) + "px," + Math.round(birdY) + "px) rotate(" + Math.round(birdAngle) + "deg)";
        let sOff = entrancePhase === "fly" ? 14 : 8;
        let sScl = entrancePhase === "fly" ? 0.7 : 0.9;
        birdShadow.style.transform = "translate(" + Math.round(birdX) + "px," + Math.round(birdY + sOff) + "px) rotate(" + Math.round(birdAngle) + "deg) scale(" + sScl + ")";
        birdShadow.style.opacity = entrancePhase === "fly" ? "0.5" : "0.8";
        return;
    }

    if (finaleActive && birdState !== "flying") return;

    if (birdState === "flying") {
        fT += dt / fDur;
        if (fT >= 1) {
            fT = 1;
            birdState = "resting";
            birdGroup.className = "bird-resting";
            let p = bezPt(1);
            birdX = p.x;
            birdY = p.y;
            if (fOnLand) {
                fOnLand();
                fOnLand = null;
            }
        } else {
            let eased = fT < 0.5 ? 2 * fT * fT : 1 - 2 * (1 - fT) * (1 - fT);
            let p = bezPt(eased);
            birdX = p.x;
            birdY = p.y;
            let tan = bezTan(eased);
            birdAngle = Math.atan2(tan.y, tan.x) * 180 / Math.PI + 90;

            if (fT > 0.75 && birdGroup.className !== "bird-gliding") {
                birdGroup.className = "bird-gliding";
            }

            trailTimer += dt;
            if (trailTimer > 0.06) {
                trailTimer = 0;
                spawnDot(birdX, birdY);
            }
        }
    }

    birdGroup.style.transform = "translate(" + Math.round(birdX) + "px," + Math.round(birdY) + "px) rotate(" + Math.round(birdAngle) + "deg)";
    let sOff = birdState === "flying" ? 14 : 8;
    let sScl = birdState === "flying" ? 0.7 : 0.9;
    birdShadow.style.transform = "translate(" + Math.round(birdX) + "px," + Math.round(birdY + sOff) + "px) rotate(" + Math.round(birdAngle) + "deg) scale(" + sScl + ")";
    birdShadow.style.opacity = birdState === "flying" ? "0.5" : "0.8";
}

requestAnimationFrame(animate);

window.addEventListener("resize", function () {
    W = window.innerWidth;
    H = window.innerHeight;
    nestX = W - 140;
    nestY = H - 120;
    nestEl.style.left = nestX + "px";
    nestEl.style.top = nestY + "px";
});

// --- Finale animation ---
let finaleActive = false;

function startFinale() {
    if (finaleActive) return;
    finaleActive = true;
    finaleReady = false;

    let paragraphs = document.querySelectorAll(".paragraph");
    for (let i = 0; i < paragraphs.length; i++) {
        if (paragraphs[i].id !== "final-paragraph") {
            paragraphs[i].style.transition = "opacity 1s ease";
            paragraphs[i].style.opacity = "0";
        }
    }

    setTimeout(function () {
        let finalP = document.getElementById("final-paragraph");
        finalP.style.transition = "opacity 1s ease";
        finalP.style.opacity = "0";
    }, 1200);

    document.getElementById("hint").style.opacity = "0";
    nestEl.style.transition = "opacity 1s ease";
    nestEl.style.opacity = "0";

    // Bird flies to paper, then paper slides in
    setTimeout(function () {
        let paperTarget = { x: W * 0.35, y: H * 0.5 };
        birdGroup.style.opacity = "1";
        birdShadow.style.opacity = "0.5";
        startFlapLoop();
        flyTo(paperTarget.x, paperTarget.y, function () {
            stopFlapLoop();
            showPaper();
        });
    }, 2000);
}

function showPaper() {
    let paper = document.getElementById("finale-paper");
    paper.classList.add("visible");
    setTimeout(function () { startBirdCircle(); }, 1500);
}

function startBirdCircle() {
    let cx = W / 2;
    let cy = H / 2;
    let radius = 80;
    let circleDur = 2.0;
    let circleStart = performance.now();

    birdGroup.className = "bird-flying";
    startFlapLoop();

    function circleStep(now) {
        let circleT = (now - circleStart) / 1000 / circleDur;
        if (circleT >= 1) {
            stopFlapLoop();
            birdFlyAway();
            return;
        }

        let angle = circleT * Math.PI * 2 - Math.PI / 2;
        birdX = cx + Math.cos(angle) * radius;
        birdY = cy + Math.sin(angle) * radius * 0.6;

        let nextAngle = (circleT + 0.02) * Math.PI * 2 - Math.PI / 2;
        let nextX = cx + Math.cos(nextAngle) * radius;
        let nextY = cy + Math.sin(nextAngle) * radius * 0.6;
        birdAngle = Math.atan2(nextY - birdY, nextX - birdX) * 180 / Math.PI + 90;

        birdGroup.style.transform = "translate(" + Math.round(birdX) + "px," + Math.round(birdY) + "px) rotate(" + Math.round(birdAngle) + "deg)";
        birdShadow.style.transform = "translate(" + Math.round(birdX) + "px," + Math.round(birdY + 14) + "px) rotate(" + Math.round(birdAngle) + "deg) scale(0.7)";
        requestAnimationFrame(circleStep);
    }
    requestAnimationFrame(circleStep);
}

function birdFlyAway() {
    birdGroup.className = "bird-flying";
    startFlapLoop();
    fStart.x = birdX;
    fStart.y = birdY;
    fEnd.x = -100;
    fEnd.y = -100;
    fCtrl.x = (birdX - 100) / 2 - 60;
    fCtrl.y = (birdY - 100) / 2 - 80;
    fT = 0;
    fDur = 1.5;
    birdState = "flying";

    let flyStart = performance.now();

    function flyStep(now) {
        let dt = (now - flyStart) / 1000;
        flyStart = now;
        fT += dt / fDur;

        if (fT >= 1) {
            stopFlapLoop();
            birdGroup.style.opacity = "0";
            birdShadow.style.opacity = "0";
            finalizePaper();
            return;
        }

        let eased = fT < 0.5 ? 2 * fT * fT : 1 - 2 * (1 - fT) * (1 - fT);
        let p = bezPt(eased);
        birdX = p.x;
        birdY = p.y;
        let tan = bezTan(eased);
        birdAngle = Math.atan2(tan.y, tan.x) * 180 / Math.PI + 90;

        birdGroup.style.transform = "translate(" + Math.round(birdX) + "px," + Math.round(birdY) + "px) rotate(" + Math.round(birdAngle) + "deg)";
        birdShadow.style.transform = "translate(" + Math.round(birdX) + "px," + Math.round(birdY + 14) + "px) rotate(" + Math.round(birdAngle) + "deg) scale(0.7)";
        birdShadow.style.opacity = (1 - fT).toFixed(2);
        requestAnimationFrame(flyStep);
    }
    requestAnimationFrame(flyStep);
}

function finalizePaper() {
    let title = document.getElementById("finale-title");
    let credit = document.getElementById("finale-credit");

    title.classList.add("clickable");
    title.addEventListener("click", function () {
        window.open("https://en.wikisource.org/wiki/Translation:The_Peach_Blossom_Spring", "_blank");
    });

    setTimeout(function () { credit.classList.add("visible"); }, 800);
}
