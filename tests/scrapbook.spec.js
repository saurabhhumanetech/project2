import { test, expect } from '@playwright/test';
import { content } from '../src/content.js';

test('the complete friendship journey works by mouse and keyboard', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('/');
  await expect(page).toHaveTitle('The Domčo Universe');
  await expect(page.locator('.personal-greeting')).toHaveText('Hey, Domčo.');
  await page.getByRole('button', { name: content.revealButton }).click();
  await expect(page.getByRole('status')).toContainText(content.introduction);
  await expect(page.locator('.confetti i')).toHaveCount(36);
  for (const character of content.characters) {
    await page.getByRole('button', { name: character.name, exact: false }).first().click();
    await expect(page.locator('.character-caption')).toContainText(character.title);
  }
  const flip = page.getByRole('button', { name: `Read note: ${content.photos[0].label}` });
  await flip.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: `Show photo: ${content.photos[0].label}` })).toHaveAttribute('aria-pressed', 'true');
  const opener = page.getByRole('button', { name: `View full image: ${content.photos[0].label}` });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.lightbox-caption p')).toContainText(content.photos[1].label);
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.lightbox-caption p')).toContainText(content.photos[0].label);
  await page.getByRole('button', { name: 'Next photo' }).click();
  await page.getByRole('button', { name: 'Previous photo' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
  for (const adventure of content.adventures) {
    await page.getByRole('button', { name: adventure.name }).click();
    await expect(page.locator('.adventure-result')).toHaveText(adventure.result);
  }
  for (let outcome = 0; outcome < 3; outcome++) {
    for (const question of content.quiz) await page.getByRole('button', { name: question.answers[outcome], exact: false }).click();
    await expect(page.locator('.quiz-content')).toContainText(content.quizResults[outcome].title);
    await page.getByRole('button', { name: 'Try another timeline' }).click();
  }
  await page.getByRole('button', { name: 'Don’t press this' }).click();
  await expect(page.locator('.forbidden-paper')).toContainText(content.secret);
  await page.getByRole('button', { name: 'Okay, reset it' }).click();
  await expect(page.getByRole('button', { name: 'Don’t press this' })).toBeVisible();
  for (const vibe of content.vibes) {
    await page.getByRole('button', { name: 'One good vibe, please' }).click();
    await expect(page.locator('blockquote')).toHaveText(vibe);
  }
  await page.getByRole('button', { name: 'One good vibe, please' }).click();
  await expect(page.locator('blockquote')).toHaveText(content.vibes[0]);
  await page.locator('.envelope').click();
  await expect(page.locator('#friend-letter')).toContainText(content.letter);
  await page.locator('.envelope').click();
  await expect(page.locator('#friend-letter')).toHaveCount(0);
  await page.getByRole('button', { name: 'A little more celebration?' }).click();
  await expect(page.getByRole('status')).toContainText(content.name);
  expect(errors).toEqual([]);
});

for (const width of [320, 375, 768, 1440]) {
  test(`no page overflow or broken assets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('.envelope').scrollIntoViewIfNeeded();
    await page.locator('.envelope').click();
    await page.getByRole('button', { name: content.revealButton }).click();
    const metrics = await page.evaluate(async () => {
      document.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
      await Promise.all([...document.images].map(img => img.decode()));
      return { width: innerWidth, actual: document.documentElement.scrollWidth, broken: [...document.images].filter(img => !img.naturalWidth).length };
    });
    expect(metrics.actual).toBeLessThanOrEqual(metrics.width);
    expect(metrics.broken).toBe(0);
    await page.screenshot({ path: `test-results/scrapbook-${width}.png`, fullPage: true });
  });
}

test('reduced motion and mobile taps work', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: content.revealButton }).tap();
  await expect(page.locator('.confetti')).toBeHidden();
  await page.getByRole('button', { name: `View full image: ${content.photos[2].label}` }).tap();
  await page.getByRole('button', { name: 'Close photo viewer' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.locator('.envelope').tap();
  await expect(page.locator('#friend-letter')).toBeVisible();
  await context.close();
});
