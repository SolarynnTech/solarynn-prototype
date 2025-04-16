import React from "react";

const ProfileHeader = () => {
  return (
    <>
      <div className="profile-header">
        <div className="profile-title">Your Profile</div>
      </div>
      <div className="user-image-section">
        <div className="profile-frame">
          <div className="profile-image-container">
            <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/a4652fe518fdeab12dd0fa854f4042b1964a95fb?placeholderIfAbsent=true" className="profile-image" alt="Profile" />
            <div className="verified-badge">
              <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/09a4a8d5aa738a6a82525e466c9bbc0c6f7ddb39?placeholderIfAbsent=true" className="verified-icon" alt="Verified" />
              <div>Verified</div>
            </div>
            <div className="profile-name">Denzel Ward</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
