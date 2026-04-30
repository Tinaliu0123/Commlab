let W = window.innerWidth;
let H = window.innerHeight;

// ═══════════════════════════════
//  BIRD-VIEW PARAGRAPH SWAP
// ═══════════════════════════════

let birdThoughts = {
    cave: "The dark does not frighten what was born in it. I fold my wings and the <span class=\"keyword\" data-href=\"cave.html\" data-ink=\"#1a1a20\">cave</span> lets me through \u2014 the same gap, every time, the same warm draft pushing upward. I do not squeeze. I fit. The mountain made this cave for something my size.",
    village: "The mulberry branch is where I rest after rain. The pond is where I drink when the sun is low. Between the roofs I know every draft, every chimney that sends warm air rising. The old woman hangs cloth and I sit on the line. I have never had to think about where to go next. Everything I need is one wingspan away. This <span class=\"keyword\" data-href=\"village.html\" data-ink=\"#3a3020\">village</span> holds me without asking."
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

function lerp(a, b, t) { return a + (b - a) * t; }
function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

let _seed = 42;
function srand() {
    _seed = (_seed * 16807) % 2147483647;
    return (_seed - 1) / 2147483646;
}


// ═══════════════════════════════
//  NEST (doubled size)
// ═══════════════════════════════

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
        t.style.setProperty("--base-rot", "rotate(" + deg.toFixed(0) + "deg)");
        t.style.transform = "rotate(" + deg.toFixed(0) + "deg)";
        t.style.setProperty("--sx", ((srand() - 0.5) * 2.5).toFixed(2));
        t.style.setProperty("--sy", ((srand() - 0.5) * 1.5).toFixed(2));
        t.style.animation = "nestSway " + (3 + srand() * 2).toFixed(1) + "s ease-in-out " + (srand() * 2).toFixed(1) + "s infinite";
        nestEl.appendChild(t);
    }
}

// Floor strands
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


// ═══════════════════════════════
//  BIRD
// ═══════════════════════════════

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

let birdX = nestX;
let birdY = nestY;
let birdAngle = -90;
let birdState = "resting";

// Flight bezier
let fStart = { x: 0, y: 0 };
let fEnd   = { x: 0, y: 0 };
let fCtrl  = { x: 0, y: 0 };
let fT = 0;
let fDur = 0;
let fOnLand = null;
let trailTimer = 0;
let transitioning = false;


// ═══════════════════════════════
//  KEYWORDS (from paragraph DOM)
// ═══════════════════════════════

let keywordEls = document.querySelectorAll(".keyword");

for (let ki = 0; ki < keywordEls.length; ki++) {
    (function (el) {
        el.addEventListener("click", function (e) {
            e.stopPropagation();
            if (transitioning) return;
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


// ═══════════════════════════════
//  FLIGHT
// ═══════════════════════════════

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
    d.style.top = y + "px";
    document.body.appendChild(d);
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            d.classList.add("fading");
        });
    });
    setTimeout(function () {
        if (d.parentNode) d.parentNode.removeChild(d);
    }, 2200);
}


// ═══════════════════════════════
//  TRANSITION: ink circle + text
// ═══════════════════════════════

let inkEl  = document.getElementById("transition-ink");
let textEl = document.getElementById("transition-text");

function startTransition(el, rect) {
    transitioning = true;

    let kwText = el.textContent;
    let kwInk  = el.getAttribute("data-ink");
    let kwHref = el.getAttribute("data-href");

    let cx = rect.left + rect.width / 2;
    let cy = rect.top + rect.height / 2;

    // Hide the keyword
    el.style.opacity = "0";

    // Phase 1: keyword text lifts and grows
    textEl.textContent = kwText;
    textEl.style.fontSize = "18px";
    textEl.style.color = "#ede8df";
    textEl.style.left = cx + "px";
    textEl.style.top = cy + "px";
    textEl.style.opacity = "1";
    textEl.style.transition = "none";
    textEl.style.transform = "translate(-50%, -50%) scale(1)";

    // Phase 2: ink circle expands from keyword center
    // The ink div is 200vmax x 200vmax. We position its top-left so
    // that the center of the circle lands on (cx, cy).
    let inkSize = Math.max(W, H) * 2;
    let inkLeft = cx - inkSize / 2;
    let inkTop  = cy - inkSize / 2;
    inkEl.style.width = inkSize + "px";
    inkEl.style.height = inkSize + "px";
    inkEl.style.left = inkLeft + "px";
    inkEl.style.top = inkTop + "px";
    inkEl.style.background = kwInk;
    inkEl.style.transition = "none";
    inkEl.style.opacity = "1";
    inkEl.style.transform = "scale(0)";

    // Force reflow then animate
    inkEl.offsetWidth;

    inkEl.style.transition = "transform 1.0s cubic-bezier(0.4, 0, 0.2, 1)";
    inkEl.style.transform = "scale(1.5)";

    // Text floats to center + scales up
    setTimeout(function () {
        textEl.style.transition = "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        textEl.style.transform = "translate(-50%, -50%) scale(2.5)";
        textEl.style.left = (W / 2) + "px";
        textEl.style.top = (H / 2) + "px";
    }, 200);

    // Hide bird
    setTimeout(function () {
        birdGroup.style.opacity = "0";
        birdShadow.style.opacity = "0";
    }, 300);

    // Phase 3: text fades
    setTimeout(function () {
        textEl.style.transition = "opacity 0.6s ease";
        textEl.style.opacity = "0";
    }, 1400);

    // Phase 4: navigate — pass current visited + this keyword via hash on the target
    setTimeout(function () {
        // Build visited list to carry forward
        let hash = window.location.hash.replace("#", "");
        let visited = hash ? hash.split(",") : [];
        let alreadyIn = false;
        for (let v = 0; v < visited.length; v++) {
            if (visited[v] === kwText) { alreadyIn = true; break; }
        }
        if (!alreadyIn) visited.push(kwText);
        // Store in the target page's hash so back button can read it
        window.location.href = kwHref + "#" + visited.join(",");
    }, 2200);
}


// ═══════════════════════════════
//  ANIMATION LOOP
// ═══════════════════════════════

let lastTime = performance.now();

function animate(now) {
    requestAnimationFrame(animate);
    let dt = (now - lastTime) / 1000;
    lastTime = now;

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

    birdGroup.style.transform = "translate(" + birdX.toFixed(1) + "px," + birdY.toFixed(1) + "px) rotate(" + birdAngle.toFixed(1) + "deg)";

    let sOff = birdState === "flying" ? 14 : 8;
    let sScl = birdState === "flying" ? 0.7 : 0.9;
    birdShadow.style.transform = "translate(" + birdX.toFixed(1) + "px," + (birdY + sOff).toFixed(1) + "px) rotate(" + birdAngle.toFixed(1) + "deg) scale(" + sScl + ")";
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
