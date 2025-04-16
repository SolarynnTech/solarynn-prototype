import React from 'react';
import { useRouter } from 'next/router';
import SelectionPageSelectedState from '../components/SelectionPageSelectedState';
import '../components/SelectionPageSelectedState.css';

export default function Onboarding4() {
  const router = useRouter();
  
  // Wrap the component to intercept button clicks
  const WrappedOnboarding4 = () => {
    const component = <SelectionPageSelectedState />;
    
    // Add custom button handler
    React.useEffect(() => {
      // Find the next or continue button 
      setTimeout(() => {
        const nextButton = document.querySelector('button[type="submit"], .continue-button, .next-button, .submit-button');
        
        if (nextButton) {
          const originalOnClick = nextButton.onclick;
          nextButton.onclick = (e) => {
            if (originalOnClick) originalOnClick(e);
            router.push('/profile');
          };
        }
      }, 500); // Small delay to ensure component is fully rendered
    }, []);
    
    return component;
  };

  return <WrappedOnboarding4 />;
} 