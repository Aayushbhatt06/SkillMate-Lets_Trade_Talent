const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Post", "Short"],
      required: true,
    },
  },
  { timestamps: true },
);

// prevents duplicate likes
likeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);
