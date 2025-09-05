import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { useLang } from '@/context/LangProvider';

function ProtectedLayout({ roles = [] }) {
  const { isAuthenticated, role, loading } = useAuth();
  const loc = useLocation();
  const { t } = useLang();

  if (loading) return <div className="flex items-center justify-center h-screen">{t('Loading…') || 'Loading…'}</div>;
  if (!isAuthenticated) return <Navigate to="/signin" replace state={{ from: loc.pathname }} />;
  if (roles.length > 0 && !roles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}

export default ProtectedLayout;
