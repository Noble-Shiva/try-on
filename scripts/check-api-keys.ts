#!/usr/bin/env tsx
/**
 * API Key Checker
 *
 * Quick script to validate your API keys without making any API calls.
 * This won't charge you anything.
 *
 * Usage:
 *   pnpm check-keys
 *   # or
 *   tsx scripts/check-api-keys.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '../.env');

  if (!fs.existsSync(envPath)) {
    log('\n❌ No .env file found!', colors.red);
    log('\n📝 To create one:', colors.cyan);
    console.log('  1. Copy the example: cp .env.example .env');
    console.log('  2. Edit .env and add your API keys');
    return false;
  }

  log('\n✓ .env file exists', colors.green);
  return true;
}

function validateApiKey(key: string | undefined, name: string, expectedPrefix: string) {
  log(`\n🔑 ${name}:`, colors.bright);

  if (!key) {
    log('  Status: ❌ Not configured', colors.red);
    log(`  Action: Add ${name.toUpperCase().replace(/ /g, '_')}_KEY to .env`, colors.cyan);
    return false;
  }

  // Check prefix
  if (!key.startsWith(expectedPrefix)) {
    log('  Status: ⚠️  Invalid format', colors.yellow);
    log(`  Expected: Key should start with "${expectedPrefix}"`, colors.cyan);
    log(`  Received: Key starts with "${key.substring(0, 5)}"`, colors.yellow);
    return false;
  }

  // Check length
  if (key.length < 20) {
    log('  Status: ⚠️  Too short', colors.yellow);
    log('  Action: Check that you copied the full key', colors.cyan);
    return false;
  }

  log('  Status: ✓ Looks valid', colors.green);
  log(`  Format: ${key.substring(0, 15)}...`, colors.cyan);
  log(`  Length: ${key.length} characters`, colors.cyan);
  return true;
}

function provideGetKeyInstructions(provider: string, url: string) {
  log(`\n📚 How to get ${provider} API key:`, colors.cyan);
  console.log(`  1. Visit: ${url}`);
  console.log('  2. Sign up or log in');
  console.log('  3. Navigate to API keys/tokens');
  console.log('  4. Create a new key');
  console.log('  5. Copy and paste into your .env file');
}

function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('  API Key Validator', colors.bright);
  log('='.repeat(60), colors.bright);

  // Check .env exists
  if (!checkEnvFile()) {
    return;
  }

  const falKey = process.env.FAL_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  // Validate Nano Banana
  const falValid = validateApiKey(falKey, 'Nano Banana (fal.ai)', 'fal_');
  if (!falValid && !falKey) {
    provideGetKeyInstructions('Nano Banana', 'https://fal.ai/dashboard/keys');
  }

  // Validate IDM-VTON
  const replicateValid = validateApiKey(replicateToken, 'IDM-VTON (Replicate)', 'r8_');
  if (!replicateValid && !replicateToken) {
    provideGetKeyInstructions('Replicate', 'https://replicate.com/account/api-tokens');
  }

  // Summary
  log('\n' + '='.repeat(60), colors.bright);
  log('  Summary', colors.bright);
  log('='.repeat(60), colors.bright);

  const totalConfigured = (falKey ? 1 : 0) + (replicateToken ? 1 : 0);
  const totalValid = (falValid ? 1 : 0) + (replicateValid ? 1 : 0);

  console.log(`  Configured: ${totalConfigured}/2 providers`);
  console.log(`  Valid: ${totalValid}/${totalConfigured || 1} keys`);

  if (totalValid === 0) {
    log('\n❌ No valid API keys found', colors.red);
    log('Please add at least one API key to .env', colors.cyan);
  } else if (totalValid < totalConfigured) {
    log('\n⚠️  Some API keys need attention', colors.yellow);
    log('Review the issues above and fix your .env file', colors.cyan);
  } else {
    log('\n✅ All configured API keys look valid!', colors.green);
    log('\n💡 Next steps:', colors.cyan);
    console.log('  - Run tests: pnpm test');
    console.log('  - Verify APIs: pnpm verify-api');
    console.log('  - Try demo: pnpm demo');
  }

  console.log('');
}

main();
