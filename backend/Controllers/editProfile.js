const userModel = require("../Models/User");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { client } = require("../utils/client");

const editProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, skills } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let url;
    if (req.file) {
      const localFilePath = req.file.path;
      const result = await uploadToCloudinary(localFilePath);
      if (!result) {
        return res.status(500).json({ error: "Upload failed" });
      }
      url = result.secure_url;
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;

    if (skills) {
      try {
        user.skills = JSON.parse(skills);
      } catch {
        user.skills = skills;
      }
    }

    if (url) user.image = url;

    await user.save();

    const cacheKey = `user:profile:${userId}`;
    const inspectCacheKey = `user:profile:inspect:${userId}`;
    await client.del(cacheKey);
    await client.del(inspectCacheKey);

    return res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { editProfile };
