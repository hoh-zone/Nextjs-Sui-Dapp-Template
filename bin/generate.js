#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateProject() {
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      default: 'my-sui-dapp'
    },
    {
      type: 'list',
      name: 'network',
      message: 'Which Sui network do you want to use? (defult testnet)',
      choices: ['devnet','testnet', 'mainnet'],
      default: 'testnet'
    }
  ];

  const answers = await inquirer.prompt(questions);

  const templateDir = path.join(__dirname, '..', 'template');
  const targetDir = path.join(process.cwd(), answers.projectName);

  try {
    // Check if directory already exists
    if (await fs.pathExists(targetDir)) {
      console.error(chalk.red(`Error: Directory ${answers.projectName} already exists.`));
      process.exit(1);
    }

    // Copy template to target directory
    await fs.copy(templateDir, targetDir);
    console.log(chalk.green(`Created project directory: ${targetDir}`));

    // Update package.json
    const packageJsonPath = path.join(targetDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = answers.projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.green('Updated package.json'));

    // Create .env file
    const envPath = path.join(targetDir, '.env');
    await fs.writeFile(envPath, `NEXT_PUBLIC_NETWORK=${answers.network}\n`);
    console.log(chalk.green('Created .env file'));

    // Update README.md
    const readmePath = path.join(targetDir, 'README.md');
    let readmeContent = await fs.readFile(readmePath, 'utf8');
    readmeContent = readmeContent.replace(/{{PROJECT_NAME}}/g, answers.projectName);
    await fs.writeFile(readmePath, readmeContent);
    console.log(chalk.green('Updated README.md'));

    // Git init
    try {
      execSync('git init', { cwd: targetDir, stdio: 'ignore' });
      console.log(chalk.green('Initialized a new Git repository'));
    } catch (gitError) {
      console.warn(chalk.yellow('⚠️ Git init failed. You can initialize it manually.'));
    }

    console.log(chalk.green(`\nProject ${answers.projectName} has been created successfully!`));
    console.log(chalk.yellow('\nTo get started, run the following commands:'));
    console.log(chalk.cyan(`\ncd ${answers.projectName}`));
    console.log(chalk.cyan('npm install'));
    console.log(chalk.cyan('npm run dev'));

  } catch (err) {
    console.error(chalk.red('Error creating project:'), err);
    process.exit(1);
  }
}

generateProject();