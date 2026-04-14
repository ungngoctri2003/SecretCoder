import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';

const r = Router();

r.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }
  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .insert({ name, email, subject: subject || null, message })
    .select('id')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

export default r;
