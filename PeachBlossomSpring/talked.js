// ===============================
//  DIALOGUE DATA
// ===============================

let dialogues = [
    {
        question: "You \u2014 where did you come from! We haven\u2019t seen a new face in... longer than I can say. Sit, sit! Have you eaten?",
        answer: "I came from downstream. Got lost following the river."
    },
    {
        question: "Here, here \u2014 chicken, and the ale is fresh. My wife brewed it yesterday. Eat as much as you want, we have plenty!",
        answer: "Thank you. It\u2019s been a while since I sat at a table like this."
    },
    {
        question: "Our grandparents\u2019 grandparents came here during the Qin wars \u2014 we have been here ever since! Tell us, what dynasty is it now?",
        answer: "Jin. There have been three since Qin."
    },
    {
        question: "Three! How does that happen?",
        answer: "Wars, mostly. The new one wins, changes the name, taxes the same people."
    },
    {
        question: "Do people still grow rice outside? Mulberry? We\u2019ve always had enough here...",
        answer: "They grow what they\u2019re allowed to keep. A lot goes to the army."
    },
    {
        question: "And the markets \u2014 are there still markets? Our grandfather used to talk about the big ones, hundreds of stalls!",
        answer: "There are markets. Smaller now. People sell what they have to."
    },
    {
        question: "What about festivals? We still do ours every autumn \u2014 does the outside still celebrate?",
        answer: "When there\u2019s enough food for it."
    },
    {
        question: "Do neighbors visit each other? Here we eat at a different house every night, just to talk!",
        answer: "People mostly keep doors closed. It\u2019s safer."
    },
    {
        question: "...Safer from what?",
        answer: "Soldiers. Bandits. Tax collectors. Depends on the year."
    },
    {
        question: null,
        answer: null
    },
    {
        question: "...You should stay a few more days. Rest. Eat well before you go back to all that.",
        answer: "I\u2019d like that."
    },
    {
        question: "And when you leave \u2014 there is nothing here worth mentioning to anyone out there.",
        answer: null
    }
];

// ===============================
//  STATE
// ===============================

let currentExchange = 0;
let isHolding = false;
let holdTime = 0;
let questionRevealed = false;
let answerRevealed = false;
let introActive = true;
let pageReady = false;
let exchangeEls = [];
let conversationDone = false;

// Timing
let questionDelay = 0.5;
let answerDelay = 1.8;

// Temperature (warm parchment to cool parchment)
let warmBg = { r: 237, g: 232, b: 223 };
let coldBg = { r: 218, g: 222, b: 228 };

// Intro
let INTRO_FRACTION = 0.15;

// Push positions for ripple (x%, y% offset from center)
let pushPositions = [
    { x: -35, y: -30 },
    { x: 30, y: 35 },
    { x: -40, y: 25 },
    { x: 35, y: -35 },
    { x: -30, y: -40 },
    { x: 40, y: 28 },
    { x: -38, y: 32 },
    { x: 32, y: -28 },
    { x: -28, y: -35 },
    { x: 36, y: 30 },
    { x: -32, y: 38 },
    { x: 28, y: -32 }
];

// ===============================
//  ELEMENTS
// ===============================

let introEl = document.getElementById("intro-text");
let introOverlay = document.getElementById("intro-overlay");
let birdPerch = document.getElementById("bird-perch");
let birdGroup = document.getElementById("bird-group");
let dialogueContainer = document.getElementById("dialogue-container");
let naturalLayer = document.getElementById("natural-layer");
let humanLayer = document.getElementById("human-layer");
let hintEl = document.getElementById("hint");

// ===============================
//  UTILITIES
// ===============================

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(v, min, max) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}

function easeIn(t) { return t * t; }
function easeOut(t) { return 1 - (1 - t) * (1 - t); }

// ===============================
//  INTRO (scroll-driven)
// ===============================

