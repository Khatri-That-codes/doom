export type StoryCategory = string;

export type A = {
  id: string;
  cat: string;
  src: number;
  h: string;
  t: string;
  body: string[];
  tick: string[];
  tags: string[];
  ago: string;
  pub: string;
  url: string;
};

export type DailyDrop = {
  topicBadge: string;
  hook: string;
  breakdown: string;
  newsBridge: string;
  question: string;
  options: [string, string];
};

export type PulseFilters = {
  categories: Array<{ id: StoryCategory; label: string; slot?: number; oreAccent?: string; description?: string }>;
  interests: Array<{ id: string; label: string; type?: 'topic' | 'ticker'; categoryId?: StoryCategory }>;
};

type BackendStory = {
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
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4013';

function formatAge(publishedAt: string): string {
  const ageMinutes = Math.max(0, Math.floor((Date.now() - Date.parse(publishedAt)) / 60000));
  if (ageMinutes < 60) return `${ageMinutes}m ago`;
  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) return `${ageHours}h ago`;
  return `${Math.floor(ageHours / 24)}d ago`;
}

function toArticle(story: BackendStory, categories: PulseFilters['categories']): A {
  const summary = story.summary.trim() || story.title;
  const category = categories.find((candidate) => candidate.id === story.category);
  return {
    id: story.id,
    cat: category?.label ?? story.category,
    src: story.sourceCount,
    h: story.title,
    t: summary,
    body: [summary],
    tick: story.tickers,
    tags: story.tags,
    ago: formatAge(story.publishedAt),
    pub: story.source,
    url: story.url
  };
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function getStories(categories: PulseFilters['categories']): Promise<A[]> {
  const result = await getJson<{ stories: BackendStory[] }>('/api/stories');
  return result.stories.map((story) => toArticle(story, categories));
}

export async function getDailyDrop(): Promise<DailyDrop> {
  const result = await getJson<{ drop: DailyDrop }>('/api/daily-drop');
  return result.drop;
}

export async function getPulseFilters(): Promise<PulseFilters> {
  return getJson<PulseFilters>('/api/pulse/filters');
}
