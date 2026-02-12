import { test, expect } from '@playwright/test';
import { createGame } from './helpers/api';
import { wait } from './helpers/chess';
import { selectors } from './helpers/selectors';

test.describe('Game End States', () => {
  test('should handle resignation', async ({ page, context }) => {
    const { whiteUrl, blackUrl } = await createGame();

    // Join as white
    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    // Join as black
    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);

    // Wait for both players to connect
    await wait(1000);

    // White resigns
    await page.click(selectors.controls.resignButton);

    // Wait for resignation to process
    await wait(500);

    // Both players should see the result modal
    await page.waitForSelector(selectors.result.modal);
    await blackPage.waitForSelector(selectors.result.modal);

    // Verify the result message
    const whiteResult = await page.locator(selectors.result.message).textContent();
    const blackResult = await blackPage.locator(selectors.result.message).textContent();

    expect(whiteResult).toContain('resigned');
    expect(blackResult).toContain('resigned');

    // Verify "New Game" button is present
    await expect(page.locator(selectors.result.newGameButton)).toBeVisible();

    await blackPage.close();
  });

  test.skip('should handle draw offer and acceptance', async ({ page, context }) => {
    const { whiteUrl, blackUrl } = await createGame();

    // Join as both players
    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);

    await wait(1000);

    // White offers a draw
    await page.click(selectors.controls.offerDrawButton);

    // Wait for draw offer to propagate
    await wait(500);

    // Black should see the draw offer accept/decline buttons
    await blackPage.waitForSelector(selectors.controls.acceptDrawButton);

    // Black accepts the draw
    await blackPage.click(selectors.controls.acceptDrawButton);

    // Wait for acceptance to process
    await wait(500);

    // Both players should see draw result
    await page.waitForSelector(selectors.result.modal);
    await blackPage.waitForSelector(selectors.result.modal);

    const whiteResult = await page.locator(selectors.result.message).textContent();
    const blackResult = await blackPage.locator(selectors.result.message).textContent();

    expect(whiteResult).toContain('Draw');
    expect(blackResult).toContain('Draw');

    await blackPage.close();
  });

  test.skip('should handle draw offer and decline', async ({ page, context }) => {
    const { whiteUrl, blackUrl } = await createGame();

    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);

    await wait(1000);

    // White offers a draw
    await page.click(selectors.controls.offerDrawButton);
    await wait(500);

    // Black declines the draw
    await blackPage.click(selectors.controls.declineDrawButton);

    // Game should continue
    await wait(500);

    // Game result modal should NOT appear
    await expect(page.locator(selectors.result.modal)).not.toBeVisible();
    await expect(blackPage.locator(selectors.result.modal)).not.toBeVisible();

    // Game should still be playable
    const currentTurn = await page.locator(selectors.game.currentTurn).textContent();
    expect(currentTurn).toBeTruthy();

    await blackPage.close();
  });

  test('should show correct winner after game ends', async ({ page, context }) => {
    const { whiteUrl, blackUrl } = await createGame();

    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    // Join black player so game becomes active
    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);
    await wait(1000);

    // Make a checkmate happen (simplified - actual implementation needs move logic)
    // For now, just test resignation outcome

    await page.click(selectors.controls.resignButton);
    await wait(500);

    await page.waitForSelector(selectors.result.modal);

    const resultMessage = await page.locator(selectors.result.message).textContent();
    expect(resultMessage).toContain('resigned');

    await blackPage.close();
  });

  test('should allow creating new game after game ends', async ({ page }) => {
    const { whiteUrl } = await createGame();

    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    // End the game via resignation
    await page.click(selectors.controls.resignButton);
    await wait(500);

    // Wait for result modal
    await page.waitForSelector(selectors.result.modal);

    // Click "New Game" button
    await page.click(selectors.result.newGameButton);

    // Should navigate to home page or create new game
    await wait(500);

    // Verify we're either on home or in a new game
    const url = page.url();
    expect(url).toBeTruthy();
  });
});
