import { describe, it, expect } from 'vitest';
import { calculateRoofEstimate, formatCurrency, getSqFtFromHouseSize } from './pricingEngine';
import { EstimateInput } from '../types';

describe('Roofing Pricing Engine', () => {
  it('calculates baseline standard asphalt replacement with no extras', () => {
    const input: EstimateInput = {
      service: 'replacement',
      squareFeet: 2000,
      material: 'asphalt',
      stories: 1,
      pitch: 'low',
      extras: [],
    };

    const breakdown = calculateRoofEstimate(input);
    // 2000 sq ft * $5.25 = $10,500 base
    // service mult = 1.0, stories = 1.0, pitch = 1.0
    // subtotal = $10,500
    expect(breakdown.subtotal).toBe(10500);
    expect(breakdown.baseMaterialCost).toBe(10500);
    expect(breakdown.extrasTotal).toBe(0);
    // Low: -12% -> 10,500 * 0.88 = 9,240
    // High: +15% -> 10,500 * 1.15 = 12,075
    expect(breakdown.estimatedLow).toBe(9240);
    expect(breakdown.estimatedHigh).toBe(12075);
  });

  it('correctly applies stories and pitch complexity multipliers', () => {
    const input: EstimateInput = {
      service: 'replacement',
      squareFeet: 2000,
      material: 'asphalt',
      stories: 2, // 1.15
      pitch: 'steep', // 1.25
      extras: [],
    };

    const breakdown = calculateRoofEstimate(input);
    // 10,500 * 1.15 * 1.25 = 15,093.75 -> round to 15,094
    expect(breakdown.subtotal).toBe(15094);
    expect(breakdown.storiesMultiplier).toBe(1.15);
    expect(breakdown.pitchMultiplier).toBe(1.25);
  });

  it('correctly calculates service multiplier for roof repair', () => {
    const input: EstimateInput = {
      service: 'repair', // 0.35
      squareFeet: 1000,
      material: 'metal', // $10.75 / sq ft
      stories: 1,
      pitch: 'low',
      extras: [],
    };

    const breakdown = calculateRoofEstimate(input);
    // 1000 * 10.75 = 10,750 base
    // service mult = 0.35 -> 3,762.5
    expect(breakdown.subtotal).toBe(3763);
    expect(breakdown.serviceMultiplier).toBe(0.35);
  });

  it('itemizes per-sqft extras and flat-rate extras accurately', () => {
    const input: EstimateInput = {
      service: 'replacement',
      squareFeet: 2000,
      material: 'tile', // $13.50
      stories: 1,
      pitch: 'medium', // 1.08
      extras: ['tear_off', 'gutters'], // tear_off = $1.25/sqft ($2500), gutters = $1850 flat
    };

    const breakdown = calculateRoofEstimate(input);
    // base: 2000 * 13.50 = 27,000
    // complexity: 27,000 * 1.0 * 1.08 = 29,160
    // tear_off: 2000 * 1.25 = 2,500
    // gutters: 1,850
    // extrasTotal: 4,350
    // subtotal: 29,160 + 4,350 = 33,510
    expect(breakdown.extrasTotal).toBe(4350);
    expect(breakdown.subtotal).toBe(33510);
    expect(breakdown.extrasItemized).toHaveLength(2);
    expect(breakdown.extrasItemized[0].amount).toBe(2500);
    expect(breakdown.extrasItemized[1].amount).toBe(1850);
  });

  it('handles house size preset conversion accurately', () => {
    expect(getSqFtFromHouseSize('small')).toBe(1400);
    expect(getSqFtFromHouseSize('medium')).toBe(2200);
    expect(getSqFtFromHouseSize('large')).toBe(3400);
    expect(getSqFtFromHouseSize('very_large')).toBe(4600);
  });

  it('formats currency correctly without decimal pennies', () => {
    expect(formatCurrency(12450)).toBe('$12,450');
    expect(formatCurrency(850)).toBe('$850');
  });

  it('clamps extreme sq ft input values safely', () => {
    const lowInput: EstimateInput = {
      service: 'replacement',
      squareFeet: 50, // below 200 min
      material: 'asphalt',
      stories: 1,
      pitch: 'low',
      extras: [],
    };
    const breakdownLow = calculateRoofEstimate(lowInput);
    // clamped to 200 sq ft -> 200 * 5.25 = 1,050
    expect(breakdownLow.baseMaterialCost).toBe(1050);

    const highInput: EstimateInput = {
      service: 'replacement',
      squareFeet: 50000, // above 10,000 max
      material: 'asphalt',
      stories: 1,
      pitch: 'low',
      extras: [],
    };
    const breakdownHigh = calculateRoofEstimate(highInput);
    // clamped to 10,000 sq ft -> 10,000 * 5.25 = 52,500
    expect(breakdownHigh.baseMaterialCost).toBe(52500);
  });
});
