import { test, expect } from '@playwright/test';

test.describe('Rubric Creation Focused View', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the rubric creation page
    await page.goto('http://localhost:3000');
    
    // Click through to rubric creation phase
    await page.getByRole('button', { name: /start workshop/i }).click();
    await page.getByRole('button', { name: /rubric creation/i }).click();
  });

  test('should toggle between grid and focused view', async ({ page }) => {
    // Check initial state - grid view should be active
    await expect(page.getByRole('button', { name: /grid view/i })).toHaveClass(/bg-primary/);
    
    // Switch to focused view
    await page.getByRole('button', { name: /focused view/i }).click();
    
    // Verify focused view is active
    await expect(page.getByRole('button', { name: /focused view/i })).toHaveClass(/bg-primary/);
    
    // Verify focused view elements are visible
    await expect(page.getByText(/trace 1 of/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /scratch pad/i })).toBeVisible();
  });

  test('should navigate between traces in focused view', async ({ page }) => {
    // Switch to focused view
    await page.getByRole('button', { name: /focused view/i }).click();
    
    // Check initial trace
    await expect(page.getByText(/trace 1 of/i)).toBeVisible();
    
    // Navigate to next trace
    await page.locator('button[aria-label="Next trace"]').click();
    await expect(page.getByText(/trace 2 of/i)).toBeVisible();
    
    // Navigate to previous trace
    await page.locator('button[aria-label="Previous trace"]').click();
    await expect(page.getByText(/trace 1 of/i)).toBeVisible();
  });

  test('should open scratch pad and pin comments', async ({ page }) => {
    // Switch to focused view
    await page.getByRole('button', { name: /focused view/i }).click();
    
    // Open scratch pad
    await page.getByRole('button', { name: /scratch pad/i }).click();
    
    // Verify scratch pad is open
    await expect(page.getByText(/rubric creation scratch pad/i)).toBeVisible();
    
    // Pin a comment (first pin button)
    const firstPinButton = page.locator('button[aria-label="Pin comment"]').first();
    await firstPinButton.click();
    
    // Check that scratch pad badge shows count
    await expect(page.getByRole('button', { name: /scratch pad.*1/i })).toBeVisible();
  });

  test('should add custom note to scratch pad', async ({ page }) => {
    // Switch to focused view
    await page.getByRole('button', { name: /focused view/i }).click();
    
    // Open scratch pad
    await page.getByRole('button', { name: /scratch pad/i }).click();
    
    // Add custom note
    const customNote = 'This is a test insight for the rubric';
    await page.getByPlaceholder(/add a custom note/i).fill(customNote);
    await page.getByRole('button', { name: /add note/i }).click();
    
    // Verify note appears in scratch pad
    await expect(page.getByText(customNote)).toBeVisible();
  });

  test('should persist scratch pad notes across page navigation', async ({ page }) => {
    // Switch to focused view
    await page.getByRole('button', { name: /focused view/i }).click();
    
    // Open scratch pad
    await page.getByRole('button', { name: /scratch pad/i }).click();
    
    // Add custom note
    const customNote = 'This note should persist across navigation';
    await page.getByPlaceholder(/add a custom note/i).fill(customNote);
    await page.getByRole('button', { name: /add note/i }).click();
    
    // Verify note appears in scratch pad
    await expect(page.getByText(customNote)).toBeVisible();
    
    // Navigate to another tab (Rubric Questions)
    await page.getByRole('tab', { name: /rubric questions/i }).click();
    
    // Navigate back to Discovery Analysis tab
    await page.getByRole('tab', { name: /discovery analysis/i }).click();
    
    // Switch back to focused view
    await page.getByRole('button', { name: /focused view/i }).click();
    
    // Open scratch pad again
    await page.getByRole('button', { name: /scratch pad/i }).click();
    
    // Verify note is still there
    await expect(page.getByText(customNote)).toBeVisible();
  });

  test('keyboard navigation should work', async ({ page }) => {
    // Switch to focused view
    await page.getByRole('button', { name: /focused view/i }).click();
    
    // Check initial trace
    await expect(page.getByText(/trace 1 of/i)).toBeVisible();
    
    // Press right arrow to go to next trace
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText(/trace 2 of/i)).toBeVisible();
    
    // Press left arrow to go back
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByText(/trace 1 of/i)).toBeVisible();
    
    // Press Ctrl+S to open scratch pad
    await page.keyboard.press('Control+s');
    await expect(page.getByText(/rubric creation scratch pad/i)).toBeVisible();
  });
});