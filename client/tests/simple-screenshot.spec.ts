import { test, chromium } from '@playwright/test';

test('take screenshot of current state', async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'current-state.png', fullPage: true });
  console.log('Screenshot saved as current-state.png');
  
  // Check console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });
  
  await page.waitForTimeout(5000);
  await browser.close();
});