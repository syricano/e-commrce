// client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './App.css'
import { AuthProvider, CartProvider, LangProvider, MerchantProvider } from '@/context'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <CartProvider>
          <AuthProvider>
            <MerchantProvider>
              <App />
            </MerchantProvider>
          </AuthProvider>
        </CartProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
)
