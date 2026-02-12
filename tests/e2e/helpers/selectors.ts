/**
 * Centralized Playwright selectors for the Chess app
 */

export const selectors = {
  // Home page
  home: {
    createGameButton: '[data-testid="create-game-button"]',
    whiteUrl: '[data-testid="white-url"]',
    blackUrl: '[data-testid="black-url"]',
    copyWhiteButton: '[data-testid="copy-white-link"]',
    copyBlackButton: '[data-testid="copy-black-link"]',
  },

  // Game page
  game: {
    chessBoard: '[data-testid="chess-board"]',
    turnIndicator: '[data-testid="turn-indicator"]',
    playerColor: '[data-testid="player-color"]',
    currentTurn: '[data-testid="current-turn"]',
    connectionStatus: '[data-testid="connection-status"]',
    gameStatus: '[data-testid="game-status"]',
  },

  // Game controls
  controls: {
    resignButton: 'button:has-text("Resign")',
    offerDrawButton: 'button:has-text("Offer Draw")',
    acceptDrawButton: 'button:has-text("Accept Draw")',
    declineDrawButton: 'button:has-text("Decline")',
    copyLinkButton: '[data-testid="copy-link-button"]',
  },

  // Game result modal
  result: {
    modal: '[data-testid="game-result-modal"]',
    message: '[data-testid="result-message"]',
    newGameButton: '[data-testid="new-game-button"]',
    title: '[data-testid="result-title"]',
  },
};
