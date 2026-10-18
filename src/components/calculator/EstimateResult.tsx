import React, { useState, useEffect } from 'react';
import { EstimateInput, PriceBreakdown, LeadFormData } from '../../types';
import { roofingConfig } from '../../config/roofingConfig';
import { formatCurrency } from '../../utils/pricingEngine';
import { saveLead } from '../../utils/leadStorage';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  BadgeCheck,
  Check,
  Zap,
  Building,
  Award,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { RoofVisualizer3D } from '../3d/RoofVisualizer3D';
import { motion, AnimatePresence } from 'motion/react';

interface EstimateResultProps {
  input: EstimateInput;
  breakdown: PriceBreakdown;
  onEdit: () => void;
  onOpenIntel: () => void;
}

export const EstimateResult: React.FC<EstimateResultProps> = ({
  input,
  breakdown,
  onEdit,
  onOpenIntel,
}) => {
  const { brand, pricing } = roofingConfig;

  // Animated Count-Up Numbers
  const [animatedLow, setAnimatedLow] = useState(0);
  const [animatedHigh, setAnimatedHigh] = useState(0);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1400; // 1.4s smooth count-up

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedLow(Math.floor(easeProgress * breakdown.estimatedLow));
      setAnimatedHigh(Math.floor(easeProgress * breakdown.estimatedHigh));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [breakdown.estimatedLow, breakdown.estimatedHigh]);

  // Lead Form State
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    preferredTime: 'Morning (8:00 AM - 12:00 PM)',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof LeadFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required for inspection scheduling.';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit phone number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required for estimate delivery.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format.';
    }

    if (!formData.address.trim()) {
      errors.address = 'Property address is required for satellite measurement.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) setSubmitError(null);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // 1. Immediately record lead in Local Storage and initiate Supabase background sync
    let savedLeadRecord: any = null;
    try {
      savedLeadRecord = await saveLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        preferredTime: formData.preferredTime,
        notes: formData.notes?.trim() || '',
        estimate: {
          service: input.service,
          material: input.material,
          squareFeet: input.squareFeet,
          stories: input.stories,
          pitch: input.pitch,
          extras: input.extras,
          estimatedLow: breakdown.estimatedLow,
          estimatedHigh: breakdown.estimatedHigh,
          estimatedMedian: breakdown.estimatedMedian,
          subtotal: breakdown.subtotal,
        },
      });
    } catch (storageErr) {
      console.warn('Could not save to localStorage:', storageErr);
    }

    // 2. Dispatch to backend API / Webhook
    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: formData,
          estimate: {
            input,
            breakdown,
            date: new Date().toISOString(),
            city: brand.city,
            companyName: brand.companyName,
          },
          leadId: savedLeadRecord?.id,
          webhookUrl: brand.webhookUrl,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setBookingDetails({
          ...data,
          leadId: data.leadId || savedLeadRecord?.id,
        });
      } else if (savedLeadRecord) {
        // Fallback: If network webhook had an error but lead was saved locally
        setSubmitSuccess(true);
        setBookingDetails({
          success: true,
          leadId: savedLeadRecord.id,
          message: 'Inspection booked successfully! Recorded in local contractor queue.',
          details: {
            customerName: formData.name,
            contactMethod: formData.phone,
            preferredTime: formData.preferredTime,
          },
        });
      } else {
        throw new Error(data.error || 'Failed to submit inspection request.');
      }
    } catch (err: any) {
      console.error('Lead booking notice:', err);
      if (savedLeadRecord) {
        // Lead safely stored locally in offline/demo mode
        setSubmitSuccess(true);
        setBookingDetails({
          success: true,
          leadId: savedLeadRecord.id,
          message: 'Inspection request saved successfully! A roofing specialist will contact you shortly.',
          details: {
            customerName: formData.name,
            contactMethod: formData.phone,
            preferredTime: formData.preferredTime,
          },
        });
      } else {
        setSubmitError(
          err.message ||
            'Connection interrupted. We could not submit your request automatically. Please try again or tap Call Now.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN WITH CELEBRATORY ANIMATIONS
  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xl text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden"
      >
        {/* Celebration Confetti Sparkles Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: '50%',
                y: '20%',
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x: `${15 + Math.random() * 70}%`,
                y: `${5 + Math.random() * 85}%`,
                opacity: [0, 1, 0.8, 0],
                scale: [0, 1.2, 0.8],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2.2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeOut',
              }}
              className="absolute w-2.5 h-2.5 rounded-sm"
              style={{
                backgroundColor: ['#f97316', '#eab308', '#10b981', '#3b82f6', '#ec4899'][i % 5],
              }}
            />
          ))}
        </div>

        {/* Animated Checkmark Badge with Concentric Pulsing Rings */}
        <div className="relative w-20 h-20 mx-auto">
          <motion.div
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-emerald-400 blur-sm"
          />
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30"
          >
            <Check className="w-10 h-10 stroke-[3]" />
          </motion.div>
        </div>

        {/* Headline */}
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300/80 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
            Booking Confirmed • Inspection ID: {bookingDetails?.leadId || 'SR-892'}
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            You're All Set, {formData.name.split(' ')[0]}!
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Your instant estimate of{' '}
            <strong className="text-slate-900 font-extrabold text-orange-600">
              {formatCurrency(breakdown.estimatedLow)} – {formatCurrency(breakdown.estimatedHigh)}
            </strong>{' '}
            is locked in for 30 days.
          </p>
        </div>

        {/* Official Ticket Voucher Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0F2A43] to-slate-950 text-white text-left relative overflow-hidden shadow-2xl border border-slate-700"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Official Austin Inspection Pass
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-lg border border-orange-500/30">
              STATUS: RESERVED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4 text-xs">
            <div>
              <span className="text-slate-400 block">Homeowner:</span>
              <strong className="text-white text-sm">{formData.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Phone Contact:</span>
              <strong className="text-white text-sm">{formData.phone}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Property Address:</span>
              <strong className="text-white text-sm truncate block">{formData.address}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Preferred Window:</span>
              <strong className="text-orange-400 text-sm">{formData.preferredTime}</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Includes 4K Drone Roof Scan</span>
            <span>$0.00 Due Today</span>
          </div>
        </motion.div>

        {/* Staggered Animated Next Steps Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" /> What happens next:
          </h3>

          <div className="space-y-3">
            {[
              {
                num: '1',
                title: 'Phone Call Confirmation',
                desc: `Our senior estimator will call you at ${formData.phone} during your requested window (${formData.preferredTime}) to confirm appointment details.`,
              },
              {
                num: '2',
                title: 'High-Resolution 4K Drone Scan',
                desc: 'We inspect decking, flashing, shingles, vents, and hail impacts with precision aerial photography.',
              },
              {
                num: '3',
                title: 'Guaranteed Line-Item Quote',
                desc: 'You receive a complete written quote valid for 30 days. No hidden surcharges, no aggressive sales push.',
              },
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.12 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm"
              >
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                  {step.num}
                </span>
                <div className="text-xs sm:text-sm text-slate-700 leading-snug">
                  <strong className="text-slate-900 block font-semibold">{step.title}</strong>
                  <span className="text-slate-600 mt-0.5 block">{step.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`tel:${brand.phoneRaw}`}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Phone className="w-4 h-4 text-white" />
            <span>Call {brand.phone} for Priority Dispatch</span>
          </a>
          <button
            type="button"
            onClick={onEdit}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            Calculate Another Roof
          </button>
        </div>
      </motion.div>
    );
  }

  // MAIN RESULT SCREEN WITH RICH MOTION AND LUXURY FINISH
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Top Header Badge & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm border border-emerald-300/80"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Estimate Computed</span>
          </motion.div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Your Estimated Roof Investment
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Calibrated for {input.squareFeet.toLocaleString()} sq ft • {pricing.materialPerSqFt[input.material]?.name} • {brand.city}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
          <span>Edit Selections</span>
        </button>
      </div>

      {/* 3D Configured Architecture Showcase */}
      <div
        className="rounded-3xl bg-[#091522] border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden relative"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Your Configured 3D Architecture
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 hidden xs:inline">
            {input.stories} Story • {input.pitch} Pitch • {pricing.materialPerSqFt[input.material]?.name}
          </span>
        </div>
        <RoofVisualizer3D
          material={input.material}
          pitch={input.pitch}
          stories={input.stories}
          extras={input.extras}
          height="h-64 sm:h-80"
        />
      </div>

      {/* Main Big Price Hero Box with Ambient Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B1E30] via-[#0F2A43] to-slate-950 text-white shadow-2xl border border-slate-700/80 relative overflow-hidden"
      >
        {/* Animated Ambient Glow */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-[90px] pointer-events-none"
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold uppercase tracking-wider mb-2 border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Estimated Price Range (-12% to +15%)</span>
            </div>

            {/* Big Animated Price Range with Visual Scale Pop */}
            <div className="flex items-baseline flex-wrap gap-2 sm:gap-4 mt-2">
              <span className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
                {formatCurrency(animatedLow)}
              </span>
              <span className="text-2xl sm:text-4xl font-light text-slate-400">
                –
              </span>
              <span className="text-3xl sm:text-5xl md:text-6xl font-black text-orange-400 tracking-tight">
                {formatCurrency(animatedHigh)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-amber-300/90 font-medium mt-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Final quote guaranteed after physical inspection. Valid for 30 days.</span>
            </p>
          </div>

          {/* Quick Metrics Badges Grid */}
          <div className="bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-700/80 md:w-72 space-y-2.5 shadow-lg">
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider pb-1 border-b border-slate-800">
              Configured Specs
            </div>
            <div className="text-xs sm:text-sm text-slate-200 flex justify-between items-center">
              <span className="text-slate-400">Service:</span>
              <strong className="text-white capitalize px-2 py-0.5 rounded bg-slate-800">{input.service}</strong>
            </div>
            <div className="text-xs sm:text-sm text-slate-200 flex justify-between items-center">
              <span className="text-slate-400">Stories:</span>
              <strong className="text-white px-2 py-0.5 rounded bg-slate-800">{input.stories} {input.stories === 1 ? 'Story' : 'Stories'}</strong>
            </div>
            <div className="text-xs sm:text-sm text-slate-200 flex justify-between items-center">
              <span className="text-slate-400">Pitch:</span>
              <strong className="text-white capitalize px-2 py-0.5 rounded bg-slate-800">{input.pitch}</strong>
            </div>
            <div className="text-xs sm:text-sm text-slate-200 flex justify-between items-center">
              <span className="text-slate-400">Add-ons:</span>
              <strong className="text-orange-400 px-2 py-0.5 rounded bg-orange-950/60 border border-orange-500/30">
                {input.extras.length} Selected
              </strong>
            </div>
          </div>
        </div>

        {/* Toggle Detailed Breakdown Button */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-orange-300 hover:text-orange-200 transition cursor-pointer"
          >
            <span>{showDetailedBreakdown ? 'Hide Itemized Breakdown' : 'View Itemized Cost Breakdown'}</span>
            <motion.div
              animate={{ rotate: showDetailedBreakdown ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <button
            type="button"
            onClick={onOpenIntel}
            className="text-xs text-slate-300 hover:text-white underline decoration-slate-500 cursor-pointer flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Austin Market & Hail Intel</span>
          </button>
        </div>

        {/* Collapsible Itemized Breakdown with AnimatePresence */}
        <AnimatePresence>
          {showDetailedBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm space-y-2.5">
                <div className="flex justify-between text-slate-300 pb-2 border-b border-slate-800">
                  <span>Base Materials ({pricing.materialPerSqFt[input.material]?.name} @ ${breakdown.materialCostPerSqFt}/sq ft):</span>
                  <span className="font-semibold text-white">{formatCurrency(breakdown.baseMaterialCost)}</span>
                </div>
                <div className="flex justify-between text-slate-300 pb-2 border-b border-slate-800">
                  <span>Service Multiplier ({pricing.serviceMultipliers[input.service]?.label}):</span>
                  <span className="font-semibold text-white">x{breakdown.serviceMultiplier}</span>
                </div>
                <div className="flex justify-between text-slate-300 pb-2 border-b border-slate-800">
                  <span>Complexity Multiplier ({input.stories} Story, {input.pitch} Pitch):</span>
                  <span className="font-semibold text-white">x{(breakdown.storiesMultiplier * breakdown.pitchMultiplier).toFixed(2)}</span>
                </div>

                {breakdown.extrasItemized.length > 0 && (
                  <div className="py-1">
                    <span className="font-bold text-orange-300 block mb-1">Selected Extras & Add-ons:</span>
                    {breakdown.extrasItemized.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300 pl-2 py-0.5">
                        <span>• {item.label}</span>
                        <span className="font-semibold text-white">+{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-2.5 border-t border-slate-700 font-bold text-white text-sm">
                  <span>Baseline Subtotal:</span>
                  <span className="text-orange-400 font-extrabold">{formatCurrency(breakdown.subtotal)}</span>
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  Range accommodates custom flashing, ventilation upgrades, and structural decking identified during inspection.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* LEAD BOOKING FORM SECTION WITH MOTION POLISH */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xl space-y-6"
      >
        <div className="text-left">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-orange-600" />
            <span>Lock In Your Price Today</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Book Your Free Austin Roof Inspection
          </h3>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5 leading-relaxed">
            Lock in this estimated price range. We'll send an Austin master inspector to conduct an aerial drone scan and provide a guaranteed line-item quote.
          </p>
        </div>

        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold">Notice:</strong> {submitError}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmitLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 min-h-[46px] rounded-xl border text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition shadow-sm ${
                    formErrors.name
                      ? 'border-red-400 ring-2 ring-red-200 bg-red-50/30'
                      : 'border-slate-300 focus:ring-orange-400 focus:border-orange-500 hover:border-slate-400'
                  }`}
                />
              </div>
              {formErrors.name && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="(512) 555-0199"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 min-h-[46px] rounded-xl border text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition shadow-sm ${
                    formErrors.phone
                      ? 'border-red-400 ring-2 ring-red-200 bg-red-50/30'
                      : 'border-slate-300 focus:ring-orange-400 focus:border-orange-500 hover:border-slate-400'
                  }`}
                />
              </div>
              {formErrors.phone && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.phone}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 min-h-[46px] rounded-xl border text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition shadow-sm ${
                    formErrors.email
                      ? 'border-red-400 ring-2 ring-red-200 bg-red-50/30'
                      : 'border-slate-300 focus:ring-orange-400 focus:border-orange-500 hover:border-slate-400'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.email}</p>
              )}
            </div>

            {/* Property Address */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Property Street Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 1402 Barton Springs Rd, Austin, TX"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 min-h-[46px] rounded-xl border text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition shadow-sm ${
                    formErrors.address
                      ? 'border-red-400 ring-2 ring-red-200 bg-red-50/30'
                      : 'border-slate-300 focus:ring-orange-400 focus:border-orange-500 hover:border-slate-400'
                  }`}
                />
              </div>
              {formErrors.address && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.address}</p>
              )}
            </div>
          </div>

          {/* Preferred Contact Time */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Preferred Inspection Window
            </label>
            <select
              value={formData.preferredTime}
              onChange={(e) => handleInputChange('preferredTime', e.target.value)}
              className="w-full px-4 py-3 min-h-[46px] rounded-xl border border-slate-300 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 bg-white shadow-sm"
            >
              <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
              <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
              <option value="Late Afternoon (4:00 PM - 7:00 PM)">Late Afternoon (4:00 PM - 7:00 PM)</option>
              <option value="Weekend (Saturday Morning)">Weekend (Saturday Morning)</option>
            </select>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Project Notes / Leak Location / Storm Info (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Hail storm last month, small water mark in master bedroom ceiling..."
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 shadow-sm"
            />
          </div>

          {/* Submit CTA with Interactive Motion Sweep */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base sm:text-lg shadow-xl shadow-orange-500/30 transition-all disabled:opacity-75 disabled:pointer-events-none cursor-pointer relative overflow-hidden group"
          >
            {/* Glossy sweep shine */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />

            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Reserving Free Inspection...</span>
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                <span>Book My Free Inspection</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>

          {/* Trust Guarantees */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Free & No Obligation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Never sold to 3rd party brokers
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-600" /> Official {brand.city} Licensed Crew
            </span>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
