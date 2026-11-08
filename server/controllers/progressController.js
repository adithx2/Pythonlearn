import User from '../models/User.js';
import { isDbReady } from '../config/db.js';

export async function getProgress(req, res) {
  if (!isDbReady()) return res.status(503).json({ error: 'Database unavailable.' });
  const user = await User.findById(req.user.id).select('name email completedLessons');
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  res.json({ user });
}

export async function saveProgress(req, res) {
  if (!isDbReady()) return res.status(503).json({ error: 'Database unavailable.' });
  if (!Array.isArray(req.body.completedLessons)) return res.status(400).json({ error: 'completedLessons must be an array.' });
  const completedLessons = [...new Set(req.body.completedLessons.filter(item => typeof item === 'string').slice(0, 100))];
  const user = await User.findByIdAndUpdate(req.user.id, { completedLessons }, { new: true }).select('name email completedLessons');
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  res.json({ user });
}
