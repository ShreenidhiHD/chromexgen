#!/usr/bin/env node

const inquirer = require('inquirer');
const { generateFiles } = require('../lib/fileGenerator');

async function runCLI() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project Name?',
    },
    {
      type: 'confirm',
      name: 'includePopup',
      message: 'Do you want to include a Popup?',
    },
    {
      type: 'confirm',
      name: 'includeBackground',
      message: 'Do you want to include a Background Script?',
    },
    {
      type: 'checkbox',
      name: 'permissions',
      message: 'Choose permissions:',
      choices: ['storage', 'tabs', 'cookies'],
    },
    {
      type: 'list',
      name: 'bundler',
      message: 'Choose a bundler for your files:',
      choices: ['Webpack', 'None'],
    },
  ]);

  generateFiles(answers);
}

runCLI();
