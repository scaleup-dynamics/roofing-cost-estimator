import React, { useState, useEffect } from 'react';
import { EstimateInput, ServiceType, HouseSize, RoofMaterial, Stories, RoofPitch, ExtraAddonKey } from '../../types';
import { calculateRoofEstimate } from '../../utils/pricingEngine';
import { StepService } from './StepService';
import { StepRoofSize } from './StepRoofSize';
import { StepMaterial } from './StepMaterial';
import { StepComplexity } from './StepComplexity';
import { StepExtras } from './StepExtras';
import { EstimateResult } from './EstimateResult';
import { RoofVisualizer3D } from '../3d/RoofVisualizer3D';
import { Check, Sparkles, Box, ChevronDown, ChevronUp, RotateCcw, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStepHaptics, useHaptics } from '../../hooks/useHaptics';

interface CalculatorWizardProps {
  onOpenIntel: () => void;
}

const STORAGE_KEY = 'summit_roofing_wizard_state_v1';

const DEFAULT_ESTIMATE_INPUT: EstimateInput = {
  service: 'replacement',
  squareFeet: 2200,
  selectedHouseSize: 'medium',
  material: 'asphalt',
  stories: 1,
  pitch: 'medium',
  extras: ['tear_off'],
};

interface SavedWizardState {
  currentStep: number;
  estimateInput: EstimateInput;
  timestamp: number;
}

