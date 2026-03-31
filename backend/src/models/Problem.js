import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    chapter: { type: String, required: true, trim: true },
    chapterOrder: { type: Number, required: true },
    topic: { type: String, required: true, trim: true },
    topicOrder: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    youtubeUrl: { type: String, default: "" },
    leetcodeUrl: { type: String, default: "" },
    codeforcesUrl: { type: String, default: "" },
    articleUrl: { type: String, default: "" },
    level: { type: String, enum: ["Easy", "Medium", "Tough"], required: true },
  },
  { timestamps: true }
);

problemSchema.index({ chapterOrder: 1, topicOrder: 1, order: 1 });

export default mongoose.model("Problem", problemSchema);
