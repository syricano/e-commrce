import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context';

const ProtectedLayout = ({ roles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
