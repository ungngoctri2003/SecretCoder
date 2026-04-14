import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PageHeader } from './PageHeader';

/**
 * Khung chung cho login/signup.
 * Không dùng spinner theo `loading` của auth: nếu getSession() treo (cấu hình/mạng),
 * người dùng vẫn thấy form để thử đăng nhập. Trạng thái auth xử lý trong AuthContext.
 */
export function AuthPageShell({ pageTitle, crumbs, children }) {
  return (
    <>
      <PageHeader title={pageTitle} crumbs={crumbs} />
      <Box
        component="main"
        sx={{
          py: { xs: 3, sm: 5 },
          px: 2,
          minHeight: { xs: '48vh', md: 'min(72vh, 720px)' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (t) => (t.palette.mode === 'light' ? 'grey.50' : 'background.default'),
          backgroundImage: (t) =>
            `radial-gradient(ellipse 120% 90% at 50% -25%, ${alpha(t.palette.primary.main, 0.2)}, transparent 52%)`,
        }}
      >
        {children}
      </Box>
    </>
  );
}
