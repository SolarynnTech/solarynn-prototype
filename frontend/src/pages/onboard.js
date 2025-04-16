import React from 'react';
import { useRouter } from 'next/router';
import WelcomePage from '../components/WelcomePage';
import styles from '../components/onboarding.module.css';

export default function Onboard() {
  const router = useRouter();
  
  // Wrap the component to intercept button clicks
  const WrappedOnboard = () => {
    const component = <WelcomePage />;
    
    // Add custom button handler
    React.useEffect(() => {
      setTimeout(() => {
        const continueButton = document.querySelector(`.${styles['continue-button']}, button[type="submit"], .next-button, .submit-button`);
        if (continueButton) {
          const originalOnClick = continueButton.onclick;
          continueButton.onclick = (e) => {
            if (originalOnClick) originalOnClick(e);
            router.push('/onboarding-2');
          };
        }
      }, 500); // Small delay to ensure component is fully rendered
    }, []);
    
    return component;
  };

  return <WrappedOnboard />;
} 