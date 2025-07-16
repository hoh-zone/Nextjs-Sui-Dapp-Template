# Next.js Sui dApp Template

**English** | [中文](README_CN.md)

A comprehensive Next.js template for building Sui blockchain dApps with advanced features including optimized transaction hooks, type-safe query system, and asset management.

## ✨ Features

-  **Next.js 15.4.1** - Latest stable version with App Router
- 💎 **Sui SDK Integration** - Full @mysten/sui support
- 🔌 **dApp Kit** - Complete wallet integration with @mysten/dapp-kit
- 💫 **Enoki Sponsorship** - Sponsored transactions with @mysten/enoki
- 🎨 **Modern UI** - Tailwind CSS with shadcn/ui components
- 📦 **TypeScript** - Full type safety throughout
- 🔄 **React Query** - Optimized data fetching with @tanstack/react-query
- 🛠️ **Advanced Hooks** - Optimized transaction hooks with 60% code reduction
- 🔍 **Type-Safe Query System** - Comprehensive decoder system for query Contract Getter Function
-  **Asset Management** - Built-in asset categorization and balance calculation
- 🌐 **Multi-Network Support** - Testnet and mainnet configuration
- 📱 **Responsive Design** - Mobile-first approach

## 🚀 Quick Start

### Installation

```bash
npx create-nextjs-sui-dapp-template
```

Follow the prompts to set up your project:
1. Enter your project name
2. Choose Sui network (testnet/mainnet)
3. Configure environment variables

### Development

```bash
cd your-project-name

# Install dependencies (recommended: use Bun for faster installation)
bun install
# or
npm install

# Start development server
bun run dev
# or
npm run dev
```

Your Sui dApp will be running at `http://localhost:3000`.

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NEXT_PUBLIC_NETWORK=testnet
ENOKI_SECRET_KEY=your_enoki_api_key  # Optional: for sponsored transactions
MAINNET_PACKAGE_ID=your_mainnet_package_id
TESTNET_PACKAGE_ID=your_testnet_package_id
```

### Network Configuration

The template automatically handles network switching based on `NEXT_PUBLIC_NETWORK`:

```typescript
import { getNetworkVariables, network } from '@/contracts'

// Automatically uses correct network
const variables = getNetworkVariables()
```

## 🔧 Advanced Features

### 1. Optimized Transaction Hooks

**60% code reduction** with centralized callback management:

```typescript
import { useBetterSignAndExecuteTransaction } from '@/hooks/useBetterTx'
import { createBetterTxFactory } from '@/contracts'

// Create transaction function
const borrowTX = createBetterTxFactory<BorrowRequest>((tx, networkVariables, params) => {
    tx.moveCall({
        package: networkVariables.package,
        module: "lending",
        function: "borrow",
        arguments: [
            tx.object(params.collateral),
            tx.pure.u64(params.amount)
        ]
    })
    return tx
})

// Use in component
const { handleSignAndExecuteTransaction, isLoading } = useBetterSignAndExecuteTransaction({
    tx: borrowTX
})

// Execute with full callback chain
const result = await handleSignAndExecuteTransaction({
    collateral: "0x...",
    amount: 1000
})
.beforeExecute(async () => {
    // Validation logic
    return true
})
.onSuccess((result) => {
    console.log('Success:', result)
})
.onError((error) => {
    console.error('Error:', error)
})
.execute()
```

### 2. Type-Safe Query System

Comprehensive decoder system for query contract getter function data;

```typescript
import { QueryBuilder } from '@/utils'
import { MyProjectDecoders } from './decoders'

// Create type-safe queries
const getUserInfo = QueryBuilder.withArgs<[string], UserInfo>(
    'my_module',
    'get_user_info',
    (tx, userAddress) => [tx.pure.address(userAddress)],
    MyProjectDecoders.UserInfo  // Type-safe decoder
)

// Use query
const userInfo = await getUserInfo('0x123...')
if (userInfo) {
    console.log(userInfo.name, userInfo.balance)  // Type-safe access
}
```

### 3. Asset Management

Built-in asset categorization and balance calculation:

```typescript
import { getUserProfile, categorizeSuiObjects } from '@/utils'

