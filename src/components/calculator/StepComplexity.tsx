import React from 'react';
import { Stories, RoofPitch } from '../../types';
import { roofingConfig } from '../../config/roofingConfig';
import { Layers, Triangle, CheckCircle2 } from 'lucide-react';

interface StepComplexityProps {
  stories: Stories;
  pitch: RoofPitch;
  onUpdate: (stories: Stories, pitch: RoofPitch) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepComplexity: React.FC<StepComplexityProps> = ({
  stories,
  pitch,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { pitchMultipliers } = roofingConfig.pricing;

  const storiesOptions: { value: Stories; label: string; desc: string; icon: string }[] = [
    { value: 1, label: '1 Story', desc: 'Single level, standard access', icon: '🏠' },
    { value: 2, label: '2 Stories', desc: 'Standard 2-story suburban layout', icon: '🏡' },
    { value: 3, label: '3+ Stories', desc: 'High elevation, multi-level', icon: '🏢' },
  ];

  const pitchOptions: {
    id: RoofPitch;
    label: string;
    angle: string;
    desc: string;
    slopeDiagram: string;
  }[] = [
    {
      id: 'low',
      label: 'Low Pitch',
      angle: 'Flat to 4:12',
      desc: 'Gentle slope, easily walkable',
      slopeDiagram: '📐 15° - 20° slope',
    },
    {
      id: 'medium',
      label: 'Medium Pitch',
      angle: '5:12 to 8:12',
      desc: 'Standard residential Texas angle',
      slopeDiagram: '📐 25° - 35° slope',
    },
    {
      id: 'steep',
      label: 'Steep Pitch',
      angle: '9:12 or higher',
      desc: 'Dramatic slope, harness rigged',
      slopeDiagram: '📐 40°+ architectural pitch',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
          Step 4 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Roof Complexity: Stories & Pitch
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          Roof height and slope determine the staging, safety equipment, and labor requirements.
        </p>
      </div>

      {/* Part 1: Stories */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-500" />
          <span>How many stories is your home?</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {storiesOptions.map((opt) => {
            const isSelected = stories === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate(opt.value, pitch)}
                className={`flex items-center sm:flex-col sm:items-start p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-2xl mr-3 sm:mr-0 sm:mb-2">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base">{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">{opt.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Part 2: Pitch */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Triangle className="w-4 h-4 text-orange-500" />
          <span>How steep is your roof pitch (slope)?</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {pitchOptions.map((p) => {
            const isSelected = pitch === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onUpdate(stories, p.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-base">{p.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </div>
                <div className="text-xs font-semibold text-orange-600">{p.angle}</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1 bg-slate-100 px-2 py-0.5 rounded w-fit">
                  {p.slopeDiagram}
                </div>
                <div className="text-xs text-slate-500 mt-2">{p.desc}</div>
              </button>
            );
          })}
        </div>
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
          Next: Add-ons & Extras →
        </button>
      </div>
    </div>
  );
};
