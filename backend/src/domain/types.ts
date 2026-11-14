export type StoryCategory = "trending" | "tech" | "business" | "stocks" | "world";

export interface Story {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: StoryCategory;
  publishedAt: string;
  tickers: string[];
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
  topicBadge: string;
  hook: string;
  breakdown: string;
  newsBridge: string;
  question: string;
  options: [string, string];
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: StoryCategory;
  pollIntervalMinutes: number;
}
