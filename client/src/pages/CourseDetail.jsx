import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Link as MuiLink,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BookOpen, ChevronDown, ListVideo } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { COURSE_DETAIL } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

function youtubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname.startsWith('/embed/')) {
        return u.pathname.split('/').filter(Boolean)[1] || null;
      }
      const v = u.searchParams.get('v');
      if (v) return v;
    }
  } catch {
    return null;
  }
  return null;
}

function formatQuizScore(template, correct, total, percent) {
  return template.replace('{correct}', String(correct)).replace('{total}', String(total)).replace('{percent}', String(percent));
}

function stripEnrollSearch(pathname, search) {
  const sp = new URLSearchParams(search);
  sp.delete('enroll');
  const q = sp.toString();
  return q ? `${pathname}?${q}` : pathname;
}

export function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { session, profile } = useAuth();
  const [course, setCourse] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState(() => ({}));
  const [quizResults, setQuizResults] = useState(() => ({}));
  const [submittingQuizId, setSubmittingQuizId] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [nonStudentDialogOpen, setNonStudentDialogOpen] = useState(false);
  const autoEnrollRunning = useRef(false);

  const isStudent = profile?.role === 'student';
  const courseId = course?.id;
  const isEnrolled =
    Boolean(courseId) &&
    Array.isArray(myEnrollments) &&
    myEnrollments.some((r) => r.course_id === courseId || r.courses?.id === courseId);

  const fetchLearnContent = useCallback(async () => {
    if (!slug || !session?.access_token || !isStudent) return;
    setContentLoading(true);
    try {
      const data = await apiFetch(`/api/learn/courses/${encodeURIComponent(slug)}`, {}, session.access_token);
      setCourse((prev) => (prev ? { ...prev, lectures: data.lectures || [], quizzes: data.quizzes || [] } : prev));
      setQuizAnswers({});
      setQuizResults({});
    } catch (e) {
      if (e.status === 403 && e.data?.error === 'NOT_ENROLLED') {
        setCourse((prev) => (prev ? { ...prev, lectures: [], quizzes: [] } : prev));
      }
    } finally {
      setContentLoading(false);
    }
  }, [slug, session?.access_token, isStudent]);

  const refreshMyEnrollments = useCallback(async () => {
    if (!session?.access_token || !isStudent) {
      setMyEnrollments([]);
      return;
    }
    try {
      const data = await apiFetch('/api/enrollments/me', {}, session.access_token);
      setMyEnrollments(data || []);
    } catch {
      setMyEnrollments([]);
    }
  }, [session?.access_token, isStudent]);

  useEffect(() => {
    let cancelled = false;
    setErr('');
    (async () => {
      try {
        const data = await apiFetch(`/api/courses/${encodeURIComponent(slug)}`);
        if (!cancelled) {
          setCourse(data);
          setQuizAnswers({});
          setQuizResults({});
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || ERR.NOT_FOUND);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!courseId || !session || !isStudent) {
        if (!cancelled) setMyEnrollments(session && !isStudent ? [] : null);
        return;
      }
      try {
        const data = await apiFetch('/api/enrollments/me', {}, session.access_token);
        if (!cancelled) setMyEnrollments(data || []);
      } catch {
        if (!cancelled) setMyEnrollments([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, session?.access_token, session, isStudent]);

  useEffect(() => {
    if (!isEnrolled || !isStudent || !slug || !session?.access_token) return;
    void fetchLearnContent();
  }, [isEnrolled, isStudent, slug, session?.access_token, fetchLearnContent]);

  useEffect(() => {
    return () => {
      autoEnrollRunning.current = false;
    };
  }, [slug]);

  useEffect(() => {
    if (searchParams.get('enroll') !== '1' || !courseId || !session || !isStudent) return;
    if (myEnrollments === null) return;
    if (autoEnrollRunning.current) return;
    autoEnrollRunning.current = true;

    const cleanPath = stripEnrollSearch(location.pathname, location.search);
    const enrolledNow = myEnrollments.some((r) => r.course_id === courseId || r.courses?.id === courseId);

    (async () => {
      try {
        if (!enrolledNow) {
          try {
            await apiFetch(
              '/api/enrollments',
              { method: 'POST', body: JSON.stringify({ course_id: courseId }) },
              session.access_token,
            );
            setMsg(COURSE_DETAIL.ENROLL_SUCCESS);
          } catch (e) {
            if (e.status === 409) {
              setMsg(COURSE_DETAIL.ENROLL_SUCCESS);
            } else {
              setMsg(e.data?.error || e.message || ERR.ENROLL_FAILED);
            }
          }
          await refreshMyEnrollments();
        }
        navigate(cleanPath, { replace: true });
      } finally {
        autoEnrollRunning.current = false;
      }
    })();
  }, [
    searchParams,
    courseId,
    session,
    isStudent,
    myEnrollments,
    location.pathname,
    location.search,
    navigate,
    refreshMyEnrollments,
  ]);

  const returnPathForAuth = slug ? `/courses/${slug}?enroll=1` : '/dashboard';

  function openEnrollFlow() {
    setMsg('');
    if (!session) {
      setEnrollDialogOpen(true);
      return;
    }
    if (!isStudent) {
      setNonStudentDialogOpen(true);
      return;
    }
    void enroll();
  }

  async function enroll() {
    setMsg('');
    if (!session) {
      setEnrollDialogOpen(true);
      return;
    }
    if (!isStudent) {
      setNonStudentDialogOpen(true);
      return;
    }
    if (!course?.id) return;
    setEnrolling(true);
    try {
      await apiFetch(
        '/api/enrollments',
        { method: 'POST', body: JSON.stringify({ course_id: course.id }) },
        session.access_token,
      );
      setMsg(COURSE_DETAIL.ENROLL_SUCCESS);
      await refreshMyEnrollments();
      await fetchLearnContent();
    } catch (e) {
      if (e.status === 409) {
        setMsg(COURSE_DETAIL.ENROLL_SUCCESS);
        await refreshMyEnrollments();
        await fetchLearnContent();
      } else {
        setMsg(e.data?.error || e.message || ERR.ENROLL_FAILED);
      }
    } finally {
      setEnrolling(false);
    }
  }

  function setAnswerForQuiz(quizId, questionIndex, optionIndex) {
    setQuizAnswers((prev) => {
      const cur = prev[quizId] ? [...prev[quizId]] : [];
      const quiz = course?.quizzes?.find((q) => q.id === quizId);
      const len = quiz?.questions?.length ?? 0;
      while (cur.length < len) cur.push(-1);
      cur[questionIndex] = optionIndex;
      return { ...prev, [quizId]: cur };
    });
  }

  async function submitQuiz(quizId) {
    if (!course?.slug) return;
    if (!session?.access_token) return;
    const quiz = course.quizzes?.find((q) => q.id === quizId);
    if (!quiz) return;
    const n = quiz.questions?.length ?? 0;
    const raw = quizAnswers[quizId] || [];
    const answers = Array.from({ length: n }, (_, i) => (typeof raw[i] === 'number' ? raw[i] : -1));
    setSubmittingQuizId(quizId);
    try {
      const result = await apiFetch(
        `/api/learn/courses/${encodeURIComponent(course.slug)}/quizzes/${encodeURIComponent(quizId)}/submit`,
        { method: 'POST', body: JSON.stringify({ answers }) },
        session.access_token,
      );
      setQuizResults((prev) => ({ ...prev, [quizId]: result }));
    } catch (e) {
      setQuizResults((prev) => ({
        ...prev,
        [quizId]: { error: e.data?.error || e.message || COURSE_DETAIL.QUIZ_SUBMIT_ERR },
      }));
    } finally {
      setSubmittingQuizId(null);
    }
  }

  if (err || !course) {
    return (
      <>
        <PageHeader
          title={COURSE_DETAIL.TITLE_FALLBACK}
          crumbs={[{ label: COURSE_DETAIL.CRUMB, to: '/courses' }, { label: slug || '', active: true }]}
        />
        <Box className="container mx-auto max-w-2xl px-4 py-12">
          <Alert severity="warning">{err || COMMON.LOADING}</Alert>
          <Button component={Link} to="/courses" variant="text" color="primary" sx={{ mt: 2, px: 0 }}>
            {COURSE_DETAIL.BACK}
          </Button>
        </Box>
      </>
    );
  }

  const enrollOk = msg === COURSE_DETAIL.ENROLL_SUCCESS;
  const lectures = Array.isArray(course.lectures) ? course.lectures : [];
  const quizzes = Array.isArray(course.quizzes) ? course.quizzes : [];
  const locked = !isEnrolled || !isStudent;
  const showContent = isStudent && isEnrolled && !contentLoading;
  const showContentSpinner = isStudent && isEnrolled && contentLoading;

  return (
    <>
      <PageHeader title={course.title} crumbs={[{ label: COURSE_DETAIL.CRUMB, to: '/courses' }, { label: course.title, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <Box className="overflow-hidden rounded-2xl shadow-lg" sx={{ border: 1, borderColor: 'divider' }}>
            <Box component="img" src={course.thumbnail_url || '/img/course-1.png'} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <div>
            <h2 className="font-display text-3xl font-bold text-primary">{course.title}</h2>
            <p className="mt-4 text-base-content/80">{course.description || COURSE_DETAIL.NO_DESC}</p>
            <p className="mt-4 text-sm text-base-content/70">
              <strong>{COURSE_DETAIL.LEVEL}:</strong> {course.level || '—'} · <strong>{COURSE_DETAIL.DURATION}:</strong>{' '}
              {course.duration_hours != null ? `${course.duration_hours} ${COMMON.HOURS}` : '—'}
            </p>
            {msg ? (
              <Alert severity={enrollOk ? 'success' : 'info'} sx={{ mt: 2 }}>
                {msg}
              </Alert>
            ) : null}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
              {isStudent && isEnrolled ? (
                <Button type="button" variant="outlined" color="primary" component={Link} to={`/dashboard/student`}>
                  {COURSE_DETAIL.GO_DASHBOARD}
                </Button>
              ) : null}
              {isStudent && isEnrolled ? (
                <Button type="button" variant="text" color="primary" href="#lectures-section" sx={{ alignSelf: 'center' }}>
                  {COURSE_DETAIL.GO_STUDY}
                </Button>
              ) : (
                <Button type="button" variant="contained" color="primary" disabled={enrolling} onClick={openEnrollFlow}>
                  {enrolling ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                  {enrolling ? COURSE_DETAIL.ENROLLING : COURSE_DETAIL.ENROLL}
                </Button>
              )}
            </Stack>
          </div>
        </div>

        <Divider sx={{ my: 6 }} />

        <Box
          id="lectures-section"
          component="section"
          sx={{
            scrollMarginTop: { xs: 72, md: 96 },
            mb: 6,
          }}
        >
          <Paper
            elevation={0}
            sx={(theme) => ({
              p: { xs: 2.5, md: 3 },
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.12)
                  : `linear-gradient(125deg, ${alpha(theme.palette.primary.main, 0.09)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 48%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            })}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'flex-start' }} justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    flexShrink: 0,
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.14),
                  })}
                >
                  <BookOpen className="h-7 w-7" aria-hidden />
                </Box>
                <Box>
                  <Typography
                    component="h2"
                    variant="h4"
                    className="font-display"
                    sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}
                  >
                    {COURSE_DETAIL.SECTION_LECTURES}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 560 }}>
                    {COURSE_DETAIL.LECTURES_SUBTITLE}
                  </Typography>
                  {showContent && lectures.length > 0 ? (
                    <Chip
                      size="small"
                      icon={<ListVideo className="h-3.5 w-3.5" aria-hidden />}
                      label={`${lectures.length} bài`}
                      sx={{ mt: 1.5, fontWeight: 700 }}
                      color="primary"
                      variant="outlined"
                    />
                  ) : null}
                </Box>
              </Stack>
            </Stack>
          </Paper>

          {showContentSpinner ? (
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={28} />
              <Typography color="text.secondary">{COMMON.LOADING}</Typography>
            </Paper>
          ) : null}
          {locked && !showContentSpinner ? (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              {COURSE_DETAIL.LOCKED_HINT}
            </Alert>
          ) : null}
          {showContent && lectures.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                py: 6,
                px: 3,
                textAlign: 'center',
                borderRadius: 2,
                borderStyle: 'dashed',
                bgcolor: 'action.hover',
              }}
            >
              <ListVideo className="mx-auto mb-2 h-10 w-10 opacity-35" aria-hidden />
              <Typography color="text.secondary">{COURSE_DETAIL.NO_LECTURES}</Typography>
            </Paper>
          ) : null}
          {showContent && lectures.length > 0 ? (
            <Stack spacing={1.5} sx={{ '& .MuiAccordion-root': { borderRadius: '12px !important', overflow: 'hidden' } }}>
              {lectures.map((lec, li) => {
                const blocks = Array.isArray(lec.blocks) ? lec.blocks : [];
                const nBlocks = blocks.length;
                return (
                  <Accordion
                    key={lec.id}
                    disableGutters
                    elevation={0}
                    sx={(theme) => ({
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      '&:before': { display: 'none' },
                      boxShadow: theme.palette.mode === 'dark' ? 'none' : `0 1px 2px ${alpha(theme.palette.common.black, 0.04)}`,
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&.Mui-expanded': {
                        boxShadow: theme.palette.mode === 'dark' ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.35)}` : `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                        borderColor: alpha(theme.palette.primary.main, 0.45),
                      },
                    })}
                  >
                    <AccordionSummary
                      expandIcon={<ChevronDown className="h-5 w-5 shrink-0 opacity-75" aria-hidden />}
                      sx={(theme) => ({
                        px: 2,
                        py: 1.25,
                        minHeight: 64,
                        '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2, my: 1 },
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04) },
                      })}
                    >
                      <Box
                        sx={(theme) => ({
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          color: 'primary.main',
                        })}
                      >
                        {li + 1}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, typography: 'subtitle1' }}>{lec.title}</Typography>
                        {nBlocks > 0 ? (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                            {COURSE_DETAIL.LECTURE_PARTS.replace('{n}', String(nBlocks))}
                          </Typography>
                        ) : null}
                      </Box>
                      {nBlocks > 0 ? (
                        <Chip label={nBlocks} size="small" sx={{ fontWeight: 800, display: { xs: 'none', sm: 'flex' } }} />
                      ) : null}
                    </AccordionSummary>
                    <AccordionDetails
                      sx={(theme) => ({
                        px: 2,
                        pb: 2.5,
                        pt: 0,
                        bgcolor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.25 : 0.35),
                        borderTop: `1px solid ${theme.palette.divider}`,
                      })}
                    >
                      {blocks.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                          —
                        </Typography>
                      ) : (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                          {blocks.map((blk, bi) => {
                            const yid = blk.video_url ? youtubeVideoId(blk.video_url) : null;
                            return (
                              <Paper
                                key={bi}
                                elevation={0}
                                sx={(theme) => ({
                                  p: 2,
                                  borderRadius: 2,
                                  border: `1px solid ${theme.palette.divider}`,
                                  bgcolor: 'background.paper',
                                })}
                              >
                                {blk.title ? (
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                                    {blk.title}
                                  </Typography>
                                ) : null}
                                {yid ? (
                                  <Box
                                    sx={(theme) => ({
                                      position: 'relative',
                                      pb: '56.25%',
                                      height: 0,
                                      overflow: 'hidden',
                                      borderRadius: 2,
                                      mb: blk.content ? 2 : 0,
                                      boxShadow: theme.palette.mode === 'dark' ? 0 : `0 4px 20px ${alpha(theme.palette.common.black, 0.12)}`,
                                    })}
                                  >
                                    <Box
                                      component="iframe"
                                      title={blk.title || lec.title}
                                      src={`https://www.youtube.com/embed/${yid}`}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                    />
                                  </Box>
                                ) : blk.video_url ? (
                                  <MuiLink
                                    href={blk.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ display: 'inline-block', mb: blk.content ? 2 : 0, fontWeight: 600 }}
                                  >
                                    {COURSE_DETAIL.OPEN_VIDEO}
                                  </MuiLink>
                                ) : null}
                                {blk.content ? (
                                  <Typography
                                    component="div"
                                    sx={{
                                      whiteSpace: 'pre-wrap',
                                      typography: 'body2',
                                      color: 'text.primary',
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {blk.content}
                                  </Typography>
                                ) : null}
                                {!blk.content && !blk.video_url && !blk.title ? (
                                  <Typography variant="body2" color="text.secondary">
                                    —
                                  </Typography>
                                ) : null}
                              </Paper>
                            );
                          })}
                        </Stack>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          ) : null}
        </Box>

        <Typography component="h2" variant="h5" className="font-display" sx={{ fontWeight: 700, mb: 2 }}>
          {COURSE_DETAIL.SECTION_QUIZZES}
        </Typography>
        {locked && !showContentSpinner ? (
          <Typography color="text.secondary">{COURSE_DETAIL.LOCKED_QUIZZES}</Typography>
        ) : null}
        {showContent && quizzes.length === 0 ? (
          <Typography color="text.secondary">{COURSE_DETAIL.NO_QUIZZES}</Typography>
        ) : null}
        {showContent && quizzes.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {quizzes.map((quiz) => {
              const answers = quizAnswers[quiz.id] || [];
              const res = quizResults[quiz.id];
              return (
                <Paper key={quiz.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {quiz.title}
                  </Typography>
                  {quiz.description ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {quiz.description}
                    </Typography>
                  ) : null}
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(quiz.questions || []).map((q, qi) => (
                      <FormControl key={`${quiz.id}-q-${qi}`} component="fieldset" variant="standard" fullWidth>
                        <Typography component="legend" sx={{ mb: 1, fontWeight: 600, typography: 'body2' }}>
                          {qi + 1}. {q.question}
                        </Typography>
                        <RadioGroup
                          value={typeof answers[qi] === 'number' && answers[qi] >= 0 ? answers[qi] : ''}
                          onChange={(e) => setAnswerForQuiz(quiz.id, qi, Number(e.target.value))}
                        >
                          {(q.options || []).map((opt, oi) => (
                            <FormControlLabel
                              key={oi}
                              value={oi}
                              control={<Radio size="small" />}
                              label={`${String.fromCharCode(65 + oi)}. ${opt}`}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    ))}
                  </Box>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ mt: 2 }}
                    disabled={submittingQuizId === quiz.id}
                    onClick={() => submitQuiz(quiz.id)}
                  >
                    {submittingQuizId === quiz.id ? (
                      <>
                        <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                        {COURSE_DETAIL.SUBMITTING_QUIZ}
                      </>
                    ) : (
                      COURSE_DETAIL.SUBMIT_QUIZ
                    )}
                  </Button>
                  {res?.error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {res.error}
                    </Alert>
                  ) : null}
                  {res && !res.error && typeof res.correct === 'number' ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      {formatQuizScore(COURSE_DETAIL.QUIZ_SCORE, res.correct, res.total, res.percent)}
                    </Alert>
                  ) : null}
                </Paper>
              );
            })}
          </Box>
        ) : null}
      </div>

      <Dialog open={enrollDialogOpen} onClose={() => setEnrollDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{COURSE_DETAIL.DIALOG_AUTH_TITLE}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {COURSE_DETAIL.DIALOG_AUTH_BODY}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setEnrollDialogOpen(false)}>{COMMON.CANCEL}</Button>
          <Button variant="outlined" component={Link} to="/login" state={{ from: returnPathForAuth }} onClick={() => setEnrollDialogOpen(false)}>
            {COURSE_DETAIL.DIALOG_LOGIN}
          </Button>
          <Button variant="contained" component={Link} to="/signup" state={{ from: returnPathForAuth }} onClick={() => setEnrollDialogOpen(false)}>
            {COURSE_DETAIL.DIALOG_SIGNUP}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={nonStudentDialogOpen} onClose={() => setNonStudentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{COURSE_DETAIL.DIALOG_ROLE_TITLE}</DialogTitle>
        <DialogContent>
          <Alert severity="warning">{COURSE_DETAIL.ONLY_STUDENT}</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNonStudentDialogOpen(false)}>{COMMON.CANCEL}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
