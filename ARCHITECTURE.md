# Technical Architecture Document

## System Overview

The Virtual Try-On platform is built as a modular system with a shared core library and platform-specific implementations.

```
┌─────────────────────────────────────────────────────────────┐
│                     User Applications                        │
├──────────────┬──────────────────┬─────────────────────────────┤
│   Website    │      Chrome      │         Shopify            │
│   Plugin     │   Extension      │           App              │
└──────┬───────┴────────┬─────────┴────────┬───────────────────┘
       │                │                  │
       └────────────────┼──────────────────┘
                        │
              ┌─────────▼──────────┐
              │   Core Library     │
              │  (try-on-core)     │
              └─────────┬──────────┘
                        │
       ┌────────────────┼────────────────┐
       │                │                │
   ┌───▼────┐    ┌──────▼─────┐   ┌────▼────┐
   │ Image  │    │    API     │   │ Storage │
   │Detector│    │ Services   │   │ Manager │
   └────────┘    └──────┬─────┘   └─────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
        ┌─────▼──────┐      ┌─────▼──────┐
        │ Nano Banana│      │  IDM-VTON  │
        │   (fal.ai) │      │ (Replicate)│
        └────────────┘      └────────────┘
```

---

## Core Library Architecture

### Module Structure

```
try-on-core/
├── src/
│   ├── index.ts                    # Main exports
│   │
│   ├── detection/
│   │   ├── ImageDetector.ts        # Main detection orchestrator
│   │   ├── DOMScanner.ts           # Scans page for images
│   │   ├── ClassifierService.ts    # Classifies if image is apparel
│   │   └── types.ts                # Detection type definitions
│   │
│   ├── api/
│   │   ├── TryOnService.ts         # Main try-on service
│   │   ├── NanoBananaClient.ts     # Nano Banana API wrapper
│   │   ├── IDMVTONClient.ts        # IDM-VTON API wrapper
│   │   ├── CacheManager.ts         # Result caching
│   │   └── types.ts                # API type definitions
│   │
│   ├── storage/
│   │   ├── PhotoStorage.ts         # User photo management
│   │   ├── LocalStorage.ts         # Browser localStorage wrapper
│   │   ├── IndexedDBStorage.ts     # Browser IndexedDB wrapper
│   │   └── types.ts                # Storage type definitions
│   │
│   ├── ui/
│   │   ├── TryOnButton.ts          # Try-on button component
│   │   ├── Modal.ts                # Results modal component
│   │   ├── PhotoUploader.ts        # Photo upload UI
│   │   ├── LoadingSpinner.ts       # Loading animation
│   │   └── styles.css              # Component styles
│   │
│   ├── utils/
│   │   ├── imageProcessing.ts      # Image compression, conversion
│   │   ├── analytics.ts            # Event tracking
│   │   ├── logger.ts               # Logging utility
│   │   └── validators.ts           # Input validation
│   │
│   └── config/
│       ├── constants.ts            # App constants
│       └── defaults.ts             # Default configuration
│
├── tests/
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── e2e/                        # End-to-end tests
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Component Details

### 1. Image Detection System

#### ImageDetector Class

```typescript
interface DetectionConfig {
  minWidth: number;           // Minimum image width (default: 200px)
  minHeight: number;          // Minimum image height (default: 200px)
  minAspectRatio: number;     // Min aspect ratio (default: 0.5)
  maxAspectRatio: number;     // Max aspect ratio (default: 2.0)
  scanInterval: number;       // Rescan interval in ms (default: 2000)
  excludeSelectors: string[]; // CSS selectors to exclude
}

interface DetectedImage {
  element: HTMLImageElement;
  src: string;
  bounds: DOMRect;
  confidence: number;         // 0-1 confidence score
  category?: 'top' | 'dress' | 'jacket' | 'bottom';
}

