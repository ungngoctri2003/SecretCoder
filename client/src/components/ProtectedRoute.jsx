import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/useAuth';

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <Box className="flex min-h-[40vh] items-center justify-center">
        <CircularProgress color="primary" />
      </Box>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return children;
}
