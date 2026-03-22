import {
  Occasion,
  OutfitCandidate,
  RecommendationInput,
  RecommendationScoreBreakdown,
  Season,
  TemperatureBucket,
  WardrobeCategory,
  WardrobeItem,
} from '../types';
import { daysSinceIso } from '../utils/date';

const requiredCategories: Array<WardrobeCategory> = ['Top', 'Bottom', 'Shoes'];
const swappableCategories: Array<WardrobeCategory> = ['Top', 'Bottom', 'Shoes', 'Outerwear'];

const seasonBucketMap: Record<Season, TemperatureBucket[]> = {
  'All-season': ['cold', 'mild', 'warm'],
  Warm: ['mild', 'warm'],
  Cool: ['cold', 'mild'],
};

export function getSeasonTemperatureRange(season: Season): TemperatureBucket[] {
  return seasonBucketMap[season];
}

export function getItemRecencyDays(item: WardrobeItem, now: Date): number {
  if (item.lastWornAt) {
    return daysSinceIso(item.lastWornAt, now);
  }
  return item.lastWornDaysAgo;
}

function getItemTemperatureRange(item: WardrobeItem): TemperatureBucket[] {
  if (item.temperatureRange?.length) {
    return item.temperatureRange;
  }
  return getSeasonTemperatureRange(item.season);
}

function isOccasionCompatible(item: WardrobeItem, occasion: Occasion): boolean {
  if (!item.occasionTags.length) {
    return true;
  }
  return item.occasionTags.includes(occasion);
}

function isTemperatureCompatible(
  item: WardrobeItem,
  temperatureBucket: TemperatureBucket | null,
): boolean {
  if (!temperatureBucket) {
    return true;
  }
  return getItemTemperatureRange(item).includes(temperatureBucket);
}

export function isItemCompatible(
  item: WardrobeItem,
  occasion: Occasion,
  temperatureBucket: TemperatureBucket | null,
  ignoreOccasion: boolean = false,
): boolean {
  if (!isTemperatureCompatible(item, temperatureBucket)) {
    return false;
  }
  if (ignoreOccasion) {
    return true;
  }
  return isOccasionCompatible(item, occasion);
}

function getItemIdsByCategory(itemIds: string[], itemsById: Record<string, WardrobeItem>) {
  const output: Partial<Record<WardrobeCategory, string>> = {};
  itemIds.forEach((itemId) => {
    const item = itemsById[itemId];
    if (item) {
      output[item.category] = itemId;
    }
  });
  return output;
}

function scoreCandidate(
  candidateItems: WardrobeItem[],
  occasion: Occasion,
  temperatureBucket: TemperatureBucket | null,
  now: Date,
): RecommendationScoreBreakdown {
  const contextFit = candidateItems.reduce((sum, item) => {
    if (!item.occasionTags.length) {
      return sum + 4;
    }
    return sum + (item.occasionTags.includes(occasion) ? 10 : 0);
  }, 0);

  const wearRotation = candidateItems.reduce((sum, item) => sum + 12 / (item.wearCount + 1), 0);

  const recencyBoost = candidateItems.reduce((sum, item) => {
    const recency = Math.min(getItemRecencyDays(item, now), 30);
    return sum + recency / 3;
  }, 0);

  const hasOuterwear = candidateItems.some((item) => item.category === 'Outerwear');
  let completeness = 12;
  if (temperatureBucket === 'cold' && !hasOuterwear) {
    completeness -= 10;
  }
  if (temperatureBucket === 'warm' && hasOuterwear) {
    completeness -= 2;
  }

  return {
    contextFit,
    wearRotation,
    recencyBoost,
    completeness,
  };
}

function toOutfitCandidate(
  itemIds: string[],
  itemsById: Record<string, WardrobeItem>,
  occasion: Occasion,
  temperatureBucket: TemperatureBucket | null,
  temperatureLabel: string,
  now: Date,
): OutfitCandidate | null {
  const candidateItems = itemIds
    .map((itemId) => itemsById[itemId])
    .filter((item): item is WardrobeItem => Boolean(item));

  if (candidateItems.length < 3) {
    return null;
  }

  const breakdown = scoreCandidate(candidateItems, occasion, temperatureBucket, now);
  const score = breakdown.contextFit + breakdown.wearRotation + breakdown.recencyBoost + breakdown.completeness;

  return {
    id: itemIds.join('|'),
    itemIds,
    score,
    scoreBreakdown: breakdown,
    occasion,
    temperatureLabel,
  };
}

