import { Navigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import { useAuth } from '../context/useAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { NAV } from '../strings/vi';
import { ROLE } from '../strings/vi';

export function RoleRoute({ roles, children }) {
  const { profile, session, loading, profileLoading, signOut } = useAuth();
  const busy = loading || profileLoading;

  return (
    <ProtectedRoute>
      {busy ? (
        <Box className="flex min-h-[40vh] items-center justify-center">
          <CircularProgress color="primary" />
        </Box>
      ) : session && !profile ? (
        <Box className="container mx-auto max-w-2xl px-4 py-10">
          <Stack spacing={2}>
            <Alert severity="warning">{ROLE.NO_PROFILE}</Alert>
            <Button variant="outlined" color="primary" onClick={() => void signOut()}>
              {NAV.SIGN_OUT}
            </Button>
          </Stack>
        </Box>
      ) : roles.includes(profile?.role) ? (
        children
      ) : (
        <Navigate to="/dashboard" replace />
      )}
    </ProtectedRoute>
  );
}
