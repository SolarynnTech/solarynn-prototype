import React, { useState } from 'react';
import { useRouter } from 'next/router';
import CreateAccountComponent from '../components/CreateAccount';
import '../components/CreateAccount.module.css';

export default function CreateAccount() {
  const router = useRouter();
  const [error, setError] = useState('');
  
  // Wrap the component to intercept the form submission
  const WrappedCreateAccount = () => {
    const component = <CreateAccountComponent />;
    
    // Add custom form submission handler
    React.useEffect(() => {
      setTimeout(() => {
        
        const submitButton = document.querySelector('button[type="submit"], .continue-button, .next-button, .submit-button');
        if (submitButton) {
          submitButton.onclick = async (e) => {
          

            const form = document.querySelector('form');
            if (form) {
                
                // Get form data
                const formData = new FormData(form);
                const userData = {
                  username: formData.get('email')?.split('@')[0] || '', // Generate username from email
                  email: formData.get('email') || '',
                  phone: formData.get('phone') || '',
                  password: formData.get('password') || '',
                  user_type: 'Public Figure' // Default user type
                };
                
                try {
                  // Call the register API
                  const response = await fetch(`${'https://solaryn.onrender.com/'}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                  });
                  
                  const data = await response.json();
                  
                  if (data.token) {
                    localStorage.setItem('token', data.token);
                  }
                  
                  if (data.status) {
                    localStorage.setItem('create-account-token', "true");
                    // Registration successful, redirect to onboard page
                    router.push('/onboard');
                  } else {
                    // Registration failed, show error message
                    setError(data.message || 'Registration failed. Please try again.');
                  }
                } catch (error) {
                  console.error('Error registering user:', error);
                  setError('An error occurred during registration. Please try again.');
                }
              }
            }
        }
      }, 500); // Small delay to ensure component is fully rendered
    }, []);
    
    return (
      <>
        {error && <div style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{error}</div>}
        {component}
      </>
    );
  };

  return <WrappedCreateAccount />;
} 