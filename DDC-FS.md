# DDC File Structure

```
ddc/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── battle/              # Battle page
│   │   │   └── page.tsx
│   │   ├── inventory/           # Inventory page
│   │   │   └── page.tsx
│   │   ├── leaderboard/         # Leaderboard page
│   │   │   └── page.tsx
│   │   ├── mint/                # Mint page
│   │   │   └── page.tsx
│   │   ├── profile/             # Profile page
│   │   │   └── page.tsx
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── root-layout.tsx      # Root layout wrapper
│   │
│   ├── components/              # React components
│   │   ├── app-providers/       # App-wide providers
│   │   │   ├── providers.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── battle/             # Battle-related components
│   │   │   ├── BattleArena.tsx
│   │   │   └── BattleHistory.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── ModeToggle.tsx
│   │   │   └── sidebar/
│   │   │       ├── app-sidebar.tsx
│   │   │       └── nav-projects.tsx
│   │   ├── nft/                # NFT-related components
│   │   │   └── NFTCard.tsx
│   │   └── ui/                 # UI components (shadcn/ui)
│   │       ├── avatar.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── collapsible.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       └── tooltip.tsx
│   │
│   ├── core/                   # Core business logic
│   │   └── battle/            # Battle system
│   │       └── BattleSystem.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── use-mobile.ts
│   │
│   ├── lib/                   # Utility libraries
│   │   ├── storage/          # Storage utilities
│   │   │   └── index.ts
│   │   ├── sui/              # Sui blockchain utilities
│   │   │   └── constants.ts
│   │   └── utils.ts
│   │
│   ├── store/                # State management
│   │   ├── GameProvider.tsx
│   │   ├── NFTProvider.tsx
│   │   └── WalletProvider.tsx
│   │
│   └── types/                # TypeScript types
│       ├── battle.ts
│       └── nft.ts
│
├── public/                   # Static assets
├── .next/                    # Next.js build output
├── node_modules/             # Dependencies
├── .git/                     # Git repository
├── .cursor/                  # Cursor IDE settings
├── components.json           # shadcn/ui configuration
├── next.config.ts           # Next.js configuration
├── next-env.d.ts           # Next.js TypeScript declarations
├── package.json             # Project dependencies and scripts
├── package-lock.json        # Locked dependencies
├── postcss.config.js        # PostCSS configuration
├── postcss.config.mjs       # PostCSS module configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Directory Structure Overview

### `/src/app`
- Contains all Next.js pages and layouts
- Implements the app router structure
- Includes global styles and root layouts

### `/src/components`
- `app-providers/`: Global context providers
- `battle/`: Battle-related components
- `layout/`: Layout components including sidebar
- `nft/`: NFT-related components
- `ui/`: Reusable UI components from shadcn/ui

### `/src/core`
- Contains core business logic
- Implements the battle system

### `/src/hooks`
- Custom React hooks for shared functionality

### `/src/lib`
- Utility libraries and helpers
- Storage and blockchain utilities

### `/src/store`
- State management providers
- Handles wallet, NFT, and game state

### `/src/types`
- TypeScript type definitions
- Shared interfaces and types

## Key Files

### Configuration Files
- `next.config.ts`: Next.js configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `components.json`: shadcn/ui configuration

### Core Application Files
- `src/app/layout.tsx`: Main application layout
- `src/app/page.tsx`: Home page
- `src/app/globals.css`: Global styles

### State Management
- `src/store/WalletProvider.tsx`: Wallet state management
- `src/store/NFTProvider.tsx`: NFT state management
- `src/store/GameProvider.tsx`: Game state management

### UI Components
- `src/components/ui/*`: shadcn/ui components
- `src/components/layout/*`: Layout components
- `src/components/battle/*`: Battle-related components
- `src/components/nft/*`: NFT-related components
