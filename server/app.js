import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import { isDbReady } from './config/db.js';

const app = express();

const here = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: '64kb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, database: isDbReady() ? 'connected' : 'not configured' }));
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tutor', tutorRoutes);
app.use(express.static(path.resolve(here, '../client/dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(here, '../client/dist/index.html'));
});
export default app;
