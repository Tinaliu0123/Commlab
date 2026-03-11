const colorArray = [
  "#609DBE", // very light cyan
  "#8BB8D0", // bright cyan
  "#89D1B0", // turquoise
  "#C5EC98", // lime yellow
  "#FEF99A", // vivid yellow
  "#FED271", // peach orange
  "#FDA55E", // coral
  "#FE7434", // bright pink
];

function setup() {
  createCanvas(1000, 1000);
  background(200);

  let noiseScale = 0.0046;
  noiseSeed(22);

  for (let y = 0; y < height; y += 0.5) {
    for (let x = 0; x < width; x += 0.5) {
      // positions of patches
      let nx = noiseScale * (1000 + x);
      let ny = noiseScale * (1000 + y);

      const mappedIndex = map(
        noise(nx, ny),
        0.05,
        0.8,
        0,
        colorArray.length
      );
      let nearestIndex = constrain(floor(mappedIndex), 0, colorArray.length - 1);
      let c = colorArray[nearestIndex];

      fill(c);
      noStroke();
      circle(x, y, 1);
    }
  }

  describe('A gray cloudy pattern.');
}

function keyPressed() {
  let t = Date.now();
  saveCanvas(t + '.jpg');
} 