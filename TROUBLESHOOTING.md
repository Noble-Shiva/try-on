# Troubleshooting Guide

Common issues and their solutions when working with the Virtual Try-On platform.

---

## API Key Issues

### "At least one API provider must be configured"

**Problem**: No API keys found in environment

**Solutions**:
1. Check if `.env` file exists:
   ```bash
   ls -la .env
   ```

2. If missing, copy from example:
   ```bash
   cp .env.example .env
   ```

3. Add your API keys to `.env`:
   ```env
   FAL_API_KEY=your_key_here
   REPLICATE_API_TOKEN=your_token_here
   ```

4. Verify keys are valid:
   ```bash
   pnpm check-keys
   ```

---

### "401 Unauthorized" or Authentication Error

**Problem**: Invalid or expired API key

**Solutions**:

1. **Check key format**:
   - Nano Banana keys start with `fal_`
   - Replicate tokens start with `r8_`

2. **Verify key is correct**:
   ```bash
   # Check your keys without making API calls
   pnpm check-keys
   ```

3. **Regenerate key**:
   - Nano Banana: https://fal.ai/dashboard/keys
   - Replicate: https://replicate.com/account/api-tokens

4. **Check for typos**:
   - No extra spaces
   - Full key copied (keys are long!)
   - No quotes around the key in `.env`

**Correct `.env` format**:
```env
FAL_API_KEY=fal_abc123...
REPLICATE_API_TOKEN=r8_xyz789...
```

**Incorrect formats**:
```env
# ❌ Don't add quotes
FAL_API_KEY="fal_abc123..."

# ❌ Don't add spaces
FAL_API_KEY = fal_abc123...

# ❌ Don't truncate the key
FAL_API_KEY=fal_abc...
```

---

### "402 Payment Required" or Billing Error

**Problem**: No credits or quota remaining

**Solutions**:

1. **Check account balance**:
   - Nano Banana: https://fal.ai/dashboard/billing
   - Replicate: https://replicate.com/account/billing

2. **Add credits**:
   - Both platforms offer pay-as-you-go billing
   - New Replicate accounts get $5 free credits

3. **Monitor usage**:
   ```bash
   # Estimate cost before running
   pnpm verify-api  # Shows costs before making calls
   ```

4. **Use free tier wisely**:
   - Nano Banana: ~$0.01 per request
   - IDM-VTON: ~$0.025 per request

---

## Installation Issues

### "pnpm: command not found"

**Problem**: pnpm not installed

**Solution**:
```bash
npm install -g pnpm
```

Or use npm/yarn instead:
```bash
# Using npm
npm install
npm run build

# Using yarn
yarn install
yarn build
```

---

### "Cannot find module '@try-on/core'"

**Problem**: Core library not built

**Solution**:
```bash
# Build the core library first
cd packages/core
pnpm install
pnpm build
cd ../..
```

---

### Dependency Installation Fails

**Problem**: Node version incompatibility or network issues

**Solutions**:

1. **Check Node version**:
   ```bash
   node --version  # Should be 18+
   ```

2. **Update Node**:
   - Download from https://nodejs.org/
   - Or use nvm:
     ```bash
     nvm install 18
     nvm use 18
     ```

3. **Clear cache and reinstall**:
   ```bash
   pnpm clean
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

---

## API Request Issues

### "Request Timeout" or Slow Performance

**Problem**: Provider taking too long or network issues

**Solutions**:

1. **Check provider status**:
   - Nano Banana: https://status.fal.ai/
   - Replicate: https://status.replicate.com/

2. **Increase timeout** (in your code):
   ```typescript
   // Add timeout option if needed
   const result = await service.tryOn({
     // ... other options
   }, { timeout: 60000 }); // 60 seconds
   ```

3. **Use fast mode**:
   ```typescript
   const result = await service.tryOn({
     quality: 'fast'  // Nano Banana is faster
   });
   ```

4. **Check internet connection**:
   ```bash
   ping fal.ai
   ping replicate.com
   ```

---

### "Poor Quality Results"

**Problem**: Try-on results don't look good

**Solutions**:

1. **Use quality mode**:
   ```typescript
   const result = await service.tryOn({
     quality: 'high'  // Uses IDM-VTON
   });
   ```

2. **Improve input images**:
   - **Person photo**:
     - Full body visible
     - Good lighting
     - Neutral background
     - Front-facing pose
     - Fitted clothing (not baggy)

   - **Garment photo**:
     - Clear product shot
     - White/neutral background
     - No occlusions
     - High resolution (min 512x512)

3. **Adjust IDM-VTON settings**:
   ```typescript
   const result = await service.tryOn({
     quality: 'high',
     options: {
       idmVton: {
         denoiseSteps: 40,  // Higher = better quality (slower)
         isChecked: true    // Use cloth mask
       }
     }
   });
   ```

---

### "Network Error" or Connection Issues

**Problem**: Can't reach API servers

**Solutions**:

1. **Check internet connection**
2. **Check firewall settings**
3. **Try VPN if blocked**
4. **Check proxy settings**:
   ```bash
   # If behind corporate proxy
   export HTTP_PROXY=http://proxy:port
   export HTTPS_PROXY=http://proxy:port
   ```

---

## Test Failures

### Tests Failing After Installation

**Problem**: Build or dependency issues

**Solutions**:

1. **Build before testing**:
   ```bash
   pnpm build
   pnpm test
   ```

2. **Check test environment**:
   ```bash
   # Run tests with verbose output
   cd packages/core
   pnpm test -- --reporter=verbose
   ```

3. **Skip integration tests** (if no API keys):
   ```bash
   pnpm test -- --testPathPattern=unit
   ```

---

## Development Issues

### "Type errors" when importing

**Problem**: TypeScript can't find types

**Solutions**:

1. **Ensure library is built**:
   ```bash
   cd packages/core
   pnpm build
   ```

2. **Check tsconfig.json paths**:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@try-on/core": ["./packages/core/src"]
       }
     }
   }
   ```

