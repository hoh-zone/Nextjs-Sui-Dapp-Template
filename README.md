# create-nextjs-sui-dapp-template

**English** | [中文](README_CN.md)

一个用于快速创建基于 Next.js 的 Sui dApp 项目的模板生成器。这个工具可以帮助您快速搭建一个现代化的 Sui dApp 项目。

## 特性

- 🚀 基于 Next.js 15.2.4 构建
- 💎 集成 Sui SDK (@mysten/sui)
- 🔌 内置 dApp Kit (@mysten/dapp-kit)
- 💫 集成 Enoki (@mysten/enoki) 支持赞助交易
- 🎨 使用 Tailwind CSS 进行样式管理
- 📦 支持 TypeScript
- 🔄 集成 React Query 用于数据获取
- 🛠️ 完整的开发工具链配置

## 安装

您可以通过 `npx` 直接使用此模板生成器，无需本地安装：

```bash
npx create-nextjs-sui-dapp-template
```

按照提示进行项目设置：

1. 输入项目名称
2. 选择要使用的 Sui 网络（devnet、testnet 或 mainnet）
   - 注意：您可以在 `.env` 文件中随时更改网络设置

## 快速开始

创建项目后，进入项目目录并安装依赖：

```bash
cd your-project-name
```

推荐使用 `bun.js` 安装依赖（更快）：

```bash
bun install
```

或者使用 npm：

```bash
npm install
```

启动开发服务器：

```bash
bun run dev
# 或
npm run dev
```

您的 Sui dApp 将在 `http://localhost:3000` 上运行。

## 环境配置

复制 `.env.example` 文件并重命名为 `.env`，然后配置以下环境变量：

```env
NEXT_PUBLIC_NETWORK=testnet
ENOKI_SECRET_KEY=your_enoki_api_key  # 用于赞助交易的 Enoki API 密钥, 不提供则不会启用
MAINNET_PACKAGE_ID=""  
TESTNET_PACKAGE_ID=""  
..... # 添加自己需要的地址
```

## 合约交互说明

本项目提供了 `useBetterSignAndExecuteTransaction` hook 用于与 Sui 智能合约进行交互。使用前需要配置对应的合约包 ID：

1. 首先使用 `createBetterTxFactory` 创建交易函数：
```typescript
import { createBetterTxFactory } from '@/contracts';

// 定义交易参数类型
type fooRequest = {
    object: string,
    string: string,
    u8: number,
}

// 创建交易函数
export const foo = createBetterTxFactory<fooRequest>((tx, networkVariables, params) => {
    tx.moveCall({
        package: networkVariables.package,
        module: "boo",
        function: "foo",
        arguments: [
            tx.object(params.object),
            tx.pure.string(params.string),
            tx.pure.u8(params.u8)
        ]
    })
    return tx;
});
```

2. 然后在组件中使用 `useBetterSignAndExecuteTransaction` 调用交易：
```typescript
import { useBetterSignAndExecuteTransaction } from '@/hooks/useBetterTx';
import { foo, fooRequest } from '@/contracts/transactions';

// 在组件中使用
const { handleSignAndExecuteTransaction, isLoading } = useBetterSignAndExecuteTransaction({
  tx: foo,
});

// 调用合约方法
const tx = await handleSignAndExecuteTransaction({
  object: "0x...",
  string: "example",
  u8: 1
})
  .beforeExecute(async () => {
    // 执行前的验证逻辑
    return true;
  })
  .onSuccess((result) => {
    // 交易成功后的处理
    console.log('Transaction successful:', result);
  })
  .onError((error) => {
    // 错误处理
    console.error('Transaction failed:', error);
  })
  .execute();
```

3. 合约包 ID 会根据 `NEXT_PUBLIC_NETWORK` 环境变量自动选择对应的网络。

## Enoki 赞助交易使用说明

本项目集成了 Enoki 赞助交易功能，只有在 `.env` 文件中配置了 `ENOKI_SECRET_KEY` 后，赞助交易功能才会启用。

## 项目结构

```
├── app/              # Next.js 应用目录
├── components/       # React 组件
├── contracts/        # Sui 智能合约
├── hooks/           # 自定义 React Hooks
├── public/          # 静态资源
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

## 技术栈

- **框架**: Next.js 15.2.4
- **区块链**: Sui (@mysten/sui)
- **状态管理**: React Query
- **样式**: Tailwind CSS
- **类型检查**: TypeScript
- **代码规范**: ESLint

## 贡献

欢迎提交 Pull Request 来改进这个项目！

## 许可证

本项目采用 MIT 许可证。

