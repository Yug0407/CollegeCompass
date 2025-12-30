import React from "react";
import '../styles/hero.css';
import heroImage from "../assets/Hero_sample.png";

export default function Hero() {
  return (
    <section className="hero">
      <div
        className="hero-bg"
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className="overlay"></div>
      </div>

      <div className="hero-content">
        <h1>
          Train and QA your <br />
          <span>human and AI agents</span>
        </h1>

        <p>
          Make every customer interaction better, faster, and more consistent
          with the optimization platform for human and AI agents.
        </p>

        <div className="hero-input">
          <input type="email" placeholder="Email address" />
          <button>See a demo →</button>
        </div>
      </div>
    </section>
  );
}
