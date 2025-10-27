import { test, chromium } from '@playwright/test';

test('verify new flush layout', async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Join as facilitator
  await page.fill('input[type="email"]', 'facilitator@test.com');
  await page.fill('input[name="name"]', 'Test Facilitator');
  await page.locator('label:has-text("Facilitator")').click();
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);
  
  // Take screenshot of main layout
  await page.screenshot({ path: 'new-layout-main.png', fullPage: true });
  
  // Navigate to rubric creation
  const rubricLink = page.locator('text=Rubric Creation').first();
  if (await rubricLink.isVisible()) {
    await rubricLink.click();
    await page.waitForTimeout(2000);
    
    // Switch to focused view
    const focusedBtn = page.locator('button:has-text("Focused View")');
    if (await focusedBtn.isVisible()) {
      await focusedBtn.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'new-layout-rubric-focused.png', fullPage: true });
  }
  
  // Measure layout dimensions
  const measurements = await page.evaluate(() => {
    const sidebar = document.querySelector('.w-64');
    const mainContent = document.querySelector('.flex-1.flex.flex-col');
    
    return {
      sidebarWidth: sidebar?.getBoundingClientRect().width,
      mainContentWidth: mainContent?.getBoundingClientRect().width,
      viewportWidth: window.innerWidth,
      mainContentLeft: mainContent?.getBoundingClientRect().left
    };
  });
  
  console.log('Layout measurements:', measurements);
  
  await page.waitForTimeout(5000);
  await browser.close();
});