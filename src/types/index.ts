export type WardrobeItem = {
  id: string;
  name: string;
  category: 'Top' | 'Bottom' | 'Outerwear' | 'Shoes' | 'Accessory';
  color: string;
  season: 'All-season' | 'Warm' | 'Cool';
  wearCount: number;
  lastWornDaysAgo: number;
};

export type OutfitSuggestion = {
  id: string;
  title: string;
  temperatureLabel: string;
  occasion: string;
  items: string[];
  rationale: string;
  accepted: boolean;
};

export type WearLog = {
  id: string;
  itemId: string;
  date: string;
  occasion: string;
};
