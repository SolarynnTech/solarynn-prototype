import React from "react";

const NavigationBar = () => {
  return (
    <div className="navbar">
      <div className="navbar-menu">
        <div className="navbar-item">
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/63afc143-4a5e-4f71-a62b-fca840b68bee?placeholderIfAbsent=true" className="navbar-icon" alt="Nav 1" />
        </div>
        <div className="navbar-item">
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/cf8f8360-9d47-4d64-84a7-ad57fa77a9c4?placeholderIfAbsent=true" className="navbar-icon" alt="Nav 2" />
        </div>
        <div className="navbar-item">
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/abd3d318-9a15-419c-a12b-0c8e3bfe787e?placeholderIfAbsent=true" className="navbar-icon" alt="Nav 3" />
        </div>
      </div>
      <div className="navbar-line" />
    </div>
  );
};

export default NavigationBar;
