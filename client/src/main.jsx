import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'          // tailwind/daisy import-only file
import './App.css'            // your custom CSS
import {AuthProvider, CartProvider,LangProvider } from '@/context'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <CartProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CartProvider>
    </LangProvider>
  </React.StrictMode>
)
