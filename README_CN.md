# Next.js Sui dApp 模板

**中文** | [English](README.md)

一个功能全面的 Next.js 模板，用于构建 Sui 区块链 dApp，包含优化的交易钩子、类型安全查询系统和资产管理功能。

## ✨ 特性

-  **Next.js 15.4.1** - 最新稳定版本，支持 App Router
- 💎 **Sui SDK 集成** - 完整的 @mysten/sui 支持
-  **dApp Kit** - 完整的钱包集成，支持 @mysten/dapp-kit
- 💫 **Enoki 赞助交易** - 使用 @mysten/enoki 的赞助交易功能
- 🎨 **现代 UI** - Tailwind CSS 配合 shadcn/ui 组件
- 📦 **TypeScript** - 完整的类型安全支持
-  **React Query** - 使用 @tanstack/react-query 优化数据获取
- ️ **高级钩子** - 优化的交易钩子，代码减少 60%
-  **类型安全查询系统** - 全面的解码器系统用于合约检查
-  **资产管理** - 内置资产分类和余额计算
- 🌐 **多网络支持** - Testnet 和 mainnet 配置
- 📱 **响应式设计** - 移动优先的设计理念

## 🚀 快速开始

### 安装

```bash
npx create-nextjs-sui-dapp-template
```

按照提示设置项目：
1. 输入项目名称
2. 选择 Sui 网络（devnet/testnet/mainnet）
3. 配置环境变量

### 开发

```bash
cd your-project-name

# 安装依赖（推荐：使用 Bun 获得更快的安装速度）
bun install
# 或
npm install

# 启动开发服务器
bun run dev
# 或
npm run dev
```

您的 Sui dApp 将在 `http://localhost:3000` 上运行。

## ⚙️ 配置

### 环境变量

复制 `.env.example` 到 `.env` 并配置：

```env
NEXT_PUBLIC_NETWORK=testnet
ENOKI_SECRET_KEY=your_enoki_api_key  # 可选：用于赞助交易
MAINNET_PACKAGE_ID=your_mainnet_package_id
TESTNET_PACKAGE_ID=your_testnet_package_id
```

### 网络配置

模板根据 `NEXT_PUBLIC_NETWORK` 自动处理网络切换：

```typescript
import { getNetworkVariables, network } from '@/contracts'

// 自动使用正确的网络
const variables = getNetworkVariables()
```

##  高级功能

### 1. 优化的交易钩子

**代码减少 60%**，集中式回调管理：

```typescript
import { useBetterSignAndExecuteTransaction } from '@/hooks/useBetterTx'
import { createBetterTxFactory } from '@/contracts'

// 创建交易函数
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

// 在组件中使用
const { handleSignAndExecuteTransaction, isLoading } = useBetterSignAndExecuteTransaction({
    tx: borrowTX
})

// 执行完整的回调链
const result = await handleSignAndExecuteTransaction({
    collateral: "0x...",
    amount: 1000
})
.beforeExecute(async () => {
    // 验证逻辑
    return true
})
.onSuccess((result) => {
    console.log('成功:', result)
})
.onError((error) => {
    console.error('错误:', error)
})
.execute()
```

### 2. 类型安全查询系统

全面的解码器系统用于合约检查：

```typescript
import { QueryBuilder } from '@/utils'
import { MyProjectDecoders } from './decoders'

// 创建类型安全查询
const getUserInfo = QueryBuilder.withArgs<[string], UserInfo>(
    'my_module',
    'get_user_info',
    (tx, userAddress) => [tx.pure.address(userAddress)],
    MyProjectDecoders.UserInfo  // 类型安全解码器
)

// 使用查询
const userInfo = await getUserInfo('0x123...')
if (userInfo) {
    console.log(userInfo.name, userInfo.balance)  // 类型安全访问
}
```

### 3. 资产管理

内置资产分类和余额计算：

```typescript
import { getUserProfile, categorizeSuiObjects } from '@/utils'

// 获取用户的分类资产
const userAssets = await getUserProfile(userAddress)

// 访问分类的币种和对象
console.log(userAssets.coins)     // 用户的所有币种（按类型）
console.log(userAssets.objects)   // 用户的所有对象（按类型）

// 计算总余额
const totalBalance = calculateTotalBalance(userAssets.coins['0x2::sui::SUI'])
console.log(formatBalance(totalBalance))  // "1.234567890"
```

### 4. 赞助交易

可选的 Enoki 集成用于赞助交易：

