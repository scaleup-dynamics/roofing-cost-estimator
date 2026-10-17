import React, { useState } from 'react';
import { HouseSize } from '../../types';
import { roofingConfig } from '../../config/roofingConfig';
import { Ruler, Home, CheckCircle2, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface StepRoofSizeProps {
  squareFeet: number;
  selectedHouseSize?: HouseSize;
  onUpdate: (sqft: number, houseSize?: HouseSize) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepRoofSize: React.FC<StepRoofSizeProps> = ({
  squareFeet,
  selectedHouseSize,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { houseSizeDefaults } = roofingConfig.pricing;
  const [mode, setMode] = useState<'slider' | 'house_size'>('slider');

  const houseSizes: { id: HouseSize; icon: string }[] = [
    { id: 'small', icon: '🏡' },
    { id: 'medium', icon: '🏠' },
    { id: 'large', icon: '🏘️' },
    { id: 'very_large', icon: '🏰' },
  ];

  const handleHouseSizeSelect = (size: HouseSize) => {
    const defaultSqFt = houseSizeDefaults[size].sqFt;
    onUpdate(defaultSqFt, size);
  };

  const handleSliderChange = (newVal: number) => {
    // If slider moves away from preset, clear selectedHouseSize or keep closest
    onUpdate(newVal, undefined);
  };

  // Convert sq ft to roofing squares (100 sq ft = 1 square)
  const squares = (squareFeet / 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
          Step 2 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          What is the approximate size of your roof?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          Adjust the slider or choose a quick house size estimate. An exact laser measurement is taken during your free inspection.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex p-1 bg-slate-100 rounded-xl max-w-sm mx-auto sm:mx-0 border border-slate-200">
        <button
          type="button"
          onClick={() => setMode('slider')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            mode === 'slider'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Use Square Footage Slider
        </button>
        <button
          type="button"
          onClick={() => setMode('house_size')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            mode === 'house_size'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Not sure? Pick House Size
        </button>
      </div>

      {/* Main Square Footage Display Card with Subtle Floating Animation */}
      <motion.div
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0F2A43] text-white shadow-xl border border-slate-800"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-4 h-4" /> Selected Surface Area
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {squareFeet.toLocaleString()}
              </span>
              <span className="text-lg text-slate-300 font-medium">sq. ft.</span>
            </div>
          </div>

          <div className="sm:text-right bg-slate-800/80 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-700 sm:border-0">
            <span className="text-xs text-slate-400 block">Roofing Trade Metric</span>
            <span className="text-lg font-bold text-amber-300">
              ≈ {squares} Roofing Squares
            </span>
            <span className="text-[11px] text-slate-400 block">(1 square = 100 sq ft)</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="mt-8">
          <input
            type="range"
            min="500"
            max="5000"
            step="50"
            value={squareFeet}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label="Roof size in square feet"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>500 sq ft (Compact)</span>
            <span>2,500 sq ft (Average)</span>
            <span>5,000+ sq ft (Estate)</span>
          </div>
        </div>
      </motion.div>

      {/* Quick House Size Presets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Home className="w-4 h-4 text-orange-500" />
            <span>Select home size to auto-calculate:</span>
          </h3>
          <span className="text-xs text-slate-500 hidden sm:inline">Clicking updates the estimate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {houseSizes.map(({ id, icon }) => {
            const preset = houseSizeDefaults[id];
            const isSelected = selectedHouseSize === id || squareFeet === preset.sqFt;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleHouseSizeSelect(id)}
                className={`flex flex-col p-4 rounded-xl text-left border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{icon}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </div>
                <div className="font-bold text-slate-900 text-sm">{preset.label}</div>
                <div className="text-xs font-semibold text-orange-600 mt-0.5">
                  ≈ {preset.sqFt.toLocaleString()} sq ft
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-tight">
                  {preset.bedrooms}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span>
          <strong>Pro-tip:</strong> Roof square footage is generally 15-25% greater than your home's interior living area due to overhangs, eaves, and roof slope angles.
        </span>
      </div>

      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition cursor-pointer"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 transition active:scale-95 cursor-pointer"
        >
          Next: Choose Material →
        </button>
      </div>
    </div>
  );
};
