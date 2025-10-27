import { test, chromium } from '@playwright/test';

test('test new flush layout after login', async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Click Demo Facilitator button
  await page.locator('text=Demo Facilitator').click();
  await page.waitForTimeout(3000);
  
  // Take screenshot of the new layout
  await page.screenshot({ path: 'new-flush-layout.png', fullPage: true });
  console.log('Screenshot saved as new-flush-layout.png');
  
  // Measure the layout
  const measurements = await page.evaluate(() => {
    // Find sidebar (should be 256px wide)
    const sidebar = document.querySelector('.w-64');
    // Find main content area
    const mainArea = document.querySelector('.flex-1.flex.flex-col');
    
    if (sidebar && mainArea) {
      const sidebarRect = sidebar.getBoundingClientRect();
      const mainRect = mainArea.getBoundingClientRect();
      
      return {
        sidebarWidth: sidebarRect.width,
        sidebarLeft: sidebarRect.left,
        mainContentWidth: mainRect.width,
        mainContentLeft: mainRect.left,
        viewportWidth: window.innerWidth,
        totalUsedWidth: sidebarRect.width + mainRect.width
      };
    }
    return null;
  });
  
  console.log('Layout measurements:', measurements);
  
  // Try to navigate to rubric creation
  try {
    const rubricButton = page.locator('text=Rubric Creation').first();
    if (await rubricButton.isVisible()) {
      await rubricButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'rubric-page-new-layout.png', fullPage: true });
      
      // Click focused view if available
      const focusedBtn = page.locator('button:has-text("Focused View")').first();
      if (await focusedBtn.isVisible()) {
        await focusedBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'rubric-focused-new-layout.png', fullPage: true });
      }
    }
  } catch (e) {
    console.log('Could not navigate to rubric:', e);
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
});