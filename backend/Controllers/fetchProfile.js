const UserModel = require("../Models/User");
const postModel = require("../Models/posts");
const projectModel = require("../Models/projects");
const { client } = require("../utils/client");

const fetchProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `user:profile:${userId}`;
    const cachedProfile = await client.get(cacheKey);
    if (cachedProfile) {
      return res.json({
        success: true,
        ...JSON.parse(cachedProfile),
        fromCache: true,
      });
    }

    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const posts = await postModel.find({ userId }).sort({ createdAt: -1 });
    const projects = await projectModel
      .find({ userId })
      .sort({ createdAt: -1 });

    const responseData = {
      success: true,
      user: user.toObject(),
      posts,
      projects,
    };

    await client.set(cacheKey, JSON.stringify(responseData), {
      EX: 60 * 15,
    });

    return res.json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const fetchInspectProfile = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(404).json({
        message: "Id not provided",
        success: false,
      });
    }

    const cacheKey = `user:profile:inspect:${id}`;

    const cachedProfile = await client.get(cacheKey);
    if (cachedProfile) {
      return res.json({
        ...JSON.parse(cachedProfile),
        fromCache: true,
      });
    }

    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const posts = await postModel.find({ userId: id }).sort({ createdAt: -1 });
    const projects = await projectModel
      .find({ userId: id })
      .sort({ createdAt: -1 });

    const responseData = {
      success: true,
      user: user.toObject(),
      posts,
      projects,
    };

    await client.set(cacheKey, JSON.stringify(responseData), {
      EX: 60 * 5,
    });

    return res.json(responseData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

module.exports = { fetchProfile, fetchInspectProfile };
