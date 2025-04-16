import React from 'react';
import { useRouter } from 'next/router';
import CreateAccountComponent from '../components/CreateAccount';
import '../components/CreateAccount.module.css';

export default function CreateAccount() {
  const router = useRouter();
  
  // Wrap the component to intercept the form submission
  const WrappedCreateAccount = () => {
    const component = <CreateAccountComponent />;
    
    // Add custom form submission handler
    React.useEffect(() => {
      setTimeout(() => {
        const submitButton = document.querySelector('button[type="submit"], .continue-button, .next-button, .submit-button');
        if (submitButton) {
          const originalOnClick = submitButton.onclick;
          submitButton.onclick = (e) => {
            if (originalOnClick) originalOnClick(e);
            router.push('/onboard');
          };
        }
      }, 500); // Small delay to ensure component is fully rendered
    }, []);
    
    return component;
  };

  return <WrappedCreateAccount />;
} 