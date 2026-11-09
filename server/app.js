import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import { isDbReady } from './config/db.js';

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? [process.env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://localhost:4002']
  : true; // permissive in dev when env var is absent

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '64kb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, database: isDbReady() ? 'connected' : 'not configured' }));
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tutor', tutorRoutes);


// In production the client is served by Vercel, not this server.
// Keep a small fallback so hitting the Render URL directly is friendly.
app.get('/', (_req, res) => res.json({ service: 'PythonLearn API',  status: 'ok' }));

export default app;
