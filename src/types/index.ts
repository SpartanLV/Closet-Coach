export const categoryOptions = ['Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory'] as const;
export type WardrobeCategory = (typeof categoryOptions)[number];

export const seasonOptions = ['All-season', 'Warm', 'Cool'] as const;
export type Season = (typeof seasonOptions)[number];

export const temperatureBucketOptions = ['cold', 'mild', 'warm'] as const;
export type TemperatureBucket = (typeof temperatureBucketOptions)[number];

export const occasionOptions = ['Work meeting', 'Social', 'Active', 'Casual'] as const;
export type Occasion = (typeof occasionOptions)[number];

export type CalendarPermissionState = 'unknown' | 'granted' | 'denied' | 'unavailable';

export type WardrobeItem = {
  id: string;
  name: string;
  category: WardrobeCategory;
  color: string;
  season: Season;
  occasionTags: Occasion[];
  temperatureRange?: TemperatureBucket[];
  wearCount: number;
  lastWornDaysAgo: number;
  lastWornAt?: string | null;
};

export type OutfitSuggestion = {
  id: string;
  title: string;
  temperatureLabel: string;
  occasion: Occasion;
  items: string[];
  rationale: string;
  accepted: boolean;
};

export type WearLog = {
  id: string;
  outfitItemIds: string[];
  timestamp: string;
  occasion: Occasion;
  weatherLabel: string;
  // Backward-compatible fields for older sample data/UI modules.
  itemId?: string;
  date?: string;
};

export type WeatherContext = {
  city: string;
  temperatureC: number;
  temperatureF: number;
  temperatureBucket: TemperatureBucket;
  weatherCode: number;
  weatherLabel: string;
  fetchedAt: string;
};

export type ServiceErrorCode =
  | 'invalid_input'
  | 'network_error'
  | 'timeout'
  | 'upstream_error'
  | 'not_found'
  | 'unknown';

export type ServiceError = {
  code: ServiceErrorCode;
  message: string;
  retryable: boolean;
};

export type WeatherContextResult =
  | { ok: true; context: WeatherContext }
  | { ok: false; error: ServiceError };

export type InferredOccasion = {
  occasion: Occasion;
  eventTitle: string;
  startsAt: string;
};

export type AppSettings = {
  city: string;
  calendarPermission: CalendarPermissionState;
  occasionOverride: Occasion | null;
  lastContextRefresh: string | null;
  lastWeatherSnapshot: WeatherContext | null;
};

export type RecommendationScoreBreakdown = {
  contextFit: number;
  wearRotation: number;
  recencyBoost: number;
  completeness: number;
};

export type OutfitCandidate = {
  id: string;
  itemIds: string[];
  score: number;
  scoreBreakdown: RecommendationScoreBreakdown;
  occasion: Occasion;
  temperatureLabel: string;
};

export type RecommendationInput = {
  items: WardrobeItem[];
  occasion: Occasion;
  temperatureBucket: TemperatureBucket | null;
  temperatureLabel: string;
  now?: Date;
};

export type ClosetState = {
  wardrobe: WardrobeItem[];
  wearLogs: WearLog[];
  settings: AppSettings;
};

export interface WeatherService {
  getContext(city: string): Promise<WeatherContext | null>;
  getContextResult(city: string): Promise<WeatherContextResult>;
}

export interface CalendarService {
  getNextOccasion(): Promise<InferredOccasion | null>;
}
