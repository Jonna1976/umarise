#!/usr/bin/env node

/**
 * Umarise CLI — anchor files to Bitcoin, verify proofs offline.
 * 
 * Usage:
 *   umarise proof  <file>          — full lifecycle (anchor + resolve + verify)
 *   umarise anchor <file>          — hash and anchor only
 *   umarise verify <file> [proof]  — verify a file against its .proof bundle
 * 
 * Configuration:
 *   UMARISE_API_KEY — environment variable (required for anchor/proof)
 */

import { Command } from 'commander';
import { anchorCommand } from '../src/commands/anchor.js';
import { verifyCommand } from '../src/commands/verify.js';
import { proofCommand } from '../src/commands/proof.js';

const program = new Command();

program
  .name('umarise')
  .description('Anchor files to Bitcoin. Verify proofs offline.')
  .version('1.0.0');

program
  .command('anchor <file>')
  .description('Hash a file and anchor it to the Umarise registry')
  .option('--api-key <key>', 'API key (overrides UMARISE_API_KEY env var)')
  .action(async (file, opts) => {
    try {
      await anchorCommand(file, opts);
    } catch (err) {
      console.error(`\n✗ ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('verify <file> [proof]')
  .description('Verify a file against its .proof bundle')
  .action(async (file, proof, opts) => {
    try {
      await verifyCommand(file, proof, opts);
    } catch (err) {
      console.error(`\n✗ ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('proof <file>')
  .description('Full proof lifecycle: anchor, resolve, download, verify — one command')
  .option('--api-key <key>', 'API key (overrides UMARISE_API_KEY env var)')
  .action(async (file, opts) => {
    try {
      await proofCommand(file, opts);
    } catch (err) {
      console.error(`\n✗ ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
