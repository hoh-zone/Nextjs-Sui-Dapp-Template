# create-nextjs-sui-dapp-template

**中文** | [English](README.md)

用于创建 Next.js 框架 Sui dApp 项目的生成器。该工具可以帮助您快速创建一个新项目，使用 Next.js 构建 Sui dApp

## 安装

您可以使用 `npx` 来在不安装本地副本的情况下使用此模板生成器：

```bash
npx create-nextjs-sui-dapp-template
```

按照提示设置您的项目：

1. 输入您的项目名称
2. 选择您要使用的Sui网络（testnet、mainnet、devnet或localnet），您可以稍后在`.env`文件中更改它

工具将创建一个新目录，名为您的项目名称，建立初始项目结构，并根据您的选择进行设置。

## 入门

创建项目后，导航到项目目录并安装依赖项：

```bash
cd your-project-name
npm install
```
强烈推荐使用`bun.js`来安装依赖项。

```bash
bun install
```

然后，启动服务器：

```bash
npm run dev
```
或者

```bash
bun run dev
```

您可以通过 [http://localhost:3000](http://localhost:3000/) 访问您的 Sui dApp。

## 特征

- 专为 Sui dApp 开发设计的 Next.js 设置
- 根据您的选择，预配置 Sui 网络
- 使用基本的项目结构和组件快速开始

## 贡献

欢迎贡献！请随时提交 PR

## License

本项目采用 MIT License 进行许可。