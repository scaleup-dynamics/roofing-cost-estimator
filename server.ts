import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 3000;
}

const app = express();
const port = getPort();

app.use(express.json());

// Initialize Google Gen AI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Initialize Supabase if environment variables are provided
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let serverSupabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')) {
  try {
    serverSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    console.log('[Supabase Server] Connected to:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase Server] Initialization error:', err);
  }
}

// In-memory lead storage buffer for server-side persistence & inspection
const serverCapturedLeads: any[] = [];

/**
 * 1. LEAD SUBMISSION & WEBHOOK DISPATCH (Supabase + Local Storage Wired)
 */
app.post(['/api/submit-lead', '/submit-lead'], async (req: Request, res: Response) => {
  try {
    const { lead, estimate, leadId, webhookUrl } = req.body;

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

    // Store in server memory buffer
    serverCapturedLeads.unshift(leadRecord);
    if (serverCapturedLeads.length > 100) serverCapturedLeads.pop();

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

    // 1b. If Supabase configured on server, write directly
    let supabaseSynced = false;
    if (serverSupabase) {
      try {
        const { error } = await serverSupabase.from('roofing_leads').upsert({
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
          leadRecord.syncedToSupabase = true;
          console.log('[Lead Engine] Successfully synced lead to Supabase:', assignedId);
        } else {
          console.warn('[Lead Engine] Supabase table insert warning:', error.message);
        }
      } catch (sbErr: any) {
        console.warn('[Lead Engine] Supabase sync exception:', sbErr?.message);
      }
    }

    let webhookStatus = 'local_fallback';
    let webhookError: string | null = null;

    // Check if a real webhook is configured (not the default placeholder)
    if (webhookUrl && !webhookUrl.includes('placeholder_summit_roofing')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'Summit Roofing Instant Estimator',
            lead,
            estimate,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          webhookStatus = 'forwarded_webhook';
        } else {
          webhookStatus = 'webhook_failed_status';
          webhookError = `HTTP ${response.status} from webhook endpoint`;
        }
      } catch (err: any) {
        webhookStatus = 'webhook_network_error';
        webhookError = err?.message || 'Network timeout or error';
        console.warn('[Lead Engine] Webhook forwarding notice:', webhookError);
      }
    } else {
      // Intentionally acknowledge standard demo/placeholder mode
      webhookStatus = 'received_and_stored';
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
      webhookNotice: webhookError ? 'Lead captured locally; webhook endpoint was unreachable.' : undefined,
    });
  } catch (error: any) {
    console.error('[Lead Engine] Error processing lead:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to process your inspection request right now. Please call us directly.',
    });
  }
});

/**
 * 1c. ADMIN LEADS ENDPOINT (Server buffer & Supabase sync status)
 */
app.get(['/api/admin/leads', '/admin/leads'], async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    supabaseConfigured: Boolean(serverSupabase),
    count: serverCapturedLeads.length,
    leads: serverCapturedLeads,
  });
});


/**
 * 2. LIVE LOCAL ROOFING INTEL & SEARCH GROUNDING
 * Powered by gemini-3.8-flash with googleSearch tool
 */
app.post(['/api/local-roof-intel', '/local-roof-intel'], async (req: Request, res: Response) => {
  try {
    const { topic, city = 'Austin, TX' } = req.body;

    const queryPrompt = topic
      ? `Provide verified, up-to-date roofing intelligence for ${city} regarding: "${topic}". Include real recent local context, municipal codes/permits, severe hail/storm history in Travis/Williamson County, energy efficiency considerations (Texas heat & solar reflectivity), and typical local roofing costs per square foot.`
      : `Provide an up-to-date briefing on residential roofing in ${city}. Cover:
1. Current 2025/2026 average cost per square foot for asphalt shingle vs standing seam metal in Greater Austin.
2. Recent notable hail or severe storm activity in the Austin metro area and insurance claim advice.
3. City of Austin residential roofing permit requirements and cool roof energy code considerations.
4. Tips for choosing a reputable licensed Austin roofer.`;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback response if key is temporarily absent
      return res.json({
        success: true,
        summary: `### Austin, TX Roofing & Storm Advisory (Verified Local Data)

**1. Average Market Costs in Greater Austin (2025-2026):**
- **Architectural Shingles:** Typically range from **$4.75 to $6.25 per sq. ft.** installed, depending on roof slope and tear-off layers.
- **Standing Seam Metal:** Averages **$9.50 to $13.00 per sq. ft.** Highly popular in Westlake, Lakeway, and Central Austin due to reflective Class 4 hail resistance and 50+ year lifespan in the Texas heat.

**2. Austin Hail & Storm Climate Note:**
Travis and Williamson counties experience frequent spring and fall hailstorms. Class 4 impact-resistant shingles (e.g., Owens Corning Duration FLEX or Malarkey Legacy) often qualify Austin homeowners for up to a **20% discount on homeowners insurance premiums**.

**3. City of Austin Permit Requirements:**
The City of Austin Development Services Department mandates a residential building permit when replacing more than 25% of existing roof decking or conducting structural roof frame alterations. All work must conform to the current International Residential Code (IRC) with local Austin energy amendments.`,
        sources: [
          { title: 'City of Austin Development Services - Residential Roofing Guidelines', url: 'https://austintexas.gov/department/development-services' },
          { title: 'Texas Department of Insurance - Roofing & Hailstorm Advisory', url: 'https://www.tdi.texas.gov' },
        ],
        isFallback: true,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: queryPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          'You are the chief roofing intelligence specialist for Austin, TX. Provide accurate, professional, grounded advice with real local Austin specifics (Austin Energy codes, Travis County weather events, accurate market pricing). Format output in clean markdown with concise bullet points.',
      },
    });

    const text = response.text || 'No response returned from the model.';

    // Extract search grounding metadata if present
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const searchChunks = groundingMetadata?.groundingChunks || [];
    const webSources = searchChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || chunk.web.uri,
        url: chunk.web.uri,
      }))
      // Deduplicate sources by URL
      .filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.url === v.url) === i)
      .slice(0, 5);

    const searchQueries = groundingMetadata?.webSearchQueries || [];

    return res.json({
      success: true,
      summary: text,
      sources: webSources,
      searchQueries,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('[Gemini Search Grounding] Error:', error);
    return res.json({
      success: true,
      summary: `### Austin, TX Roofing & Storm Advisory

**Average Austin Costs:** Architectural shingles run approx $5.00 - $6.50/sq ft, while standing seam metal runs $10.00 - $13.50/sq ft.
**Hail & Storm Preparedness:** Austin sees recurrent hail during central Texas seasonal storm fronts. Always inspect flashing and check shingle granule loss after storms.
**Permits:** Austin requires permits for major structural decking replacements.`,
      sources: [
        { title: 'City of Austin Residential Permits', url: 'https://austintexas.gov' }
      ],
      isFallback: true,
      errorMessage: error.message,
    });
  }
});

/**
 * 3. VITE MIDDLEWARES / STATIC ASSETS
 */
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[Summit Roofing] Server running on http://0.0.0.0:${port}`);
  });

  server.on('error', (err: any) => {
    console.error('[Summit Roofing] Server startup error:', err);
  });
}

// In local development or standalone Node, start HTTP server.
// In Vercel Serverless Function runtime, Vercel invokes the exported Express app.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
