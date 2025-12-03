#!/usr/bin/env tsx
/**
 * API Verification Script
 *
 * This script tests your API keys and verifies that both providers work correctly.
 * Run this after setting up your .env file to ensure everything is configured properly.
 *
 * Usage:
 *   pnpm verify-api
 *   # or
 *   tsx scripts/verify-api.ts
 */

import { createTryOnService } from '../packages/core/src';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.cyan);
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function logHeader(message: string) {
  log(`\n${colors.bright}${message}${colors.reset}`, colors.blue);
  log('='.repeat(60), colors.blue);
}

/**
 * Check environment variables
 */
function checkEnvironment() {
  logHeader('Checking Environment Variables');

  const falKey = process.env.FAL_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  if (!falKey && !replicateToken) {
    logError('No API keys found!');
    logInfo('Please set up your .env file:');
    console.log('  1. cp .env.example .env');
    console.log('  2. Edit .env and add your API keys');
    console.log('  3. Get keys from:');
    console.log('     - Nano Banana: https://fal.ai/dashboard/keys');
    console.log('     - IDM-VTON: https://replicate.com/account/api-tokens');
    process.exit(1);
  }

  if (falKey) {
    logSuccess(`Nano Banana API key found: ${falKey.substring(0, 10)}...`);
  } else {
    logWarning('Nano Banana API key not found (optional)');
  }

  if (replicateToken) {
    logSuccess(`IDM-VTON API token found: ${replicateToken.substring(0, 10)}...`);
  } else {
    logWarning('IDM-VTON API token not found (optional)');
  }

  return { falKey, replicateToken };
}

/**
 * Test service initialization
 */
async function testServiceInitialization(falKey?: string, replicateToken?: string) {
  logHeader('Testing Service Initialization');

  try {
    const config: any = {};

    if (falKey) {
      config.nanaBanana = { apiKey: falKey };
    }

    if (replicateToken) {
      config.idmVton = { apiToken: replicateToken };
    }

    const service = createTryOnService(config);
    logSuccess('Service created successfully');

    // Check if service is ready
    const isReady = await service.isReady();
    if (isReady) {
      logSuccess('Service is ready');
    } else {
      logError('Service is not ready');
      return null;
    }

    // Get available providers
    const providers = await service.getAvailableProviders();
    logSuccess(`Available providers: ${providers.join(', ')}`);

    return service;
  } catch (error) {
    logError(`Failed to initialize service: ${(error as Error).message}`);
    return null;
  }
}

/**
 * Test provider with sample images
 */
