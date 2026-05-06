// --- Dialogue data ---
let groups = [
    {
        title: "A Full Table",
        pairs: [
            { q: "You \u2014 sit, sit! When did you last eat? You look thin.", a: "This morning. But nothing like this." },
            { q: "Bring the chicken \u2014 the whole thing! And the good ale, not the watery one!", a: "You don\u2019t have to\u2014" },
            { q: "Nonsense. We kill a chicken for every guest. ...We just haven\u2019t had a guest in a very long time.", a: null },
            { q: "The children keep peeking from behind the door. Forgive them. They\u2019ve never seen a stranger before.", a: "...Never?" }
        ]
    },
    {
        title: "Names They Never Heard",
        pairs: [
            { q: "Tell us \u2014 what dynasty is it out there now?", a: "Jin." },
            { q: "...Jin? We don\u2019t know that name.", a: null },
            { q: "Our ancestors left during Qin. How long has it been?", a: "There was Han for four hundred years. Then it broke apart. Then Wei. Now Jin." },
            { q: "Old Liu doesn\u2019t believe you. He says no empire lasts four hundred years.", a: "I\u2019m not making it up." }
        ]
    },
    {
        title: "The World You Came From",
        pairs: [
            { q: "Do people still plant in spring and harvest in autumn?", a: "Those who can. Most of the harvest goes to taxes." },
            { q: "Our grandfather talked about the big markets \u2014 hundreds of stalls! Are they still there?", a: "Smaller now. People sell what they must." },
            { q: "Here we eat at a different house every night, just to talk. Do neighbors still do that?", a: "People keep their doors closed. It\u2019s safer." },
            { q: "Safer from what?", a: "From whoever comes knocking." }
        ]
    },
    {
        title: "What Cannot Be Said",
        pairs: [
            { q: "...", a: null },
            { q: "You should stay a few more days. Rest here. Eat.", a: "I\u2019d like that." },
            { q: "And when you go \u2014 this place is not worth mentioning to anyone out there.", a: null }
        ]
    }
];

// --- State ---
let introActive = true;
let pageReady = false;
let activeGroup = -1;
let currentPair = 0;
let isHolding = false;
let holdTime = 0;
let groupsRead = [false, false, false, false];

let birdFlew = false;
let birdFlying = false;
let flyStartX = 0, flyStartY = 0;
let flyMidX = 0, flyMidY = 0;
let flyEndX = 0, flyEndY = 0;
let flyT = 0;
let flyDuration = 2.5;
let INTRO_FRACTION = 0.15;
let holdDelay = 1.2;

// --- Elements ---
let introEl = document.getElementById("intro-text");
let introOverlay = document.getElementById("intro-overlay");
let birdPerch = document.getElementById("bird-perch");
let birdGroup = document.getElementById("bird-group");
let slipContainer = document.getElementById("slip-container");
let overlayDim = document.getElementById("overlay-dim");
let activeSlip = document.getElementById("active-slip");
let activeTitle = document.getElementById("active-title");
let activeDialogue = document.getElementById("active-dialogue");
let activeHint = document.getElementById("active-hint");
let naturalLayer = document.getElementById("natural-layer");
let hintEl = document.getElementById("hint");
let nestLink = document.getElementById("nest-link");

// --- Utilities ---
function clamp(v, min, max) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}
function easeIn(t) { return t * t; }
function easeOut(t) { return 1 - (1 - t) * (1 - t); }

let _seed = 42;
function srand() {
    _seed = (_seed * 16807) % 2147483647;
    return (_seed - 1) / 2147483646;
}