class ImageDetector {
  private config: DetectionConfig;
  private observer: MutationObserver;
  private detectedImages: Map<string, DetectedImage>;

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.detectedImages = new Map();
    this.setupObserver();
  }

  // Scan page for apparel images
  async scan(): Promise<DetectedImage[]> {
    const images = this.getAllImages();
    const filtered = this.filterBySize(images);
    const classified = await this.classifyImages(filtered);
    return classified;
  }

  // Start continuous monitoring
  startMonitoring(): void {
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.observer.disconnect();
  }

  private getAllImages(): HTMLImageElement[] {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter(img => !this.shouldExclude(img));
  }

  private filterBySize(images: HTMLImageElement[]): HTMLImageElement[] {
    return images.filter(img => {
      const bounds = img.getBoundingClientRect();
      const aspectRatio = bounds.width / bounds.height;

      return (
        bounds.width >= this.config.minWidth &&
        bounds.height >= this.config.minHeight &&
        aspectRatio >= this.config.minAspectRatio &&
        aspectRatio <= this.config.maxAspectRatio
      );
    });
  }

  private async classifyImages(images: HTMLImageElement[]): Promise<DetectedImage[]> {
    // Use heuristics + optional ML classifier
    return images.map(img => ({
      element: img,
      src: img.src,
      bounds: img.getBoundingClientRect(),
      confidence: this.calculateConfidence(img),
      category: this.detectCategory(img)
    })).filter(img => img.confidence > 0.5);
  }

  private calculateConfidence(img: HTMLImageElement): number {
    let score = 0;

    // Check class names
    const classNames = img.className.toLowerCase();
    if (classNames.includes('product') || classNames.includes('apparel')) {
      score += 0.3;
    }

    // Check parent structure
    const parent = img.closest('[data-product], .product-image, .product-card');
    if (parent) score += 0.3;

    // Check if near price/buy button
    const siblings = Array.from(img.parentElement?.children || []);
    const hasPriceNearby = siblings.some(el =>
      el.textContent?.match(/\$[\d,]+\.?\d*/));
    if (hasPriceNearby) score += 0.2;

    // Check image aspect ratio (clothing images are usually portrait)
    const bounds = img.getBoundingClientRect();
    const aspectRatio = bounds.width / bounds.height;
    if (aspectRatio >= 0.6 && aspectRatio <= 1.2) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private detectCategory(img: HTMLImageElement): string | undefined {
    const alt = img.alt.toLowerCase();
    const src = img.src.toLowerCase();
    const combined = alt + ' ' + src;

    if (combined.match(/\b(shirt|blouse|top|tee)\b/)) return 'top';
    if (combined.match(/\b(dress)\b/)) return 'dress';
    if (combined.match(/\b(jacket|coat|blazer)\b/)) return 'jacket';
    if (combined.match(/\b(pants|jeans|skirt|shorts)\b/)) return 'bottom';

    return undefined;
  }
}
```

#### Detection Strategies

**Strategy 1: Heuristic-Based** (MVP)
- Class name analysis
- DOM structure analysis
- Proximity to price/cart elements
- Image size and aspect ratio

**Strategy 2: ML-Based** (Future Enhancement)
- Train lightweight CNN classifier
- Run inference on device (TensorFlow.js)
- Classify: apparel vs. non-apparel
- Category detection: top, dress, jacket, etc.

---

### 2. API Service Layer

#### TryOnService Class

```typescript
interface TryOnRequest {
  personImage: string | File;
  garmentImage: string | File;
  garmentDescription?: string;
  quality: 'fast' | 'high';
  cacheEnabled?: boolean;
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

class TryOnService {
  private nanaBananaClient: NanaBananaClient;
  private idmVtonClient: IDMVTONClient;
  private cacheManager: CacheManager;
  private rateLimiter: RateLimiter;

  constructor(config: ServiceConfig) {
    this.nanaBananaClient = new NanaBananaClient(config.falApiKey);
    this.idmVtonClient = new IDMVTONClient(config.replicateApiToken);
    this.cacheManager = new CacheManager();
    this.rateLimiter = new RateLimiter();
  }

  async tryOn(request: TryOnRequest): Promise<TryOnResponse> {
    // Validate inputs
    await this.validateRequest(request);

    // Check rate limits
    if (!this.rateLimiter.canMakeRequest()) {
      throw this.createError('RATE_LIMIT_EXCEEDED',
        'You have reached your usage limit');
    }

    // Check cache
    if (request.cacheEnabled !== false) {
      const cached = await this.checkCache(request);
      if (cached) return cached;
    }

    // Process images
    const personImg = await this.processImage(request.personImage);
    const garmentImg = await this.processImage(request.garmentImage);

    // Make API call
    const startTime = Date.now();
    let result: TryOnResponse;

    try {
      if (request.quality === 'fast') {
        result = await this.tryOnFast(personImg, garmentImg, request);
      } else {
        result = await this.tryOnQuality(personImg, garmentImg, request);
      }
    } catch (error) {
      // Attempt fallback
      result = await this.handleFailure(error, request);
    }

    result.processingTime = Date.now() - startTime;

    // Cache result
    if (request.cacheEnabled !== false) {
      await this.cacheResult(request, result);
    }

    return result;
  }

