const express = require("express");
const {register,login,saveProfile,recommend} = require("../controllers/userController");
const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.post("/save-profile",saveProfile);
router.post("/recommend",recommend);

module.exports = router;
