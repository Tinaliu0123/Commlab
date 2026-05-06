// --- Text content ---
let openingText = "I have searched again, and again I have failed.";

let paragraphs = [
    {
        id: "para1",
        segments: [
            {text: "Three years ago a fisherman told me, half-drunk, about a place hidden in the mountains. A village no dynasty has ever touched. I have refused to serve corrupt courts my whole life. When he spoke, I knew this place was meant for me to find.\nHe said the entrance came by accident: at the base of the mountain, a "},
            {keyword: "cave", id: "kw-cave"},
            {text: " — barely wide enough for one body. He squeezed through sideways, stone pressing against his chest and back, in darkness for what felt like an eternity. Then the stone gave way to light."}
        ]
    },
    {
        id: "para2",
        segments: [
            {text: "What lay beyond is open fields, neat houses, mulberry and bamboo along the edges. Chickens calling between yards. Old men in shade. Children laughing at nothing. A "},
            {keyword: "village", id: "kw-village"},
            {text: " where nothing needed fixing."}
        ]
    },
    {
        id: "para3",
        segments: [
            {text: "They welcomed him. Killed a chicken, poured ale. They "},
            {keyword: "talked", id: "kw-talked"},
            {text: " a lot and asked him what dynasty it was now. When he told them what the world had become, they went quiet. Then someone refilled his cup and said only: this place is not worth mentioning to outside."}
        ]
    },
    {
        id: "para4",
        segments: [
            {text: "Of course he mentioned it. And on his way out, he left "},
            {keyword: "marks", id: "kw-marks"},
            {text: ". A blaze on this tree, a strip of cloth on that branch. I followed every one. They led me to the mountain, but the rock was sealed. No opening, nothing."}
        ]
    },
    {
        id: "para5",
        segments: [
            {text: "On the third evening I sat against the cliff and watched a small "},
            {keyword: "bird", id: "kw-bird"},
            {text: " land above me. It tilted its head and disappeared into the rock. A moment later I heard it singing from the other side.\nIt comes and goes freely. I cannot follow."}
        ]
    }
];

let worldPages = {
    "kw-cave": "cave.html",
    "kw-village": "village.html",
    "kw-talked": "talked.html",
    "kw-marks": "marks.html",
    "kw-bird": "bird.html"
};

let currentParagraph = 0;
let isTyping = false;
let inBirdView = false;

// --- Typewriter effect ---
function typeText(container, text, done) {
    isTyping = true;
    let charIndex = 0;
    let textSpan = document.createElement("span");
    container.append(textSpan);
    let cursor = document.createElement("span");
    cursor.classList.add("cursor");
    cursor.innerText = "|";
    container.append(cursor);

    function typeNext() {
        if (charIndex < text.length) {
            let char = text[charIndex];
            textSpan.innerText = textSpan.innerText + char;
            charIndex++;
            let delay = 40; // for temporary test!
            if (char === "\n") {
                delay = 300;
            } else if (char === "." || char === ",") {
                delay = 120;
            }
            setTimeout(typeNext, delay);
        } else {
            cursor.remove();
            isTyping = false;
            if (done) done();
        }
    }
    typeNext();
}

// --- Type a paragraph with keyword segments ---
function typeParagraph(paraData, done) {
    let container = document.querySelector("#" + paraData.id);
    container.classList.remove("hidden");
    let segmentIndex = 0;

    function typeNextSegment() {
        if (segmentIndex < paraData.segments.length) {
            let segment = paraData.segments[segmentIndex];
            segmentIndex++;
            if (segment.text) {
                typeText(container, segment.text, typeNextSegment);
            } else if (segment.keyword) {
                let kwSpan = document.createElement("span");
                kwSpan.className = "keyword";
                kwSpan.id = segment.id;
                container.append(kwSpan);
                typeText(kwSpan, segment.keyword, typeNextSegment);
            }
        } else {
            if (done) done();
        }
    }
    typeNextSegment();
}

function showSignature() {
    let sig = document.querySelector("#signature");
    sig.classList.add("visible");
}

function activateKeyword(keywordId) {
    let kw = document.querySelector("#" + keywordId);
    if (kw) {
        kw.classList.add("active");
        kw.addEventListener("click", function() {
            if (isTyping) return;
            if (!kw.classList.contains("active")) return;
            kw.classList.remove("active");
            kw.classList.add("completed");
            if (keywordId === "kw-bird") {
                window.location.href = worldPages[keywordId];
            } else {
                showNextParagraph();
            }
        });
    }
}

function showNextParagraph() {
    if (currentParagraph < paragraphs.length) {
        let para = paragraphs[currentParagraph];
        currentParagraph++;
        typeParagraph(para, function() {
            activateKeyword(para.segments[1].id);
            if (para.id === "para5") showSignature();
        });
    }
}

function startLetter() {
    let opening = document.querySelector("#opening");
    typeText(opening, openingText, function() {
        setTimeout(showNextParagraph, 1500);
    });
}

startLetter();
