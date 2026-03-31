import { Router } from "express";
import Progress from "../models/Progress.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/** All problem IDs the user has marked complete */
router.get("/", requireAuth, async (req, res) => {
  try {
    const rows = await Progress.find({ user: req.userId, completed: true }).select(
      "problem"
    );
    const completedIds = rows.map((r) => r.problem.toString());
    res.json({ completedProblemIds: completedIds });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load progress" });
  }
});

router.put("/:problemId", requireAuth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { completed } = req.body;
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "completed must be a boolean" });
    }
    if (completed) {
      await Progress.findOneAndUpdate(
        { user: req.userId, problem: problemId },
        { user: req.userId, problem: problemId, completed: true, completedAt: new Date() },
        { upsert: true, new: true }
      );
    } else {
      await Progress.deleteOne({ user: req.userId, problem: problemId });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

export default router;
