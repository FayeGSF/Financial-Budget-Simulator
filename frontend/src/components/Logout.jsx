import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/auth';

function Logout({ setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await api.post('/auth/logout', {});
        
        // Clear user state in your app
        setUser(null);
        
        // Clear any cached data
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Clear cookies by setting them to expire
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('Logout successful');
        
      } catch (error) {
        console.error('Logout error:', error.response?.data || error.message);
        // Even if logout fails, clear user state
        setUser(null);
      } finally {
        // Replace current history entry to prevent back button
        navigate('/', { replace: true });
      }
    };
    doLogout();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg text-gray-700">Logging out...</p>
    </div>
  );
}

export default Logout;
