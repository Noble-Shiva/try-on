# Testing & Verification Scripts

Helpful scripts to verify your API setup and test the virtual try-on functionality.

## Available Scripts

### 1. Check API Keys (`check-keys`)

**What it does**: Validates your API keys without making any API calls (free, no charges)

**When to use**: After setting up your `.env` file, before making any API requests

**Usage**:
```bash
pnpm check-keys
```

**What it checks**:
- ✓ `.env` file exists
- ✓ API keys are present
- ✓ Keys have correct format (prefix and length)
- ✓ Provides instructions for missing keys

**Example output**:
```
==============================================================
  API Key Validator
==============================================================

✓ .env file exists

🔑 Nano Banana (fal.ai):
  Status: ✓ Looks valid
  Format: fal_abc123defg...
  Length: 64 characters

🔑 IDM-VTON (Replicate):
  Status: ✓ Looks valid
  Format: r8_xyz789mnop...
  Length: 71 characters

==============================================================
  Summary
==============================================================
  Configured: 2/2 providers
  Valid: 2/2 keys

✅ All configured API keys look valid!
```

---

### 2. Verify API Connectivity (`verify-api`)

**What it does**: Tests actual API connectivity and makes test requests (⚠️ costs money)

**When to use**: After checking keys, to verify everything works end-to-end

**Usage**:
```bash
pnpm verify-api
```

**What it does**:
1. Checks environment variables
2. Initializes service
3. Makes test requests to each provider
4. Shows detailed results

**Cost**: ~$0.035 (if testing both providers)

**Example output**:
```
==============================================================
  Virtual Try-On API Verification
==============================================================

Checking Environment Variables
==============================================================
✓ Nano Banana API key found: fal_abc123...
✓ IDM-VTON API token found: r8_xyz789...

Testing Service Initialization
==============================================================
✓ Service created successfully
✓ Service is ready
✓ Available providers: nano-banana, idm-vton

Testing Nano Banana (fast mode)
==============================================================
ℹ Using sample images for testing...
ℹ Estimated cost: $0.010
⚠ This will make a real API call and charge ~$0.010 to your account.
✓ Nano Banana test passed!

  Result Details:
  - Result URL: https://...
  - Provider: nano-banana
  - Processing time: 3421ms
  - Cost: $0.01

Test Summary
==============================================================
  Nano Banana (Fast):  ✓ Working
  IDM-VTON (Quality):  ✓ Working

✅ All configured providers are working! 🎉
```

---

### 3. Interactive Demo (`demo`)

**What it does**: Runs a complete try-on demo with sample images (⚠️ costs money)

**When to use**: After verification passes, to see the full workflow

**Usage**:
```bash
pnpm demo
```

**What it includes**:
- Complete service initialization
- Sample person and garment images
- Cost estimation
- Try-on request
- Detailed results

**Cost**: ~$0.01 (fast mode with Nano Banana)

**Example output**:
```
==============================================================
  Virtual Try-On Demo
==============================================================

🔧 Initializing service...
✓ Service ready with providers: nano-banana

📸 Demo Scenario:
  - Blue T-Shirt Try-On
  - Quality: fast
  - Provider: Nano Banana

💰 Estimated cost: $0.010
⏳ Processing... This may take a few seconds...

✅ Success!

📊 Results:
  - Result URL: https://...
  - Provider used: nano-banana
  - Processing time: 3214ms
  - Cost: $0.01

💡 Next Steps:
  - Open the result URL in your browser
  - Try different images
  - Check out packages/core/README.md
```

---

## Recommended Workflow

### First Time Setup

```bash
# 1. Check if keys are valid (FREE)
pnpm check-keys

# 2. If keys are valid, verify API works (COSTS ~$0.04)
pnpm verify-api

# 3. Try the demo (COSTS ~$0.01)
pnpm demo
```

### Daily Development

```bash
# Quick check before starting work
pnpm check-keys

# Run tests (FREE - uses mocks)
pnpm test

# Manual testing with real APIs (COSTS MONEY)
pnpm demo
```

### Troubleshooting

```bash
# 1. Validate keys
pnpm check-keys

# 2. Check detailed error messages
pnpm verify-api

# 3. See troubleshooting guide
cat TROUBLESHOOTING.md
```

---

## Script Details

### check-api-keys.ts

**Dependencies**: None (just reads .env)

**Network**: No network calls

**Cost**: Free

**Runtime**: <1 second

**Safe to run**: ✅ Always safe

---

### verify-api.ts

**Dependencies**: Core library, API SDKs

**Network**: Makes 1-2 API calls (depending on configured providers)

**Cost**: $0.01 (Nano Banana) + $0.025 (IDM-VTON) = $0.035 total

**Runtime**: 5-25 seconds (depending on providers tested)

**Safe to run**: ⚠️ Costs money - review before running

**Features**:
- Countdown before making paid requests
- Detailed error messages
- Common error detection
- Suggestions for fixes

---

### demo.ts

**Dependencies**: Core library, API SDKs

**Network**: Makes 1 API call (fast mode only)

**Cost**: $0.01

**Runtime**: 3-5 seconds

**Safe to run**: ⚠️ Costs money - review before running

**Features**:
- Real-world example
- Sample images provided
- Result URL for viewing
- Can be modified for custom tests

---

## Customizing Scripts

### Using Your Own Images

Edit `scripts/demo.ts`:

```typescript
const scenarios = [
  {
    name: 'My Custom Test',
    personImage: 'https://your-url.com/person.jpg',
    garmentImage: 'https://your-url.com/garment.jpg',
    description: 'your garment description',
    quality: 'fast' // or 'high'
  }
];
```

### Skip Expensive Tests

In `verify-api.ts`, comment out providers you don't want to test:

```typescript
// Skip IDM-VTON test to save money
// if (replicateToken) {
//   results.idmVton = await testProvider(service, 'high', 'IDM-VTON');
// }
```

### Add Custom Validation

Extend `check-api-keys.ts` with your own validation logic.

---

## Cost Summary

| Script | Network Calls | Cost | Safe? |
|--------|---------------|------|-------|
| `check-keys` | 0 | $0.00 | ✅ Always |
| `verify-api` | 1-2 | $0.01-$0.035 | ⚠️ Costs money |
| `demo` | 1 | $0.01 | ⚠️ Costs money |

**Monthly testing budget recommendation**: $5-10 for development

---

## Troubleshooting Scripts

### Script won't run

```bash
# Install tsx if missing
pnpm install

# Or run directly with node
node --loader tsx scripts/check-api-keys.ts
```

### "dotenv not found"

```bash
pnpm install dotenv
```

### "Cannot find module '@try-on/core'"

```bash
cd packages/core
pnpm build
cd ../..
```

---

## Adding More Scripts

To add a new script:

1. Create script file in `scripts/`:
   ```typescript
   #!/usr/bin/env tsx
   // your-script.ts
   ```

2. Add to `package.json`:
   ```json
   {
     "scripts": {
       "your-command": "tsx scripts/your-script.ts"
     }
   }
   ```

3. Make executable (optional):
   ```bash
   chmod +x scripts/your-script.ts
   ```

4. Run:
   ```bash
   pnpm your-command
   ```

---

## Further Reading

- [Getting Started Guide](../GETTING_STARTED.md)
- [Troubleshooting Guide](../TROUBLESHOOTING.md)
- [API Integration Guide](../API_INTEGRATION_GUIDE.md)