// Quadratic bezier
function bezier(t, p0, p1, p2) {
    let mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

let flyFadeOut = true;

function startBirdFlight(endX, endY, midOffsetX, midOffsetY, duration, fadeOut) {
    let rect = birdPerch.getBoundingClientRect();
    flyStartX = rect.left;
    flyStartY = rect.top;
    flyMidX = (flyStartX + endX) / 2 + midOffsetX;
    flyMidY = (flyStartY + endY) / 2 + midOffsetY;
    flyEndX = endX;
    flyEndY = endY;
    flyT = 0;
    flyDuration = duration;
    flyFadeOut = fadeOut !== false;
    birdFlying = true;
    birdPerch.classList.add("flying");
}

function updateBirdFlight(dt) {
    if (!birdFlying) return;
    flyT = flyT + dt / flyDuration;
    if (flyT >= 1) {
        flyT = 1;
        birdFlying = false;
        birdPerch.classList.remove("flying");
        birdPerch.style.top = flyEndY + "px";
        birdPerch.style.left = flyEndX + "px";
        birdPerch.style.transform = "translate(0, 0)";
        birdGroup.style.transform = "";
        if (flyFadeOut) birdPerch.style.opacity = "0";
        return;
    }
    let eased = flyT * flyT * (3 - 2 * flyT);
    let x = bezier(eased, flyStartX, flyMidX, flyEndX);
    let y = bezier(eased, flyStartY, flyMidY, flyEndY);
    birdPerch.style.top = Math.round(y) + "px";
    birdPerch.style.left = Math.round(x) + "px";
    birdPerch.style.transform = "translate(0, 0)";

    // Rotate bird to face flight direction
    let nextT = Math.min(flyT + 0.01, 1);
    let nextEased = nextT * nextT * (3 - 2 * nextT);
    let nx = bezier(nextEased, flyStartX, flyMidX, flyEndX);
    let ny = bezier(nextEased, flyStartY, flyMidY, flyEndY);
    let angle = Math.atan2(ny - y, nx - x) * (180 / Math.PI) + 90;
    birdGroup.style.transform = "rotate(" + Math.round(angle) + "deg)";

    if (flyFadeOut && flyT > 0.7) {
        birdPerch.style.opacity = "" + Math.round((1 - (flyT - 0.7) / 0.3) * 100) / 100;
    }
}

// --- Intro (scroll-driven) ---
function handleScroll() {
    let scrollMax = document.body.scrollHeight - window.innerHeight;
    if (scrollMax <= 0) return;
    let scrollProgress = window.scrollY / scrollMax;
    let introProgress = clamp(scrollProgress / INTRO_FRACTION, 0, 1);

    introEl.style.transform = "translate(-50%, " + (-introProgress * 120 - 50) + "%)";
    introEl.style.opacity = 1 - easeIn(introProgress);
    introOverlay.style.opacity = 1 - easeOut(introProgress);

    let scrollHint = document.getElementById("scroll-hint");
    if (scrollHint) scrollHint.style.opacity = 1 - introProgress;

    if (introProgress >= 1 && introActive) {
        introActive = false;
        pageReady = true;
        document.body.style.overflow = "hidden";
        document.body.style.height = "100vh";
        window.scrollTo(0, 0);
        birdPerch.classList.add("visible");
        slipContainer.classList.add("visible");
        nestLink.classList.add("visible");
        setTimeout(function () { hintEl.classList.add("visible"); }, 600);
        introEl.style.display = "none";
        introOverlay.style.display = "none";
        if (scrollHint) scrollHint.style.display = "none";
    }
}

window.addEventListener("scroll", handleScroll);

// --- Nest ---
function createNest() {
    let twigChars = ["~", "~", "~", "\u2212", "~", "\u2212", "~", "~"];
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
            let r = ring.radius + (srand() - 0.5) * 6;
            let x = Math.cos(angle) * r;
            let y = Math.sin(angle) * r * 0.6;
            let t = document.createElement("span");
            t.className = "twig";
            t.textContent = twigChars[Math.floor(srand() * twigChars.length)];
            t.style.fontSize = ring.size + "px";
            t.style.color = twigColors[Math.floor(srand() * twigColors.length)];
            t.style.left = (90 + x) + "px";
            t.style.top = (60 + y) + "px";
            let deg = Math.round((angle * 180 / Math.PI) + 90 + (srand() - 0.5) * 40);
            t.style.setProperty("--base-rot", "rotate(" + deg + "deg)");
            t.style.transform = "rotate(" + deg + "deg)";
            t.style.setProperty("--sx", "" + ((srand() - 0.5) * 2));
            t.style.setProperty("--sy", "" + ((srand() - 0.5) * 1.2));
            let swayDur = 3 + srand() * 2;
            let swayDelay = srand() * 2;
            t.style.animation = "nestSway " + Math.round(swayDur * 10) / 10 + "s ease-in-out " + Math.round(swayDelay * 10) / 10 + "s infinite";
            nestLink.appendChild(t);
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
            t.textContent = "\u2500";
            t.style.fontSize = "12px";
            t.style.color = twigColors[Math.floor(srand() * twigColors.length)];
            t.style.left = (90 + Math.cos(rad) * s.l * 0.3 * i) + "px";
            t.style.top = (60 + Math.sin(rad) * s.l * 0.3 * i * 0.6) + "px";
            t.style.transform = "rotate(" + s.a + "deg)";
            t.style.opacity = "0.45";
            nestLink.appendChild(t);
        }
    }
}

