const projectDB = require("../Models/projects");

const fetchSingleProject = async (req, res) => {
  try {
    const { projId } = req.body;

    if (!projId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await projectDB.findById(projId).populate({
      path: "userId",
      select: "name email image skills",
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("fetchSingleProject error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { fetchSingleProject };
