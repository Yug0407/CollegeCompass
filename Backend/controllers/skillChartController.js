const User = require("../models/User");

// ================= CHECK IF SKILL CHART EXISTS =================
exports.hasSkillChart = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.json({ exists: false });

  if (user.skillRatings && user.skillRatings.length > 0)
    return res.json({ exists: true });

  return res.json({ exists: false });
};


// ================= SAVE SKILL CHART =================
exports.saveSkillChart = async (req, res) => {
  const { email, ratings } = req.body;
  // ratings = [{skillName:"React", level:7},...]

  const user = await User.findOne({ email });

  if (!user) return res.json({ message: "User not found" });

  user.skillRatings = ratings;
  await user.save();

  res.json({ message: "Skill Chart Saved" });
};


// ================= GET SKILL CHART =================
exports.getSkillChart = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.json([]);

  if (!user.skillRatings) user.skillRatings = [];

  // ---- CREATE MAP OF EXISTING RATINGS ----
  const ratingMap = {};
  user.skillRatings.forEach(s => ratingMap[s.skillName] = s);

  // ---- ADD MISSING SKILLS INTO CHART ----
  user.skills.forEach(skill => {
    if (!ratingMap[skill.name]) {
      user.skillRatings.push({
        skillName: skill.name,
        level: 1,              // default level
        lastUpdated: new Date()
      });
    }
  });

  // ---- DELETE SKILLS THAT WERE REMOVED ----
  user.skillRatings = user.skillRatings.filter(r =>
    user.skills.some(s => s.name === r.skillName)
  );

  await user.save();

  res.json(user.skillRatings);
};
