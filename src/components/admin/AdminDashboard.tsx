import React, { useState, useEffect, useMemo } from 'react';
import { StoredLead, LeadStatus } from '../../types';
import {
  getStoredLeads,
  updateLeadStatus,
  deleteLead,
  resetDemoLeads,
  generateTestLead,
  exportLeadsAsCSV,
} from '../../utils/leadStorage';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
  SUPABASE_SQL_SCHEMA,
  DEFAULT_SUPABASE_TABLE,
} from '../../utils/supabaseClient';
import { formatCurrency } from '../../utils/pricingEngine';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  X,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  DollarSign,
  Building,
  CheckSquare,
} from 'lucide-react';

interface AdminDashboardProps {
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const [leads, setLeads] = useState<StoredLead[]>(() => getStoredLeads());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<StoredLead | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase Modal Form State
  const [supabaseConfig, setSupabaseConfigState] = useState(() => getStoredSupabaseConfig());
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Reactive listener for updates to localStorage
  useEffect(() => {
    const handleUpdate = () => {
      setLeads(getStoredLeads());
    };

    window.addEventListener('summit_leads_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('summit_leads_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalCount = leads.length;
    const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimate?.estimatedHigh || 0), 0);
    const avgRoofSize = totalCount > 0
      ? Math.round(leads.reduce((sum, l) => sum + (l.estimate?.squareFeet || 0), 0) / totalCount)
      : 0;
    const scheduledCount = leads.filter((l) => l.status === 'scheduled').length;
    const newCount = leads.filter((l) => l.status === 'new').length;

    return {
      totalCount,
      totalPipelineValue,
      avgRoofSize,
      scheduledCount,
      newCount,
    };
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesStatus;

      const matchesQuery =
        lead.name.toLowerCase().includes(query) ||
        lead.phone.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.address.toLowerCase().includes(query) ||
        lead.estimate?.material.toLowerCase().includes(query) ||
        lead.id.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [leads, selectedStatus, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    await updateLeadStatus(id, newStatus);
    setLeads(getStoredLeads());
    showToast(`Lead status updated to ${newStatus.toUpperCase()}`);
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Delete this lead from the pipeline?')) {
      deleteLead(id);
      setLeads(getStoredLeads());
      if (selectedLead?.id === id) setSelectedLead(null);
      showToast('Lead deleted.');
    }
  };

  const handleAddTestLead = () => {
    const testLead = generateTestLead();
    setLeads(getStoredLeads());
    showToast(`Added test lead: ${testLead.name} ($${formatCurrency(testLead.estimate.estimatedHigh)})`);
  };

  const handleResetData = () => {
    if (confirm('Reset to initial realistic demo leads?')) {
      const reset = resetDemoLeads();
      setLeads(reset);
      showToast('Demo pipeline restored to initial sample data.');
    }
  };

  const handleExportCSV = () => {
    exportLeadsAsCSV(leads);
    showToast('Downloaded leads CSV file.');
  };

