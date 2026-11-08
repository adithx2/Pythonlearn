import { tutorReply, tutorStatus, fallbackReply } from '../services/tutorService.js';

export function getTutorStatus(_req, res) {
  res.json(tutorStatus());
}

export async function askTutor(req, res) {
  const { messages, language = 'English' } = req.body || {};
  if (!Array.isArray(messages) || !messages.length || messages.length > 30) {
    return res.status(400).json({ error: 'Send a conversation with up to 30 messages.' });
  }
  const safeMessages = messages
    .filter(message => ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
    .map(message => ({ role: message.role, content: message.content.slice(0, 4000) }));
  
  const safeLanguage = typeof language === 'string' ? language.slice(0, 40) : 'English';

  try {
    const result = await tutorReply(safeMessages, safeLanguage);
    res.json(result);
  } catch (error) {
    console.error('PyTutor request failed, activating fallback:', error?.message);
    const currentQuestion = [...safeMessages].reverse().find(m => m.role === 'user')?.content || '';
    const fallback = fallbackReply(currentQuestion, safeLanguage);
    res.json(fallback);
  }
}
