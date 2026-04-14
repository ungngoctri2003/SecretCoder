import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import publicRoutes from './routes/public.js';
import contactRoutes from './routes/contact.js';
import enrollRoutes from './routes/enrollments.js';
import teacherRoutes from './routes/teacher.js';
import adminRoutes from './routes/admin.js';
import meRoutes from './routes/me.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', publicRoutes);
app.use('/api/me', meRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enrollments', enrollRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
