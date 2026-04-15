import { BarChart3, BookOpen, ListChecks, Users } from 'lucide-react';
import { Box, Divider, Paper, Tab, Tabs } from '@mui/material';
import { DASH_ADMIN } from '../../strings/vi';

const TAB_KEYS = ['users', 'courses', 'enrollments', 'quiz_stats'];

const TAB_ICONS = {
  users: <Users size={18} strokeWidth={2} aria-hidden />,
  courses: <BookOpen size={18} strokeWidth={2} aria-hidden />,
  enrollments: <BarChart3 size={18} strokeWidth={2} aria-hidden />,
  quiz_stats: <ListChecks size={18} strokeWidth={2} aria-hidden />,
};

/**
 * @param {string} tab
 * @param {(v: string) => void} onTabChange
 * @param {import('react').ReactNode} children — tab panel content
 */
export function AdminShell({ tab, onTabChange, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 12px rgba(28, 36, 51, 0.07)',
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => onTabChange(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        TabIndicatorProps={{
          sx: {
            height: 3,
            borderRadius: '3px 3px 0 0',
            bgcolor: 'primary.main',
          },
        }}
        sx={{
          minHeight: 56,
          px: { xs: 0.5, sm: 1 },
          bgcolor: 'background.paper',
          '& .MuiTab-root': {
            minHeight: 56,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
            gap: 1,
            color: 'text.secondary',
            '&.Mui-selected': { color: 'primary.main' },
          },
        }}
      >
        {TAB_KEYS.map((k) => (
          <Tab key={k} value={k} icon={TAB_ICONS[k]} iconPosition="start" label={DASH_ADMIN.TABS[k]} disableRipple={false} />
        ))}
      </Tabs>
      <Divider />
      <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
    </Paper>
  );
}
