import React from 'react';
import { useRouter } from 'next/router';
import LoginPage from '../components/Login';
import '../components/Login.module.css';

export default function Login() {
  const router = useRouter();
  
  // Wrap the component to intercept the form submission
  const WrappedLogin = () => {
    const component = <LoginPage />;
    
    // Add custom form submission handler
    React.useEffect(() => {      
      // Handle "Create an Account" link
      const createAccountLink = document.querySelector(`.createAccountLink`);
      if (createAccountLink) {
        const originalOnClick = createAccountLink.onclick;
        createAccountLink.onclick = (e) => {
          if (originalOnClick) originalOnClick(e);
          router.push('/create-account');
        };
      }
    }, []);
    
    return component;
  };

  return <WrappedLogin />;
} 