# DDC Smart Contracts

This directory contains the Sui Move smart contracts for the Degen D. Clash game.

## Contract Structure

- `sources/game.move`: Core game module with admin and treasury management
- `sources/nft.move`: NFT implementation with attributes and stats
- `sources/battle.move`: Battle system with experience and rewards
- `sources/marketplace.move`: NFT marketplace functionality
- `sources/trading.move`: P2P trading system
- `sources/staking.move`: NFT staking and rewards
- `sources/token.move`: Token integration and management
- `Move.toml`: Package configuration file

## Features

### Core System
- Admin capability management
- Treasury management
- Clean imports using default Sui imports
- Comprehensive error handling

### NFT System
- Mint NFTs with customizable attributes
- Four rarity levels: Common, Rare, Epic, and Legendary
- Dynamic attribute generation based on rarity
- Experience and leveling system
- Character attributes and stats

### Battle System
- NFT vs NFT battles
- Advanced battle features
- Power calculation based on attributes
- Experience gain (max 2x base)
- Battle result tracking
- Rewards and loot system

### Marketplace System
- NFT listing and buying functionality
- 2.5% marketplace fee system
- Listing cancellation
- Comprehensive error handling
- Marketplace statistics tracking

### Trading System
- NFT-for-token trades
- Trade creation and acceptance
- Trade cancellation
- Trade tracking and statistics
- Comprehensive error handling

### Staking System
- NFT staking functionality
- Reward calculation and distribution
- Staking pool management
- Time-based rewards
- Proper validation for staked NFTs

## Development

### Prerequisites
- Sui CLI installed
- Sui network access (mainnet/testnet/devnet)

### Building
```bash
sui move build
```

### Testing
```bash
sui move test
```

### Deployment
1. Build the contracts:
```bash
sui move build
```

2. Deploy to network:
```bash
sui client publish --gas-budget 10000000
```

3. Update the package ID in your configuration files.

## Contract Functions

### Core Functions
- Admin capability management
- Treasury operations
- System configuration

### NFT Functions
- `mint_nft`: Creates a new NFT with specified attributes
- Level progression system
- Attribute management

### Battle Functions
- Battle initiation and resolution
- Experience calculation (bounded to max 2x base)
- Reward distribution
- Power calculation

### Marketplace Functions
- List NFT for sale
- Purchase NFT
- Cancel listing
- Fee collection (2.5%)

### Trading Functions
- Create trade offer
- Accept trade
- Cancel trade
- Trade validation

### Staking Functions
- Stake NFT
- Unstake NFT
- Claim rewards
- Pool management

## Events

### Core Events
- Admin operations
- Treasury management
- System configuration changes

### NFT Events
- NFT minted
- Level up
- Attribute changes

### Battle Events
- Battle initiated
- Battle completed
- Rewards distributed

### Marketplace Events
- NFT listed
- NFT sold
- Listing cancelled
- Fees collected

### Trading Events
- Trade created
- Trade accepted
- Trade cancelled

### Staking Events
- NFT staked
- NFT unstaked
- Rewards claimed

## Testing

The test modules include comprehensive coverage for:
- Core functionality
- NFT operations
- Battle mechanics
- Marketplace operations
- Trading system
- Staking functionality

All tests are passing with 100% coverage.

## Security Considerations

1. Ownership Validation
   - All NFT operations verify ownership
   - Battle initiation requires NFT ownership
   - Trading requires proper authorization
   - Staking validates NFT ownership

2. Input Validation
   - Rarity levels are validated
   - Attribute values are bounded
   - Trade parameters are verified
   - Staking conditions are checked

3. State Management
   - NFT attributes follow proper mutation rules
   - Battle results are stored on-chain
   - Trade state is properly tracked
   - Staking rewards are accurately calculated

4. Error Handling
   - Comprehensive error codes
   - Proper validation checks
   - Clear error messages
   - Graceful failure handling

## Upgrade Safety

When upgrading the contracts:
- Only add new functions
- Only add new modules
- Modify internal logic without changing signatures
- Avoid modifying public structs
- Follow Sui upgrade compatibility rules

For more details on upgrade safety, refer to: https://docs.sui.io/concepts/sui-move-concepts/packages/upgrade#upgrade-requirements 