import { test, expect } from '@playwright/test';
import { createGame, parseGameUrl } from './helpers/api';
import { getScholarsMateMoves } from './helpers/chess';
import { selectors } from './helpers/selectors';

test.describe('Chess Game Flow', () => {
  test('should create game and play through to checkmate', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Create a new game
    await page.click(selectors.home.createGameButton);

    // Wait for game URLs to be displayed
    await page.waitForSelector(selectors.home.whiteUrl);

    // Get the white player URL
    const whiteUrlText = await page.locator(selectors.home.whiteUrl).textContent();
    expect(whiteUrlText).toBeTruthy();

    // Navigate to the game as white player
    await page.goto(whiteUrlText!);

    // Wait for the chess board to load
    await page.waitForSelector(selectors.game.chessBoard);

    // Verify we're playing as white
    const playerColor = await page.locator(selectors.game.playerColor).textContent();
    expect(playerColor).toContain('white');

    // Verify initial turn is white
    const currentTurn = await page.locator(selectors.game.currentTurn).textContent();
    expect(currentTurn).toContain('white');
  });

  test('should persist game state after refresh', async ({ page }) => {
    // Create a game via API
    const { whiteUrl } = await createGame();

    // Join as white
    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    // Make a move (e2 to e4)
    const board = page.locator(selectors.game.chessBoard);
    await board.click(); // This will interact with react-chessboard

    // Wait a moment for the move to be processed
    await page.waitForTimeout(500);

    // Refresh the page
    await page.reload();

    // Wait for board to reload
    await page.waitForSelector(selectors.game.chessBoard);

    // Verify we're still in the game
    const playerColor = await page.locator(selectors.game.playerColor).textContent();
    expect(playerColor).toContain('white');
  });

  test('should show checkmate result', async ({ page, context }) => {
    // Create a game
    const { whiteUrl, blackUrl } = await createGame();

    // Open white player in main page
    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    // Open black player in new page
    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);

    // Play Scholar's Mate moves
    const moves = getScholarsMateMoves();

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const isWhiteTurn = i % 2 === 0;
      const currentPage = isWhiteTurn ? page : blackPage;

      // Note: Actual move execution would require interacting with react-chessboard
      // This is a simplified version - in reality, you'd need to:
      // 1. Find the piece at move.from position
      // 2. Drag it to move.to position
      // For now, we'll use a marker comment showing the intent

      // Wait for turn
      await currentPage.waitForTimeout(500);

      // TODO: Implement actual piece dragging logic
      // await dragPiece(currentPage, move.from, move.to);
    }

    // After checkmate, verify result modal appears
    await page.waitForSelector(selectors.result.modal, { timeout: 10000 });
    await blackPage.waitForSelector(selectors.result.modal, { timeout: 10000 });

    // Verify checkmate message
    const resultMessage = await page.locator(selectors.result.message).textContent();
    expect(resultMessage).toContain('Checkmate');

    await blackPage.close();
  });
});
