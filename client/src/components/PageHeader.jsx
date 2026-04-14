import { Link } from 'react-router-dom';
import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { PAGE } from '../strings/vi';

export function PageHeader({ title, crumbs = [] }) {
  return (
    <Box
      component="section"
      className="relative overflow-hidden"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Box
        className="pointer-events-none absolute inset-0"
        sx={{ opacity: 0.12 }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, oklch(100% 0 0), transparent 45%), radial-gradient(circle at 80% 70%, oklch(100% 0 0), transparent 40%)',
        }}
      />
      <Box className="container relative mx-auto max-w-6xl px-4 py-8 text-center md:py-10">
        <Typography
          component="h1"
          className="font-display"
          sx={{
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            textShadow: '0 1px 2px rgba(0,0,0,0.08)',
            fontSize: { xs: '1.875rem', sm: '2.125rem', md: '2.5rem', lg: '2.75rem' },
          }}
        >
          {title}
        </Typography>
        <Breadcrumbs
          className="mt-3 justify-center md:mt-4"
          sx={{
            justifyContent: 'center',
            '& .MuiBreadcrumbs-separator': { color: 'primary.contrastText', opacity: 0.7 },
          }}
        >
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            sx={{ color: 'primary.contrastText', opacity: 0.9, fontWeight: 500, fontSize: { xs: '1rem', md: '1.125rem' } }}
          >
            {PAGE.HOME_CRUMB}
          </MuiLink>
          {crumbs.map((c) =>
            c.to && !c.active ? (
              <MuiLink
                key={c.label}
                component={Link}
                to={c.to}
                underline="hover"
                sx={{ color: 'primary.contrastText', opacity: 0.9, fontWeight: 500, fontSize: { xs: '1rem', md: '1.125rem' } }}
              >
                {c.label}
              </MuiLink>
            ) : (
              <Typography key={c.label} sx={{ color: 'primary.contrastText', fontWeight: 500, fontSize: { xs: '1rem', md: '1.125rem' } }}>
                {c.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      </Box>
    </Box>
  );
}
