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
  const {email,college,branch,cgpa,skills,interests,achievements} = req.body;
  const user = await User.findOneAndUpdate(
    {email},
    {college,branch,cgpa,skills,interests,achievements},
    {new:true}
  );
  res.json(user);
};

// AI Recommendation
exports.recommend = async(req,res)=>{
  try{
    const data = req.body;

    const prompt = `
Student Profile:
College: ${data.college}
Branch: ${data.branch}
CGPA: ${data.cgpa}
Skills: ${data.skills}
Interests: ${data.interests}
Achievements: ${data.achievements}

Provide response in JSON:
{
 "internships": "best 3 internship types in bullet points",
 "skills": "skill gap explanation",
 "roadmap": "3 month roadmap"
}
`;

    const response = await axios.post(
      "https://api.gemini.com/v1/generate",
      {prompt},
      {headers:{Authorization:`Bearer ${process.env.GEMINI_KEY}`}}
    );

    res.json(response.data);
  }catch(err){
    res.json(err);
  }
};
