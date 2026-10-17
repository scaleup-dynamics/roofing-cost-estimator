export type ServiceType = 'repair' | 'replacement' | 'installation';

export type HouseSize = 'small' | 'medium' | 'large' | 'very_large';

export type RoofMaterial = 'asphalt' | 'metal' | 'tile' | 'flat_tpo';

export type Stories = 1 | 2 | 3;

export type RoofPitch = 'low' | 'medium' | 'steep';

export type ExtraAddonKey = 'gutters' | 'tear_off' | 'skylight' | 'insulation' | 'storm_damage';

export interface ExtraAddon {
  id: ExtraAddonKey;
  label: string;
  description: string;
  priceType: 'flat' | 'per_sqft';
  cost: number;
  badge?: string;
}

export interface EstimateInput {
  service: ServiceType;
  squareFeet: number;
  selectedHouseSize?: HouseSize;
  material: RoofMaterial;
  stories: Stories;
  pitch: RoofPitch;
  extras: ExtraAddonKey[];
}

export interface PriceBreakdown {
  baseMaterialCost: number;
  materialCostPerSqFt: number;
  serviceMultiplier: number;
  serviceAdjustedBase: number;
  storiesMultiplier: number;
  pitchMultiplier: number;
  complexitySubtotal: number;
  extrasItemized: {
    id: ExtraAddonKey;
    label: string;
    amount: number;
  }[];
  extrasTotal: number;
  subtotal: number;
  estimatedMedian: number;
  estimatedLow: number;
  estimatedHigh: number;
  discountPercentage: number;
  premiumPercentage: number;
}

export interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  preferredTime: string;
  notes?: string;
}

export interface LeadSubmissionPayload {
  lead: LeadFormData;
  estimate: {
    input: EstimateInput;
    breakdown: PriceBreakdown;
    date: string;
    city: string;
    companyName: string;
  };
}

export interface BrandConfig {
  companyName: string;
  tagline: string;
  city: string;
  phone: string;
  phoneRaw: string;
  ownerEmail: string;
  licenseNumber: string;
  yearEstablished: number;
  primaryColor: string;
  accentColor: string;
  webhookUrl: string;
  emergencyAvailable: boolean;
  serviceRadius: string;
  serviceAreas: string[];
}

export interface PricingConfig {
  lowVariancePercentage: number;  // e.g. 0.12 (-12%)
  highVariancePercentage: number; // e.g. 0.15 (+15%)
  materialPerSqFt: Record<RoofMaterial, {
    name: string;
    basePricePerSqFt: number;
    lifespanYears: string;
    bestFor: string;
    warranty: string;
  }>;
  serviceMultipliers: Record<ServiceType, {
    label: string;
    description: string;
    multiplier: number;
    subtitle: string;
  }>;
  storiesMultipliers: Record<Stories, number>;
  pitchMultipliers: Record<RoofPitch, {
    label: string;
    description: string;
    angle: string;
    multiplier: number;
  }>;
  houseSizeDefaults: Record<HouseSize, {
    label: string;
    sqFt: number;
    description: string;
    bedrooms: string;
  }>;
  extrasCatalog: ExtraAddon[];
}

export interface Testimonial {
  name: string;
  neighborhood: string;
  rating: number;
  review: string;
  service: string;
  date: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface AppConfig {
  brand: BrandConfig;
  pricing: PricingConfig;
  testimonials: Testimonial[];
  faqs: FAQItem[];
}

export type LeadStatus = 'new' | 'scheduled' | 'contacted' | 'quoted' | 'closed_won' | 'closed_lost';

export interface StoredLead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  preferredTime: string;
  notes?: string;
  status: LeadStatus;
  syncedToSupabase?: boolean;
  supabaseError?: string;
  estimate: {
    service: ServiceType;
    material: RoofMaterial;
    squareFeet: number;
    stories: Stories;
    pitch: RoofPitch;
    extras: ExtraAddonKey[];
    estimatedLow: number;
    estimatedHigh: number;
    estimatedMedian: number;
    subtotal?: number;
  };
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  autoSync: boolean;
}

