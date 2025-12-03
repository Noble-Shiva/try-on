#!/usr/bin/env tsx
/**
 * Interactive Demo Script
 *
 * Simple demonstration of the virtual try-on functionality
 * with pre-selected sample images.
 *
 * Usage:
 *   pnpm demo
 *   # or
 *   tsx scripts/demo.ts
 */

import { createTryOnService } from '../packages/core/src';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment
dotenv.config({ path: path.join(__dirname, '../.env') });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function demo() {
  log('\n' + '='.repeat(60), colors.bright);
  log('  Virtual Try-On Demo', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  // Check for API keys
  const falKey = process.env.FAL_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  if (!falKey && !replicateToken) {
    log('❌ No API keys found!', colors.yellow);
    log('\nPlease set up your .env file first:', colors.cyan);
    console.log('  1. cp .env.example .env');
    console.log('  2. Add your API keys to .env');
    console.log('  3. Run this demo again');
    process.exit(1);
  }

  // Create service
  log('🔧 Initializing service...', colors.cyan);
  const config: any = {};
  if (falKey) config.nanaBanana = { apiKey: falKey };
  if (replicateToken) config.idmVton = { apiToken: replicateToken };

  const service = createTryOnService(config);

  // Show available providers
  const providers = await service.getAvailableProviders();
  log(`✓ Service ready with providers: ${providers.join(', ')}`, colors.green);

  // Sample images (public URLs for testing)
  const scenarios = [
    {
      name: 'Blue T-Shirt Try-On',
      personImage: 'https://storage.googleapis.com/falserverless/model_tests/idm-vton/person_image.jpg',
      garmentImage: 'https://storage.googleapis.com/falserverless/model_tests/idm-vton/garment_image.jpg',
      description: 'blue t-shirt',
      quality: 'fast' as const
    }
  ];

  log('\n📸 Demo Scenario:', colors.cyan);
  console.log(`  - ${scenarios[0].name}`);
  console.log(`  - Quality: ${scenarios[0].quality}`);
  console.log(`  - Provider: ${scenarios[0].quality === 'fast' ? 'Nano Banana' : 'IDM-VTON'}`);

  const cost = service.estimateCost({
    personImage: scenarios[0].personImage,
    garmentImage: scenarios[0].garmentImage,
    quality: scenarios[0].quality
  });

  log(`\n💰 Estimated cost: $${cost.toFixed(3)}`, colors.yellow);
  log('⏳ Processing... This may take a few seconds...\n', colors.cyan);

  try {
    const startTime = Date.now();

    const result = await service.tryOn({
      personImage: scenarios[0].personImage,
      garmentImage: scenarios[0].garmentImage,
      quality: scenarios[0].quality,
      garmentDescription: scenarios[0].description
    });

    const duration = Date.now() - startTime;

    log('✅ Success!\n', colors.green);
    log('📊 Results:', colors.bright);
    console.log(`  - Result URL: ${result.resultImage}`);
    console.log(`  - Provider used: ${result.provider}`);
    console.log(`  - Processing time: ${result.processingTime}ms`);
    console.log(`  - Total duration: ${duration}ms`);
    console.log(`  - Cost: $${result.cost || 'N/A'}`);
    console.log(`  - From cache: ${result.cached ? 'Yes' : 'No'}`);

    log('\n💡 Next Steps:', colors.cyan);
    console.log('  - Open the result URL in your browser to see the try-on');
    console.log('  - Try different images by modifying scripts/demo.ts');
    console.log('  - Check out packages/core/README.md for more examples');

  } catch (error: any) {
    log('❌ Demo failed!\n', colors.yellow);
    console.error('Error:', error.message);

    if (error.suggestion) {
      log(`\n💡 Suggestion: ${error.suggestion}`, colors.cyan);
    }
  }

  console.log('');
}

demo().catch(console.error);
