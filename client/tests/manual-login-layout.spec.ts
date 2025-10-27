import { test, chromium } from '@playwright/test';

test('test layout with manual login', async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Fill in manual login
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[name="name"]', 'Test Facilitator');
  
  // Select Facilitator role
  await page.locator('select[name="role"]').selectOption('facilitator');
  await page.waitForTimeout(500);
  
  // Click Join Workshop
  await page.locator('button:has-text("Join Workshop")').click();
  await page.waitForTimeout(3000);
  
  // Take screenshot of the new layout
  await page.screenshot({ path: 'manual-login-layout.png', fullPage: true });
  console.log('Screenshot saved as manual-login-layout.png');
  
  // Measure the layout
  const measurements = await page.evaluate(() => {
    // Find all elements with specific classes
    const sidebar = document.querySelector('.w-64');
    const mainArea = document.querySelector('.flex-1.flex.flex-col');
    const body = document.body;
    
    return {
      hasFlexLayout: body.querySelector('.min-h-screen.bg-gray-50.flex') !== null,
      sidebarFound: sidebar !== null,
      mainAreaFound: mainArea !== null,
      sidebarWidth: sidebar?.getBoundingClientRect().width,
      mainAreaWidth: mainArea?.getBoundingClientRect().width,
      viewportWidth: window.innerWidth
    };
  });
  
  console.log('Layout check:', measurements);
  
  await page.waitForTimeout(10000);
  await browser.close();
});