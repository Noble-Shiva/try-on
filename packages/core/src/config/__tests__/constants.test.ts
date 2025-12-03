/**
 * Tests for constants
 */

import { describe, it, expect } from 'vitest';
import { PROVIDERS, QUALITY_MODES, COSTS, ERROR_CODES } from '../constants';

describe('Constants', () => {
  it('should have correct provider names', () => {
    expect(PROVIDERS.NANO_BANANA).toBe('nano-banana');
    expect(PROVIDERS.IDM_VTON).toBe('idm-vton');
  });

  it('should have correct quality modes', () => {
    expect(QUALITY_MODES.FAST).toBe('fast');
    expect(QUALITY_MODES.HIGH).toBe('high');
  });

  it('should have correct costs', () => {
    expect(COSTS.NANO_BANANA).toBe(0.01);
    expect(COSTS.IDM_VTON).toBe(0.025);
  });

  it('should have error codes', () => {
    expect(ERROR_CODES.INVALID_IMAGE).toBeDefined();
    expect(ERROR_CODES.API_ERROR).toBeDefined();
    expect(ERROR_CODES.RATE_LIMIT).toBeDefined();
  });
});
