"use client";
import React from "react";
import styles from "./OTPVerification.module.css";

const OTPVerification = () => {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
      />
      <div className={styles.container}>
        <div className={styles.statusBar}>
          <div className={styles.time}>9:41</div>
          <div className={styles.indicators}>
            <div className={styles.indicator} />
            <div className={styles.indicator} />
            <div className={styles.indicator} />
          </div>
        </div>

        <div className={styles.header}>
          <button className={styles.backButton}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.7574 7.90662L4.66406 16L12.7574 24.0933"
                stroke="#191D31"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.3306 16H4.89062"
                stroke="#191D31"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className={styles.title}>Verification</h1>
        </div>

        <div className={styles.content}>
          <h2 className={styles.message}>
            We sent you a confirmation code to your number and email
          </h2>
          <div className={styles.inputSection}>
            <label className={styles.inputLabel}>Code Verification</label>
            <input
              type="text"
              placeholder="Enter The Code"
              className={styles.input}
              aria-label="Verification Code"
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.confirmButton}>Confirm</button>
          <div className={styles.bottomBar} />
        </div>
      </div>
    </>
  );
};

export default OTPVerification;
