import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Code2, Command, Compass, ExternalLink, Github, GraduationCap, LayoutDashboard, Lightbulb, ListChecks, Menu, Moon, Play, RotateCcw, Send, Sparkles, Sun, Terminal, Zap, X, LogIn, LogOut, User, Lock, Mail, AlertCircle } from 'lucide-react';
import { curriculum, lessons, quizQuestions, topicQuizzes, getQuizForTopic } from './data.js';
import PlaygroundPage from './Playground.jsx';
import './tutor.css';

let pyodidePromise;
async function getPyodide() {
  if (!pyodidePromise) pyodidePromise = (async () => { const { loadPyodide, version } = await import('pyodide'); return loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v' + version + '/full/' }) })();
  return pyodidePromise;
}

const lessonLookup = new Map(lessons.map(lesson => [lesson.title.toLowerCase(), lesson]));
lessonLookup.set('string', lessonLookup.get('strings'));
const allTopics = Object.entries(curriculum).flatMap(([level, topics]) => topics.map((title, i) => ({ title, level, i })));
const lessonFor = title => lessonLookup.get(title.toLowerCase()) || { title, level: 'Beginner', duration: '10 min', tag: 'Python basics', description: `${title} is one of the building blocks that makes Python useful. Learn the idea, see it in action, then try a small exercise of your own.`, code: 'message = "Learning Python, one step at a time"\nprint(message)', output: 'Learning Python, one step at a time', exercise: `Write a short program that uses ${title.toLowerCase()} to solve a problem you care about.`, explanation: `Start with a small example of ${title.toLowerCase()}. Run it, change one part, and watch what happens.` };

const Icon = ({ name, size = 18, ...props }) => {
  const C = ({
    Home: Compass, BookOpen, Code2, Sparkles, ListChecks, LayoutDashboard,
    Github, Sun, Moon, ArrowRight, ArrowLeft, ArrowDown, ChevronRight,
    ChevronDown, Check, Clock3, Play, RotateCcw, Send, Menu, X,
    GraduationCap, Lightbulb, Zap, Terminal, Command, CircleHelp,
    ExternalLink, LogIn, LogOut, User, Lock, Mail, AlertCircle
  })[name] || CircleHelp;
  return <C size={size} strokeWidth={1.8} {...props} />
};

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function AuthForm({ mode = 'login', onToggleMode, onSuccess }) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCurrentMode(mode);
    setError('');
  }, [mode]);

  const switchMode = (newMode) => {
    setCurrentMode(newMode);
    setError('');
    if (onToggleMode) onToggleMode(newMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (currentMode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
    } else {
      if (!password) {
        setError('Please enter your password.');
        return;
      }
    }

    setBusy(true);
    try {
      const endpoint = currentMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = currentMode === 'register' ? { name: name.trim(), email: trimmedEmail, password } : { email: trimmedEmail, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please try again.');
      }
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <span className="brand-mark" style={{ margin: '0 auto 12px' }}>py<span>.</span></span>
        <h2>{currentMode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
        <p>{currentMode === 'register' ? 'Sign up to track lessons and save your progress.' : 'Sign in to continue your Python journey.'}</p>
      </div>

      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${currentMode === 'login' ? 'active' : ''}`}
          onClick={() => switchMode('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`auth-tab ${currentMode === 'register' ? 'active' : ''}`}
          onClick={() => switchMode('register')}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="auth-error">
          <Icon name="AlertCircle" size={16} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {currentMode === 'register' && (
          <div className="auth-field">
            <label htmlFor="auth-name">Full name</label>
            <input
              id="auth-name"
              type="text"
              placeholder="e.g. Alex Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus={currentMode === 'register'}
            />
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus={currentMode === 'login'}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            placeholder={currentMode === 'register' ? 'At least 8 characters' : 'Enter your password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="button button-primary auth-submit-btn" disabled={busy}>
          {busy ? (currentMode === 'register' ? 'Creating account…' : 'Signing in…') : (currentMode === 'register' ? 'Create free account' : 'Sign in')}
        </button>
      </form>

      <div className="auth-switch">
        {currentMode === 'register' ? (
          <span>Already have an account? <button type="button" className="auth-switch-link" onClick={() => switchMode('login')}>Sign in</button></span>
        ) : (
          <span>Don’t have an account? <button type="button" className="auth-switch-link" onClick={() => switchMode('register')}>Create one</button></span>
        )}
      </div>
    </div>
  );
}

function AuthModal({ isOpen, mode, onClose, onSuccess, onToggleMode }) {
  if (!isOpen) return null;
  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close dialog">
          <Icon name="X" size={18} />
        </button>
        <AuthForm mode={mode} onToggleMode={onToggleMode} onSuccess={onSuccess} />
      </div>
    </div>
  );
}

function AuthPage({ mode, onAuthSuccess }) {
  const navigate = useNavigate();
  return (
    <div className="page-content inner-page auth-page-container">
      <div className="auth-modal" style={{ width: 'min(100%, 420px)' }}>
        <AuthForm
          mode={mode}
          onToggleMode={(newMode) => navigate(`/${newMode}`)}
          onSuccess={(data) => {
            onAuthSuccess(data);
            navigate('/dashboard');
          }}
        />
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pl-theme') || 'light');
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pl-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pl-theme', theme);
  }, [theme]);

  useEffect(() => {
    setMenu(false);
  }, [location.pathname]);

  // Check token and sync progress on load
  useEffect(() => {
    const token = localStorage.getItem('pl-token');
    if (!token) return;
    fetch('/api/progress', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('pl-user', JSON.stringify(data.user));
          if (Array.isArray(data.user.completedLessons)) {
            const localDone = JSON.parse(localStorage.getItem('pl-done') || '[]');
            const merged = Array.from(new Set([...localDone, ...data.user.completedLessons]));
            localStorage.setItem('pl-done', JSON.stringify(merged));
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('pl-token');
        localStorage.removeItem('pl-user');
        setUser(null);
      });
  }, []);

  const toggleTheme = () => setTheme(x => x === 'light' ? 'dark' : 'light');

  const handleAuthSuccess = (data) => {
    localStorage.setItem('pl-token', data.token);
    localStorage.setItem('pl-user', JSON.stringify(data.user));
    setUser(data.user);
    if (Array.isArray(data.user?.completedLessons)) {
      const localDone = JSON.parse(localStorage.getItem('pl-done') || '[]');
      const merged = Array.from(new Set([...localDone, ...data.user.completedLessons]));
      localStorage.setItem('pl-done', JSON.stringify(merged));
      if (merged.length > data.user.completedLessons.length) {
        fetch('/api/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` },
          body: JSON.stringify({ completedLessons: merged })
        }).catch(() => {});
      }
    }
    setAuthModal({ open: false, mode: 'login' });
  };

  const handleLogout = () => {
    localStorage.removeItem('pl-token');
    localStorage.removeItem('pl-user');
    setUser(null);
  };

  const openAuth = (mode = 'login') => setAuthModal({ open: true, mode });

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menu ? 'sidebar-open' : ''}`}>
        <Link to="/" className="brand">
          <span className="brand-mark">py<span>.</span></span>
          <span>python<span className="brand-light">learn</span></span>
        </Link>
        <div className="side-label">LEARN</div>
        <nav className="side-nav">
          <NavItem to="/" name="Home" icon="Home" end />
          <NavItem to="/dashboard" name="My dashboard" icon="LayoutDashboard" />
          <NavItem to="/course" name="Python course" icon="BookOpen" />
          <NavItem to="/playground" name="Playground" icon="Code2" />
          <NavItem to="/tutor" name="PyTutor AI" icon="Sparkles" badge="NEW" />
          <NavItem to="/practice" name="Practice & quizzes" icon="ListChecks" />
        </nav>
        <div className="sidebar-bottom">
          <div className="streak-card">
            <div className="streak-top"><span className="streak-spark">✳</span><span>YOUR LEARNING STREAK</span></div>
            <div className="streak-days"><b className="streak-on">M</b><b className="streak-on">T</b><b>W</b><b>T</b><b>F</b><b>S</b><b>S</b></div>
            <p>Two days in a row. Keep it up!</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="theme-label"><Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={16} />{theme === 'light' ? 'Dark appearance' : 'Light appearance'}</span>
            <span className="switch"><i /></span>
          </button>
          {user ? (
            <div className="profile-row">
              <div className="avatar">{(user.name || 'U')[0].toUpperCase()}</div>
              <div className="profile-details">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>
              <button className="logout-btn" title="Sign out" onClick={handleLogout} aria-label="Sign out">
                <Icon name="LogOut" size={15} />
              </button>
            </div>
          ) : (
            <div className="sidebar-auth-cta">
              <div className="sidebar-auth-text">
                <strong>Save your progress</strong>
                <small>Sign in to sync your learning</small>
              </div>
              <div className="sidebar-auth-buttons">
                <button className="button button-primary btn-sm" onClick={() => openAuth('register')}>Register</button>
                <button className="button button-quiet btn-sm" onClick={() => openAuth('login')}>Sign in</button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="mobile-backdrop" onClick={() => setMenu(false)} />

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-btn" onClick={() => setMenu(!menu)} aria-label="Toggle menu">
            <Icon name={menu ? 'X' : 'Menu'} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <Icon name="ChevronRight" size={14} />
            <strong>{breadcrumb(location.pathname)}</strong>
          </div>
          <div className="top-actions">
            <span className="free-pill"><span /> 100% free & open source</span>
            {user ? (
              <div className="topbar-user-badge">
                <span className="topbar-avatar">{(user.name || 'U')[0].toUpperCase()}</span>
                <span className="topbar-username">{user.name}</span>
                <button className="logout-btn" title="Sign out" onClick={handleLogout} aria-label="Sign out">
                  <Icon name="LogOut" size={14} />
                </button>
              </div>
            ) : (
              <div className="topbar-auth-links">
                <button className="button-link-login" onClick={() => openAuth('login')}>Sign in</button>
                <button className="button button-primary btn-sm" onClick={() => openAuth('register')}>Register</button>
              </div>
            )}
            <button className="icon-btn top-theme" onClick={toggleTheme} aria-label="Toggle theme">
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={18} />
            </button>
            <a className="github-button" href="https://github.com" target="_blank" rel="noreferrer">
              <Icon name="Github" size={16} /> GitHub <Icon name="ExternalLink" size={13} />
            </a>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home openAuth={openAuth} user={user} />} />
          <Route path="/login" element={<AuthPage mode="login" onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/register" element={<AuthPage mode="register" onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/dashboard" element={<Dashboard user={user} openAuth={openAuth} />} />
          <Route path="/course" element={<Course />} />
          <Route path="/course/:slug" element={<Lesson />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="*" element={<Home openAuth={openAuth} user={user} />} />
        </Routes>
        <Footer />
      </main>

      <AuthModal
        isOpen={authModal.open}
        mode={authModal.mode}
        onClose={() => setAuthModal(prev => ({ ...prev, open: false }))}
        onSuccess={handleAuthSuccess}
        onToggleMode={mode => setAuthModal({ open: true, mode })}
      />
    </div>
  );
}

function breadcrumb(p) {
  if (p === '/') return 'Overview';
  if (p === '/login') return 'Sign in';
  if (p === '/register') return 'Register';
  if (p.startsWith('/course/')) return 'Lesson';
  return ({
    '/dashboard': 'My dashboard',
    '/course': 'Python course',
    '/playground': 'Playground',
    '/tutor': 'PyTutor AI',
    '/practice': 'Practice & quizzes'
  })[p] || 'Overview';
}

function NavItem({ to, name, icon, end, badge }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
      <Icon name={icon} size={18} />
      <span>{name}</span>
      {badge && <small className="new-badge">{badge}</small>}
    </NavLink>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>© 2026 PythonLearn</span>
      <span>Made for curious minds, everywhere <span className="footer-heart">♥</span></span>
      <a href="https://github.com" target="_blank" rel="noreferrer">
        <Icon name="Github" size={14} /> Open source <Icon name="ExternalLink" size={12} />
      </a>
    </footer>
  );
}

function Home({ openAuth, user }) {
  return (
    <div className="page-content home-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Learn Python.<br /><span>Build your future.</span></h1>
          <p className="hero-lede">A little practice goes a long way. Learn Python with clear lessons, hands-on projects, and a friendly AI tutor by your side.</p>
          <div className="hero-buttons">
            <Link to="/course" className="button button-primary">Start learning <Icon name="ArrowRight" size={17} /></Link>
            {!user ? (
              <button onClick={() => openAuth('register')} className="button button-quiet">
                Create free account <Icon name="ArrowRight" size={16} />
              </button>
            ) : (
              <Link to="/playground" className="button button-quiet">Explore the playground <Icon name="ArrowRight" size={16} /></Link>
            )}
          </div>
          <div className="social-proof">
            <div className="avatar-stack"><i>A</i><i>M</i><i>J</i><i>+</i></div>
            <span>Join <b>12,400+</b> curious learners</span>
            <span className="proof-sep" />
            <span className="star-row">★★★★★</span>
            <span>Learner loved</span>
          </div>
        </div>
        <HeroArt />
      </section>
      <section className="stats-strip">
        <div><strong>31</strong><span>thoughtful lessons</span></div>
        <i />
        <div><strong>08</strong><span>hands-on projects</span></div>
        <i />
        <div><strong>∞</strong><span>room to grow</span></div>
        <span className="stats-note"><Icon name="Sparkles" size={15} /> Always free. Always yours.</span>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow small-eyebrow">A PATH MADE FOR YOU</div>
            <h2>Where do you want to begin?</h2>
          </div>
          <Link to="/course" className="text-link">See the full course <Icon name="ArrowRight" size={15} /></Link>
        </div>
        <div className="topic-cards">
          <TopicCard number="01" color="mint" level="BEGINNER" title="Start with the basics" copy="Get comfortable with Python, one simple idea at a time." count="13 lessons" />
          <TopicCard number="02" color="peach" level="INTERMEDIATE" title="Make things happen" copy="Write reusable code and bring your ideas to life." count="10 lessons" />
          <TopicCard number="03" color="lavender" level="ADVANCED" title="Build with confidence" copy="Take on bigger challenges and real-world projects." count="08 lessons" />
        </div>
      </section>
      <section className="why-section">
        <div className="why-copy">
          <div className="eyebrow small-eyebrow">GOOD TO KNOW</div>
          <h2>Why learn Python?</h2>
          <p>It’s one of the world’s most-loved programming languages for a reason. Python reads a little like English, has a wonderfully helpful community, and gives you the tools to build things that matter.</p>
          <Link to="/course" className="text-link">Meet your new favorite language <Icon name="ArrowRight" size={15} /></Link>
        </div>
        <div className="why-points">
          <WhyPoint n="01" title="Friendly from day one" copy="Clear examples make new concepts easier to grasp." />
          <WhyPoint n="02" title="Useful everywhere" copy="Explore data, websites, automation and AI." />
          <WhyPoint n="03" title="Learn by doing" copy="Try ideas instantly in our built-in playground." />
        </div>
      </section>
      <section className="tutor-banner">
        <div className="tutor-orb">✳</div>
        <div>
          <span className="eyebrow small-eyebrow">MEET YOUR LEARNING COMPANION</span>
          <h2>Stuck on something? Ask PyTutor.</h2>
          <p>Get a gentle hint, a clearer explanation, or an example to try next. Learning is easier with a little help.</p>
        </div>
        <Link to="/tutor" className="button button-dark">Meet PyTutor <Icon name="ArrowRight" size={16} /></Link>
      </section>
    </div>
  );
}

function HeroArt() {
  return (
    <div className="hero-art">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-sun" />
      <div className="art-plant"><span /><span /><span /><span /></div>
      <div className="code-window">
        <div className="window-bar"><div className="window-dots"><i /><i /><i /></div><span>hello_world.py</span><Icon name="Command" size={13} /></div>
        <div className="code-lines">
          <div><em>1</em><span><b className="code-purple">def</b> <b className="code-blue">dream_big</b>():</span></div>
          <div><em>2</em><span className="indent"><b className="code-purple">while</b> <b className="code-orange">you</b>:</span></div>
          <div><em>3</em><span className="indent2"><b className="code-green">learn</b>(<b className="code-yellow">"something new"</b>)</span></div>
          <div><em>4</em><span className="indent2"><b className="code-green">build</b>(<b className="code-yellow">"your future"</b>)</span></div>
          <div><em>5</em><span /></div>
          <div><em>6</em><span><b className="code-blue">dream_big</b>()<i className="cursor" /></span></div>
        </div>
        <div className="terminal-line"><span>➜</span> python hello_world.py</div>
        <div className="terminal-output">Your future is looking bright. <span>✳</span></div>
      </div>
      <div className="floating-note note-one"><span className="note-icon"><Icon name="Check" size={15} /></span><span><strong>Lesson complete!</strong><small>Variables & values</small></span></div>
      <div className="floating-note note-two"><span className="note-spark">✦</span><span><strong>Small steps, big ideas</strong><small>Every expert started here</small></span></div>
      <div className="art-caption">A more joyful way to learn <span>✳</span></div>
    </div>
  );
}

function TopicCard({ number, color, level, title, copy, count }) {
  return (
    <Link to="/course" className={`topic-card ${color}`}>
      <div className="topic-top"><span className="topic-number">{number}</span><span className="topic-arrow"><Icon name="ArrowRight" size={16} /></span></div>
      <div className="topic-body"><span className="level-label">{level}</span><h3>{title}</h3><p>{copy}</p></div>
      <div className="topic-bottom"><span><Icon name="BookOpen" size={14} /> {count}</span><span>Explore <Icon name="ArrowRight" size={14} /></span></div>
    </Link>
  );
}

function WhyPoint({ n, title, copy }) {
  return <div className="why-point"><span>{n}</span><div><strong>{title}</strong><p>{copy}</p></div></div>;
}

function PageIntro({ eyebrow, title, copy }) {
  return <div className="page-intro"><div className="eyebrow small-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{copy}</p></div>;
}

function Dashboard({ user, openAuth }) {
  const done = JSON.parse(localStorage.getItem('pl-done') || '[]');
  return (
    <div className="page-content inner-page">
      <PageIntro
        eyebrow="YOUR LEARNING SPACE"
        title={`Welcome back, ${user?.name ? user.name.split(' ')[0] : 'learner'}.`}
        copy={user ? 'Every little bit of progress adds up. Pick up where you left off.' : 'Every little bit of progress adds up. Sign in to sync your progress anywhere.'}
      />
      {!user && (
        <div style={{ marginBottom: 22, padding: '14px 18px', background: 'var(--tint)', border: '1px solid var(--line)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <strong style={{ display: 'block', fontSize: 12 }}>Guest session active</strong>
            <span style={{ fontSize: 11, color: 'var(--soft)' }}>Sign in or register to save your completed lessons to the cloud.</span>
          </div>
          <button className="button button-primary btn-sm" onClick={() => openAuth('register')}>Save my progress</button>
        </div>
      )}
      <div className="dashboard-grid">
        <div className="progress-panel">
          <div className="panel-top">
            <div><span className="level-label">YOUR PROGRESS</span><h3>Python fundamentals</h3></div>
            <span className="progress-icon">✳</span>
          </div>
          <div className="progress-stats">
            <strong>{done.length}<small>/ 31 lessons</small></strong>
            <span>{done.length > 0 ? `${Math.round((done.length / 31) * 100)}% complete` : 'Just getting started ✳'}</span>
          </div>
          <div className="progress-track"><i style={{ width: `${Math.max(8, (done.length / 31) * 100)}%` }} /></div>
          <Link to="/course" className="button button-primary">Continue learning <Icon name="ArrowRight" size={16} /></Link>
        </div>
        <div className="quick-panel">
          <span className="level-label">YOUR JOURNEY</span>
          <div className="journey-level">
            <span className="journey-icon"><Icon name="GraduationCap" /></span>
            <span><strong>{user?.name || 'Curious beginner'}</strong><small>{user ? 'Logged in · Cloud sync' : 'Level 1 · Python explorer'}</small></span>
          </div>
          <div className="journey-divider" />
          <div className="journey-tip">
            <span>✳</span>
            <p>Try 10 minutes today. Consistency beats cramming every time.</p>
          </div>
        </div>
      </div>
      <div className="section-heading compact">
        <div><div className="eyebrow small-eyebrow">A GOOD PLACE TO PICK UP</div><h2>Continue your journey</h2></div>
        <Link to="/course" className="text-link">Browse all lessons <Icon name="ArrowRight" size={15} /></Link>
      </div>
      <div className="dashboard-lesson-list">
        {lessons.slice(0, 3).map((l, i) => <LessonListCard key={l.title} lesson={l} index={i} />)}
      </div>
    </div>
  );
}

function LessonListCard({ lesson, index }) {
  return (
    <Link to={`/course/${slug(lesson.title)}`} className="lesson-list-card">
      <span className={`lesson-index index-${index % 3}`}>{String(index + 1).padStart(2, '0')}</span>
      <div className="lesson-list-copy">
        <div><span className="level-label">{lesson.level.toUpperCase()} · {lesson.tag.toUpperCase()}</span><h3>{lesson.title}</h3></div>
        <p>{lesson.description}</p>
      </div>
      <span className="lesson-duration"><Icon name="Clock3" size={14} />{lesson.duration}</span>
      <span className="lesson-chevron"><Icon name="ArrowRight" size={17} /></span>
    </Link>
  );
}

function Course() {
  const [filter, setFilter] = useState('All');
  return (
    <div className="page-content inner-page">
      <PageIntro eyebrow="THE PYTHONLEARN COURSE" title="A path from curious to confident." copy="A complete Python journey, broken into friendly bite-sized lessons. Go at your own pace and keep every lesson free." />
      <div className="course-summary">
        <span><Icon name="BookOpen" size={17} /> <b>31</b> lessons</span>
        <i />
        <span><Icon name="Clock3" size={17} /> About <b>6 hours</b></span>
        <i />
        <span><Icon name="Check" size={17} /> All free, forever</span>
      </div>
      <div className="filter-tabs">
        {['All', 'Beginner', 'Intermediate', 'Advanced'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'selected' : ''}>{f}</button>
        ))}
      </div>
      <div className="curriculum-list">
        {Object.entries(curriculum).filter(([l]) => filter === 'All' || l === filter).map(([level, topics]) => (
          <section className="curriculum-level" key={level}>
            <div className="curriculum-heading">
              <div className={`level-mark ${level.toLowerCase()}`}>{level === 'Beginner' ? '01' : level === 'Intermediate' ? '02' : '03'}</div>
              <div><span className="level-label">{level.toUpperCase()} LEVEL</span><h2>{level}</h2></div>
              <span className="level-count">{topics.length} lessons</span>
            </div>
            <div className="curriculum-items">
              {topics.map((title, i) => {
                const ll = lessonFor(title);
                return (
                  <Link to={`/course/${slug(title)}`} className="curriculum-item" key={title}>
                    <span className="curr-num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{title}</span>
                    <span className="curr-time">{ll.duration === 'Project' ? 'Project' : ll.duration}</span>
                    <Icon name="ChevronRight" size={16} />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Lesson() {
  const { slug: lessonSlug } = useParams();
  const navigate = useNavigate();
  const title = allTopics.find(x => slug(x.title) === lessonSlug)?.title || lessons.find(x => slug(x.title) === lessonSlug)?.title || 'Introduction to Python';
  const lesson = lessonFor(title);
  const pos = allTopics.findIndex(x => slug(x.title) === lessonSlug);
  const prev = allTopics[Math.max(0, pos - 1)]?.title;
  const next = allTopics[Math.min(allTopics.length - 1, Math.max(pos, 0) + 1)]?.title;
  const matchedQuiz = getQuizForTopic(title);

  const handleMarkComplete = (e) => {
    const d = JSON.parse(localStorage.getItem('pl-done') || '[]');
    if (!d.includes(title)) d.push(title);
    localStorage.setItem('pl-done', JSON.stringify(d));
    e.currentTarget.innerHTML = 'Lesson completed ✓';

    const token = localStorage.getItem('pl-token');
    if (token) {
      fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completedLessons: d })
      }).catch(() => {});
    }
  };

  return (
    <div className="page-content inner-page lesson-page">
      <button className="back-link" onClick={() => navigate('/course')}>
        <Icon name="ArrowLeft" size={15} /> All lessons
      </button>
      <div className="lesson-layout">
        <article className="lesson-article">
          <span className="lesson-kicker">{lesson.level.toUpperCase()} · {lesson.tag.toUpperCase()}</span>
          <h1>{lesson.title}</h1>
          <div className="lesson-meta">
            <span><Icon name="Clock3" size={15} />{lesson.duration}</span>
            <span>·</span>
            <span>Beginner friendly</span>
            <span className="free-tag">FREE</span>
          </div>
          <p className="lesson-lede">{lesson.description}</p>
          <h2>The idea</h2>
          <p>{lesson.explanation}</p>
          <div className="example-heading">
            <h2>See it in action</h2>
            <Link to="/playground"><Icon name="Play" size={13} /> Try it yourself</Link>
          </div>
          <CodeExample code={lesson.code} output={lesson.output} />
          <h2>Your turn</h2>
          <div className="exercise-box">
            <div className="exercise-icon"><Icon name="Lightbulb" size={19} /></div>
            <div>
              <strong>A little practice</strong>
              <p>{lesson.exercise}</p>
              <Link to="/playground">Open the playground <Icon name="ArrowRight" size={14} /></Link>
            </div>
          </div>
          <div className="exercise-box" style={{ marginTop: 14, background: 'var(--tint)' }}>
            <div className="exercise-icon"><Icon name="ListChecks" size={19} /></div>
            <div>
              <strong>Practice Questions: 10 Quiz Challenges</strong>
              <p>Test and reinforce your knowledge on {title} with 10 interactive questions.</p>
              <Link to={`/practice?topic=${encodeURIComponent(matchedQuiz.topic)}`}>
                Start 10 {matchedQuiz.topic} Questions <Icon name="ArrowRight" size={14} />
              </Link>
            </div>
          </div>
          <div className="lesson-navigation">
            <Link to={`/course/${slug(prev || title)}`}>
              <Icon name="ArrowLeft" size={15} />
              <span><small>PREVIOUS LESSON</small><strong>{prev || 'Introduction'}</strong></span>
            </Link>
            <Link to={`/course/${slug(next || title)}`}>
              <span><small>NEXT LESSON</small><strong>{next || 'Next up'}</strong></span>
              <Icon name="ArrowRight" size={15} />
            </Link>
          </div>
        </article>
        <aside className="lesson-aside">
          <div className="aside-card">
            <span className="level-label">YOUR PROGRESS</span>
            <div className="aside-progress"><span /></div>
            <p>One small step at a time.</p>
            <button className="button button-primary full-width" onClick={handleMarkComplete}>
              Mark as complete <Icon name="Check" size={15} />
            </button>
          </div>
          <div className="aside-card aside-tip">
            <span className="aside-tip-icon">✳</span>
            <strong>Learning tip</strong>
            <p>Typing the code yourself helps the ideas stick. Give the playground a try!</p>
            <Link to="/playground">Open playground <Icon name="ArrowRight" size={13} /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CodeExample({ code, output }) {
  return (
    <div className="code-example">
      <div className="code-example-bar">
        <span><i /> Python</span>
        <button onClick={() => navigator.clipboard?.writeText(code)}>Copy code</button>
      </div>
      <pre>{code.split('\n').map((line, i) => <div key={i}><em>{i + 1}</em><code>{line}</code></div>)}</pre>
      <div className="output-label">EXPECTED OUTPUT</div>
      <pre className="expected-output">{output}</pre>
    </div>
  );
}

function Tutor() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hey there! I’m PyTutor. Ask me about Python or anything else, and I’ll help you work through it. 🌱' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState('English');
  const [connection, setConnection] = useState({ ready: null, label: 'Checking tutor connection…' });

  useEffect(() => {
    let active = true;
    fetch('/api/tutor/status')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(status => {
        if (!active) return;
        setConnection({
          ready: true,
          label: 'Website Knowledge + Google Search active'
        });
      })
      .catch(() => active && setConnection({ ready: false, label: 'Tutor server unavailable' }));
    return () => { active = false };
  }, []);

  const send = async (text = input) => {
    if (!text.trim() || busy) return;
    const user = { role: 'user', content: text };
    const history = [...messages, user];
    setMessages(history);
    setInput('');
    setBusy(true);
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), language: lang })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'PyTutor could not answer right now.');
      setMessages([...history, { role: 'assistant', content: data.reply, sources: data.sources || [], mode: data.mode }]);
    } catch (error) {
      setMessages([...history, { role: 'assistant', content: error.message || 'PyTutor could not answer right now.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-content inner-page tutor-page">
      <PageIntro eyebrow="YOUR FRIENDLY AI COMPANION" title="Meet PyTutor." copy="Ask any Python question. PyTutor searches lessons across our website and Google to give you the most accurate explanation and examples." />
      <div className="chat-shell">
        <div className="chat-header">
          <div className="tutor-avatar">✳</div>
          <div><strong>PyTutor</strong><small className="tutor-connection" data-ready={connection.ready}>{connection.label}</small></div>
          <div className="language-select"><span>Explain in</span><select value={lang} onChange={e => setLang(e.target.value)} aria-label="Explanation language"><option>English</option><option>Malayalam</option></select><Icon name="ChevronDown" size={13} /></div>
        </div>
        <div className="chat-messages">
          {messages.map((message, i) => (
            <div key={i} className={`chat-message ${message.role}`}>
              <div className="message-avatar">{message.role === 'assistant' ? '✳' : 'L'}</div>
              <div className="message-bubble">
                <small>{message.role === 'assistant' ? 'PyTutor' : 'You'}</small>
                <p>{message.content}</p>
                {message.sources?.length > 0 && (
                  <div className="answer-sources">
                    <small>Sources · Website & Google Search</small>
                    {message.sources.map(source => (
                      source.url.startsWith('/') ? (
                        <Link key={source.url} to={source.url} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--green)', fontWeight: 600 }}>
                          <Icon name="BookOpen" size={12} /> {source.title}
                        </Link>
                      ) : (
                        <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                          <Icon name="ExternalLink" size={12} /> {source.title}
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <div className="chat-message assistant"><div className="message-avatar">✳</div><div className="message-bubble typing"><i /><i /><i /></div></div>}
        </div>
        <div className="suggestions">{['What is a Python loop?', 'Explain variables simply', 'What is new in Python?'].map(s => <button key={s} onClick={() => send(s)}>{s}<Icon name="ArrowRight" size={13} /></button>)}</div>
        <form className="chat-input" onSubmit={e => { e.preventDefault(); send() }}><input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask PyTutor anything…" /><button type="submit" disabled={!input.trim() || busy} aria-label="Send message"><Icon name="Send" size={17} /></button></form>
        <div className="chat-disclaimer">Web answers include links to their sources. Check important information before acting on it.</div>
      </div>
    </div>
  );
}

function Practice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTopic = searchParams.get('topic');
  const matched = getQuizForTopic(requestedTopic || 'Loops');

  const [currentTopic, setCurrentTopic] = useState(matched.topic);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    if (requestedTopic) {
      const found = getQuizForTopic(requestedTopic);
      setCurrentTopic(found.topic);
      setQIndex(0);
      setSelected(null);
      setScore(0);
      setAnswered(0);
    }
  }, [requestedTopic]);

  const questions = topicQuizzes[currentTopic] || topicQuizzes['Loops'];
  const q = questions[qIndex];

  const selectTopic = (t) => {
    setCurrentTopic(t);
    setSearchParams({ topic: t });
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setAnswered(0);
  };

  const reset = () => {
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setAnswered(0);
  };

  const topicsList = Object.keys(topicQuizzes);
  const currentTopicIdx = topicsList.indexOf(currentTopic);
  const nextTopic = topicsList[(currentTopicIdx + 1) % topicsList.length];

  return (
    <div className="page-content inner-page practice-page">
      <PageIntro
        eyebrow="A CHANCE TO PRACTICE"
        title="Little challenges, big progress."
        copy="Pick a topic below to practice 10 targeted questions. Test your understanding, read explanations, and watch your skills grow."
      />

      <div className="filter-tabs" style={{ overflowX: 'auto', paddingBottom: 6, marginBottom: 20 }}>
        {topicsList.map(t => (
          <button
            key={t}
            onClick={() => selectTopic(t)}
            className={currentTopic === t ? 'selected' : ''}
            style={{ whiteSpace: 'nowrap' }}
          >
            {t} (10 Qs)
          </button>
        ))}
      </div>

      <div className="practice-layout">
        <div className="quiz-card">
          <div className="quiz-top">
            <span className="level-label">{currentTopic.toUpperCase()} · 10 PRACTICE QUESTIONS</span>
            <span className="quiz-score"><Icon name="Zap" size={14} /> {score} / 100 points</span>
          </div>
          <div className="quiz-progress">
            {questions.map((_, i) => <i key={i} className={i < answered ? 'done' : ''} />)}
          </div>
          {q ? (
            <>
              <div className="question-number">QUESTION {qIndex + 1} OF {questions.length}</div>
              <h2>{q.q}</h2>
              <div className="answer-list">
                {q.options.map((o, i) => (
                  <button
                    key={o}
                    className={`answer-option ${selected === i ? (i === q.answer ? 'correct' : 'incorrect') : ''} ${selected !== null && i === q.answer ? 'revealed' : ''}`}
                    onClick={() => {
                      if (selected !== null) return;
                      setSelected(i);
                      setAnswered(answered + 1);
                      if (i === q.answer) setScore(score + 10);
                    }}
                  >
                    <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
                    <span>{o}</span>
                    {selected !== null && i === q.answer && <Icon name="Check" size={16} />}
                  </button>
                ))}
              </div>
              {selected !== null && (
                <div className={`answer-feedback ${selected === q.answer ? 'feedback-good' : 'feedback-try'}`}>
                  <Icon name={selected === q.answer ? 'Check' : 'Lightbulb'} size={17} />
                  <p><strong>{selected === q.answer ? 'That’s right!' : 'Good try!'}</strong> {q.why}</p>
                </div>
              )}
              <div className="quiz-footer">
                <span><Icon name="Lightbulb" size={15} /> Take a guess. You can only learn from it.</span>
                {selected !== null && (
                  <button className="button button-primary" onClick={() => { setQIndex(qIndex + 1); setSelected(null); }}>
                    {qIndex === questions.length - 1 ? 'See results' : 'Next question'} <Icon name="ArrowRight" size={15} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="quiz-results">
              <div className="result-star">✳</div>
              <span className="level-label">{currentTopic.toUpperCase()} QUIZ COMPLETE</span>
              <h2>Nice work, learner!</h2>
              <p>You earned <strong>{score} points</strong> out of 100 on {currentTopic}. Keep practicing and it will all start to click!</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                <button className="button button-primary" onClick={reset}><Icon name="RotateCcw" size={15} /> Try again</button>
                <button className="button button-quiet" onClick={() => selectTopic(nextTopic)}>
                  Next: {nextTopic} (10 Qs) <Icon name="ArrowRight" size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
        <aside className="practice-aside">
          <div className="aside-card">
            <div className="quiz-aside-icon"><Icon name="ListChecks" size={20} /></div>
            <span className="level-label">CURRENT TOPIC</span>
            <h3>{currentTopic}</h3>
            <p>10 targeted questions to master {currentTopic}. Pick each answer to see detailed explanations.</p>
          </div>
          <div className="aside-card practice-stat">
            <span className="level-label">TOPIC PROGRESS</span>
            <strong>{answered}<small> of {questions.length} answered</small></strong>
            <div className="progress-track"><i style={{ width: `${(answered / questions.length) * 100}%` }} /></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
