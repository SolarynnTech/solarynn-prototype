import React, { useState } from 'react';
import { useRouter } from 'next/router';
import HomePage from '../components/HomePage';

export default function Onboard() {
  const router = useRouter();
  const [error, setError] = useState('');
  
  // Wrap the component to intercept button clicks
  const WrappedOnboard = () => {
    const component = <HomePage />;
    
    // Add custom button handler
    React.useEffect(() => {
      setTimeout(() => {
        const continueButton = document.querySelector(`button[type="submit"], .next-button, .submit-button, .continue-button`);
        if (continueButton) {
          const originalOnClick = continueButton.onclick;
          continueButton.onclick = async (e) => {
            const form = document.querySelector('input');
            if (form) {                
                  
                  if (True) {
                    // Registration successful, store token
                    const token = localStorage.getItem('token');
                    
                    // Fetch user profile using the profile route
                    try {
                      const profileResponse = await fetch(`${'https://solaryn.onrender.com/'}/api/profile/${form.value}`, {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      
                      const profileData = await profileResponse.json();
                      
                    } catch (profileError) {
                      console.error('Error fetching profile:', profileError);
                      // Still redirect to onboard page even if profile fetch fails
                      router.push('/onboard');
                    }
                  } else {
                    // Registration failed, show error message
                    setError(data.message || 'Registration failed. Please try again.');
                  }
              }
          };
        }
      }, 500); // Small delay to ensure component is fully rendered
    }, []);
    
    return component;
  };

  return <WrappedOnboard />;
} 