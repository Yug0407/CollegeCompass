const express = require("express");
const {register,login,saveProfile,recommend,getProfile} = require("../controllers/userController");
const {hasSkillChart,saveSkillChart,getSkillChart} = require("../controllers/skillChartController");
const { getRecommendedInternships } = require("../controllers/intershipController");
const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.post("/save-profile",saveProfile);
router.post("/recommend",recommend);
router.post("/get-profile", getProfile);
router.post("/has-skill-chart", hasSkillChart);
router.post("/save-skill-chart", saveSkillChart);
router.post("/get-skill-chart", getSkillChart);
router.post("/recommended-internships", getRecommendedInternships);

module.exports = router;
