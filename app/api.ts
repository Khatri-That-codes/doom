export type StoryCategory = 'trending' | 'tech' | 'business' | 'stocks' | 'world';

export type A = {
  id: string;
  cat: 'Trending' | 'Tech' | 'Business' | 'Stocks' | 'World';
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

type BackendStory = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: StoryCategory;
  publishedAt: string;
  tickers: string[];
  sourceCount: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const categoryLabels: Record<StoryCategory, A['cat']> = {
  trending: 'Trending',
  tech: 'Tech',
  business: 'Business',
  stocks: 'Stocks',
  world: 'World'
};

function formatAge(publishedAt: string): string {
  const ageMinutes = Math.max(0, Math.floor((Date.now() - Date.parse(publishedAt)) / 60000));
  if (ageMinutes < 60) return `${ageMinutes}m ago`;
  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) return `${ageHours}h ago`;
  return `${Math.floor(ageHours / 24)}d ago`;
}

function toArticle(story: BackendStory): A {
  const summary = story.summary.trim() || story.title;
  return {
    id: story.id,
    cat: categoryLabels[story.category],
    src: story.sourceCount,
    h: story.title,
    t: summary,
    body: [summary],
    tick: story.tickers,
    tags: story.tickers,
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

export async function getStories(): Promise<A[]> {
  const result = await getJson<{ stories: BackendStory[] }>('/api/stories');
  return result.stories.map(toArticle);
}

export async function getDailyDrop(): Promise<DailyDrop> {
  const result = await getJson<{ drop: DailyDrop }>('/api/daily-drop');
  return result.drop;
}