// --- Natural layer (dust + feathers) ---
function createNaturalElements() {
    for (let i = 0; i < 10; i++) {
        let dust = document.createElement("div");
        dust.className = "dust";
        dust.style.left = Math.round(Math.random() * 80 + 10) + "%";
        dust.style.top = Math.round(Math.random() * 70 + 15) + "%";
        let size = Math.round(3 + Math.random() * 3);
        dust.style.width = size + "px";
        dust.style.height = size + "px";
        dust.style.animationDelay = Math.round(Math.random() * 8 * 10) / 10 + "s";
        dust.style.animationDuration = Math.round((8 + Math.random() * 6) * 10) / 10 + "s";
        naturalLayer.appendChild(dust);
    }

    let featherAngles = [15, -10, 30, -20, 5, -35, 22, -8];
    for (let i = 0; i < 8; i++) {
        let feather = document.createElement("div");
        feather.className = i % 3 === 0 ? "feather small" : "feather";
        feather.style.left = Math.round(10 + Math.random() * 75) + "%";
        feather.style.top = Math.round(15 + Math.random() * 65) + "%";
        feather.style.transform = "rotate(" + featherAngles[i] + "deg)";
        feather.style.animationDelay = Math.round(Math.random() * 10 * 10) / 10 + "s";
        feather.style.animationDuration = Math.round((10 + Math.random() * 8) * 10) / 10 + "s";
        naturalLayer.appendChild(feather);
    }
}

// --- Slip interaction ---
function openGroup(index) {
    if (activeGroup >= 0) return;
    activeGroup = index;
    currentPair = 0;
    holdTime = 0;

    document.getElementById("slip-" + index).classList.add("hidden");
    overlayDim.classList.add("visible");
    naturalLayer.classList.add("dimmed");

    activeTitle.textContent = groups[index].title;
    activeDialogue.innerHTML = "";
    activeHint.textContent = "hold to listen";
    activeHint.style.opacity = "1";
    activeSlip.classList.add("visible");

    let colors = ["#f2e2c8", "#ece4c6", "#e2e0da", "#dce0e6"];
    activeSlip.style.background = colors[index];

    birdPerch.classList.add("at-slip");
    birdGroup.classList.add("listening");
    hintEl.classList.remove("visible");
}

function closeGroup() {
    if (activeGroup < 0) return;
    groupsRead[activeGroup] = true;
    let slipEl = document.getElementById("slip-" + activeGroup);
    slipEl.classList.remove("hidden");
    slipEl.classList.add("read");

    if (!slipEl.querySelector(".slip-fold")) {
        let fold = document.createElement("div");
        fold.className = "slip-fold";
        slipEl.appendChild(fold);
    }

    activeSlip.classList.remove("visible");
    overlayDim.classList.remove("visible");
    naturalLayer.classList.remove("dimmed");
    birdGroup.classList.remove("listening");
    birdGroup.classList.remove("bird-react");
    birdPerch.classList.remove("at-slip");
    birdPerch.classList.remove("flying");
    birdFlying = false;
    birdGroup.style.transform = "";

    if (birdFlew) {
        birdPerch.classList.add("returning");
        setTimeout(function () {
            birdPerch.classList.remove("returning");
            birdPerch.style.top = "";
            birdPerch.style.left = "";
            birdPerch.style.transform = "";
            birdPerch.style.opacity = "";
            birdPerch.style.transition = "";
        }, 50);
    } else {
        birdPerch.style.top = "";
        birdPerch.style.left = "";
        birdPerch.style.transform = "";
        birdPerch.style.opacity = "";
        birdPerch.style.transition = "";
    }
    birdFlew = false;
    activeGroup = -1;
    currentPair = 0;
    hintEl.classList.add("visible");

    // Check if all groups read
    let allRead = true;
    for (let i = 0; i < groupsRead.length; i++) {
        if (!groupsRead[i]) { allRead = false; break; }
    }
    if (allRead) naturalLayer.classList.add("after-conversation");
}

