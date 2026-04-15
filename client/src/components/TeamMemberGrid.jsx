import { Box, Card, CardContent, Typography } from '@mui/material';

/**
 * @param {{ id: string, name: string, role_title?: string, image_url?: string, bio?: string }[]} members
 */
export function TeamMemberGrid({ members }) {
  if (!members?.length) return null;
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((m) => (
        <Card
          key={m.id}
          elevation={0}
          sx={{
            textAlign: 'center',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
            '&:hover': { boxShadow: (t) => t.shadows[3], transform: 'translateY(-3px)', borderColor: 'primary.main' },
          }}
        >
          <Box sx={{ px: 3, pt: 3 }}>
            {m.image_url ? (
              <Box
                component="img"
                src={m.image_url}
                alt=""
                sx={{ mx: 'auto', height: 112, width: 112, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Box sx={{ mx: 'auto', height: 112, width: 112, borderRadius: '50%', bgcolor: 'action.selected' }} />
            )}
          </Box>
          <CardContent>
            <Typography component="h3" className="font-display text-lg font-bold">
              {m.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {m.role_title}
            </Typography>
            {m.bio ? (
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                {m.bio}
              </Typography>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
