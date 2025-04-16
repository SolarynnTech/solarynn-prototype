import React, { useState } from "react";
import styles from "./profile.module.css";

const DetailsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles["details-panel-container"]}>
      <button 
        className={styles["details-toggle-button"]} 
        onClick={togglePanel}
      >
        {isOpen ? "Hide Details" : "Show Details"}
      </button>
      
      {isOpen && (
        <div className={styles["details-panel"]}>
          <div className={styles["details-header"]}>
            <h3>Profile Details</h3>
            <button className={styles["close-button"]} onClick={togglePanel}>×</button>
          </div>
          <div className={styles["details-content"]}>
            <div className={styles["details-item"]}>
              <span className={styles["details-label"]}>Full Name:</span>
              <span className={styles["details-value"]}>Denzel Ward</span>
            </div>
            <div className={styles["details-item"]}>
              <span className={styles["details-label"]}>Occupation:</span>
              <span className={styles["details-value"]}>Entrepreneur</span>
            </div>
            <div className={styles["details-item"]}>
              <span className={styles["details-label"]}>Location:</span>
              <span className={styles["details-value"]}>Los Angeles, CA</span>
            </div>
            <div className={styles["details-item"]}>
              <span className={styles["details-label"]}>Member Since:</span>
              <span className={styles["details-value"]}>January 2023</span>
            </div>
            <div className={styles["details-item"]}>
              <span className={styles["details-label"]}>Bio:</span>
              <p className={styles["details-bio"]}>
                Professional entrepreneur with interests in technology and media. 
                Founder of multiple successful startups and passionate about innovation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsPanel; 