// filepath: c:\Users\DELL\OneDrive\Desktop\loasAndfound\lost-and-found-react-css\src\index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AuthProvider } from './AuthContext'; // Import AuthProvider

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById('root')
);