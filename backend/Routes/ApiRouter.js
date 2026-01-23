const router = require("express").Router();
const { addSkills, findUserSk } = require("../Controllers/addSkill.js");
const LoggedInOnly = require("../Middlewares/LoggedInOnly.js");
const fetchProjects = require("../Controllers/fetchProject.js");
const {
  fetchSinglePost,
  addPost,
  fetchPosts,
  addComment,
  likePost,
} = require("../Controllers/Posts.js");
const addProject = require("../Controllers/addProject.js");
const projectSkills = require("../Controllers/projectSkills.js");
const getTagLines = require("../Controllers/tagline.js");
const uploader = require("../Middlewares/multer_upload.js");
const { uploadShort, getShorts } = require("../Controllers/shortController.js");

router.post("/addskill", LoggedInOnly, addSkills);
router.post("/findskilled", findUserSk);
router.post("/project", LoggedInOnly, uploader("image"), addProject);
router.post("/post", LoggedInOnly, uploader("profileImage"), addPost);
router.get("/fetchposts", fetchPosts);
router.post("/comment", LoggedInOnly, addComment);
router.post("/like", LoggedInOnly, likePost);
router.get("/skillproject", projectSkills);
router.get("/tagline", getTagLines);
router.post("/fetchproject", LoggedInOnly, fetchProjects);
router.post("/load-post", LoggedInOnly, fetchSinglePost);

router.post("/short", LoggedInOnly, uploader("video"), uploadShort);
router.get("/getshort", LoggedInOnly, getShorts);
module.exports = router;
