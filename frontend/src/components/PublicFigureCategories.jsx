"use client";
import React, { useState } from "react";
import styles from "./PublicFigureCategories.module.css";
import { useRouter } from 'next/router';

const PublicFigureCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const router = useRouter();

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />
      <div className={styles["categories-container"]}>
        <div className={styles["status-bar"]}>
          <div className={styles.time}>9:41</div>
          <div className={styles["status-indicators"]}>
            <div className={styles.indicator}></div>
            <div className={styles.indicator}></div>
            <div className={styles.indicator}></div>
          </div>
        </div>

        <div className={styles.header}>
          <div className={styles["back-button"]}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.7603 7.90668L4.66699 16L12.7603 24.0933"
                stroke="#191D31"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.3336 16H4.89355"
                stroke="#191D31"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className={styles["page-title"]}>Sub-Categories</h1>
        </div>

        <div className={styles.content}>
          <div className={styles["content-header"]}>
            <h2 className={styles["content-title"]}>Public Figures</h2>
            <p className={styles["content-description"]}>
              Please select 1 of 18 categories that define you the most.
            </p>
          </div>

          <div className={styles["categories-grid"]}>
            <div className={styles["grid-row"]}>
              <div 
                className={`${styles["category-card"]} ${styles.entertainment} ${selectedCategory === 'entertainment' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('entertainment')}
              >
                <div className={styles["card-title"]}>Entertainment &amp; Media</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
              <div 
                className={`${styles["category-card"]} ${styles.music} ${selectedCategory === 'music' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('music')}
              >
                <div className={styles["card-title"]}>Music Industry</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
            </div>

            <div className={styles["grid-row"]}>
              <div 
                className={`${styles["category-card"]} ${styles.sports} ${selectedCategory === 'sports' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('sports')}
              >
                <div className={styles["card-title"]}>Sports &amp; Athletics</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
              <div 
                className={`${styles["category-card"]} ${styles.fashion} ${selectedCategory === 'fashion' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('fashion')}
              >
                <div className={styles["card-title"]}>Fashion &amp; Modeling</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
            </div>

            <div className={styles["grid-row"]}>
              <div 
                className={`${styles["category-card"]} ${styles.business} ${selectedCategory === 'business' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('business')}
              >
                <div className={styles["card-title"]}>Business &amp; Finance</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
              <div 
                className={`${styles["category-card"]} ${styles.technology} ${selectedCategory === 'technology' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('technology')}
              >
                <div className={styles["card-title"]}>Technology &amp; Innovation</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
            </div>

            <div className={styles["grid-row"]}>
              <div 
                className={`${styles["category-card"]} ${styles.social} ${selectedCategory === 'social' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('social')}
              >
                <div className={styles["card-title"]}>
                  Social &amp; Digital Personalities
                </div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
              <div 
                className={`${styles["category-card"]} ${styles.literature} ${selectedCategory === 'literature' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('literature')}
              >
                <div className={styles["card-title"]}>Literature &amp; Journalism</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
            </div>

            <div className={styles["grid-row"]}>
              <div 
                className={`${styles["category-card"]} ${styles.arts} ${selectedCategory === 'arts' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('arts')}
              >
                <div className={styles["card-title"]}>Visual Arts &amp; Design</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
              <div 
                className={`${styles["category-card"]} ${styles.politics} ${selectedCategory === 'politics' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('politics')}
              >
                <div className={styles["card-title"]}>Politics &amp; Government</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
            </div>

            <div className={styles["grid-row"]}>
              <div 
                className={`${styles["category-card"]} ${styles.academia} ${selectedCategory === 'academia' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('academia')}
              >
                <div className={styles["card-title"]}>
                  Academia &amp; Thought Leadership
                </div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
              <div 
                className={`${styles["category-card"]} ${styles.activism} ${selectedCategory === 'activism' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('activism')}
              >
                <div className={styles["card-title"]}>
                  Activism &amp; Humanitarian Work
                </div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
            </div>

            <div className={styles["grid-row"]}>
              <div 
                className={`${styles["category-card"]} ${styles.religion} ${selectedCategory === 'religion' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('religion')}
              >
                <div className={styles["card-title"]}>Religion &amp; Spirituality</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
              <div 
                className={`${styles["category-card"]} ${styles.law} ${selectedCategory === 'law' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('law')}
              >
                <div className={styles["card-title"]}>Law &amp; Justice</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
            </div>

            <div className={styles["grid-row"]}>
              <div 
                className={`${styles["category-card"]} ${styles.medicine} ${selectedCategory === 'medicine' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('medicine')}
              >
                <div className={styles["card-title"]}>Medicine &amp; Health</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
              <div 
                className={`${styles["category-card"]} ${styles.military} ${selectedCategory === 'military' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('military')}
              >
                <div className={styles["card-title"]}>Military &amp; Defense</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
            </div>

            <div className={styles["grid-row"]}>
              <div 
                className={`${styles["category-card"]} ${styles.culinary} ${selectedCategory === 'culinary' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('culinary')}
              >
                <div className={styles["card-title"]}>Culinary &amp; Hospitality</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
              <div 
                className={`${styles["category-card"]} ${styles.culture} ${selectedCategory === 'culture' ? styles.selected : ''}`}
                onClick={() => handleCategorySelect('culture')}
              >
                <div className={styles["card-title"]}>Culture &amp; Heritage</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className={styles["card-image"]} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            className={`${styles["next-button"]} ${!selectedCategory ? styles.disabled : ''}`}
            disabled={!selectedCategory}
            onClick={() => selectedCategory && router.push('/profile')}
          >
            Next
          </button>
          <div className={styles["bottom-indicator"]}></div>
        </div>
      </div>
    </>
  );
};

export default PublicFigureCategories;
