import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StoredLead, SupabaseConfig } from '../types';

const SUPABASE_CONFIG_KEY = 'summit_roofing_supabase_config_v1';
export const DEFAULT_SUPABASE_TABLE = 'roofing_leads';

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================
-- SUMMIT ROOFING CO. - SUPABASE LEADS PIPELINE SCHEMA
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================

create table if not exists roofing_leads (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text not null,
  email text not null,
  address text not null,
  preferred_time text,
  notes text,
  status text default 'new',
  service text,
  material text,
  square_feet numeric,
  estimated_low numeric,
  estimated_high numeric,
  estimate_data jsonb
);

-- Row Level Security policies
alter table roofing_leads enable row level security;

-- Allow customer estimate leads to be inserted from the web calculator
create policy "Allow public inserts for estimate leads"
  on roofing_leads for insert
  with check (true);

-- Allow authenticated or demo dashboard reads
create policy "Allow public reads for admin dashboard"
  on roofing_leads for select
  using (true);
`;

export function getStoredSupabaseConfig(): SupabaseConfig {
  if (typeof window === 'undefined') {
    return {
      url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
      anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
      tableName: DEFAULT_SUPABASE_TABLE,
      autoSync: true,
    };
  }

  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || (import.meta.env.VITE_SUPABASE_URL as string) || '',
        anonKey: parsed.anonKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
        tableName: parsed.tableName || DEFAULT_SUPABASE_TABLE,
        autoSync: parsed.autoSync !== false,
      };
    }
  } catch (err) {
    console.warn('[Supabase] Failed to read stored config', err);
  }

  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
    tableName: DEFAULT_SUPABASE_TABLE,
    autoSync: true,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    // Clear cached client so it re-initializes
    cachedClient = null;
  } catch (err) {
    console.error('[Supabase] Failed to persist config', err);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const key = `${config.url}::${config.anonKey}`;
  if (cachedClient && lastClientKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastClientKey = key;
    return cachedClient;
  } catch (err) {
    console.error('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const config = getStoredSupabaseConfig();
  return Boolean(config.url && config.anonKey && config.url.startsWith('https://'));
}

/**
 * Test connectivity to the Supabase instance and table
 */
export async function testSupabaseConnection(
  testUrl?: string,
  testKey?: string,
  tableName = DEFAULT_SUPABASE_TABLE
): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const url = testUrl || getStoredSupabaseConfig().url;
    const anonKey = testKey || getStoredSupabaseConfig().anonKey;

    if (!url || !anonKey) {
      return {
        success: false,
        message: 'Supabase URL and Anon Key are required.',
      };
    }

    if (!url.startsWith('https://')) {
      return {
        success: false,
        message: 'Invalid Supabase URL: Must begin with https://',
      };
    }

    const client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    // Query 1 row to verify connection and table existence
    const { data, error, count } = await client
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      // Check if table missing
      if (error.code === '42P01' || error.message.toLowerCase().includes('relation') || error.message.includes('not found')) {
        return {
          success: false,
          message: `Connected to Supabase project, but table "${tableName}" does not exist yet. Please run the provided SQL setup snippet in the SQL Editor.`,
        };
      }
      return {
        success: false,
        message: `Supabase error: ${error.message} (Code: ${error.code})`,
      };
    }

    return {
      success: true,
      message: `Successfully connected to Supabase table "${tableName}"!`,
      count: count ?? 0,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to connect to Supabase.',
    };
  }
}

/**
 * Syncs a single lead to Supabase
 */
export async function syncLeadToSupabase(
  lead: StoredLead
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  if (!client || !config.autoSync) {
    return {
      success: false,
      error: 'Supabase is not configured or auto-sync is disabled.',
    };
  }

  try {
    const payload = {
      id: lead.id,
      created_at: lead.createdAt,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      preferred_time: lead.preferredTime,
      notes: lead.notes || '',
      status: lead.status,
      service: lead.estimate.service,
      material: lead.estimate.material,
      square_feet: lead.estimate.squareFeet,
      estimated_low: lead.estimate.estimatedLow,
      estimated_high: lead.estimate.estimatedHigh,
      estimate_data: lead.estimate,
    };

    const { error } = await client
      .from(config.tableName || DEFAULT_SUPABASE_TABLE)
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Sync failed for lead:', lead.id, error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase] Sync exception:', err);
    return {
      success: false,
      error: err?.message || 'Network exception syncing to Supabase.',
    };
  }
}
