import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ListChecks, ListVideo, Pencil, PlusCircle, Trash2, UserPlus } from 'lucide-react';
import { AdminDataTable, adminBodyRowSx, adminHeaderCellSx } from '../components/admin/AdminDataTable';
import { AdminSectionCard } from '../components/admin/AdminSectionCard';
import { AdminShell } from '../components/admin/AdminShell';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/useAuth';
import { apiFetch } from '../lib/api';
import { DASH_ADMIN } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

function newLectureBlock() {
  return { title: '', content: '', video_url: '' };
}

/** Build form blocks from API row (blocks JSON or legacy content/video_url). */
function blocksFromLectureForForm(lec) {
  const raw = lec.blocks;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((b) => ({
      title: b?.title != null ? String(b.title) : '',
      content: b?.content != null ? String(b.content) : '',
      video_url: b?.video_url != null ? String(b.video_url) : '',
    }));
  }
  const c = lec.content != null ? String(lec.content) : '';
  const v = lec.video_url != null ? String(lec.video_url) : '';
  if (c.trim() || v.trim()) {
    return [{ title: '', content: c, video_url: v }];
  }
  return [newLectureBlock()];
}

function newQuizQuestion() {
  return {
    _id: globalThis.crypto?.randomUUID?.() ?? `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    question: '',
    a: '',
    b: '',
    c: '',
    d: '',
    correct: 0,
  };
}

function countLectureBlocks(lec) {
  const raw = lec.blocks;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter((b) => b && (b.title || b.content || b.video_url)).length || raw.length;
  }
  if (lec.content || lec.video_url) return 1;
  return 0;
}

const INITIAL_USER_FORM = { email: '', password: '', full_name: '', role: 'student' };

const INITIAL_COURSE_FORM = {
  title: '',
  description: '',
  thumbnail_url: '/img/course-1.png',
  category_id: '',
  published: true,
  duration_hours: '',
  level: DASH_ADMIN.LEVEL_DEFAULT,
  rating: '',
  learners_count: '',
};

export function DashboardAdmin() {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const [tab, setTab] = useState('users');

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);

  const [courseForm, setCourseForm] = useState(() => ({ ...INITIAL_COURSE_FORM }));

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseSubTab, setCourseSubTab] = useState('lectures');
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [lectureForm, setLectureForm] = useState(() => ({ title: '', blocks: [newLectureBlock()] }));
  const [lectureEditOpen, setLectureEditOpen] = useState(false);
  const [lectureEditingId, setLectureEditingId] = useState(null);
  const [lectureEditForm, setLectureEditForm] = useState(() => ({ title: '', blocks: [newLectureBlock()] }));
  const [quizForm, setQuizForm] = useState(() => ({ title: '', description: '', questions: [newQuizQuestion()] }));

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userEditingId, setUserEditingId] = useState(null);
  const [userForm, setUserForm] = useState(() => ({ ...INITIAL_USER_FORM }));

  const [courseEditOpen, setCourseEditOpen] = useState(false);
  const [courseEditingId, setCourseEditingId] = useState(null);
  const [courseEditForm, setCourseEditForm] = useState(() => ({
    title: '',
    description: '',
    thumbnail_url: '/img/course-1.png',
    category_id: '',
    published: true,
    duration_hours: '',
    level: DASH_ADMIN.LEVEL_DEFAULT,
  }));

  const [enrollReport, setEnrollReport] = useState(null);
  const [enrollCourseFilter, setEnrollCourseFilter] = useState('');

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

  const loadEnrollReport = useCallback(async () => {
    if (!token) return;
    const data = await apiFetch('/api/admin/enrollments', {}, token);
    setEnrollReport(data);
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (tab !== 'enrollments' || !token) return;
      try {
        await loadEnrollReport();
      } catch (e) {
        if (!cancelled) toast.error(e.message || ERR.LOAD_ENROLL_REPORT);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, token, loadEnrollReport]);

  function openCreateUser() {
    setUserEditingId(null);
    setUserForm({ ...INITIAL_USER_FORM });
    setUserDialogOpen(true);
  }

  function openEditUser(u) {
    setUserEditingId(u.id);
    setUserForm({
      email: u.email || '',
      password: '',
      full_name: u.full_name || '',
      role: u.role || 'student',
    });
    setUserDialogOpen(true);
  }

  async function submitUserForm(e) {
    e.preventDefault();
    const isCreate = !userEditingId;
    if (!userForm.email.trim()) {
      toast.error(DASH_ADMIN.EMAIL_REQUIRED);
      return;
    }
    if (isCreate && !userForm.password) {
      toast.error(DASH_ADMIN.PASSWORD_REQUIRED);
      return;
    }
    try {
      if (isCreate) {
        await apiFetch(
          '/api/admin/users',
          {
            method: 'POST',
            body: JSON.stringify({
              email: userForm.email.trim(),
              password: userForm.password,
              full_name: userForm.full_name.trim() || null,
              role: userForm.role,
            }),
          },
          token,
        );
        toast.success(DASH_ADMIN.USER_CREATED);
      } else {
        const body = {
          email: userForm.email.trim(),
          full_name: userForm.full_name.trim() || null,
          role: userForm.role,
        };
        if (userForm.password) body.password = userForm.password;
        await apiFetch(`/api/admin/users/${userEditingId}`, { method: 'PATCH', body: JSON.stringify(body) }, token);
        toast.success(DASH_ADMIN.USER_UPDATED);
      }
      setUserDialogOpen(false);
      await loadUsersCourses();
    } catch (err) {
      toast.error(err.data?.error || err.message);
    }
  }

  async function deleteUserRow(userId) {
    if (userId === user?.id) {
      toast.error(DASH_ADMIN.CANNOT_DELETE_SELF);
      return;
    }
    if (!confirm(DASH_ADMIN.CONFIRM_DEL_USER)) return;
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' }, token);
      toast.success(DASH_ADMIN.TOAST_DELETED);
      await loadUsersCourses();
    } catch (err) {
      toast.error(err.data?.error || err.message);
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
            description: courseForm.description || null,
            thumbnail_url: courseForm.thumbnail_url || null,
            category_id: courseForm.category_id || null,
            published: courseForm.published,
            duration_hours: courseForm.duration_hours === '' ? null : Number(courseForm.duration_hours),
            level: courseForm.level || null,
            rating: courseForm.rating === '' ? null : Number(courseForm.rating),
            learners_count: courseForm.learners_count || null,
          }),
        },
        token,
      );
      toast.success(DASH_ADMIN.COURSE_CREATED);
      setCourseForm({ ...INITIAL_COURSE_FORM });
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

  function openEditCourse(c) {
    setCourseEditingId(c.id);
    setCourseEditForm({
      title: c.title || '',
      description: c.description ?? '',
      thumbnail_url: c.thumbnail_url || '/img/course-1.png',
      category_id: c.category_id || '',
      published: !!c.published,
      duration_hours: c.duration_hours != null && c.duration_hours !== '' ? String(c.duration_hours) : '',
      level: c.level || DASH_ADMIN.LEVEL_DEFAULT,
    });
    setCourseEditOpen(true);
  }

  async function submitCourseEdit(e) {
    e.preventDefault();
    if (!courseEditingId) return;
    const title = String(courseEditForm.title || '').trim();
    if (!title) {
      toast.error(DASH_ADMIN.TITLE_REQUIRED);
      return;
    }
    try {
      await apiFetch(
        `/api/admin/courses/${courseEditingId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            title,
            description: courseEditForm.description?.trim() || null,
            thumbnail_url: courseEditForm.thumbnail_url?.trim() || null,
            category_id: courseEditForm.category_id || null,
            published: !!courseEditForm.published,
            duration_hours: courseEditForm.duration_hours === '' ? null : Number(courseEditForm.duration_hours),
            level: courseEditForm.level?.trim() || null,
          }),
        },
        token,
      );
      toast.success(DASH_ADMIN.COURSE_UPDATED);
      setCourseEditOpen(false);
      setCourseEditingId(null);
      await loadUsersCourses();
    } catch (err) {
      toast.error(err.data?.error || err.message);
    }
  }

  async function addLecture(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    const blocks = lectureForm.blocks
      .map((b) => ({
        title: (b.title || '').trim() || null,
        content: (b.content || '').trim() || null,
        video_url: (b.video_url || '').trim() || null,
      }))
      .filter((b) => b.title || b.content || b.video_url);
    if (!blocks.length) {
      toast.error(DASH_ADMIN.LECTURE_BLOCKS_EMPTY);
      return;
    }
    try {
      await apiFetch(
        `/api/admin/courses/${selectedCourseId}/lectures`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: lectureForm.title,
            blocks,
          }),
        },
        token,
      );
      setLectureForm({ title: '', blocks: [newLectureBlock()] });
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

  function openEditLecture(lec) {
    setLectureEditingId(lec.id);
    setLectureEditForm({
      title: lec.title || '',
      blocks: blocksFromLectureForForm(lec),
    });
    setLectureEditOpen(true);
  }

  async function submitLectureEdit(e) {
    e.preventDefault();
    if (!lectureEditingId) return;
    const title = String(lectureEditForm.title || '').trim();
    if (!title) {
      toast.error(DASH_ADMIN.LECTURE_TITLE_REQUIRED);
      return;
    }
    const blocks = lectureEditForm.blocks
      .map((b) => ({
        title: (b.title || '').trim() || null,
        content: (b.content || '').trim() || null,
        video_url: (b.video_url || '').trim() || null,
      }))
      .filter((b) => b.title || b.content || b.video_url);
    if (!blocks.length) {
      toast.error(DASH_ADMIN.LECTURE_BLOCKS_EMPTY);
      return;
    }
    try {
      await apiFetch(
        `/api/admin/lectures/${lectureEditingId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ title, blocks }),
        },
        token,
      );
      toast.success(DASH_ADMIN.TOAST_LECTURE_UPDATED);
      setLectureEditOpen(false);
      setLectureEditingId(null);
      await loadLecturesQuizzes();
    } catch (err) {
      toast.error(err.data?.error || err.message);
    }
  }

  async function addQuiz(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    const built = quizForm.questions
      .filter((row) => (row.question || '').trim())
      .map((row) => {
        const options = [row.a, row.b, row.c, row.d].map((s) => (s != null ? String(s).trim() : ''));
        const correct = Number(row.correct);
        const correctIndex = correct >= 0 && correct <= 3 ? correct : 0;
        return { question: row.question.trim(), options, correctIndex };
      });
    if (!built.length) {
      toast.error(DASH_ADMIN.QUIZ_NEED_QUESTION);
      return;
    }
    for (const q of built) {
      if (q.options.some((o) => !o)) {
        toast.error(DASH_ADMIN.QUIZ_OPTIONS_REQUIRED);
        return;
      }
    }
    try {
      await apiFetch(
        `/api/admin/courses/${selectedCourseId}/quizzes`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: quizForm.title,
            description: quizForm.description || null,
            questions: built,
          }),
        },
        token,
      );
      setQuizForm({ title: '', description: '', questions: [newQuizQuestion()] });
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

  return (
    <>
      <PageHeader title={DASH_ADMIN.TITLE} crumbs={[{ label: DASH_ADMIN.CRUMB, active: true }]} />
      <Box
        sx={{
          bgcolor: (t) => alpha(t.palette.grey[500], 0.06),
          py: { xs: 3, md: 4 },
          minHeight: { xs: '50vh', md: '56vh' },
        }}
      >
        <div className="container mx-auto max-w-6xl px-4">
          <AdminShell tab={tab} onTabChange={setTab}>
            {tab === 'users' && (
              <Stack spacing={3}>
                <AdminSectionCard
                  overline={DASH_ADMIN.LEAD_USERS}
                  title={DASH_ADMIN.TABS.users}
                  action={
                    <Button variant="contained" size="medium" startIcon={<UserPlus size={18} />} onClick={openCreateUser}>
                      {DASH_ADMIN.BTN_ADD_USER}
                    </Button>
                  }
                >
                  <AdminDataTable>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_NAME}</TableCell>
                        <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_EMAIL}</TableCell>
                        <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_ROLE}</TableCell>
                        <TableCell align="right" sx={adminHeaderCellSx}>
                          {DASH_ADMIN.TH_ACTIONS}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} sx={adminBodyRowSx}>
                          <TableCell>{u.full_name || '—'}</TableCell>
                          <TableCell>{u.email || '—'}</TableCell>
                          <TableCell>
                            {u.role === 'admin' ? (
                              <Chip label={DASH_ADMIN.ROLE_ADMIN} color="secondary" size="small" sx={{ fontWeight: 700 }} />
                            ) : (
                              <Chip label={DASH_ADMIN.ROLE_STUDENT} color="primary" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.75} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                              <Button type="button" variant="outlined" size="small" onClick={() => openEditUser(u)}>
                                {DASH_ADMIN.BTN_EDIT}
                              </Button>
                              <Tooltip title={DASH_ADMIN.DELETE_TOOLTIP}>
                                <span>
                                  <IconButton
                                    type="button"
                                    color="error"
                                    size="small"
                                    disabled={u.id === user?.id}
                                    onClick={() => deleteUserRow(u.id)}
                                    aria-label={DASH_ADMIN.DELETE_TOOLTIP}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </AdminDataTable>
                </AdminSectionCard>
              </Stack>
            )}

            {tab === 'courses' && (
              <Stack spacing={3}>
                <AdminSectionCard overline={DASH_ADMIN.LEAD_COURSES} title={DASH_ADMIN.SECTION_ADD_COURSE}>
                  <Box
                    component="form"
                    onSubmit={addCourse}
                    sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
                  >
                    <TextField
                      size="small"
                      label={DASH_ADMIN.LABEL_COURSE_TITLE}
                      required
                      value={courseForm.title}
                      onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))}
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
                      <Button type="submit" variant="contained" color="primary" size="medium" startIcon={<PlusCircle size={18} />}>
                        {DASH_ADMIN.ADD_COURSE}
                      </Button>
                    </Box>
                  </Box>
                </AdminSectionCard>

                <AdminSectionCard title={DASH_ADMIN.SECTION_COURSE_LIST}>
                  <AdminDataTable>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_COURSE_TITLE}</TableCell>
                        <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_COURSE_PUBLISHED}</TableCell>
                        <TableCell align="right" sx={adminHeaderCellSx}>
                          {DASH_ADMIN.TH_ACTIONS}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courses.map((c) => (
                        <TableRow key={c.id} sx={adminBodyRowSx}>
                          <TableCell sx={{ fontWeight: 600 }}>{c.title}</TableCell>
                          <TableCell>
                            {c.published ? (
                              <Chip label={DASH_ADMIN.STATUS_PUBLISHED} color="success" size="small" sx={{ fontWeight: 700 }} />
                            ) : (
                              <Chip label={DASH_ADMIN.STATUS_DRAFT} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title={DASH_ADMIN.EDIT_TOOLTIP}>
                                <IconButton type="button" color="primary" size="small" onClick={() => openEditCourse(c)} aria-label={DASH_ADMIN.EDIT_TOOLTIP}>
                                  <Pencil className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={DASH_ADMIN.DELETE_TOOLTIP}>
                                <IconButton type="button" color="error" size="small" onClick={() => deleteCourse(c.id)} aria-label={DASH_ADMIN.DELETE_TOOLTIP}>
                                  <Trash2 className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </AdminDataTable>
                </AdminSectionCard>

                <AdminSectionCard title={DASH_ADMIN.COURSE_CONTENT}>
              <FormControl size="small" sx={{ maxWidth: 420, mb: 2 }}>
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
                  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                    <Tabs
                      value={courseSubTab}
                      onChange={(_, v) => setCourseSubTab(v)}
                      sx={{
                        bgcolor: 'action.hover',
                        minHeight: 48,
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 48 },
                      }}
                      TabIndicatorProps={{ sx: { bgcolor: 'primary.main', height: 3 } }}
                    >
                      <Tab value="lectures" label={DASH_ADMIN.SUBTAB_LECTURES} />
                      <Tab value="quizzes" label={DASH_ADMIN.SUBTAB_QUIZZES} />
                    </Tabs>
                  </Paper>

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
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {DASH_ADMIN.LECTURE_BLOCKS}
                        </Typography>
                        {lectureForm.blocks.map((blk, idx) => (
                          <Paper
                            key={idx}
                            variant="outlined"
                            sx={{ p: 2, pt: lectureForm.blocks.length > 1 ? 4 : 2, position: 'relative' }}
                          >
                            {lectureForm.blocks.length > 1 ? (
                              <IconButton
                                type="button"
                                size="small"
                                aria-label={DASH_ADMIN.REMOVE_LECTURE_BLOCK}
                                onClick={() =>
                                  setLectureForm((f) => ({
                                    ...f,
                                    blocks: f.blocks.filter((_, i) => i !== idx),
                                  }))
                                }
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </IconButton>
                            ) : null}
                            <Stack spacing={1.5}>
                              <TextField
                                size="small"
                                label={DASH_ADMIN.LECTURE_BLOCK_TITLE}
                                value={blk.title}
                                onChange={(e) => {
                                  const next = [...lectureForm.blocks];
                                  next[idx] = { ...next[idx], title: e.target.value };
                                  setLectureForm((f) => ({ ...f, blocks: next }));
                                }}
                              />
                              <TextField
                                size="small"
                                label={DASH_ADMIN.LECTURE_BLOCK_CONTENT}
                                multiline
                                minRows={2}
                                value={blk.content}
                                onChange={(e) => {
                                  const next = [...lectureForm.blocks];
                                  next[idx] = { ...next[idx], content: e.target.value };
                                  setLectureForm((f) => ({ ...f, blocks: next }));
                                }}
                              />
                              <TextField
                                size="small"
                                label={DASH_ADMIN.LECTURE_BLOCK_VIDEO}
                                value={blk.video_url}
                                onChange={(e) => {
                                  const next = [...lectureForm.blocks];
                                  next[idx] = { ...next[idx], video_url: e.target.value };
                                  setLectureForm((f) => ({ ...f, blocks: next }));
                                }}
                              />
                            </Stack>
                          </Paper>
                        ))}
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          sx={{ alignSelf: 'flex-start' }}
                          onClick={() => setLectureForm((f) => ({ ...f, blocks: [...f.blocks, newLectureBlock()] }))}
                        >
                          {DASH_ADMIN.ADD_LECTURE_BLOCK}
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="medium"
                          startIcon={<ListVideo size={18} />}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          {DASH_ADMIN.ADD_LECTURE}
                        </Button>
                      </Paper>
                      <AdminDataTable>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_LECTURE_TITLE}</TableCell>
                            <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_LECTURE_BLOCKS}</TableCell>
                            <TableCell align="right" sx={adminHeaderCellSx}>
                              {DASH_ADMIN.TH_ACTIONS}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {lectures.map((lec) => (
                            <TableRow key={lec.id} sx={adminBodyRowSx}>
                              <TableCell>{lec.title}</TableCell>
                              <TableCell>{countLectureBlocks(lec)}</TableCell>
                              <TableCell align="right">
                                <Tooltip title={DASH_ADMIN.EDIT_TOOLTIP}>
                                  <IconButton type="button" color="primary" size="small" onClick={() => openEditLecture(lec)} aria-label={DASH_ADMIN.EDIT_TOOLTIP}>
                                    <Pencil className="h-4 w-4" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={DASH_ADMIN.DELETE_TOOLTIP}>
                                  <IconButton type="button" color="error" size="small" onClick={() => deleteLecture(lec.id)} aria-label={DASH_ADMIN.DELETE_TOOLTIP}>
                                    <Trash2 className="h-4 w-4" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </AdminDataTable>
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {DASH_ADMIN.QUIZ_QUESTIONS_SECTION}
                        </Typography>
                        {quizForm.questions.map((row, qIdx) => (
                          <Paper
                            key={row._id}
                            variant="outlined"
                            sx={{ p: 2, pt: quizForm.questions.length > 1 ? 4 : 2, position: 'relative' }}
                          >
                            {quizForm.questions.length > 1 ? (
                              <IconButton
                                type="button"
                                size="small"
                                aria-label={DASH_ADMIN.REMOVE_QUIZ_QUESTION}
                                onClick={() =>
                                  setQuizForm((f) => ({
                                    ...f,
                                    questions: f.questions.filter((_, i) => i !== qIdx),
                                  }))
                                }
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </IconButton>
                            ) : null}
                            <Stack spacing={1.5}>
                              <TextField
                                size="small"
                                label={`${qIdx + 1}. ${DASH_ADMIN.QUIZ_QUESTION_TEXT}`}
                                required
                                value={row.question}
                                onChange={(e) => {
                                  const next = [...quizForm.questions];
                                  next[qIdx] = { ...next[qIdx], question: e.target.value };
                                  setQuizForm((f) => ({ ...f, questions: next }));
                                }}
                              />
                              <TextField
                                size="small"
                                label={DASH_ADMIN.QUIZ_OPTION_A}
                                value={row.a}
                                onChange={(e) => {
                                  const next = [...quizForm.questions];
                                  next[qIdx] = { ...next[qIdx], a: e.target.value };
                                  setQuizForm((f) => ({ ...f, questions: next }));
                                }}
                              />
                              <TextField
                                size="small"
                                label={DASH_ADMIN.QUIZ_OPTION_B}
                                value={row.b}
                                onChange={(e) => {
                                  const next = [...quizForm.questions];
                                  next[qIdx] = { ...next[qIdx], b: e.target.value };
                                  setQuizForm((f) => ({ ...f, questions: next }));
                                }}
                              />
                              <TextField
                                size="small"
                                label={DASH_ADMIN.QUIZ_OPTION_C}
                                value={row.c}
                                onChange={(e) => {
                                  const next = [...quizForm.questions];
                                  next[qIdx] = { ...next[qIdx], c: e.target.value };
                                  setQuizForm((f) => ({ ...f, questions: next }));
                                }}
                              />
                              <TextField
                                size="small"
                                label={DASH_ADMIN.QUIZ_OPTION_D}
                                value={row.d}
                                onChange={(e) => {
                                  const next = [...quizForm.questions];
                                  next[qIdx] = { ...next[qIdx], d: e.target.value };
                                  setQuizForm((f) => ({ ...f, questions: next }));
                                }}
                              />
                              <FormControl component="fieldset" variant="standard">
                                <Typography component="legend" variant="caption" sx={{ mb: 0.5, fontWeight: 600 }}>
                                  {DASH_ADMIN.QUIZ_CORRECT}
                                </Typography>
                                <RadioGroup
                                  row
                                  value={String(row.correct)}
                                  onChange={(e) => {
                                    const next = [...quizForm.questions];
                                    next[qIdx] = { ...next[qIdx], correct: Number(e.target.value) };
                                    setQuizForm((f) => ({ ...f, questions: next }));
                                  }}
                                >
                                  {['A', 'B', 'C', 'D'].map((lab, oi) => (
                                    <FormControlLabel key={lab} value={String(oi)} control={<Radio size="small" />} label={lab} />
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </Stack>
                          </Paper>
                        ))}
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          sx={{ alignSelf: 'flex-start' }}
                          onClick={() => setQuizForm((f) => ({ ...f, questions: [...f.questions, newQuizQuestion()] }))}
                        >
                          {DASH_ADMIN.ADD_QUIZ_QUESTION}
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="medium"
                          startIcon={<ListChecks size={18} />}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          {DASH_ADMIN.ADD_QUIZ}
                        </Button>
                      </Paper>
                      <AdminDataTable>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_QUIZ_TITLE}</TableCell>
                            <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.QUIZ_DESC}</TableCell>
                            <TableCell align="right" sx={adminHeaderCellSx} />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {quizzes.map((q) => (
                            <TableRow key={q.id} sx={adminBodyRowSx}>
                              <TableCell sx={{ fontWeight: 600 }}>{q.title}</TableCell>
                              <TableCell sx={{ maxWidth: 280 }}>
                                <Typography variant="body2" color="text.secondary" noWrap title={q.description || ''}>
                                  {q.description || '—'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title={DASH_ADMIN.DELETE_TOOLTIP}>
                                  <IconButton type="button" color="error" size="small" onClick={() => deleteQuiz(q.id)} aria-label={DASH_ADMIN.DELETE_TOOLTIP}>
                                    <Trash2 className="h-4 w-4" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </AdminDataTable>
                    </Box>
                  )}
                </>
              ) : (
                <Typography color="text.secondary">{DASH_ADMIN.PICK_COURSE}</Typography>
              )}
                </AdminSectionCard>
              </Stack>
            )}

            {tab === 'enrollments' && (
              <Stack spacing={3}>
                <AdminSectionCard overline={DASH_ADMIN.LEAD_ENROLLMENTS} title={DASH_ADMIN.TABS.enrollments}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                  minHeight: 280,
                  mb: 2,
                }}
              >
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" className="font-display" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {DASH_ADMIN.ENROLL_STATS_TITLE}
                  </Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={(enrollReport?.stats?.byCourse || []).map((c) => ({
                        name:
                          (c.title || c.slug || '').length > 22
                            ? `${String(c.title || c.slug).slice(0, 20)}\u2026`
                            : c.title || c.slug || '\u2014',
                        count: c.count,
                      }))}
                      margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" interval={0} angle={-28} textAnchor="end" height={56} tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} width={36} />
                      <RechartsTooltip />
                      <Bar dataKey="count" name={DASH_ADMIN.CHART_STUDENTS} fill="#e8872a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" className="font-display" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {DASH_ADMIN.ENROLL_TIMELINE_TITLE}
                  </Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={enrollReport?.stats?.byDay || []} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={52} />
                      <YAxis allowDecimals={false} width={36} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="count" name={DASH_ADMIN.CHART_STUDENTS} stroke="#354056" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>

              <FormControl size="small" sx={{ maxWidth: 400, width: '100%', mb: 2 }}>
                <InputLabel id="enroll-filter-course">{DASH_ADMIN.ENROLL_FILTER_ALL}</InputLabel>
                <Select
                  labelId="enroll-filter-course"
                  label={DASH_ADMIN.ENROLL_FILTER_ALL}
                  value={enrollCourseFilter}
                  onChange={(e) => setEnrollCourseFilter(e.target.value)}
                >
                  <MenuItem value="">{DASH_ADMIN.ENROLL_FILTER_ALL}</MenuItem>
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <AdminDataTable>
                <TableHead>
                  <TableRow>
                    <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_ENROLL_COURSE}</TableCell>
                    <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_ENROLL_STUDENT}</TableCell>
                    <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_ENROLL_EMAIL}</TableCell>
                    <TableCell sx={adminHeaderCellSx}>{DASH_ADMIN.TH_ENROLL_DATE}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(enrollReport?.enrollments || [])
                    .filter((row) => !enrollCourseFilter || row.course_id === enrollCourseFilter)
                    .map((row) => (
                      <TableRow key={row.id} sx={adminBodyRowSx}>
                        <TableCell sx={{ fontWeight: 600 }}>{row.courses?.title || '\u2014'}</TableCell>
                        <TableCell>{row.profiles?.full_name || '\u2014'}</TableCell>
                        <TableCell>{row.profiles?.email || '\u2014'}</TableCell>
                        <TableCell>
                          {row.enrolled_at ? new Date(row.enrolled_at).toLocaleString() : '\u2014'}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </AdminDataTable>
              {!enrollReport?.enrollments?.length ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                  {DASH_ADMIN.ENROLL_TABLE_EMPTY}
                </Typography>
              ) : null}
                </AdminSectionCard>
              </Stack>
            )}
          </AdminShell>
        </div>
      </Box>

      <Dialog
        open={lectureEditOpen}
        onClose={() => {
          setLectureEditOpen(false);
          setLectureEditingId(null);
        }}
        fullWidth
        maxWidth="md"
        component="form"
        onSubmit={submitLectureEdit}
        PaperProps={{ elevation: 8, sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{DASH_ADMIN.LECTURE_DIALOG_EDIT}</DialogTitle>
        <Divider />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          <TextField
            required
            size="small"
            label={DASH_ADMIN.LECTURE_TITLE}
            value={lectureEditForm.title}
            onChange={(e) => setLectureEditForm((f) => ({ ...f, title: e.target.value }))}
            fullWidth
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {DASH_ADMIN.LECTURE_BLOCKS}
          </Typography>
          {lectureEditForm.blocks.map((blk, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, pt: lectureEditForm.blocks.length > 1 ? 4 : 2, position: 'relative' }}>
              {lectureEditForm.blocks.length > 1 ? (
                <IconButton
                  type="button"
                  size="small"
                  aria-label={DASH_ADMIN.REMOVE_LECTURE_BLOCK}
                  onClick={() =>
                    setLectureEditForm((f) => ({
                      ...f,
                      blocks: f.blocks.filter((_, i) => i !== idx),
                    }))
                  }
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              ) : null}
              <Stack spacing={1.5}>
                <TextField
                  size="small"
                  label={DASH_ADMIN.LECTURE_BLOCK_TITLE}
                  value={blk.title}
                  onChange={(e) => {
                    const next = [...lectureEditForm.blocks];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setLectureEditForm((f) => ({ ...f, blocks: next }));
                  }}
                  fullWidth
                />
                <TextField
                  size="small"
                  label={DASH_ADMIN.LECTURE_BLOCK_CONTENT}
                  multiline
                  minRows={2}
                  value={blk.content}
                  onChange={(e) => {
                    const next = [...lectureEditForm.blocks];
                    next[idx] = { ...next[idx], content: e.target.value };
                    setLectureEditForm((f) => ({ ...f, blocks: next }));
                  }}
                  fullWidth
                />
                <TextField
                  size="small"
                  label={DASH_ADMIN.LECTURE_BLOCK_VIDEO}
                  value={blk.video_url}
                  onChange={(e) => {
                    const next = [...lectureEditForm.blocks];
                    next[idx] = { ...next[idx], video_url: e.target.value };
                    setLectureEditForm((f) => ({ ...f, blocks: next }));
                  }}
                  fullWidth
                />
              </Stack>
            </Paper>
          ))}
          <Button
            type="button"
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
            onClick={() => setLectureEditForm((f) => ({ ...f, blocks: [...f.blocks, newLectureBlock()] }))}
          >
            {DASH_ADMIN.ADD_LECTURE_BLOCK}
          </Button>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end', gap: 1 }}>
          <Button
            type="button"
            onClick={() => {
              setLectureEditOpen(false);
              setLectureEditingId(null);
            }}
          >
            {COMMON.CANCEL}
          </Button>
          <Button type="submit" variant="contained" size="medium">
            {COMMON.SAVE}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={courseEditOpen}
        onClose={() => setCourseEditOpen(false)}
        fullWidth
        maxWidth="sm"
        component="form"
        onSubmit={submitCourseEdit}
        PaperProps={{ elevation: 8, sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{DASH_ADMIN.COURSE_DIALOG_EDIT}</DialogTitle>
        <Divider />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          <TextField
            required
            size="small"
            label={DASH_ADMIN.LABEL_COURSE_TITLE}
            value={courseEditForm.title}
            onChange={(e) => setCourseEditForm((f) => ({ ...f, title: e.target.value }))}
            fullWidth
          />
          <TextField
            size="small"
            label={DASH_ADMIN.LABEL_COURSE_DESC}
            multiline
            minRows={2}
            value={courseEditForm.description}
            onChange={(e) => setCourseEditForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="course-edit-cat">{DASH_ADMIN.LABEL_CATEGORY}</InputLabel>
            <Select
              labelId="course-edit-cat"
              label={DASH_ADMIN.LABEL_CATEGORY}
              value={courseEditForm.category_id}
              onChange={(e) => setCourseEditForm((f) => ({ ...f, category_id: e.target.value }))}
            >
              <MenuItem value="">—</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label={DASH_ADMIN.LABEL_THUMB}
            value={courseEditForm.thumbnail_url}
            onChange={(e) => setCourseEditForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
            fullWidth
          />
          <TextField
            size="small"
            label={DASH_ADMIN.LABEL_DURATION_H}
            value={courseEditForm.duration_hours}
            onChange={(e) => setCourseEditForm((f) => ({ ...f, duration_hours: e.target.value }))}
            fullWidth
          />
          <TextField
            size="small"
            label={DASH_ADMIN.LABEL_LEVEL}
            value={courseEditForm.level}
            onChange={(e) => setCourseEditForm((f) => ({ ...f, level: e.target.value }))}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={courseEditForm.published}
                onChange={(e) => setCourseEditForm((f) => ({ ...f, published: e.target.checked }))}
                color="primary"
              />
            }
            label={DASH_ADMIN.LABEL_PUBLISHED}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end', gap: 1 }}>
          <Button type="button" onClick={() => setCourseEditOpen(false)}>
            {COMMON.CANCEL}
          </Button>
          <Button type="submit" variant="contained" size="medium">
            {COMMON.SAVE}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        component="form"
        onSubmit={submitUserForm}
        PaperProps={{ elevation: 8, sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{userEditingId ? DASH_ADMIN.USER_DIALOG_EDIT : DASH_ADMIN.USER_DIALOG_CREATE}</DialogTitle>
        <Divider />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          <TextField
            required
            autoComplete="off"
            size="small"
            label={COMMON.EMAIL}
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
            margin="dense"
          />
          <TextField
            required={!userEditingId}
            autoComplete="new-password"
            size="small"
            label={COMMON.PASSWORD}
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
            helperText={userEditingId ? DASH_ADMIN.PW_LEAVE_BLANK : undefined}
            margin="dense"
          />
          <TextField
            size="small"
            label={DASH_ADMIN.TH_NAME}
            value={userForm.full_name}
            onChange={(e) => setUserForm((f) => ({ ...f, full_name: e.target.value }))}
            margin="dense"
          />
          <FormControl size="small" margin="dense" sx={{ minWidth: 200 }}>
            <InputLabel id="user-form-role">{DASH_ADMIN.TH_ROLE}</InputLabel>
            <Select
              labelId="user-form-role"
              label={DASH_ADMIN.TH_ROLE}
              value={userForm.role}
              onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
            >
              <MenuItem value="student">{DASH_ADMIN.ROLE_STUDENT}</MenuItem>
              <MenuItem value="admin">{DASH_ADMIN.ROLE_ADMIN}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end', gap: 1 }}>
          <Button type="button" onClick={() => setUserDialogOpen(false)}>
            {COMMON.CANCEL}
          </Button>
          <Button type="submit" variant="contained" size="medium">
            {COMMON.SAVE}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
