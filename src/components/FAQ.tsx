import React, { useState } from 'react';
import { roofingConfig } from '../config/roofingConfig';
import {
  ChevronDown,
  HelpCircle,
  Phone,
  Sparkles,
  CheckCircle2,
  Search,
  MessageCircleQuestion,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// Detect mobile once at module level — avoids per-render checks
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// Header — fast on mobile, graceful on desktop
const headerVariants: Variants = {
  hidden: { opacity: 0, y: isMobile ? 14 : 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: isMobile ? 0.3 : 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Category filter pills
const filterVariants: Variants = {
  hidden: { opacity: 0, y: isMobile ? 8 : 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: isMobile ? 0.22 : 0.45,
      delay: isMobile ? 0.05 : 0.1,
      ease: 'easeOut',
    },
  },
};

// Container — tighter stagger on mobile so all cards appear quickly
const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isMobile ? 0.04 : 0.07,
      delayChildren: isMobile ? 0.02 : 0.04,
    },
  },
};

// Each FAQ card — snappy spring on mobile, smooth on desktop
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: isMobile ? 14 : 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: isMobile
      ? { duration: 0.2, ease: 'easeOut' }       // plain tween — GPU-light, instant feel
      : { type: 'spring', damping: 26, stiffness: 200 }, // rich spring on desktop
  },
};

// Bottom CTA banner
const bannerVariants: Variants = {
  hidden: { opacity: 0, y: isMobile ? 16 : 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: isMobile ? 0.28 : 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Accordion open/close — fast height expansion, opacity fades in clean
const accordionOpen = {
  height: 'auto' as const,
  opacity: 1,
  transition: {
    height: {
      duration: isMobile ? 0.2 : 0.3,
      ease: [0.04, 0.62, 0.23, 0.98],
    },
    opacity: {
      duration: isMobile ? 0.15 : 0.22,
      delay: isMobile ? 0.04 : 0.08,
    },
  },
};

const accordionClose = {
  height: 0,
  opacity: 0,
  transition: {
    height: {
      duration: isMobile ? 0.16 : 0.22,
      ease: [0.04, 0.62, 0.23, 0.98],
    },
    opacity: { duration: isMobile ? 0.1 : 0.14 },
  },
};

// Chevron rotation — crisp on mobile
const chevronTransition = isMobile
  ? { duration: 0.18, ease: 'easeOut' }
  : { type: 'spring' as const, stiffness: 380, damping: 28 };

export const FAQ: React.FC = () => {
  const { faqs, brand } = roofingConfig;
  const [openIndex, setOpenIndex] = useState<number | null>(0); // first item open by default
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'Pricing & Estimates', label: 'Pricing & Estimates' },
    { id: 'Inspection & Process', label: 'Drone Inspections' },
    { id: 'Storm & Hail Damage', label: 'Hail & Insurance' },
    { id: 'Warranty & Materials', label: 'Materials & Warranty' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200 px-4 sm:px-6 overflow-hidden">
      {/* Ambient glows — hidden on mobile to save GPU */}
      <div className="hidden sm:block absolute top-1/4 -left-40 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">

        {/* Section Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-spin-slow" />
            <span>Answers &amp; Homeowner Clarity</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Everything you need to know about our instant estimates, Austin drone inspections, and lifetime warranty coverage.
          </p>

          {/* Quick Search */}
          <div className="mt-6 relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search questions (e.g. hail, insurance, financing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 shadow-sm transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div
          variants={filterVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-md shadow-orange-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeFaqTab"
                    className="absolute inset-0 bg-orange-500 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Accordion List */}
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          key={activeCategory + searchQuery}
          className="space-y-3"
        >
          {filteredFaqs.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12 px-6 rounded-3xl bg-white border border-slate-200 text-slate-500"
            >
              <MessageCircleQuestion className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No questions match "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for keywords like "estimate", "inspection", or "insurance"
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;

              return (
                <motion.div
                  key={faq.question}
                  variants={itemVariants}
                  className={`rounded-2xl bg-white border transition-colors duration-200 overflow-hidden shadow-sm ${
                    isOpen
                      ? 'border-orange-400/80 shadow-lg shadow-orange-500/5 ring-1 ring-orange-400/20'
                      : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-200 ${
                          isOpen
                            ? 'bg-orange-500 ring-4 ring-orange-200 scale-110'
                            : 'bg-slate-300 group-hover:bg-orange-400'
                        }`}
                      />
                      <span
                        className={`font-bold text-base sm:text-lg transition-colors ${
                          isOpen ? 'text-slate-950 font-extrabold' : 'text-slate-800 group-hover:text-slate-900'
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={chevronTransition}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={accordionOpen}
                        exit={accordionClose}
                        className="overflow-hidden"
                        style={{ willChange: 'height, opacity' }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100/90">
                          <p className="pt-2 text-slate-700 sm:text-base font-normal">{faq.answer}</p>
                          {faq.category && (
                            <div className="mt-3.5 flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                                Category: {faq.category}
                              </span>
                              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-medium flex items-center gap-1 border border-emerald-200/60">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Summit Guaranteed
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Bottom CTA Banner */}
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B1E30] via-[#0F2A43] to-[#0A1A2A] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border border-slate-700/80 relative overflow-hidden"
        >
          {/* Warm glow — desktop only */}
          <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0 text-orange-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-white">Have a unique roof architecture or emergency leak?</h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Our Austin master technicians are on call 7 days a week to inspect storm damage or answer engineering questions.
              </p>
            </div>
          </div>

          <a
            href={`tel:${brand.phoneRaw}`}
            className="relative z-10 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95 shrink-0 w-full sm:w-auto"
          >
            <Phone className="w-4 h-4 text-white" />
            <span>Speak with Inspector: {brand.phone}</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
};
