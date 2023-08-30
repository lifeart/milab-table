import { test, expect } from '@playwright/test';

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('form')).toHaveCount(1);
  await expect(page.locator('table')).toHaveCount(1);

  const cellSelector = '#app > main > div > div > table > tbody > tr:nth-child(2) > td:nth-child(3) > div';
  //  get prev color of first div in second row and second cell
  const prevColor = await page.locator(cellSelector).getAttribute('style');
  await page.click('text=Generate');

  const newColor = await page.locator(cellSelector).getAttribute('style');
  expect(newColor).not.toBe(prevColor);
})
