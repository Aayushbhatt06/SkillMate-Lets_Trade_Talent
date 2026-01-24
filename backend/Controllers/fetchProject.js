const projectDB = require("../Models/projects");
const userModel = require("../Models/User");
const { client } = require("../utils/client");

const fetchProjects = async (req, res) => {
  try {
    const { page = 0, limit = 10 } = req.body;
    const userId = req.user._id;

    const cacheKey = `projects:feed:${userId}:page:${page}:limit:${limit}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.json({
        success: true,
        Projects: parsed,
        hasMore: parsed.length === limit,
        fromCache: true,
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const skills = user.skills || [];
    const skip = page * limit;

    const matchedProjects = await projectDB.aggregate([
      {
        $addFields: {
          matchingSkillsCount: {
            $size: {
              $setIntersection: ["$requiredSkills", skills],
            },
          },
        },
      },
      { $match: { matchingSkillsCount: { $gt: 0 } } },
      { $sort: { matchingSkillsCount: -1, _id: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    let projects = matchedProjects;

    if (projects.length < limit) {
      const matchedIds = projects.map((p) => p._id);
      const remaining = limit - projects.length;

      const fallbackProjects = await projectDB
        .find({ _id: { $nin: matchedIds } })
        .sort({ _id: -1 })
        .skip(Math.max(0, skip - matchedProjects.length))
        .limit(remaining);

      projects = [...projects, ...fallbackProjects];
    }

    const populated = await projectDB.populate(projects, {
      path: "userId",
      select: "name email image skills",
    });

    await client.set(cacheKey, JSON.stringify(populated), {
      EX: 60 * 10, // 10 minutes
    });

    return res.json({
      success: true,
      Projects: populated,
      hasMore: populated.length === limit,
      fromCache: false,
    });
  } catch (err) {
    console.error("fetchProjects error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = fetchProjects;
