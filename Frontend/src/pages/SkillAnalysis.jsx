import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/analysis.css';

export default function SkillAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const userData = JSON.parse(localStorage.getItem("user"));

  const runAnalysis = async () => {
    try {
      setLoading(true);
      // 1. Get full profile from DB
      const profile = await axios.post("http://localhost:5000/api/user/get-profile", { email: userData.email });
      
      // 2. Send to AI for Gap Analysis
      const res = await axios.post("http://localhost:5000/api/user/recommend", profile.data);
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analysis-page">
      <header className="analysis-header">
        <h1>Skill Gap Deep Dive</h1>
        <button onClick={runAnalysis} className="analyze-btn">
          {loading ? "Analyzing..." : "Refresh Analysis"}
        </button>
      </header>

      {loading && <div className="loader">✨ AI is scanning industry standards...</div>}

      {analysis && (
        <div className="analysis-grid">
          {/* Missing Skills Section */}
          <div className="analysis-section">
            <h3>⚠️ Missing Core Skills</h3>
            {analysis.skill_gap?.map((item, i) => (
              <div key={i} className="gap-card">
                <h4>{item.skill}</h4>
                <p>{item.reason}</p>
                <span className={`tag ${item.importance.toLowerCase()}`}>{item.importance} Priority</span>
              </div>
            ))}
          </div>

          {/* Action Plan */}
          <div className="analysis-section">
            <h3>✅ Recommended Action Plan</h3>
            <div className="roadmap-box">
              <p>{analysis.roadmap}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}