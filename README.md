# Summit Roofing Co. — Instant Roof Cost Estimator

A high-converting, mobile-first roofing estimation web application built with **React 19**, **Tailwind CSS v4**, **TypeScript**, and **Vite**.

Designed specifically for roofing contractors to capture high-intent residential and commercial leads in under 60 seconds with zero friction.

---

## ⚡ 10-Minute Rebranding & Client Customization

All brand information, municipal copy, pricing rates, multipliers, extras catalog, and webhook endpoints live inside **a single configuration file**:

📁 **`src/config/roofingConfig.ts`**

To deploy for a new roofing contractor in a different city:

1. **Company & Contact:**
   ```ts
   brand: {
     companyName: "Lone Star Premier Roofing",
     city: "Dallas, TX",
     phone: "(214) 555-0188",
     phoneRaw: "2145550188",
     ownerEmail: "quotes@lonestarpremier.com",
     licenseNumber: "TX-RCL#88412",
     primaryColor: "#0F2A43", // Navy
     accentColor: "#F97316",  // Orange
     webhookUrl: "https://formspree.io/f/your_form_id", // Zapier / Make / Apps Script
   }
   ```
2. **Pricing Rates & Multipliers:**
   - Adjust `materialPerSqFt` (Asphalt Shingles, Standing Seam Metal, Tile, Flat/TPO).
   - Adjust `serviceMultipliers` (Full Replacement: 1.0, Repair: 0.35, New Construction: 0.92).
   - Adjust `storiesMultipliers` (1 Story: 1.0, 2 Stories: 1.15, 3+ Stories: 1.30).
   - Adjust `pitchMultipliers` (Low: 1.0, Medium: 1.08, Steep: 1.25).
   - Customize `extrasCatalog` (Tear-off, Seamless Gutters, Skylights, Radiant Barrier, Emergency Tarping).
3. **Variance Range:**
   - `lowVariancePercentage: 0.12` (-12%)
   - `highVariancePercentage: 0.15` (+15%)

---

## 🎯 Lead Handling & Webhook Integration

When a homeowner books a free inspection, the app POSTs the lead contact details along with the line-item estimate calculations to `/api/submit-lead` which dispatches to your configured webhook URL:

```json
{
  "lead": {
    "name": "Sarah Jenkins",
    "phone": "(512) 555-0199",
    "email": "sarah@example.com",
    "address": "1402 Barton Springs Rd, Austin, TX",
    "preferredTime": "Morning (8:00 AM - 12:00 PM)",
    "notes": "Hail storm damage on back ridge."
  },
  "estimate": {
    "input": {
      "service": "replacement",
      "squareFeet": 2200,
      "material": "asphalt",
      "stories": 1,
      "pitch": "medium",
      "extras": ["tear_off"]
    },
    "breakdown": {
      "estimatedLow": 12850,
      "estimatedHigh": 16800,
      "subtotal": 14600
    }
  }
}
```

**Supported Webhook Providers:**
- **Formspree:** Set `webhookUrl: "https://formspree.io/f/your_id"`
- **Zapier / Make:** Create a "Catch Hook" trigger and paste the URL.
- **Google Sheets:** Use a Google Apps Script web app URL to append rows directly.

---

## 🔍 Real-Time Google Search Grounding

The app includes an Austin Roofing & Hail Storm Intelligence module backed by `gemini-3.8-flash` with Google Search grounding (`tools: [{ googleSearch: {} }]`). Homeowners can verify real-time City of Austin building permits, recent hailstorm activity in Travis County, and local price benchmarks.

---

## 🧪 Unit Testing Suite

Comprehensive unit tests verify calculation mathematics, multiplier compounding, per-sqft vs flat-rate add-ons, and floating-point stability:

```bash
npm test
```

All tests run via **Vitest** in `src/utils/pricingEngine.test.ts`.

---

## 🚀 Deployment to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Vercel Web Dashboard (Git push)
1. Push this repository to GitHub or GitLab.
2. In Vercel, click **"Add New Project"** and select the repository.
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gen AI API key for Search Grounding.
7. Click **Deploy**.

For full-stack deployment with the Express backend, Vercel Serverless Functions can serve `/api/*` or Cloud Run / Render / Railway can execute `npm start`.
