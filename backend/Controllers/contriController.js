const contriModel = require("../Models/Proj_Contri");
const projectModel = require("../Models/projects");
const { client } = require("../utils/client");

const sendContriReq = async (req, res) => {
  try {
    const { projId } = req.body;
    const userId = req.user._id;

    if (!projId) {
      return res.status(400).json({
        message: "Project ID not provided",
        success: false,
      });
    }

    const project = await projectModel.findById(projId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        success: false,
      });
    }
    if (project.fulfilled) {
      return res.status(400).json({
        message: "This project is already fulfilled",
        success: false,
      });
    }

    if (project.userId.toString() === userId.toString()) {
      return res.status(403).json({
        message: "You cannot contribute to your own project",
        success: false,
      });
    }

    const existingReq = await contriModel.findOne({
      user: userId,
      proj: projId,
    });

    if (existingReq) {
      return res.status(409).json({
        message: "Contribution request already exists",
        success: false,
      });
    }

    const newContribution = await contriModel.create({
      user: userId,
      proj: projId,
      status: "pending",
    });

    return res.status(201).json({
      message: "Successfully requested for contribution",
      success: true,
      data: newContribution,
    });
  } catch (error) {
    console.error("Contribution request error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
const updateContributionsCache = async ({ ownerId, contriId, newStatus }) => {
  const cacheKey = `contributions:${ownerId}`;
  const cached = await client.get(cacheKey);
  if (!cached) return;

  const parsed = JSON.parse(cached);

  parsed.data = parsed.data.map((project) => {
    return {
      ...project,
      contributors: project.contributors
        .map((c) => {
          if (c.contriId.toString() !== contriId.toString()) return c;
          return { ...c, status: newStatus };
        })
        .filter((c) => c.status !== "rejected"),
    };
  });

  await client.setEx(cacheKey, 5 * 60, JSON.stringify(parsed));
};

const acceptContribution = async (req, res) => {
  try {
    const { contriId } = req.body;
    const userId = req.user._id;

    if (!contriId) {
      return res.status(400).json({
        message: "Contribution ID not provided",
        success: false,
      });
    }

    const contribution = await contriModel.findById(contriId).populate("proj");

    if (!contribution) {
      return res.status(404).json({
        message: "Contribution request not found",
        success: false,
      });
    }
    if (contribution.proj.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to accept this request",
        success: false,
      });
    }

    if (contribution.status !== "pending") {
      return res.status(400).json({
        message: `Contribution already ${contribution.status}`,
        success: false,
      });
    }

    contribution.status = "accepted";
    await contribution.save();

    await updateContributionsCache({
      ownerId: userId,
      contriId,
      newStatus: "accepted",
    });

    return res.status(200).json({
      message: "Contribution request accepted",
      success: true,
      data: contribution,
    });
  } catch (error) {
    console.error("Accept contribution error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const getMyProjectContributions = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `contributions:${userId}`;
    const cachedContributions = await client.get(cacheKey);
    if (cachedContributions) {
      return res.status(200).json(JSON.parse(cachedContributions));
    }
    const projects = await projectModel.find({ userId });

    if (!projects.length) {
      const emptyResponse = { success: true, data: [] };
      await client.setEx(cacheKey, 300, JSON.stringify(emptyResponse));
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const projectIds = projects.map((p) => p._id);

    const contributions = await contriModel
      .find({
        proj: { $in: projectIds },
        status: { $ne: "rejected" },
      })
      .populate("user", "name image");

    const projectMap = new Map();

    projects.forEach((proj) => {
      projectMap.set(proj._id.toString(), {
        _id: proj._id,
        title: proj.name,
        description: proj.description,
        contributors: [],
      });
    });

    contributions.forEach((contri) => {
      const projId = contri.proj.toString();

      if (!projectMap.has(projId)) return;

      projectMap.get(projId).contributors.push({
        contriId: contri._id,
        userId: contri.user._id,
        name: contri.user.name,
        image: contri.user.image,
        status: contri.status,
        requestedAt: contri.createdAt,
      });
    });
    const response = {
      success: true,
      data: Array.from(projectMap.values()),
    };
    await client.setEx(cacheKey, 300, JSON.stringify(response));
    return res.status(200).json(response);
  } catch (error) {
    console.error("Get contributions error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const rejectContribution = async (req, res) => {
  try {
    const { contriId } = req.body;
    const userId = req.user._id;

    if (!contriId) {
      return res.status(400).json({
        message: "Contribution ID not provided",
        success: false,
      });
    }

    const contribution = await contriModel.findById(contriId).populate("proj");

    if (!contribution) {
      return res.status(404).json({
        message: "Contribution request not found",
        success: false,
      });
    }

    if (contribution.proj.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to reject this request",
        success: false,
      });
    }

    if (contribution.status !== "pending") {
      return res.status(400).json({
        message: `Contribution already ${contribution.status}`,
        success: false,
      });
    }

    contribution.status = "rejected";
    await contribution.save();

    await updateContributionsCache({
      ownerId: userId,
      contriId,
      newStatus: "rejected",
    });

    return res.status(200).json({
      message: "Contribution request rejected",
      success: true,
      data: contribution,
    });
  } catch (error) {
    console.error("Reject contribution error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  sendContriReq,
  acceptContribution,
  getMyProjectContributions,
  rejectContribution,
};
