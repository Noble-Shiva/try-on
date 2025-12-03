# Virtual Try-On Platform

An AI-powered virtual try-on solution that works across any website, available as a plugin, Chrome extension, and Shopify app.

## 📋 Documentation

- **[Getting Started Guide](./GETTING_STARTED.md)** - Set up and run your first try-on ⭐
- **[Product Requirements Document (PRD)](./PRD.md)** - Complete product specification and roadmap
- **[API Integration Guide](./API_INTEGRATION_GUIDE.md)** - Technical details for AI API integration
- **[Architecture](./ARCHITECTURE.md)** - Technical architecture and design patterns
- **[Implementation Plan](./IMPLEMENTATION_PLAN.md)** - 12-week development roadmap
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Monorepo organization and conventions

## 🎯 Overview

This platform allows users to virtually try on clothing items they see online by:
1. Automatically detecting apparel images on web pages
2. Adding "Try On" buttons below those images
3. Using AI to generate realistic try-on visualizations

## 🚀 Platform Support

- **Website Plugin** - Embed into any e-commerce site with a single script tag
- **Chrome Extension** - Universal try-on across all fashion websites
- **Shopify App** - Seamless integration with Shopify stores

## 🤖 AI Technology

Powered by state-of-the-art virtual try-on AI models:
- **IDM-VTON** - High-quality results for production use
- **Nano Banana** - Fast processing for real-time experience

## 📦 Project Status

**Current Phase**: Phase 1 Complete ✅

- ✅ Core library with API adapter pattern
- ✅ Both AI providers integrated (Nano Banana + IDM-VTON)
- ✅ Flexible environment-based configuration
- ✅ TypeScript types and comprehensive tests
- ⏳ **Next**: Website Plugin (Phase 2)

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for full roadmap.

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your API keys (get them from fal.ai and replicate.com)

# 3. Build the core library
cd packages/core && pnpm build

# 4. Run tests
pnpm test
```

See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup instructions.

## 💻 Usage Example

```typescript
import { createTryOnService } from '@try-on/core';

// Create service with your API keys
const service = createTryOnService({
  nanaBanana: {
    apiKey: process.env.FAL_API_KEY
  },
  idmVton: {
    apiToken: process.env.REPLICATE_API_TOKEN
  }
});

// Perform try-on
const result = await service.tryOn({
  personImage: 'https://example.com/person.jpg',
  garmentImage: 'https://example.com/shirt.jpg',
  quality: 'fast' // or 'high'
});

console.log('Result:', result.resultImage);
```

## 🛠️ Tech Stack (Planned)

- TypeScript
- Vanilla JS (minimal bundle size)
- Chrome Extension APIs
- Shopify App SDK
- IDM-VTON & Nano Banana APIs

## 📝 License

TBD

## 🤝 Contributing

This project is currently in early development. Contribution guidelines will be added soon.