function handleScroll() {
    let scrollMax = document.body.scrollHeight - window.innerHeight;
    if (scrollMax <= 0) return;
    let scrollProgress = window.scrollY / scrollMax;
    let introProgress = clamp(scrollProgress / INTRO_FRACTION, 0, 1);

    let introY = -introProgress * 120;
    let introAlpha = 1 - easeIn(introProgress);
    introEl.style.transform = "translate(-50%, " + (introY - 50) + "%)";
    introEl.style.opacity = introAlpha;

    introOverlay.style.opacity = 1 - easeOut(introProgress);

    let scrollHint = document.getElementById("scroll-hint");
    if (scrollHint) {
        scrollHint.style.opacity = 1 - introProgress;
    }

    if (introProgress >= 1 && introActive) {
        introActive = false;
        pageReady = true;
        document.body.style.overflow = "hidden";
        document.body.style.height = "100vh";
        window.scrollTo(0, 0);
        birdPerch.classList.add("visible");
        dialogueContainer.classList.add("visible");
        hintEl.classList.add("visible");
        document.querySelector(".back-btn").classList.add("visible");
        introEl.style.display = "none";
        introOverlay.style.display = "none";
        if (scrollHint) scrollHint.style.display = "none";
    }
}

window.addEventListener("scroll", handleScroll);

// ===============================
//  NATURAL LAYER (bird's space)
// ===============================

function createNaturalElements() {
    // Floating dust motes
    for (let i = 0; i < 15; i++) {
        let dust = document.createElement("div");
        dust.className = "dust";
        dust.style.left = Math.round(Math.random() * 90 + 5) + "%";
        dust.style.top = Math.round(Math.random() * 80 + 10) + "%";
        let size = Math.round(3 + Math.random() * 4);
        dust.style.width = size + "px";
        dust.style.height = size + "px";
        dust.style.animationDelay = Math.round(Math.random() * 6 * 10) / 10 + "s";
        dust.style.animationDuration = Math.round((8 + Math.random() * 6) * 10) / 10 + "s";
        naturalLayer.appendChild(dust);
    }

    // A few feather-like marks
    let featherChars = ["~", "\u2013", "\u00b7", "~", "\u2013", "\u00b7", "~", "\u2013"];
    for (let i = 0; i < 8; i++) {
        let feather = document.createElement("div");
        feather.className = "feather";
        feather.textContent = featherChars[i];
        feather.style.left = Math.round(15 + Math.random() * 70) + "%";
        feather.style.top = Math.round(15 + Math.random() * 70) + "%";
        feather.style.animationDelay = Math.round(Math.random() * 8 * 10) / 10 + "s";
        feather.style.animationDuration = Math.round((10 + Math.random() * 8) * 10) / 10 + "s";
        naturalLayer.appendChild(feather);
    }
}

// Natural elements use CSS animation, JS only handles post-conversation dim
function dimNatural() {
    naturalLayer.classList.add("after-conversation");
}

// ===============================
//  DIALOGUE REVEAL (ripple)
// ===============================

function getTemperatureClass(index) {
    if (index <= 2) return "temp-warm";
    if (index <= 5) return "temp-cooling";
    if (index <= 8) return "temp-cold";
    return "temp-frozen";
}

function createExchangeEl(index) {
    let data = dialogues[index];
    let el = document.createElement("div");
    el.className = "exchange";
    el.classList.add(getTemperatureClass(index));

    if (data.question === null && data.answer === null) {
        el.classList.add("silence");
        return el;
    }

    if (data.question !== null) {
        let qEl = document.createElement("div");
        qEl.className = "question";
        qEl.textContent = data.question;
        el.appendChild(qEl);
    }

    if (data.answer !== null) {
        let aEl = document.createElement("div");
        aEl.className = "answer";
        aEl.textContent = data.answer;
        el.appendChild(aEl);
    }

    return el;
}

