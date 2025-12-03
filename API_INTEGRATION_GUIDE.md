# Virtual Try-On API Integration Guide

## Overview

This document outlines the available AI APIs for implementing virtual try-on functionality in our application.

---

## Recommended API Solutions

### Option 1: IDM-VTON (Recommended for Quality)

**Description**: State-of-the-art diffusion model for authentic virtual try-on (ECCV 2024)

**Pros**:
- Highest quality results among open-source options
- Handles complex garments and poses well
- Active development and community support
- Multiple deployment options

**Cons**:
- Higher computational cost (~$0.025/run)
- Slower processing (~19 seconds per image)
- Requires GPU infrastructure

**API Provider**: Replicate
- **Endpoint**: `cuuupid/idm-vton`
- **Cost**: $0.025 per run (~40 runs per $1)
- **Processing Time**: ~19 seconds
- **Hardware**: Nvidia A100 (80GB) GPU

**API Example**:
```javascript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const output = await replicate.run(
  "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
  {
    input: {
      human_img: "https://example.com/person-photo.jpg",
      garm_img: "https://example.com/garment.jpg",
      garment_des: "cute pink top",
      is_checked: true,
      is_checked_crop: false,
      denoise_steps: 30,
      seed: 42
    }
  }
);

console.log(output);
```

**Parameters**:
- `human_img`: URL or data URI of the person's photo
- `garm_img`: URL or data URI of the garment image
- `garment_des`: Text description of the garment
- `is_checked`: Whether to use cloth mask (recommended: true)
- `is_checked_crop`: Whether to crop the output
- `denoise_steps`: Number of denoising steps (10-50, default: 30)
- `seed`: Random seed for reproducibility

**Response**:
```json
{
  "output": "https://replicate.delivery/pbxt/...output.png"
}
```

---

### Option 2: Nano Banana via fal.ai (Recommended for Speed & Cost)

**Description**: Google's Gemini 2.5 Flash Image Preview model for image editing

**Pros**:
- Fast processing (<5 seconds typical)
- Lower cost per request
- Stable Google backing
- Good for general image editing
- Multiple API providers

**Cons**:
- Not specialized for virtual try-on
- May require prompt engineering
- Less consistent results for complex garments

**API Provider**: fal.ai
- **Endpoint**: `fal-ai/nano-banana/edit`
- **Cost**: Pay-as-you-go (varies by provider)
- **Processing Time**: <5 seconds typical

**API Example**:
```javascript
import { fal } from "@fal-ai/client";

// Configure API key
fal.config({
  credentials: process.env.FAL_KEY
});

const result = await fal.subscribe("fal-ai/nano-banana/edit", {
  input: {
    prompt: "photo of the person wearing this shirt",
    image_urls: [
      "https://example.com/person-photo.jpg",  // Person image
      "https://example.com/garment.jpg"        // Garment image
    ]
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});

console.log(result.data);
// Output: { images: [{ url: "...", width: 1024, height: 1024 }] }
```

**Parameters**:
- `prompt`: Natural language instruction for the edit
- `image_urls`: Array of input images (person + garment)
- `image_size`: Optional size specification

**Alternative Providers**:
- **Google AI (Official)**: via Gemini API
- **PiAPI**: piapi.ai (50%+ savings vs Google direct)
- **nanobananaapi.ai**: Specialized provider

---

### Option 3: OOTDiffusion (Alternative Open Source)

**Description**: Outfitting Fusion based Latent Diffusion (AAAI 2025)

**Pros**:
- Single-stage pipeline (no separate warping)
- Good balance of speed and quality
- Open source with active development

**Cons**:
- Less documentation than IDM-VTON
- Fewer API providers
- May require self-hosting

**Deployment**: Self-hosted or via Hugging Face Spaces

---

## Recommended Architecture

### Hybrid Approach (Best of Both Worlds)

We recommend implementing **both IDM-VTON and Nano Banana** with intelligent routing:

