import { useState, useRef } from 'react';
import { apiUrl } from './api.js';
import { BookOpen, Check, ChevronRight, CircleHelp, Command, Copy, Lightbulb, Play, RotateCcw, Sparkles, Terminal, X } from 'lucide-react';

let pyodidePromise;
async function getPyodide(){
  if(!pyodidePromise)pyodidePromise=(async()=>{
    const{loadPyodide,version}=await import('pyodide');
    return loadPyodide({indexURL:`https://cdn.jsdelivr.net/pyodide/v${version}/full/`});
  })();
  return pyodidePromise;
}

const examples=[
  ['Hello world','print("Hello, world!")'],
  ['Loops','for number in range(1, 6):\n    print(number, "✳")'],
  ['Lists','favorites = ["Python", "creativity", "coffee"]\nfor thing in favorites:\n    print("I love", thing)'],
  ['A tiny function','def cheer(name):\n    return f"You have got this, {name}!"\n\nprint(cheer("learner"))']
];

export default function PlaygroundPage(){
  const[code,setCode]=useState('name = "Python learner"\nprint(f"Hello, {name}!")\nprint("You are ready to build something.")');
  const[output,setOutput]=useState('');
  const[explanation,setExplanation]=useState('');
  const[busy,setBusy]=useState(false);
  const[explaining,setExplaining]=useState(false);
  const[tab,setTab]=useState('output');
  const[copied,setCopied]=useState(false);
  const lineNumbersRef=useRef(null);
  const textareaRef=useRef(null);

  const handleScroll=(e)=>{
    if(lineNumbersRef.current){
      lineNumbersRef.current.scrollTop=e.target.scrollTop;
    }
  };

  const copyCode=async()=>{
    try{
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(()=>setCopied(false),1500);
    }catch{}
  };

  const run=async()=>{
    setBusy(true);setTab('output');setOutput('');
    try{
      const py=await getPyodide(),lines=[];
      py.setStdout({batched:s=>lines.push(s)});
      py.setStderr({batched:s=>lines.push(s)});
      await py.runPythonAsync(code);
      setOutput(lines.join('\n')||'Code ran successfully with no output.');
    }catch(e){setOutput(`Error: ${e.message}`)}finally{setBusy(false)}
  };

  const explain=async()=>{
    setTab('help');setExplaining(true);setExplanation('');
    try{
      const response=await fetch(apiUrl('/api/tutor'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:'English',messages:[{role:'user',content:`Explain this Python code line by line for a beginner. For each line, describe what it does in simple language. Do not ask me to paste code. Code:\n${code}`} ]})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Tutor unavailable');
      setExplanation(data.reply);
    }catch(e){setExplanation(`Could not create the explanation: ${e.message}`)}finally{setExplaining(false)}
  };

  const selectExample=(exampleCode)=>{
    setCode(exampleCode);
    setOutput('');
    setExplanation('');
    if(window.innerWidth<=850){
      window.scrollTo({top:0,behavior:'smooth'});
    }
  };

  return <div className="page-content inner-page playground-page">
    <div className="page-intro"><div className="eyebrow small-eyebrow">YOUR CREATIVE SPACE</div><h1>The Python playground.</h1><p>Write code, press run, and see what happens. Your Python environment runs right here in the browser.</p></div>
    <div className="playground-layout">
      <div className="editor-column">
        <div className="editor-top">
          <div className="editor-file">
            <span className="python-icon">Py</span>
            <span>playground.py</span>
            <span className="unsaved-dot"/>
          </div>
          <div className="editor-actions">
            <button onClick={copyCode} title="Copy code" aria-label="Copy code">
              {copied ? <Check size={14}/> : <Copy size={14}/>}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button onClick={()=>setCode('# Your Python adventure starts here\nprint("Hello, world!")')} title="Reset code" aria-label="Reset code">
              <RotateCcw size={14}/>
              <span>Reset</span>
            </button>
            <button onClick={()=>setCode('')} title="Clear code" aria-label="Clear code">
              <X size={14}/>
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="editor-work">
          <div className="line-numbers" ref={lineNumbersRef} aria-hidden="true">
            {code.split('\n').map((_,i)=><span key={i}>{i+1}</span>)}
          </div>
          <textarea
            ref={textareaRef}
            aria-label="Python code editor"
            spellCheck="false"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            value={code}
            onChange={e=>setCode(e.target.value)}
            onScroll={handleScroll}
          />
        </div>

        <div className="editor-bottom">
          <span className="editor-status">
            <span className="online-dot"/>
            <span>Python 3 · Pyodide</span>
          </span>
          <button className="button button-run" disabled={busy} onClick={run}>
            <Play size={15}/>
            <span>{busy?'Starting Python…':'Run code'}</span>
          </button>
        </div>

        <div className="output-panel">
          <div className="output-tabs">
            <button onClick={()=>setTab('output')} className={tab==='output'?'active':''}>
              <Terminal size={14}/> Output
            </button>
            <button onClick={explain} className={tab==='help'?'active':''}>
              <CircleHelp size={14}/> Explain code
            </button>
          </div>
          {tab==='output'?(
            <pre className={output.startsWith('Error')?'error-output':''}>
              {output||<span className="output-placeholder">Your output will appear here. Give it a try <span>↗</span></span>}
            </pre>
          ):(
            <pre className="how-copy">
              {explaining?'Reading your code and preparing an explanation…':explanation||'Choose “Explain code” to get a beginner-friendly, line-by-line explanation of the code in the editor.'}
            </pre>
          )}
        </div>
      </div>

      <aside className="examples-column">
        <div className="examples-heading">
          <div>
            <span className="level-label">NEED A SPARK?</span>
            <h3>Try an example</h3>
          </div>
          <span>✳</span>
        </div>
        <p className="examples-intro">Pick one, then make it your own.</p>
        <div className="examples-list">
          {examples.map(([name,example],i)=>(
            <button className="example-card" key={name} onClick={()=>selectExample(example)}>
              <span className={`example-icon ex-${i}`}>
                {i===3?<Sparkles size={16}/>:i===0?<Command size={16}/>:i===1?<RotateCcw size={16}/>:<BookOpen size={16}/>}
              </span>
              <span className="example-info">
                <strong>{name}</strong>
                <small>{example.split('\n')[0]}</small>
              </span>
              <ChevronRight size={15}/>
            </button>
          ))}
        </div>
        <div className="playground-tip">
          <Lightbulb size={16}/>
          <span><strong>Make a change!</strong><br/>Change a word, number, or line, then run it again.</span>
        </div>
      </aside>
    </div>
  </div>;
}
