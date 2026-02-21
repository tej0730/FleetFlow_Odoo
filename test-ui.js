const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Wait for animations
    await page.screenshot({ path: '/home/rugved/.gemini/antigravity/brain/07ac6869-efe5-4061-b97a-799aea0a9817/login_success.png' });
    console.log('Login screenshot saved.');
    
    console.log('Logging in as Fleet Manager...');
    await page.click('text=Fleet Manager');
    await page.click('text=Sign in to FleetFlow');
    
    console.log('Waiting for dashboard...');
    await page.waitForURL('http://localhost:5173/');
    await page.waitForTimeout(2000); // Wait for KPI animations
    await page.screenshot({ path: '/home/rugved/.gemini/antigravity/brain/07ac6869-efe5-4061-b97a-799aea0a9817/dashboard_success.png' });
    console.log('Dashboard screenshot saved.');
    
    console.log('Navigating to analytics...');
    await page.click('text=Analytics');
    await page.waitForURL('http://localhost:5173/analytics');
    await page.waitForTimeout(1500); // Wait for charts to load
    await page.screenshot({ path: '/home/rugved/.gemini/antigravity/brain/07ac6869-efe5-4061-b97a-799aea0a9817/analytics_success.png' });
    console.log('Analytics screenshot saved.');
    
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
