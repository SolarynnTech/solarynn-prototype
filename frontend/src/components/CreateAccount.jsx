"use client";
import { useState } from "react";
import styles from "./CreateAccount.module.css";

export default function CreateAccount() {
  const [formData, setFormData] = useState({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    phone: "",
    confirmPhone: "",
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
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusBar}>9:41</div>

      <div className={styles.header}>
        <div className={styles.title}>Create an account</div>
      </div>

      <form onSubmit={handleSubmit} className={styles.content}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Your email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={styles.inputField}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Confirm your email</label>
          <input
            type="email"
            name="confirmEmail"
            value={formData.confirmEmail}
            onChange={handleInputChange}
            className={styles.inputField}
            placeholder="Confirm your address"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={styles.inputField}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Re-entry Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={styles.inputField}
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Your Phone number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={styles.inputField}
            placeholder="Enter your number"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Re-entry phone number</label>
          <input
            type="tel"
            name="confirmPhone"
            value={formData.confirmPhone}
            onChange={handleInputChange}
            className={styles.inputField}
            placeholder="Confirm your number"
            required
          />
        </div>
      </form>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <button type="submit" className={styles.submitButton}>
            Continue
          </button>
        </div>
        <div className={styles.bottomLine} />
      </div>
    </div>
  );
}
