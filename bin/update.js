#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateFramework() {
  const questions = [
    {
      type: 'input',
      name: 'projectPath',
      message: 'Enter your project path:',
      default: '.'
    },
    {
      type: 'confirm',
      name: 'backupFirst',
      message: 'Do you want to create a backup first?',
      default: true
    },
    {
      type: 'checkbox',
      name: 'updateComponents',
      message: 'Select components to update:',
      choices: [
        { name: 'Sui Query System', value: 'suiQuery', checked: true },
        { name: 'Transaction Hooks', value: 'txHooks', checked: true },
        { name: 'Asset Management', value: 'assets', checked: true },
        { name: 'Dependencies', value: 'dependencies', checked: true },
        { name: 'Configuration Files', value: 'config', checked: false }
      ]
    }
  ];

  const answers = await inquirer.prompt(questions);
  const templateDir = path.join(__dirname, '..', 'template');
  const targetDir = path.resolve(answers.projectPath);

  try {
    // Check if project exists
    if (!await fs.pathExists(targetDir)) {
      console.error(chalk.red(`Error: Project directory ${targetDir} does not exist.`));
      process.exit(1);
    }

    // Check if this is a valid Next.js project
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      console.error(chalk.red(`Error: No package.json found in ${targetDir}. Is this a valid Next.js project?`));
      process.exit(1);
    }

    // Create backup
    if (answers.backupFirst) {
      const backupDir = `${targetDir}-backup-${Date.now()}`;
      await fs.copy(targetDir, backupDir);
      console.log(chalk.green(`Backup created: ${backupDir}`));
    }

    console.log(chalk.blue('Starting framework update...'));

    // Update Sui Query System
    if (answers.updateComponents.includes('suiQuery')) {
      const suiQuerySource = path.join(templateDir, 'utils', 'sui-query');
      const suiQueryTarget = path.join(targetDir, 'utils', 'sui-query');
      
      await fs.ensureDir(path.join(targetDir, 'utils'));
      if (await fs.pathExists(suiQueryTarget)) {
        await fs.remove(suiQueryTarget);
      }
      await fs.copy(suiQuerySource, suiQueryTarget);
      
      // Copy decoder registry file
      const registerSource = path.join(templateDir, 'utils', 'registerDecoders.ts');
      const registerTarget = path.join(targetDir, 'utils', 'registerDecoders.ts');
      await fs.copy(registerSource, registerTarget);
      
      console.log(chalk.green('✅ Updated Sui Query System'));
    }

    // Update Transaction Hooks
    if (answers.updateComponents.includes('txHooks')) {
      const hooksSource = path.join(templateDir, 'hooks');
      const hooksTarget = path.join(targetDir, 'hooks');
      
      await fs.ensureDir(hooksTarget);
      await fs.copy(hooksSource, hooksTarget);
      console.log(chalk.green('✅ Updated Transaction Hooks'));
    }

    // Update Asset Management
    if (answers.updateComponents.includes('assets')) {
      const assetsSource = path.join(templateDir, 'utils', 'assetsHelpers.ts');
      const assetsTarget = path.join(targetDir, 'utils', 'assetsHelpers.ts');
      await fs.ensureDir(path.join(targetDir, 'utils'));
      await fs.copy(assetsSource, assetsTarget);
      console.log(chalk.green('✅ Updated Asset Management'));
    }

    // Update Dependencies
    if (answers.updateComponents.includes('dependencies')) {
      const templatePackageJson = await fs.readJson(path.join(templateDir, 'package.json'));
      const targetPackageJsonPath = path.join(targetDir, 'package.json');
      const targetPackageJson = await fs.readJson(targetPackageJsonPath);

      // Update core packages
      const corePackages = [
        '@mysten/dapp-kit',
        '@mysten/enoki', 
        '@mysten/sui',
        '@tanstack/react-query',
        'next',
        'react',
        'react-dom'
      ];

      corePackages.forEach(pkg => {
        if (templatePackageJson.dependencies[pkg]) {
          targetPackageJson.dependencies[pkg] = templatePackageJson.dependencies[pkg];
        }
      });

      await fs.writeJson(targetPackageJsonPath, targetPackageJson, { spaces: 2 });
      console.log(chalk.green('✅ Updated Dependencies'));
    }

    // Update utils/index.ts
    const utilsIndexSource = path.join(templateDir, 'utils', 'index.ts');
    const utilsIndexTarget = path.join(targetDir, 'utils', 'index.ts');
    
    if (await fs.pathExists(utilsIndexSource)) {
      await fs.ensureDir(path.join(targetDir, 'utils'));
      await fs.copy(utilsIndexSource, utilsIndexTarget);
      console.log(chalk.green('✅ Updated utils exports'));
    }

    console.log(chalk.green('\n🎉 Framework update completed!'));
    
    console.log(chalk.yellow('\n📋 Next steps:'));
    console.log(chalk.cyan('1. Run npm install or bun install to install new dependencies'));
    console.log(chalk.cyan('2. Check and update your import statements'));
    console.log(chalk.cyan('3. Add decoder initialization in providers.tsx'));
    console.log(chalk.cyan('4. Test that all functionality works correctly'));

    console.log(chalk.yellow('\n🔗 Migration guide:'));
    console.log(chalk.blue('https://github.com/Wulabalabo/Nextjs-Sui-Dapp-Template#-migration-guide'));

  } catch (err) {
    console.error(chalk.red('Update failed:'), err);
    process.exit(1);
  }
}

updateFramework(); 