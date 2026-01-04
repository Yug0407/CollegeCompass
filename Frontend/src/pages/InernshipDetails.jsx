import { useLocation } from "react-router-dom";
import "../styles/internships.css";
import { useEffect, useState } from "react";

export default function InternshipDetails() {

  const { state } = useLocation();
  const [job, setJob] = useState(state);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(!state){
      setLoading(true);
      setLoading(false);
    }
  }, []);

  if (loading || !job) {
    return (
      <div className="details-wrapper skeleton-card">
        <div className="sk-title big"></div>
        <div className="sk-company"></div>
        <div className="sk-meta"></div>
        <div className="sk-big-box"></div>
      </div>
    );
  }

  return (
    <div className="detail-page">

      <div className="detail-header">
        <div>
          <span className="badge">
            {job.type || "Internship"}
          </span>

          <h1 className="detail-title">{job.title}</h1>
          <h3 className="detail-company">{job.company}</h3>

          <div className="detail-meta">
            <span>📍 {job.location || "Remote"}</span>
            <span>•</span>
            <span>{job.type || "Full Time"}</span>
            <span>•</span>
            <span>{job.matchScore}% Match</span>
          </div>
        </div>

        <img 
          src={job.logo || "https://via.placeholder.com/90"}
          className="detail-logo"
          alt="logo"
        />
      </div>

      <hr />

      <section>
        <h2>Eligibility</h2>
        <p>
          Undergraduate • Postgraduate • Engineering Students
        </p>
      </section>

      <section>
        <h2>Description</h2>
        <p>
          {job.description || "No detailed description provided."}
        </p>
      </section>

      <div className="bottom-apply-bar">
        <a href={job.link} target="_blank">
          <button className="apply-big-btn">
            Apply Now
          </button>
        </a>
      </div>
    </div>
  );
}
