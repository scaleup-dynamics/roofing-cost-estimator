import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Supabase is initialised once per cold start (cached across warm invocations by Node module cache)
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key && url.startsWith('https://')) {
    try {
      supabase = createClient(url, key, { auth: { persistSession: false } });
    } catch (err) {
      console.warn('[Supabase] Init error:', err);
    }
  }
  return supabase;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lead, estimate, leadId, webhookUrl } = req.body as {
      lead?: { name?: string; phone?: string; email?: string; address?: string; preferredTime?: string; notes?: string };
      estimate?: any;
      leadId?: string;
      webhookUrl?: string;
    };

    if (!lead || !lead.name || !lead.phone || !lead.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required contact details (name, phone, email are required).',
      });
    }

    const assignedId = leadId || `SR-TX-${Date.now().toString(36).toUpperCase()}`;

    const leadRecord = {
      id: assignedId,
      createdAt: new Date().toISOString(),
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      preferredTime: lead.preferredTime || 'Morning (8:00 AM - 12:00 PM)',
      notes: lead.notes || '',
      status: 'new',
      syncedToSupabase: false,
      estimate: {
        service: estimate?.input?.service,
        material: estimate?.input?.material,
        squareFeet: estimate?.input?.squareFeet,
        estimatedLow: estimate?.breakdown?.estimatedLow,
        estimatedHigh: estimate?.breakdown?.estimatedHigh,
        raw: estimate,
      },
    };

    console.log('[Lead Engine] Received free inspection request:', {
      id: assignedId,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      estimatedRange: `${estimate?.breakdown?.estimatedLow} - ${estimate?.breakdown?.estimatedHigh}`,
      service: estimate?.input?.service,
      material: estimate?.input?.material,
    });

    // Sync to Supabase if configured
    let supabaseSynced = false;
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from('roofing_leads').upsert({
          id: assignedId,
          created_at: leadRecord.createdAt,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          address: lead.address,
          preferred_time: leadRecord.preferredTime,
          notes: leadRecord.notes,
          status: 'new',
          service: estimate?.input?.service,
          material: estimate?.input?.material,
          square_feet: estimate?.input?.squareFeet,
          estimated_low: estimate?.breakdown?.estimatedLow,
          estimated_high: estimate?.breakdown?.estimatedHigh,
          estimate_data: estimate,
        });

        if (!error) {
          supabaseSynced = true;
          console.log('[Lead Engine] Synced to Supabase:', assignedId);
        } else {
          console.warn('[Lead Engine] Supabase upsert warning:', error.message);
        }
      } catch (sbErr: any) {
        console.warn('[Lead Engine] Supabase sync exception:', sbErr?.message);
      }
    }

    // Webhook forwarding (only when a real URL is provided)
    let webhookStatus = 'received_and_stored';
    let webhookError: string | null = null;

    if (webhookUrl && !webhookUrl.includes('placeholder_summit_roofing')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'Summit Roofing Instant Estimator',
            lead,
            estimate,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        webhookStatus = response.ok ? 'forwarded_webhook' : 'webhook_failed_status';
        if (!response.ok) webhookError = `HTTP ${response.status} from webhook endpoint`;
      } catch (err: any) {
        webhookStatus = 'webhook_network_error';
        webhookError = err?.message || 'Network timeout or error';
        console.warn('[Lead Engine] Webhook notice:', webhookError);
      }
    }

    return res.json({
      success: true,
      status: webhookStatus,
      leadId: assignedId,
      supabaseSynced,
      message: 'Inspection booked successfully! A roofing specialist will contact you to confirm.',
      details: {
        customerName: lead.name,
        contactMethod: lead.phone,
        preferredTime: lead.preferredTime || 'Morning (8am - 12pm)',
      },
      webhookNotice: webhookError ? 'Lead captured; webhook endpoint was unreachable.' : undefined,
    });
  } catch (error: any) {
    console.error('[Lead Engine] Error processing lead:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to process your inspection request right now. Please call us directly.',
    });
  }
}
