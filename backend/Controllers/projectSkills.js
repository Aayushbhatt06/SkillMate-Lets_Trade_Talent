const Project = require("../Models/projects");

const projectSkills = async (req, res) => {
  try {
    
    const { skills } = req.body;

    let projects = await Project.aggregate([
      {
        $addFields: {
          matchingSkills: { $setIntersection: ["$requiredSkills", skills] },
        },
      },
      {
        $addFields: { matchCount: { $size: "$matchingSkills" } },
      },
      { $sort: { matchCount: -1, createdAt: -1 } },
    ]);

    res.json({ 
      success: true,
      projects
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: "Server error",
      success: false
    });
  }
};

module.exports = projectSkills;
