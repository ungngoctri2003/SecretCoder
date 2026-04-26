import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Lock, Mail } from 'lucide-react';
import { AuthPageShell } from '../components/AuthPageShell';
import { useAuth } from '../context/useAuth';
import { AUTH } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';
import { NAV } from '../strings/vi';
import { ROLE } from '../strings/vi';
import { EASE_NAV } from '../motion/variants';

const MotionCard = motion.create(Card);

export function Login() {
  const { signIn, session, loading, profile, profileLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const reduce = useReducedMotion() ?? false;

  if (!loading && session && profile && !profileLoading) {
    return <Navigate to={from} replace />;
  }

  if (!loading && session && profileLoading) {
    return (
      <AuthPageShell pageTitle={AUTH.LOGIN_TITLE} crumbs={[{ label: AUTH.LOGIN_CRUMB, active: true }]}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      </AuthPageShell>
    );
  }

  if (!loading && session && !profile) {
    return (
      <AuthPageShell pageTitle={AUTH.LOGIN_TITLE} crumbs={[{ label: AUTH.LOGIN_CRUMB, active: true }]}>
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
          <Alert severity="warning">{ROLE.NO_PROFILE}</Alert>
          <Button variant="contained" color="primary" onClick={() => void signOut()}>
            {NAV.SIGN_OUT}
          </Button>
        </Stack>
      </AuthPageShell>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { profile: loadedProfile } = await signIn(email, password);
      if (!loadedProfile) {
        toast.error(ERR.PROFILE_NOT_LOADED);
        return;
      }
      toast.success(AUTH.LOGIN_SUCCESS);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || ERR.LOGIN_FAILED);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell pageTitle={AUTH.LOGIN_TITLE} crumbs={[{ label: AUTH.LOGIN_CRUMB, active: true }]}>
      <MotionCard
        component="form"
        onSubmit={onSubmit}
        elevation={0}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE_NAV }}
        sx={{
          width: '100%',
          maxWidth: 440,
          boxShadow: (t) => t.shadows[3],
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src="/img/icon.png"
                alt=""
                sx={{
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 1.5,
                  borderRadius: 2,
                  objectFit: 'cover',
                  boxShadow: 2,
                  border: 1,
                  borderColor: 'divider',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Typography variant="h5" component="h1" className="font-display" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                {AUTH.LOGIN_TITLE}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5 }}>
                {AUTH.LOGIN_LEAD}
              </Typography>
            </Box>

            <TextField
              label={COMMON.EMAIL}
              type="email"
              required
              fullWidth
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={18} strokeWidth={2} aria-hidden />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={COMMON.PASSWORD}
              type="password"
              required
              fullWidth
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} strokeWidth={2} aria-hidden />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={submitting}
              sx={{ py: 1.25, fontSize: '1rem' }}
            >
              {submitting ? (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" thickness={5} />
                  {COMMON.PLEASE_WAIT}
                </Box>
              ) : (
                AUTH.LOGIN_TITLE
              )}
            </Button>

            <Divider sx={{ borderColor: 'divider' }} />

            <Typography variant="body2" color="text.secondary" textAlign="center">
              {AUTH.NO_ACCOUNT}{' '}
              <MuiLink component={Link} to="/signup" state={{ from }} fontWeight={700} underline="hover">
                {AUTH.SIGNUP_TITLE}
              </MuiLink>
            </Typography>
          </Stack>
        </CardContent>
      </MotionCard>
    </AuthPageShell>
  );
}
