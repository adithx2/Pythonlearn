import 'dotenv/config';
import { connectDB, closeDB } from './config/db.js';
import app from './app.js';

const port = Number(process.env.PORT || 4002);
await connectDB();
const server = app.listen(port, () => console.log(`PythonLearn API listening on port ${port}`));
let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  if (server.listening) await new Promise(resolve => server.close(resolve));
  await closeDB().catch(error => console.error('Database shutdown failed:', error.message));
}

process.once('SIGINT', () => { void shutdown(); });
process.once('SIGTERM', () => { void shutdown(); });

server.on('error', async error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. If PythonLearn is already running, use that instance. Otherwise set PORT to a free port in .env and restart the app.`);
  } else {
    console.error('PythonLearn API failed to start:', error.message);
  }
  await closeDB().catch(() => {});
  process.exitCode = 1;
});