// Helper to safely read from localStorage
function loadSavedWizardState(): { step: number; input: EstimateInput; wasRestored: boolean } {
  if (typeof window === 'undefined') {
    return { step: 1, input: DEFAULT_ESTIMATE_INPUT, wasRestored: false };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: SavedWizardState = JSON.parse(raw);
      if (parsed && parsed.estimateInput && typeof parsed.currentStep === 'number') {
        const isValidStep = parsed.currentStep >= 1 && parsed.currentStep <= 6;
        const isModified =
          parsed.currentStep > 1 ||
          JSON.stringify(parsed.estimateInput) !== JSON.stringify(DEFAULT_ESTIMATE_INPUT);

        return {
          step: isValidStep ? parsed.currentStep : 1,
          input: { ...DEFAULT_ESTIMATE_INPUT, ...parsed.estimateInput },
          wasRestored: isModified,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to restore estimate from localStorage', err);
  }

  return { step: 1, input: DEFAULT_ESTIMATE_INPUT, wasRestored: false };
}

export const CalculatorWizard: React.FC<CalculatorWizardProps> = ({ onOpenIntel }) => {
  // Initialize state from localStorage persistence
  const [initialState] = useState(() => loadSavedWizardState());
  const [currentStep, setCurrentStep] = useState<number>(initialState.step);
  const [estimateInput, setEstimateInput] = useState<EstimateInput>(initialState.input);
  const [showRestoredBanner, setShowRestoredBanner] = useState<boolean>(initialState.wasRestored);
  const [showLive3D, setShowLive3D] = useState<boolean>(() => {
    // On mobile, collapse the 3D dock by default to avoid two simultaneous WebGL contexts
    // (one in the Hero section, one here). User can expand it with one tap.
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 640;
  });
  const { triggerHaptic } = useHaptics();

  // Browser haptic feedback (navigator.vibrate) triggered on step transitions for tactile mobile feel
  useStepHaptics(currentStep, {
    enabled: true,
    stepPattern: 'stepTransition', // tactile double-pulse [18ms, 30ms gap, 22ms]
    completionStep: 6, // finalized quote results page
    completionPattern: 'success', // celebratory multi-pulse cadence
  });

  // Automatically persist progress to localStorage whenever inputs or step change
  useEffect(() => {
    try {
      const payload: SavedWizardState = {
        currentStep,
        estimateInput,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to save estimate to localStorage', err);
    }
  }, [currentStep, estimateInput]);

  const stepTitles = [
    'Service',
    'Roof Size',
    'Material',
    'Complexity',
    'Extras',
  ];

  // Updaters
  const handleServiceSelect = (service: ServiceType) => {
    setEstimateInput((prev) => ({ ...prev, service }));
  };

  const handleRoofSizeUpdate = (squareFeet: number, selectedHouseSize?: HouseSize) => {
    setEstimateInput((prev) => ({ ...prev, squareFeet, selectedHouseSize }));
  };

  const handleMaterialSelect = (material: RoofMaterial) => {
    setEstimateInput((prev) => ({ ...prev, material }));
  };

  const handleComplexityUpdate = (stories: Stories, pitch: RoofPitch) => {
    setEstimateInput((prev) => ({ ...prev, stories, pitch }));
  };

  const handleExtraToggle = (addonKey: ExtraAddonKey) => {
    setEstimateInput((prev) => {
      const exists = prev.extras.includes(addonKey);
      const newExtras = exists
        ? prev.extras.filter((key) => key !== addonKey)
        : [...prev.extras, addonKey];
      return { ...prev, extras: newExtras };
    });
  };

  const handleCalculate = () => {
    setCurrentStep(6);
  };

  // Reset progress and wipe local storage
  const handleResetEstimate = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setEstimateInput(DEFAULT_ESTIMATE_INPUT);
    setCurrentStep(1);
    setShowRestoredBanner(false);
    triggerHaptic('light');
  };

  const calculatedBreakdown = calculateRoofEstimate(estimateInput);

  return (
    <div id="calculator-section" className="scroll-mt-20 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Wizard Card Container with Luxury Ambient Glow */}
      <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-300/40 p-6 sm:p-10 transition-all overflow-hidden">
        {/* Subtle decorative luxury accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Local Storage Restored Progress Banner */}
        <AnimatePresence>
          {showRestoredBanner && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 font-bold">Estimate Restored:</strong>{' '}
                  <span className="text-slate-600">
                    Resumed from your previous session (
                    {currentStep === 6 ? 'View Results' : `Step ${currentStep} of 5: ${stepTitles[currentStep - 1]}`}).
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleResetEstimate}
                  className="text-xs font-bold text-orange-700 hover:text-orange-900 bg-white hover:bg-orange-100/60 px-3 py-1.5 rounded-xl border border-orange-300 shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Fresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRestoredBanner(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition cursor-pointer"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top 3D Live Configuration Dock (Steps 1 to 5) */}
        {currentStep <= 5 && (
          <div
            className="mb-8 rounded-2xl bg-[#091522] border border-slate-800 p-3 sm:p-4 shadow-xl"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    Live 3D Roof Model
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    Updates in real-time as you customize below • Auto-saved locally
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {estimateInput.stories} Story • {estimateInput.pitch} Pitch
                </span>
                <button
                  type="button"
                  onClick={() => setShowLive3D(!showLive3D)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <span>{showLive3D ? 'Collapse' : 'Expand 3D'}</span>
                  {showLive3D ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Collapsible 3D Canvas */}
            {showLive3D && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RoofVisualizer3D
                  material={estimateInput.material}
                  pitch={estimateInput.pitch}
                  stories={estimateInput.stories}
                  extras={estimateInput.extras}
                  height="h-56 sm:h-72"
                />
              </motion.div>
            )}
          </div>
        )}

        {/* Progress Bar (Only show on steps 1-5) */}
        {currentStep <= 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="text-orange-600 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Step {currentStep} of 5: {stepTitles[currentStep - 1]}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[11px] hidden xs:inline flex items-center gap-1">
                  <Save className="w-3 h-3 text-emerald-600" /> Auto-saved
                </span>
                <span>{Math.round((currentStep / 5) * 100)}% Complete</span>
              </div>
            </div>

            {/* Stepper track */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: `${((currentStep - 1) / 5) * 100}%` }}
                animate={{ width: `${(currentStep / 5) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Step icons/labels on tablet+ */}
            <div className="hidden sm:grid grid-cols-5 gap-2 mt-3 pt-1">
              {stepTitles.map((title, idx) => {
                const stepNum = idx + 1;
                const isPassed = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;

                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      if (stepNum < currentStep) setCurrentStep(stepNum);
                    }}
                    disabled={stepNum > currentStep}
                    className={`text-center text-xs font-medium transition-all ${
                      isPassed
                        ? 'text-orange-600 font-semibold cursor-pointer'
                        : isCurrent
                        ? 'text-slate-900 font-bold'
                        : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isPassed ? (
                        <Check className="w-3.5 h-3.5 text-orange-600 inline" />
                      ) : (
                        <span className="inline-block w-3.5 h-3.5 rounded-full text-[10px] leading-tight border border-current">
                          {stepNum}
                        </span>
                      )}
                      <span>{title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Animated Step Transition Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {/* Step Views */}
            {currentStep === 1 && (
              <StepService
                selectedService={estimateInput.service}
                onSelect={handleServiceSelect}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <StepRoofSize
                squareFeet={estimateInput.squareFeet}
                selectedHouseSize={estimateInput.selectedHouseSize}
                onUpdate={handleRoofSizeUpdate}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <StepMaterial
                selectedMaterial={estimateInput.material}
                onSelect={handleMaterialSelect}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <StepComplexity
                stories={estimateInput.stories}
                pitch={estimateInput.pitch}
                onUpdate={handleComplexityUpdate}
                onNext={() => setCurrentStep(5)}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && (
              <StepExtras
                selectedExtras={estimateInput.extras}
                squareFeet={estimateInput.squareFeet}
                onToggle={handleExtraToggle}
                onCalculate={handleCalculate}
                onBack={() => setCurrentStep(4)}
              />
            )}

            {currentStep === 6 && (
              <EstimateResult
                input={estimateInput}
                breakdown={calculatedBreakdown}
                onEdit={() => setCurrentStep(1)}
                onOpenIntel={onOpenIntel}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
