import React from "react";

const SocialMediaSection = () => {
  const socialPlatforms = [
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/61f423c3f5b08bcfc23a4f372bc3e9b2c8eb8bd3?placeholderIfAbsent=true", count: "888K" },
    { count: "888K" }, // Facebook
    { count: "888K" }, // TikTok
    { count: "888K" }, // Youtube
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/e6955a3f783d4abbb098a47317b3468ba6586387?placeholderIfAbsent=true", count: "888K" }, // X (Twitter)
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/cd74e1fddf2f6081b4128494f932f31fbd64248c?placeholderIfAbsent=true", count: "888K" },
    { count: "888K" }, // Snapchat
    { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/5a20d9ca82d1955b70f30cc5d8c3e8bdf227fd2a?placeholderIfAbsent=true", count: "888K" },
  ];

  return (
    <div className="social-media-section">
      <div className="section-header">
        <div className="section-title">Social Media</div>
        <div className="edit-button">Edit</div>
      </div>
      <div className="social-grid">
        {socialPlatforms.map((platform, index) => (
          <div key={index} className="social-item">
            <div className="social-icon">
              {platform.icon && (
                <img src={platform.icon} alt="Social Media Icon" />
              )}
            </div>
            <div className="social-count">
              <div className="social-divider" />
              <div className="social-count-value">{platform.count}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaSection;
