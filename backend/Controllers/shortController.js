const mongoose = require("mongoose");
const shortsModel = require("../Models/shorts");
const userModel = require("../Models/User");
const { uploadToCloudinary } = require("../utils/cloudinary");

const uploadShort = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { caption, duration } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Short video is required",
      });
    }

    const videoDuration = Number(duration);
    if (!videoDuration || videoDuration > 90) {
      return res.status(400).json({
        success: false,
        message: "Video duration must be 90 seconds or less",
      });
    }

    const localFilePath = req.file.path;
    const uploadResult = await uploadToCloudinary(localFilePath, "video");

    if (!uploadResult || !uploadResult.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Video upload failed",
      });
    }

    const short = await shortsModel.create({
      userId,
      caption: caption?.trim() || "",
      videoUrl: uploadResult.secure_url,
      duration: videoDuration,
    });

    await userModel.findByIdAndUpdate(userId, {
      $push: { shorts: short._id },
    });

    return res.status(201).json({
      success: true,
      message: "Short uploaded successfully",
      short,
    });
  } catch (error) {
    console.error("Upload Short Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading short",
    });
  }
};

const getShorts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const exclude = req.query.exclude;

    let excludeIds = [];
    if (exclude) {
      excludeIds = exclude
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    const shorts = await shortsModel.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds },
        },
      },
      { $sample: { size: limit } },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $unwind: "$user",
      },

      {
        $project: {
          videoUrl: 1,
          caption: 1,
          duration: 1,
          likeCount: 1,
          createdAt: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            image: "$user.image",
          },
        },
      },
    ]);

    const hasMore = shorts.length === limit;

    return res.status(200).json({
      success: true,
      shorts,
      hasMore,
    });
  } catch (error) {
    console.error("Get Shorts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shorts",
    });
  }
};

module.exports = { uploadShort, getShorts };
