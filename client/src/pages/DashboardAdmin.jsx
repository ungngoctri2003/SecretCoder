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

const TAB_KEYS = ['users', 'contacts', 'categories', 'courses', 'team', 'testimonials'];

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
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catImg, setCatImg] = useState('');

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

  const [teamForm, setTeamForm] = useState({ name: '', role_title: '', image_url: '', bio: '' });
  const [testForm, setTestForm] = useState({ author_name: '', author_title: '', content: '', rating: 5 });

  const loadAll = useCallback(async () => {
    if (!token) return;
    const [u, co, ca, cr, t, te] = await Promise.all([
      apiFetch('/api/admin/users', {}, token),
      apiFetch('/api/admin/contact-messages', {}, token),
      apiFetch('/api/categories'),
      apiFetch('/api/admin/courses', {}, token),
      apiFetch('/api/team'),
      apiFetch('/api/testimonials'),
    ]);
    setUsers(u || []);
    setContacts(co || []);
    setCategories(ca || []);
    setCourses(cr || []);
    setTeam(t || []);
    setTestimonials(te || []);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token) return;
        await loadAll();
      } catch (e) {
        if (!cancelled) toast.error(e.message || ERR.LOAD_FAILED);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loadAll]);

  async function updateRole(userId, role) {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }, token);
      toast.success(DASH_ADMIN.ROLE_UPDATED);
      await loadAll();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function addCategory(e) {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/admin/categories',
        { method: 'POST', body: JSON.stringify({ name: catName, slug: catSlug, image_url: catImg || null }) },
        token,
      );
      setCatName('');
      setCatSlug('');
      setCatImg('');
      toast.success(DASH_ADMIN.TOAST_CAT_ADDED);
      await loadAll();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function deleteCategory(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL_CAT)) return;
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' }, token);
      toast.success(DASH_ADMIN.TOAST_DELETED);
      await loadAll();
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
      await loadAll();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function deleteCourse(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL_COURSE)) return;
    try {
      await apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' }, token);
      toast.success(DASH_ADMIN.TOAST_DELETED);
      await loadAll();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function addTeam(e) {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/team', { method: 'POST', body: JSON.stringify(teamForm) }, token);
      setTeamForm({ name: '', role_title: '', image_url: '', bio: '' });
      toast.success(DASH_ADMIN.TOAST_TEAM_ADDED);
      await loadAll();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function deleteTeam(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL)) return;
    try {
      await apiFetch(`/api/admin/team/${id}`, { method: 'DELETE' }, token);
      toast.success(DASH_ADMIN.TOAST_DELETED);
      await loadAll();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function addTestimonial(e) {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/admin/testimonials',
        { method: 'POST', body: JSON.stringify({ ...testForm, rating: Number(testForm.rating) }) },
        token,
      );
      setTestForm({ author_name: '', author_title: '', content: '', rating: 5 });
      toast.success(DASH_ADMIN.TOAST_TEST_ADDED);
      await loadAll();
    } catch (e) {
      toast.error(e.data?.error || e.message);
    }
  }

  async function deleteTestimonial(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL)) return;
    try {
      await apiFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' }, token);
      toast.success(DASH_ADMIN.TOAST_DELETED);
      await loadAll();
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

          {tab === 'contacts' && (
            <ZebraTable>
              <TableHead>
                <TableRow>
                  <TableCell>{DASH_ADMIN.TH_DATE}</TableCell>
                  <TableCell>{DASH_ADMIN.TH_NAME}</TableCell>
                  <TableCell>{DASH_ADMIN.TH_EMAIL}</TableCell>
                  <TableCell>{DASH_ADMIN.TH_SUBJECT}</TableCell>
                  <TableCell>{DASH_ADMIN.TH_MESSAGE}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id} sx={rowSx}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="caption">{new Date(c.created_at).toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.subject}</TableCell>
                    <TableCell sx={{ maxWidth: 240, whiteSpace: 'pre-wrap' }}>
                      <Typography variant="caption">{c.message}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ZebraTable>
          )}

          {tab === 'categories' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper component="form" variant="outlined" onSubmit={addCategory} sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-end' }}>
                <TextField size="small" placeholder={DASH_ADMIN.PH_NAME} required value={catName} onChange={(e) => setCatName(e.target.value)} />
                <TextField size="small" placeholder={DASH_ADMIN.PH_SLUG} required value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
                <TextField
                  size="small"
                  placeholder={DASH_ADMIN.PH_IMAGE_URL}
                  value={catImg}
                  onChange={(e) => setCatImg(e.target.value)}
                  sx={{ flex: '1 1 120px', minWidth: 120 }}
                />
                <Button type="submit" variant="contained" color="primary" size="small">
                  {COMMON.ADD}
                </Button>
              </Paper>
              <Paper variant="outlined">
                {categories.map((c, i) => (
                  <Box key={c.id}>
                    {i > 0 ? <Divider /> : null}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2, py: 1.5 }}>
                      <span>
                        {c.name}{' '}
                        <Typography component="span" variant="body2" color="text.secondary">
                          ({c.slug})
                        </Typography>
                      </span>
                      <Button type="button" variant="outlined" color="error" size="small" onClick={() => deleteCategory(c.id)}>
                        {COMMON.DELETE}
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
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
            </Box>
          )}

          {tab === 'team' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper component="form" variant="outlined" onSubmit={addTeam} sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-end' }}>
                <TextField size="small" placeholder={DASH_ADMIN.PH_NAME} required value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} />
                <TextField size="small" placeholder={DASH_ADMIN.PH_ROLE} value={teamForm.role_title} onChange={(e) => setTeamForm({ ...teamForm, role_title: e.target.value })} />
                <TextField size="small" placeholder={DASH_ADMIN.PH_IMAGE_URL} value={teamForm.image_url} onChange={(e) => setTeamForm({ ...teamForm, image_url: e.target.value })} />
                <TextField
                  size="small"
                  placeholder={DASH_ADMIN.PH_BIO}
                  value={teamForm.bio}
                  onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                  sx={{ flex: '1 1 100px', minWidth: 100 }}
                />
                <Button type="submit" variant="contained" color="primary" size="small">
                  {COMMON.ADD}
                </Button>
              </Paper>
              <Paper variant="outlined">
                {team.map((m, i) => (
                  <Box key={m.id}>
                    {i > 0 ? <Divider /> : null}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2, py: 1.5 }}>
                      <span>
                        {m.name} — {m.role_title}
                      </span>
                      <Button type="button" variant="outlined" color="error" size="small" onClick={() => deleteTeam(m.id)}>
                        {COMMON.DELETE}
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}

          {tab === 'testimonials' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper component="form" variant="outlined" onSubmit={addTestimonial} sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  size="small"
                  placeholder={DASH_ADMIN.PH_AUTHOR}
                  required
                  value={testForm.author_name}
                  onChange={(e) => setTestForm({ ...testForm, author_name: e.target.value })}
                />
                <TextField size="small" placeholder={DASH_ADMIN.PH_TITLE} value={testForm.author_title} onChange={(e) => setTestForm({ ...testForm, author_title: e.target.value })} />
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ min: 1, max: 5 }}
                  sx={{ width: 80 }}
                  value={testForm.rating}
                  onChange={(e) => setTestForm({ ...testForm, rating: Number(e.target.value) })}
                />
                <TextField
                  size="small"
                  placeholder={DASH_ADMIN.PH_CONTENT}
                  required
                  value={testForm.content}
                  onChange={(e) => setTestForm({ ...testForm, content: e.target.value })}
                  sx={{ flex: '1 1 160px', minWidth: 160 }}
                />
                <Button type="submit" variant="contained" color="primary" size="small">
                  {COMMON.ADD}
                </Button>
              </Paper>
              <Paper variant="outlined">
                {testimonials.map((t, i) => (
                  <Box key={t.id}>
                    {i > 0 ? <Divider /> : null}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2, py: 1.5 }}>
                      <Typography variant="body2">
                        {t.author_name}: {t.content.slice(0, 80)}
                        {t.content.length > 80 ? '…' : ''}
                      </Typography>
                      <Button type="button" variant="outlined" color="error" size="small" onClick={() => deleteTestimonial(t.id)}>
                        {COMMON.DELETE}
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}
        </Box>
      </div>
    </>
  );
}