// Get user's categorized assets
const userAssets = await getUserProfile(userAddress)

// Access categorized coins and objects
console.log(userAssets.coins)     // All user's coins by type
console.log(userAssets.objects)   // All user's objects by type

// Calculate total balance
const totalBalance = calculateTotalBalance(userAssets.coins['0x2::sui::SUI'])
console.log(formatBalance(totalBalance))  // "1.234567890"
```

### 4. Sponsored Transactions

Optional Enoki integration for sponsored transactions:

```typescript
import { useBetterSignAndExecuteTransactionWithSponsor } from '@/hooks/useBetterTx'

const { handleSponsoredTransaction } = useBetterSignAndExecuteTransactionWithSponsor({
    tx: myTransaction
})

// Execute sponsored transaction
const result = await handleSponsoredTransaction(params)
    .onSuccess((result) => {
        console.log('Sponsored transaction successful')
    })
    .execute()
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes (Sui client, sponsored transactions)
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page with asset display
│   └── providers.tsx      # Global providers with decoder initialization
├── contracts/             # Contract configuration and queries
│   ├── config.ts          # Network-specific contract addresses
│   ├── index.ts           # Network configuration
│   └── query.ts           # Contract query functions
├── hooks/                 # Custom React hooks
│   └── useBetterTx.ts     # Optimized transaction hooks
├── utils/                 # Utility functions
│   ├── assetsHelpers.ts   # Asset categorization and balance calculation
│   ├── sui-query/         # Type-safe query system
│   │   ├── decoders.ts    # Core decoder system
│   │   ├── query.ts       # Query functions
│   │   └── index.ts       # Unified exports
│   ├── registerDecoders.ts # Global decoder registration
│   └── index.ts           # Main exports
├── examples/              # Example implementations
│   ├── projectDecoders.example.ts
│   ├── nextjs-initialization.example.tsx
│   └── typeSafeQueryExamples.ts
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🛠️ Technical Stack

- **Framework**: Next.js 15.4.1 with App Router
- **Blockchain**: Sui (@mysten/sui v1.36.0)
- **Wallet Integration**: @mysten/dapp-kit v0.16.15
- **Sponsored Transactions**: @mysten/enoki v0.6.20
- **State Management**: @tanstack/react-query v5.83.0
- **Styling**: Tailwind CSS with shadcn/ui
- **Type Safety**: TypeScript 5.8.3
- **Code Quality**: ESLint with Next.js config
- **Package Manager**: Bun (recommended) or npm

## 🎯 Key Improvements

### Performance Optimizations
- **60% code reduction** in transaction hooks
- **Centralized callback management**
- **useCallback optimizations** for React performance
- **Async transaction support** with proper error handling

### Type Safety
- **Complete TypeScript support** throughout
- **Type-safe decoder system** for query contract getter function data
- **Compile-time error checking**
- **IDE intelligent suggestions**

### Developer Experience
- **Global decoder registration** for Next.js apps
- **Comprehensive examples** and documentation
- **Modular architecture** with clear separation of concerns
- **Backward compatibility** with existing code

## 🔄 Migration Guide

### From Previous Versions

1. **Update imports**:
   ```typescript
   // Old
   import { ProjectDecoders } from '@/utils'
   
   // New
   import { createTypeSafeDecoders, addProjectDecoder } from '@/utils'
   ```

2. **Initialize decoders** in your app:
   ```typescript
   // In app/providers.tsx
   import { initializeAllDecoders } from '@/utils/registerDecoders'
   
   useEffect(() => {
       initializeAllDecoders()
   }, [])
   ```

3. **Use new query system**:
   ```typescript
   import { QueryBuilder } from '@/utils'
   
   const query = QueryBuilder.withArgs(module, function, argsBuilder, decoder)
   ```

## 🤝 Contributing

We welcome contributions! Please feel free to submit Pull Requests.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [examples](./examples) directory
2. Review the [sui-query README](./utils/sui-query/README.md)
3. Open an issue on GitHub

---

**Built with ❤️ for the Sui ecosystem**

