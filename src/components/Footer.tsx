import React from 'react';
import { roofingConfig } from '../config/roofingConfig';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onStartEstimate: () => void;
  onOpenIntel: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onStartEstimate, onOpenIntel, onOpenAdmin }) => {
  const { brand } = roofingConfig;

  return (
    <footer className="bg-[#0A1D2E] text-slate-300 border-t border-slate-800 pt-16 pb-28 sm:pb-14 px-4 sm:px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/20">
                <svg
                  className="w-5 h-5 stroke-current fill-none stroke-[2.5]"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                {brand.companyName}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              {brand.tagline}. Dedicated to delivering transparent pricing, 50-year manufacturer warranties, and stress-free roof replacements across Greater Austin.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Texas State Roofing Contractor License: <strong>{brand.licenseNumber}</strong></span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">
              Austin Direct Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a
                  href={`tel:${brand.phoneRaw}`}
                  className="flex items-center gap-2 text-white hover:text-orange-400 transition"
                >
                  <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="font-semibold text-sm">{brand.phone}</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>{brand.ownerEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Serving {brand.serviceRadius}</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenIntel}
                className="text-xs text-orange-400 hover:text-orange-300 underline cursor-pointer"
              >
                View Live Austin Storm & Market Intel →
              </button>
            </div>
          </div>

          {/* Service Areas */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">
              Coverage Areas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {brand.serviceAreas.map((area, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {area}
                </span>
              ))}
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onStartEstimate}
                className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition"
              >
                Instant Estimate Calculator
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {brand.companyName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Free Inspection</span>
            <span>•</span>
            <span>Accessibility</span>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hover:text-orange-400 transition flex items-center gap-1 cursor-pointer font-medium"
              title="Open hidden Admin CRM demo view (?admin)"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Admin CRM (Demo)</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
