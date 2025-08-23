import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context';

function ProtectedLayout({ roles = [] }) {
  const { isAuthenticated, role, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/signin" replace state={{ from: loc.pathname }} />;
  if (roles.length > 0 && !roles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}

export default ProtectedLayout;
