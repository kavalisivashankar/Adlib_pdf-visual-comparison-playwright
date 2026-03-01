const { defineConfig } = require('@playwright/test');
// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 180000, // 2 minutes
  reporter: [['list']]
};
