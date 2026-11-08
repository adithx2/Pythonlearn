# PythonLearn

A free, open source Python learning platform for curious beginners. Learn with friendly lessons, practice questions, an in-browser Python playground, and an optional AI tutor.

## Run locally

Requires Node.js 20 or newer. MongoDB and an AI key are optional.

```sh
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL printed by Vite. The Vite server proxies API calls to Express using the `PORT` value in `.env`. Set `MONGODB_URI` and a unique `JWT_SECRET` in `.env` for account and progress API routes. Set `GEMINI_API_KEY` to enable PyTutor with Google Search grounding and source links. Create a key in [Google AI Studio](https://aistudio.google.com/app/apikey). `AI_API_KEY` is an optional OpenAI fallback without Google Search. Keep all keys in the server `.env`; do not use `VITE_` prefixes for secrets.

```sh
npm run build
npm start
```

Express serves the production build and API. The learning material is available without an account. The 31-topic curriculum includes lesson pages, examples and exercises; Python runs locally in the browser using Pyodide. PyTutor and saved accounts are optional services. The tutor header shows whether Gemini and Google Search are configured.

## Project structure

```text
client/
  src/                 React pages, components, course data and styles
  index.html            Vite entry point
  vite.config.js        Client build and API proxy
server/
  config/               MongoDB connection
  controllers/          Request handlers (auth, progress, tutor)
  middleware/           Authentication checks
  models/               Mongoose models
  routes/               Express API route definitions
  services/             Tutor and application services
  app.js                Express app setup
  index.js              Server entry point
```

The API follows MVC: routes direct requests to controllers, controllers use models and services, and configuration lives under `server/config`.

MIT licensed. Contributions and corrections are welcome.
