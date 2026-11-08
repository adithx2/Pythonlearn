import { lessons, curriculum, quizQuestions } from '../../client/src/data.js';

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function tutorStatus() {
  return {
    ready: true,
    provider: process.env.GEMINI_API_KEY ? 'Google Gemini + PythonLearn' : 'PythonLearn AI + Web Grounding',
    searchEnabled: true
  };
}

/**
 * Searches the website's built-in curriculum and lessons.
 */
export function searchWebsite(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.toLowerCase().trim();
  const words = q
    .split(/[^a-z0-9]+/)
    .filter(w => w.length > 2 && !['what', 'how', 'why', 'when', 'the', 'and', 'for', 'are', 'can', 'you', 'explain', 'tell', 'about', 'with', 'does', 'this', 'that', 'code', 'python', 'give', 'show'].includes(w));

  const results = [];
  for (const lesson of lessons) {
    let score = 0;
    const titleLower = lesson.title.toLowerCase();
    const tagLower = (lesson.tag || '').toLowerCase();
    const descLower = (lesson.description || '').toLowerCase();
    const explLower = (lesson.explanation || '').toLowerCase();
    const codeLower = (lesson.code || '').toLowerCase();

    // Exact title matches
    if (q.includes(titleLower)) score += 60;
    if (titleLower.includes(q)) score += 40;

    // Word matching
    for (const word of words) {
      if (titleLower === word) score += 35;
      else if (titleLower.includes(word)) score += 20;
      if (tagLower.includes(word)) score += 12;
      if (descLower.includes(word)) score += 8;
      if (explLower.includes(word)) score += 6;
      if (codeLower.includes(word)) score += 5;
    }

    // Specific concept aliases
    if (/\b(loop|loops|repeat|iteration|iterate|for\s+in|while)\b/i.test(q) && lesson.title === 'Loops') score += 50;
    if (/\b(func|function|functions|def|argument|arguments|parameter|parameters|return)\b/i.test(q) && (lesson.title === 'Functions' || lesson.title === 'Arguments and Parameters')) score += 50;
    if (/\b(var|variable|variables|assign|assignment|store)\b/i.test(q) && lesson.title === 'Variables') score += 50;
    if (/\b(data\s*type|types|int|integer|float|string|bool|boolean)\b/i.test(q) && (lesson.title === 'Data Types' || lesson.title === 'Type Conversion')) score += 50;
    if (/\b(operator|operators|math|arithmetic|comparison|modulo|percent)\b/i.test(q) && lesson.title === 'Operators') score += 50;
    if (/\b(if|else|elif|conditional|condition|conditions|branch)\b/i.test(q) && lesson.title === 'Conditional Statements') score += 50;
    if (/\b(string|strings|str|text|upper|lower|slice|slicing)\b/i.test(q) && lesson.title === 'Strings') score += 50;
    if (/\b(list|lists|array|arrays|append|pop|index)\b/i.test(q) && lesson.title === 'Lists') score += 50;
    if (/\b(tuple|tuples|unpack|immutable)\b/i.test(q) && lesson.title === 'Tuples') score += 50;
    if (/\b(set|sets|unique|intersection|union)\b/i.test(q) && lesson.title === 'Sets') score += 50;
    if (/\b(dict|dictionary|dictionaries|key|value|keys|values|mapping)\b/i.test(q) && lesson.title === 'Dictionaries') score += 50;
    if (/\b(lambda|anonymous\s*function)\b/i.test(q) && lesson.title === 'Lambda Functions') score += 50;
    if (/\b(comprehension|list\s*comp)\b/i.test(q) && lesson.title === 'List Comprehensions') score += 50;
    if (/\b(oop|class|classes|object|objects|self|__init__|attribute|method)\b/i.test(q) && (lesson.title === 'Classes and Objects' || lesson.title === 'Object-Oriented Programming')) score += 50;
    if (/\b(inherit|inheritance|subclass|parent\s*class)\b/i.test(q) && lesson.title === 'Inheritance') score += 50;
    if (/\b(error|errors|exception|exceptions|traceback|try|except|try-except)\b/i.test(q) && lesson.title === 'Exception Handling') score += 50;
    if (/\b(file|files|read|write|file\s*handling|open)\b/i.test(q) && lesson.title === 'File Handling') score += 50;
    if (/\b(module|modules|package|packages|import)\b/i.test(q) && lesson.title === 'Modules and Packages') score += 50;
    if (/\b(decorator|decorators|@)\b/i.test(q) && lesson.title === 'Decorators') score += 50;
    if (/\b(generator|generators|yield)\b/i.test(q) && lesson.title === 'Generators') score += 50;
    if (/\b(iterator|iterators|iter|next)\b/i.test(q) && lesson.title === 'Iterators') score += 50;
    if (/\b(regex|regular\s*expression|findall|pattern|re\s*module)\b/i.test(q) && lesson.title === 'Regular Expressions') score += 50;
    if (/\b(venv|virtualenv|virtual\s*environment|environment|pip)\b/i.test(q) && lesson.title === 'Virtual Environments') score += 50;
    if (/\b(api|apis|json|endpoint|rest|fetch|requests)\b/i.test(q) && lesson.title === 'Working with APIs') score += 50;
    if (/\b(database|databases|sql|sqlite|records|query)\b/i.test(q) && lesson.title === 'Database Connectivity') score += 50;
    if (/\b(project|projects|capstone|build)\b/i.test(q) && lesson.title === 'Python Projects') score += 50;

    if (score >= 15) {
      results.push({
        title: lesson.title,
        level: lesson.level,
        duration: lesson.duration,
        tag: lesson.tag,
        description: lesson.description,
        explanation: lesson.explanation,
        code: lesson.code,
        output: lesson.output,
        exercise: lesson.exercise,
        url: `/course/${slug(lesson.title)}`,
        score
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 2);
}

/**
 * Builds Google Search sources and official Python documentation links.
 */
export function getSearchSources(query, websiteLessons = []) {
  const sources = [];

  // 1. Website Course Lessons
  for (const w of websiteLessons) {
    sources.push({
      title: `PythonLearn Lesson: ${w.title} (${w.level})`,
      url: w.url,
      type: 'website'
    });
  }

  // 2. Google Search query link
  const cleanQ = query.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const searchTerms = encodeURIComponent(`python ${cleanQ}`);
  sources.push({
    title: `Google Search: "python ${cleanQ}"`,
    url: `https://www.google.com/search?q=${searchTerms}`,
    type: 'google'
  });

  // 3. Official Documentation reference
  if (websiteLessons.length > 0) {
    const mainTitle = websiteLessons[0].title.toLowerCase();
    if (mainTitle.includes('loop')) {
      sources.push({ title: 'Python Docs: Control Flow & Loops', url: 'https://docs.python.org/3/tutorial/controlflow.html#for-statements', type: 'web' });
    } else if (mainTitle.includes('function') || mainTitle.includes('argument')) {
      sources.push({ title: 'Python Docs: Defining Functions', url: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions', type: 'web' });
    } else if (mainTitle.includes('data') || mainTitle.includes('variable') || mainTitle.includes('operator')) {
      sources.push({ title: 'Python Docs: An Informal Introduction', url: 'https://docs.python.org/3/tutorial/introduction.html', type: 'web' });
    } else if (mainTitle.includes('list') || mainTitle.includes('dict') || mainTitle.includes('tuple') || mainTitle.includes('set')) {
      sources.push({ title: 'Python Docs: Data Structures', url: 'https://docs.python.org/3/tutorial/datastructures.html', type: 'web' });
    } else if (mainTitle.includes('class') || mainTitle.includes('object') || mainTitle.includes('inheritance')) {
      sources.push({ title: 'Python Docs: Classes and OOP', url: 'https://docs.python.org/3/tutorial/classes.html', type: 'web' });
    } else if (mainTitle.includes('file')) {
      sources.push({ title: 'Python Docs: Reading & Writing Files', url: 'https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files', type: 'web' });
    } else if (mainTitle.includes('exception')) {
      sources.push({ title: 'Python Docs: Errors and Exceptions', url: 'https://docs.python.org/3/tutorial/errors.html', type: 'web' });
    } else if (mainTitle.includes('module')) {
      sources.push({ title: 'Python Docs: Modules & Standard Library', url: 'https://docs.python.org/3/tutorial/modules.html', type: 'web' });
    } else if (mainTitle.includes('decorator') || mainTitle.includes('generator') || mainTitle.includes('iterator')) {
      sources.push({ title: 'Python Docs: Iterators & Functional Tools', url: 'https://docs.python.org/3/howto/functional.html', type: 'web' });
    } else {
      sources.push({ title: 'Official Python Documentation', url: 'https://docs.python.org/3/', type: 'web' });
    }
  } else {
    sources.push({ title: 'Official Python Documentation', url: 'https://docs.python.org/3/', type: 'web' });
  }

  return sources;
}

function explainCode(question) {
  const snippet = String(question).match(/code:\s*([\s\S]*)$/i)?.[1]?.trim();
  if (!snippet) return 'Paste your Python code in the playground, then ask me to explain it and I’ll walk through it line by line.';
  const lines = snippet.split('\n');
  const explanations = lines.map((line, index) => {
    const code = line.trim();
    let note;
    if (!code) note = 'This blank line separates parts of the program.';
    else if (code.startsWith('#')) note = 'A comment for humans reading the code; Python ignores it.';
    else if (/^print\s*\(/.test(code)) note = 'Displays the given value in the output console.';
    else if (/^for\s+(.+?)\s+in\s+(.+):/.test(code)) { const [, item, values] = code.match(/^for\s+(.+?)\s+in\s+(.+):/); note = `Starts a for loop: assigns each value from ${values} to ${item} and runs the indented body.`; }
    else if (/^while\s+(.+):/.test(code)) note = `Starts a while loop: repeats the indented body as long as ${code.slice(6, -1)} remains True.`;
    else if (/^if\s+(.+):/.test(code)) note = `Checks if ${code.slice(3, -1)} is True. If so, runs the indented lines below.`;
    else if (/^elif\s+(.+):/.test(code)) note = `Checks this alternative condition if earlier conditions were False.`;
    else if (code === 'else:') note = 'Fallback branch that executes if none of the if/elif conditions met.';
    else if (/^def\s+(\w+)\s*\((.*)\)\s*:/.test(code)) { const [, name, args] = code.match(/^def\s+(\w+)\s*\((.*)\)\s*:/); note = `Defines reusable function ${name}(${args || ''}).`; }
    else if (/^return\b/.test(code)) note = 'Returns this result from the function.';
    else if (/^import\s+/.test(code)) note = 'Imports an external module to use its functions.';
    else if (/^\w+\.append\(/.test(code)) note = 'Appends an element to the end of the list.';
    else if (/^\w+\s*=/.test(code)) { const [, name, value] = code.match(/^(\w+)\s*=\s*(.*)$/); note = `Assigns ${value} to variable '${name}'.`; }
    else note = 'Executes this statement in Python.';
    return `${index + 1}. \`${code || '(blank line)'}\` — ${note}`;
  });
  return `Here is a line-by-line breakdown of your code:\n\n${explanations.join('\n')}\n\nFeel free to test it in our Playground and tweak values!`;
}

/**
 * Intelligent fallback grounded in Website Curriculum & Google Search links.
 */
export function fallbackReply(question, language = 'English') {
  const isMalayalam = String(language).toLowerCase() === 'malayalam';
  const websiteLessons = searchWebsite(question);
  const sources = getSearchSources(question, websiteLessons);

  if (/explain this python code|explain (my )?code|line by line/i.test(question)) {
    return { reply: explainCode(question), sources, mode: 'website-grounded' };
  }

  if (websiteLessons.length > 0) {
    const lesson = websiteLessons[0];
    let reply = '';

    if (isMalayalam) {
      reply += `നമസ്കാരം! 🌱 നിങ്ങൾ ചോദിച്ച ചോദ്യത്തിനുള്ള വിശദീകരണം ഇതാ:\n\n`;
      reply += `📚 **നമ്മുടെ വെബ്സൈറ്റിലെ പാഠം:** **[${lesson.title}](${lesson.url})** (${lesson.level} ലെവൽ · ${lesson.duration})\n\n`;
      reply += `${lesson.description}\n\n`;
      reply += `**തത്ത്വം (Concept):**\n${lesson.explanation}\n\n`;
      reply += `💻 **കോഡ് ഉദാഹരണം (Try in Playground):**\n\`\`\`python\n${lesson.code}\n\`\`\`\n`;
      reply += `**പ്രതീക്ഷിക്കുന്ന ഫലം (Output):**\n\`\`\`\n${lesson.output}\n\`\`\`\n\n`;
      reply += `✍️ **സ്വയം പരിശീലിക്കാം (Exercise):**\n${lesson.exercise}\n\n`;
      reply += `കൂടുതൽ വിവരങ്ങൾക്കായി താഴെ നൽകിയിട്ടുള്ള വെബ്സൈറ്റ് പാഠവും Google Search ലിങ്കുകളും പരിശോധിക്കാവുന്നതാണ്!`;
    } else {
      reply += `Great question! Here is an explanation based on our course and Python standards:\n\n`;
      reply += `📚 **Found on PythonLearn:** Check out our lesson **[${lesson.title}](${lesson.url})** (${lesson.level} Level · ${lesson.duration})\n\n`;
      reply += `**Summary:** ${lesson.description}\n\n`;
      reply += `**How it works:** ${lesson.explanation}\n\n`;
      reply += `💻 **Example Code:**\n\`\`\`python\n${lesson.code}\n\`\`\`\n`;
      reply += `**Expected Output:**\n\`\`\`\n${lesson.output}\n\`\`\`\n\n`;
      reply += `🎯 **Practice Challenge:**\n${lesson.exercise}\n\n`;
      reply += `You can test this right now in our built-in **Playground** or open the lesson directly from the link above. Check the Google Search sources below for more deep dives and official docs!`;
    }

    return { reply, sources, mode: 'website-grounded' };
  }

  // General Python question fallback
  let reply = '';
  if (isMalayalam) {
    reply = `Python-മായി ബന്ധപ്പെട്ട നിങ്ങളുടെ സംശയങ്ങൾക്ക് സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. 🌱\n\nനിങ്ങൾ തിരഞ്ഞ വിഷയത്തെക്കുറിച്ചുള്ള വിവരങ്ങൾ കണ്ടെത്താൻ വെബ്സൈറ്റിലെ കോഴ്സുകളും Google Search ലിങ്കുകളും താഴെ നൽകിയിരിക്കുന്നു. ദയവായി ചോദ്യം കുറച്ചുകൂടി വ്യക്തമായി ചോദിക്കുകയോ കോഡ് പേസ്റ്റ് ചെയ്യുകയോ ചെയ്യുക.`;
  } else {
    reply = `I searched our website and Python resources for your question: "${question}".\n\nPython is known for its clean syntax and readability. You can explore all our step-by-step lessons in the **Python Course** tab, or run and experiment with live code in our **Playground**.\n\nCheck the Google Search and documentation links below to explore this topic further!`;
  }

  return { reply, sources, mode: 'website-grounded' };
}

/**
 * Main AI reply combining Website Search + Google Search Grounding.
 */
async function geminiReply(messages, language) {
  const currentQuestion = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const websiteLessons = searchWebsite(currentQuestion);
  const baseSources = getSearchSources(currentQuestion, websiteLessons);

  let websiteContext = '';
  if (websiteLessons.length > 0) {
    websiteContext = `\n\n[RELEVANT LESSONS FOUND ON THIS WEBSITE]:\n` + websiteLessons.map(l =>
      `- Title: ${l.title} (${l.level} Level)\n  Link: ${l.url}\n  Description: ${l.description}\n  Explanation: ${l.explanation}\n  Code Example:\n\`\`\`python\n${l.code}\n\`\`\`\n  Output: ${l.output}\n  Exercise: ${l.exercise}`
    ).join('\n\n');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const input = messages.map(({ role, content }) => (role === 'assistant' ? 'PyTutor' : 'Learner') + ': ' + content).join('\n\n');

  const systemInstruction = `You are PyTutor, a helpful, patient AI Python tutor for PythonLearn.
When answering questions:
1. FIRST, check if the question relates to the lessons found on our website provided below. If it does, reference the lesson title (e.g., "In our [${websiteLessons[0]?.title || 'Python course'}] lesson..."), explain the concept clearly, and provide the runnable code example.
2. SECOND, use Google Search to verify current Python best practices and documentation (python.org, w3schools, etc.).
3. Explain clearly in ${language}.
4. Provide structured, encouraging answers with small code examples that learners can try in the website's Playground.
${websiteContext}`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      model,
      input,
      system_instruction: systemInstruction,
      tools: [{ type: 'google_search' }],
      generation_config: { temperature: 0.4, max_output_tokens: 1600 },
      store: false
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `Google Gemini request failed (${response.status})`);
  }

  const textBlocks = (data.steps || [])
    .filter(step => step.type === 'model_output')
    .flatMap(step => step.content || [])
    .filter(part => part.type === 'text');
  const reply = data.output_text || textBlocks.map(part => part.text || '').join('').trim();
  if (!reply) throw new Error('Empty response from Google Gemini');

  // Collect Google Search citations
  const sourceMap = new Map();
  // Include website lessons first
  for (const s of baseSources) {
    sourceMap.set(s.url, s);
  }
  // Add live Google Search citations returned by Gemini
  for (const part of textBlocks) {
    for (const citation of part.annotations || []) {
      if (citation.type !== 'url_citation' || !citation.url || !/^https?:\/\//i.test(citation.url)) continue;
      let title = citation.title;
      try { title ||= new URL(citation.url).hostname; } catch { continue; }
      sourceMap.set(citation.url, { title, url: citation.url, type: 'web' });
    }
  }

  return { reply, sources: [...sourceMap.values()].slice(0, 6), mode: 'google-search' };
}

export async function tutorReply(messages, language = 'English') {
  const currentQuestion = [...messages].reverse().find(message => message.role === 'user')?.content || '';

  if (process.env.GEMINI_API_KEY) {
    try {
      return await geminiReply(messages, language);
    } catch (error) {
      console.warn('Gemini live search unavailable (falling back to website + Google Search grounding):', error.message);
      return fallbackReply(currentQuestion, language);
    }
  }

  return fallbackReply(currentQuestion, language);
}
