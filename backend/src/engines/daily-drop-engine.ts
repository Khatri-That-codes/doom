import type { DailyDrop } from "../domain/types.js";
import { InMemoryStore } from "../store/in-memory-store.js";

export class DailyDropEngine {
  public constructor(private readonly store: InMemoryStore) {}

  getOrCreate(date = new Date()): DailyDrop {
    const releaseDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
    const existing = this.store.getDailyDrop(releaseDate);
    if (existing) {
      return existing;
    }

    const drop: DailyDrop = {
      id: `drop_${releaseDate}`,
      releaseDate,
      topicBadge: "Behavioral Economics",
      hook: "What if the easiest choice is quietly shaping every choice after it?",
      breakdown:
        "Small defaults influence behavior because they reduce the effort required to decide. " +
        "That convenience is not inherently good or bad; its impact depends on who set the default, " +
        "what information is visible, and how easy it is to choose another path. Understanding defaults " +
        "helps us design calmer products and notice when convenience has become invisible persuasion.",
      newsBridge: "This idea appears whenever a new product changes what people see first, skip, or accept.",
      question: "Should digital defaults be designed primarily for convenience or user control?",
      options: ["Convenience", "User control"]
    };

    this.store.saveDailyDrop(drop);
    return drop;
  }
}
