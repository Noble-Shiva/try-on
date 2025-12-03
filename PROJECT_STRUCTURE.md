# Project Structure Guide

## Overview

This document outlines the complete project structure for the Virtual Try-On platform, including directory organization, file naming conventions, and setup instructions.

---

## Repository Structure (Monorepo)

```
try-on/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                      # CI pipeline
│   │   ├── deploy-plugin.yml           # Deploy website plugin
│   │   ├── deploy-extension.yml        # Deploy Chrome extension
│   │   └── deploy-shopify.yml          # Deploy Shopify app
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── docs/
│   ├── PRD.md                          # Product Requirements Document
│   ├── ARCHITECTURE.md                 # Technical Architecture
│   ├── IMPLEMENTATION_PLAN.md          # Implementation Roadmap
│   ├── API_INTEGRATION_GUIDE.md        # API Integration Guide
│   ├── PROJECT_STRUCTURE.md            # This file
│   └── CONTRIBUTING.md                 # Contribution guidelines
│
├── packages/
│   ├── core/                           # ⭐ Core shared library
│   ├── plugin/                         # 🌐 Website plugin
│   ├── extension/                      # 🔌 Chrome extension
│   └── shopify-app/                    # 🛍️ Shopify app
│
├── examples/
│   ├── simple-shop/                    # Example e-commerce site
│   ├── integration-demos/              # Various integration examples
│   └── test-pages/                     # Test HTML pages
│
├── scripts/
│   ├── setup.sh                        # Initial setup script
│   ├── build-all.sh                    # Build all packages
│   ├── test-all.sh                     # Run all tests
│   └── release.sh                      # Release script
│
├── .env.example                        # Environment variables template
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── package.json                        # Root package.json
├── pnpm-workspace.yaml                 # PNPM workspace config
├── turbo.json                          # Turborepo config
├── tsconfig.base.json                  # Base TypeScript config
├── LICENSE
└── README.md
```

---

## Package: Core Library

Location: `packages/core/`

```
packages/core/
├── src/
│   ├── index.ts                        # Main entry point & exports
│   │
│   ├── detection/
│   │   ├── index.ts                    # Detection exports
│   │   ├── ImageDetector.ts            # Main detector class
│   │   ├── DOMScanner.ts               # DOM scanning utilities
│   │   ├── ClassifierService.ts        # Image classification
│   │   ├── heuristics.ts               # Heuristic algorithms
│   │   └── types.ts                    # Detection types
│   │
│   ├── api/
│   │   ├── index.ts                    # API exports
│   │   ├── TryOnService.ts             # Main service orchestrator
│   │   ├── NanoBananaClient.ts         # Nano Banana API client
│   │   ├── IDMVTONClient.ts            # IDM-VTON API client
│   │   ├── CacheManager.ts             # Result caching
│   │   ├── RateLimiter.ts              # Rate limiting
│   │   └── types.ts                    # API types
│   │
│   ├── storage/
│   │   ├── index.ts                    # Storage exports
│   │   ├── PhotoStorage.ts             # Photo management
│   │   ├── LocalStorageWrapper.ts      # localStorage adapter
│   │   ├── IndexedDBStorage.ts         # IndexedDB adapter
│   │   ├── StorageFactory.ts           # Storage factory
│   │   └── types.ts                    # Storage types
│   │
│   ├── ui/
│   │   ├── index.ts                    # UI exports
│   │   ├── components/
│   │   │   ├── TryOnButton.ts          # Try-on button component
│   │   │   ├── Modal.ts                # Result modal
│   │   │   ├── PhotoUploader.ts        # Photo upload UI
│   │   │   ├── LoadingSpinner.ts       # Loading indicator
│   │   │   ├── Toast.ts                # Toast notifications
│   │   │   └── ProgressBar.ts          # Progress indicator
│   │   ├── styles/
│   │   │   ├── button.css              # Button styles
│   │   │   ├── modal.css               # Modal styles
│   │   │   ├── uploader.css            # Uploader styles
│   │   │   ├── spinner.css             # Spinner styles
│   │   │   └── theme.css               # Theme variables
│   │   └── types.ts                    # UI types
│   │
│   ├── utils/
│   │   ├── index.ts                    # Utils exports
│   │   ├── imageProcessing.ts          # Image utilities
│   │   ├── analytics.ts                # Analytics tracking
│   │   ├── logger.ts                   # Logging utility
│   │   ├── validators.ts               # Input validation
│   │   ├── crypto.ts                   # Encryption utilities
│   │   └── helpers.ts                  # General helpers
│   │
│   ├── config/
│   │   ├── index.ts                    # Config exports
│   │   ├── constants.ts                # App constants
│   │   ├── defaults.ts                 # Default configs
│   │   └── types.ts                    # Config types
│   │
│   └── types/
│       ├── index.ts                    # Global type exports
│       ├── common.ts                   # Common types
│       └── api.d.ts                    # API type declarations
│
├── tests/
│   ├── unit/
│   │   ├── detection/
│   │   │   ├── ImageDetector.test.ts
│   │   │   └── DOMScanner.test.ts
│   │   ├── api/
│   │   │   ├── TryOnService.test.ts
│   │   │   └── CacheManager.test.ts
│   │   └── storage/
│   │       └── PhotoStorage.test.ts
│   ├── integration/
│   │   ├── end-to-end.test.ts
│   │   └── api-flow.test.ts
│   ├── fixtures/
│   │   ├── images/                     # Test images
│   │   └── mocks/                      # Mock data
│   └── setup.ts                        # Test setup
│
├── dist/                               # Build output
│   ├── index.js                        # CommonJS build
│   ├── index.mjs                       # ES Module build
│   ├── index.d.ts                      # Type declarations
│   └── styles.css                      # Bundled styles
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

---

## Package: Website Plugin

Location: `packages/plugin/`

```
packages/plugin/
├── src/
│   ├── index.ts                        # Entry point
│   ├── TryOnPlugin.ts                  # Main plugin class
│   ├── config.ts                       # Configuration handler
│   ├── analytics.ts                    # Analytics integration
│   └── types.ts                        # Plugin-specific types
│
├── dist/
│   ├── try-on.js                       # Development build
│   ├── try-on.min.js                   # Production build (minified)
│   ├── try-on.min.js.map               # Source map
│   └── try-on.css                      # Styles
│
├── examples/
│   ├── basic.html                      # Basic integration
│   ├── custom-styling.html             # Custom styles example
│   ├── advanced.html                   # Advanced config
│   ├── shopify-theme.html              # Shopify integration
│   └── woocommerce.html                # WooCommerce example
│
├── docs/
│   ├── INTEGRATION.md                  # Integration guide
│   ├── API.md                          # API reference
│   ├── CUSTOMIZATION.md                # Customization guide
│   └── TROUBLESHOOTING.md              # Troubleshooting
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

