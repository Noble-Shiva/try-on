# @try-on/plugin

Website plugin for adding virtual try-on functionality to any e-commerce site.

## Quick Start

### 1. Include the Script

```html
<script src="https://cdn.tryon.app/v1/try-on.js"></script>
```

### 2. Initialize

```html
<script>
  TryOn.init({
    nanaBanana: {
      apiKey: 'your-fal-api-key'
    }
  });
</script>
```

That's it! The plugin will automatically:
- Detect clothing images on your page
- Add "Try On" buttons
- Handle the entire try-on workflow

## Configuration

### Basic Configuration

```javascript
TryOn.init({
  // API Keys (at least one required)
  nanaBanana: {
    apiKey: 'your-fal-api-key'  // Fast mode (~3-5s)
  },
  idmVton: {
    apiToken: 'your-replicate-token'  // Quality mode (~19s)
  },

  // Button appearance
  button: {
    position: 'bottom',  // 'bottom' | 'top' | 'overlay'
    theme: 'auto',       // 'light' | 'dark' | 'auto'
    size: 'medium',      // 'small' | 'medium' | 'large'
    text: 'Try On',
    icon: '👕'
  },

  // Modal settings
  modal: {
    title: 'Virtual Try-On Result',
    enableDownload: true,
    enableShare: true
  },

  // Detection settings
  detection: {
    minConfidence: 0.6,
    enableMonitoring: true,
    scanInterval: 2000
  }
});
```

### Advanced Configuration

```javascript
TryOn.init({
  // ... basic config ...

  // Storage settings
  storage: {
    useIndexedDB: true,   // Use IndexedDB for larger storage
    enableCache: true     // Cache results to save API costs
  },

  // Debug mode
  debug: true,

  // Callbacks
  onSuccess: (result) => {
    console.log('Try-on completed:', result);
  },

  onError: (error) => {
    console.error('Try-on failed:', error);
  },

  onButtonClick: (image) => {
    console.log('Try-on started for:', image);
  }
});
```

## API Methods

### `init(config)`

Initialize the plugin.

```javascript
await TryOn.init(config);
```

### `destroy()`

Remove all try-on buttons and clean up.

```javascript
TryOn.destroy();
```

### `getStats()`

Get plugin statistics.

```javascript
const stats = await TryOn.getStats();
console.log(stats);
// {
//   initialized: true,
//   detection: { totalDetected: 12, scanCount: 5 },
//   storage: { photoCount: 1, totalSize: 245000 },
//   cache: { entryCount: 3, totalSize: 180000 },
//   buttonCount: 12
// }
```

### `uploadPhoto(file)`

Manually upload a user photo.

```javascript
const fileInput = document.querySelector('#photo-input');
await TryOn.uploadPhoto(fileInput.files[0]);
```

### `clearPhotos()`

Clear all stored user photos.

```javascript
await TryOn.clearPhotos();
```

### `clearCache()`

Clear cached try-on results.

```javascript
await TryOn.clearCache();
```

## Examples

See the `examples/` directory for complete working examples:

- **basic.html** - Simple product grid integration
- **custom-styling.html** - Custom button styles (coming soon)
- **shopify-integration.html** - Shopify theme integration (coming soon)

## How It Works

1. **Detection**: Automatically scans your page for clothing images using smart heuristics
2. **Button Injection**: Adds "Try On" buttons near detected images
3. **Photo Upload**: Prompts user to upload their photo (saved locally)
4. **Try-On Processing**: Sends images to AI API for processing
5. **Result Display**: Shows result in a beautiful modal with download option
6. **Caching**: Caches results to save costs on repeated try-ons

## Supported Image Types

The plugin works best with:
- ✅ Tops (shirts, blouses, t-shirts, sweaters)
- ✅ Dresses
- ✅ Jackets and coats
- ✅ Outerwear
- ⚠️ Bottoms (limited support)
- ❌ Accessories (not yet supported)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Bundle Size**: ~50KB gzipped
- **Load Time**: <500ms
- **Try-On Speed**:
  - Fast mode (Nano Banana): 3-5 seconds
  - Quality mode (IDM-VTON): 15-20 seconds

## Costs

- **Nano Banana**: $0.01 per try-on
- **IDM-VTON**: $0.025 per try-on
- **Caching**: Reduces costs by ~70% for repeat customers

## Customization

### Custom Button Styles

```javascript
TryOn.init({
  button: {
    customStyles: {
      backgroundColor: '#ff0000',
      color: '#ffffff',
      borderRadius: '20px'
    },
    customClass: 'my-custom-button'
  }
});
```

### Custom Detection Rules

```javascript
TryOn.init({
  detection: {
    minConfidence: 0.7,        // Higher = more strict
    excludeSelectors: [
      '.banner',
      '.advertisement'
    ]
  }
});
```

## Troubleshooting

### Buttons Not Appearing

1. Check if images have minimum size (200x200px)
2. Verify images are product photos (not logos/icons)
3. Enable debug mode: `debug: true`
4. Check console for detection results

### Try-On Fails

1. Verify API keys are correct
2. Check browser console for errors
3. Ensure images are accessible (no CORS issues)
4. Try with different quality mode

### Slow Performance

1. Use fast mode (Nano Banana)
2. Enable caching
3. Reduce detection scan interval
4. Disable monitoring for static pages

## License

TBD

## Support

- GitHub Issues: [Report a bug](https://github.com/your-org/try-on/issues)
- Documentation: [Full docs](../../docs)