```
User Request
    ↓
Quality/Speed Preference?
    ↓
┌───────────────┴───────────────┐
│                               │
Fast Mode                  Quality Mode
(Nano Banana)              (IDM-VTON)
    ↓                           ↓
~3-5 seconds               ~15-20 seconds
Lower cost                 Higher cost
Good results               Best results
```

**Routing Logic**:
```javascript
async function virtualTryOn(personImg, garmentImg, options = {}) {
  const mode = options.quality || 'fast'; // 'fast' or 'quality'

  if (mode === 'quality') {
    // Use IDM-VTON for best results
    return await idmVtonTryOn(personImg, garmentImg, options);
  } else {
    // Use Nano Banana for speed
    return await nanaBananaTryOn(personImg, garmentImg, options);
  }
}
```

---

## Implementation Plan

### Phase 1: MVP (Nano Banana Only)
- Faster development
- Lower infrastructure costs
- Good enough quality for testing
- Easy API integration

### Phase 2: Quality Enhancement (Add IDM-VTON)
- Implement as optional "High Quality" mode
- Add toggle in UI: "Fast Mode" vs "Quality Mode"
- Monitor usage patterns
- Optimize costs based on demand

### Phase 3: Optimization
- Implement result caching
- Add pre-processing (image optimization)
- Load balancing between providers
- Fallback mechanisms

---

## API Wrapper Implementation

### Core TryOn Service

```typescript
// src/api/tryOnService.ts

interface TryOnRequest {
  personImage: string;      // URL or base64
  garmentImage: string;     // URL or base64
  garmentDescription?: string;
  quality: 'fast' | 'high';
}

interface TryOnResponse {
  resultImage: string;
  processingTime: number;
  provider: 'nano-banana' | 'idm-vton';
  cost?: number;
}

class TryOnService {
  private falClient: FalClient;
  private replicateClient: Replicate;

  constructor() {
    this.falClient = new FalClient(process.env.FAL_KEY);
    this.replicateClient = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });
  }

  async tryOn(request: TryOnRequest): Promise<TryOnResponse> {
    const startTime = Date.now();

    try {
      if (request.quality === 'fast') {
        const result = await this.tryOnNanoBanana(request);
        return {
          ...result,
          processingTime: Date.now() - startTime,
          provider: 'nano-banana'
        };
      } else {
        const result = await this.tryOnIDMVTON(request);
        return {
          ...result,
          processingTime: Date.now() - startTime,
          provider: 'idm-vton'
        };
      }
    } catch (error) {
      // Fallback to alternative provider
      console.error('Primary provider failed:', error);
      return this.fallbackTryOn(request, startTime);
    }
  }

  private async tryOnNanoBanana(request: TryOnRequest): Promise<Partial<TryOnResponse>> {
    const result = await this.falClient.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: `photo of the person wearing this ${request.garmentDescription || 'clothing item'}`,
        image_urls: [request.personImage, request.garmentImage]
      }
    });

    return {
      resultImage: result.data.images[0].url,
      cost: 0.01 // Approximate
    };
  }

  private async tryOnIDMVTON(request: TryOnRequest): Promise<Partial<TryOnResponse>> {
    const output = await this.replicateClient.run(
      "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
      {
        input: {
          human_img: request.personImage,
          garm_img: request.garmentImage,
          garment_des: request.garmentDescription || '',
          is_checked: true,
          denoise_steps: 30
        }
      }
    );

    return {
      resultImage: output as string,
      cost: 0.025
    };
  }

  private async fallbackTryOn(request: TryOnRequest, startTime: number): Promise<TryOnResponse> {
    // Implement fallback logic
    // Try alternative provider or return cached result
    throw new Error('All providers failed');
  }
}

export default new TryOnService();
```

---

## Cost Analysis

### Monthly Cost Estimates (Based on Usage)

