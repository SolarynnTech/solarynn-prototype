"use client";
import React from "react";
import styles from "../components/onboarding.module.css";

function WelcomePage() {
  return (
    <div className={styles["welcome-page"]}>
      <div className={styles["status-bar"]}>9:41</div>
      <div className={styles["welcome-content"]}>
        <h1 className={styles["welcome-title"]}>
          Congratulation!
          <br /> we will start structuring your profile.
        </h1>
        <div className={styles["welcome-description"]}>
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
      <footer className={styles["welcome-footer"]}>
        <div className={styles["footer-container"]}>
          <button className={styles["continue-button"]}>Continue</button>
        </div>
        <div className={styles["bottom-indicator"]} />
      </footer>
    </div>
  );
}

export default WelcomePage;
