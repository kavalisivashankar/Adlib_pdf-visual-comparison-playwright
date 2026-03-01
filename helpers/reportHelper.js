const fs = require("fs");
const path = require("path");

// -------------------------------
// Generate HTML report for PDF comparison results
// -------------------------------
function generateHtmlReport(results) {
    // Start HTML document with basic styling
  let html = `<html>
  <head>
    <title>PDF Comparison Report</title>
    <style>
      body { font-family: Arial; }
      img { width: 250px; }  /* Make images small enough to display side-by-side */
      .pass { color: green; } /* Green for PASS */
      .fail { color: red; } /* Red for FAIL */
    </style>
  </head>
  <body>
    <h1>PDF Comparison Report</h1>`;

  results.forEach(result => {
    html += `<div>
      <h2>${result.pairName}</h2>
      <p>Status: <span class="${result.status.toLowerCase()}">${result.status}</span></p>`;

    result.visualDifferences.forEach(diff => {
      html += `<table>
        <tr>
          <th>Baseline</th><th>Output</th><th>Diff</th>
        </tr>
        <tr>
        <!-- Use absolute paths so images display correctly in browser -->
          <td><img src="file://${path.resolve(diff.baselineImage)}" /></td>
          <td><img src="file://${path.resolve(diff.outputImage)}" /></td>
          <td><img src="file://${path.resolve(diff.diffImage)}" /></td>
        </tr>
      </table>`;
    });

    html += `</div>`; // End of PDF pair section
  });

  html += `</body></html>`;
  // Write the final HTML report to results folder
  fs.writeFileSync("results/report.html", html);
}
// Export function to be used in the main test script
module.exports = { generateHtmlReport };