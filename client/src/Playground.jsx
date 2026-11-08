import { useState } from 'react';
import { BookOpen, Check, ChevronRight, CircleHelp, Command, Lightbulb, Play, RotateCcw, Sparkles, Terminal, X } from 'lucide-react';

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
      const response=await fetch('/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:'English',messages:[{role:'user',content:`Explain this Python code line by line for a beginner. For each line, describe what it does in simple language. Do not ask me to paste code. Code:\n${code}`} ]})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Tutor unavailable');
      setExplanation(data.reply);
    }catch(e){setExplanation(`Could not create the explanation: ${e.message}`)}finally{setExplaining(false)}
  };

  return <div className="page-content inner-page">
    <div className="page-intro"><div className="eyebrow small-eyebrow">YOUR CREATIVE SPACE</div><h1>The Python playground.</h1><p>Write code, press run, and see what happens. Your Python environment runs right here in the browser.</p></div>
    <div className="playground-layout"><div className="editor-column">
      <div className="editor-top"><div className="editor-file"><span className="python-icon">Py</span> playground.py <span className="unsaved-dot"/></div><div className="editor-actions"><button onClick={()=>setCode('# Your Python adventure starts here\nprint("Hello, world!")')}><RotateCcw size={14}/> Reset</button><button onClick={()=>setCode('')}><X size={14}/> Clear</button></div></div>
      <div className="editor-work"><div className="line-numbers">{code.split('\n').map((_,i)=><span key={i}>{i+1}</span>)}</div><textarea aria-label="Python code editor" spellCheck="false" value={code} onChange={e=>setCode(e.target.value)}/></div>
      <div className="editor-bottom"><span><span className="online-dot"/> Python 3 · Pyodide</span><button className="button button-run" disabled={busy} onClick={run}><Play size={15}/>{busy?'Starting Python…':'Run code'}</button></div>
      <div className="output-panel"><div className="output-tabs"><button onClick={()=>setTab('output')} className={tab==='output'?'active':''}><Terminal size={14}/> Output</button><button onClick={explain} className={tab==='help'?'active':''}><CircleHelp size={14}/> Explain code</button></div>
        {tab==='output'?<pre className={output.startsWith('Error')?'error-output':''}>{output||<span className="output-placeholder">Your output will appear here. Give it a try <span>↗</span></span>}</pre>:<pre className="how-copy">{explaining?'Reading your code and preparing an explanation…':explanation||'Choose “Explain code” to get a beginner-friendly, line-by-line explanation of the code in the editor.'}</pre>}
      </div>
    </div><aside className="examples-column"><div className="examples-heading"><div><span className="level-label">NEED A SPARK?</span><h3>Try an example</h3></div><span>✳</span></div><p className="examples-intro">Pick one, then make it your own.</p>{examples.map(([name,example],i)=><button className="example-card" key={name} onClick={()=>{setCode(example);setOutput('');setExplanation('')}}><span className={`example-icon ex-${i}`}>{i===3?<Sparkles size={16}/>:i===0?<Command size={16}/>:i===1?<RotateCcw size={16}/>:<BookOpen size={16}/>}</span><span><strong>{name}</strong><small>{example.split('\n')[0]}</small></span><ChevronRight size={15}/></button>)}<div className="playground-tip"><Lightbulb size={16}/><span><strong>Make a change!</strong><br/>Change a word, number, or line, then run it again.</span></div></aside></div>
  </div>;
}
