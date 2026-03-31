import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, problem: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
