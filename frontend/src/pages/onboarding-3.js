import React from 'react';
import { useRouter } from 'next/router';
import PublicFigureCategories from '../components/PublicFigureCategories';
import styles from '../components/onboarding.module.css';

export default function Onboarding3() {
  const router = useRouter();
  
  // Wrap the component to intercept button clicks
  const WrappedOnboarding3 = () => {
    const component = <PublicFigureCategories />;
    
    // Add custom button handler
    React.useEffect(() => {
      // Find the next or continue button 
      setTimeout(() => {
        const nextButton = document.querySelector('button[type="submit"], .continue-button, .next-button, .submit-button');
        
        if (nextButton) {
          const originalOnClick = nextButton.onclick;
          nextButton.onclick = (e) => {
            if (originalOnClick) originalOnClick(e);
            router.push('/onboarding-4');
          };
        }
      }, 500); // Small delay to ensure component is fully rendered
    }, []);
    
    return component;
  };

  return <WrappedOnboarding3 />;
} 