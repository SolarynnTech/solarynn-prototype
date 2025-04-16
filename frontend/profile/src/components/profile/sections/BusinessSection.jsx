import React from "react";

const BusinessSection = () => {
  return (
    <div className="details-section">
      <div className="section-header">
        <div className="section-title">Business & Charity</div>
        <div className="edit-button">See all</div>
      </div>
      <div className="social-grid">
        <div className="social-item">
          <div>Founder</div>
          <div>888</div>
        </div>
      </div>
      <div className="image-scroll">
        <div className="images-container">
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/61b7cc732e7b43d0c33c655fd44cc19001806d26?placeholderIfAbsent=true" alt="Business 1" />
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/5d6495a0ea9f7778a6e4551df9a2f53a4d4e4caa?placeholderIfAbsent=true" alt="Business 2" />
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/9aecf03a166d823b345dec1a206a59a7d478f7cc?placeholderIfAbsent=true" alt="Business 3" />
        </div>
      </div>
      <button className="add-button">Add</button>
    </div>
  );
};

export default BusinessSection;
