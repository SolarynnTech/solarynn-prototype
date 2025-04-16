"use client";
import * as React from "react";

function TermsAndConditionsPage() {
  return (
    <div
      className="terms-page-container"
      style={{
        backgroundColor: "rgba(255, 255, 255, 1)",
        maxWidth: "393px",
      }}
    >
      <div
        className="status-bar"
        style={{
          backgroundColor: "rgba(255, 255, 255, 1)",
          width: "100%",
          paddingLeft: "35px",
          paddingRight: "35px",
          paddingTop: "21px",
          paddingBottom: "21px",
          fontFamily:
            "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "15px",
          color: "rgba(0, 0, 0, 1)",
          fontWeight: "600",
          whiteSpace: "nowrap",
          textAlign: "center",
          letterSpacing: "-0.17px",
        }}
      >
        9:41
      </div>
      <div
        className="header"
        style={{
          backgroundColor: "rgba(255, 255, 255, 1)",
          width: "100%",
          paddingLeft: "58px",
          paddingRight: "58px",
          paddingTop: "12px",
          paddingBottom: "4px",
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "22px",
          color: "rgba(0, 0, 0, 1)",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        <div
          className="title"
          style={{
            alignSelf: "stretch",
            flex: "1",
            flexShrink: "1",
            flexBasis: "0%",
            minHeight: "32px",
            gap: "16px",
          }}
        >
          Solaryyn{" "}
        </div>
      </div>
      <div
        className="content"
        style={{
          display: "flex",
          width: "100%",
          paddingLeft: "22px",
          paddingRight: "21px",
          paddingTop: "50px",
          paddingBottom: "50px",
          flexDirection: "column",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "start",
        }}
      >
        <div
          className="logo-container"
          style={{
            maxWidth: "100%",
            width: "350px",
          }}
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6aa16236d7d2303d78c21642039e4cccc56b6ef3?placeholderIfAbsent=true"
            style={{
              aspectRatio: "1.77",
              objectFit: "contain",
              objectPosition: "center",
              width: "100%",
            }}
            alt="Solaryyn Logo"
          />
        </div>
        <div
          className="terms-title"
          style={{
            color: "rgba(0, 0, 0, 1)",
            fontSize: "18px",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontWeight: "700",
            letterSpacing: "-0.17px",
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          Terms and Conditions
        </div>
        <div
          className="terms-intro"
          style={{
            color: "rgba(0, 0, 0, 1)",
            fontSize: "15px",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontWeight: "500",
            letterSpacing: "-0.17px",
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          Welcome to Solaryyn. By using our services, you agree to comply with
          and be bound by the following terms and conditions.
          <br />
          <br />
          Please read these terms carefully before proceeding.
        </div>
        <div
          className="terms-section"
          style={{
            color: "rgba(0, 0, 0, 1)",
            fontSize: "15px",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontWeight: "500",
            letterSpacing: "-0.17px",
            textAlign: "left",
            marginTop: "24px",
            width: "100%",
          }}
        >
          <h3
            style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}
          >
            1. Acceptance of Terms
          </h3>
          <p style={{ marginBottom: "16px" }}>
            By accessing or using Solaryyn, you acknowledge that you have read,
            understood, and agree to be bound by these Terms and Conditions.
          </p>

          <h3
            style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}
          >
            2. Beta Version
          </h3>
          <p style={{ marginBottom: "16px" }}>
            You understand that Solaryyn is currently in beta testing phase. The
            service may contain bugs, errors, or other issues that could affect
            functionality.
          </p>

          <h3
            style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}
          >
            3. User Responsibilities
          </h3>
          <p style={{ marginBottom: "16px" }}>
            You are responsible for maintaining the confidentiality of your
            account information and for all activities that occur under your
            account.
          </p>

          <h3
            style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}
          >
            4. Privacy Policy
          </h3>
          <p style={{ marginBottom: "16px" }}>
            Your use of Solaryyn is also governed by our Privacy Policy, which
            can be found on our website.
          </p>

          <h3
            style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}
          >
            5. Limitation of Liability
          </h3>
          <p style={{ marginBottom: "16px" }}>
            Solaryyn shall not be liable for any direct, indirect, incidental,
            special, consequential or exemplary damages resulting from your use
            of the service.
          </p>
        </div>
        <div
          className="terms-footer"
          style={{
            color: "rgba(0, 0, 0, 1)",
            fontSize: "15px",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontWeight: "500",
            letterSpacing: "-0.17px",
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          By clicking "I Agree" below, you confirm that you have read,
          understood, and accept these Terms and Conditions.
        </div>
        <button
          className="accept-button"
          style={{
            alignSelf: "stretch",
            borderRadius: "24px",
            backgroundColor: "rgba(8, 123, 67, 1)",
            marginTop: "24px",
            maxWidth: "100%",
            width: "345px",
            paddingLeft: "123px",
            paddingRight: "123px",
            paddingTop: "12px",
            paddingBottom: "12px",
            gap: "10px",
            overflow: "hidden",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "16px",
            color: "rgba(245, 245, 245, 1)",
            fontWeight: "600",
            textAlign: "center",
            lineHeight: "1.3",
            border: "none",
            cursor: "pointer",
          }}
        >
          I Agree
        </button>
        <button
          className="back-button"
          style={{
            alignSelf: "stretch",
            borderRadius: "24px",
            backgroundColor: "transparent",
            border: "1px solid rgba(8, 123, 67, 1)",
            marginTop: "12px",
            maxWidth: "100%",
            width: "345px",
            paddingLeft: "123px",
            paddingRight: "123px",
            paddingTop: "12px",
            paddingBottom: "12px",
            gap: "10px",
            overflow: "hidden",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "16px",
            color: "rgba(8, 123, 67, 1)",
            fontWeight: "600",
            textAlign: "center",
            lineHeight: "1.3",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
      <div
        className="screen-footer"
        style={{
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0px -1px 25px 0px rgba(0, 0, 0, 0.05)",
          display: "flex",
          width: "100%",
          paddingLeft: "79px",
          paddingRight: "79px",
          paddingTop: "23px",
          paddingBottom: "7px",
          flexDirection: "column",
        }}
      >
        <div
          className="footer-line"
          style={{
            borderRadius: "100px",
            backgroundColor: "rgba(0, 0, 0, 1)",
            display: "flex",
            width: "135px",
            flexShrink: "0",
            height: "5px",
          }}
        />
      </div>
    </div>
  );
}

export default TermsAndConditionsPage; 