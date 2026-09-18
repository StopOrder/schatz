// 수정 금지(AGENTS.md). 테스트는 file:// 로 index.html 을 연다.
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
  },
});
