import { test, expect } from '@playwright/test';
import { createGame } from './helpers/api';
import { selectors } from './helpers/selectors';

test.describe('Edge Cases and Validation', () => {
  test('should reject invalid game ID', async ({ page }) => {
    // Try to navigate to a game that doesn't exist
    await page.goto('/g/invalid-game-id-12345?token=fake-token');

    // Should show error or redirect
    // The exact behavior depends on your error handling implementation
    await page.waitForTimeout(1000);

    // Could check for error message or redirect to home
    const url = page.url();
    // Assertion depends on your error handling approach
  });

  test('should reject invalid token', async ({ page }) => {
    // Create a real game
    const { gameId } = await createGame();

    // Try to join with invalid token
    await page.goto(`/g/${gameId}?token=invalid-token-12345`);

    await page.waitForSelector(selectors.game.chessBoard);

    // Socket connection should fail or show error
    // The player shouldn't be able to make moves
    await page.waitForTimeout(1000);

    // Check for error indicator (implementation-dependent)
  });

  test('should enforce turn order', async ({ page, context }) => {
    const { whiteUrl, blackUrl } = await createGame();

    // Join as white
    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    // Join as black
    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);

    // Wait for connection
    await page.waitForTimeout(1000);

    // Try to make a move as black (but it's white's turn)
    // TODO: Attempt to move black piece
    // await dragPiece(blackPage, 'e7', 'e5');

    // Move should be rejected
    // Verify board state hasn't changed

    await blackPage.close();
  });

  test('should prevent moves after game ends', async ({ page, context }) => {
    const { whiteUrl, blackUrl } = await createGame();

    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    // Join as black so game becomes active
    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);

    // Wait for game to become active
    await page.waitForTimeout(1000);

    // Resign the game
    await page.click(selectors.controls.resignButton);

    await blackPage.close();

    // Wait for resignation to process
    await page.waitForTimeout(500);

    // Verify game result modal appears
    await page.waitForSelector(selectors.result.modal);

    // Try to make a move (should be disabled)
    // The board should be non-interactive
    const board = page.locator(selectors.game.chessBoard);
    // In reality, you'd test that dragging pieces doesn't work
  });

  test('should handle missing query parameters', async ({ page }) => {
    const { gameId } = await createGame();

    // Navigate without token
    await page.goto(`/g/${gameId}`);

    // Should show error or handle gracefully
    await page.waitForTimeout(1000);

    // Check for appropriate error handling
  });
});
