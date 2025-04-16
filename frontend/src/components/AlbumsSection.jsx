import React from "react";

const AlbumsSection = () => {
  return (
    <div className="details-section">
      <div className="section-header">
        <div className="section-title">Albums</div>
        <div className="edit-button">See all</div>
      </div>
      <div className="image-scroll">
        <div className="images-container">
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/e955e864bc35f2139536b3926bccde7fb19e1476?placeholderIfAbsent=true" alt="Album 1" />
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/f7b0ff0550d4588ee4593d00021e25647ec70cee?placeholderIfAbsent=true" alt="Album 2" />
        </div>
      </div>
    </div>
  );
};

export default AlbumsSection;
