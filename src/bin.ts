#!/usr/bin/env node

import minimist = require('minimist');
import { validate, ValidationOptions } from './index';
import { readFileSync } from 'fs';

const pkg = require('../package.json');
const binName = Object.keys(pkg.bin)[0];

interface CliArgs extends minimist.ParsedArgs {
  help: boolean,
  config?: string
}

const args = minimist(process.argv.slice(2), {
  boolean: [
    'help'
  ],
  alias: {
    config: 'c'
  }
}) as CliArgs;

const valdiateOptions = {
  selectors: [args._[0]],
  files: [args._[1]]
};

if (args.config) {
  const fileConfig = JSON.parse(readFileSync(args.config, 'utf8'));
  // Merge all file config attributes into ValidationOptions
  Object.assign(valdiateOptions, fileConfig);
}

if (args.help || !valdiateOptions.selectors || !valdiateOptions.files) {
  console.log(`Usage: ${binName} selectors file`);
  console.log(`  ${binName} "div > span" "**/*.html"`);
  console.log(`  ${binName} -c config.json`);
  process.exit();
}

validate(valdiateOptions)
  .then((result) => {
    console.log(result.resultText);
    console.log('');
    console.log(result.footer);
    if (result.hasMatches) {
      process.exit(1);
    }
  })
  .catch((err) => {
    throw err;
  });
