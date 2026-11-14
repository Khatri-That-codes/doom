export type StoryCategory = string;

export interface Story {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: StoryCategory;
  publishedAt: string;
  tickers: string[];
  tags: string[];
  sourceCount: number;
}

export interface PulseCard {
  id: string;
  storyId: string;
  headline: string;
  summary: string;
  interest: string;
  source: string;
  sourceUrl: string;
}

export interface DailyDrop {
  id: string;
  releaseDate: string;
  source: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: StoryCategory;
  pollIntervalMinutes: number;
}

export interface PulseFilter {
  id: string;
  label: string;
  keywords: string[];
  type?: "topic" | "ticker";
  categoryId?: StoryCategory;
}

export interface PulseFilters {
  categories: StoryCategoryDefinition[];
  interests: PulseFilter[];
}

export interface StoryCategoryDefinition {
  id: StoryCategory;
  label: string;
  slot?: number;
  oreAccent?: string;
  description?: string;
  aliases?: string[];
}
