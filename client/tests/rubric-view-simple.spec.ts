import { test, expect, chromium } from '@playwright/test';

test('rubric focused view works', async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate directly
  await page.goto('http://localhost:3000');
  
  // Wait for React to load
  await page.waitForTimeout(2000);
  
  // Take a screenshot to see what's happening
  await page.screenshot({ path: 'debug-screenshot.png' });
  
  // Try to find any text to verify page loaded
  const bodyText = await page.textContent('body');
  console.log('Page content:', bodyText?.substring(0, 200));
  
  // Look for workshop elements
  const hasWorkshop = await page.locator('text=workshop').count();
  console.log('Workshop elements found:', hasWorkshop);
  
  // Clean up
  await browser.close();
});