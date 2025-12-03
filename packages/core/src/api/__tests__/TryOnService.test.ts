/**
 * Tests for TryOnService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TryOnService } from '../TryOnService';
import type { ProviderConfig, TryOnRequest } from '../../types/api';

describe('TryOnService', () => {
  let config: ProviderConfig;

  beforeEach(() => {
    config = {
      nanaBanana: {
        apiKey: 'test-fal-key'
      },
      idmVton: {
        apiToken: 'test-replicate-token'
      },
      defaultProvider: 'nano-banana',
      enableFallback: true
    };
  });

  describe('initialization', () => {
    it('should create service with both providers', () => {
      const service = new TryOnService(config);
      expect(service).toBeDefined();
    });

    it('should create service with only Nano Banana', () => {
      const nanoBananaOnlyConfig: ProviderConfig = {
        nanaBanana: {
          apiKey: 'test-key'
        }
      };
      const service = new TryOnService(nanoBananaOnlyConfig);
      expect(service).toBeDefined();
    });

    it('should create service with only IDM-VTON', () => {
      const idmVtonOnlyConfig: ProviderConfig = {
        idmVton: {
          apiToken: 'test-token'
        }
      };
      const service = new TryOnService(idmVtonOnlyConfig);
      expect(service).toBeDefined();
    });

    it('should throw error if no providers configured', () => {
      expect(() => new TryOnService({})).toThrow(
        'At least one API provider must be configured'
      );
    });
  });

  describe('isReady', () => {
    it('should return true when providers are available', async () => {
      const service = new TryOnService(config);
      const ready = await service.isReady();
      expect(ready).toBe(true);
    });
  });

  describe('getAvailableProviders', () => {
    it('should return list of available providers', async () => {
      const service = new TryOnService(config);
      const providers = await service.getAvailableProviders();
      expect(providers).toContain('nano-banana');
      expect(providers).toContain('idm-vton');
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for fast mode', () => {
      const service = new TryOnService(config);
      const request: TryOnRequest = {
        personImage: 'test.jpg',
        garmentImage: 'test.jpg',
        quality: 'fast'
      };
      const cost = service.estimateCost(request);
      expect(cost).toBe(0.01); // Nano Banana cost
    });

    it('should estimate cost for quality mode', () => {
      const service = new TryOnService(config);
      const request: TryOnRequest = {
        personImage: 'test.jpg',
        garmentImage: 'test.jpg',
        quality: 'high'
      };
      const cost = service.estimateCost(request);
      expect(cost).toBe(0.025); // IDM-VTON cost
    });
  });

  describe('provider selection', () => {
    it('should select Nano Banana for fast mode', () => {
      const service = new TryOnService(config);
      const request: TryOnRequest = {
        personImage: 'test.jpg',
        garmentImage: 'test.jpg',
        quality: 'fast'
      };
      const cost = service.estimateCost(request);
      expect(cost).toBe(0.01);
    });

    it('should select IDM-VTON for quality mode', () => {
      const service = new TryOnService(config);
      const request: TryOnRequest = {
        personImage: 'test.jpg',
        garmentImage: 'test.jpg',
        quality: 'high'
      };
      const cost = service.estimateCost(request);
      expect(cost).toBe(0.025);
    });
  });
});
