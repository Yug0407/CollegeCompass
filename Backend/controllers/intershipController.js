const axios = require("axios");
const User = require("../models/User");

let cachedData = null;
let lastFetchTime = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function calculateMatchScores(user, internships) {
  let results = [];

  internships.forEach(job => {
    let score = 0;
    let total = 0;

    job.job_required_skills?.forEach(reqSkill => {
      total += 9;

      const found = user.skillRatings.find(
        s => s.skillName.toLowerCase() === reqSkill.toLowerCase()
      );

      if (found) score += found.level;
    });

    if (total === 0) {
  results.push({
    title: job.job_title,
    company: job.employer_name,
    location: job.job_city || "Remote",
    description: job.job_description,
    skills: job.job_required_skills || [],
    link: job.job_apply_link,
    matchScore: 50   // neutral default
  });
  return;
}


    const matchScore = Math.round((score / total) * 100);

    results.push({
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city || "Remote",
      description: job.job_description,
      skills: job.job_required_skills || [],
      link: job.job_apply_link,
      matchScore
    });
  });

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}


exports.getRecommendedInternships = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.skills.length) return res.json([]);

  // ===== CACHE CHECK =====
  if (cachedData && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
    console.log("Serving internships from cache 😊");

    return res.json(
      calculateMatchScores(user, cachedData)
    );
  }

  try {
    const response = await axios.get(
      "https://jsearch.p.rapidapi.com/search",
      {
        params: {
          query: `${user.interests || "internship"} internship`,
          num_pages: 1
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }
      }
    );

    const internships = response.data.data;

    // save cache
    cachedData = internships;
    lastFetchTime = Date.now();

    return res.json(
      calculateMatchScores(user, internships)
    );

  } catch (err) {
    console.log("RapidAPI Failed ❌", err?.response?.status);

    // If RapidAPI blocked → still show cached results if available
    if (cachedData) {
      console.log("Serving OLD cache due to API failure");
      return res.json(calculateMatchScores(user, cachedData));
    }

    return res.status(429).json({
      message: "API limit reached, try again after some time"
    });
  }
};
