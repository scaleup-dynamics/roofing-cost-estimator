import { AppConfig } from '../types';

/**
 * =====================================================================
 * SUMMIT ROOFING CO. CONFIGURATION FILE
 * =====================================================================
 * To customize this application for another roofing contractor or city,
 * simply update the values in this file. It takes under 10 minutes!
 */
export const roofingConfig: AppConfig = {
  brand: {
    companyName: 'Summit Roofing Co.',
    tagline: 'Austin’s Premier Residential & Commercial Roofing Specialists',
    city: 'Austin, TX',
    phone: '(512) 555-0123',
    phoneRaw: '5125550123',
    ownerEmail: 'estimates@summitroofingaustin.com',
    licenseNumber: 'TX-RCL#94821-B',
    yearEstablished: 2011,
    primaryColor: '#0F2A43', // deep navy
    accentColor: '#F97316',  // warm orange
    // Lead webhook URL (Google Apps Script, Zapier, Make, or Formspree endpoint)
    // If kept as placeholder or failed, the app falls back smoothly with local acknowledgment
    webhookUrl: 'https://formspree.io/f/placeholder_summit_roofing',
    emergencyAvailable: true,
    serviceRadius: '45 miles around Greater Austin',
    serviceAreas: [
      'Central Austin',
      'Westlake Hills',
      'Round Rock',
      'Cedar Park',
      'Lakeway',
      'Pflugerville',
      'Georgetown',
      'Buda & Kyle',
    ],
  },

  pricing: {
    // Range variance: -12% to +15%
    lowVariancePercentage: 0.12,
    highVariancePercentage: 0.15,

    // 1. Material price per square foot (materials + standard installation baseline)
    materialPerSqFt: {
      asphalt: {
        name: 'Architectural Asphalt Shingle',
        basePricePerSqFt: 5.25,
        lifespanYears: '25-30 Years',
        bestFor: 'Cost-effective, versatile, and high wind resistance',
        warranty: '50-Year Limited Lifetime',
      },
      metal: {
        name: 'Standing Seam Metal',
        basePricePerSqFt: 10.75,
        lifespanYears: '50-70 Years',
        bestFor: 'Maximum Texas heat reflection, hail resistance, and durability',
        warranty: 'Lifetime Transferable',
      },
      tile: {
        name: 'Clay & Concrete Tile',
        basePricePerSqFt: 13.50,
        lifespanYears: '50-100 Years',
        bestFor: 'Spanish/Mediterranean architecture, Class-A fire rating',
        warranty: '50-Year System',
      },
      flat_tpo: {
        name: 'Flat / TPO Single-Ply Membrane',
        basePricePerSqFt: 7.10,
        lifespanYears: '20-30 Years',
        bestFor: 'Low-slope modern homes, patios, and commercial flat roofs',
        warranty: '25-Year Manufacturer',
      },
    },

    // 2. Service type multipliers
    serviceMultipliers: {
      repair: {
        label: 'Roof Repair',
        subtitle: 'Fix leaks, missing shingles, flashing & localized damage',
        description: 'Targeted repair work for isolated issues, penetrations, or storm damage',
        multiplier: 0.35, // Repairs are fractional of a total roof overhaul
      },
      replacement: {
        label: 'Full Replacement',
        subtitle: 'Complete removal of old roof and installation of a brand new system',
        description: 'Recommended for roofs older than 18-20 years or widespread storm degradation',
        multiplier: 1.0, // Standard baseline
      },
      installation: {
        label: 'New Construction',
        subtitle: 'Brand new roof deck installation on new home or addition',
        description: 'Pristine decking with zero tear-off debris',
        multiplier: 0.92, // Faster install without demo labor
      },
    },

    // 3. Stories complexity multiplier
    storiesMultipliers: {
      1: 1.0,   // Standard single story
      2: 1.15,  // 2 stories (+15% for staging and fall arrest safety)
      3: 1.30,  // 3+ stories (+30% high elevation rigging)
    },

    // 4. Pitch complexity multiplier
    pitchMultipliers: {
      low: {
        label: 'Low Pitch',
        angle: '4:12 or less (Walkable)',
        description: 'Easier to navigate, faster install speed',
        multiplier: 1.0,
      },
      medium: {
        label: 'Medium Pitch',
        angle: '5:12 to 8:12 (Standard)',
        description: 'Most common residential Texas roof angle',
        multiplier: 1.08,
      },
      steep: {
        label: 'Steep Pitch',
        angle: '9:12+ (Requires safety ropes)',
        description: 'Architectural steep slopes requiring harness rigging',
        multiplier: 1.25,
      },
    },

    // Quick house size estimator presets for homeowners who don't know square footage
    houseSizeDefaults: {
      small: {
        label: 'Small Home',
        sqFt: 1400,
        description: 'Bungalow / Townhome / Starter Home',
        bedrooms: '2-3 Bed (Approx. 1,200 - 1,600 sq ft roof footprint)',
      },
      medium: {
        label: 'Medium Home',
        sqFt: 2200,
        description: 'Standard Suburban Single Family',
        bedrooms: '3-4 Bed (Approx. 1,800 - 2,500 sq ft roof footprint)',
      },
      large: {
        label: 'Large Home',
        sqFt: 3400,
        description: 'Spacious Multi-Level or Ranch Home',
        bedrooms: '4-5 Bed (Approx. 2,800 - 3,800 sq ft roof footprint)',
      },
      very_large: {
        label: 'Very Large Home / Estate',
        sqFt: 4600,
        description: 'Custom Luxury Estate or Expansive Property',
        bedrooms: '5+ Bed (Approx. 4,000 - 5,000+ sq ft roof footprint)',
      },
    },

    // 5. Extras catalog
    extrasCatalog: [
      {
        id: 'tear_off',
        label: 'Old Roof Tear-off & Disposal',
        description: 'Full removal of existing shingles down to decking + clean dumpster haul away',
        priceType: 'per_sqft',
        cost: 1.25,
        badge: 'Recommended',
      },
      {
        id: 'gutters',
        label: 'Seamless 6" Aluminum Gutters',
        description: 'Commercial-grade seamless gutters with oversized downspouts & leaf guards',
        priceType: 'flat',
        cost: 1850,
      },
      {
        id: 'skylight',
        label: 'Skylight Replacement / Flashing',
        description: 'New double-pane tempered low-E solar glass skylights with leak-proof flashing kit',
        priceType: 'flat',
        cost: 1200,
      },
      {
        id: 'insulation',
        label: 'Radiant Barrier & Attic Insulation Upgrade',
        description: 'Reflective radiant heat barrier + blown-in insulation to cut Austin summer electric bills by up to 25%',
        priceType: 'flat',
        cost: 1950,
        badge: 'Energy Saver',
      },
      {
        id: 'storm_damage',
        label: 'Emergency / Storm Damage Tarping & Expedited Crew',
        description: 'Priority insurance documentation, emergency leak tarping, and direct adjuster liaison',
        priceType: 'flat',
        cost: 750,
        badge: 'Insurance Priority',
      },
    ],
  },

  testimonials: [
    {
      name: 'Marcus & Elena Sterling',
      neighborhood: 'Barton Hills, Austin',
      rating: 5,
      review:
        'Summit Roofing was transparent from minute one. The online estimate matched their written quote within 4%! Their crew completed our 2,600 sq ft standing seam metal roof in just 2 days without leaving a single stray nail in our driveway.',
      service: 'Standing Seam Metal Roof Replacement',
      date: '2 weeks ago',
    },
    {
      name: 'David Holbrook',
      neighborhood: 'Mueller, Austin',
      rating: 5,
      review:
        'After the April hail storm hit Central Austin, other roofers quoted crazy numbers with high-pressure tactics. Summit came out the next morning, performed a drone video inspection for free, and walked our insurance adjuster through the claim. Incredible team.',
      service: 'Storm Hail Damage & Shingle Replacement',
      date: '1 month ago',
    },
    {
      name: 'Rachel Vance',
      neighborhood: 'Circle C Ranch, Austin',
      rating: 5,
      review:
        'Super easy estimate tool, prompt communication, and a beautiful roof with transferable warranty. Plus adding the radiant barrier cut our July electric bill by nearly $90. Cannot recommend them enough!',
      service: 'Architectural Shingles + Radiant Barrier',
      date: '2 months ago',
    },
  ],

  faqs: [
    {
      question: 'How accurate is this 60-second online estimate?',
      answer:
        'Our online calculator uses current Austin material and labor rates and gives a realistic ±12-15% range based on your roof’s slope, size, and material. During your free physical inspection, our master inspector climbs the roof to inspect the wood decking, flashing, and ventilation to provide an exact, guaranteed price in writing.',
      category: 'Estimates & Pricing',
    },
    {
      question: 'Do you assist with Austin insurance claims after hail or storm damage?',
      answer:
        'Yes! Over 60% of our Austin replacements are covered by insurance after hail and severe weather. We meet your insurance adjuster on-site, provide high-resolution drone photos and line-item Xactimate documentation, ensuring you get full coverage with zero out-of-pocket surprise fees except your deductible.',
      category: 'Insurance',
    },
    {
      question: 'How long does a typical roof replacement take in Austin?',
      answer:
        'Most single-family residential replacements (1,500 to 3,500 sq ft) are completed in just 1 to 2 days. We protect your landscaping with tarp barriers, perform magnetic roller sweeps for nails, and leave your property cleaner than we found it.',
      category: 'Installation',
    },
    {
      question: 'What warranties come with a Summit Roofing roof?',
      answer:
        'We provide a 50-Year Manufacturer Material Warranty on architectural shingles and lifetime transferable coverage on standing seam metal, backed by our Summit 10-Year Workmanship Guarantee covering any labor or leak concerns.',
      category: 'Warranties',
    },
    {
      question: 'Is financing available for roof replacements?',
      answer:
        'Yes, we partner with top home improvement lenders to offer flexible monthly payments, 0% interest for 12 months, and low-interest terms up to 120 months. You can explore financing during your free in-home consultation.',
      category: 'Financing',
    },
  ],
};
