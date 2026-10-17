import React from 'react';
import { Calculator, Camera, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

interface HowItWorksProps {
  onStartEstimate: () => void;
}

// Framer Motion variants for header reveal
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Container variants with staggered children for list items
const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.12,
    },
  },
};

// Gentle slide-up and fade-in for each step card
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 120,
      mass: 0.8,
    },
  },
};

// CTA button reveal variant
const ctaVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartEstimate }) => {
  const steps = [
    {
      step: '01',
      title: 'Calculate Your Price Range',
      description:
        'Select your roof size, preferred materials, and slope to receive an instant, accurate cost range in 60 seconds with no sales calls.',
      icon: <Calculator className="w-6 h-6 text-orange-500" />,
      tag: 'Instant & Private',
      highlightColor: 'from-orange-500/10 to-amber-500/5',
      badgeColor: 'text-orange-600 bg-orange-100/80 border-orange-200',
    },
    {
      step: '02',
      title: 'Free 4K Drone & Physical Inspection',
      description:
        'Our licensed master technician conducts a full aerial drone inspection and attic decking walk to identify hidden leak paths or storm damage.',
      icon: <Camera className="w-6 h-6 text-blue-500" />,
      tag: 'Austin Licensed Crew',
      highlightColor: 'from-blue-500/10 to-indigo-500/5',
      badgeColor: 'text-blue-600 bg-blue-100/80 border-blue-200',
    },
    {
      step: '03',
      title: 'Guaranteed Written Quote & Install',
      description:
        'Receive an exact, transparent quote good for 30 days. When you approve, our local Austin crew completes most roofs in just 1 to 2 days.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      tag: '30-Day Price Lock',
      highlightColor: 'from-emerald-500/10 to-teal-500/5',
      badgeColor: 'text-emerald-600 bg-emerald-100/80 border-emerald-200',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header with dynamic whileInView and initial variants */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/90 border border-orange-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Transparent Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
            How It Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Getting a new roof shouldn't be stressful or secretive. Here is our straightforward 3-step path from instant estimate to flawless installation.
          </p>
        </motion.div>

        {/* Steps Grid with Staggered List Items on Scroll */}
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative"
        >
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              variants={cardVariants}
              whileHover={{
                y: -6,
                transition: { duration: 0.25, ease: 'easeOut' },
              }}
              className="relative p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              {/* Subtle gradient hover highlight */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.highlightColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3.5 rounded-2xl bg-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-slate-200/70">
                    {item.icon}
                  </div>
                  <span className="text-4xl font-black text-slate-200/80 group-hover:text-orange-200/90 transition-colors font-mono">
                    {item.step}
                  </span>
                </div>

                <div className="mb-2.5">
                  <span
                    className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${item.badgeColor} mb-2`}
                  >
                    {item.tag}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  {item.description}
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5 text-orange-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Phase {index + 1} of 3</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1.5 transition-all" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button with Framer Motion reveal */}
        <motion.div
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-12 sm:mt-14 text-center"
        >
          <button
            type="button"
            onClick={onStartEstimate}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-slate-900/15 hover:shadow-xl transition-all active:scale-95 cursor-pointer group"
          >
            <span>Ready? Build Your Estimate Now</span>
            <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
