import { test, chromium } from '@playwright/test';

test('visual check of rubric focused view', async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Navigate to app
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  // Fill in the join form to get past login
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[placeholder*="name"]', 'Test User');
  await page.getByRole('button', { name: 'Facilitator' }).click();
  await page.getByRole('button', { name: 'Join Workshop' }).click();
  
  await page.waitForTimeout(1000);
  
  // Navigate to rubric creation
  // Click on Start Workshop or navigate through the phases
  const startButton = page.getByRole('button', { name: /Start Workshop/i });
  if (await startButton.isVisible()) {
    await startButton.click();
  }
  
  await page.waitForTimeout(1000);
  
  // Look for rubric creation phase
  const rubricButton = page.getByText(/Rubric Creation/i).first();
  if (await rubricButton.isVisible()) {
    await rubricButton.click();
  }
  
  await page.waitForTimeout(2000);
  
  // Try to switch to focused view
  const focusedViewButton = page.getByRole('button', { name: /Focused View/i });
  if (await focusedViewButton.isVisible()) {
    await focusedViewButton.click();
    console.log('Switched to focused view');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'rubric-focused-view.png', fullPage: true });
  console.log('Screenshot saved to rubric-focused-view.png');
  
  // Measure the actual content width
  const contentWidth = await page.evaluate(() => {
    const focusedView = document.querySelector('[class*="flex gap-6"]');
    if (focusedView) {
      const rect = focusedView.getBoundingClientRect();
      return {
        width: rect.width,
        viewportWidth: window.innerWidth,
        utilization: (rect.width / window.innerWidth * 100).toFixed(1) + '%'
      };
    }
    return null;
  });
  
  console.log('Content measurements:', contentWidth);
  
  // Keep open for manual inspection
  console.log('Browser will stay open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
});