import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/useAuth';
import { apiFetch } from '../lib/api';
import { DASH_ADMIN } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

const TAB_KEYS = ['users', 'courses'];

const DEFAULT_QUIZ_JSON = `[
  {"question": "2 + 2 bằng mấy?", "options": ["3", "4", "5"], "correctIndex": 1}
]`;

function ZebraTable({ children }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, boxShadow: 1 }}>
      <Table size="small">
        {children}
      </Table>
    </TableContainer>
  );
}

export function DashboardAdmin() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [tab, setTab] = useState('users');

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);

  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '/img/course-1.png',
    category_id: '',
    published: true,
    price_cents: 0,
    duration_hours: '',
    level: DASH_ADMIN.LEVEL_DEFAULT,
    rating: '',
    learners_count: '',
  });

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseSubTab, setCourseSubTab] = useState('lectures');
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [lectureForm, setLectureForm] = useState({ title: '', content: '', video_url: '' });
  const [quizForm, setQuizForm] = useState({ title: '', description: '', questionsJson: DEFAULT_QUIZ_JSON });

  const loadUsersCourses = useCallback(async () => {
    if (!token) return;
    const [u, ca, cr] = await Promise.all([
      apiFetch('/api/admin/users', {}, token),
      apiFetch('/api/categories'),
      apiFetch('/api/admin/courses', {}, token),
    ]);
    setUsers(u || []);
    setCategories(ca || []);
    setCourses(cr || []);
  }, [token]);

  const loadLecturesQuizzes = useCallback(async () => {
    if (!token || !selectedCourseId) {
      setLectures([]);
      setQuizzes([]);
      return;
    }
    const [lec, qz] = await Promise.all([
      apiFetch(`/api/admin/courses/${selectedCourseId}/lectures`, {}, token),
      apiFetch(`/api/admin/courses/${selectedCourseId}/quizzes`, {}, token),
    ]);
    setLectures(lec || []);
    setQuizzes(qz || []);
  }, [token, selectedCourseId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token) return;
        await loadUsersCourses();
      } catch (e) {
        if (!cancelled) toast.error(e.message || ERR.LOAD_FAILED);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loadUsersCourses]);

  useEffect(() => {
    if (courses.length === 0) {
      setSelectedCourseId('');
      return;
    }
    setSelectedCourseId((prev) => {
      if (prev && courses.some((c) => c.id === prev)) return prev;
      return courses[0].id;
    });
  }, [courses]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token || !selectedCourseId) return;
        await loadLecturesQuizzes();
      } catch (e) {
        if (!cancelled) toast.error(e.message || ERR.LOAD_FAILED);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, selectedCourseId, loadLecturesQuizzes]);

  async function updateRole(userId, role) {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }, token);
      toast.success(DASH_ADMIN.ROLE_UPDATED);
      await loadUsersCourses();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function addCourse(e) {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/admin/courses',
        {
          method: 'POST',
          body: JSON.stringify({
            title: courseForm.title,
            slug: courseForm.slug,
            description: courseForm.description || null,
            thumbnail_url: courseForm.thumbnail_url || null,
            category_id: courseForm.category_id || null,
            published: courseForm.published,
            price_cents: Number(courseForm.price_cents) || 0,
            duration_hours: courseForm.duration_hours === '' ? null : Number(courseForm.duration_hours),
            level: courseForm.level || null,
            rating: courseForm.rating === '' ? null : Number(courseForm.rating),
            learners_count: courseForm.learners_count || null,
          }),
        },
        token,
      );
      toast.success(DASH_ADMIN.COURSE_CREATED);
      await loadUsersCourses();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function deleteCourse(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL_COURSE)) return;
    try {
      await apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' }, token);
      toast.success(DASH_ADMIN.TOAST_DELETED);
      await loadUsersCourses();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function addLecture(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      await apiFetch(
        `/api/admin/courses/${selectedCourseId}/lectures`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: lectureForm.title,
            content: lectureForm.content || null,
            video_url: lectureForm.video_url || null,
          }),
        },
        token,
      );
      setLectureForm({ title: '', content: '', video_url: '' });
      toast.success(DASH_ADMIN.TOAST_LECTURE_ADDED);
      await loadLecturesQuizzes();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function deleteLecture(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL_LECTURE)) return;
    try {
      await apiFetch(`/api/admin/lectures/${id}`, { method: 'DELETE' }, token);
      toast.success(DASH_ADMIN.TOAST_DELETED);
      await loadLecturesQuizzes();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function addQuiz(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    let questions;
    try {
      questions = JSON.parse(quizForm.questionsJson || '[]');
    } catch {
      toast.error(ERR.INVALID_JSON);
      return;
    }
    if (!Array.isArray(questions)) {
      toast.error(ERR.INVALID_JSON);
      return;
    }
    try {
      await apiFetch(
        `/api/admin/courses/${selectedCourseId}/quizzes`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: quizForm.title,
            description: quizForm.description || null,
            questions,
          }),
        },
        token,
      );
      setQuizForm({ title: '', description: '', questionsJson: DEFAULT_QUIZ_JSON });
      toast.success(DASH_ADMIN.TOAST_QUIZ_ADDED);
      await loadLecturesQuizzes();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function deleteQuiz(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL_QUIZ)) return;
    try {
      await apiFetch(`/api/admin/quizzes/${id}`, { method: 'DELETE' }, token);
      toast.success(DASH_ADMIN.TOAST_DELETED);
      await loadLecturesQuizzes();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  const rowSx = { '&:nth-of-type(odd)': { bgcolor: 'action.hover' } };

  return (
    <>
      <PageHeader title={DASH_ADMIN.TITLE} crumbs={[{ label: DASH_ADMIN.CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mt: 2, bgcolor: 'action.hover', borderRadius: 2, px: 0.5, minHeight: 48 }}
        >
          {TAB_KEYS.map((k) => (
            <Tab key={k} value={k} label={DASH_ADMIN.TABS[k]} sx={{ textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>

        <Box sx={{ mt: 4 }}>
          {tab === 'users' && (
            <ZebraTable>
              <TableHead>
                <TableRow>
                  <TableCell>{DASH_ADMIN.TH_NAME}</TableCell>
                  <TableCell>{DASH_ADMIN.TH_ID}</TableCell>
                  <TableCell>{DASH_ADMIN.TH_ROLE}</TableCell>
                  <TableCell>{DASH_ADMIN.TH_CHANGE}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} sx={rowSx}>
                    <TableCell>{u.full_name}</TableCell>
                    <TableCell>
                      <Typography component="code" variant="caption">
                        {u.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id={`role-${u.id}`} shrink>
                          {DASH_ADMIN.TH_CHANGE}
                        </InputLabel>
                        <Select
                          labelId={`role-${u.id}`}
                          label={DASH_ADMIN.TH_CHANGE}
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                        >
                          <MenuItem value="student">{DASH_ADMIN.ROLE_STUDENT}</MenuItem>
                          <MenuItem value="admin">{DASH_ADMIN.ROLE_ADMIN}</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ZebraTable>
          )}

          {tab === 'courses' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Card variant="outlined" component="form" onSubmit={addCourse}>
                <CardContent sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                  <TextField
                    size="small"
                    label={DASH_ADMIN.LABEL_COURSE_TITLE}
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <TextField
                    size="small"
                    label="Slug"
                    required
                    value={courseForm.slug}
                    onChange={(e) => setCourseForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                  <TextField
                    size="small"
                    label={DASH_ADMIN.LABEL_COURSE_DESC}
                    multiline
                    rows={2}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
                    sx={{ gridColumn: { md: '1 / -1' } }}
                  />
                  <FormControl size="small">
                    <InputLabel id="cat-select">{DASH_ADMIN.LABEL_CATEGORY}</InputLabel>
                    <Select
                      labelId="cat-select"
                      label={DASH_ADMIN.LABEL_CATEGORY}
                      value={courseForm.category_id}
                      onChange={(e) => setCourseForm((f) => ({ ...f, category_id: e.target.value }))}
                    >
                      <MenuItem value="">—</MenuItem>
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label={DASH_ADMIN.LABEL_THUMB}
                    value={courseForm.thumbnail_url}
                    onChange={(e) => setCourseForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
                    sx={{ gridColumn: { md: '1 / -1' } }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label={DASH_ADMIN.LABEL_PRICE_CENTS}
                    value={courseForm.price_cents}
                    onChange={(e) => setCourseForm((f) => ({ ...f, price_cents: e.target.value }))}
                  />
                  <TextField
                    size="small"
                    label={DASH_ADMIN.LABEL_DURATION_H}
                    value={courseForm.duration_hours}
                    onChange={(e) => setCourseForm((f) => ({ ...f, duration_hours: e.target.value }))}
                  />
                  <TextField
                    size="small"
                    label={DASH_ADMIN.LABEL_LEVEL}
                    value={courseForm.level}
                    onChange={(e) => setCourseForm((f) => ({ ...f, level: e.target.value }))}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={courseForm.published}
                        onChange={(e) => setCourseForm((f) => ({ ...f, published: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label={DASH_ADMIN.LABEL_PUBLISHED}
                    sx={{ gridColumn: { md: '1 / -1' } }}
                  />
                  <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                    <Button type="submit" variant="contained" color="primary" size="small">
                      {DASH_ADMIN.ADD_COURSE}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              <ZebraTable>
                <TableHead>
                  <TableRow>
                    <TableCell>{DASH_ADMIN.TH_COURSE_TITLE}</TableCell>
                    <TableCell>{DASH_ADMIN.TH_COURSE_SLUG}</TableCell>
                    <TableCell>{DASH_ADMIN.TH_COURSE_PUBLISHED}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((c) => (
                    <TableRow key={c.id} sx={rowSx}>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>
                        <Typography component="code" variant="caption">
                          {c.slug}
                        </Typography>
                      </TableCell>
                      <TableCell>{c.published ? COMMON.YES : COMMON.NO}</TableCell>
                      <TableCell>
                        <Button type="button" variant="outlined" color="error" size="small" onClick={() => deleteCourse(c.id)}>
                          {COMMON.DELETE}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </ZebraTable>

              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {DASH_ADMIN.COURSE_CONTENT}
              </Typography>
              <FormControl size="small" sx={{ maxWidth: 420 }}>
                <InputLabel id="pick-course">{DASH_ADMIN.PICK_COURSE}</InputLabel>
                <Select
                  labelId="pick-course"
                  label={DASH_ADMIN.PICK_COURSE}
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={courses.length === 0}
                >
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedCourseId ? (
                <>
                  <Tabs
                    value={courseSubTab}
                    onChange={(_, v) => setCourseSubTab(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                  >
                    <Tab value="lectures" label={DASH_ADMIN.SUBTAB_LECTURES} sx={{ textTransform: 'none', fontWeight: 600 }} />
                    <Tab value="quizzes" label={DASH_ADMIN.SUBTAB_QUIZZES} sx={{ textTransform: 'none', fontWeight: 600 }} />
                  </Tabs>

                  {courseSubTab === 'lectures' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      <Paper component="form" variant="outlined" onSubmit={addLecture} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          size="small"
                          label={DASH_ADMIN.LECTURE_TITLE}
                          required
                          value={lectureForm.title}
                          onChange={(e) => setLectureForm((f) => ({ ...f, title: e.target.value }))}
                        />
                        <TextField
                          size="small"
                          label={DASH_ADMIN.LECTURE_CONTENT}
                          multiline
                          minRows={2}
                          value={lectureForm.content}
                          onChange={(e) => setLectureForm((f) => ({ ...f, content: e.target.value }))}
                        />
                        <TextField
                          size="small"
                          label={DASH_ADMIN.LECTURE_VIDEO}
                          value={lectureForm.video_url}
                          onChange={(e) => setLectureForm((f) => ({ ...f, video_url: e.target.value }))}
                        />
                        <Button type="submit" variant="contained" color="primary" size="small" sx={{ alignSelf: 'flex-start' }}>
                          {DASH_ADMIN.ADD_LECTURE}
                        </Button>
                      </Paper>
                      <ZebraTable>
                        <TableHead>
                          <TableRow>
                            <TableCell>{DASH_ADMIN.TH_LECTURE_TITLE}</TableCell>
                            <TableCell>{DASH_ADMIN.LECTURE_VIDEO}</TableCell>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {lectures.map((lec) => (
                            <TableRow key={lec.id} sx={rowSx}>
                              <TableCell>{lec.title}</TableCell>
                              <TableCell sx={{ maxWidth: 200 }}>
                                <Typography variant="caption" noWrap component="span" title={lec.video_url || ''}>
                                  {lec.video_url || '—'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Button type="button" variant="outlined" color="error" size="small" onClick={() => deleteLecture(lec.id)}>
                                  {COMMON.DELETE}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </ZebraTable>
                    </Box>
                  )}

                  {courseSubTab === 'quizzes' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      <Paper component="form" variant="outlined" onSubmit={addQuiz} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          size="small"
                          label={DASH_ADMIN.QUIZ_TITLE}
                          required
                          value={quizForm.title}
                          onChange={(e) => setQuizForm((f) => ({ ...f, title: e.target.value }))}
                        />
                        <TextField
                          size="small"
                          label={DASH_ADMIN.QUIZ_DESC}
                          value={quizForm.description}
                          onChange={(e) => setQuizForm((f) => ({ ...f, description: e.target.value }))}
                        />
                        <TextField
                          size="small"
                          label={DASH_ADMIN.QUIZ_QUESTIONS_JSON}
                          helperText={DASH_ADMIN.QUIZ_JSON_HINT}
                          multiline
                          minRows={4}
                          value={quizForm.questionsJson}
                          onChange={(e) => setQuizForm((f) => ({ ...f, questionsJson: e.target.value }))}
                          sx={{ fontFamily: 'monospace' }}
                        />
                        <Button type="submit" variant="contained" color="primary" size="small" sx={{ alignSelf: 'flex-start' }}>
                          {DASH_ADMIN.ADD_QUIZ}
                        </Button>
                      </Paper>
                      <ZebraTable>
                        <TableHead>
                          <TableRow>
                            <TableCell>{DASH_ADMIN.TH_QUIZ_TITLE}</TableCell>
                            <TableCell>{DASH_ADMIN.QUIZ_DESC}</TableCell>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {quizzes.map((q) => (
                            <TableRow key={q.id} sx={rowSx}>
                              <TableCell>{q.title}</TableCell>
                              <TableCell sx={{ maxWidth: 280 }}>
                                <Typography variant="body2" color="text.secondary" noWrap title={q.description || ''}>
                                  {q.description || '—'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Button type="button" variant="outlined" color="error" size="small" onClick={() => deleteQuiz(q.id)}>
                                  {COMMON.DELETE}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </ZebraTable>
                    </Box>
                  )}
                </>
              ) : (
                <Typography color="text.secondary">{DASH_ADMIN.PICK_COURSE}</Typography>
              )}
            </Box>
          )}
        </Box>
      </div>
    </>
  );
}
