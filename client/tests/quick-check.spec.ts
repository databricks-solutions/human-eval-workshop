import { test, expect } from '@playwright/test';

test('rubric page loads without errors', async ({ page }) => {
  // Listen for console errors and failed requests
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`Failed request: ${response.status()} ${response.url()}`);
    }
  });
  
  // Navigate to the app
  await page.goto('http://localhost:3000');
  
  // Wait for initial load
  await page.waitForLoadState('networkidle');
  
  // Check no errors occurred
  if (errors.length > 0) {
    console.error('Console errors found:', errors);
    throw new Error(`Page has ${errors.length} console errors`);
  }
  
  // Verify app loaded
  await expect(page.getByText(/LLM Judge Calibration Workshop/i)).toBeVisible();
});