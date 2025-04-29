# DDC API Documentation

## Overview
This document provides comprehensive documentation for the DDC (Degen D. Clash) game API. The API is built on the Sui blockchain and provides functionality for NFT management, battles, marketplace operations, trading, and staking.

## Core Modules

### NFT Module
The NFT module handles character creation and management.

#### Functions

##### `mintNFT`
Create a new character NFT.
```typescript
async function mintNFT(
    name: string,
    description: string,
    imageUrl: string,
    rarity: number,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

##### `getNFTDetails`
Get details of a specific NFT.
```typescript
async function getNFTDetails(nftId: string): Promise<any>
```

##### `getNFTsByOwner`
Get all NFTs owned by an address.
```typescript
async function getNFTsByOwner(owner: string): Promise<any>
```

### Battle Module
The Battle module handles character battles and rewards.

#### Functions

##### `initiateBattle`
Start a battle between two NFTs.
```typescript
async function initiateBattle(
    nft1Id: string,
    nft2Id: string,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

##### `executeTurn`
Execute a battle turn.
```typescript
async function executeTurn(
    arenaId: string,
    battleId: string,
    attackerNftId: string,
    defenderNftId: string,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

##### `getBattleDetails`
Get details of a specific battle.
```typescript
async function getBattleDetails(battleId: string): Promise<any>
```

### Marketplace Module
The Marketplace module handles NFT listings and sales.

#### Functions

##### `listNFT`
List an NFT for sale.
```typescript
async function listNFT(
    nftId: string,
    price: bigint,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

##### `buyNFT`
Purchase a listed NFT.
```typescript
async function buyNFT(
    listingId: string,
    price: bigint,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

##### `cancelListing`
Cancel an NFT listing.
```typescript
async function cancelListing(
    listingId: string,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

### Trading Module
The Trading module handles peer-to-peer NFT trades.

#### Functions

##### `createTrade`
Create a new trade offer.
```typescript
async function createTrade(
    nftId: string,
    tokenAmount: bigint,
    recipient: string,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

##### `acceptTrade`
Accept a trade offer.
```typescript
async function acceptTrade(
    tradeId: string,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

##### `cancelTrade`
Cancel a trade offer.
```typescript
async function cancelTrade(
    tradeId: string,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

### Staking Module
The Staking module handles NFT staking and rewards.

#### Functions

##### `stakeNFT`
Stake an NFT.
```typescript
async function stakeNFT(
    nftId: string,
    poolId: string,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

##### `unstakeNFT`
Unstake an NFT.
```typescript
async function unstakeNFT(
    nftId: string,
    poolId: string,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

##### `claimRewards`
Claim staking rewards.
```typescript
async function claimRewards(
    nftId: string,
    poolId: string,
    signAndExecute: (tx: TransactionBlock) => Promise<any>
): Promise<any>
```

## Analytics & Monitoring

### Analytics
The Analytics module provides statistical data about game activities.

#### Functions

##### `getBattleStatistics`
Get battle-related statistics.
```typescript
async function getBattleStatistics(startTime?: number, endTime?: number): Promise<{
    totalBattles: number;
    winnerDistribution: Record<string, number>;
    averageExperience: number;
    totalRewards: number;
}>
```

##### `getTradingVolume`
Get trading volume statistics.
```typescript
async function getTradingVolume(startTime?: number, endTime?: number): Promise<{
    totalTrades: number;
    volumeByToken: number;
    uniqueTraders: number;
}>
```

##### `getMarketplaceActivity`
Get marketplace activity statistics.
```typescript
async function getMarketplaceActivity(startTime?: number, endTime?: number): Promise<{
    totalSales: number;
    totalVolume: number;
    averagePrice: number;
    uniqueBuyers: number;
    uniqueSellers: number;
}>
```

### Monitoring
The Monitoring module provides real-time system health monitoring.

#### Functions

##### `getAlerts`
Get system alerts.
```typescript
function getAlerts(fromTimestamp?: number): Alert[]
```

##### `getHealthStatus`
Get overall system health status.
```typescript
function getHealthStatus(): Map<string, HealthCheck>
```

##### `getModuleHealth`
Get health status of a specific module.
```typescript
function getModuleHealth(module: string): HealthCheck | undefined
```

## Events

### NFT Events
- `NFTMinted`: Emitted when a new NFT is created
- `NFTLevelUp`: Emitted when an NFT levels up

### Battle Events
- `BattleInitiated`: Emitted when a battle starts
- `BattleFinished`: Emitted when a battle ends
- `RewardsClaimed`: Emitted when battle rewards are claimed

### Marketplace Events
- `NFTListed`: Emitted when an NFT is listed
- `NFTSold`: Emitted when an NFT is sold
- `ListingCancelled`: Emitted when a listing is cancelled

### Trading Events
- `TradeCreated`: Emitted when a trade is created
- `TradeAccepted`: Emitted when a trade is accepted
- `TradeCancelled`: Emitted when a trade is cancelled

### Staking Events
- `NFTStaked`: Emitted when an NFT is staked
- `NFTUnstaked`: Emitted when an NFT is unstaked
- `RewardsClaimed`: Emitted when staking rewards are claimed

## Error Handling
All functions may throw errors in the following cases:
- Invalid input parameters
- Insufficient permissions
- Network errors
- Contract errors

Error responses include:
- Error code
- Error message
- Additional context (when available)

## Rate Limits
- Standard rate limits apply per Sui network guidelines
- Consider implementing client-side rate limiting for optimal performance

## Best Practices
1. Always check transaction status after execution
2. Implement proper error handling
3. Monitor gas costs for transactions
4. Use event listeners for real-time updates
5. Implement retry logic for failed transactions
6. Cache frequently accessed data
7. Validate inputs before sending transactions

## Security Considerations
1. Never expose private keys
2. Validate all user inputs
3. Implement proper access controls
4. Monitor for unusual activity
5. Follow secure coding practices
6. Regular security audits
7. Keep dependencies updated 