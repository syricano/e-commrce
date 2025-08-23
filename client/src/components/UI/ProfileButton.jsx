import { useAuth } from '@/context';

const ProfileButton = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="dropdown dropdown-end">
        <button className="btn btn-ghost btn-sm gap-2" tabIndex={0} aria-label="حسابي">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10Zm-7 9a7 7 0 1114 0H5Z"/>
          </svg>
          <span className="hidden sm:inline">{user?.firstName || 'حسابي'}</span>
        </button>
        <ul className="menu dropdown-content bg-base-100 rounded-box z-50 w-56 p-2 shadow" tabIndex={0}>
          <li><a href="/account">الملف الشخصي</a></li>
          <li><a href="/orders">طلباتي</a></li>
          <li><a href="/logout">تسجيل الخروج</a></li>
        </ul>
      </div>
    );
  }

  return (
    <div className="join">
      <a href="/signin" className="btn btn-ghost btn-sm join-item">دخول</a>
      <a href="/signup" className="btn btn-primary btn-sm join-item">تسجيل</a>
    </div>
  );
};

export default ProfileButton;
