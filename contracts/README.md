# DDC Smart Contracts

This directory contains the Sui Move smart contracts for the Degen D. Clash game.

## Contract Structure

- `sources/game.move`: Main game module containing NFT and battle functionality
- `sources/game_tests.move`: Test module for the game contract
- `Move.toml`: Package configuration file

## Features

### NFT System
- Mint NFTs with customizable name, description, and image URL
- Four rarity levels: Common, Rare, Epic, and Legendary
- Dynamic attribute generation based on rarity
- Experience and leveling system

### Battle System
- NFT vs NFT battles
- Power calculation based on attributes
- Experience gain and level progression
- Battle result tracking

## Development

### Prerequisites
- Sui CLI installed
- Sui testnet access

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

2. Deploy to testnet:
```bash
sui client publish --gas-budget 10000000
```

3. Update the package ID in `src/lib/sui/constants.ts` with the newly deployed package ID.

## Contract Functions

### NFT Functions
- `mint_nft(name: vector<u8>, description: vector<u8>, image_url: vector<u8>, rarity: u8)`: Creates a new NFT with the specified parameters

### Battle Functions
- `initiate_battle(nft1: &mut NFT, nft2: &mut NFT)`: Initiates a battle between two NFTs

## Events

### NFT Events
- `NFTMinted`: Emitted when a new NFT is minted
  - `nft_id`: ID of the minted NFT
  - `owner`: Address of the NFT owner
  - `name`: Name of the NFT
  - `rarity`: Rarity level of the NFT

### Battle Events
- `BattleCompleted`: Emitted when a battle is completed
  - `battle_id`: ID of the battle result
  - `winner`: ID of the winning NFT
  - `loser`: ID of the losing NFT
  - `experience_gained`: Amount of experience gained

## Testing

The test module includes tests for:
- NFT minting
- Battle system
- Attribute generation
- Experience and leveling

Run tests with:
```bash
sui move test
```

## Integration

The smart contracts are integrated with the frontend through:
1. `src/lib/sui/constants.ts`: Contains contract addresses and module names
2. `src/store/NFTProvider.tsx`: Handles NFT interactions
3. `src/store/GameProvider.tsx`: Manages battle system interactions

## Security Considerations

1. Ownership Validation
   - All NFT operations verify ownership
   - Battle initiation requires NFT ownership

2. Input Validation
   - Rarity levels are validated
   - Attribute values are bounded

3. State Management
   - NFT attributes are immutable except through battles
   - Battle results are stored on-chain 