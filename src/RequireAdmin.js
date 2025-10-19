


// filepath: c:\Users\DELL\OneDrive\Desktop\loasAndfound\lost-and-found-react-css\src\RequireAdmin.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Ensure this path is correct

const RequireAdmin = ({ children }) => {
  const { user } = useAuth(); // Get the user from AuthContext

  if (!user || !user.isAdmin) {
    // Redirect to login if not an admin
    return <Navigate to="/admin/login" />;
  }

  return children; // Render the children if the user is an admin
};

export default RequireAdmin;