  private async tryOnFast(
    personImg: string,
    garmentImg: string,
    request: TryOnRequest
  ): Promise<TryOnResponse> {
    const result = await this.nanaBananaClient.edit({
      prompt: `photo of the person wearing this ${request.garmentDescription || 'clothing item'}`,
      imageUrls: [personImg, garmentImg]
    });

    return {
      resultImage: result.imageUrl,
      processingTime: 0, // Set by caller
      provider: 'nano-banana',
      cached: false,
      cost: 0.01
    };
  }

  private async tryOnQuality(
    personImg: string,
    garmentImg: string,
    request: TryOnRequest
  ): Promise<TryOnResponse> {
    const result = await this.idmVtonClient.tryOn({
      humanImg: personImg,
      garmImg: garmentImg,
      garmentDes: request.garmentDescription || '',
      isChecked: true,
      denoiseSteps: 30
    });

    return {
      resultImage: result.outputUrl,
      processingTime: 0,
      provider: 'idm-vton',
      cached: false,
      cost: 0.025
    };
  }

  private async processImage(image: string | File): Promise<string> {
    // If already a URL, return as-is
    if (typeof image === 'string') {
      return image;
    }

    // If File, compress and convert to base64 or upload
    const compressed = await this.compressImage(image);
    return this.imageToDataURL(compressed);
  }

  private async compressImage(file: File): Promise<File> {
    // Target: max 1024x1024, <1MB
    // Implementation using canvas or compression library
    return file; // Placeholder
  }

  private async checkCache(request: TryOnRequest): Promise<TryOnResponse | null> {
    const cacheKey = this.cacheManager.generateKey(
      request.personImage,
      request.garmentImage
    );
    return this.cacheManager.get(cacheKey);
  }

  private async cacheResult(request: TryOnRequest, result: TryOnResponse): Promise<void> {
    const cacheKey = this.cacheManager.generateKey(
      request.personImage,
      request.garmentImage
    );
    await this.cacheManager.set(cacheKey, result);
  }

  private async handleFailure(error: any, request: TryOnRequest): Promise<TryOnResponse> {
    console.error('Primary provider failed:', error);

    // If quality mode failed, try fast mode
    if (request.quality === 'high') {
      console.log('Falling back to fast mode...');
      return this.tryOnFast(
        await this.processImage(request.personImage),
        await this.processImage(request.garmentImage),
        request
      );
    }

    throw this.createError('API_FAILURE', 'Unable to process try-on request');
  }
}
```

---

### 3. Storage System

#### PhotoStorage Class

```typescript
interface StoredPhoto {
  id: string;
  dataUrl: string;
  thumbnail: string;
  uploadedAt: number;
  lastUsed: number;
  metadata?: {
    width: number;
    height: number;
    size: number;
  };
}

class PhotoStorage {
  private storage: IStorage;

  constructor(useIndexedDB: boolean = true) {
    this.storage = useIndexedDB
      ? new IndexedDBStorage('tryon-photos')
      : new LocalStorageWrapper('tryon-photos');
  }

  async savePhoto(file: File): Promise<StoredPhoto> {
    // Generate thumbnail
    const thumbnail = await this.generateThumbnail(file, 100);

    // Convert to data URL
    const dataUrl = await this.fileToDataURL(file);

    const photo: StoredPhoto = {
      id: this.generateId(),
      dataUrl,
      thumbnail,
      uploadedAt: Date.now(),
      lastUsed: Date.now(),
      metadata: {
        width: 0,  // Extract from image
        height: 0,
        size: file.size
      }
    };

    await this.storage.set(photo.id, photo);
    return photo;
  }

