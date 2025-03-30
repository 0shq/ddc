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
│   ├── profile/           # User profile page
│   │   └── page.tsx       # Profile page component
│   ├── inventory/         # NFT inventory page
│   │   └── page.tsx       # Inventory page component
│   ├── leaderboard/       # Global leaderboard page
│   │   └── page.tsx       # Leaderboard page component
│   ├── layout.tsx         # Root layout component
│   ├── client-layout.tsx  # Client-side layout wrapper
│   ├── providers.tsx      # App-wide providers
│   └── globals.css        # Global styles
│
├── components/            # Reusable components
│   ├── battle/           # Battle-related components
│   │   ├── BattleArena.tsx    # Battle visualization
│   │   └── BattleHistory.tsx  # Battle history display
│   ├── layout/           # Layout components
│   │   ├── Header.tsx    # Site header
│   │   ├── Footer.tsx    # Site footer
│   │   └── Sidebar.tsx   # Navigation sidebar
│   └── nft/              # NFT-related components
│       └── NFTCard.tsx   # NFT display card
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
        └── BattleSystem.ts  # Battle mechanics

```

## Key Files and Their Purposes

### App Pages
- `battle/page.tsx`: Main battle arena interface with opponent selection and battle visualization
- `mint/page.tsx`: NFT minting interface with preview functionality
- `profile/page.tsx`: User profile and statistics
- `inventory/page.tsx`: NFT collection management
- `leaderboard/page.tsx`: Global player rankings
- `providers.tsx`: App-wide context providers setup
- `client-layout.tsx`: Client-side layout wrapper for Next.js

### Components
- `BattleArena.tsx`: Battle visualization and controls with opponent display
- `BattleHistory.tsx`: Display of past battles and results
- `NFTCard.tsx`: NFT display component with attributes
- Layout components for consistent UI structure

### State Management
- `WalletProvider.tsx`: Manages wallet connection and transactions
- `NFTProvider.tsx`: Handles NFT ownership, minting, and attributes
- `GameProvider.tsx`: Manages game state, battle logic, and results

### Types
- `nft.ts`: NFT attribute definitions including strength, speed, luck, etc.
- `battle.ts`: Battle result and state types for game mechanics

### Core Logic
- `BattleSystem.ts`: Implements battle mechanics and scoring system