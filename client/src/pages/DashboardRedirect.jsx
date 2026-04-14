import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function DashboardRedirect() {
  const { profile, loading, profileLoading } = useAuth();
  if (loading || profileLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }
  if (!profile) {
    return <Navigate to="/login" replace />;
  }
  if (profile.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (profile.role === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
  return <Navigate to="/dashboard/student" replace />;
}
