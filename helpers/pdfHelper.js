const fs = require("fs");
const path = require("path");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const { createCanvas } = require("canvas");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch").default;

// Convert PDF to images
async function convertPdfToImages(pdfPath, outputFolder, prefix) {
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  const pdf = await loadingTask.promise;

  const imagePaths = [];
  const orientations = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const imagePath = path.join(outputFolder, `${prefix}-page-${i}.png`);
    fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));

    imagePaths.push(imagePath);

    orientations.push(
      viewport.width > viewport.height ? "Landscape" : "Portrait"
    );
  }

  return {
    imagePaths,
    pageCount: pdf.numPages,
    orientations,
  };
}

// Compare images
function compareImages(img1Path, img2Path, diffPath) {
  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.4 }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return (diffPixels / (width * height)) * 100;
}

module.exports = {
  convertPdfToImages,
  compareImages,
};