  const handleSaveSupabaseSettings = () => {
    saveSupabaseConfig(supabaseConfig);
    showToast('Supabase settings saved.');
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const result = await testSupabaseConnection(
        supabaseConfig.url,
        supabaseConfig.anonKey,
        supabaseConfig.tableName || DEFAULT_SUPABASE_TABLE
      );
      setSupabaseTestResult(result);
      if (result.success) {
        saveSupabaseConfig(supabaseConfig);
      }
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    showToast('Supabase SQL Schema copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            New Request
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Calendar className="w-3 h-3" />
            Inspection Scheduled
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Phone className="w-3 h-3" />
            Contacted
          </span>
        );
      case 'quoted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <DollarSign className="w-3 h-3" />
            Formal Quote
          </span>
        );
      case 'closed_won':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            Contract Signed
          </span>
        );
      case 'closed_lost':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Archived
          </span>
        );
    }
  };

  const getMaterialLabel = (mat: string) => {
    switch (mat) {
      case 'metal':
        return { label: 'Standing Seam Metal', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'tile':
        return { label: 'Concrete / Clay Tile', color: 'bg-amber-600/20 text-amber-300 border-amber-600/30' };
      case 'flat_tpo':
        return { label: 'Flat Commercial TPO', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      default:
        return { label: 'Architectural Shingles', color: 'bg-slate-700 text-slate-200 border-slate-600' };
    }
  };

  const formatLeadTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 60) return `${Math.max(1, diffMinutes)}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const supabaseActive = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[#07131F] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-orange-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-orange-400/40 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0A1B2A]/90 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Exit Admin View and return to the customer website"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
            <span>Customer Website</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20">
              SR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Summit Roofing Pipeline CRM
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Hidden Admin View
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Prospect & Contractor Demonstration Portal • Austin Metro Area
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Supabase Status Pill */}
          <button
            type="button"
            onClick={() => setShowSupabaseModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              supabaseActive
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/60'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${supabaseActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>
              {supabaseActive ? 'Supabase: Active' : 'Supabase: Wire Database'}
            </span>
            {supabaseActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />}
          </button>

          {/* Quick Demo Lead */}
          <button
            type="button"
            onClick={handleAddTestLead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Test Lead</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Download CSV export"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 flex-1">
        {/* Banner Explaining Local Storage + Supabase Demo Mode */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800/80 to-[#0A1B2A] border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Prospect Demo Mode Ready
              </span>
              <span className="text-xs text-slate-400">• Persisted in Browser Local Storage & Wired for Supabase</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              When prospects or homeowners submit inquiries or request free inspections from the 60-second calculator,
              their inquiries are instantly recorded here in real-time. You can show this live CRM pipeline to prospective
              clients, change statuses, or connect your Supabase database.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetData}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Reset Sample Leads</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSupabaseModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition cursor-pointer font-semibold"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Supabase SQL & Setup</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Total Lead Inquiries</span>
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalCount}</div>
            <div className="text-[11px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
              <span>{stats.newCount} new pending contact</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Estimated Pipeline</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              ${stats.totalPipelineValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Based on high quote bounds</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Average Roof Size</span>
              <Building className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats.avgRoofSize.toLocaleString()} <span className="text-sm font-normal text-slate-400">sq ft</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ≈ {(stats.avgRoofSize / 100).toFixed(1)} roofing squares
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Inspections Booked</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300">{stats.scheduledCount}</div>
            <div className="text-[11px] text-purple-400/80 mt-1">Ready for on-site visit</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads by homeowner name, phone, address, or material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Leads' },
                { id: 'new', label: 'New' },
                { id: 'scheduled', label: 'Scheduled' },
                { id: 'contacted', label: 'Contacted' },
                { id: 'quoted', label: 'Quoted' },
                { id: 'closed_won', label: 'Closed' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                    selectedStatus === tab.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leads Table / Cards List */}
        <div className="space-y-3">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No leads match your filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing search terms, or click "+ Test Lead" above to simulate an instant customer submission.
              </p>
              <button
                type="button"
                onClick={handleAddTestLead}
                className="mt-2 text-xs px-4 py-2 rounded-xl bg-orange-500 text-white font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Generate Sample Lead
              </button>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const mat = getMaterialLabel(lead.estimate?.material || 'asphalt');
              return (
                <div
                  key={lead.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
                >
                  {/* Left Column: Customer & Status */}
                  <div className="space-y-2 flex-1 min-w-[280px]">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(lead.status)}
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">{lead.id}</span>
                      <span className="text-xs text-slate-500">• {formatLeadTime(lead.createdAt)}</span>
                      {lead.syncedToSupabase && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded"
                          title="Synced to Supabase Database"
                        >
                          <Check className="w-2.5 h-2.5" />
                          Supabase Synced
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <span>{lead.name}</span>
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                        <a
                          href={`tel:${lead.phone.replace(/\D/g, '')}`}
                          className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{lead.phone}</span>
                        </a>

                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 text-slate-300 hover:text-white"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.email}</span>
                        </a>

                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(lead.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[240px]">{lead.address}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 line-clamp-2">
                        <span className="font-semibold text-slate-300">Note: </span>
                        {lead.notes}
                      </p>
                    )}
                  </div>

                  {/* Middle Column: Estimate Specifications */}
                  <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Material</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${mat.color}`}>
                        {mat.label}
                      </span>
                    </div>

                    <div className="h-6 w-px bg-slate-800" />

                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Roof Size</span>
                      <span className="font-bold text-slate-200">
                        {lead.estimate?.squareFeet?.toLocaleString() || 2000} sq ft
                      </span>
                    </div>

                    <div className="h-6 w-px bg-slate-800" />

                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Service</span>
                      <span className="capitalize font-semibold text-slate-300">
                        {lead.estimate?.service || 'Replacement'}
                      </span>
                    </div>

                    <div className="h-6 w-px bg-slate-800" />

                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Window</span>
                      <span className="font-medium text-slate-300 truncate max-w-[120px] block">
                        {lead.preferredTime?.split('(')[0] || 'Flexible'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Price Quote & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        Estimated Range
                      </span>
                      <div className="text-lg sm:text-xl font-extrabold text-orange-400">
                        ${lead.estimate?.estimatedLow?.toLocaleString()} - ${lead.estimate?.estimatedHigh?.toLocaleString()}
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <select
                        aria-label="Update Lead Status"
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="new">New Request</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="closed_won">Contract Signed</option>
                        <option value="closed_lost">Archived</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setSelectedLead(lead)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                        title="View Full Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* LEAD DETAIL MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedLead.status)}
                <span className="text-xs font-mono text-slate-400">{selectedLead.id}</span>
              </div>
              <h2 className="text-2xl font-black text-white">{selectedLead.name}</h2>
              <p className="text-xs text-slate-400">
                Submitted on {new Date(selectedLead.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Phone Number</span>
                <p className="text-sm font-bold text-orange-400">
                  <a href={`tel:${selectedLead.phone.replace(/\D/g, '')}`}>{selectedLead.phone}</a>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Email</span>
                <p className="text-sm font-bold text-slate-200">
                  <a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a>
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Property Address</span>
                <p className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>{selectedLead.address}</span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedLead.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline ml-1"
                  >
                    (View Map)
                  </a>
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Preferred Inspection Slot</span>
                <p className="text-sm font-medium text-slate-300">{selectedLead.preferredTime}</p>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Roof Scope & Estimate Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Service</span>
                  <span className="font-bold text-slate-200 capitalize">{selectedLead.estimate?.service}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Material</span>
                  <span className="font-bold text-slate-200 capitalize">{selectedLead.estimate?.material}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Calculated Area</span>
                  <span className="font-bold text-slate-200">{selectedLead.estimate?.squareFeet?.toLocaleString()} sq ft</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Stories / Pitch</span>
                  <span className="font-bold text-slate-200">{selectedLead.estimate?.stories || 1} Story • {selectedLead.estimate?.pitch}</span>
                </div>
              </div>

              {selectedLead.estimate?.extras && selectedLead.estimate.extras.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-1">Requested Add-ons:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.estimate.extras.map((extra) => (
                      <span key={extra} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {extra.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="font-bold text-slate-300 text-xs">Estimated Price Range:</span>
                <span className="text-lg font-black text-orange-400">
                  ${selectedLead.estimate?.estimatedLow?.toLocaleString()} - ${selectedLead.estimate?.estimatedHigh?.toLocaleString()}
                </span>
              </div>
            </div>

            {selectedLead.notes && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Homeowner Notes</span>
                <p className="text-slate-300 leading-relaxed">{selectedLead.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={`tel:${selectedLead.phone.replace(/\D/g, '')}`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Homeowner Now</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPABASE CONFIGURATION & SQL SETUP MODAL */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1B2A] border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowSupabaseModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Supabase Live Sync Integration</span>
              </div>
              <h2 className="text-2xl font-black text-white">Wire Leads Directly to Supabase</h2>
              <p className="text-xs text-slate-300">
                Connect your Supabase project so leads submitted by customers on the estimator automatically sync to your
                relational PostgreSQL database table.
              </p>
            </div>

            {/* Supabase Connection Form */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center justify-between">
                <span>Supabase Project Credentials</span>
                {isSupabaseConfigured() && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Configured
                  </span>
                )}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Supabase URL (e.g. https://xyzcompany.supabase.co)
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseConfigState((prev) => ({ ...prev, url: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Supabase Anon Public Key (Safe for client browsers)
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseConfig.anonKey}
                    onChange={(e) => setSupabaseConfigState((prev) => ({ ...prev, anonKey: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Table Name</label>
                    <input
                      type="text"
                      value={supabaseConfig.tableName}
                      onChange={(e) => setSupabaseConfigState((prev) => ({ ...prev, tableName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="autoSync"
                      checked={supabaseConfig.autoSync}
                      onChange={(e) => setSupabaseConfigState((prev) => ({ ...prev, autoSync: e.target.checked }))}
                      className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="autoSync" className="text-slate-300 font-medium cursor-pointer">
                      Auto-sync submitted leads in background
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Supabase */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTestingSupabase}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isTestingSupabase ? 'Testing Connection...' : 'Test & Verify Supabase'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSupabaseSettings}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
                >
                  Save Credentials
                </button>
              </div>

              {/* Test Connection Output */}
              {supabaseTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    supabaseTestResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {supabaseTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">
                      {supabaseTestResult.success ? 'Connected Successfully!' : 'Connection Note:'}
                    </span>
                    <p className="mt-0.5 leading-relaxed">{supabaseTestResult.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 1-Click Copy SQL Schema for Supabase */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Supabase Table Schema (SQL)</h4>
                  <p className="text-slate-400 text-[11px]">
                    Run this once in your Supabase project (Dashboard → SQL Editor) to create the table and security rules.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed scrollbar-none">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSupabaseModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