function buildCandidates(
  input: RecommendationInput,
  ignoreOccasion: boolean,
): OutfitCandidate[] {
  const now = input.now ?? new Date();
  const itemsById = Object.fromEntries(input.items.map((item) => [item.id, item]));
  const compatibleItems = input.items.filter((item) =>
    isItemCompatible(item, input.occasion, input.temperatureBucket, ignoreOccasion),
  );

  const tops = compatibleItems.filter((item) => item.category === 'Top');
  const bottoms = compatibleItems.filter((item) => item.category === 'Bottom');
  const shoes = compatibleItems.filter((item) => item.category === 'Shoes');
  const outerwear = compatibleItems.filter((item) => item.category === 'Outerwear');

  if (!tops.length || !bottoms.length || !shoes.length) {
    return [];
  }

  const candidates: OutfitCandidate[] = [];
  tops.forEach((top) => {
    bottoms.forEach((bottom) => {
      shoes.forEach((shoe) => {
        const baseItemIds = [top.id, bottom.id, shoe.id];
        const maybeBase = toOutfitCandidate(
          baseItemIds,
          itemsById,
          input.occasion,
          input.temperatureBucket,
          input.temperatureLabel,
          now,
        );
        if (maybeBase) {
          candidates.push(maybeBase);
        }

        outerwear.forEach((layer) => {
          const withLayer = toOutfitCandidate(
            [top.id, bottom.id, shoe.id, layer.id],
            itemsById,
            input.occasion,
            input.temperatureBucket,
            input.temperatureLabel,
            now,
          );
          if (withLayer) {
            candidates.push(withLayer);
          }
        });
      });
    });
  });

  const deduped = new Map<string, OutfitCandidate>();
  candidates.forEach((candidate) => {
    deduped.set(candidate.id, candidate);
  });
  return [...deduped.values()];
}

export function rankOutfits(input: RecommendationInput): OutfitCandidate[] {
  const strictCandidates = buildCandidates(input, false);
  const fallbackCandidates = strictCandidates.length ? strictCandidates : buildCandidates(input, true);

  return fallbackCandidates
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.id.localeCompare(b.id)))
    .slice(0, 3);
}

export function swapCandidateItem(params: {
  candidate: OutfitCandidate;
  items: WardrobeItem[];
  category: WardrobeCategory;
  occasion: Occasion;
  temperatureBucket: TemperatureBucket | null;
  temperatureLabel: string;
  now?: Date;
}): OutfitCandidate | null {
  const { candidate, items, category, occasion, temperatureBucket, temperatureLabel } = params;
  if (!swappableCategories.includes(category)) {
    return candidate;
  }

  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
  const itemIdsByCategory = getItemIdsByCategory(candidate.itemIds, itemsById);
  const currentId = itemIdsByCategory[category];

  const eligible = items
    .filter((item) => item.category === category)
    .filter((item) => isItemCompatible(item, occasion, temperatureBucket))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!eligible.length) {
    return candidate;
  }

  let nextId = eligible[0].id;
  if (currentId) {
    const currentIndex = eligible.findIndex((item) => item.id === currentId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % eligible.length : 0;
    nextId = eligible[nextIndex].id;
    if (nextId === currentId && eligible.length === 1) {
      return candidate;
    }
  }

  const nextItemIds = [...candidate.itemIds];
  const targetIndex = nextItemIds.findIndex((itemId) => itemsById[itemId]?.category === category);
  if (targetIndex >= 0) {
    nextItemIds[targetIndex] = nextId;
  } else if (category === 'Outerwear') {
    nextItemIds.push(nextId);
  }

  requiredCategories.forEach((requiredCategory) => {
    const hasRequiredCategory = nextItemIds.some(
      (itemId) => itemsById[itemId]?.category === requiredCategory,
    );
    if (!hasRequiredCategory) {
      const fallbackItem = items.find((item) => item.category === requiredCategory);
      if (fallbackItem) {
        nextItemIds.push(fallbackItem.id);
      }
    }
  });

  return toOutfitCandidate(
    [...new Set(nextItemIds)],
    itemsById,
    occasion,
    temperatureBucket,
    temperatureLabel,
    params.now ?? new Date(),
  );
}

