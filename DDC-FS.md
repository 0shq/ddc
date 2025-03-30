# Degen D. Clash - File Structure

## Project Overview
Degen D. Clash is an NFT battle game built on the Sui blockchain. This document outlines the project's file structure and organization.

## Directory Structure

```
src/
├── app/                    # Next.js app directory
│   ├── battle/            # Battle arena page
│   │   └── page.tsx       # Battle page component
│   ├── mint/              # NFT minting page
│   │   └── page.tsx       # Mint page component
│   ├── profile/           # User profile page (TODO)
│   ├── inventory/         # NFT inventory page (TODO)
│   ├── leaderboard/       # Global leaderboard page (TODO)
│   ├── layout.tsx         # Root layout component
│   └── globals.css        # Global styles
│
├── components/            # Reusable components
│   ├── battle/           # Battle-related components
│   │   ├── BattleArena.tsx
│   │   └── BattleHistory.tsx
│   ├── layout/           # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── nft/              # NFT-related components
│       └── NFTCard.tsx
│
├── store/                # State management
│   ├── WalletProvider.tsx    # Wallet connection state
│   ├── NFTProvider.tsx       # NFT management state
│   └── GameProvider.tsx      # Game state management
│
├── types/                # TypeScript type definitions
│   ├── nft.ts           # NFT-related types
│   └── battle.ts        # Battle-related types
│
├── lib/                  # Utility libraries
│   └── sui/             # Sui blockchain integration
│       └── constants.ts  # Blockchain constants
│
└── core/                # Core game logic
    └── battle/          # Battle system
        └── BattleSystem.ts

```

## Key Files and Their Purposes

### App Pages
- `battle/page.tsx`: Main battle arena interface
- `mint/page.tsx`: NFT minting interface
- `profile/page.tsx`: User profile (TODO)
- `inventory/page.tsx`: NFT inventory (TODO)
- `leaderboard/page.tsx`: Global leaderboard (TODO)

### Components
- `BattleArena.tsx`: Battle visualization and controls
- `BattleHistory.tsx`: Display of past battles
- `NFTCard.tsx`: NFT display component
- Layout components for consistent UI structure

### State Management
- `WalletProvider.tsx`: Manages wallet connection and transactions
- `NFTProvider.tsx`: Handles NFT ownership and minting
- `GameProvider.tsx`: Manages game state and battle logic

### Types
- `nft.ts`: NFT attribute definitions
- `battle.ts`: Battle result and state types