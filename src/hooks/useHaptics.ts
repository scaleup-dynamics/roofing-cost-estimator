import { useEffect, useRef, useCallback } from 'react';

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'stepTransition'
  | 'success'
  | 'warning'
  | number
  | number[];

const PRESET_PATTERNS: Record<string, number | number[]> = {
  light: 12, // Crisp subtle micro-pulse for radio/option select
  medium: 24, // Tactile click for navigation
  heavy: 45, // Solid impact pulse
  stepTransition: [18, 30, 22], // Elegant double-pulse rhythm for wizard step movement
  success: [25, 45, 30, 70, 40], // Celebratory multi-pulse cadence for quote unlock
  warning: [35, 50, 35],
};

/**
 * Checks if navigator.vibrate is supported and permitted in the current environment.
 */
export function isHapticsSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  );
}

/**
 * Imperatively triggers haptic vibration with safety fallbacks.
 */
export function triggerHaptic(type: HapticType = 'medium'): boolean {
  if (!isHapticsSupported()) {
    return false;
  }

  try {
    const pattern =
      typeof type === 'string' ? PRESET_PATTERNS[type] ?? 20 : type;
    return navigator.vibrate(pattern);
  } catch {
    // Gracefully catch security/iframe restrictions without crashing
    return false;
  }
}

/**
 * React hook providing safe, tactile browser haptic feedback.
 */
export function useHaptics() {
  const trigger = useCallback((type: HapticType = 'medium') => {
    return triggerHaptic(type);
  }, []);

  return {
    triggerHaptic: trigger,
    isSupported: isHapticsSupported(),
  };
}

/**
 * Dedicated hook that triggers haptic feedback whenever the step in CalculatorWizard changes.
 * Skips vibration on initial mount, providing natural tactile feedback only when the user
 * actively navigates forward, backward, or arrives at the estimate results.
 */
export function useStepHaptics(
  currentStep: number,
  options: {
    enabled?: boolean;
    stepPattern?: HapticType;
    completionStep?: number;
    completionPattern?: HapticType;
  } = {}
) {
  const {
    enabled = true,
    stepPattern = 'stepTransition',
    completionStep = 6,
    completionPattern = 'success',
  } = options;

  const isInitialMount = useRef(true);
  const previousStep = useRef(currentStep);

  useEffect(() => {
    // Skip vibration on initial page render/hydration
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousStep.current = currentStep;
      return;
    }

    // Only fire if the step has actually transitioned
    if (enabled && previousStep.current !== currentStep) {
      if (currentStep === completionStep) {
        // Special celebratory haptic sequence for reaching the finalized quote
        triggerHaptic(completionPattern);
      } else {
        // High-end tactile double-pulse for standard wizard step transitions
        triggerHaptic(stepPattern);
      }
      previousStep.current = currentStep;
    }
  }, [currentStep, enabled, stepPattern, completionStep, completionPattern]);
}
