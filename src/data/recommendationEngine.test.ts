import { rankOutfits, swapCandidateItem } from './recommendationEngine';
import { Occasion, WardrobeItem } from '../types';

const baseItems: WardrobeItem[] = [
  {
    id: 'top-1',
    name: 'Blue Shirt',
    category: 'Top',
    color: 'Blue',
    season: 'All-season',
    occasionTags: ['Work meeting', 'Casual'],
    temperatureRange: ['cold', 'mild'],
    wearCount: 4,
    lastWornDaysAgo: 5,
    lastWornAt: '2026-03-17T00:00:00.000Z',
  },
  {
    id: 'top-2',
    name: 'Black Tee',
    category: 'Top',
    color: 'Black',
    season: 'Warm',
    occasionTags: ['Casual'],
    temperatureRange: ['mild', 'warm'],
    wearCount: 1,
    lastWornDaysAgo: 2,
    lastWornAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'bottom-1',
    name: 'Gray Pants',
    category: 'Bottom',
    color: 'Gray',
    season: 'All-season',
    occasionTags: ['Work meeting'],
    temperatureRange: ['cold', 'mild', 'warm'],
    wearCount: 8,
    lastWornDaysAgo: 7,
    lastWornAt: '2026-03-15T00:00:00.000Z',
  },
  {
    id: 'bottom-2',
    name: 'Beige Chino',
    category: 'Bottom',
    color: 'Beige',
    season: 'Warm',
    occasionTags: ['Casual'],
    temperatureRange: ['mild', 'warm'],
    wearCount: 2,
    lastWornDaysAgo: 10,
    lastWornAt: '2026-03-12T00:00:00.000Z',
  },
  {
    id: 'shoes-1',
    name: 'Loafers',
    category: 'Shoes',
    color: 'Brown',
    season: 'All-season',
    occasionTags: ['Work meeting'],
    temperatureRange: ['cold', 'mild', 'warm'],
    wearCount: 9,
    lastWornDaysAgo: 6,
    lastWornAt: '2026-03-16T00:00:00.000Z',
  },
  {
    id: 'shoes-2',
    name: 'Sneakers',
    category: 'Shoes',
    color: 'White',
    season: 'All-season',
    occasionTags: ['Casual'],
    temperatureRange: ['cold', 'mild', 'warm'],
    wearCount: 3,
    lastWornDaysAgo: 3,
    lastWornAt: '2026-03-19T00:00:00.000Z',
  },
  {
    id: 'outer-1',
    name: 'Wool Coat',
    category: 'Outerwear',
    color: 'Navy',
    season: 'Cool',
    occasionTags: ['Work meeting'],
    temperatureRange: ['cold', 'mild'],
    wearCount: 6,
    lastWornDaysAgo: 11,
    lastWornAt: '2026-03-11T00:00:00.000Z',
  },
];

function itemById(items: WardrobeItem[], itemId: string): WardrobeItem {
  const found = items.find((item) => item.id === itemId);
  if (!found) {
    throw new Error(`Item ${itemId} not found`);
  }
  return found;
}

