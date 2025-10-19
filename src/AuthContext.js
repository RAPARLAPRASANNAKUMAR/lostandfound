


// filepath: c:\Users\DELL\OneDrive\Desktop\loasAndfound\lost-and-found-react-css\src\AuthContext.js

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
    // You can add additional logic here, like saving to local storage
  };

  const logout = () => {
    setUser(null);
    // Additional logout logic can go here
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);