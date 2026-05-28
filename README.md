# ChainLearn Frontend

AI-powered learning platform with token rewards and verifiable credentials on the Stellar network.

## Overview

ChainLearn is a decentralized learning platform where users can:

- **Browse personalized courses** that adapt to their background, goals, and learning pace
- **Earn LEARN tokens** on the Stellar network by completing courses and passing quizzes
- **Receive verifiable credential NFTs** that prove their skills on-chain
- **Connect via Freighter wallet** for seamless Stellar authentication

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Blockchain**: Stellar SDK + Freighter API
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Auth-related routes (connect, onboarding)
│   ├── dashboard/    # Main dashboard
│   ├── courses/      # Course catalog, detail, modules, quizzes
│   ├── rewards/      # Token balance and claim history
│   ├── credentials/  # Credential management
│   └── verify/       # Public credential verification
├── components/       # Reusable React components
│   ├── ui/           # Base UI components (button, card, input)
│   ├── layout/       # Header, sidebar, mobile nav
│   ├── wallet/       # Wallet connection components
│   ├── course/       # Course-related components
│   ├── rewards/      # Reward display components
│   ├── credentials/  # Credential display components
│   └── shared/       # Loading skeletons, error boundaries, toasts
├── lib/              # Library code
│   ├── api/          # API client and endpoint functions
│   ├── stellar/      # Stellar SDK integration
│   ├── hooks/        # Custom React hooks
│   └── utils/        # Utility functions
├── store/            # Zustand state stores
└── types/            # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Freighter wallet extension](https://freighter.app/) installed in your browser

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_REWARDS_CONTRACT_TESTNET=your_rewards_contract_address
NEXT_PUBLIC_CREDENTIALS_CONTRACT_TESTNET=your_credentials_contract_address
NEXT_PUBLIC_REWARDS_CONTRACT_MAINNET=
NEXT_PUBLIC_CREDENTIALS_CONTRACT_MAINNET=
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Key Features

### Wallet Authentication

Users connect their Stellar wallet via Freighter. The backend issues a challenge, the wallet signs it, and a JWT is returned for subsequent API calls.

### Course System

- **Catalog**: Browse courses filtered by category and difficulty
- **Modules**: Sequential content delivery with progress tracking
- **Quizzes**: Multiple-choice assessments with instant feedback and scoring

### Token Rewards

- Earn LEARN tokens for completing modules and passing quizzes
- Claim pending rewards from the rewards page
- View transaction history with links to Stellar Explorer

### Verifiable Credentials

- On-chain credential NFTs minted upon course completion
- Public verification pages that anyone can access
- Shareable verification links

## Architecture

### State Management

Two Zustand stores manage client state:

- **auth-store**: Persisted wallet address, JWT, and authentication status
- **course-store**: Current course, enrollment data, and progress tracking

### API Layer

A typed fetch wrapper (`apiClient`) handles:

- JWT attachment to authenticated requests
- Error handling with typed `ApiError` objects
- Typed response parsing

### Stellar Integration

- `wallet.ts`: Freighter connection and signing helpers
- `transactions.ts`: Transaction building and submission via Soroban RPC
- `contracts.ts`: Soroban contract interaction for rewards and credentials

## License

MIT
