// Sui package and module IDs
export const GAME_PACKAGE_ID = '0x1234567890abcdef'; // Replace with actual package ID
// export const GAME_MODULE = 'degen_d_clash';
export const SUI_PACKAGE_ID = '0x2::sui'; 

// Contract package ID
export const PACKAGE_ID = "0xca1fa792ee2e7f88f35ce48c6fd9818c0ecbd660b5c9c01de87c1c602ca7aea7";

// Contract module names
export const GAME_MODULE = "game";

// Admin cap ID
export const ADMIN_CAP_ID = "0x..."; // Replace with actual admin cap ID

// Event types
export const EVENTS = {
    NFT_MINTED: `${PACKAGE_ID}::${GAME_MODULE}::NFTMinted`,
    BATTLE_COMPLETED: `${PACKAGE_ID}::${GAME_MODULE}::BattleCompleted`,
};
