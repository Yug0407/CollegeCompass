const express = require("express");
const {register,login,saveProfile,recommend,getProfile} = require("../controllers/userController");
const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.post("/save-profile",saveProfile);
router.post("/recommend",recommend);
router.post("/get-profile", getProfile);


module.exports = router;
