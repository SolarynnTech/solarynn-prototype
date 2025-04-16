import React from 'react';
import { useRouter } from 'next/router';
import TermsAndConditionsPage from '../components/TermsAndConditionsPage';

const WrappedTermsAndConditions = () => {
  const router = useRouter();
  const component = <TermsAndConditionsPage />;


      // Add custom button handler
    React.useEffect(() => {
        // Find the next or continue button 
        setTimeout(() => {
          const nextButton = document.querySelector('button[type="submit"], .accept-button');
          
          if (nextButton) {
            const originalOnClick = nextButton.onclick;
            nextButton.onclick = (e) => {
              if (originalOnClick) originalOnClick(e);
              router.push('/create-account');
            };
          }
        }, 500); // Small delay to ensure component is fully rendered
      }, []);
      
  return component;
};

export default WrappedTermsAndConditions;
