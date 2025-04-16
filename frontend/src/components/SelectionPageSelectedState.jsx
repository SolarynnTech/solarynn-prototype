"use client";
import React from "react";
import styles from "../components/SelectionPageSelectedState.module.css";

function SelectionPageSelectedState() {
  return (
    <div className={styles["selection-page"]}>
      <div className={styles["status-bar"]}>9:41</div>

      <div className={styles["header"]}>
        <div className={styles["header-title"]}>Select categories</div>
      </div>

      <div className={styles["content"]}>
        <div className={styles["content-header"]}>You have selected</div>

        <div className="category-card category-entertainment">
          <div className="category-content">Entertainment & Media</div>
        </div>

        <div className="category-card category-fashion">
          <div className="category-content">Fashion & Modeling</div>
        </div>

        <div className={styles["category-card"]} category-entertainment>
          <div className={styles["category-content"]}>Entertainment & Media</div>
        </div>
      </div>

      <div className="footer">
        <div className="button-wrapper">
          <button className="button-confirm">confirm</button>
        </div>

        <div className="button-wrapper">
          <button className="button-start-over">Start Over</button>
        </div>

        <div className="bottom-indicator" />
      </div>
    </div>
  );
}

export default SelectionPageSelectedState;
