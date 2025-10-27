import { test, chromium } from '@playwright/test';

test('check responsive rubric layout', async () => {
  const browser = await chromium.launch({ 
    headless: false
  });
  
  const page = await browser.newPage();
  
  // Test different viewport sizes
  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop HD' },
    { width: 1440, height: 900, name: 'Laptop' },
    { width: 1280, height: 800, name: 'Small Laptop' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Join as facilitator
    await page.fill('input[type="email"]', 'facilitator@test.com');
    await page.fill('input[name="name"]', 'Test Facilitator');
    await page.locator('label:has-text("Facilitator")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    
    // Navigate to rubric creation
    const rubricLink = page.locator('text=Rubric Creation').first();
    if (await rubricLink.isVisible()) {
      await rubricLink.click();
    }
    
    await page.waitForTimeout(1000);
    
    // Switch to focused view
    const focusedBtn = page.locator('button:has-text("Focused View")');
    if (await focusedBtn.isVisible()) {
      await focusedBtn.click();
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: `rubric-${viewport.name.replace(' ', '-').toLowerCase()}.png`, 
      fullPage: false 
    });
    
    console.log(`Screenshot saved for ${viewport.name}`);
  }
  
  // Keep last viewport open for inspection
  await page.waitForTimeout(10000);
  
  await browser.close();
});