**Integration Example**:
```html
<!-- In examples/basic.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Virtual Try-On Demo</title>
</head>
<body>
  <h1>Product Page</h1>
  <img src="product.jpg" alt="Blue T-Shirt" />

  <!-- Load plugin -->
  <script src="../dist/try-on.min.js"></script>

  <!-- Initialize -->
  <script>
    TryOn.init({
      apiKey: 'demo-api-key',
      theme: 'light',
      position: 'bottom'
    });
  </script>
</body>
</html>
```

---

## Package: Chrome Extension

Location: `packages/extension/`

```
packages/extension/
├── src/
│   ├── manifest.json                   # Extension manifest (V3)
│   │
│   ├── background/
│   │   ├── service-worker.ts           # Background service worker
│   │   ├── messageHandler.ts           # Message handling
│   │   └── storageManager.ts           # Extension storage
│   │
│   ├── content/
│   │   ├── content-script.ts           # Main content script
│   │   ├── injector.ts                 # Inject UI components
│   │   └── styles.css                  # Content script styles
│   │
│   ├── popup/
│   │   ├── popup.html                  # Popup UI
│   │   ├── popup.ts                    # Popup logic
│   │   ├── popup.css                   # Popup styles
│   │   └── components/
│   │       ├── PhotoManager.ts         # Photo management UI
│   │       ├── Settings.ts             # Settings UI
│   │       └── Stats.ts                # Usage stats UI
│   │
│   ├── options/
│   │   ├── options.html                # Settings page
│   │   ├── options.ts                  # Settings logic
│   │   └── options.css                 # Settings styles
│   │
│   ├── shared/
│   │   ├── constants.ts                # Extension constants
│   │   ├── messaging.ts                # Message types
│   │   └── types.ts                    # Extension types
│   │
│   └── utils/
│       ├── permissions.ts              # Permission helpers
│       └── storage.ts                  # Storage helpers
│
├── assets/
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   ├── icon-128.png
│   │   └── icon.svg
│   └── images/
│       ├── logo.png
│       └── screenshot-*.png
│
├── dist/                               # Build output (for Chrome)
│   ├── manifest.json
│   ├── background/
│   ├── content/
│   ├── popup/
│   ├── options/
│   └── assets/
│
├── store/
│   ├── description.txt                 # Store description
│   ├── screenshots/                    # Store screenshots
│   ├── promo-video.mp4                 # Promo video
│   └── privacy-policy.md               # Privacy policy
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Package: Shopify App

Location: `packages/shopify-app/`

```
packages/shopify-app/
├── app/
│   ├── routes/
│   │   ├── _index.tsx                  # Landing page
│   │   ├── app._index.tsx              # App home (dashboard)
│   │   ├── app.settings.tsx            # Settings page
│   │   ├── app.analytics.tsx           # Analytics page
│   │   └── api/
│   │       ├── try-on.ts               # Try-on API endpoint
│   │       ├── settings.ts             # Settings API
│   │       └── webhooks/
│   │           ├── app-uninstalled.ts
│   │           ├── products-update.ts
│   │           └── shop-update.ts
│   │
│   ├── components/
│   │   ├── Dashboard.tsx               # Dashboard component
│   │   ├── SettingsForm.tsx            # Settings form
│   │   ├── AnalyticsChart.tsx          # Analytics charts
│   │   └── UsageStats.tsx              # Usage statistics
│   │
│   ├── services/
│   │   ├── shopify.server.ts           # Shopify API client
│   │   ├── database.server.ts          # Database operations
│   │   └── billing.server.ts           # Billing operations
│   │
│   └── utils/
│       ├── auth.server.ts              # Authentication
│       └── validators.ts               # Input validation
│
├── extensions/
│   └── theme-extension/
│       ├── blocks/
│       │   └── try-on-button.liquid    # Liquid template block
│       ├── assets/
│       │   ├── try-on.js               # Frontend script
│       │   ├── try-on.css              # Styles
│       │   └── icon-tryon.svg          # Icon asset
│       ├── locales/
│       │   ├── en.default.json         # English translations
│       │   └── es.json                 # Spanish translations
│       └── snippets/
│           └── try-on-modal.liquid     # Modal template
│
├── prisma/
│   ├── schema.prisma                   # Database schema
│   ├── migrations/                     # Database migrations
│   └── seed.ts                         # Seed data
│
├── public/
│   ├── favicon.ico
│   └── images/
│
├── tests/
│   ├── routes/
│   ├── components/
│   └── services/
│
├── shopify.app.toml                    # Shopify app config
├── package.json
├── tsconfig.json
├── remix.config.js
└── README.md
```

---

## Configuration Files

### Root package.json

```json
{
  "name": "virtual-try-on-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "clean": "turbo run clean && rm -rf node_modules",
    "setup": "./scripts/setup.sh"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "turbo": "^2.0.0",
    "typescript": "^5.3.0",
    "prettier": "^3.1.0",
    "eslint": "^8.55.0",
    "vitest": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@try-on/core": ["./packages/core/src"],
      "@try-on/plugin": ["./packages/plugin/src"],
      "@try-on/extension": ["./packages/extension/src"]
    }
  },
  "exclude": ["node_modules", "dist", "build"]
}
```

### .env.example

```bash
# API Keys
FAL_API_KEY=your_fal_api_key_here
REPLICATE_API_TOKEN=your_replicate_token_here

