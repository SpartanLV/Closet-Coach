import { OutfitSuggestion, WardrobeItem, WearLog } from '../types';

export const sampleItems: WardrobeItem[] = [
  {
    id: '1',
    name: 'Cream Blazer',
    category: 'Outerwear',
    color: 'Cream',
    season: 'All-season',
    wearCount: 8,
    lastWornDaysAgo: 6,
  },
  {
    id: '2',
    name: 'Black Trousers',
    category: 'Bottom',
    color: 'Black',
    season: 'All-season',
    wearCount: 12,
    lastWornDaysAgo: 3,
  },
  {
    id: '3',
    name: 'Silk Shell Top',
    category: 'Top',
    color: 'Champagne',
    season: 'Warm',
    wearCount: 4,
    lastWornDaysAgo: 14,
  },
  {
    id: '4',
    name: 'Leather Loafers',
    category: 'Shoes',
    color: 'Espresso',
    season: 'All-season',
    wearCount: 15,
    lastWornDaysAgo: 2,
  },
];

export const sampleSuggestions: OutfitSuggestion[] = [
  {
    id: 'look-1',
    title: 'Client Meeting Confidence',
    temperatureLabel: '72°F · Dry',
    occasion: 'Work meeting',
    items: ['Cream Blazer', 'Silk Shell Top', 'Black Trousers', 'Leather Loafers'],
    rationale: 'Balances polish with comfort, and rotates in an underused top.',
    accepted: true,
  },
  {
    id: 'look-2',
    title: 'Hybrid Workday',
    temperatureLabel: '68°F · Breezy',
    occasion: 'Office + commute',
    items: ['Cream Blazer', 'Black Trousers'],
    rationale: 'Built around your most reliable professional layers.',
    accepted: false,
  },
];

export const sampleWearLogs: WearLog[] = [
  { id: 'wear-1', itemId: '1', date: '2026-03-18', occasion: 'Client meeting' },
  { id: 'wear-2', itemId: '2', date: '2026-03-18', occasion: 'Client meeting' },
  { id: 'wear-3', itemId: '4', date: '2026-03-20', occasion: 'Office day' },
];
