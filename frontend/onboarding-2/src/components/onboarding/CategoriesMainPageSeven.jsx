"use client";
import * as React from "react";
import styles from "./CategoriesMainPageSeven.module.css";

function CategoriesMainPageSeven() {
  return (
    <div className={styles.container}>
      <div className={styles.statusBar}>9:41</div>

      <div className={styles.header}>
        <div className={styles.headerTitle}>Main Category</div>
      </div>

      <div className={styles.categoriesFrame}>
        <div className={styles.instructionText}>
          <div className={styles.instructionHeader}>
            <div className={styles.instructionTitle}>
              Please select 1 of 18 categories that <br />
              define you the most.
            </div>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryRow}>
            <div className={`${styles.categoryCard} ${styles.publicFigures}`}>
              Public Figures
              <br />
              <br />
            </div>
            <div className={`${styles.categoryCard} ${styles.fashionBrands}`}>
              Fashion Brands
            </div>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryRow}>
            <div
              className={`${styles.categoryCard} ${styles.mediaPublications}`}
            >
              Media / Publications
            </div>
            <div className={`${styles.categoryCard} ${styles.industryExperts}`}>
              Industry Experts
            </div>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryRow}>
            <div className={`${styles.categoryCard} ${styles.companies}`}>
              Companies
            </div>
            <div className={`${styles.categoryCard} ${styles.entities}`}>
              Entities
            </div>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryRow}>
            <div className={`${styles.categoryCard} ${styles.agencies}`}>
              Agencies
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.confirmButton}>Confirm</div>
        </div>
        <div className={styles.bottomLine} />
      </div>
    </div>
  );
}

export default CategoriesMainPageSeven;
