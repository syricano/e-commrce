import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider, AdminProvider, SellerProvider, CartProvider, ModalProvider  } from '@/context';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminProvider>
        <SellerProvider>
          <CartProvider>
            <ModalProvider>
              <App />
            </ModalProvider>            
          </CartProvider>
        </SellerProvider>
      </AdminProvider>
    </AuthProvider>
  </React.StrictMode>
);
