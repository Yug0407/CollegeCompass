const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  location: String,
  link: String,
  
  requiredSkills: [String],
  minLevel: Number,

  category: String,
  stipend: String,
  duration: String,
});

module.exports = mongoose.model("Internship", internshipSchema);
