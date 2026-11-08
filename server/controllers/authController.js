import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbReady } from '../config/db.js';

const tokenFor = user => jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'development-only-change-me', { expiresIn: '14d' });
const publicUser = user => ({ name: user.name, email: user.email, completedLessons: user.completedLessons });

export async function register(req, res) {
  try {
    if (!isDbReady()) return res.status(503).json({ error: 'Progress accounts are unavailable until MongoDB is configured.' });
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Add your name, a valid email and a password of at least 8 characters.' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({ error: error.code === 11000 ? 'An account with this email already exists.' : 'Could not create your account.' });
  }
}

export async function login(req, res) {
  try {
    if (!isDbReady()) return res.status(503).json({ error: 'Progress accounts are unavailable until MongoDB is configured.' });
    const user = await User.findOne({ email: req.body.email });
    if (!user || !await bcrypt.compare(req.body.password || '', user.password)) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch {
    res.status(500).json({ error: 'Could not sign in.' });
  }
}
