import { StoredLead, LeadStatus } from '../types';
import { syncLeadToSupabase, isSupabaseConfigured } from './supabaseClient';

export const LEADS_STORAGE_KEY = 'summit_roofing_leads_v1';

export const INITIAL_DEMO_LEADS: StoredLead[] = [
  {
    id: 'SR-TX-L9K2P4',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    name: 'Marcus & Sarah Vance',
    phone: '(512) 843-9120',
    email: 'marcus.vance@gmail.com',
    address: '4218 Westlake Dr, Westlake Hills, TX 78746',
    preferredTime: 'Morning (8:00 AM - 12:00 PM)',
    notes: 'Severe hail denting on north-facing slope from April storm. Need insurance adjuster report assistance.',
    status: 'new',
    syncedToSupabase: false,
    estimate: {
      service: 'replacement',
      material: 'metal',
      squareFeet: 3400,
      stories: 2,
      pitch: 'steep',
      extras: ['tear_off', 'gutters', 'skylight'],
      estimatedLow: 28400,
      estimatedHigh: 34200,
      estimatedMedian: 31300,
      subtotal: 31300,
    },
  },
  {
    id: 'SR-TX-M4H8J1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    name: 'Elena Rostova',
    phone: '(512) 671-4409',
    email: 'elena.rostova@outlook.com',
    address: '1704 Barton Hills Dr, Austin, TX 78704',
    preferredTime: 'Afternoon (12:00 PM - 4:00 PM)',
    notes: 'Looking to upgrade old 3-tab shingles to Class 4 Architectural shingles for Travis County insurance discount.',
    status: 'scheduled',
    syncedToSupabase: true,
    estimate: {
      service: 'replacement',
      material: 'asphalt',
      squareFeet: 2200,
      stories: 1,
      pitch: 'medium',
      extras: ['tear_off'],
      estimatedLow: 11200,
      estimatedHigh: 13900,
      estimatedMedian: 12550,
      subtotal: 12550,
    },
  },
  {
    id: 'SR-TX-Q1V9W7',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // Yesterday
    name: 'David K. Reynolds',
    phone: '(512) 394-8821',
    email: 'dk.reynolds@reynoldseng.com',
    address: '11208 Steiner Ranch Blvd, Austin, TX 78732',
    preferredTime: 'Late Afternoon (4:00 PM - 6:00 PM)',
    notes: 'Leak around primary chimney flashing during heavy rain. Would like full drone & thermal attic inspection.',
    status: 'contacted',
    syncedToSupabase: true,
    estimate: {
      service: 'repair',
      material: 'tile',
      squareFeet: 2800,
      stories: 2,
      pitch: 'medium',
      extras: ['storm_damage'],
      estimatedLow: 3800,
      estimatedHigh: 5400,
      estimatedMedian: 4600,
      subtotal: 4600,
    },
  },
  {
    id: 'SR-TX-T7X3B5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(), // 2 days ago
    name: 'Cynthia Martinez',
    phone: '(512) 550-1284',
    email: 'cmartinez@austinrealty.org',
    address: '8910 Great Hills Trail, Austin, TX 78759',
    preferredTime: 'Morning (8:00 AM - 12:00 PM)',
    notes: 'Commercial/residential flat roof section has standing ponding water. Interested in commercial-grade TPO.',
    status: 'quoted',
    syncedToSupabase: false,
    estimate: {
      service: 'replacement',
      material: 'flat_tpo',
      squareFeet: 1900,
      stories: 1,
      pitch: 'low',
      extras: ['tear_off', 'insulation'],
      estimatedLow: 13500,
      estimatedHigh: 16800,
      estimatedMedian: 15150,
      subtotal: 15150,
    },
  },
];

/**
 * Retrieve all leads from Local Storage.
 * Seeds initial realistic demo leads if empty.
 */
export function getStoredLeads(): StoredLead[] {
  if (typeof window === 'undefined') {
    return INITIAL_DEMO_LEADS;
  }

  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial demo leads
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADS));
      return INITIAL_DEMO_LEADS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    } else {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADS));
      return INITIAL_DEMO_LEADS;
    }
  } catch (err) {
    console.warn('[LeadStorage] Failed to read leads from localStorage:', err);
    return INITIAL_DEMO_LEADS;
  }
}

/**
 * Save a newly submitted lead to localStorage and trigger Supabase sync
 */
export async function saveLead(
  leadData: Omit<StoredLead, 'id' | 'createdAt' | 'status'> & {
    id?: string;
    createdAt?: string;
    status?: LeadStatus;
  }
): Promise<StoredLead> {
  const newLead: StoredLead = {
    id: leadData.id || `SR-TX-${Date.now().toString(36).toUpperCase()}`,
    createdAt: leadData.createdAt || new Date().toISOString(),
    status: leadData.status || 'new',
    name: leadData.name,
    phone: leadData.phone,
    email: leadData.email,
    address: leadData.address,
    preferredTime: leadData.preferredTime,
    notes: leadData.notes || '',
    syncedToSupabase: false,
    estimate: leadData.estimate,
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = getStoredLeads();
      // Avoid duplicate by ID
      const filtered = existing.filter((l) => l.id !== newLead.id);
      const updated = [newLead, ...filtered];
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));

      // Dispatch browser custom event for reactive UI update
      window.dispatchEvent(
        new CustomEvent('summit_leads_updated', {
          detail: { action: 'add', lead: newLead },
        })
      );
    } catch (err) {
      console.error('[LeadStorage] Failed to save lead in localStorage:', err);
    }

    // Attempt background sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const syncRes = await syncLeadToSupabase(newLead);
        if (syncRes.success) {
          newLead.syncedToSupabase = true;
          // Re-persist with synced flag
          const currentLeads = getStoredLeads();
          const refreshed = currentLeads.map((l) => (l.id === newLead.id ? { ...l, syncedToSupabase: true } : l));
          localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(refreshed));
          window.dispatchEvent(new CustomEvent('summit_leads_updated', { detail: { action: 'sync', lead: newLead } }));
        } else {
          newLead.supabaseError = syncRes.error;
        }
      } catch (e) {
        console.warn('[LeadStorage] Supabase auto-sync failed:', e);
      }
    }
  }

  return newLead;
}

