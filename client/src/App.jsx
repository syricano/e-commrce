import { BrowserRouter, Routes, Route } from 'react-router';
import { RootLayout, ProtectedLayout } from '@/layouts';

import {
  HomePage,
  NotFound,
  About,
  Signin,
  Signup,
} from '@/pages'

import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Layout wraps everything */}
        <Route path="/" element={<RootLayout />}>
          {/* Public Pages */}
          <Route index element={<HomePage />} />
          <Route path="signin" element={<Signin />} />
          <Route path="signup" element={<Signup />} />
          <Route path="about" element={<About />} />

          {/* Protected Pages nested inside RootLayout */}
          <Route element={<ProtectedLayout />}>
          </Route>

          {/* Catch-all for 404 (inside RootLayout to show Navbar/Footer) */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App