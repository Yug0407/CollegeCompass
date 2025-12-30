const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Register
exports.register = async (req,res)=>{
  try{
    const {name,email,password} = req.body;

    const userExists = await User.findOne({email});
    if(userExists) return res.json({message:"User already exists"});

    const hash = await bcrypt.hash(password,10);
    const user = await User.create({name,email,password:hash});

    res.json(user);
  }catch(e){
    res.json(e);
  }
};

// Login
exports.login = async(req,res)=>{
  const {email,password}=req.body;
  const user = await User.findOne({email});
  if(!user) return res.json({message:"No user"});

  const match = await bcrypt.compare(password,user.password);
  if(!match) return res.json({message:"Wrong password"});

  const token = jwt.sign({id:user._id},process.env.JWT_SECRET);
  res.json({token,user});
};

// Save Profile
exports.saveProfile = async(req,res)=>{
  try{
  const {email,college,branch,cgpa,skills,interests,achievements} = req.body;
  const user = await User.findOneAndUpdate(
    {email},
    {college,branch,cgpa,skills,interests,achievements},
    {new:true}
  );
  res.json(user);
}catch(e){
  res.status(500).json({message:"Error in Saving Profile" , error: e});
}
};
// Get Profile

exports.getProfile = async(req,res)=>{
  const {email} = req.body;
  const user = await User.findOne({email});
  res.json(user);
};


// AI Recommendation
// AI Recommendation - Updated for Semantic Skill Objects
exports.recommend = async (req, res) => {
  try {
    const data = req.body;

    // 1. SAFETY CHECK: If no data was sent, don't crash the server
    if (!data) return res.status(400).json({ error: "No profile data received" });

    // 2. Format skills safely
    let skillList = "No skills listed";
    if (data.skills && Array.isArray(data.skills)) {
      skillList = data.skills.map(s => `${s.name} (${s.category})`).join(", ");
    } else if (typeof data.skills === 'string') {
      skillList = data.skills;
    }

    const prompt = `
      Analyze this Student Profile:
      College: ${data.college || "N/A"}
      Branch: ${data.branch || "N/A"}
      Skills: ${skillList}
      
      Provide response in STRICT JSON:
      {
        "internships": "Top 3 roles",
        "skills": "Gap analysis",
        "roadmap": "3 month plan"
      }
    `;

    // 3. CALL GEMINI (Using the 2.0-flash model we fixed earlier)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    const aiText = response.data.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json|```/g, "").trim();
    
    res.json(JSON.parse(cleanJson));

  } catch (err) {
    console.error("AI Error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI failed to respond" });
  }
};


exports.hasSkillChart = async(req,res)=>{
  const { email } = req.body;

  const user = await User.findOne({email});

  if(!user) return res.json({exists:false});

  if(user.skillRatings && user.skillRatings.length>0)
    return res.json({exists:true});

  return res.json({exists:false});
};

exports.hasSkillChart = async(req,res)=>{
  const { email } = req.body;

  const user = await User.findOne({email});

  if(!user) return res.json({exists:false});

  if(user.skillRatings && user.skillRatings.length>0)
    return res.json({exists:true});

  return res.json({exists:false});
};

exports.getSkillChart = async(req,res)=>{
  const { email } = req.body;

  const user = await User.findOne({email});

  res.json(user.skillRatings || []);
};