function pushOldExchanges() {
    for (let i = 0; i < exchangeEls.length; i++) {
        let el = exchangeEls[i];
        let pos = pushPositions[i % pushPositions.length];
        let scale = 0.6 - (exchangeEls.length - 1 - i) * 0.05;
        if (scale < 0.3) scale = 0.3;
        el.style.transform = "translate(calc(-50% + " + pos.x + "vw), calc(-50% + " + pos.y + "vh)) scale(" + scale + ")";
        el.classList.add("pushed");
    }
}

function revealQuestion() {
    if (currentExchange >= dialogues.length) return;

    // Push all existing exchanges outward
    pushOldExchanges();

    let el = createExchangeEl(currentExchange);
    dialogueContainer.appendChild(el);
    exchangeEls.push(el);

    // New exchange appears at center
    setTimeout(function () {
        el.classList.add("revealed");
    }, 100);

    questionRevealed = true;
}

function revealAnswer() {
    if (currentExchange >= dialogues.length) return;

    let data = dialogues[currentExchange];
    if (data.answer === null) {
        answerRevealed = true;
        return;
    }

    let lastExchange = exchangeEls[exchangeEls.length - 1];
    if (!lastExchange) return;

    let answerEl = lastExchange.querySelector(".answer");
    if (answerEl) {
        answerEl.classList.add("revealed");
    }

    answerRevealed = true;
    updateTemperature();
}

function advanceExchange() {
    currentExchange = currentExchange + 1;
    questionRevealed = false;
    answerRevealed = false;
    holdTime = 0;

    // Check if conversation is done
    if (currentExchange >= dialogues.length && !conversationDone) {
        conversationDone = true;
        dimNatural();
    }
}

// ===============================
//  TEMPERATURE
// ===============================

function updateTemperature() {
    let progress = currentExchange / (dialogues.length - 1);
    let r = Math.round(lerp(warmBg.r, coldBg.r, progress));
    let g = Math.round(lerp(warmBg.g, coldBg.g, progress));
    let b = Math.round(lerp(warmBg.b, coldBg.b, progress));
    document.body.style.background = "rgb(" + r + "," + g + "," + b + ")";
}

// ===============================
//  HOLD LOGIC
// ===============================

function onHoldStart() {
    if (!pageReady) return;
    if (currentExchange >= dialogues.length) return;
    isHolding = true;
    holdTime = 0;
    birdGroup.classList.add("listening");
    naturalLayer.classList.add("dimmed");
    humanLayer.classList.add("active");
    dialogueContainer.classList.add("focused");
}

function onHoldEnd() {
    if (!pageReady) return;
    isHolding = false;
    birdGroup.classList.remove("listening");
    naturalLayer.classList.remove("dimmed");
    humanLayer.classList.remove("active");
    dialogueContainer.classList.remove("focused");

    if (answerRevealed) {
        advanceExchange();
    }
}

// ===============================
//  INPUT HANDLERS
// ===============================

let spaceDown = false;

document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && !spaceDown) {
        e.preventDefault();
        spaceDown = true;
        onHoldStart();
    }
});

document.addEventListener("keyup", function (e) {
    if (e.code === "Space") {
        e.preventDefault();
        spaceDown = false;
        onHoldEnd();
    }
});

document.addEventListener("mousedown", function (e) {
    if (e.target.tagName === "A") return;
    onHoldStart();
});

document.addEventListener("mouseup", function () {
    onHoldEnd();
});

// ===============================
//  ANIMATION LOOP
// ===============================

let lastTime = 0;

function update(timestamp) {
    if (lastTime === 0) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Hold logic
    if (isHolding && pageReady && currentExchange < dialogues.length) {
        holdTime = holdTime + dt;

        if (!questionRevealed && holdTime >= questionDelay) {
            revealQuestion();
        }

        if (questionRevealed && !answerRevealed && holdTime >= answerDelay) {
            revealAnswer();
        }
    }

    requestAnimationFrame(update);
}

// ===============================
//  INIT
// ===============================

createNaturalElements();
requestAnimationFrame(update);
