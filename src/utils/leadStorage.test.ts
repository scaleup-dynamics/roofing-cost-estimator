import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoredLeads,
  saveLead,
  updateLeadStatus,
  deleteLead,
  resetDemoLeads,
  generateTestLead,
  LEADS_STORAGE_KEY,
} from './leadStorage';

// Provide browser localStorage mock for Node test environment
let store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

if (typeof globalThis.window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: {
      dispatchEvent: vi.fn(),
    },
    writable: true,
    configurable: true,
  });
}

describe('leadStorage utility', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with sample demo leads if localStorage is empty', () => {
    const leads = getStoredLeads();
    expect(leads.length).toBeGreaterThan(0);
    expect(leads[0]).toHaveProperty('name');
    expect(leads[0]).toHaveProperty('phone');
    expect(leads[0]).toHaveProperty('estimate');
  });

  it('persists a new lead at the top of the queue', async () => {
    const newLead = await saveLead({
      name: 'Test Customer',
      phone: '(512) 555-0199',
      email: 'test@example.com',
      address: '100 Congress Ave, Austin, TX',
      preferredTime: 'Morning (8:00 AM - 12:00 PM)',
      notes: 'Test note',
      estimate: {
        service: 'replacement',
        material: 'metal',
        squareFeet: 2500,
        stories: 1,
        pitch: 'medium',
        extras: ['tear_off'],
        estimatedLow: 15000,
        estimatedHigh: 19000,
        estimatedMedian: 17000,
      },
    });

    expect(newLead.id).toMatch(/^SR-TX-/);
    expect(newLead.status).toBe('new');

    const stored = getStoredLeads();
    expect(stored[0].id).toBe(newLead.id);
    expect(stored[0].name).toBe('Test Customer');
  });

  it('updates lead status correctly in localStorage', async () => {
    const leads = getStoredLeads();
    const firstId = leads[0].id;

    await updateLeadStatus(firstId, 'scheduled');
    const updated = getStoredLeads();
    const found = updated.find((l) => l.id === firstId);
    expect(found?.status).toBe('scheduled');
  });

  it('deletes a lead by ID', () => {
    const leads = getStoredLeads();
    const countBefore = leads.length;
    const firstId = leads[0].id;

    deleteLead(firstId);
    const updated = getStoredLeads();
    expect(updated.length).toBe(countBefore - 1);
    expect(updated.find((l) => l.id === firstId)).toBeUndefined();
  });

  it('generates a test lead and adds it to storage', () => {
    const initialCount = getStoredLeads().length;
    const testLead = generateTestLead();
    expect(testLead).toBeDefined();
    expect(testLead.name).toBeTruthy();
    const updated = getStoredLeads();
    expect(updated.length).toBe(initialCount + 1);
  });

  it('resets demo leads to initial state', () => {
    mockLocalStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify([]));
    const restored = resetDemoLeads();
    expect(restored.length).toBeGreaterThanOrEqual(4);
  });
});
