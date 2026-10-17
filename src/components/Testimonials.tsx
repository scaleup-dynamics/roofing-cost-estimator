import React from 'react';
import { roofingConfig } from '../config/roofingConfig';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const { testimonials, brand } = roofingConfig;

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
            Local Reputation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Trusted by Hundreds of {brand.city} Homeowners
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Read real reviews from homeowners who used our instant estimator and experienced our craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-300" />
                </div>

                {/* Review Text */}
                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  "{t.review}"
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{t.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </h4>
                    <p className="text-xs text-slate-500">{t.neighborhood}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{t.date}</span>
                </div>

                <div className="mt-2 inline-block px-2.5 py-1 rounded-lg bg-orange-100/70 text-orange-800 text-[11px] font-semibold">
                  {t.service}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
