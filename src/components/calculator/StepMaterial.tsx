import React, { useState } from 'react';
import { RoofMaterial } from '../../types';
import { roofingConfig } from '../../config/roofingConfig';
import { CheckCircle2, Info, X, ThermometerSun, Wallet, Sparkles } from 'lucide-react';

interface StepMaterialProps {
  selectedMaterial: RoofMaterial;
  onSelect: (material: RoofMaterial) => void;
  onNext: () => void;
  onBack: () => void;
}

// 1. High-Quality Inline SVG for Architectural Asphalt Shingles
const AsphaltShingleSVG: React.FC<{ className?: string; isSelected?: boolean }> = ({
  className = 'w-6 h-6',
  isSelected = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-all duration-300 ${
      isSelected ? 'drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)] stroke-orange-500' : 'stroke-amber-600'
    }`}
  >
    {/* Architectural overlapping 3-tab shingle structure */}
    <rect
      x="2.5"
      y="3.5"
      width="19"
      height="4.5"
      rx="1"
      className={isSelected ? 'fill-orange-100/80 stroke-orange-500' : 'fill-amber-50 stroke-amber-600'}
      strokeWidth="1.6"
    />
    <line x1="8.5" y1="3.5" x2="8.5" y2="8" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="15.5" y1="3.5" x2="15.5" y2="8" strokeWidth="1.4" strokeLinecap="round" />

    {/* Middle offset tier */}
    <rect
      x="2"
      y="9"
      width="9.5"
      height="5"
      rx="1"
      className={isSelected ? 'fill-orange-200/70 stroke-orange-600' : 'fill-amber-100/80 stroke-amber-700'}
      strokeWidth="1.6"
    />
    <rect
      x="12.5"
      y="9"
      width="9.5"
      height="5"
      rx="1"
      className={isSelected ? 'fill-orange-200/70 stroke-orange-600' : 'fill-amber-100/80 stroke-amber-700'}
      strokeWidth="1.6"
    />

    {/* Bottom offset tier */}
    <rect
      x="1.5"
      y="15"
      width="6.5"
      height="5.5"
      rx="1"
      className={isSelected ? 'fill-orange-300/80 stroke-orange-600' : 'fill-amber-200/80 stroke-amber-800'}
      strokeWidth="1.6"
    />
    <rect
      x="8.75"
      y="15"
      width="6.5"
      height="5.5"
      rx="1"
      className={isSelected ? 'fill-orange-300/80 stroke-orange-600' : 'fill-amber-200/80 stroke-amber-800'}
      strokeWidth="1.6"
    />
    <rect
      x="16"
      y="15"
      width="6.5"
      height="5.5"
      rx="1"
      className={isSelected ? 'fill-orange-300/80 stroke-orange-600' : 'fill-amber-200/80 stroke-amber-800'}
      strokeWidth="1.6"
    />
  </svg>
);

// 2. High-Quality Inline SVG for Standing Seam Metal Roof
const MetalRoofSVG: React.FC<{ className?: string; isSelected?: boolean }> = ({
  className = 'w-6 h-6',
  isSelected = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-all duration-300 ${
      isSelected ? 'drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)] stroke-orange-500' : 'stroke-sky-600'
    }`}
  >
    {/* Metal roof ridge cap */}
    <path
      d="M2 5L12 2L22 5"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={isSelected ? 'stroke-orange-500' : 'stroke-sky-700'}
    />
    {/* Metal panels with vertical standing seams */}
    <rect
      x="3"
      y="5.5"
      width="18"
      height="15.5"
      rx="1.5"
      className={isSelected ? 'fill-sky-50/90 stroke-orange-500' : 'fill-slate-50 stroke-sky-600'}
      strokeWidth="1.6"
    />
    {/* Raised standing ribs */}
    <line x1="7.5" y1="5.5" x2="7.5" y2="21" strokeWidth="2" strokeLinecap="round" className={isSelected ? 'stroke-orange-600' : 'stroke-sky-600'} />
    <line x1="12" y1="5.5" x2="12" y2="21" strokeWidth="2.2" strokeLinecap="round" className={isSelected ? 'stroke-orange-500' : 'stroke-sky-700'} />
    <line x1="16.5" y1="5.5" x2="16.5" y2="21" strokeWidth="2" strokeLinecap="round" className={isSelected ? 'stroke-orange-600' : 'stroke-sky-600'} />
    {/* Sun reflection glint */}
    <path
      d="M19 8.5L20.5 7M20.5 10L19 8.5"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={isSelected ? 'stroke-amber-400' : 'stroke-amber-500'}
    />
  </svg>
);

