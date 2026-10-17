import React, { useState } from 'react';
import { roofingConfig } from '../config/roofingConfig';
import { RoofVisualizer3D } from './3d/RoofVisualizer3D';
import { RoofMaterial } from '../types';
import { ShieldCheck, Star, Clock, ArrowDown, Award, Zap, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onStartEstimate: () => void;
  onOpenIntel: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartEstimate, onOpenIntel }) => {
  const { brand } = roofingConfig;
  const [heroMaterial, setHeroMaterial] = useState<RoofMaterial>('metal');

  const materials: { id: RoofMaterial; label: string; icon: string }[] = [
    { id: 'metal', label: 'Standing Seam Metal', icon: '⚡' },
    { id: 'asphalt', label: 'Architectural Shingles', icon: '🧱' },
    { id: 'tile', label: 'Spanish Tile', icon: '🏛️' },
    { id: 'flat_tpo', label: 'Flat / TPO', icon: '🏢' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0A1B2B] via-[#0F2A43] to-slate-900 text-white pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6">
      {/* Subtle luxury ambient glows */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-orange-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-6xl mx-auto flex flex-col items-center">
        {/* Speed & Trust Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/10 border border-orange-400/30 text-orange-300 text-xs sm:text-sm font-semibold mb-6 shadow-inner backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-orange-400 animate-spin-slow" />
          <span>Interactive 3D Architectural Simulator • 100% Free Austin Estimates</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12] max-w-4xl text-center mb-4 sm:mb-6"
        >
          Get Your Roof Estimate in{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 underline decoration-orange-500/40 decoration-wavy decoration-2">
            60 Seconds
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-300 max-w-2xl text-center font-normal leading-relaxed mb-8"
        >
          No waiting, no pushy sales calls. Instant price range for{' '}
          <span className="text-white font-semibold underline decoration-orange-400/60">{brand.city}</span>{' '}
          homeowners.
        </motion.p>

        {/* Primary Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-10"
        >
          <button
            onClick={onStartEstimate}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base sm:text-lg shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer"
          >
            <span>Start Free Estimate</span>
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </button>

          <button
            onClick={onOpenIntel}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm sm:text-base border border-slate-700 backdrop-blur-md transition active:scale-95 cursor-pointer shadow-md"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Austin Market & Hail Intel</span>
          </button>
        </motion.div>

        {/* 3D ARCHITECTURAL HERO SHOWCASE WITH FLOATING ANIMATION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -7, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: 0.35 },
            scale: { duration: 0.8, delay: 0.35 },
            y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="relative w-full max-w-4xl mb-12"
        >
          {/* Subtle floating micro-badge 1: Top Right */}
          <motion.div
            animate={{
              y: [-4, 5, -4],
              x: [-2, 2, -2],
            }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="hidden sm:flex absolute -top-4 -right-2 z-20 items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-orange-300 text-xs font-bold border border-orange-500/40 shadow-xl backdrop-blur-md"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>Class 4 Hail Resistance</span>
          </motion.div>

          {/* Subtle floating micro-badge 2: Bottom Left */}
          <motion.div
            animate={{
              y: [5, -4, 5],
              x: [2, -2, 2],
            }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.6,
            }}
            className="hidden sm:flex absolute -bottom-3 -left-2 z-20 items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-emerald-300 text-xs font-bold border border-emerald-500/40 shadow-xl backdrop-blur-md"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reflects 70% Texas Solar Heat</span>
          </motion.div>

          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-orange-500/30 via-slate-700/30 to-slate-800/60 shadow-2xl backdrop-blur-xl">
            <div className="bg-[#0B1A28]/90 rounded-[22px] p-4 sm:p-6 border border-slate-700/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 3D Architectural Visualizer
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                      Real-time PBR Rendering
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Explore Luxury Materials on Austin Architecture
                  </h3>
                </div>

                {/* Material Switcher Pills */}
                <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700">
                  {materials.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setHeroMaterial(m.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        heroMaterial === m.id
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span className="hidden sm:inline">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Canvas */}
              <RoofVisualizer3D
                material={heroMaterial}
                pitch="medium"
                stories={2}
                extras={['gutters']}
                height="h-72 sm:h-96"
              />
            </div>
          </div>
        </motion.div>

        {/* Trust Badges Bar with Hover Floating Physics */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
          {/* Badge 1: Licensed & Insured */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 backdrop-blur-md shadow-lg hover:border-slate-600 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Licensed & Insured</div>
              <div className="text-xs text-slate-400">{brand.licenseNumber} • $2M Policy</div>
            </div>
          </motion.div>

          {/* Badge 2: Free Inspection */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 backdrop-blur-md shadow-lg hover:border-slate-600 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0 text-orange-400 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Free Inspection</div>
              <div className="text-xs text-slate-400">Drone HD scan & written report</div>
            </div>
          </motion.div>

          {/* Badge 3: 5-Star Reviews */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 backdrop-blur-md shadow-lg hover:border-slate-600 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">5-Star Reviews</div>
              <div className="text-xs text-slate-400">4.9/5 from 340+ local homeowners</div>
            </div>
          </motion.div>
        </div>

        {/* Reassurance footnote */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No spam or robotic dialers
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant price on screen
          </span>
        </div>
      </div>
    </section>
  );
};
