import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

r.get('/', requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    full_name: req.user.full_name,
    role: req.user.role,
  });
});

export default r;
