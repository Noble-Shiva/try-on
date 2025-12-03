/**
 * Basic usage example for @try-on/core
 */

import { createTryOnService } from '../src';

async function main() {
  // 1. Create service instance with both providers
  const service = createTryOnService({
    nanoBanana: {
      apiKey: process.env.FAL_API_KEY || 'your-fal-api-key'
    },
    idmVton: {
      apiToken: process.env.REPLICATE_API_TOKEN || 'your-replicate-token'
    },
    defaultProvider: 'nano-banana',
    enableFallback: true
  });

  // 2. Check if service is ready
  const isReady = await service.isReady();
  console.log('Service ready:', isReady);

  // 3. Get available providers
  const providers = await service.getAvailableProviders();
  console.log('Available providers:', providers);

  // 4. Example: Fast try-on (Nano Banana)
  console.log('\n--- Fast Mode (Nano Banana) ---');

  try {
    const fastResult = await service.tryOn({
      personImage: 'https://example.com/person.jpg',
      garmentImage: 'https://example.com/shirt.jpg',
      quality: 'fast',
      garmentDescription: 'blue t-shirt'
    });

    console.log('✓ Success!');
    console.log('  Result URL:', fastResult.resultImage);
    console.log('  Provider:', fastResult.provider);
    console.log('  Time:', fastResult.processingTime, 'ms');
    console.log('  Cost:', fastResult.cost);
  } catch (error) {
    console.error('✗ Failed:', error);
  }

  // 5. Example: Quality try-on (IDM-VTON)
  console.log('\n--- Quality Mode (IDM-VTON) ---');

  try {
    const qualityResult = await service.tryOn({
      personImage: 'https://example.com/person.jpg',
      garmentImage: 'https://example.com/dress.jpg',
      quality: 'high',
      garmentDescription: 'elegant black dress',
      options: {
        idmVton: {
          denoiseSteps: 30,
          isChecked: true
        }
      }
    });

    console.log('✓ Success!');
    console.log('  Result URL:', qualityResult.resultImage);
    console.log('  Provider:', qualityResult.provider);
    console.log('  Time:', qualityResult.processingTime, 'ms');
    console.log('  Cost:', qualityResult.cost);
  } catch (error) {
    console.error('✗ Failed:', error);
  }

  // 6. Estimate cost before running
  const estimatedCost = service.estimateCost({
    personImage: '',
    garmentImage: '',
    quality: 'fast'
  });
  console.log('\nEstimated cost (fast):', estimatedCost);
}

// Run the example
main().catch(console.error);
