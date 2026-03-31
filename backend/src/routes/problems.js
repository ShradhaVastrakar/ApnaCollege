import { Router } from "express";
import Problem from "../models/Problem.js";

const router = Router();

/** Public: structured tree for the DSA sheet */
router.get("/", async (_req, res) => {
  try {
    const problems = await Problem.find().sort({
      chapterOrder: 1,
      topicOrder: 1,
      order: 1,
    });
    const chaptersMap = new Map();
    for (const p of problems) {
      const chKey = `${p.chapterOrder}::${p.chapter}`;
      if (!chaptersMap.has(chKey)) {
        chaptersMap.set(chKey, {
          chapter: p.chapter,
          chapterOrder: p.chapterOrder,
          topics: new Map(),
        });
      }
      const ch = chaptersMap.get(chKey);
      const tKey = `${p.topicOrder}::${p.topic}`;
      if (!ch.topics.has(tKey)) {
        ch.topics.set(tKey, {
          topic: p.topic,
          topicOrder: p.topicOrder,
          problems: [],
        });
      }
      ch.topics.get(tKey).problems.push({
        id: p._id,
        title: p.title,
        order: p.order,
        youtubeUrl: p.youtubeUrl,
        leetcodeUrl: p.leetcodeUrl,
        codeforcesUrl: p.codeforcesUrl,
        articleUrl: p.articleUrl,
        level: p.level,
      });
    }
    const chapters = [...chaptersMap.values()].sort(
      (a, b) => a.chapterOrder - b.chapterOrder
    );
    for (const ch of chapters) {
      ch.topics = [...ch.topics.values()].sort(
        (a, b) => a.topicOrder - b.topicOrder
      );
      for (const t of ch.topics) {
        t.problems.sort((a, b) => a.order - b.order);
      }
    }
    res.json({ chapters });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load problems" });
  }
});

export default router;
