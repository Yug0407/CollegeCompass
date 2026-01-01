import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// SIMPLE IN-MEMORY CACHE (avoids API limits)
let CACHE = null;
let LAST_FETCH = null;

const CACHE_TIME = 10 * 60 * 1000; // 10 min

// Google Vertex AI REST Endpoint
const VERTEX_URL = process.env.VERTEX_URL;
const GOOGLE_TOKEN = process.env.GOOGLE_TOKEN;

// Internship API
const RAPID_API_KEY = process.env.RAPID_API_KEY;

async function fetchInternships() {
  const res = await axios.get(
    "https://jsearch.p.rapidapi.com/search",
    {
      params: {
        query: "internship",
        num_pages: 2,
      },
      headers: {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      }
    }
  );

  return res.data.data;
}

async function vertexMatch(userSkills, internships) {

  const res = await axios.post(
    VERTEX_URL,
    {
      instances: [
        {
          userSkills,
          internships
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${GOOGLE_TOKEN}`
      }
    }
  );

  return res.data.predictions[0];
}

app.post("/recommend", async (req,res)=>{

  const { user } = req.body;

  if(!CACHE || Date.now() - LAST_FETCH > CACHE_TIME){
    CACHE = await fetchInternships();
    LAST_FETCH = Date.now();
  }

  const ranked = await vertexMatch(user.skillRatings, CACHE);

  res.json(ranked);
});

app.listen(8080, ()=> console.log("Cloud Run Internship AI Running 🚀"));
