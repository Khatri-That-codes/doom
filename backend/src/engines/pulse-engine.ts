import type { PulseCard, Story } from "../domain/types.js";
import { InMemoryStore } from "../store/in-memory-store.js";

export class PulseEngine {
  public constructor(private readonly store: InMemoryStore) {}

  createCard(story: Story, interest: string): PulseCard {
    const card: PulseCard = {
      id: `pulse_${story.id}_${interest.toLowerCase().replace(/\s+/g, "-")}`,
      storyId: story.id,
      headline: story.title,
      summary: this.toCardSummary(story.summary || story.title),
      interest,
      source: story.source,
      sourceUrl: story.url
    };

    this.store.savePulseCard(card);
    return card;
  }

  private toCardSummary(text: string): string {
    const words = text.split(/\s+/).filter(Boolean);
    return words.slice(0, 80).join(" ");
  }
}