  async getPhoto(id: string): Promise<StoredPhoto | null> {
    const photo = await this.storage.get(id);
    if (photo) {
      // Update last used
      photo.lastUsed = Date.now();
      await this.storage.set(id, photo);
    }
    return photo;
  }

  async getAllPhotos(): Promise<StoredPhoto[]> {
    const keys = await this.storage.getAllKeys();
    const photos = await Promise.all(
      keys.map(key => this.storage.get(key))
    );
    return photos.filter(p => p !== null);
  }

  async deletePhoto(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async getDefaultPhoto(): Promise<StoredPhoto | null> {
    const photos = await this.getAllPhotos();
    if (photos.length === 0) return null;

    // Return most recently used
    photos.sort((a, b) => b.lastUsed - a.lastUsed);
    return photos[0];
  }

  async cleanup(): Promise<void> {
    const photos = await this.getAllPhotos();
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    // Delete photos older than 30 days and not used recently
    for (const photo of photos) {
      if (now - photo.lastUsed > THIRTY_DAYS) {
        await this.deletePhoto(photo.id);
      }
    }
  }
}
```

---

### 4. UI Components

#### TryOnButton Component

```typescript
interface ButtonConfig {
  position: 'bottom' | 'overlay' | 'top';
  theme: 'light' | 'dark' | 'auto';
  text: string;
  icon?: string;
  customStyles?: Partial<CSSStyleDeclaration>;
}

class TryOnButton {
  private button: HTMLButtonElement;
  private config: ButtonConfig;
  private onClick: () => void;

  constructor(config: Partial<ButtonConfig>, onClick: () => void) {
    this.config = { ...DEFAULT_BUTTON_CONFIG, ...config };
    this.onClick = onClick;
    this.button = this.createButton();
  }

  private createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'tryon-button';
    button.textContent = this.config.text;

    if (this.config.icon) {
      const icon = document.createElement('span');
      icon.innerHTML = this.config.icon;
      button.prepend(icon);
    }

    this.applyStyles(button);
    button.addEventListener('click', this.onClick);

    return button;
  }

  private applyStyles(button: HTMLButtonElement): void {
    // Base styles
    Object.assign(button.style, {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      ...this.getThemeStyles(),
      ...this.config.customStyles
    });
  }

  private getThemeStyles(): Partial<CSSStyleDeclaration> {
    const themes = {
      light: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: '1px solid #e0e0e0'
      },
      dark: {
        backgroundColor: '#000000',
        color: '#ffffff',
        border: '1px solid #333333'
      },
      auto: {
        backgroundColor: 'var(--tryon-bg, #ffffff)',
        color: 'var(--tryon-text, #000000)',
        border: '1px solid var(--tryon-border, #e0e0e0)'
      }
    };

    return themes[this.config.theme];
  }

  injectNear(targetImage: HTMLImageElement): void {
    const container = this.createContainer();
    container.appendChild(this.button);

    if (this.config.position === 'bottom') {
      targetImage.after(container);
    } else if (this.config.position === 'overlay') {
      this.createOverlay(targetImage, container);
    } else {
      targetImage.before(container);
    }
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'tryon-button-container';
    container.style.textAlign = 'center';
    container.style.margin = '8px 0';
    return container;
  }

  private createOverlay(target: HTMLImageElement, container: HTMLDivElement): void {
    // Wrap image in relative positioned container
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    target.parentElement?.insertBefore(wrapper, target);
    wrapper.appendChild(target);

    // Position button absolutely
    container.style.position = 'absolute';
    container.style.bottom = '10px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '10';

    wrapper.appendChild(container);
  }

  setLoading(loading: boolean): void {
    this.button.disabled = loading;
    this.button.textContent = loading ? 'Processing...' : this.config.text;

    if (loading) {
      this.button.style.opacity = '0.6';
      this.button.style.cursor = 'wait';
    } else {
      this.button.style.opacity = '1';
      this.button.style.cursor = 'pointer';
    }
  }

  destroy(): void {
    this.button.removeEventListener('click', this.onClick);
    this.button.remove();
  }
}
```

---

## Platform-Specific Implementations

### Website Plugin

```
try-on-plugin/
├── src/
│   ├── index.ts              # Entry point + initialization
│   ├── config.ts             # Configuration schema
│   └── analytics.ts          # Analytics integration
├── dist/
│   └── try-on.min.js         # Bundled output
├── examples/
│   ├── basic.html            # Basic integration
│   ├── custom-styling.html   # Custom styles
│   └── advanced.html         # Advanced configuration
├── package.json
└── README.md
```

**Integration Example**:
```html
<!-- Load script -->
<script src="https://cdn.tryon.app/v1/try-on.min.js"></script>

