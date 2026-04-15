import { Box, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { youtubeVideoId } from '../lib/youtube';
import { COURSE_DETAIL } from '../strings/vi';
import { LECTURE_DETAIL } from '../strings/vi';

/** Renders lecture blocks (video + text) — shared by course lecture page and detail view. */
export function LectureContentBlocks({ blocks, lectureTitle }) {
  const list = Array.isArray(blocks) ? blocks : [];
  const multi = list.length > 1;

  if (list.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={(theme) => ({
          py: 5,
          px: 3,
          textAlign: 'center',
          borderRadius: 3,
          borderStyle: 'dashed',
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.06 : 0.04),
        })}
      >
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          —
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack component="article" spacing={{ xs: 3, md: 3.5 }}>
      {list.map((blk, bi) => {
        const yid = blk.video_url ? youtubeVideoId(blk.video_url) : null;
        const hasVideo = Boolean(yid || blk.video_url);
        const hasText = Boolean(blk.content && String(blk.content).trim());

        return (
          <Paper
            key={bi}
            elevation={0}
            sx={(theme) => ({
              p: { xs: 2.5, sm: 3, md: 3.5 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : theme.palette.background.paper,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 1px 0 ${alpha(theme.palette.common.white, 0.06)} inset`
                  : `0 12px 40px ${alpha(theme.palette.common.black, 0.06)}, 0 1px 0 ${alpha(theme.palette.divider, 0.9)}`,
            })}
          >
            <Stack spacing={2.5}>
              {(multi || blk.title) && (
                <Stack spacing={0.75}>
                  {multi ? (
                    <Typography
                      variant="overline"
                      sx={{
                        fontWeight: 800,
                        letterSpacing: '0.14em',
                        color: 'primary.main',
                        lineHeight: 1.4,
                      }}
                    >
                      {LECTURE_DETAIL.PART_LABEL.replace('{n}', String(bi + 1))}
                    </Typography>
                  ) : null}
                  {blk.title ? (
                    <Typography
                      component="h2"
                      variant="h6"
                      className="font-display"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.15rem', sm: '1.28rem' },
                        lineHeight: 1.35,
                        letterSpacing: '-0.02em',
                        color: 'text.primary',
                      }}
                    >
                      {blk.title}
                    </Typography>
                  ) : null}
                </Stack>
              )}

              {hasVideo ? (
                <Box component="section" aria-label={LECTURE_DETAIL.VIDEO_HEADING}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                      mb: 1.25,
                      opacity: 0.9,
                    }}
                  >
                    {LECTURE_DETAIL.VIDEO_HEADING}
                  </Typography>
                  {yid ? (
                    <Box
                      sx={(theme) => ({
                        position: 'relative',
                        pb: '56.25%',
                        height: 0,
                        overflow: 'hidden',
                        borderRadius: 2.5,
                        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                        boxShadow:
                          theme.palette.mode === 'dark'
                            ? `0 0 0 1px ${alpha(theme.palette.common.white, 0.06)}`
                            : `0 4px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                      })}
                    >
                      <Box
                        component="iframe"
                        title={blk.title || lectureTitle}
                        src={`https://www.youtube.com/embed/${yid}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      />
                    </Box>
                  ) : (
                    <MuiLink
                      href={blk.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontWeight: 700,
                        fontSize: '1rem',
                        py: 0.5,
                      }}
                    >
                      {COURSE_DETAIL.OPEN_VIDEO}
                    </MuiLink>
                  )}
                </Box>
              ) : null}

              {hasText ? (
                <Box component="section" aria-label={LECTURE_DETAIL.CONTENT_HEADING}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                      mb: 1.25,
                      opacity: 0.9,
                    }}
                  >
                    {LECTURE_DETAIL.CONTENT_HEADING}
                  </Typography>
                  <Typography
                    component="div"
                    sx={(theme) => ({
                      whiteSpace: 'pre-wrap',
                      fontFamily: theme.typography.fontFamily,
                      fontSize: { xs: '1.0625rem', md: '1.125rem' },
                      lineHeight: 1.85,
                      letterSpacing: '-0.011em',
                      color: alpha(theme.palette.text.primary, 0.92),
                      maxWidth: 'min(65ch, 100%)',
                    })}
                  >
                    {blk.content}
                  </Typography>
                </Box>
              ) : null}

              {!hasVideo && !hasText && !blk.title ? (
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  —
                </Typography>
              ) : null}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
