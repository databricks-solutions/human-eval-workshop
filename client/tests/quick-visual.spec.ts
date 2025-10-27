import { test, chromium } from '@playwright/test';

test('check rubric layout as facilitator', async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  
  // Navigate and join as facilitator
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  // Fill form as facilitator
  await page.fill('input[type="email"]', 'facilitator@test.com');
  await page.fill('input[name="name"]', 'Demo Facilitator');
  
  // Click Facilitator role
  await page.locator('label:has-text("Facilitator")').click();
  
  // Submit form
  await page.locator('button[type="submit"]').click();
  
  await page.waitForTimeout(2000);
  
  // Now navigate through the workshop - facilitator should see all phases
  // Try clicking on Rubric Creation if visible
  const rubricPhase = page.locator('text=Rubric Creation').first();
  if (await rubricPhase.isVisible()) {
    await rubricPhase.click();
    console.log('Clicked on Rubric Creation phase');
  } else {
    // If not visible, try Start Workshop first
    const startBtn = page.locator('button:has-text("Start Workshop")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(1000);
      
      // Then try rubric creation
      await page.locator('text=Rubric Creation').first().click();
    }
  }
  
  await page.waitForTimeout(2000);
  
  // Switch to focused view
  const focusedBtn = page.locator('button:has-text("Focused View")');
  if (await focusedBtn.isVisible()) {
    await focusedBtn.click();
    console.log('Switched to Focused View');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'rubric-layout.png', fullPage: true });
  
  // Measure widths
  const measurements = await page.evaluate(() => {
    const container = document.querySelector('.max-w-6xl');
    const focusedView = document.querySelector('[class*="flex gap-6"]');
    
    return {
      containerWidth: container?.getBoundingClientRect().width,
      focusedViewWidth: focusedView?.getBoundingClientRect().width,
      viewportWidth: window.innerWidth,
      bodyWidth: document.body.clientWidth
    };
  });
  
  console.log('Layout measurements:', measurements);
  
  // Keep open
  console.log('Keeping browser open for inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
});