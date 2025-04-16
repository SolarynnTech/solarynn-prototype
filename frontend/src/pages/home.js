import React from 'react';
import { useRouter } from 'next/router';
import HomePage from '../components/HomePage';

export default function Onboard() {
  const router = useRouter();
  
  // Wrap the component to intercept button clicks
  const WrappedOnboard = () => {
    const component = <HomePage />;
    
    // Add custom button handler
    React.useEffect(() => {
      setTimeout(() => {
        const continueButton = document.querySelector(`button[type="submit"], .next-button, .submit-button, .continue-button`);
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