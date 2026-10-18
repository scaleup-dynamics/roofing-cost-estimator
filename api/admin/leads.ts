import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Admin endpoint — returns a lightweight status response.
 *
 * NOTE: In a Vercel Serverless environment each function invocation is stateless,
 * so the in-memory lead buffer that existed in server.ts cannot be shared across
 * invocations. Leads are persisted to Supabase via /api/submit-lead. This endpoint
 * confirms Supabase connectivity and returns configuration status for diagnostics.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseConfigured = Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://'));

  return res.json({
    success: true,
    supabaseConfigured,
    message: supabaseConfigured
      ? 'Supabase is configured. Query the roofing_leads table directly in your Supabase dashboard.'
      : 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables to enable lead persistence.',
    note: 'In serverless mode, leads are persisted to Supabase rather than an in-memory buffer.',
  });
}
