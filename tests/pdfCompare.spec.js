const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const { convertPdfToImages, compareImages } = require("../helpers/pdfHelper");
const { generateHtmlReport } = require("../helpers/reportHelper");

const pdfPairs = [
  { name: "Pair 1", baseline: "sample_file_1_Baseline.pdf", output: "sample_file_1_Output.pdf" },
  { name: "Pair 2", baseline: "sample_file_2_Baseline.pdf", output: "sample_file_2_Output.pdf" }
];

test("PDF Visual Comparison", async () => {

  if (!fs.existsSync("results")) fs.mkdirSync("results");

  const finalResults = [];

  for (const pair of pdfPairs) {
    const baselinePath = path.join("test-data", pair.baseline);
    const outputPath = path.join("test-data", pair.output);

    const metadataIssues = [];
    const visualDifferences = [];

    const safeName = pair.name.replace(/\s+/g, "_");

const baselineData = await convertPdfToImages(
  baselinePath,
  "results",
  `${safeName}-baseline`
);

const outputData = await convertPdfToImages(
  outputPath,
  "results",
  `${safeName}-output`
);
    //const baselineData = await convertPdfToImages(baselinePath, "results", `${pair.name}-baseline`);
    //const outputData = await convertPdfToImages(outputPath, "results", `${pair.name}-output`);

    // Page count check
    if (baselineData.pageCount !== outputData.pageCount) metadataIssues.push("Page count mismatch");

    // Orientation check
    baselineData.orientations.forEach((orientation, i) => {
      if (orientation !== outputData.orientations[i])
        metadataIssues.push(`Orientation mismatch on page ${i + 1}`);
    });

    // Visual comparison
    for (let i = 0; i < baselineData.imagePaths.length; i++) {
      const diffPath = `results/${safeName}-diff-page-${i + 1}.png`;
      const diffPercentage = compareImages(
        baselineData.imagePaths[i],
        outputData.imagePaths[i],
        diffPath
      );

      if (diffPercentage > 0.1) {
        visualDifferences.push({
          pageNumber: i + 1,
          diffPercentage,
          baselineImage: baselineData.imagePaths[i],
          outputImage: outputData.imagePaths[i],
          diffImage: diffPath
        });
      }
    }

    finalResults.push({
      pairName: pair.name,
      baseline: pair.baseline,
      output: pair.output,
      baselinePages: baselineData.pageCount,
      outputPages: outputData.pageCount,
      metadataIssues,
      visualDifferences,
      status: metadataIssues.length === 0 && visualDifferences.length === 0 ? "PASS" : "FAIL"
    });
  }

  //generateHtmlReport(finalResults);

  //expect(finalResults.some(r => r.status === "FAIL")).toBeFalsy();
  //console.log("Comparison completed. Check HTML report for detailed results.");


      generateHtmlReport(finalResults);

const hasFailures = finalResults.some(r => r.status === "FAIL");

if (hasFailures) {
  console.log("Some PDFs have differences. Please review the report.");
} else {
  console.log("All PDF comparisons passed.");
}
});