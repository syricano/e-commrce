import { BrowserRouter, Routes, Route } from 'react-router';
import { RootLayout, ProtectedLayout } from '@/layouts';
import { HomePage, NotFound, About, Signin, Signup, Profile, BecomeSeller } from '@/pages';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Public */}
          <Route index element={<HomePage />} />
          <Route path="signin" element={<Signin />} />
          <Route path="signup" element={<Signup />} />
          <Route path="about" element={<About />} />

          {/* Protected */}
          <Route element={<ProtectedLayout />}>
            <Route path="profile" element={<Profile />} />
            <Route path="partner/apply" element={<BecomeSeller />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