<!-- Initialize -->
<script>
  window.TryOn.init({
    apiKey: 'YOUR_API_KEY',
    theme: 'auto',
    position: 'bottom',
    quality: 'fast',
    autoDetect: true,
    onSuccess: (result) => console.log('Try-on complete!', result),
    onError: (error) => console.error('Try-on failed:', error)
  });
</script>
```

---

### Chrome Extension

```
try-on-extension/
├── manifest.json             # Extension manifest (V3)
├── src/
│   ├── background/
│   │   └── service-worker.ts # Background service worker
│   ├── content/
│   │   └── content-script.ts # Injected into pages
│   ├── popup/
│   │   ├── popup.html        # Extension popup UI
│   │   ├── popup.ts          # Popup logic
│   │   └── popup.css         # Popup styles
│   └── options/
│       ├── options.html      # Settings page
│       └── options.ts        # Settings logic
├── assets/
│   ├── icons/                # Extension icons
│   └── images/               # UI images
└── package.json
```

**Manifest V3 Structure**:
```json
{
  "manifest_version": 3,
  "name": "Virtual Try-On",
  "version": "1.0.0",
  "description": "Try on clothing from any website",
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["https://*/*"],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content-script.js"],
    "css": ["content/styles.css"]
  }],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "assets/icons/icon-16.png",
      "48": "assets/icons/icon-48.png",
      "128": "assets/icons/icon-128.png"
    }
  },
  "options_page": "options/options.html"
}
```

---

### Shopify App

```
try-on-shopify/
├── shopify.app.toml          # Shopify app configuration
├── app/
│   ├── routes/
│   │   ├── _index.tsx        # Dashboard
│   │   ├── app._index.tsx    # App home
│   │   └── api/
│   │       ├── try-on.ts     # Try-on API endpoint
│   │       └── webhook.ts    # Shopify webhooks
│   ├── shopify.server.ts     # Shopify configuration
│   └── db.server.ts          # Database connection
├── extensions/
│   └── theme-extension/
│       ├── blocks/
│       │   └── try-on-button.liquid  # Liquid block
│       ├── assets/
│       │   ├── try-on.js     # Frontend logic
│       │   └── try-on.css    # Styles
│       └── locales/
│           └── en.default.json
├── prisma/
│   └── schema.prisma         # Database schema
└── package.json
```

**Theme Extension Block** (try-on-button.liquid):
```liquid
{% schema %}
{
  "name": "Virtual Try-On Button",
  "target": "section",
  "settings": [
    {
      "type": "select",
      "id": "position",
      "label": "Button Position",
      "options": [
        { "value": "bottom", "label": "Below Image" },
        { "value": "overlay", "label": "Overlay on Image" }
      ],
      "default": "bottom"
    },
    {
      "type": "color",
      "id": "button_color",
      "label": "Button Color",
      "default": "#000000"
    }
  ]
}
{% endschema %}

<div class="tryon-container" data-position="{{ block.settings.position }}">
  <button class="tryon-button"
          style="background-color: {{ block.settings.button_color }};"
          data-product-id="{{ product.id }}"
          data-image-url="{{ product.featured_image | img_url: 'large' }}">
    Try On
  </button>
</div>

<script src="{{ 'try-on.js' | asset_url }}" defer></script>
<link rel="stylesheet" href="{{ 'try-on.css' | asset_url }}">
```

---

## Data Flow

### Typical Try-On Flow

```
1. Page Load
   ↓
2. ImageDetector.scan()
   ↓
3. Detected Images → TryOnButton.inject()
   ↓
4. User Clicks Button
   ↓
5. Check if user has photo
   ├─ No → Show PhotoUploader
   └─ Yes → Continue
   ↓
6. PhotoStorage.getDefaultPhoto()
   ↓
7. TryOnService.tryOn(userPhoto, garmentImage)
   ↓
8. Check CacheManager
   ├─ Cache Hit → Return cached result
   └─ Cache Miss → Continue
   ↓
