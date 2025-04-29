// Contract package ID
export const PACKAGE_ID = "0xe50a63fcedff84294b9a88823680f10cffe6191ed40d4ee779978787828090ce";

// Contract module names
export const GAME_MODULE = "ddc::game";

// Admin cap ID (UpgradeCap object, update if you have a specific AdminCap object)
export const ADMIN_CAP_ID = "0x387910312b7a8f4bab004bf80f7aef3d08411c79034088ca7df108f836b96a39";

// Event types
export const EVENTS = {
    NFT_MINTED: `${PACKAGE_ID}::${GAME_MODULE}::NFTMinted`,
    BATTLE_COMPLETED: `${PACKAGE_ID}::${GAME_MODULE}::BattleCompleted`,
    NFT_STAKED: `${PACKAGE_ID}::${GAME_MODULE}::NFTStaked`,
    NFT_UNSTAKED: `${PACKAGE_ID}::${GAME_MODULE}::NFTUnstaked`,
};

// Constants from contract
export const RARITY = {
    COMMON: 1,
    RARE: 2,
    EPIC: 3,
    LEGENDARY: 4
};

export const RARITY_CHANCES = {
    LEGENDARY: 500,  // 5%
    EPIC: 1500,      // 15%
    RARE: 3000,      // 30%
    COMMON: 5000     // 50%
};

export const BASE_PRICE = 200_000_000; // 0.2 SUI

export const STAKING_REWARDS = {
    COMMON: 1_000_000,     // 0.001 SUI per day
    RARE: 2_000_000,       // 0.002 SUI per day
    EPIC: 5_000_000,       // 0.005 SUI per day
    LEGENDARY: 10_000_000  // 0.01 SUI per day
};