/**
 * Update the pipeline status of an existing lead
 */
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const leads = getStoredLeads();
    const updated = leads.map((lead) => {
      if (lead.id === id) {
        const modified = { ...lead, status };
        // If Supabase is wired, sync updated status
        if (isSupabaseConfigured()) {
          syncLeadToSupabase(modified).catch((err) => console.warn('[Supabase] Status sync failed:', err));
        }
        return modified;
      }
      return lead;
    });

    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('summit_leads_updated', {
        detail: { action: 'update_status', id, status },
      })
    );
  } catch (err) {
    console.error('[LeadStorage] Failed to update lead status:', err);
  }
}

/**
 * Delete a lead
 */
export function deleteLead(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const leads = getStoredLeads();
    const updated = leads.filter((lead) => lead.id !== id);
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('summit_leads_updated', {
        detail: { action: 'delete', id },
      })
    );
  } catch (err) {
    console.error('[LeadStorage] Failed to delete lead:', err);
  }
}

/**
 * Reset back to initial authentic demo leads
 */
export function resetDemoLeads(): StoredLead[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADS));
    window.dispatchEvent(
      new CustomEvent('summit_leads_updated', {
        detail: { action: 'reset' },
      })
    );
  }
  return INITIAL_DEMO_LEADS;
}

/**
 * Generate a new random realistic lead for live demo presentations
 */
export function generateTestLead(): StoredLead {
  const austinLocations = [
    { name: 'Dr. Gregory Hayes', address: '3104 Rollingwood Dr, Rollingwood, TX 78746', phone: '(512) 472-8819' },
    { name: 'Jessica & Tyler Cole', address: '7801 Spicewood Springs Rd, Austin, TX 78759', phone: '(512) 906-3341' },
    { name: 'Brandon Nguyen', address: '2204 South Congress Ave, Austin, TX 78704', phone: '(512) 710-5590' },
    { name: 'Rachel Holbrook', address: '1410 Lakeway Blvd, Lakeway, TX 78734', phone: '(512) 261-7703' },
    { name: 'Robert & Maria Santos', address: '602 E 11th St, East Austin, TX 78702', phone: '(512) 349-2180' },
  ];

  const pick = austinLocations[Math.floor(Math.random() * austinLocations.length)];
  const materials: ('asphalt' | 'metal' | 'tile' | 'flat_tpo')[] = ['asphalt', 'metal', 'tile', 'flat_tpo'];
  const mat = materials[Math.floor(Math.random() * materials.length)];
  const sqft = Math.floor(Math.random() * 2200) + 1600;

  const lowCost = Math.round(sqft * (mat === 'metal' ? 8.5 : mat === 'tile' ? 9.2 : 5.1));
  const highCost = Math.round(lowCost * 1.25);

  const newLead: StoredLead = {
    id: `SR-TX-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    name: pick.name,
    phone: pick.phone,
    email: `${pick.name.toLowerCase().replace(/[^a-z]/g, '.')}@example.com`,
    address: pick.address,
    preferredTime: 'Morning (8:00 AM - 12:00 PM)',
    notes: 'Generated from live demo simulator. Requesting satellite measurement verification and free inspection schedule.',
    status: 'new',
    syncedToSupabase: false,
    estimate: {
      service: 'replacement',
      material: mat,
      squareFeet: sqft,
      stories: Math.random() > 0.5 ? 2 : 1,
      pitch: 'medium',
      extras: ['tear_off', 'gutters'],
      estimatedLow: lowCost,
      estimatedHigh: highCost,
      estimatedMedian: Math.round((lowCost + highCost) / 2),
      subtotal: Math.round((lowCost + highCost) / 2),
    },
  };

  saveLead(newLead);
  return newLead;
}

/**
 * Export leads to CSV file and trigger client download
 */
export function exportLeadsAsCSV(leads: StoredLead[]): void {
  if (typeof window === 'undefined') return;

  const headers = [
    'Lead ID',
    'Date Submitted',
    'Status',
    'Customer Name',
    'Phone',
    'Email',
    'Address',
    'Preferred Time',
    'Service',
    'Roof Material',
    'Square Feet',
    'Estimated Low ($)',
    'Estimated High ($)',
    'Selected Add-ons',
    'Notes',
  ];

  const rows = leads.map((l) => [
    `"${l.id}"`,
    `"${new Date(l.createdAt).toLocaleString()}"`,
    `"${l.status.toUpperCase()}"`,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.phone}"`,
    `"${l.email}"`,
    `"${l.address.replace(/"/g, '""')}"`,
    `"${l.preferredTime || ''}"`,
    `"${l.estimate?.service || ''}"`,
    `"${l.estimate?.material || ''}"`,
    l.estimate?.squareFeet || '',
    l.estimate?.estimatedLow || '',
    l.estimate?.estimatedHigh || '',
    `"${(l.estimate?.extras || []).join(', ')}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `summit_roofing_leads_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