| Usage Tier | Requests/Month | Fast Mode (90%) | Quality Mode (10%) | Total Cost |
|------------|----------------|-----------------|--------------------|-----------:|
| Free Tier  | 50             | $0.50           | $0.13              | $0.63      |
| Starter    | 500            | $5.00           | $1.25              | $6.25      |
| Pro        | 2,000          | $20.00          | $5.00              | $25.00     |
| Business   | 10,000         | $100.00         | $25.00             | $125.00    |
| Enterprise | 50,000         | $500.00         | $125.00            | $625.00    |

**Assumptions**:
- Nano Banana: $0.01/request
- IDM-VTON: $0.025/request
- 90% of users use fast mode
- 10% of users use quality mode

**Optimization Strategies**:
1. Implement aggressive caching (same person + same garment = cached result)
2. Compress images before API submission
3. Negotiate bulk pricing with providers
4. Self-host IDM-VTON for high-volume users

---

## Image Requirements

### Person Photo Guidelines

**Optimal**:
- Full body or upper body visible
- Clear, front-facing pose
- Good lighting (no harsh shadows)
- Neutral or simple background
- Fitted clothing (to show body shape)
- High resolution (min 512x512, recommended 1024x1024)

**Avoid**:
- Baggy clothing hiding body shape
- Extreme angles or poses
- Low lighting or heavy filters
- Busy/cluttered backgrounds
- Low resolution images

### Garment Image Guidelines

**Optimal**:
- Clean product shot on white/neutral background
- Garment flat lay or on mannequin
- Clear details and colors
- No occlusions
- High resolution (min 512x512, recommended 1024x1024)

**Supported Garment Types**:
- ✅ Tops (t-shirts, blouses, shirts, sweaters)
- ✅ Dresses
- ✅ Jackets and coats
- ⚠️ Bottoms (pants, skirts) - Limited support
- ❌ Accessories (hats, jewelry) - Not supported
- ❌ Shoes - Not supported

---

## Error Handling

### Common Errors and Solutions

```javascript
const ERROR_HANDLERS = {
  'INVALID_IMAGE': {
    message: 'Please upload a clear photo showing your full body',
    retry: false,
    userAction: 'upload_new_photo'
  },
  'API_TIMEOUT': {
    message: 'Processing is taking longer than expected. Please try again.',
    retry: true,
    maxRetries: 2
  },
  'RATE_LIMIT': {
    message: 'You\'ve reached your usage limit. Please upgrade your plan.',
    retry: false,
    userAction: 'upgrade_plan'
  },
  'POOR_QUALITY': {
    message: 'The result quality is low. Try using Quality Mode instead.',
    retry: true,
    switchToQuality: true
  }
};
```

---

## Rate Limiting Strategy

### Client-Side Rate Limiting

```javascript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(userId: string, tier: 'free' | 'pro' | 'enterprise'): boolean {
    const limits = {
      free: { requests: 50, window: 30 * 24 * 60 * 60 * 1000 }, // 50/month
      pro: { requests: 2000, window: 30 * 24 * 60 * 60 * 1000 }, // 2000/month
      enterprise: { requests: Infinity, window: 0 }
    };

    const limit = limits[tier];
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Clean old requests
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < limit.window
    );

    if (recentRequests.length >= limit.requests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    return true;
  }
}
```

---

## Caching Strategy

### Multi-Layer Caching

```javascript
// Layer 1: Browser Cache (localStorage)
// - Store user's photo locally
// - Store recent try-on results (last 10)
// - Expire after 7 days

// Layer 2: CDN Cache
// - Cache result images
// - Serve via CDN for fast delivery
// - Expire after 30 days

// Layer 3: Database Cache
// - Store mapping: hash(person + garment) -> result URL
// - Check before API call
// - Significant cost savings

class CacheManager {
  generateCacheKey(personImg: string, garmentImg: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(personImg + garmentImg);
    return hash.digest('hex');
  }

  async getCachedResult(cacheKey: string): Promise<string | null> {
    // Check database
    const cached = await db.cachedResults.findUnique({
      where: { key: cacheKey }
    });

    if (cached && cached.expiresAt > new Date()) {
      return cached.resultUrl;
    }

    return null;
  }

  async setCachedResult(cacheKey: string, resultUrl: string): Promise<void> {
    await db.cachedResults.upsert({
      where: { key: cacheKey },
      create: {
        key: cacheKey,
        resultUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      update: {
        resultUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  }
}
```

