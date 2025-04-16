import React from 'react';
import { useRouter } from 'next/router';
import CategoriesMainPageSeven from '../components/CategoriesMainPageSeven';
import '../components/CategoriesMainPageSeven.module.css';

export default function Onboarding2() {
  const router = useRouter();
  
  // Wrap the component to intercept button clicks
  const WrappedOnboarding2 = () => {
    const component = <CategoriesMainPageSeven />;
    
    // Add custom button handler
    React.useEffect(() => {
      // Find the next or continue button 
      setTimeout(() => {
        const nextButton = document.querySelector('button[type="submit"], .continue-button, .next-button, .submit-button');
        
        if (nextButton) {
          const originalOnClick = nextButton.onclick;
          nextButton.onclick = (e) => {
            if (originalOnClick) originalOnClick(e);
            router.push('/onboarding-3');
          };
        }
      }, 500); // Small delay to ensure component is fully rendered
    }, []);
    
    return component;
  };

  return <WrappedOnboarding2 />;
} 