let count = 0;

let heatDeathAt = 60;

let body = document.querySelector("body");

let whiteGradient =
    "radial-gradient(circle, rgba(255,255,255,0.38), transparent)";

function beginGenesis() {
    if (body.classList.contains("genesis-started")) {
        return;
    }

    document.querySelector(".hint").classList.add("hint-hidden");
    body.classList.add("genesis-started");
    body.style.cursor = "crosshair";

    let starter = document.querySelector(".starter");
    starter.onclick = null;
    starter.style.pointerEvents = "none";

    let bgm = document.querySelector(".bgm");
    bgm.volume = 0.35;
    bgm.play();

    body.onclick = addCloud;
}

function getRandomChoice(leng) {
    let randomIndex = Math.floor(Math.random() * leng);
    return randomIndex;
}

function applyRandomWarmGradient() {
    // Warm hues: 0-60 (Red to Yellow)
    let hue1 = Math.floor(Math.random() * 60);
    let hue2 = Math.floor(Math.random() * 60);

    // High saturation (70-100%), decent light (50-70%)
    let s1 = Math.floor(Math.random() * 30) + 70;
    let l1 = Math.floor(Math.random() * 20) + 50;

    let s2 = Math.floor(Math.random() * 30) + 70;
    let l2 = Math.floor(Math.random() * 20) + 50;

    let color1 = `hsl(${hue1}, ${s1}%, ${l1}%)`;
    let color2 = `hsl(${hue2}, ${s2}%, ${l2}%)`;

    return `radial-gradient(circle, ${color1}, ${color2})`;
}

function applyRandomColdGradient() {
    // 1. Generate random HSL values for "cold" colors
    // Hue: 180-270 (Cyan to Purple)
    // Saturation: 60-90%
    // Lightness: 50-80% (light, vivid cold)
    let h1 = Math.floor(Math.random() * 90) + 180;
    let s1 = Math.floor(Math.random() * 30) + 60;
    let l1 = Math.floor(Math.random() * 30) + 50;

    let h2 = Math.floor(Math.random() * 90) + 180;
    let s2 = Math.floor(Math.random() * 30) + 60;
    let l2 = Math.floor(Math.random() * 30) + 30;

    let color1 = `hsl(${h1}, ${s1}%, ${l1}%)`;
    let color2 = `hsl(${h2}, ${s2}%, ${l2}%)`;

    return `radial-gradient(circle, ${color1}, ${color2})`;
}

function setInnerColorByCloudIndex(inner, cloudCount) {
    if (cloudCount <= 5) {
        inner.style.background = whiteGradient;
    } else if (cloudCount <= 15) {
        inner.style.background = applyRandomWarmGradient();
    } else if (cloudCount <= 25) {
        inner.style.background = applyRandomColdGradient();
    } else {
        let cPick = getRandomChoice(3);
        if (cPick === 0) {
            inner.style.background = whiteGradient;
        } else if (cPick === 1) {
            inner.style.background = applyRandomWarmGradient();
        } else {
            inner.style.background = applyRandomColdGradient();
        }
    }
}

function cloudSizeMinMax() {
    let vw = body.clientWidth;
    let vh = body.clientHeight;
    let vmin = Math.min(vw, vh);
    let minW = Math.max(24, vmin * 0.09);
    let maxW = Math.min(vmin * 0.68, vw * 0.9, vh * 0.9);
    if (maxW <= minW) {
        maxW = minW + 20;
    }
    return { minW: minW, maxW: maxW };
}

