"use client";
import React from "react";
import "../../styles/onboarding.css";

function WelcomePage() {
  return (
    <div className="welcome-page">
      <div className="status-bar">9:41</div>
      <div className="welcome-content">
        <h1 className="welcome-title">
          Congratulation!
          <br /> we will start structuring your profile.
        </h1>
        <div className="welcome-description">
          <ul>
            <li>
              This is an important step to ensure efficiency, results, and
              steady progress in your project.
            </li>
          </ul>
          <ul>
            <li>
              Completing your profile will
              <strong> only take about 5 minutes.</strong> Continue whenever
              you're ready.
            </li>
          </ul>
        </div>
      </div>
      <footer className="welcome-footer">
        <div className="footer-container">
          <button className="continue-button">Continue</button>
        </div>
        <div className="bottom-indicator" />
      </footer>
    </div>
  );
}

export default WelcomePage;
