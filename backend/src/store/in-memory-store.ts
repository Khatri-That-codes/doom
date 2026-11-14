import type { DailyDrop, PulseCard, Story } from "../domain/types.js";

export class InMemoryStore {
  private readonly stories = new Map<string, Story>();
  private readonly pulseCards = new Map<string, PulseCard>();
  private readonly dailyDrops = new Map<string, DailyDrop>();

  saveStory(story: Story): void {
    this.stories.set(story.id, story);
  }

  getStories(category?: Story["category"]): Story[] {
    return [...this.stories.values()]
      .filter((story) => !category || story.category === category)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  savePulseCard(card: PulseCard): void {
    this.pulseCards.set(card.id, card);
  }

  getPulseCards(): PulseCard[] {
    return [...this.pulseCards.values()];
  }

  saveDailyDrop(drop: DailyDrop): void {
    this.dailyDrops.set(drop.releaseDate, drop);
  }

  getDailyDrop(releaseDate: string): DailyDrop | undefined {
    return this.dailyDrops.get(releaseDate);
  }
}
