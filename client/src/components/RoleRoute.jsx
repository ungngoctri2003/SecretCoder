import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLE } from '../strings/vi';

export function RoleRoute({ roles, children }) {
  const { profile, session, loading, profileLoading } = useAuth();
  const busy = loading || profileLoading;

  return (
    <ProtectedRoute>
      {busy ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : session && !profile ? (
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <div role="alert" className="alert alert-warning">
            {ROLE.NO_PROFILE}
          </div>
        </div>
      ) : roles.includes(profile?.role) ? (
        children
      ) : (
        <Navigate to="/" replace />
      )}
    </ProtectedRoute>
  );
}