describe('recommendation engine', () => {
  it('returns top 3 ranked outfits with deterministic order', () => {
    const input = {
      items: baseItems,
      occasion: 'Work meeting' as Occasion,
      temperatureBucket: 'mild' as const,
      temperatureLabel: '66°F · Cloudy',
      now: new Date('2026-03-22T00:00:00.000Z'),
    };

    const firstRun = rankOutfits(input);
    const secondRun = rankOutfits(input);

    expect(firstRun.length).toBeGreaterThan(0);
    expect(firstRun.length).toBeLessThanOrEqual(3);
    expect(firstRun.map((candidate) => candidate.id)).toEqual(
      secondRun.map((candidate) => candidate.id),
    );
  });

  it('filters out incompatible weather and occasion items', () => {
    const coldWorkInput = {
      items: baseItems,
      occasion: 'Work meeting' as Occasion,
      temperatureBucket: 'cold' as const,
      temperatureLabel: '41°F · Clear',
      now: new Date('2026-03-22T00:00:00.000Z'),
    };

    const results = rankOutfits(coldWorkInput);
    expect(results.length).toBeGreaterThan(0);

    const usedIds = new Set(results.flatMap((candidate) => candidate.itemIds));
    expect(usedIds.has('top-2')).toBe(false);
    expect(usedIds.has('bottom-2')).toBe(false);
  });

  it('swap keeps category shape and recomputes with a new item', () => {
    const initial = rankOutfits({
      items: baseItems,
      occasion: 'Casual',
      temperatureBucket: 'mild',
      temperatureLabel: '64°F · Cloudy',
      now: new Date('2026-03-22T00:00:00.000Z'),
    })[0];

    const swapped = swapCandidateItem({
      candidate: initial,
      items: baseItems,
      category: 'Top',
      occasion: 'Casual',
      temperatureBucket: 'mild',
      temperatureLabel: '64°F · Cloudy',
      now: new Date('2026-03-22T00:00:00.000Z'),
    });

    expect(swapped).not.toBeNull();
    if (!swapped) {
      return;
    }

    const initialTop = initial.itemIds
      .map((itemId) => itemById(baseItems, itemId))
      .find((item) => item.category === 'Top');
    const swappedTop = swapped.itemIds
      .map((itemId) => itemById(baseItems, itemId))
      .find((item) => item.category === 'Top');

    expect(initialTop?.id).toBeDefined();
    expect(swappedTop?.id).toBeDefined();
    expect(swappedTop?.category).toBe('Top');
    expect(swappedTop?.id).not.toEqual(initialTop?.id);
  });

  it('falls back gracefully when strict occasion match has no outfits', () => {
    const casualOnlyItems = baseItems.map((item) => ({
      ...item,
      occasionTags: ['Casual'] as Occasion[],
    }));

    const results = rankOutfits({
      items: casualOnlyItems,
      occasion: 'Work meeting',
      temperatureBucket: null,
      temperatureLabel: 'No weather context',
      now: new Date('2026-03-22T00:00:00.000Z'),
    });

    expect(results.length).toBeGreaterThan(0);
  });

  it('does not add incompatible required-category fallback items during swap', () => {
    const items: WardrobeItem[] = [
      {
        id: 'top-1',
        name: 'Alpha Tee',
        category: 'Top',
        color: 'Blue',
        season: 'All-season',
        occasionTags: ['Casual'],
        temperatureRange: ['cold', 'mild'],
        wearCount: 1,
        lastWornDaysAgo: 5,
      },
      {
        id: 'top-2',
        name: 'Beta Tee',
        category: 'Top',
        color: 'Black',
        season: 'All-season',
        occasionTags: ['Casual'],
        temperatureRange: ['cold', 'mild'],
        wearCount: 2,
        lastWornDaysAgo: 7,
      },
      {
        id: 'bottom-1',
        name: 'Relaxed Jeans',
        category: 'Bottom',
        color: 'Indigo',
        season: 'All-season',
        occasionTags: ['Casual'],
        temperatureRange: ['cold', 'mild'],
        wearCount: 3,
        lastWornDaysAgo: 3,
      },
      {
        id: 'outer-1',
        name: 'Rain Shell',
        category: 'Outerwear',
        color: 'Gray',
        season: 'Cool',
        occasionTags: ['Casual'],
        temperatureRange: ['cold'],
        wearCount: 1,
        lastWornDaysAgo: 10,
      },
      {
        id: 'shoes-warm-only',
        name: 'Beach Sandals',
        category: 'Shoes',
        color: 'Tan',
        season: 'Warm',
        occasionTags: ['Casual'],
        temperatureRange: ['warm'],
        wearCount: 0,
        lastWornDaysAgo: 20,
      },
    ];

    const candidateMissingShoes = {
      id: 'top-1|bottom-1|outer-1',
      itemIds: ['top-1', 'bottom-1', 'outer-1'],
      score: 0,
      scoreBreakdown: {
        contextFit: 0,
        wearRotation: 0,
        recencyBoost: 0,
        completeness: 0,
      },
      occasion: 'Casual' as Occasion,
      temperatureLabel: '38°F · Rain',
    };

    const swapped = swapCandidateItem({
      candidate: candidateMissingShoes,
      items,
      category: 'Top',
      occasion: 'Casual',
      temperatureBucket: 'cold',
      temperatureLabel: '38°F · Rain',
      now: new Date('2026-03-22T00:00:00.000Z'),
    });

    expect(swapped).not.toBeNull();
    expect(swapped).toEqual(candidateMissingShoes);
    expect(swapped?.itemIds).toEqual(candidateMissingShoes.itemIds);
    expect(swapped?.itemIds).not.toContain('shoes-warm-only');
  });
});
