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
const maxGeneratedCandidates = 500;

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

function getProxyRankedItems(items: WardrobeItem[], now: Date): WardrobeItem[] {
  return [...items].sort((a, b) => {
    const recencyDiff = getItemRecencyDays(b, now) - getItemRecencyDays(a, now);
    if (recencyDiff !== 0) {
      return recencyDiff;
    }

    if (a.wearCount !== b.wearCount) {
      return a.wearCount - b.wearCount;
    }

    return a.id.localeCompare(b.id);
  });
}

function capItemsByProxy(items: WardrobeItem[], now: Date, limit: number): WardrobeItem[] {
  if (items.length <= limit) {
    return items;
  }
  return getProxyRankedItems(items, now).slice(0, limit);
}

function insertTopCandidate(topCandidates: OutfitCandidate[], candidate: OutfitCandidate, limit: number): void {
  if (topCandidates.length < limit) {
    topCandidates.push(candidate);
    return;
  }

  let worstIndex = 0;
  for (let index = 1; index < topCandidates.length; index += 1) {
    const current = topCandidates[index];
    const worst = topCandidates[worstIndex];
    if (
      current.score < worst.score
      || (current.score === worst.score && current.id.localeCompare(worst.id) > 0)
    ) {
      worstIndex = index;
    }
  }

  const worst = topCandidates[worstIndex];
  const shouldReplace =
    candidate.score > worst.score
    || (candidate.score === worst.score && candidate.id.localeCompare(worst.id) < 0);

  if (shouldReplace) {
    topCandidates[worstIndex] = candidate;
  }
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

  let tops = compatibleItems.filter((item) => item.category === 'Top');
  let bottoms = compatibleItems.filter((item) => item.category === 'Bottom');
  let shoes = compatibleItems.filter((item) => item.category === 'Shoes');
  let outerwear = compatibleItems.filter((item) => item.category === 'Outerwear');

  if (!tops.length || !bottoms.length || !shoes.length) {
    return [];
  }

  const estimateCombinations =
    tops.length * bottoms.length * shoes.length * Math.max(1, outerwear.length + 1);
  const pruningEstimateThreshold = maxGeneratedCandidates * 2;

  if (estimateCombinations > pruningEstimateThreshold) {
    const perCategoryLimit = 16;
    tops = capItemsByProxy(tops, now, perCategoryLimit);
    bottoms = capItemsByProxy(bottoms, now, perCategoryLimit);
    shoes = capItemsByProxy(shoes, now, perCategoryLimit);
    outerwear = capItemsByProxy(outerwear, now, perCategoryLimit);
  }

  const topCandidates: OutfitCandidate[] = [];
  const deduped = new Map<string, OutfitCandidate>();

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const baseItemIds = [top.id, bottom.id, shoe.id];
        const maybeBase = toOutfitCandidate(
          baseItemIds,
          itemsById,
          input.occasion,
          input.temperatureBucket,
          input.temperatureLabel,
          now,
        );
        if (maybeBase && !deduped.has(maybeBase.id)) {
          deduped.set(maybeBase.id, maybeBase);
          insertTopCandidate(topCandidates, maybeBase, maxGeneratedCandidates);
        }

        for (const layer of outerwear) {
          const withLayer = toOutfitCandidate(
            [top.id, bottom.id, shoe.id, layer.id],
            itemsById,
            input.occasion,
            input.temperatureBucket,
            input.temperatureLabel,
            now,
          );
          if (withLayer && !deduped.has(withLayer.id)) {
            deduped.set(withLayer.id, withLayer);
            insertTopCandidate(topCandidates, withLayer, maxGeneratedCandidates);
          }
        }
      }
    }
  }

  return topCandidates;
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

  for (const requiredCategory of requiredCategories) {
    const hasRequiredCategory = nextItemIds.some(
      (itemId) => itemsById[itemId]?.category === requiredCategory,
    );
    if (!hasRequiredCategory) {
      const compatibleFallbackItems = items
        .filter((item) => item.category === requiredCategory)
        .filter((item) => isItemCompatible(item, occasion, temperatureBucket))
        .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

      if (!compatibleFallbackItems.length) {
        return candidate;
      }

      nextItemIds.push(compatibleFallbackItems[0].id);
    }
  }

  return toOutfitCandidate(
    [...new Set(nextItemIds)],
    itemsById,
    occasion,
    temperatureBucket,
    temperatureLabel,
    params.now ?? new Date(),
  );
}
