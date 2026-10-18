/**
 * This file is intentionally left as a no-op stub.
 *
 * All API routes are handled by individual Vercel Serverless Functions:
 *   - api/local-roof-intel.ts  → POST /api/local-roof-intel
 *   - api/submit-lead.ts       → POST /api/submit-lead
 *   - api/admin/leads.ts       → GET  /api/admin/leads
 *
 * Vercel resolves each route directly to its matching file via vercel.json rewrites.
 * The previous pattern of importing from ../server caused ERR_MODULE_NOT_FOUND
 * at runtime because TypeScript source files cannot be resolved as ESM in the
 * Vercel serverless function runtime.
 */
export default function handler(_req: unknown, _res: unknown) {
  // Unreachable — all /api/* traffic is routed to individual handlers by vercel.json
}
