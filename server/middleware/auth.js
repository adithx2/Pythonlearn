import jwt from 'jsonwebtoken';

export default function requireAuth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) throw new Error('Missing token');
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'development-only-change-me');
    next();
  } catch {
    res.status(401).json({ error: 'Please sign in to access this.' });
  }
}
