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

  const imagePaths = []; // Stores paths of generated page images
  const orientations = []; // Stores page orientations (Landscape/Portrait)

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    // Scale the page for better image quality
    const viewport = page.getViewport({ scale: 1.5 });
  // Create a canvas to render the PDF page
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Save canvas as PNG image
    const imagePath = path.join(outputFolder, `${prefix}-page-${i}.png`);
    fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));

    // Track image paths and orientation
    imagePaths.push(imagePath);

    orientations.push(
      viewport.width > viewport.height ? "Landscape" : "Portrait"
    );
  }
 // Return all page images, count, and orientations
  return {
    imagePaths,
    pageCount: pdf.numPages,
    orientations,
  };
}

// Compare images
// -------------------------------
// Compare two images and generate a diff
// -------------------------------
function compareImages(img1Path, img2Path, diffPath) {
  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  // Compare pixel by pixel
  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.01 } // Small differences ignored
  );

   // Save diff image highlighting differences
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
// Return percentage of differing pixels
  return (diffPixels / (width * height)) * 100;
}
// Export functions for use in tests
module.exports = {
  convertPdfToImages,
  compareImages,
};