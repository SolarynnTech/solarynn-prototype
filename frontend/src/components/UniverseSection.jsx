import React from "react";

const UniverseSection = () => {
  const categories = [
    { label: "Family", count: "50" },
    { label: "Friends", count: "50" },
    { label: "Staff", count: "222" },
  ];

  return (
    <div className="details-section">
      <div className="section-header">
        <div className="section-title">Universe</div>
        <div className="edit-button">See all</div>
      </div>
      <div className="categories-container">
        {categories.map((category, index) => (
          <div key={index} className="category-item">
            <div>{category.label}</div>
            <div>{category.count}</div>
          </div>
        ))}
      </div>
      <div className="image-scroll">
        <div className="images-container">
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/61b7cc732e7b43d0c33c655fd44cc19001806d26?placeholderIfAbsent=true" alt="Universe 1" />
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/5d6495a0ea9f7778a6e4551df9a2f53a4d4e4caa?placeholderIfAbsent=true" alt="Universe 2" />
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/9aecf03a166d823b345dec1a206a59a7d478f7cc?placeholderIfAbsent=true" alt="Universe 3" />
        </div>
      </div>
      <button className="add-button">Add</button>
    </div>
  );
};

export default UniverseSection;
