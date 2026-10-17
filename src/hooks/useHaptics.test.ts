import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic, isHapticsSupported } from './useHaptics';

describe('useHaptics & triggerHaptic', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('detects when navigator.vibrate is supported', () => {
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: mockVibrate },
      writable: true,
      configurable: true,
    });

    expect(isHapticsSupported()).toBe(true);
  });

  it('gracefully handles environments without navigator.vibrate', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    });

    expect(isHapticsSupported()).toBe(false);
    expect(triggerHaptic('medium')).toBe(false);
  });

  it('triggers stepTransition double-pulse pattern correctly', () => {
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: mockVibrate },
      writable: true,
      configurable: true,
    });

    const result = triggerHaptic('stepTransition');
    expect(result).toBe(true);
    expect(mockVibrate).toHaveBeenCalledWith([18, 30, 22]);
  });

  it('triggers success pattern for estimate completion', () => {
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: mockVibrate },
      writable: true,
      configurable: true,
    });

    const result = triggerHaptic('success');
    expect(result).toBe(true);
    expect(mockVibrate).toHaveBeenCalledWith([25, 45, 30, 70, 40]);
  });

  it('triggers custom vibration durations or arrays directly', () => {
    const mockVibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: mockVibrate },
      writable: true,
      configurable: true,
    });

    triggerHaptic(50);
    expect(mockVibrate).toHaveBeenCalledWith(50);

    triggerHaptic([10, 20, 30]);
    expect(mockVibrate).toHaveBeenCalledWith([10, 20, 30]);
  });

  it('catches and suppresses browser permission errors without throwing', () => {
    const mockVibrate = vi.fn().mockImplementation(() => {
      throw new Error('NotAllowedError');
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: mockVibrate },
      writable: true,
      configurable: true,
    });

    expect(() => triggerHaptic('light')).not.toThrow();
    expect(triggerHaptic('light')).toBe(false);
  });
});
