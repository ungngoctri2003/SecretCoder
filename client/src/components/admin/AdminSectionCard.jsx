import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

/**
 * @param {string} [overline]
 * @param {string} title
 * @param {import('react').ReactNode} [action] — e.g. toolbar button aligned right
 * @param {import('react').ReactNode} children
 */
export function AdminSectionCard({ overline, title, action, children }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(28, 36, 51, 0.06)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {overline ? (
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: '0.1em', display: 'block', mb: 0.75, fontWeight: 600 }}
          >
            {overline}
          </Typography>
        ) : null}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2" className="font-display" sx={{ fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