3. **Restart TypeScript server**:
   - VS Code: Cmd/Ctrl + Shift + P → "Restart TS Server"

---

### Hot Reload Not Working

**Problem**: Changes not reflected

**Solutions**:

1. **Use dev mode**:
   ```bash
   cd packages/core
   pnpm dev  # Watch mode
   ```

2. **Restart dev server**
3. **Clear build cache**:
   ```bash
   pnpm clean
   pnpm build
   ```

---

## Common Error Messages

### "Module not found: '@fal-ai/client'"

**Solution**:
```bash
cd packages/core
pnpm install
```

---

### "replicate is not a function"

**Problem**: Replicate SDK import issue

**Solution**: Check import in IDMVTONClient.ts:
```typescript
const Replicate = (await import('replicate')).default;
```

---

### "Cannot read property 'images' of undefined"

**Problem**: Unexpected API response format

**Solutions**:
1. Check API key is valid
2. Update to latest SDK version
3. Check provider status page

---

## Getting Help

### Before Asking for Help

Run diagnostics:
```bash
# 1. Check environment
pnpm check-keys

# 2. Verify API connectivity (WARNING: costs money)
pnpm verify-api

# 3. Check build
pnpm build

# 4. Run tests
pnpm test
```

### Where to Get Help

1. **Check Documentation**:
   - [Getting Started](./GETTING_STARTED.md)
   - [API Integration Guide](./API_INTEGRATION_GUIDE.md)
   - [Architecture](./ARCHITECTURE.md)

2. **Search Issues**:
   - GitHub Issues: Look for similar problems

3. **Create Issue**:
   - Include:
     - Error message (full output)
     - Steps to reproduce
     - Output of `pnpm check-keys`
     - Node version (`node --version`)
     - OS and platform

### Debug Mode

Enable verbose logging:
```bash
# Set log level in .env
LOG_LEVEL=debug

# Or set environment variable
DEBUG=* pnpm verify-api
```

---

## Provider-Specific Issues

### Nano Banana (fal.ai)

**Status Page**: https://status.fal.ai/

**Common Issues**:
- Rate limiting: Wait and retry
- Queue times: Use during off-peak hours
- Image size limits: Keep under 10MB

**Support**:
- Discord: https://discord.gg/fal-ai
- Docs: https://fal.ai/docs

---

### IDM-VTON (Replicate)

**Status Page**: https://status.replicate.com/

**Common Issues**:
- Cold start delays: First request slower
- Model version changes: Pin to specific version
- Quota exceeded: Check billing

**Support**:
- Discord: https://discord.gg/replicate
- Docs: https://replicate.com/docs

---

## Performance Tips

### Reduce API Costs

1. **Enable caching**:
   ```typescript
   const result = await service.tryOn({
     cacheEnabled: true  // Default
   });
   ```

2. **Use fast mode by default**:
   ```env
   DEFAULT_QUALITY=fast
   ```

3. **Compress images before upload**:
   ```typescript
   // Library handles this automatically
   ```

### Improve Speed

1. **Use Nano Banana** (4s vs 19s)
2. **Reduce denoise steps** for IDM-VTON:
   ```typescript
   options: {
     idmVton: {
       denoiseSteps: 20  // Lower = faster
     }
   }
   ```

3. **Batch requests** if possible

---

## Still Having Issues?

If you've tried everything above and still can't solve the problem:

1. **Clean slate**:
   ```bash
   pnpm clean
   rm -rf node_modules packages/*/node_modules
   rm -rf packages/*/dist
   pnpm install
   pnpm build
   ```

2. **Check system requirements**:
   - Node.js 18+
   - 2GB+ RAM
   - Active internet connection

3. **Report a bug**:
   - GitHub Issues with full details
   - Include diagnostic output

---

*Last updated: December 2025*
