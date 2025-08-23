import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'          // tailwind/daisy import-only file
import './App.css'            // your custom CSS
import { LangProvider } from '@/context/LangProvider.jsx'
import {AuthProvider, CartProvider , AdminProvider , SellerProvider } from '@/context'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <AdminProvider>
        <SellerProvider>
          <CartProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </CartProvider>
        </SellerProvider>
      </AdminProvider>      
    </LangProvider>
  </React.StrictMode>
)