# Application
NODE_ENV=development
LOG_LEVEL=debug

# Plugin (Website)
PLUGIN_CDN_URL=https://cdn.tryon.app

# Extension (Chrome)
EXTENSION_ID=your_extension_id_here

# Shopify App
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_products,write_products
DATABASE_URL=postgresql://user:password@localhost:5432/tryon

# Analytics (Optional)
MIXPANEL_TOKEN=your_mixpanel_token
SENTRY_DSN=your_sentry_dsn

# CDN & Storage
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
S3_BUCKET=your_s3_bucket_name
S3_REGION=us-east-1
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+ ([install](https://nodejs.org/))
- pnpm 8+ (`npm install -g pnpm`)
- Git
- Docker (optional, for Shopify app)

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/try-on.git
cd try-on

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env and add your API keys

# 4. Build all packages
pnpm build

# 5. Run tests
pnpm test

# 6. Start development servers
pnpm dev
```

### Development Workflow

**Working on Core Library**:
```bash
cd packages/core
pnpm dev          # Watch mode
pnpm test         # Run tests
pnpm build        # Build
```

**Working on Website Plugin**:
```bash
cd packages/plugin
pnpm dev          # Start dev server
# Open examples/basic.html in browser
```

**Working on Chrome Extension**:
```bash
cd packages/extension
pnpm dev          # Build in watch mode
# Load dist/ folder as unpacked extension in Chrome
```

**Working on Shopify App**:
```bash
cd packages/shopify-app
pnpm dev          # Start Remix dev server
# Open http://localhost:3000
```

---

## Naming Conventions

### Files

- **Components**: PascalCase (e.g., `TryOnButton.ts`)
- **Utilities**: camelCase (e.g., `imageProcessing.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`
- **Types**: `types.ts` or `*.d.ts`
- **Config**: lowercase with dashes (e.g., `vite.config.ts`)

### Code

- **Classes**: PascalCase (e.g., `ImageDetector`)
- **Functions**: camelCase (e.g., `detectImages()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_IMAGE_SIZE`)
- **Interfaces**: PascalCase with `I` prefix optional (e.g., `DetectionConfig`)
- **Types**: PascalCase (e.g., `TryOnRequest`)
- **Enums**: PascalCase (e.g., `TryOnEvent`)

### Git

- **Branches**:
  - Features: `feature/add-social-sharing`
  - Fixes: `fix/button-positioning`
  - Releases: `release/v1.0.0`

- **Commits**:
  - Format: `<type>(<scope>): <message>`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(core): add image detection caching`

---

## Build & Deploy

### Build All Packages

```bash
# From root
pnpm build

# Individual packages
cd packages/core && pnpm build
cd packages/plugin && pnpm build
cd packages/extension && pnpm build
cd packages/shopify-app && pnpm build
```

### Deploy Website Plugin

```bash
cd packages/plugin
pnpm build

# Upload dist/try-on.min.js to CDN
# CloudFlare, AWS S3, or similar
```

### Deploy Chrome Extension

```bash
cd packages/extension
pnpm build

# Zip dist/ folder
cd dist && zip -r ../extension.zip .

# Upload to Chrome Web Store
```

### Deploy Shopify App

```bash
cd packages/shopify-app
shopify app deploy
```

---

## Testing Strategy

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific package
cd packages/core && pnpm test
```

### Integration Tests

```bash
# Run integration tests
pnpm test:integration
```

### E2E Tests

```bash
# Install Playwright
pnpm add -D @playwright/test

# Run E2E tests
pnpm test:e2e
```

### Manual Testing

**Website Plugin**:
1. Open `packages/plugin/examples/basic.html`
2. Click "Try On" button
3. Upload photo
4. Verify result

**Chrome Extension**:
1. Build extension
2. Load unpacked in Chrome
3. Visit fashion website
4. Verify buttons appear
5. Test try-on flow

**Shopify App**:
1. Install on development store
2. Enable on product page
3. Test frontend functionality
4. Verify admin dashboard

---

## Documentation Structure

```
docs/
├── PRD.md                      # Product Requirements
├── ARCHITECTURE.md             # Technical Architecture
├── IMPLEMENTATION_PLAN.md      # Implementation Roadmap
├── API_INTEGRATION_GUIDE.md    # API Integration
├── PROJECT_STRUCTURE.md        # This file
├── CONTRIBUTING.md             # How to contribute
├── CODE_OF_CONDUCT.md          # Code of conduct
└── guides/
    ├── getting-started.md
    ├── plugin-integration.md
    ├── extension-usage.md
    └── shopify-setup.md
```

---

## Version Control

### .gitignore

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Misc
.turbo/
.cache/
```

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs (Sentry)
- Check API usage and costs
- Respond to support requests

**Weekly**:
- Review metrics dashboard
- Update dependencies (`pnpm update`)
- Review and merge PRs
- Deploy updates

**Monthly**:
- Security audit
- Performance review
- Dependency updates
- Backup databases

---

## Support & Resources

### Internal Documentation
- Architecture diagrams in `/docs`
- API reference at `/docs/api`
- Troubleshooting guide at `/docs/troubleshooting`

### External Resources
- [Nano Banana API Docs](https://fal.ai/models/fal-ai/nano-banana/edit/api)
- [IDM-VTON on Replicate](https://replicate.com/cuuupid/idm-vton)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Shopify App Docs](https://shopify.dev/docs/apps)

---

*This structure is designed to scale from MVP to enterprise-ready product.*

Last Updated: December 3, 2025
