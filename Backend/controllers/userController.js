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

    // 1. SEMANTIC FORMATTING: 
    // We convert the array [{name: "React", category: "Web Dev"}] 
    // into a string Gemini can read: "React (Web Dev), Java (Programming)"
    const skillList = Array.isArray(data.skills) 
      ? data.skills.map(s => `${s.name} (${s.category || 'Skill'})`).join(", ")
      : data.skills;

    const prompt = `
      Act as a Career Counselor. Analyze this Student Profile:
      College: ${data.college}
      Branch: ${data.branch}
      CGPA: ${data.cgpa}
      Skills: ${skillList}
      Interests: ${data.interests}
      Achievements: ${data.achievements}

      Provide response in JSON:
      {
        "internships": "best 3 internship types in bullet points",
        "skills": "skill gap explanation based on their categories",
        "roadmap": "3 month roadmap to success"
      }
    `;

    // 2. UPDATED ENDPOINT: Use the correct Google Generative AI endpoint
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    // 3. SAFE PARSING: Extract the text from Google's response structure
    const aiText = response.data.candidates[0].content.parts[0].text;
    
    // Clean JSON formatting from AI response if it includes markdown blocks
    const cleanJson = aiText.replace(/```json|```/g, "").trim();
    
    res.json(JSON.parse(cleanJson));

  } catch (err) {
    console.error("AI Error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI recommendation failed", details: err.message });
  }
};
