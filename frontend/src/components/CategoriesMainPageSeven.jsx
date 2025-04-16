"use client";
import * as React from "react";
import { useState } from "react";
import styles from "./CategoriesMainPageSeven.module.css";
import { useRouter } from 'next/router';

function CategoriesMainPageSeven() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleConfirm = () => {
    if (selectedCategory) {
      router.push('/onboarding-3');
      console.log("Selected category:", selectedCategory);
      // Here you would typically navigate or submit the selection
    }
  };

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
            <div 
              className={`${styles.categoryCard} ${styles.publicFigures} ${selectedCategory === "Public Figures" ? styles.selected : ""}`}
              onClick={() => handleCategoryClick("Public Figures")}
            >
              Public Figures
              <br />
              <br />
            </div>
            <div 
              className={`${styles.categoryCard} ${styles.fashionBrands} ${selectedCategory === "Fashion Brands" ? styles.selected : ""}`}
              onClick={() => handleCategoryClick("Fashion Brands")}
            >
              Fashion Brands
            </div>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryRow}>
            <div
              className={`${styles.categoryCard} ${styles.mediaPublications} ${selectedCategory === "Media / Publications" ? styles.selected : ""}`}
              onClick={() => handleCategoryClick("Media / Publications")}
            >
              Media / Publications
            </div>
            <div 
              className={`${styles.categoryCard} ${styles.industryExperts} ${selectedCategory === "Industry Experts" ? styles.selected : ""}`}
              onClick={() => handleCategoryClick("Industry Experts")}
            >
              Industry Experts
            </div>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryRow}>
            <div 
              className={`${styles.categoryCard} ${styles.companies} ${selectedCategory === "Companies" ? styles.selected : ""}`}
              onClick={() => handleCategoryClick("Companies")}
            >
              Companies
            </div>
            <div 
              className={`${styles.categoryCard} ${styles.entities} ${selectedCategory === "Entities" ? styles.selected : ""}`}
              onClick={() => handleCategoryClick("Entities")}
            >
              Entities
            </div>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryRow}>
            <div 
              className={`${styles.categoryCard} ${styles.agencies} ${selectedCategory === "Agencies" ? styles.selected : ""}`}
              onClick={() => handleCategoryClick("Agencies")}
            >
              Agencies
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div 
            className={`${styles.confirmButton} ${selectedCategory ? styles.confirmActive : ""}`}
            onClick={handleConfirm}
          >
            Confirm
          </div>
        </div>
        <div className={styles.bottomLine} />
      </div>
    </div>
  );
}

export default CategoriesMainPageSeven;
