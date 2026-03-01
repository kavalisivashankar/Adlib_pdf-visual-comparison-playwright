const fs = require("fs");
const path = require("path");

function generateHtmlReport(results) {
  let html = `<html>
  <head>
    <title>PDF Comparison Report</title>
    <style>
      body { font-family: Arial; }
      img { width: 250px; }
      .pass { color: green; }
      .fail { color: red; }
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
          <td><img src="file://${path.resolve(diff.baselineImage)}" /></td>
          <td><img src="file://${path.resolve(diff.outputImage)}" /></td>
          <td><img src="file://${path.resolve(diff.diffImage)}" /></td>
        </tr>
      </table>`;
    });

    html += `</div>`;
  });

  html += `</body></html>`;
  fs.writeFileSync("results/report.html", html);
}

module.exports = { generateHtmlReport };