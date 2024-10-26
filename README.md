# create-nextjs-sui-dapp-template

**English** | [中文](README_CN.md)

A generator for Next.js Sui dApp projects. This tool helps you quickly set up a new Sui dApp project using Next.js.

## Installation

You can use this template generator without installing it locally by using `npx`:

```bash
npx create-nextjs-sui-dapp-template
```

Follow the prompts to set up your project:

1. Enter your project name
2. Choose the Sui network you want to use (testnet, mainnet, devnet, or localnet)，you can change the network later in the `.env` file

The tool will create a new directory with your project name, set up the initial project structure, and configure it based on your choices.

## Getting Started

After creating your project, navigate to the project directory and install dependencies:

```bash
cd your-project-name
npm install
```
higly recommend using `bun.js` to install dependencies.

```bash
bun install
```

Then, start the development server:

```bash
npm run dev
```
or

```bash
bun run dev
```

Your Sui dApp will be available at `http://localhost:3000`.

## Features

- Next.js setup optimized for Sui dApp development
- Pre-configured for the selected Sui network
- Basic project structure and components to get you started quickly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