// 3. High-Quality Inline SVG for Clay & Concrete Tile Roof
const ClayTileSVG: React.FC<{ className?: string; isSelected?: boolean }> = ({
  className = 'w-6 h-6',
  isSelected = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-all duration-300 ${
      isSelected ? 'drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)] stroke-orange-500' : 'stroke-rose-600'
    }`}
  >
    {/* Spanish scalloped barrel curves */}
    <path
      d="M3 6.5C3 4.5 6 4.5 6 6.5C6 4.5 9 4.5 9 6.5C9 4.5 12 4.5 12 6.5C12 4.5 15 4.5 15 6.5C15 4.5 18 4.5 18 6.5C18 4.5 21 4.5 21 6.5"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={isSelected ? 'stroke-orange-500' : 'stroke-rose-600'}
    />
    <path
      d="M3 12C3 9.8 6 9.8 6 12C6 9.8 9 9.8 9 12C9 9.8 12 9.8 12 12C12 9.8 15 9.8 15 12C15 9.8 18 9.8 18 12C18 9.8 21 9.8 21 12"
      strokeWidth="2"
      strokeLinecap="round"
      className={isSelected ? 'stroke-orange-600' : 'stroke-rose-700'}
    />
    <path
      d="M3 18C3 15.5 6 15.5 6 18C6 15.5 9 15.5 9 18C9 15.5 12 15.5 12 18C12 15.5 15 15.5 15 18C15 15.5 18 15.5 18 18C18 15.5 21 15.5 21 18"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={isSelected ? 'stroke-orange-500' : 'stroke-rose-800'}
    />
    <line x1="6" y1="6.5" x2="6" y2="19.5" strokeWidth="1.4" strokeDasharray="1.5 1.5" className={isSelected ? 'stroke-orange-300' : 'stroke-rose-300'} />
    <line x1="12" y1="6.5" x2="12" y2="19.5" strokeWidth="1.4" strokeDasharray="1.5 1.5" className={isSelected ? 'stroke-orange-300' : 'stroke-rose-300'} />
    <line x1="18" y1="6.5" x2="18" y2="19.5" strokeWidth="1.4" strokeDasharray="1.5 1.5" className={isSelected ? 'stroke-orange-300' : 'stroke-rose-300'} />
  </svg>
);

// 4. High-Quality Inline SVG for Flat / TPO Single-Ply Membrane
const FlatTPOSVG: React.FC<{ className?: string; isSelected?: boolean }> = ({
  className = 'w-6 h-6',
  isSelected = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-all duration-300 ${
      isSelected ? 'drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)] stroke-orange-500' : 'stroke-teal-600'
    }`}
  >
    <path
      d="M2 17L22 17"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={isSelected ? 'stroke-orange-600' : 'stroke-teal-800'}
    />
    <rect
      x="3"
      y="6"
      width="18"
      height="10"
      rx="1.5"
      className={isSelected ? 'fill-teal-50/80 stroke-orange-500' : 'fill-slate-50 stroke-teal-600'}
      strokeWidth="1.8"
    />
    <line x1="12" y1="6" x2="12" y2="16" strokeWidth="2" strokeDasharray="2 1" className={isSelected ? 'stroke-orange-500' : 'stroke-teal-500'} />
    <path d="M2 6L4 6M20 6L22 6" strokeWidth="2.5" strokeLinecap="round" className={isSelected ? 'stroke-orange-500' : 'stroke-teal-700'} />
    <path
      d="M7 11L9.5 13.5L12 11"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={isSelected ? 'stroke-orange-400' : 'stroke-teal-400'}
    />
  </svg>
);

