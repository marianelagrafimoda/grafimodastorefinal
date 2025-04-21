import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RouteHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're getting a 404 on the client side, 
    // which might happen due to Vercel's routing issues
    const checkRoute = async () => {
      // If we're accessing /admin directly, try to verify 
      // if we need to fix routing issues
      if (location.pathname === '/admin' && 
          !sessionStorage.getItem('admin_route_checked')) {
        
        sessionStorage.setItem('admin_route_checked', 'true');
        
        // Wait a bit to see if the route resolves naturally
        setTimeout(() => {
          const adminElement = document.querySelector('[data-admin-panel]');
          if (!adminElement) {
            console.log('Admin panel not found, trying to reload');
            // If we don't see the admin panel element, try to force a reload
            window.location.href = '/admin';
          }
        }, 300);
      }
    };

    checkRoute();
  }, [location.pathname, navigate]);

  return null; // This component doesn't render anything
};

export default RouteHandler; 