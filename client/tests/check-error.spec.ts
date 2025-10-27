import { test, chromium } from '@playwright/test';

test('check for errors in new layout', async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });
  
  // Navigate
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Take screenshot of current state
  await page.screenshot({ path: 'layout-error-check.png', fullPage: true });
  
  // Try to join as facilitator
  try {
    await page.fill('input[type="email"]', 'facilitator@test.com');
    await page.fill('input[name="name"]', 'Test Facilitator');
    await page.locator('label:has-text("Facilitator")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    
    // Take screenshot after login
    await page.screenshot({ path: 'layout-after-login.png', fullPage: true });
    
    // Try to navigate to rubric creation
    const rubricLink = page.locator('text=Rubric Creation').first();
    if (await rubricLink.isVisible()) {
      await rubricLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'rubric-page.png', fullPage: true });
    }
  } catch (error) {
    console.error('Error during navigation:', error);
  }
  
  // Keep open for inspection
  await page.waitForTimeout(10000);
  
  await browser.close();
});