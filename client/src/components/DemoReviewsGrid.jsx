import { Star } from 'lucide-react';
import { Box, Card, CardContent, Typography } from '@mui/material';

/** Lưới thẻ nhận xét — cùng schema với API /api/testimonials */
export function DemoReviewsGrid({ items }) {
  if (!items?.length) return null;
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => (
        <Card
          key={t.id}
          elevation={0}
          sx={{
            height: '100%',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
            '&:hover': { boxShadow: (theme) => theme.shadows[3], transform: 'translateY(-2px)', borderColor: 'primary.main' },
          }}
        >
          <CardContent>
            <Typography sx={{ color: 'text.primary', opacity: 0.9 }}>&ldquo;{t.content}&rdquo;</Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {t.image_url ? (
                <Box component="img" src={t.image_url} alt="" sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'action.selected' }} />
              )}
              <div>
                <Typography fontWeight={600}>{t.author_name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.author_title}
                </Typography>
                {t.rating ? (
                  <Box sx={{ mt: 0.5, display: 'flex', color: 'warning.main' }}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </Box>
                ) : null}
              </div>
            </Box>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
