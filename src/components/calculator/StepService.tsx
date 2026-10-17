import React from 'react';
import { ServiceType } from '../../types';
import { roofingConfig } from '../../config/roofingConfig';
import { Wrench, Home, Building2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface StepServiceProps {
  selectedService: ServiceType;
  onSelect: (service: ServiceType) => void;
  onNext: () => void;
}

export const StepService: React.FC<StepServiceProps> = ({
  selectedService,
  onSelect,
  onNext,
}) => {
  const { serviceMultipliers } = roofingConfig.pricing;

  const services: { id: ServiceType; icon: React.ReactNode; popular?: boolean }[] = [
    {
      id: 'replacement',
      popular: true,
      icon: <Home className="w-8 h-8 text-orange-500" />,
    },
    {
      id: 'repair',
      icon: <Wrench className="w-8 h-8 text-blue-500" />,
    },
    {
      id: 'installation',
      icon: <Building2 className="w-8 h-8 text-emerald-500" />,
    },
  ];

  const handleChoose = (id: ServiceType) => {
    onSelect(id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
          Step 1 of 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          What type of roofing service do you need?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          Select the service that matches your project goals. You can change this at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {services.map(({ id, icon, popular }) => {
          const service = serviceMultipliers[id];
          const isSelected = selectedService === id;

          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => handleChoose(id)}
              whileHover={{ y: -4, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`relative flex flex-col items-start p-5 sm:p-6 rounded-2xl text-left border-2 transition-all cursor-pointer group ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/50 shadow-lg ring-2 ring-orange-400/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {popular && (
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between w-full mb-3">
                <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-white transition-colors border border-slate-200/60">
                  {icon}
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-orange-500 text-white'
                      : 'border-2 border-slate-300 group-hover:border-slate-400'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-5 h-5 fill-orange-500 text-white" />}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                {service.label}
              </h3>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                {service.subtitle}
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {service.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 transition active:scale-95 cursor-pointer"
        >
          Next: Estimate Roof Size →
        </button>
      </div>
    </div>
  );
};
