import React from 'react';
import { roofingConfig } from '../config/roofingConfig';
import { Phone, ShieldCheck, Sparkles, Clock } from 'lucide-react';

interface HeaderProps {
  onStartEstimate: () => void;
  onOpenIntel: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartEstimate, onOpenIntel }) => {
  const { brand } = roofingConfig;

  return (
    <header className="sticky top-0 z-40 bg-[#0F2A43]/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md transition-all">
      {/* Top micro-announcement bar */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-1 text-xs text-white font-medium text-center flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
        <span>Storm season alert: Free drone inspections available in Greater {brand.city}</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white font-black text-xl transition-transform group-hover:scale-105">
            {/* Custom roof peak icon */}
            <svg
              className="w-6 h-6 stroke-current fill-none stroke-[2.5]"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight">
              {brand.companyName}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{brand.city}</span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline text-slate-400">Lic. #{brand.licenseNumber}</span>
            </div>
          </div>
        </a>

        {/* Right action area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time local Austin intel trigger */}
          <button
            onClick={onOpenIntel}
            type="button"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Austin Market & Hail Intel</span>
          </button>

          {/* Direct Phone Call Button */}
          <a
            href={`tel:${brand.phoneRaw}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs sm:text-sm border border-slate-700 transition active:scale-95"
            aria-label={`Call ${brand.companyName} at ${brand.phone}`}
          >
            <Phone className="w-4 h-4 text-orange-400" />
            <span className="hidden xs:inline">{brand.phone}</span>
            <span className="xs:hidden">Call</span>
          </a>

          {/* Quick quote action */}
          <button
            onClick={onStartEstimate}
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition active:scale-95"
          >
            Calculate
          </button>
        </div>
      </div>
    </header>
  );
};
