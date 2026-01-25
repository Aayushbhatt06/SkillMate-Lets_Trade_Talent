const postModel = require("../Models/posts");
const Like = require("../Models/Like");
const Comment = require("../Models/Comments");
const { uploadToCloudinary } = require("../utils/cloudinary");
const mongoose = require("mongoose");
const { client } = require("../utils/client");

const addPost = async (req, res) => {
  try {
    const { title, desc } = req.body;
    const user = req.user;

    if (!title || !desc) {
      return res.status(400).json({
        message: "Title and description are required",
        success: false,
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

    const post = new postModel({
      title,
      desc,
      image: url || null,
      userId: user._id,
      like: 0,
    });

    await post.save();
    const populatedPost = await post.populate("userId", "name email image");

    return res.status(200).json({
      message: "Post added successfully",
      success: true,
      post: populatedPost,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server not responding",
      success: false,
      error: err.message,
    });
  }
};

const fetchPosts = async (req, res) => {
  try {
    const limit = 20;

    const cacheKey = "posts:feed:random";
    const counterKey = "posts:feed:random:count";

    const count = await client.incr(counterKey);

    if (count === 1) {
      await client.expire(counterKey, 60 * 10);
    }

    if (count <= 3) {
      const cached = await client.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          posts: JSON.parse(cached),
          fromCache: true,
          refreshCount: count,
        });
      }
    }

    const postsAgg = await postModel.aggregate([
      { $sample: { size: limit } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
    ]);

    const posts = await postModel.populate(postsAgg, {
      path: "userId",
      select: "name email image",
    });

    await client.set(cacheKey, JSON.stringify(posts), {
      EX: 60 * 10,
    });

    await client.set(counterKey, 1, {
      EX: 60 * 10,
    });

    return res.status(200).json({
      success: true,
      posts,
      fromCache: false,
      refreshCount: 3,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server not responding",
      success: false,
      error: err.message,
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const user = req.user;

    if (!postId || !comment) {
      return res.status(400).json({
        message: "Post ID and comment are required",
        success: false,
      });
    }

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await Comment.create({
      postId,
      userId: user._id,
      username: user.name,
      text: comment,
      pic: user.image,
    });

    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Comment added successfully",
      success: true,
      post: {
        ...post.toObject(),
        comments,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server not responding",
      success: false,
      error: err.message,
    });
  }
};

const likePost = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({
        message: "Post Id is required",
        success: false,
      });
    }

    const cacheKey = "posts:feed:random";

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    const existingLike = await Like.findOne({
      userId,
      targetId: postId,
      targetType: "Post",
    });

    let liked;

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      post.like = Math.max(post.like - 1, 0);
      liked = false;
    } else {
      await Like.create({
        userId,
        targetId: postId,
        targetType: "Post",
      });
      post.like += 1;
      liked = true;
    }

    await post.save();

    // 🔥 UPDATE CACHED FEED IN-PLACE
    const cachedPosts = await client.get(cacheKey);
    if (cachedPosts) {
      try {
        const posts = JSON.parse(cachedPosts);

        const updatedPosts = posts.map((p) => {
          if (p._id.toString() === postId.toString()) {
            return {
              ...p,
              like: post.like,
              likedByMe: liked,
            };
          }
          return p;
        });

        await client.set(cacheKey, JSON.stringify(updatedPosts), {
          EX: 60 * 10,
        });
      } catch (e) {
        // safety fallback
        await client.del(cacheKey);
      }
    }

    const updatedPost = await postModel
      .findById(postId)
      .populate("userId", "name email image");

    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: liked ? "Like added successfully" : "Like removed",
      success: true,
      updatedPost: {
        ...updatedPost.toObject(),
        comments,
        likedByMe: liked,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};


const fetchSinglePost = async (req, res) => {
  try {
    const { postId } = req.body;

    const post = await postModel
      .findById(postId)
      .populate("userId", "name email image");

    if (!post) {
      return res.status(404).json({
        message: "Post Not Found",
        status: false,
      });
    }

    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Post Fetched Successfully",
      status: true,
      post,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something Went Wrong",
      status: false,
    });
  }
};

module.exports = {
  fetchSinglePost,
  addPost,
  fetchPosts,
  addComment,
  likePost,
};