function revealNextPair() {
    if (activeGroup < 0) return;
    let group = groups[activeGroup];
    if (currentPair >= group.pairs.length) return;

    let pair = group.pairs[currentPair];
    let el = document.createElement("div");
    el.className = "dialogue-pair";

    if (pair.q === "...") {
        let silEl = document.createElement("div");
        silEl.className = "dialogue-silence";
        silEl.textContent = "...";
        el.appendChild(silEl);
    } else {
        let qEl = document.createElement("div");
        qEl.className = "dialogue-q";
        if (currentPair === 0) {
            let labelQ = document.createElement("span");
            labelQ.className = "speaker-label";
            labelQ.textContent = "villager";
            qEl.appendChild(labelQ);
        }
        qEl.appendChild(document.createTextNode("\u201C" + pair.q + "\u201D"));
        el.appendChild(qEl);

        if (pair.a !== null) {
            let aEl = document.createElement("div");
            aEl.className = "dialogue-a";
            if (currentPair === 0) {
                let labelA = document.createElement("span");
                labelA.className = "speaker-label";
                labelA.textContent = "fisherman";
                aEl.appendChild(labelA);
            }
            aEl.appendChild(document.createTextNode("\u201C" + pair.a + "\u201D"));
            el.appendChild(aEl);
        }
    }

    activeDialogue.appendChild(el);
    setTimeout(function () { el.classList.add("revealed"); }, 50);
    currentPair = currentPair + 1;

    // Bird reacts
    if (!birdFlew) {
        birdGroup.classList.add("bird-react");
        setTimeout(function () { birdGroup.classList.remove("bird-react"); }, 400);
    }

    // Bird might fly away after halfway through (40% chance)
    let threshold = Math.ceil(group.pairs.length / 2);
    if (!birdFlew && currentPair >= threshold && Math.random() < 0.4) {
        birdFlew = true;
        birdPerch.classList.remove("at-slip");
        birdGroup.classList.remove("listening");
        let W = window.innerWidth;
        let H = window.innerHeight;
        let directions = [
            { ex: W + 80, ey: H + 60, mx: 120, my: -80 },
            { ex: -80, ey: H + 60, mx: -100, my: -60 },
            { ex: -80, ey: -60, mx: -80, my: 80 },
            { ex: W + 80, ey: -60, mx: 100, my: 60 }
        ];
        let dir = directions[Math.floor(Math.random() * directions.length)];
        startBirdFlight(dir.ex, dir.ey, dir.mx, dir.my, 2.2);
    }

    activeSlip.scrollTop = activeSlip.scrollHeight;
    activeHint.style.opacity = "0";

    if (currentPair >= group.pairs.length) {
        setTimeout(function () {
            activeHint.textContent = "click to close";
            activeHint.style.opacity = "1";
        }, 800);
    }
}

// --- Input handlers ---
let slips = document.querySelectorAll(".slip");
for (let i = 0; i < slips.length; i++) {
    slips[i].addEventListener("click", function () {
        openGroup(Number(this.getAttribute("data-group")));
    });
}

let spaceDown = false;
document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && !spaceDown) {
        e.preventDefault();
        spaceDown = true;
        if (activeGroup >= 0) { isHolding = true; holdTime = 0; }
    }
});
document.addEventListener("keyup", function (e) {
    if (e.code === "Space") { e.preventDefault(); spaceDown = false; isHolding = false; }
});

document.addEventListener("click", function (e) {
    if (activeGroup < 0) return;
    if (currentPair >= groups[activeGroup].pairs.length) closeGroup();
});

document.addEventListener("mousedown", function (e) {
    if (e.target.tagName === "A") return;
    if (e.target.classList.contains("slip") || e.target.classList.contains("slip-title")) return;
    if (e.target.classList.contains("twig") || e.target.id === "nest-link") return;
    if (activeGroup >= 0 && currentPair < groups[activeGroup].pairs.length) {
        isHolding = true;
        holdTime = 0;
    }
});
document.addEventListener("mouseup", function () { isHolding = false; });

// --- Animation loop ---
let lastTime = 0;

function update(timestamp) {
    if (lastTime === 0) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (isHolding && activeGroup >= 0) {
        holdTime = holdTime + dt;
        if (holdTime >= holdDelay) {
            if (currentPair < groups[activeGroup].pairs.length) {
                revealNextPair();
                holdTime = 0;
            }
        }
    }

    updateBirdFlight(dt);
    requestAnimationFrame(update);
}

// --- Init ---
createNest();
createNaturalElements();
requestAnimationFrame(update);
