# Getting Started

This guide will help you get the Virtual Try-On platform up and running.

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **pnpm** 8+ (install: `npm install -g pnpm`)
- **API Keys**:
  - fal.ai account ([sign up](https://fal.ai/))
  - Replicate account ([sign up](https://replicate.com/)) (optional)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/try-on.git
cd try-on

# Install dependencies
pnpm install
```

## Step 2: Get API Keys

### Nano Banana (Required - Fast Mode)

1. Go to [fal.ai](https://fal.ai/)
2. Sign up for an account
3. Navigate to Dashboard → API Keys
4. Create a new API key
5. Copy the key (starts with `fal_...`)

### IDM-VTON (Optional - Quality Mode)

1. Go to [replicate.com](https://replicate.com/)
2. Sign up for an account
3. Navigate to Account → API Tokens
4. Create a new token
5. Copy the token (starts with `r8_...`)

## Step 3: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your keys
nano .env  # or use your preferred editor
```

**Minimum configuration (Nano Banana only):**
```env
TRYON_PROVIDER=nano-banana
FAL_API_KEY=your_fal_api_key_here
```

**Full configuration (Both providers):**
```env
TRYON_PROVIDER=both
FAL_API_KEY=your_fal_api_key_here
REPLICATE_API_TOKEN=your_replicate_token_here
DEFAULT_QUALITY=fast
ENABLE_FALLBACK=true
```

## Step 4: Test the Installation

### Option A: Run Tests

```bash
# Run all tests
pnpm test

# Or test just the core library
cd packages/core
pnpm test
```

### Option B: Run Example

```bash
# Build the core library first
cd packages/core
pnpm build

# Run the example
node examples/basic-usage.ts
```

## Step 5: Try Your First Virtual Try-On

Create a test file `test-tryon.ts`:

```typescript
import { createTryOnService } from '@try-on/core';

async function test() {
  // Create service
  const service = createTryOnService({
    nanaBanana: {
      apiKey: process.env.FAL_API_KEY!
    }
  });

  // Check if ready
  console.log('Service ready:', await service.isReady());

  // Try on (using public demo images)
  const result = await service.tryOn({
    personImage: 'https://example.com/person.jpg', // Replace with real URL
    garmentImage: 'https://example.com/shirt.jpg', // Replace with real URL
    quality: 'fast'
  });

  console.log('✓ Success!');
  console.log('Result:', result.resultImage);
  console.log('Time:', result.processingTime, 'ms');
}

test().catch(console.error);
```

Run it:
```bash
npx tsx test-tryon.ts
```

## Next Steps

### For Developers

1. **Explore the Core Library**
   - Read [`packages/core/README.md`](packages/core/README.md)
   - Check out more examples in `packages/core/examples/`

2. **Build the Website Plugin**
   - See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) Phase 2

3. **Build the Chrome Extension**
   - See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) Phase 3

### For Merchants

1. **Website Integration**
   - Coming soon: Simple script tag integration
   - Preview: See `examples/integration-demos/`

2. **Shopify App**
   - Coming soon: One-click install from Shopify App Store

## Troubleshooting

### "At least one API provider must be configured"

**Problem**: No API keys provided

**Solution**: Add at least one API key to `.env`:
```env
FAL_API_KEY=your_key_here
```

### "Failed to process try-on"

**Problem**: Invalid API key or network issue

**Solutions**:
- Verify your API key is correct
- Check your internet connection
- Ensure you have credits/quota remaining in your API account

### "Module not found"

**Problem**: Dependencies not installed

**Solution**:
```bash
pnpm install
```

### Tests Failing

**Problem**: Dependencies or build issues

**Solution**:
```bash
# Clean and reinstall
pnpm clean
pnpm install
pnpm build
pnpm test
```

## Development Workflow

```bash
# Start development mode (auto-rebuild on changes)
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm typecheck

# Format code
pnpm format

# Build all packages
pnpm build
```

## Project Structure

```
try-on/
├── packages/
│   ├── core/           # ✓ Implemented - Core library
│   ├── plugin/         # Coming soon - Website plugin
│   ├── extension/      # Coming soon - Chrome extension
│   └── shopify-app/    # Coming soon - Shopify app
├── docs/               # Documentation
├── examples/           # Integration examples
└── scripts/            # Build scripts
```

## API Usage Limits & Costs

### Nano Banana (fal.ai)
- **Cost**: $0.01 per request
- **Speed**: ~3-5 seconds
- **Free tier**: Check fal.ai pricing
- **Rate limits**: Varies by plan

### IDM-VTON (Replicate)
- **Cost**: $0.025 per request (~$1 per 40 runs)
- **Speed**: ~15-20 seconds
- **Free tier**: $5 free credits for new users
- **Rate limits**: Based on available credits

**Cost Example (1000 requests/month):**
- Fast mode only: $10/month
- Quality mode only: $25/month
- Mixed (90% fast, 10% quality): $11.50/month

## Support

- **Documentation**: See [`/docs`](./docs) folder
- **Issues**: [GitHub Issues](https://github.com/your-org/try-on/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/try-on/discussions)

## What's Next?

Check out the [Implementation Plan](IMPLEMENTATION_PLAN.md) to see what we're building next!

Current status: **Phase 1 Complete** ✓
- ✓ Core library with API adapter
- ✓ Both providers integrated (Nano Banana + IDM-VTON)
- ✓ TypeScript types
- ✓ Basic tests
- ⏳ Coming next: Website Plugin