```typescript
import { useBetterSignAndExecuteTransactionWithSponsor } from '@/hooks/useBetterTx'

const { handleSponsoredTransaction } = useBetterSignAndExecuteTransactionWithSponsor({
    tx: myTransaction
})

// 执行赞助交易
const result = await handleSponsoredTransaction(params)
    .onSuccess((result) => {
        console.log('赞助交易成功')
    })
    .execute()
```

##  项目结构

```
├── app
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

##  技术栈

- **框架**: Next.js 15.4.1 支持 App Router
- **区块链**: Sui (@mysten/sui v1.36.0)
- **钱包集成**: @mysten/dapp-kit v0.16.15
- **赞助交易**: @mysten/enoki v0.6.20
- **状态管理**: @tanstack/react-query v5.83.0
- **样式**: Tailwind CSS 配合 shadcn/ui
- **类型安全**: TypeScript 5.8.3
- **代码质量**: ESLint 配合 Next.js 配置
- **包管理器**: Bun (推荐) 或 npm

##  关键改进

### 性能优化
- **60% 代码减少** 在交易钩子中
- **集中式回调管理**
- **useCallback 优化** 用于 React 性能
- **异步交易支持** 带有适当的错误处理

### 类型安全
- **完整的 TypeScript 支持** 贯穿始终
- **类型安全解码器系统** 用于合约检查
- **编译时错误检查**
- **IDE 智能提示**

### 开发者体验
- **Next.js 应用的全局解码器注册**
- **全面的示例和文档**
- **模块化架构** 清晰的职责分离
- **向后兼容** 现有代码

## 🔄 迁移指南

### 自动更新（推荐）

更新现有项目最简单的方法是使用我们的自动更新脚本：

```bash
# 全局安装或更新模板工具
npm install -g create-nextjs-sui-dapp-template@latest

# 在您的项目目录中运行更新脚本
npx update-nextjs-sui-dapp-template

# 或者如果已经全局安装
update-nextjs-sui-dapp-template
```

更新脚本将：
- ✅ 自动创建项目备份
- ✅ 允许您选择性更新框架组件
- ✅ 更新依赖包版本
- ✅ 提供详细的后续步骤指导

### 从旧版本手动迁移

如果您喜欢手动控制更新过程：

1. **备份项目**：
   ```bash
   cp -r my-project my-project-backup
   ```

2. **更新核心依赖**：
   ```bash
   npm install @mysten/dapp-kit@^0.16.15 @mysten/enoki@^0.6.20 @mysten/sui@^1.36.0 @tanstack/react-query@^5.83.0 next@^15.4.1
   ```

3. **从最新模板复制核心文件**：
   - `utils/sui-query/` 整个目录
   - `hooks/useBetterTx.ts`
   - `utils/registerDecoders.ts`
   - `utils/assetsHelpers.ts`
   - `utils/index.ts`

4. **更新导入**:
   ```typescript
   // 旧
   import { ProjectDecoders } from '@/utils'
   
   // 新
   import { createTypeSafeDecoders, addProjectDecoder } from '@/utils'
   ```

5. **在您的应用中初始化解码器**:
   ```typescript
   // 在 app/providers.tsx 中
   import { initializeAllDecoders } from '@/utils/registerDecoders'
   
   useEffect(() => {
       initializeAllDecoders()
   }, [])
   ```

6. **使用新的查询系统**:
   ```typescript
   import { QueryBuilder } from '@/utils'
   
   const query = QueryBuilder.withArgs(module, function, argsBuilder, decoder)
   ```

### 版本对比

| 功能 | 旧版本 | 新版本 (v1.2.0) |
|------|--------|------------------|
| 交易钩子 | 基础版本 | **60% 代码减少**，集中式回调管理 |
| 查询系统 | 基础查询 | **类型安全**解码器系统 |
| 资产管理 | 手动处理 | **内置**分类和余额计算 |
| 解码器注册 | 手动管理 | **全局自动**注册机制 |
| Next.js 版本 | 14.x | **15.4.1** 最新版本 |

### 更新验证清单

更新完成后，请验证：

- [ ] 所有导入语句正确
- [ ] 解码器初始化正常运行
- [ ] 交易功能正常工作
- [ ] 查询函数返回正确数据
- [ ] 资产显示正确
- [ ] 没有 TypeScript 错误

## 🤝 贡献

我们欢迎贡献！请随时提交 Pull Requests。

## 📄 许可证

本项目采用 MIT License 进行许可。

## 🆘 支持

对于问题和问题：
1. 检查 [examples](./examples) 目录
2. 查看 [sui-query README](./utils/sui-query/README.md)
3. 在 GitHub 上打开一个问题

---

**Built with ❤️ for the Sui ecosystem**