/**
 * PhotoUploader Component
 * Full-featured photo upload with drag & drop, webcam, and preview
 */

import type { UploaderConfig } from '../../types/ui';

const DEFAULT_CONFIG: UploaderConfig = {
  enableWebcam: true,
  accept: ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: 10 * 1024 * 1024, // 10MB
  showPreview: true,
  instructions: 'Upload a clear, well-lit photo of yourself'
};

export class PhotoUploader {
  private overlay: HTMLDivElement;
  private uploader: HTMLDivElement;
  private config: UploaderConfig;
  private onUpload?: (file: File) => void;
  private onCancel?: () => void;
  private selectedFile?: File;
  private webcamStream?: MediaStream;

  constructor(config: Partial<UploaderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.overlay = this.createOverlay();
    this.uploader = this.createUploader();
    this.overlay.appendChild(this.uploader);
  }

  /**
   * Create overlay
   */
  private createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'tryon-uploader-overlay tryon-component';
    overlay.style.display = 'none';

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.cancel();
      }
    });

    return overlay;
  }

  /**
   * Create uploader element
   */
  private createUploader(): HTMLDivElement {
    const uploader = document.createElement('div');
    uploader.className = 'tryon-uploader';
    uploader.setAttribute('role', 'dialog');
    uploader.setAttribute('aria-modal', 'true');
    uploader.setAttribute('aria-labelledby', 'tryon-uploader-title');

    return uploader;
  }

  /**
   * Show uploader
   */
  show(onUpload: (file: File) => void, onCancel?: () => void): void {
    this.onUpload = onUpload;
    this.onCancel = onCancel;
    this.selectedFile = undefined;

    this.render();

    if (!this.overlay.parentElement) {
      document.body.appendChild(this.overlay);
    }

    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide uploader
   */
  hide(): void {
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';
    this.stopWebcam();
  }

  /**
   * Render uploader content
   */
  private render(): void {
    this.uploader.innerHTML = '';

    // Header
    const header = this.createHeader();
    this.uploader.appendChild(header);

    // Body
    const body = this.createBody();
    this.uploader.appendChild(body);

    // Footer
    const footer = this.createFooter();
    this.uploader.appendChild(footer);
  }

  /**
   * Create header
   */
  private createHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.className = 'tryon-uploader-header';

    const title = document.createElement('h2');
    title.id = 'tryon-uploader-title';
    title.className = 'tryon-uploader-title';
    title.textContent = 'Upload Your Photo';

    const subtitle = document.createElement('p');
    subtitle.className = 'tryon-uploader-subtitle';
    subtitle.textContent = this.config.instructions || '';

    header.appendChild(title);
    header.appendChild(subtitle);

    return header;
  }

  /**
   * Create body
   */
  private createBody(): HTMLDivElement {
    const body = document.createElement('div');
    body.className = 'tryon-uploader-body';

    if (this.selectedFile) {
      // Show preview
      body.appendChild(this.createPreview());
    } else {
      // Show upload options
      body.appendChild(this.createDropzone());

      if (this.config.enableWebcam) {
        body.appendChild(this.createOrDivider());
        body.appendChild(this.createWebcamButton());
      }

      body.appendChild(this.createGuidelines());
    }

    return body;
  }

  /**
   * Create dropzone
   */
  private createDropzone(): HTMLDivElement {
    const dropzone = document.createElement('div');
    dropzone.className = 'tryon-uploader-dropzone';

    const icon = document.createElement('div');
    icon.className = 'tryon-uploader-icon';
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
      </svg>
    `;

    const text = document.createElement('div');
    text.className = 'tryon-uploader-text';
    text.textContent = 'Drag & drop your photo here';

    const hint = document.createElement('div');
    hint.className = 'tryon-uploader-hint';
    hint.textContent = 'or click to browse';

    dropzone.appendChild(icon);
    dropzone.appendChild(text);
    dropzone.appendChild(hint);

    // File input (hidden)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = this.config.accept.join(',');
    input.style.display = 'none';

    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleFile(file);
      }
    });

    dropzone.appendChild(input);

    // Click handler
    dropzone.addEventListener('click', () => {
      input.click();
    });

    // Drag & drop handlers
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('tryon-uploader-dropzone--active');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('tryon-uploader-dropzone--active');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('tryon-uploader-dropzone--active');

      const file = e.dataTransfer?.files[0];
      if (file) {
        this.handleFile(file);
      }
    });

    return dropzone;
  }

  /**
   * Create OR divider
   */
  private createOrDivider(): HTMLDivElement {
    const divider = document.createElement('div');
    divider.className = 'tryon-uploader-or';
    divider.textContent = 'OR';
    return divider;
  }

  /**
   * Create webcam button
   */
  private createWebcamButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'tryon-uploader-webcam-btn';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      <span>Take Photo with Webcam</span>
    `;

    button.addEventListener('click', () => {
      this.showWebcam();
    });

    return button;
  }

  /**
   * Create guidelines
   */
  private createGuidelines(): HTMLDivElement {
    const guidelines = document.createElement('div');
    guidelines.className = 'tryon-uploader-guidelines';

    const title = document.createElement('div');
    title.className = 'tryon-uploader-guidelines-title';
    title.textContent = 'For best results:';

    const list = document.createElement('ul');
    list.className = 'tryon-uploader-guidelines-list';
    list.innerHTML = `
      <li class="good">✓ Full body or upper body visible</li>
      <li class="good">✓ Good lighting, no harsh shadows</li>
      <li class="good">✓ Neutral or simple background</li>
      <li class="good">✓ Front-facing pose</li>
      <li class="bad">✗ Avoid busy backgrounds</li>
      <li class="bad">✗ Avoid low lighting</li>
    `;

    guidelines.appendChild(title);
    guidelines.appendChild(list);

    return guidelines;
  }

  /**
   * Create preview
   */
  private createPreview(): HTMLDivElement {
    const preview = document.createElement('div');
    preview.className = 'tryon-uploader-preview';

    if (this.selectedFile) {
      const img = document.createElement('img');
      img.className = 'tryon-uploader-preview-image';
      img.src = URL.createObjectURL(this.selectedFile);
      img.alt = 'Preview';

      const info = document.createElement('div');
      info.className = 'tryon-uploader-preview-info';
      info.textContent = `${this.selectedFile.name} (${this.formatFileSize(this.selectedFile.size)})`;

      preview.appendChild(img);
      preview.appendChild(info);
    }

    return preview;
  }

  /**
   * Create footer
   */
  private createFooter(): HTMLDivElement {
    const footer = document.createElement('div');
    footer.className = 'tryon-uploader-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'tryon-uploader-button tryon-uploader-button--secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.cancel());

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'tryon-uploader-button tryon-uploader-button--primary';
    uploadBtn.textContent = this.selectedFile ? 'Use This Photo' : 'Upload';
    uploadBtn.disabled = !this.selectedFile;
    uploadBtn.addEventListener('click', () => this.confirm());

    footer.appendChild(cancelBtn);
    footer.appendChild(uploadBtn);

    return footer;
  }

  /**
   * Handle file selection
   */
  private handleFile(file: File): void {
    // Validate file type
    if (!this.config.accept.includes(file.type)) {
      alert(`Please select a valid image file (${this.config.accept.join(', ')})`);
      return;
    }

    // Validate file size
    if (file.size > this.config.maxSize) {
      alert(`File size must be less than ${this.formatFileSize(this.config.maxSize)}`);
      return;
    }

    this.selectedFile = file;
    this.render();
  }

  /**
   * Show webcam
   */
  private async showWebcam(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });

      this.webcamStream = stream;

      // Create webcam view
      const body = this.uploader.querySelector('.tryon-uploader-body');
      if (!body) return;

      body.innerHTML = '';

      const webcamContainer = document.createElement('div');
      webcamContainer.className = 'tryon-uploader-webcam';

      const video = document.createElement('video');
      video.className = 'tryon-uploader-webcam-video';
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;

      const controls = document.createElement('div');
      controls.className = 'tryon-uploader-webcam-controls';

      const captureBtn = document.createElement('button');
      captureBtn.className = 'tryon-uploader-button tryon-uploader-button--primary';
      captureBtn.textContent = 'Capture Photo';
      captureBtn.addEventListener('click', () => this.capturePhoto(video));

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'tryon-uploader-button tryon-uploader-button--secondary';
      cancelBtn.textContent = 'Back';
      cancelBtn.addEventListener('click', () => {
        this.stopWebcam();
        this.render();
      });

      controls.appendChild(captureBtn);
      controls.appendChild(cancelBtn);

      webcamContainer.appendChild(video);
      webcamContainer.appendChild(controls);

      body.appendChild(webcamContainer);
    } catch (error) {
      console.error('Failed to access webcam:', error);
      alert('Failed to access webcam. Please check permissions.');
    }
  }

  /**
   * Capture photo from webcam
   */
  private capturePhoto(video: HTMLVideoElement): void {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], 'webcam-photo.jpg', { type: 'image/jpeg' });
      this.stopWebcam();
      this.handleFile(file);
    }, 'image/jpeg', 0.9);
  }

  /**
   * Stop webcam
   */
  private stopWebcam(): void {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = undefined;
    }
  }

  /**
   * Confirm upload
   */
  private confirm(): void {
    if (this.selectedFile && this.onUpload) {
      this.onUpload(this.selectedFile);
    }
    this.hide();
  }

  /**
   * Cancel upload
   */
  private cancel(): void {
    if (this.onCancel) {
      this.onCancel();
    }
    this.hide();
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Destroy uploader
   */
  destroy(): void {
    this.stopWebcam();
    this.overlay.remove();
  }
}
