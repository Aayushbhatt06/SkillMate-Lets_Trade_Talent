const mongoose = require("mongoose");

const shortSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      max: 90,
      required: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Short", shortSchema);
