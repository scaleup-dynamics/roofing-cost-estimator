import { roofingConfig } from '../config/roofingConfig';
import { EstimateInput, PriceBreakdown, RoofMaterial } from '../types';

/**
 * Calculates the comprehensive price breakdown and range for a roof estimate.
 */
export function calculateRoofEstimate(input: EstimateInput, config = roofingConfig.pricing): PriceBreakdown {
  const sqft = Math.max(200, Math.min(10000, input.squareFeet || 2000));
  const materialMeta = config.materialPerSqFt[input.material] || config.materialPerSqFt.asphalt;
  const serviceMeta = config.serviceMultipliers[input.service] || config.serviceMultipliers.replacement;
  const storiesMult = config.storiesMultipliers[input.stories] ?? 1.0;
  const pitchMeta = config.pitchMultipliers[input.pitch] || config.pitchMultipliers.medium;

  // 1. Base material & labor cost
  const baseMaterialCost = sqft * materialMeta.basePricePerSqFt;

  // 2. Service adjustment (repair vs replacement vs new)
  const serviceMultiplier = serviceMeta.multiplier;
  const serviceAdjustedBase = Math.round(baseMaterialCost * serviceMultiplier * 100) / 100;

  // 3. Complexity adjustment (stories & pitch)
  const complexitySubtotal = Math.round(serviceAdjustedBase * storiesMult * pitchMeta.multiplier);

  // 4. Extras itemization
  const extrasItemized: { id: any; label: string; amount: number }[] = [];
  let extrasTotal = 0;

  for (const extraKey of input.extras) {
    const extraConfig = config.extrasCatalog.find((item) => item.id === extraKey);
    if (!extraConfig) continue;

    let itemAmount = 0;
    if (extraConfig.priceType === 'per_sqft') {
      itemAmount = Math.round(sqft * extraConfig.cost);
    } else {
      itemAmount = Math.round(extraConfig.cost);
    }

    extrasTotal += itemAmount;
    extrasItemized.push({
      id: extraKey,
      label: extraConfig.label,
      amount: itemAmount,
    });
  }

  // 5. Total baseline estimate
  const subtotal = Math.round(complexitySubtotal + extrasTotal);

  // 6. Range variance (-12% to +15% per config)
  const lowVariance = config.lowVariancePercentage;
  const highVariance = config.highVariancePercentage;

  const estimatedLow = Math.round(subtotal * (1 - lowVariance));
  const estimatedHigh = Math.round(subtotal * (1 + highVariance));

  return {
    baseMaterialCost: Math.round(baseMaterialCost),
    materialCostPerSqFt: materialMeta.basePricePerSqFt,
    serviceMultiplier,
    serviceAdjustedBase: Math.round(serviceAdjustedBase),
    storiesMultiplier: storiesMult,
    pitchMultiplier: pitchMeta.multiplier,
    complexitySubtotal: Math.round(complexitySubtotal),
    extrasItemized,
    extrasTotal,
    subtotal,
    estimatedMedian: subtotal,
    estimatedLow,
    estimatedHigh,
    discountPercentage: Math.round(lowVariance * 100),
    premiumPercentage: Math.round(highVariance * 100),
  };
}

/**
 * Format currency with commas and no decimal places.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Helper to get square footage estimate from house size preset.
 */
export function getSqFtFromHouseSize(sizeKey: keyof typeof roofingConfig.pricing.houseSizeDefaults): number {
  return roofingConfig.pricing.houseSizeDefaults[sizeKey]?.sqFt ?? 2200;
}