function disturbOneCloud(shell, cloudCount) {
    let limits = cloudSizeMinMax();
    let posAmp = Math.min(6 + count * 1.4, 48);
    let sizeAmp = Math.min(5 + count * 1.0, 40);

    let px = parseFloat(shell.style.getPropertyValue("--px")) || 0;
    let py = parseFloat(shell.style.getPropertyValue("--py")) || 0;
    let dpx = (Math.random() - 0.5) * 2 * posAmp;
    let dpy = (Math.random() - 0.5) * 2 * posAmp;
    shell.style.setProperty("--px", px + dpx + "px");
    shell.style.setProperty("--py", py + dpy + "px");

    let w = parseFloat(shell.style.width) || limits.minW;
    let dw = (Math.random() - 0.5) * 2 * sizeAmp;
    let newW = w + dw;
    if (newW < limits.minW) {
        newW = limits.minW;
    }
    if (newW > limits.maxW) {
        newW = limits.maxW;
    }
    shell.style.width = newW + "px";
    shell.style.height = newW + "px";

    let inner = shell.querySelector(".blob-inner");
    if (cloudCount <= 5) {
        return;
    }
    setInnerColorByCloudIndex(inner, cloudCount);
}

function disturbAllClouds() {
    document.querySelectorAll(".cloud").forEach(function (shell, i) {
        disturbOneCloud(shell, i + 1);
    });
}

function dieOneCloud(shell) {
    let x = parseFloat(shell.style.left) || 0;
    let y = parseFloat(shell.style.top) || 0;
    let w = parseFloat(shell.style.width) || 0;
    let centerX = x + w / 2;
    let centerY = y + w / 2;
    let targetX = body.clientWidth / 2 - centerX;
    let targetY = body.clientHeight / 2 - centerY;
    shell.style.setProperty("--toCenterX", targetX + "px");
    shell.style.setProperty("--toCenterY", targetY + "px");
    shell.classList.add("dying");
}

function heatDeath() {
    if (body.classList.contains("heat-death")) {
        return;
    }
    body.classList.add("heat-death");

    body.onclick = null;
    body.style.cursor = "default";

    document.querySelectorAll(".cloud").forEach(dieOneCloud);

    document.querySelector(".starter").classList.add("dying");

    let bgm = document.querySelector(".bgm");

    setTimeout(function () {
        bgm.volume = 0;
        bgm.pause();
    }, 5000);

    setTimeout(function () {
        document.querySelectorAll(".cloud").forEach(function (shell) {
            shell.remove();
        });
        document.querySelector(".starter").remove();
    }, 7000);
}

function addCloud() {
    count += 1;

    let limits = cloudSizeMinMax();
    let size = limits.minW + Math.random() * (limits.maxW - limits.minW);
    
    let maxX = Math.max(0, body.clientWidth - size);
    let maxY = Math.max(0, body.clientHeight - size);
    let x = Math.random() * maxX;
    let y = Math.random() * maxY;
    let blur = 18 + Math.random() * 55;
    let opacity = 0.12 + Math.random() * 0.38;

    let blob = document.createElement("div");
    blob.className = "blob cloud";
    blob.style.left = x + "px";
    blob.style.top = y + "px";
    blob.style.width = size + "px";
    blob.style.height = size + "px";

    let inner = document.createElement("div");
    inner.className = "blob-inner";
    inner.style.opacity = opacity;
    inner.style.filter = "blur(" + blur + "px)";

    if (count <= 5) {
        setInnerColorByCloudIndex(inner, count);
        inner.classList.add("pulse-cold");
    } else if (count <= 15) {
        inner.classList.add("pulse-warm");
    } else {
        inner.classList.add("pulse-chaos");
    }

    blob.append(inner);

    blob.style.zIndex = String(1 + Math.floor(Math.random() * 8));

    let driftMag = Math.min(46 + count * 1.2, 120);
    let dx = (Math.random() - 0.5) * 2 * driftMag;
    let dy = (Math.random() - 0.5) * 2 * driftMag;
    let dur = Math.max(22 - count * 0.4, 4) + Math.random() * 4;
    blob.style.setProperty("--px", "0px");
    blob.style.setProperty("--py", "0px");
    blob.style.setProperty("--dx", dx + "px");
    blob.style.setProperty("--dy", dy + "px");
    blob.style.setProperty("--dur", dur + "s");

    body.append(blob);
    disturbAllClouds();

    document.querySelectorAll(".cloud").forEach(function (b) {
        b.style.pointerEvents = "none";
    });

    if (count === heatDeathAt) {
        heatDeath();
    }
}

document.querySelector(".starter").onclick = beginGenesis;