export const StepMaterial: React.FC<StepMaterialProps> = ({
  selectedMaterial,
  onSelect,
  onNext,
  onBack,
}) => {
  const { materialPerSqFt } = roofingConfig.pricing;

  // Track active info popup (clicked on mobile or desktop) and hover state
  const [activeInfoId, setActiveInfoId] = useState<RoofMaterial | null>(null);
  const [hoveredInfoId, setHoveredInfoId] = useState<RoofMaterial | null>(null);

  const materials: {
    id: RoofMaterial;
    emoji: string;
    renderSvg: (selected: boolean, sizeClass?: string) => React.ReactNode;
    badge?: string;
    highlights: string[];
    climateFit: string;
    budgetFit: string;
  }[] = [
    {
      id: 'asphalt',
      emoji: '🧱',
      renderSvg: (selected, sizeClass = 'w-7 h-7') => (
        <AsphaltShingleSVG className={sizeClass} isSelected={selected} />
      ),
      badge: 'Most Popular Value',
      highlights: ['Class-A Fire Rating', 'Wind up to 130 MPH', 'Architectural Dimension'],
      climateFit:
        'Proven in standard temperate-to-hot climates. Algae-resistant granules and Class-A fire ratings protect against wind gusts up to 130 MPH, though extreme 100°F+ Texas heat can age shingles slightly faster than metal.',
      budgetFit:
        'Entry-Level & High Initial Value. The lowest upfront cost per square foot ($5.25), making it the #1 choice for homeowners seeking great curb appeal without a large capital outlay.',
    },
    {
      id: 'metal',
      emoji: '⚡',
      renderSvg: (selected, sizeClass = 'w-7 h-7') => (
        <MetalRoofSVG className={sizeClass} isSelected={selected} />
      ),
      badge: 'Best Texas Heat Defense',
      highlights: ['Reflects 70% Solar Heat', 'Class 4 Hail Resistance', '50+ Year Longevity'],
      climateFit:
        'Unrivaled for severe heat and hailstorm zones. Reflects up to 70% of radiant solar heat (lowering summer cooling bills by up to 25%), carries a Class 4 impact rating against Texas hail, and will never rot or crack.',
      budgetFit:
        'Maximum Lifetime ROI. Higher upfront investment ($10.75/sq ft) that pays for itself over 50–70+ years with zero replacement cycles and qualifying homeowners for up to 20-35% insurance discounts.',
    },
    {
      id: 'tile',
      emoji: '🏛️',
      renderSvg: (selected, sizeClass = 'w-7 h-7') => (
        <ClayTileSVG className={sizeClass} isSelected={selected} />
      ),
      badge: 'Architectural Luxury',
      highlights: ['Unmatched Curb Appeal', 'Extreme Durability', 'Spanish & Mediterranean Style'],
      climateFit:
        'Engineered for intense sun, dry heat, and coastal winds. The heavy thermal mass of barrel tiles slows heat transfer into the attic during peak midday sun and resists thermal shock.',
      budgetFit:
        'Luxury & Legacy Investment. Higher initial cost ($13.50/sq ft) that dramatically increases estate resale value, lasting 50 to 100+ years without deteriorating.',
    },
    {
      id: 'flat_tpo',
      emoji: '🏢',
      renderSvg: (selected, sizeClass = 'w-7 h-7') => (
        <FlatTPOSVG className={sizeClass} isSelected={selected} />
      ),
      badge: 'Low-Slope Specialist',
      highlights: ['Heat-Welded Seams', 'Energy Star Certified', '100% Water Tight Membrane'],
      climateFit:
        'Essential for low-pitch and flat architectural home additions (less than 2:12 slope). The bright white membrane provides superior UV reflection (Energy Star Cool Roof) and heat-welded seams prevent pooling water leaks.',
      budgetFit:
        'Cost-Effective Modern Solution. Very affordable commercial-grade protection ($7.10/sq ft) that eliminates the pooling risk of traditional shingles on shallow roof slopes.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
          Step 3 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Which roofing material do you prefer?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          Each material offers distinct durability, energy efficiency, and styling advantages. Tap the <Info className="w-3.5 h-3.5 inline text-orange-600 -mt-0.5" /> info icons to compare climate and budget recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {materials.map(({ id, emoji, renderSvg, badge, highlights, climateFit, budgetFit }) => {
          const item = materialPerSqFt[id];
          const isSelected = selectedMaterial === id;
          const isInfoOpen = activeInfoId === id || hoveredInfoId === id;

          return (
            <div
              key={id}
              onClick={() => onSelect(id)}
              className={`relative flex flex-col items-start p-5 sm:p-6 rounded-2xl text-left border-2 transition-all duration-300 cursor-pointer group ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/50 shadow-lg ring-2 ring-orange-400/30 -translate-y-0.5'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {badge && (
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-slate-900 text-orange-300 text-[11px] font-bold tracking-wide shadow-sm border border-slate-700">
                  {badge}
                </div>
              )}

              {/* Top Header: Icon + Info Trigger + Select Radio */}
              <div className="flex items-center justify-between w-full mb-3">
                {/* Highlighted & Scaled Icon on Selection */}
                <div
                  className={`p-3 rounded-2xl transition-all duration-300 transform border flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-orange-500/15 border-orange-400/80 scale-110 shadow-md ring-2 ring-orange-400/40 text-orange-600'
                      : 'bg-slate-100 group-hover:bg-slate-50 border-slate-200/80 group-hover:scale-105'
                  }`}
                >
                  {renderSvg(isSelected, isSelected ? 'w-8 h-8' : 'w-7 h-7')}
                </div>

                <div className="flex items-center gap-2">
                  {/* Info Button Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInfoId(activeInfoId === id ? null : id);
                    }}
                    onMouseEnter={() => setHoveredInfoId(id)}
                    onMouseLeave={() => setHoveredInfoId(null)}
                    aria-label={`Show climate and budget guide for ${item.name}`}
                    title="Click or hover for Climate & Budget Guide"
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                      isInfoOpen
                        ? 'bg-orange-500 text-white border-orange-600 shadow-md ring-2 ring-orange-400/30'
                        : 'bg-slate-100 hover:bg-orange-100 text-slate-500 hover:text-orange-600 border-slate-200'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {/* Radio check indicator */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-orange-500 text-white scale-110 shadow-sm'
                        : 'border-2 border-slate-300 group-hover:border-slate-400'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-5 h-5 fill-orange-500 text-white" />}
                  </div>
                </div>
              </div>

              {/* Climate & Budget Info Popover Overlay */}
              {isInfoOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-x-3 top-16 z-30 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-fade-in text-xs leading-relaxed space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-extrabold text-orange-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" /> Climate & Budget Fit
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveInfoId(null);
                        setHoveredInfoId(null);
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                      aria-label="Close guide"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <ThermometerSun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold mb-0.5">Climate Fit:</strong>
                        <span className="text-slate-300">{climateFit}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Wallet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold mb-0.5">Budget Recommendation:</strong>
                        <span className="text-slate-300">{budgetFit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 text-right">
                    <span className="text-[10px] text-slate-400 italic">
                      Tap card to select this material
                    </span>
                  </div>
                </div>
              )}

              <div className="w-full">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>
                  <span
                    className={`text-base transition-transform duration-300 inline-block ${
                      isSelected ? 'scale-125 animate-bounce' : 'group-hover:scale-110'
                    }`}
                    title={item.name}
                  >
                    {emoji}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    ⏱ Lifespan: {item.lifespanYears}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    🛡 {item.warranty}
                  </span>
                </div>

                {/* Best For Note with inline SVG icon & emoji highlight */}
                <div
                  className={`mt-3.5 p-3 rounded-xl border text-xs leading-relaxed transition-all duration-300 flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-orange-100/70 border-orange-300 text-orange-950 font-medium shadow-sm ring-1 ring-orange-400/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {/* Small inline material SVG icon alongside 'best for' note */}
                  <div
                    className={`p-1 rounded-lg shrink-0 mt-0.5 transition-all duration-300 transform ${
                      isSelected
                        ? 'bg-white text-orange-600 scale-110 shadow-sm ring-1 ring-orange-300'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {renderSvg(isSelected, isSelected ? 'w-4 h-4' : 'w-3.5 h-3.5')}
                  </div>

                  <div className="flex-1">
                    <span className="font-extrabold uppercase tracking-wide text-[10px] mr-1.5 px-1.5 py-0.5 rounded bg-black/5">
                      Best For:
                    </span>
                    <span className={isSelected ? 'text-slate-900 font-semibold' : 'text-slate-700'}>
                      {item.bestFor}
                    </span>
                  </div>
                </div>

                {/* Bullets */}
                <ul className="mt-3 space-y-1 text-xs text-slate-600">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                          isSelected ? 'bg-orange-500' : 'bg-orange-400'
                        }`}
                      />
                      <span className={isSelected ? 'text-slate-800 font-medium' : ''}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
          onClick={onNext}
          className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 transition active:scale-95 cursor-pointer"
        >
          Next: Roof Complexity →
        </button>
      </div>
    </div>
  );
};
