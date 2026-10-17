import React from 'react';
import { ExtraAddonKey } from '../../types';
import { roofingConfig } from '../../config/roofingConfig';
import { formatCurrency } from '../../utils/pricingEngine';
import { CheckSquare, Square, Sparkles, CheckCircle2 } from 'lucide-react';

interface StepExtrasProps {
  selectedExtras: ExtraAddonKey[];
  squareFeet: number;
  onToggle: (addonKey: ExtraAddonKey) => void;
  onCalculate: () => void;
  onBack: () => void;
}

export const StepExtras: React.FC<StepExtrasProps> = ({
  selectedExtras,
  squareFeet,
  onToggle,
  onCalculate,
  onBack,
}) => {
  const { extrasCatalog } = roofingConfig.pricing;

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
          Step 5 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Select optional project extras & upgrades
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          Choose any additional features you need. (Multi-select enabled — tap to toggle on or off).
        </p>
      </div>

      <div className="space-y-3">
        {extrasCatalog.map((addon) => {
          const isSelected = selectedExtras.includes(addon.id);
          const estimatedCost =
            addon.priceType === 'per_sqft'
              ? Math.round(squareFeet * addon.cost)
              : addon.cost;

          return (
            <button
              key={addon.id}
              type="button"
              onClick={() => onToggle(addon.id)}
              className={`w-full flex items-start gap-4 p-4 sm:p-5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="pt-0.5 text-orange-500">
                {isSelected ? (
                  <CheckSquare className="w-6 h-6 fill-orange-500 text-white" />
                ) : (
                  <Square className="w-6 h-6 text-slate-300" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{addon.label}</span>
                    {addon.badge && (
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-amber-300">
                        {addon.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-black text-slate-800">
                    +{formatCurrency(estimatedCost)}
                    <span className="text-[11px] font-normal text-slate-500 ml-1">
                      {addon.priceType === 'per_sqft' ? '($1.25/sq ft)' : '(Flat rate)'}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {addon.description}
                </p>
              </div>
            </button>
          );
        })}
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
          onClick={onCalculate}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-200" />
          <span>Calculate My Instant Estimate</span>
        </button>
      </div>
    </div>
  );
};
