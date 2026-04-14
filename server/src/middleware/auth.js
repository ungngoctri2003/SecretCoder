import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../supabase.js';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.slice(7);
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration: SUPABASE_JWT_SECRET' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Profile not found' });
    }
    req.user = { id: userId, email: payload.email ?? null, ...profile };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

/** Optional: attach user if Bearer present, else continue */
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ') || !JWT_SECRET) {
    return next();
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.sub;
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();
    if (profile) {
      req.user = { id: userId, email: payload.email ?? null, ...profile };
    }
  } catch {
    /* ignore */
  }
  next();
}
