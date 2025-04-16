"use client";
import React, { useState } from "react";
import styles from "../components/Login.module.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginPage}>
        <div className={styles.statusBar}>9:41</div>

        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Login</h1>
        </header>

        <main className={styles.content}>
          <div className={styles.imageContainer}>
            <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/69a05f9eccca510a4a88582a0c5b2294314b9764?placeholderIfAbsent=true" alt="" className={styles.headerImage} />
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                Your email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.inputField}
                required
              />
            </div>

            <button
              type="button"
              className={styles.forgotPassword}
              onClick={() => {
                /* Handle forgot password */
              }}
            >
              Forgot password?
            </button>

            <button type="submit" className={styles.loginButton}>
              Login
            </button>

            <div className={styles.createAccount}>
              New user?{" "}
              <button type="button" className={styles.createAccountLink}>
                Create an Account
              </button>
            </div>
          </form>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerLine} />
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