---

## Testing Strategy

### API Testing Checklist

- [ ] Test with various person photo types (full body, upper body, different poses)
- [ ] Test with various garment types (tops, dresses, jackets)
- [ ] Test edge cases (low res images, unusual backgrounds)
- [ ] Performance testing (response times under load)
- [ ] Cost tracking (monitor actual API costs)
- [ ] Fallback testing (simulate API failures)
- [ ] Cache hit rate monitoring
- [ ] Quality comparison (Fast vs Quality mode)

### Sample Test Suite

```javascript
describe('TryOn API', () => {
  it('should successfully try on a t-shirt', async () => {
    const result = await tryOnService.tryOn({
      personImage: SAMPLE_PERSON_IMG,
      garmentImage: SAMPLE_TSHIRT_IMG,
      quality: 'fast'
    });

    expect(result.resultImage).toBeDefined();
    expect(result.processingTime).toBeLessThan(10000);
  });

  it('should use cached result for duplicate requests', async () => {
    const result1 = await tryOnService.tryOn({ /* ... */ });
    const result2 = await tryOnService.tryOn({ /* ... */ });

    expect(result1.resultImage).toBe(result2.resultImage);
    expect(result2.processingTime).toBeLessThan(1000); // Cache hit
  });

  it('should fallback to Nano Banana if IDM-VTON fails', async () => {
    // Mock IDM-VTON failure
    replicateClient.run = jest.fn().mockRejectedValue(new Error('API Error'));

    const result = await tryOnService.tryOn({
      personImage: SAMPLE_PERSON_IMG,
      garmentImage: SAMPLE_TSHIRT_IMG,
      quality: 'high' // Request quality mode
    });

    expect(result.provider).toBe('nano-banana'); // Fallback used
  });
});
```

---

## Next Steps

1. **Immediate**:
   - Sign up for fal.ai account and get API key
   - Sign up for Replicate account and get API token
   - Test both APIs with sample images
   - Measure actual response times and quality

2. **Short-term**:
   - Implement TryOnService wrapper
   - Build caching layer
   - Create cost monitoring dashboard
   - Set up error tracking (Sentry)

3. **Long-term**:
   - Evaluate self-hosting IDM-VTON for cost optimization
   - Explore additional providers (Google AI direct, PiAPI)
   - Implement A/B testing for quality comparison
   - Build analytics for user preferences

---

## Resources

### API Documentation
- [IDM-VTON on Replicate](https://replicate.com/cuuupid/idm-vton)
- [Nano Banana Edit on fal.ai](https://fal.ai/models/fal-ai/nano-banana/edit/api)
- [Nano Banana Pro on fal.ai](https://fal.ai/models/fal-ai/nano-banana-pro/edit/api)
- [Google Gemini Image Generation](https://ai.google.dev/gemini-api/docs/image-generation)

### Research Papers
- IDM-VTON: [arXiv:2403.05139](https://arxiv.org/abs/2403.05139)
- OOTDiffusion: AAAI 2025
- [Awesome Virtual Try-On Research](https://github.com/minar09/awesome-virtual-try-on)

### Community Resources
- [IDM-VTON GitHub](https://github.com/yisol/IDM-VTON)
- [n8n Virtual Try-On Workflow](https://n8n.io/workflows/8022)
- [FASHN Blog: Comparing VITON Models](https://fashn.ai/blog/comparing-the-top-4-open-source-virtual-try-on-viton-models)

---

*Last Updated: December 3, 2025*
