import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CalculatorWizard } from './components/calculator/CalculatorWizard';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { LocalIntelModal } from './components/LocalIntelModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { roofingConfig } from './config/roofingConfig';
import { Phone, Calculator } from 'lucide-react';

export default function App() {
  const [isIntelOpen, setIsIntelOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const search = new URLSearchParams(window.location.search);
    return search.has('admin') || window.location.hash.includes('admin');
  });

  // Keep state synchronized with browser navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const search = new URLSearchParams(window.location.search);
      setIsAdminView(search.has('admin') || window.location.hash.includes('admin'));
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const openAdminView = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('admin', 'true');
    window.history.pushState({}, '', url.toString());
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitAdminView = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    const newUrl =
      url.pathname +
      (url.search ? url.search : '') +
      (url.hash && !url.hash.includes('admin') ? url.hash : '');
    window.history.pushState({}, '', newUrl || '/');
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCalculator = () => {
    const el = document.getElementById('calculator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in hidden admin mode (?admin), render the Executive Leads CRM Dashboard
  if (isAdminView) {
    return <AdminDashboard onExit={exitAdminView} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-orange-500 selection:text-white relative">
      {/* 1. Sticky Top Navigation */}
      <Header
        onStartEstimate={scrollToCalculator}
        onOpenIntel={() => setIsIntelOpen(true)}
      />

      {/* 2. Hero Section */}
      <Hero
        onStartEstimate={scrollToCalculator}
        onOpenIntel={() => setIsIntelOpen(true)}
      />

      {/* 3. Multi-Step Calculator Wizard */}
      <main className="flex-1 pb-24 sm:pb-0">
        <CalculatorWizard onOpenIntel={() => setIsIntelOpen(true)} />

        {/* 4. How It Works (3 Steps) */}
        <HowItWorks onStartEstimate={scrollToCalculator} />

        {/* 5. 3 Testimonial Cards */}
        <Testimonials />

        {/* 6. FAQ Accordion (5 Questions) */}
        <FAQ />
      </main>

      {/* 7. Footer - with generous mobile bottom padding pb-28 sm:pb-14 to ensure nothing is hidden by mobile bar */}
      <Footer
        onStartEstimate={scrollToCalculator}
        onOpenIntel={() => setIsIntelOpen(true)}
        onOpenAdmin={openAdminView}
      />

      {/* 8. Live Google Search Grounding Local Intel Modal */}
      <LocalIntelModal
        isOpen={isIntelOpen}
        onClose={() => setIsIntelOpen(false)}
      />

      {/* 9. Mobile Bottom Quick Action Sticky Bar with Safe Area Support */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-[#0F2A43]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-2 shadow-2xl">
        <a
          href={`tel:${roofingConfig.brand.phoneRaw}`}
          className="flex-1 py-3 px-3 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 min-h-[44px]"
        >
          <Phone className="w-3.5 h-3.5 text-orange-400" />
          <span>Call Now</span>
        </a>
        <button
          type="button"
          onClick={scrollToCalculator}
          className="flex-1 py-3 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 min-h-[44px] cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>60s Estimate</span>
        </button>
      </div>
    </div>
  );
}