async function testProvider(
  service: any,
  quality: 'fast' | 'high',
  providerName: string
) {
  logHeader(`Testing ${providerName} (${quality} mode)`);

  // Sample images (these are placeholder URLs - in real test you'd use actual images)
  const SAMPLE_PERSON_IMAGE = 'https://storage.googleapis.com/falserverless/model_tests/idm-vton/person_image.jpg';
  const SAMPLE_GARMENT_IMAGE = 'https://storage.googleapis.com/falserverless/model_tests/idm-vton/garment_image.jpg';

  logInfo('Using sample images for testing...');
  logInfo(`Person image: ${SAMPLE_PERSON_IMAGE}`);
  logInfo(`Garment image: ${SAMPLE_GARMENT_IMAGE}`);

  try {
    // Estimate cost first
    const estimatedCost = service.estimateCost({
      personImage: SAMPLE_PERSON_IMAGE,
      garmentImage: SAMPLE_GARMENT_IMAGE,
      quality
    });
    logInfo(`Estimated cost: $${estimatedCost.toFixed(3)}`);

    // Confirm before proceeding
    logWarning(`This will make a real API call and charge ~$${estimatedCost.toFixed(3)} to your account.`);
    logInfo('To skip API tests, press Ctrl+C now...');
    logInfo('Proceeding in 3 seconds...');

    await new Promise(resolve => setTimeout(resolve, 3000));

    logInfo('Making API request...');
    const startTime = Date.now();

    const result = await service.tryOn({
      personImage: SAMPLE_PERSON_IMAGE,
      garmentImage: SAMPLE_GARMENT_IMAGE,
      quality,
      garmentDescription: 'blue t-shirt'
    });

    const duration = Date.now() - startTime;

    logSuccess(`${providerName} test passed!`);
    console.log('');
    log('  Result Details:', colors.bright);
    console.log(`  - Result URL: ${result.resultImage}`);
    console.log(`  - Provider: ${result.provider}`);
    console.log(`  - Processing time: ${result.processingTime}ms`);
    console.log(`  - Total duration: ${duration}ms`);
    console.log(`  - Cost: $${result.cost || 'N/A'}`);
    console.log(`  - Cached: ${result.cached ? 'Yes' : 'No'}`);

    return true;
  } catch (error: any) {
    logError(`${providerName} test failed!`);
    console.log(`  Error: ${error.message}`);

    if (error.code) {
      console.log(`  Error Code: ${error.code}`);
    }

    if (error.suggestion) {
      logInfo(`  Suggestion: ${error.suggestion}`);
    }

    // Check for common errors
    if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      logWarning('  This looks like an authentication error.');
      logInfo('  Please check that your API key is correct.');
    } else if (error.message?.includes('402') || error.message?.includes('payment')) {
      logWarning('  This looks like a billing/payment error.');
      logInfo('  Please check that you have credits/quota in your account.');
    } else if (error.message?.includes('timeout')) {
      logWarning('  Request timed out.');
      logInfo('  This provider may be experiencing issues. Try again later.');
    }

    return false;
  }
}

/**
 * Main test function
 */
async function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('  Virtual Try-On API Verification', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  logInfo('This script will test your API configuration and verify that');
  logInfo('both providers (Nano Banana and IDM-VTON) are working correctly.\n');

  // Step 1: Check environment
  const { falKey, replicateToken } = checkEnvironment();

  // Step 2: Initialize service
  const service = await testServiceInitialization(falKey, replicateToken);
  if (!service) {
    logError('\nService initialization failed. Cannot proceed with tests.');
    process.exit(1);
  }

  // Step 3: Test providers
  const results: any = {
    nanaBanana: null,
    idmVton: null
  };

  if (falKey) {
    logInfo('\nTesting Nano Banana (Fast Mode)...');
    results.nanoBanana = await testProvider(service, 'fast', 'Nano Banana');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between tests
  } else {
    logWarning('\nSkipping Nano Banana test (no API key)');
  }

  if (replicateToken) {
    logInfo('\nTesting IDM-VTON (Quality Mode)...');
    results.idmVton = await testProvider(service, 'high', 'IDM-VTON');
  } else {
    logWarning('\nSkipping IDM-VTON test (no API token)');
  }

  // Summary
  logHeader('Test Summary');

  const nanaBananaStatus = !falKey ? '⊘ Not configured' :
                          results.nanaBanana ? '✓ Working' : '✗ Failed';
  const idmVtonStatus = !replicateToken ? '⊘ Not configured' :
                        results.idmVton ? '✓ Working' : '✗ Failed';

  console.log(`  Nano Banana (Fast):  ${nanaBananaStatus}`);
  console.log(`  IDM-VTON (Quality):  ${idmVtonStatus}`);

  const anySuccess = results.nanaBanana || results.idmVton;
  const allConfiguredWorking =
    (!falKey || results.nanaBanana) &&
    (!replicateToken || results.idmVton);

  console.log('');

  if (allConfiguredWorking && anySuccess) {
    logSuccess('All configured providers are working! 🎉');
    logInfo('You\'re ready to start building the virtual try-on platform.');
  } else if (anySuccess) {
    logWarning('Some providers are working, but not all.');
    logInfo('You can proceed with the working providers.');
  } else {
    logError('All provider tests failed.');
    logInfo('Please check your API keys and try again.');
    process.exit(1);
  }

  console.log('');
}

// Run the verification
main().catch((error) => {
  logError(`\nUnexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
