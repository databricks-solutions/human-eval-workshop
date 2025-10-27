import { test, expect, chromium } from '@playwright/test';

test('check rubric focused view layout', async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Navigate directly
  await page.goto('http://localhost:3000');
  
  // Wait for React to load
  await page.waitForTimeout(2000);
  
  // Navigate to rubric creation (adjust selectors as needed)
  // This is a simplified version - you may need to adjust based on actual navigation
  await page.getByText('Join Workshop').waitFor({ state: 'visible' });
  
  // Take screenshots of the layout
  await page.screenshot({ path: 'rubric-layout-full.png', fullPage: true });
  
  // Try to navigate to focused view if possible
  // This depends on your app's navigation structure
  
  console.log('Screenshots saved to rubric-layout-full.png');
  
  // Keep browser open for manual inspection
  await page.waitForTimeout(30000);
  
  await browser.close();
});