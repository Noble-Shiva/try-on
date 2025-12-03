# @try-on/core

Core library for virtual try-on functionality. Supports multiple AI providers with automatic fallback.

## Features

- 🚀 **Multiple Providers**: Nano Banana (fast) and IDM-VTON (quality)
- 🔄 **Automatic Fallback**: Seamlessly switches providers if one fails
- ⚡ **Flexible Configuration**: Environment-based or programmatic setup
- 🎯 **Type-Safe**: Full TypeScript support
- 🧪 **Well Tested**: Comprehensive test coverage

## Installation

```bash
pnpm add @try-on/core
```

## Quick Start

### 1. Set up environment variables

```bash
# Copy example env file
cp .env.example .env

# Add your API keys
FAL_API_KEY=your_fal_api_key
REPLICATE_API_TOKEN=your_replicate_token
```

### 2. Create service instance

```typescript
import { createTryOnService } from '@try-on/core';

const service = createTryOnService({
  nanaBanana: {
    apiKey: process.env.FAL_API_KEY!
  },
  idmVton: {
    apiToken: process.env.REPLICATE_API_TOKEN!
  },
  defaultProvider: 'nano-banana',
  enableFallback: true
});
```

### 3. Perform try-on

```typescript
const result = await service.tryOn({
  personImage: 'https://example.com/person.jpg',
  garmentImage: 'https://example.com/shirt.jpg',
  garmentDescription: 'blue t-shirt',
  quality: 'fast' // or 'high'
});

console.log('Result:', result.resultImage);
console.log('Provider used:', result.provider);
console.log('Processing time:', result.processingTime, 'ms');
```

## Usage Examples

### Fast Mode (Nano Banana)

```typescript
const result = await service.tryOn({
  personImage: personPhotoUrl,
  garmentImage: garmentUrl,
  quality: 'fast', // Uses Nano Banana (~3-5 seconds)
  garmentDescription: 'casual blue t-shirt'
});
```

### Quality Mode (IDM-VTON)

```typescript
const result = await service.tryOn({
  personImage: personPhotoUrl,
  garmentImage: garmentUrl,
  quality: 'high', // Uses IDM-VTON (~15-20 seconds)
  garmentDescription: 'formal white shirt',
  options: {
    idmVton: {
      denoiseSteps: 30,
      isChecked: true
    }
  }
});
```

### With File Upload

```typescript
// From file input
const file = event.target.files[0];

const result = await service.tryOn({
  personImage: file, // Can pass File object directly
  garmentImage: garmentUrl,
  quality: 'fast'
});
```

### Only Nano Banana (No Replicate)

```typescript
const service = createTryOnService({
  nanaBanana: {
    apiKey: process.env.FAL_API_KEY!
  }
  // IDM-VTON not configured
});

// Only 'fast' mode will work
const result = await service.tryOn({
  personImage: personPhotoUrl,
  garmentImage: garmentUrl,
  quality: 'fast'
});
```

### Only IDM-VTON (No Nano Banana)

```typescript
const service = createTryOnService({
  idmVton: {
    apiToken: process.env.REPLICATE_API_TOKEN!
  }
  // Nano Banana not configured
});

// Only 'high' mode will work
const result = await service.tryOn({
  personImage: personPhotoUrl,
  garmentImage: garmentUrl,
  quality: 'high'
});
```

## API Reference

### `createTryOnService(config)`

Creates a new TryOn service instance.

**Parameters:**
- `config.nanaBanana.apiKey` - fal.ai API key
- `config.idmVton.apiToken` - Replicate API token
- `config.defaultProvider` - Default provider ('nano-banana' | 'idm-vton')
- `config.enableFallback` - Enable automatic fallback (default: true)

### `service.tryOn(request)`

Performs virtual try-on.

**Parameters:**
- `request.personImage` - URL or File of person's photo
- `request.garmentImage` - URL or File of garment
- `request.quality` - 'fast' or 'high'
- `request.garmentDescription` - Optional description
- `request.cacheEnabled` - Enable caching (default: true)
- `request.options` - Provider-specific options

**Returns:** `Promise<TryOnResponse>`

### `service.estimateCost(request)`

Estimates cost for a request.

**Returns:** `number` (cost in USD)

### `service.getAvailableProviders()`

Gets list of available providers.

**Returns:** `Promise<string[]>`

### `service.isReady()`

Checks if service is ready.

**Returns:** `Promise<boolean>`

## Types

```typescript
interface TryOnRequest {
  personImage: string | File;
  garmentImage: string | File;
  garmentDescription?: string;
  quality: 'fast' | 'high';
  cacheEnabled?: boolean;
  options?: TryOnOptions;
}

interface TryOnResponse {
  resultImage: string;
  processingTime: number;
  provider: 'nano-banana' | 'idm-vton';
  cached: boolean;
  cost?: number;
  confidence?: number;
}

interface TryOnError {
  code: string;
  message: string;
  retryable: boolean;
  suggestion?: string;
}
```

## Error Handling

```typescript
try {
  const result = await service.tryOn(request);
} catch (error) {
  const tryonError = error as TryOnError;

  console.error('Error:', tryonError.message);
  console.error('Code:', tryonError.code);
  console.error('Suggestion:', tryonError.suggestion);

  if (tryonError.retryable) {
    // Can retry the request
  }
}
```

## Cost Comparison

| Provider | Speed | Quality | Cost per Request |
|----------|-------|---------|------------------|
| Nano Banana | ~4s | Good | $0.01 |
| IDM-VTON | ~19s | Excellent | $0.025 |

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm typecheck

# Build
pnpm build
```

## License

TBD
