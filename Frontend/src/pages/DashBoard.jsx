import '../styles/dashboard.css';
import axios from "axios";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [ai, setAi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecommendations = async () => {
      try {
        setLoading(true);
        
        // 1. First, get the FULL profile data from the database
        const profileRes = await axios.post("http://localhost:5000/api/user/get-profile", {
          email: user.email
        });

        const fullProfile = profileRes.data;

        // 2. Now send the FULL profile (with skills, branch, etc.) to the AI
        const aiRes = await axios.post(
          "http://localhost:5000/api/user/recommend",
          fullProfile
        );
        
        setAi(aiRes.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      getRecommendations();
    }
  }, []);

  if (loading) return <div className="loading">✨ AI is analyzing your profile...</div>;

return (
  <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
    <h1>Welcome {user.name}</h1>

    {ai ? (
      <>
        <section className="ai-card">
          <h2>🚀 Internship Suggestions</h2>
          <p>{ai.internships}</p>
        </section>

        <section className="ai-card">
          <h2>🎯 Skill Gap Analysis</h2>
          <p>{ai.skills}</p>
        </section>

        <section className="ai-card">
          <h2>🗺️ Career Roadmap</h2>
          <p>{ai.roadmap}</p>
        </section>
      </>
    ) : (
      <div className="error-box">
        ⚠️ No recommendations available. Make sure your profile is complete.
      </div>
    )}
  </div>
);
}