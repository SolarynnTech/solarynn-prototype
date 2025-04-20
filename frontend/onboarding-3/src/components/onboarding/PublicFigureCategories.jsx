"use client";
import React from "react";
import "./PublicFigureCategories.css";

const PublicFigureCategories = () => {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />
      <div className="categories-container">
        {/*<div className="status-bar">*/}
        {/*  <div className="time">9:41</div>*/}
        {/*  <div className="status-indicators">*/}
        {/*    <div className="indicator"></div>*/}
        {/*    <div className="indicator"></div>*/}
        {/*    <div className="indicator"></div>*/}
        {/*  </div>*/}
        {/*</div>*/}

        <div className="header">
          <div className="back-button">
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
          <h1 className="page-title">Sub-Categories</h1>
        </div>

        <div className="content">
          <div className="content-header">
            <h2 className="content-title">Public Figures</h2>
            <p className="content-description">
              Please select 1 of 18 categories that define you the most.
            </p>
          </div>

          <div className="categories-grid">
            <div className="grid-row">
              <div className="category-card entertainment">
                <div className="card-title">Entertainment &amp; Media</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
              <div className="category-card music">
                <div className="card-title">Music Industry</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
            </div>

            <div className="grid-row">
              <div className="category-card sports">
                <div className="card-title">Sports &amp; Athletics</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
              <div className="category-card fashion">
                <div className="card-title">Fashion &amp; Modeling</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
            </div>

            <div className="grid-row">
              <div className="category-card business">
                <div className="card-title">Business &amp; Finance</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
              <div className="category-card technology">
                <div className="card-title">Technology &amp; Innovation</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
            </div>

            <div className="grid-row">
              <div className="category-card social">
                <div className="card-title">
                  Social &amp; Digital Personalities
                </div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
              <div className="category-card literature">
                <div className="card-title">Literature &amp; Journalism</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
            </div>

            <div className="grid-row">
              <div className="category-card arts">
                <div className="card-title">Visual Arts &amp; Design</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
              <div className="category-card politics">
                <div className="card-title">Politics &amp; Government</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
            </div>

            <div className="grid-row">
              <div className="category-card academia">
                <div className="card-title">
                  Academia &amp; Thought Leadership
                </div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
              <div className="category-card activism">
                <div className="card-title">
                  Activism &amp; Humanitarian Work
                </div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
            </div>

            <div className="grid-row">
              <div className="category-card religion">
                <div className="card-title">Religion &amp; Spirituality</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
              <div className="category-card law">
                <div className="card-title">Law &amp; Justice</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
            </div>

            <div className="grid-row">
              <div className="category-card medicine">
                <div className="card-title">Medicine &amp; Health</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
              <div className="category-card military">
                <div className="card-title">Military &amp; Defense</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
            </div>

            <div className="grid-row">
              <div className="category-card culinary">
                <div className="card-title">Culinary &amp; Hospitality</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/86f7ba5d11e3631aaf3e1a732b9945198a170d2b?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
              <div className="category-card culture">
                <div className="card-title">Culture &amp; Heritage</div>
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/92b6387bfc8216f2cca650beb0017632659d468d?placeholderIfAbsent=true" alt="" className="card-image" />
              </div>
            </div>
          </div>
        </div>

        <div className="footer">
          <button className="next-button">Next</button>
          <div className="bottom-indicator"></div>
        </div>
      </div>
    </>
  );
};

export default PublicFigureCategories;
