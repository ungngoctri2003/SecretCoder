import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link as MuiLink,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Award, BookOpen, ClipboardList, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/useAuth';
import { apiFetch } from '../lib/api';
import { COURSE_DETAIL } from '../strings/vi';
import { DASH_STUDENT } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

function formatQuizScoreShort(correct, total, percent) {
  return DASH_STUDENT.QUIZ_SCORE_SHORT.replace('{correct}', String(correct))
    .replace('{total}', String(total))
    .replace('{percent}', String(percent));
}

function statCard(icon, label, value, loading) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
        borderColor: (t) => alpha(t.palette.primary.main, 0.12),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.02 }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 800, mt: 0.5, lineHeight: 1.1 }}>
          {loading ? '—' : value}
        </Typography>
      </Box>
    </Paper>
  );
}

export function DashboardStudent() {
  const { session, profile } = useAuth();
  const [rows, setRows] = useState([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [learnBySlug, setLearnBySlug] = useState(() => ({}));
  const [learnLoading, setLearnLoading] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch('/api/enrollments/me', {}, session?.access_token);
        if (!cancelled) {
          setRows(data || []);
          setLoadFailed(false);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadFailed(true);
          toast.error(e.message || ERR.LOAD_ENROLLMENTS);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  useEffect(() => {
    let cancelled = false;
    if (!session?.access_token) {
      setQuizAttempts([]);
      return () => {
        cancelled = true;
      };
    }
    void Promise.resolve().then(() => {
      if (!cancelled) setAttemptsLoading(true);
    });
    (async () => {
      try {
        const data = await apiFetch('/api/learn/quiz-attempts/me', {}, session.access_token);
        if (!cancelled) {
          setQuizAttempts(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setQuizAttempts([]);
          toast.error(e.message || ERR.LOAD_QUIZ_ATTEMPTS);
        }
      } finally {
        if (!cancelled) setAttemptsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const slugsOrdered = useMemo(() => {
    const out = [];
    const seen = new Set();
    for (const r of rows) {
      const slug = r.courses?.slug;
      if (slug && !seen.has(slug)) {
        seen.add(slug);
        out.push(slug);
      }
    }
    return out;
  }, [rows]);

  useEffect(() => {
    if (!session?.access_token || slugsOrdered.length === 0) {
      let cancelledEmpty = false;
      void Promise.resolve().then(() => {
        if (cancelledEmpty) return;
        setLearnBySlug({});
        setLearnLoading(false);
      });
      return () => {
        cancelledEmpty = true;
      };
    }
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) setLearnLoading(true);
    });
    (async () => {
      const entries = await Promise.all(
        slugsOrdered.map(async (slug) => {
          try {
            const data = await apiFetch(`/api/learn/courses/${encodeURIComponent(slug)}`, {}, session.access_token);
            return [slug, { lectures: data?.lectures || [], quizzes: data?.quizzes || [], ok: true }];
          } catch {
            return [slug, { lectures: [], quizzes: [], ok: false }];
          }
        }),
      );
      if (cancelled) return;
      const next = {};
      for (const [slug, pack] of entries) {
        next[slug] = pack;
      }
      setLearnBySlug(next);
      setLearnLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token, slugsOrdered]);

  const greeting = useMemo(() => {
    const name = profile?.full_name?.trim();
    if (name) return DASH_STUDENT.GREETING.replace('{name}', name);
    return DASH_STUDENT.GREETING_FALLBACK;
  }, [profile?.full_name]);

  const totals = useMemo(() => {
    let lectures = 0;
    let quizzes = 0;
    for (const slug of slugsOrdered) {
      const pack = learnBySlug[slug];
      if (!pack) continue;
      lectures += pack.lectures?.length ?? 0;
      quizzes += pack.quizzes?.length ?? 0;
    }
    return { lectures, quizzes };
  }, [slugsOrdered, learnBySlug]);

  const latestAttemptByQuizId = useMemo(() => {
    const map = new Map();
    for (const a of quizAttempts) {
      if (!a.quiz_id || map.has(a.quiz_id)) continue;
      map.set(a.quiz_id, a);
    }
    return map;
  }, [quizAttempts]);

  const quizAttemptStats = useMemo(() => {
    const n = quizAttempts.length;
    const avg = n === 0 ? 0 : Math.round(quizAttempts.reduce((s, a) => s + (a.percent ?? 0), 0) / n);
    return { count: n, avgPercent: avg };
  }, [quizAttempts]);

  const hasEnrollments = rows.length > 0;
  const statGridSxWide = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
  };

  return (
    <>
      <PageHeader title={DASH_STUDENT.TITLE} crumbs={[{ label: COMMON.DASH_CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 800, color: 'primary.main' }}>
            {greeting}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
            {DASH_STUDENT.LEAD}
          </Typography>
        </Stack>

        <Box sx={statGridSxWide}>
          {statCard(<GraduationCap size={22} strokeWidth={2} aria-hidden />, DASH_STUDENT.STAT_COURSES, rows.length, learnLoading && hasEnrollments)}
          {statCard(<BookOpen size={22} strokeWidth={2} aria-hidden />, DASH_STUDENT.STAT_LECTURES, totals.lectures, learnLoading && hasEnrollments)}
          {statCard(<ClipboardList size={22} strokeWidth={2} aria-hidden />, DASH_STUDENT.STAT_QUIZZES, totals.quizzes, learnLoading && hasEnrollments)}
          {statCard(
            <ClipboardList size={22} strokeWidth={2} aria-hidden />,
            DASH_STUDENT.STAT_QUIZ_ATTEMPTS,
            quizAttemptStats.count,
            attemptsLoading,
          )}
          {statCard(
            <Award size={22} strokeWidth={2} aria-hidden />,
            DASH_STUDENT.STAT_QUIZ_AVG,
            quizAttemptStats.count ? `${quizAttemptStats.avgPercent}%` : '—',
            attemptsLoading,
          )}
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 }}>
            {DASH_STUDENT.MY_COURSES}
          </Typography>
          {!loadFailed && rows.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              {DASH_STUDENT.EMPTY}
            </Typography>
          ) : null}
          {rows.length > 0 ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {rows.map((r) => {
                const title = r.courses?.title || '—';
                const slug = r.courses?.slug;
                return (
                  <Card key={r.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant="h6" sx={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 }}>
                        {title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {DASH_STUDENT.ENROLLED_ON}{' '}
                        {r.enrolled_at ? new Date(r.enrolled_at).toLocaleString() : '—'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0, flexWrap: 'wrap', gap: 1 }}>
                      {slug ? (
                        <>
                          <Button component={Link} to={`/courses/${slug}`} variant="contained" color="primary" size="small">
                            {DASH_STUDENT.GO_STUDY}
                          </Button>
                          <Button component={Link} to={`/courses/${slug}#lectures-section`} variant="outlined" color="primary" size="small">
                            {DASH_STUDENT.LINK_LECTURES}
                          </Button>
                          <Button component={Link} to={`/courses/${slug}#quizzes-section`} variant="outlined" color="primary" size="small">
                            {DASH_STUDENT.LINK_QUIZZES}
                          </Button>
                        </>
                      ) : null}
                    </CardActions>
                  </Card>
                );
              })}
            </Stack>
          ) : null}
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 }}>
            {DASH_STUDENT.SECTION_LECTURES}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
            {DASH_STUDENT.SECTION_LECTURES_SUB}
          </Typography>
          {!hasEnrollments && !loadFailed ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              {DASH_STUDENT.EMPTY_LEARN_HINT}
            </Typography>
          ) : null}
          {learnLoading && hasEnrollments ? (
            <Box className="flex items-center gap-2" sx={{ mt: 3 }}>
              <CircularProgress size={22} color="primary" />
              <Typography variant="body2" color="text.secondary">
                {DASH_STUDENT.LOADING_LEARN}
              </Typography>
            </Box>
          ) : null}
          {!learnLoading && hasEnrollments && totals.lectures === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              {DASH_STUDENT.EMPTY_LECTURES}
            </Typography>
          ) : null}
          {!learnLoading && hasEnrollments && totals.lectures > 0 ? (
            <Stack spacing={3} sx={{ mt: 3 }}>
              {rows.map((r) => {
                const slug = r.courses?.slug;
                if (!slug) return null;
                const pack = learnBySlug[slug];
                const lectures = pack?.lectures || [];
                if (!lectures.length) return null;
                const courseTitle = r.courses?.title || slug;
                return (
                  <Paper key={`lec-${r.id}`} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {courseTitle}
                      </Typography>
                      <MuiLink component={Link} to={`/courses/${slug}#lectures-section`} fontWeight={600} variant="body2">
                        {DASH_STUDENT.LINK_LECTURES}
                      </MuiLink>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1.25}>
                      {lectures.map((lec) => {
                        const nBlocks = Array.isArray(lec.blocks) ? lec.blocks.length : 0;
                        return (
                          <Box
                            key={lec.id}
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                              py: 1,
                              px: 1.5,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                            }}
                          >
                            <MuiLink component={Link} to={`/courses/${slug}#lectures-section`} fontWeight={600} underline="hover" color="text.primary">
                              {lec.title || '—'}
                            </MuiLink>
                            {nBlocks > 0 ? (
                              <Chip size="small" label={COURSE_DETAIL.LECTURE_PARTS.replace('{n}', String(nBlocks))} variant="outlined" />
                            ) : null}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          ) : null}
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 }}>
            {DASH_STUDENT.SECTION_QUIZZES}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
            {DASH_STUDENT.SECTION_QUIZZES_SUB}
          </Typography>
          {!learnLoading && hasEnrollments && totals.quizzes === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              {DASH_STUDENT.EMPTY_QUIZZES}
            </Typography>
          ) : null}
          {!learnLoading && hasEnrollments && totals.quizzes > 0 ? (
            <Stack spacing={3} sx={{ mt: 3 }}>
              {rows.map((r) => {
                const slug = r.courses?.slug;
                if (!slug) return null;
                const pack = learnBySlug[slug];
                const quizzes = pack?.quizzes || [];
                if (!quizzes.length) return null;
                const courseTitle = r.courses?.title || slug;
                return (
                  <Paper key={`quiz-${r.id}`} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {courseTitle}
                      </Typography>
                      <MuiLink component={Link} to={`/courses/${slug}#quizzes-section`} fontWeight={600} variant="body2">
                        {DASH_STUDENT.LINK_QUIZZES}
                      </MuiLink>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1.25}>
                      {quizzes.map((quiz) => {
                        const nQ = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
                        const last = latestAttemptByQuizId.get(quiz.id);
                        return (
                          <Box
                            key={quiz.id}
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                              py: 1,
                              px: 1.5,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <MuiLink
                                component={Link}
                                to={`/courses/${slug}/quiz/${encodeURIComponent(quiz.id)}`}
                                fontWeight={600}
                                underline="hover"
                                color="text.primary"
                              >
                                {quiz.title || '—'}
                              </MuiLink>
                              {quiz.description ? (
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                                  {quiz.description}
                                </Typography>
                              ) : null}
                              {last ? (
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                  {DASH_STUDENT.QUIZ_LAST_SCORE}: {formatQuizScoreShort(last.correct, last.total, last.percent)}
                                  {last.submitted_at ? ` · ${new Date(last.submitted_at).toLocaleString()}` : ''}
                                </Typography>
                              ) : null}
                            </Box>
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                              {nQ > 0 ? (
                                <Chip size="small" label={COURSE_DETAIL.QUIZ_Q_COUNT.replace('{n}', String(nQ))} variant="outlined" />
                              ) : null}
                              {last ? (
                                <Chip
                                  size="small"
                                  color="primary"
                                  variant="filled"
                                  label={formatQuizScoreShort(last.correct, last.total, last.percent)}
                                />
                              ) : null}
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          ) : null}
        </Box>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif", fontWeight: 700 }}>
            {DASH_STUDENT.SECTION_QUIZ_HISTORY}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
            {DASH_STUDENT.SECTION_QUIZ_HISTORY_SUB}
          </Typography>
          {attemptsLoading ? (
            <Box className="flex items-center gap-2" sx={{ mt: 3 }}>
              <CircularProgress size={22} color="primary" />
              <Typography variant="body2" color="text.secondary">
                {COMMON.LOADING}
              </Typography>
            </Box>
          ) : null}
          {!attemptsLoading && quizAttempts.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              {DASH_STUDENT.EMPTY_QUIZ_HISTORY}
            </Typography>
          ) : null}
          {!attemptsLoading && quizAttempts.length > 0 ? (
            <Paper variant="outlined" sx={{ mt: 2, borderRadius: 2, overflow: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>{DASH_STUDENT.TH_COURSE}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{DASH_STUDENT.TH_QUIZ_NAME}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{DASH_STUDENT.TH_QUIZ_SCORE}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{DASH_STUDENT.TH_QUIZ_DATE}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quizAttempts.slice(0, 25).map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.course_title || '—'}</TableCell>
                      <TableCell>
                        {a.course_slug && a.quiz_id ? (
                          <MuiLink
                            component={Link}
                            to={`/courses/${a.course_slug}/quiz/${encodeURIComponent(a.quiz_id)}`}
                            fontWeight={600}
                          >
                            {a.quiz_title || '—'}
                          </MuiLink>
                        ) : (
                          a.quiz_title || '—'
                        )}
                      </TableCell>
                      <TableCell>{formatQuizScoreShort(a.correct, a.total, a.percent)}</TableCell>
                      <TableCell>{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          ) : null}
        </Box>
      </div>
    </>
  );
}
