import { test, expect } from '@playwright/test';
import { createGame } from './helpers/api';
import { getSimpleOpeningMoves, wait } from './helpers/chess';
import { selectors } from './helpers/selectors';

test.describe('Multi-Player Gameplay', () => {
  test('should synchronize moves between two players', async ({ page, context }) => {
    // Create a game via API
    const { whiteUrl, blackUrl } = await createGame();

    // Open white player page
    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    // Verify white player connected
    const whiteColor = await page.locator(selectors.game.playerColor).textContent();
    expect(whiteColor).toContain('white');

    // Open black player in second browser context
    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);

    // Verify black player connected
    const blackColor = await blackPage.locator(selectors.game.playerColor).textContent();
    expect(blackColor).toContain('black');

    // Wait for both players to be connected
    await wait(1000);

    // Verify game status changed to 'active' (both players joined)
    const whiteStatus = await page.locator(selectors.game.gameStatus).textContent();
    expect(whiteStatus).toContain('active');

    // Play a few moves and verify synchronization
    // Note: This is conceptual - actual implementation needs drag-and-drop logic
    const moves = getSimpleOpeningMoves().slice(0, 4); // Just first 4 moves

    for (let i = 0; i < moves.length; i++) {
      const isWhiteTurn = i % 2 === 0;
      const activePage = isWhiteTurn ? page : blackPage;
      const observerPage = isWhiteTurn ? blackPage : page;

      // TODO: Execute move on active player's board
      // await dragPiece(activePage, moves[i].from, moves[i].to);

      // Wait for socket synchronization
      await wait(500);

      // Verify both players see the updated board
      // (This would check FEN position or piece positions)
    }

    await blackPage.close();
  });

  test('should handle player reconnection', async ({ page, context }) => {
    // Create game and join as white
    const { whiteUrl, blackUrl } = await createGame();

    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    // Open black player
    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);

    // Close black player (disconnect)
    await blackPage.close();

    // Wait a moment
    await wait(1000);

    // Reconnect black player
    const blackReconnectPage = await context.newPage();
    await blackReconnectPage.goto(blackUrl);
    await blackReconnectPage.waitForSelector(selectors.game.chessBoard);

    // Verify game state is preserved
    const playerColor = await blackReconnectPage.locator(selectors.game.playerColor).textContent();
    expect(playerColor).toContain('black');

    await blackReconnectPage.close();
  });

  test('should show real-time turn updates', async ({ page, context }) => {
    const { whiteUrl, blackUrl } = await createGame();

    // Join as both players
    await page.goto(whiteUrl);
    await page.waitForSelector(selectors.game.chessBoard);

    const blackPage = await context.newPage();
    await blackPage.goto(blackUrl);
    await blackPage.waitForSelector(selectors.game.chessBoard);

    // Verify initial state: white's turn
    const whiteTurnIndicator = await page.locator(selectors.game.currentTurn).textContent();
    const blackTurnIndicator = await blackPage.locator(selectors.game.currentTurn).textContent();

    expect(whiteTurnIndicator).toContain('white');
    expect(blackTurnIndicator).toContain('white');

    await blackPage.close();
  });
});