9. Select Provider (Fast vs Quality)
   ├─ Fast → NanaBananaClient.edit()
   └─ Quality → IDMVTONClient.tryOn()
   ↓
10. API Request
   ↓
11. Receive Result
   ↓
12. CacheManager.set()
   ↓
13. Modal.show(result)
   ↓
14. User Actions (Download, Share, Close)
```

---

## Security Architecture

### Data Security

**Client-Side**:
- User photos encrypted before localStorage/IndexedDB
- No automatic server upload
- Clear data retention policy (30 days)

**API Communication**:
- HTTPS only
- API key rotation support
- Rate limiting per user/domain

**Content Security Policy**:
```javascript
{
  "default-src": "'self'",
  "img-src": "'self' data: https:",
  "connect-src": "'self' https://fal.ai https://replicate.com",
  "script-src": "'self' 'unsafe-inline'",
  "style-src": "'self' 'unsafe-inline'"
}
```

---

## Performance Optimization

### Bundle Size Optimization

**Target Sizes**:
- Core library: <30KB gzipped
- Website plugin: <50KB gzipped
- Chrome extension: <500KB total

**Strategies**:
- Tree shaking (ESM modules)
- Code splitting (lazy load UI components)
- Compression (Brotli/Gzip)
- CDN caching

### Runtime Optimization

**Image Processing**:
- Compress images before API submission
- Use WebWorkers for heavy operations
- Progressive image loading

**API Calls**:
- Result caching (30-day TTL)
- Request deduplication
- Prefetch for common use cases

**DOM Operations**:
- Debounced scanning
- Virtual scrolling for photo gallery
- RequestAnimationFrame for animations

---

## Monitoring & Analytics

### Key Events

```typescript
enum TryOnEvent {
  // Discovery
  BUTTON_RENDERED = 'button_rendered',
  BUTTON_CLICKED = 'button_clicked',

  // Photo Management
  PHOTO_UPLOAD_STARTED = 'photo_upload_started',
  PHOTO_UPLOAD_COMPLETED = 'photo_upload_completed',
  PHOTO_UPLOAD_FAILED = 'photo_upload_failed',

  // Try-On Process
  TRYON_STARTED = 'tryon_started',
  TRYON_COMPLETED = 'tryon_completed',
  TRYON_FAILED = 'tryon_failed',
  TRYON_CACHED = 'tryon_cached',

  // Results
  RESULT_VIEWED = 'result_viewed',
  RESULT_DOWNLOADED = 'result_downloaded',
  RESULT_SHARED = 'result_shared',

  // Errors
  ERROR_OCCURRED = 'error_occurred'
}
```

### Metrics Dashboard

**Technical Metrics**:
- API response times (p50, p95, p99)
- Error rates by type
- Cache hit rate
- Bundle load time

**Business Metrics**:
- Daily/Monthly active users
- Try-on completion rate
- Quality mode vs Fast mode usage
- Conversion impact (for merchants)

---

## Testing Strategy

### Unit Tests
- All core library modules
- Utilities and helpers
- Coverage target: >80%

### Integration Tests
- API client functionality
- Storage layer
- End-to-end try-on flow

### E2E Tests
- Website plugin integration
- Chrome extension functionality
- Cross-browser compatibility

### Performance Tests
- Load testing (concurrent requests)
- Bundle size monitoring
- Memory leak detection

---

## Deployment Architecture

### CDN Setup

```
CloudFlare CDN
├── /v1/try-on.min.js         # Plugin script
├── /v1/try-on.css            # Styles
└── /assets/                  # Static assets
```

### API Infrastructure

```
Load Balancer
├── API Server 1
├── API Server 2
└── API Server 3
    ↓
┌─────────────────┐
│ Redis Cache     │
└─────────────────┘
    ↓
┌─────────────────┐
│ PostgreSQL DB   │
└─────────────────┘
```

---

## Next Steps

1. **Set up monorepo structure** (nx or turborepo)
2. **Implement core library** (detection + API clients)
3. **Build website plugin** (MVP)
4. **Test on sample e-commerce sites**
5. **Chrome extension development**
6. **Shopify app development**

---

*This architecture is designed to be modular, scalable, and maintainable across all three platform targets.*
