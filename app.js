(function(){
  document.addEventListener('DOMContentLoaded', function(){

    // ===== CONFIG: Replace with your Apps Script URLs and token =====
    const CONFIG = {
      WRITE_URL: "https://script.google.com/macros/s/AKfycbwhibQXZeY4_pJUYe33tOmzeKZunxiEOWpubD-tTwVlyW_-lurlVXTg0MOMVSLt_7E/exec",
      READ_URL:  "https://script.google.com/macros/s/AKfycbwhibQXZeY4_pJUYe33tOmzeKZunxiEOWpubD-tTwVlyW_-lurlVXTg0MOMVSLt_7E/exec?mode=read",
      SENTENCE_UPLOAD_URL: "https://script.google.com/macros/s/AKfycbwhibQXZeY4_pJUYe33tOmzeKZunxiEOWpubD-tTwVlyW_-lurlVXTg0MOMVSLt_7E/exec?mode=uploadSentences",
      SHARED_TOKEN: "Unity77"
    };

    // ===== Helpers =====
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    function uuid(){return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));}
    function formatDateTime(d=new Date()){return {date:d.toLocaleDateString(), time:d.toLocaleTimeString()};}
    function downloadCSV(filename, rows){
      const csv=[Object.keys(rows[0]).join(",")].concat(rows.map(r=>Object.values(r).map(v=>`"${String(v).replaceAll('"','""')}"`).join(","))).join("\n");
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
    }
    function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

    // ===== Sentences (100 school-appropriate, symbol-heavy) =====
    const DEFAULT_SENTENCES = [
      "Type () parentheses to wrap function calls like print(\"hello\").",
      "Curly braces {} often define blocks in C#, JavaScript, and Java.",
      "Square brackets [] index arrays like arr[0] and arr[1].",
      "Angle brackets <> appear in HTML tags like <div> and </div>.",
      "Use a forward slash / in paths like /images/logo.png.",
      "A backslash \\\\ escapes characters in strings like \\\"line\\\\n\\\".",
      "Colons : and semicolons ; separate values and end CSS rules;",
      "Quotes \"double\" and 'single' both wrap string literals.",
      "A period . accesses object.property while a comma , separates items.",
      "The question mark ? and exclamation ! end sentences in comments.",
      "Use @ for decorators or mentions like @media in CSS.",
      "Hashes # mark IDs in CSS like #app or start Python comments.",
      "Dollar signs $ show template strings like ${name} in JS.",
      "Carets ^ and ampersands & appear in regex and bitwise ops.",
      "Asterisks * can multiply or mark italics in Markdown.",
      "Underscore _ often substitutes spaces_in_identifiers.",
      "Hyphen - and plus + show -subtract and +add in math.",
      "Equals = assigns, while == and === compare values.",
      "Pipes | combine commands or create OR in regex.",
      "Backticks ` wrap code or make JS template literals.",
      "Tilde ~ appears in paths like ~/projects or regex ranges.",
      "Use // for single-line comments in JS and C-like languages.",
      "Use /* block comments */ to explain complex code.",
      "HTML attributes go inside tags like <img src=\"/a.png\">.",
      "CSS rules end with semicolons; and use braces { }.",
      "In URLs, ? starts queries and & joins key=value pairs.",
      "JSON uses braces { } and quotes \" for keys and values.",
      "Write arrays as [1, 2, 3] and objects as { x: 1 }.",
      "Parentheses () group math like (a + b) * c.",
      "Regex often uses /pattern/ with flags like /g or /i.",
      "Angle brackets <> surround generics like List<int>.",
      "Use => for arrow functions like (x) => x * 2.",
      "Python slices look like arr[0:3] with a colon :.",
      "Dictionaries map { 'key': 'value' } with commas,.",
      "Escapes include \\t tabs, \\n newlines, and \\\" quotes.",
      "Template literals: `Hello, ${user}!` with backticks.",
      "Command pipes: ls -la | grep src | sort.",
      "Use cd ../ to move up and ./ to run local scripts.",
      "Compare with >=, <=, !=, and !== appropriately.",
      "Use const obj = { a: [1,2], b: { c: 3 } }.",
      "Spread syntax ...copies arrays like [...arr].",
      "Destructure: const { id, name } = user;",
      "Imports use from: import x from 'mod';",
      "Exports use export default App;",
      "HTML comments look like <!-- note --> with angle brackets.",
      "In CSS, :hover and :focus are pseudo-classes.",
      "Use ::before and ::after for pseudo-elements.",
      "URL encoding converts spaces to %20 in links.",
      "YAML uses dashes - for lists and colons : for keys.",
      "Markdown links: [text](https://example.com).",
      "Git branches use slashes like feature/login-ui.",
      "Run git status, git add ., and git commit -m 'msg'.",
      "Merge conflicts show <<<<<<< and >>>>>>> markers.",
      "Package.json includes { \"scripts\": { \"start\": \"...\" } }.",
      "NPM commands: npm i, npm run build, npm run dev.",
      "Environment vars look like KEY=value lines.",
      "Bash variables use $HOME and $(command).",
      "Comparisons in Bash: [ $a -gt 0 ] && echo ok;",
      "SQL uses SELECT * FROM table WHERE id = 1;",
      "Escaping SQL strings uses single quotes 'like this'.",
      "C# string interpolation: \$\"Hello {name}!\" with braces.",
      "Python f-strings: f\"Hi {user}\" with curly braces {}.",
      "HTML entities like &lt; and &gt; show < and >.",
      "JS nullish coalescing uses ?? and optional chaining ?. ",
      "Bitwise ops: x << 2, y >> 1, and z & 1.",
      "Logic ops: && is AND, || is OR, and ! negates.",
      "CSS calc() computes widths like calc(100% - 20px).",
      "Flexbox uses display: flex; and gap: 12px;",
      "Grid uses display: grid; with template columns.",
      "Media queries: @media (max-width: 600px) { ... }",
      "SVG tags like <svg> and <path d=\"M10 10 L20 20\">.",
      "URLs may contain #hash anchors and ?query=1.",
      "HTML inputs include type=\"text\", type=\"email\", and type=\"number\".",
      "Escape backticks in code blocks with triple ``` fences.",
      "Use | pipes in Markdown tables like |a|b|.",
      "Windows paths use backslashes C:\\Users\\Name\\.",
      "Node paths often start with ./src/index.js.",
      "CSS variables: var(--color) with fallback var(--c, #fff).",
      "Use map.get(key) and set(key, value) in JS Maps.",
      "JSON arrays [ {\"id\":1}, {\"id\":2} ] store objects.",
      "Angle brackets appear in TypeScript generics like Promise<void>.",
      "TS non-null assertion uses ! after a var like el!.",
      "Imports can be named: import { useState } from 'react';",
      "Link tags: <link rel=\"stylesheet\" href=\"/styles.css\">.",
      "Script tags: <script src=\"/app.js\" defer><\/script> with angle brackets.",
      "HTML attributes can be boolean like disabled or required.",
      "Fetch: fetch('/api', { method: 'POST', body: JSON.stringify({ a:1 }) });",
      "JSON.parse('{\\\"a\\\":1}') returns an object with braces { }.",
      "LocalStorage keys are strings like localStorage.getItem('x').",
      "CSS :root defines variables and * sets box-sizing: border-box;",
      "Use Promise.all([a, b]) to await multiple results.",
      "Regex groups use ( ) and classes use [A-Z].",
      "Escape dots in regex as \\. to match a literal period .",
      "Anchors ^ start and $ end regex lines.",
      "Lookaheads use (?=...) and lookbehinds (?<=...).",
      "JSON must use double quotes \" not single quotes '.",
      "JS Date: new Date().toISOString() returns a timestamp.",
      "URLSearchParams builds ?key=value&x=1 strings.",
      "Encode with encodeURI() and encodeURIComponent().",
      "Set-Cookie headers include key=value; Path=/; Secure;",
      "HTTP methods include GET, POST, PUT, and DELETE.",
      "Status codes: 200 OK, 401 Unauthorized, 404 Not Found.",
      "Angle brackets enclose <meta charset=\"utf-8\"> in HTML.",
      "Escapes in JSON require \\\" for embedded quotes.",
      "Template placeholders like {{name}} appear in many tools.",
      "Pipes | in Angular templates and OR in regex [a|b].",
      "Use (() => { })() for an IIFE with parentheses.",
      "Write try { ... } catch(e) { console.error(e); } with braces {}.",
      "Finally blocks run with try/catch/finally; note the semicolons;",
      "Add a trailing slash / at the end of directories/.",
      "Escape backslashes \\\\ when writing Windows paths.",
      "Double check closing tags: </li>, </ul>, and </div>."
    ];
    let SENTENCES = [...DEFAULT_SENTENCES];

    // ===== Keyboard layout and renderers =====
    const KBD_LAYOUT = [
      ['`','1','2','3','4','5','6','7','8','9','0','-','=', 'Backspace'],
      ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
      ['CapsLock','a','s','d','f','g','h','j','k','l',';','\'','Enter'],
      ['Shift','z','x','c','v','b','n','m',',','.','/','Shift'],
      ['Space']
    ];
    function renderKeyboard(container){
      container.innerHTML='';
      KBD_LAYOUT.forEach(row=>{
        const r=document.createElement('div'); r.className='kbd-row';
        row.forEach(k=>{
          const div=document.createElement('div'); div.className='key'; div.dataset.key=k;
          if(['Backspace','Tab','CapsLock','Enter','Shift'].includes(k)) div.classList.add('wide');
          if(k==='Space') div.classList.add('space');
          div.innerHTML = `<span class="cap">${k}</span>`;
          r.appendChild(div);
        });
        container.appendChild(r);
      });
    }
    function setKeyActive(container,key,on){const el=container.querySelector(`.key[data-key="${CSS.escape(key)}"]`); if(el){el.classList.toggle('active',!!on);} }
    function heatKey(container,key){const el=container.querySelector(`.key[data-key="${CSS.escape(key)}"]`); if(el){const c=parseInt(el.getAttribute('data-hit')||'0',10)+1; el.setAttribute('data-hit',String(c)); el.style.setProperty('--heat',Math.min(1,c/12));}}

    // ===== State =====
    const state = { running:false, paused:false, mode:'sentences', sessionId:'', studentName:'', classPeriod:'AM', sentenceIndex:0, currentSentence:'', pos:0, correct:0, errors:0, typed:0, startTime:0, elapsed:0, timer:0, remaining:0, totalSentences:25, chosen:[], perKey:{}, goals:{wpm:null, acc:null} };

    // ===== Views & nav =====
    const views=['view-home','view-student','view-teacher'];
    function goto(id){views.forEach(v=>$('#'+v).classList.toggle('active',v===id));}
    $$('.nav [data-goto], [data-goto]').forEach(b=>b.addEventListener('click',e=>goto(e.currentTarget.dataset.goto)));

    function tickNow(){const d=new Date(); const {date,time}=formatDateTime(d); $('#nowDate').textContent=date; $('#nowTime').textContent=time; $('#nowHash').textContent=uuid().slice(0,8);} setInterval(tickNow,1000); tickNow();

    // Accessibility
    $('#accessBtn').addEventListener('click',()=>alert('Use the Student panel toggles: High‑contrast, Dyslexic font, Larger text.'));
    $('#hcToggle').addEventListener('change',e=>document.body.style.filter=e.target.checked?'contrast(1.15) saturate(1.05)':'');
    $('#dysToggle').addEventListener('change',e=>document.body.style.fontFamily=e.target.checked?'OpenDyslexic, Atkinson Hyperlegible, '+getComputedStyle(document.body).fontFamily:'');
    $('#bigFont').addEventListener('change',e=>document.body.style.fontSize=e.target.checked?'18px':'');

    // Print
    $('#printBtn').addEventListener('click',()=>window.print());

    // Keyboards
    renderKeyboard($('#kbd'));
    renderKeyboard($('#heatmap'));

    // CSV upload (local override)
    $('#csvUpload').addEventListener('change', async (e)=>{ const f=e.target.files?.[0]; if(!f) return; const text=await f.text(); const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean); if(lines.length){SENTENCES=lines; alert(`Loaded ${lines.length} sentences for this session.`);} });

    //edit to fix spacebar issue
     document.querySelector('#typingBox').addEventListener('click', () => {
      document.querySelector('#typingBox').focus();
    });

    // Buttons
    $('#startBtn').addEventListener('click', startSession);
    $('#resetBtn').addEventListener('click', resetSession);
    $('#pauseBtn').addEventListener('click', pauseSession);
    $('#endBtn').addEventListener('click', () => endSession());
    $('#nextBtn').addEventListener('click', nextSentence);

    function startSession(){
      const name=$('#studentName').value.trim(); if(!name){alert('Please enter your name.'); return;}
      state.studentName=name; state.classPeriod=$('#classPeriod').value||'AM'; state.mode=$('#mode').value; state.goals.wpm=parseInt($('#goalWpm').value||''); state.goals.acc=parseInt($('#goalAcc').value||'');
      state.sessionId=uuid(); state.sentenceIndex=0; state.pos=0; state.correct=0; state.errors=0; state.typed=0; state.elapsed=0; state.perKey={};
      if(state.mode==='sentences'){ state.chosen=shuffle([...SENTENCES]).slice(0,25); state.remaining=0; } else { state.chosen=shuffle([...SENTENCES]); const secs=parseInt(state.mode.split('-')[1],10)||180; state.remaining=secs; }
      $('#uiStudent').textContent=state.studentName; $('#uiClass').textContent=state.classPeriod; const {date,time}=formatDateTime(); $('#uiStart').textContent=`${date} ${time}`; $('#uiSession').textContent=state.sessionId.slice(0,8);
      $('#sessionArea').style.display=''; $('#summaryArea').style.display='none';
      state.running=true; state.paused=false; state.startTime=performance.now(); state.timer=setInterval(tick,250); loadSentence(); $('#typingBox').focus();
    }

    function resetSession(){ if(confirm('Reset current session?')){ endSession(true); $('#sessionArea').style.display='none'; $('#summaryArea').style.display='none'; } }
    function pauseSession(){ if(!state.running) return; state.paused=true; $('#focusOverlay').classList.add('show'); }
    $('#resumeBtn').addEventListener('click',()=>{ state.paused=false; $('#focusOverlay').classList.remove('show'); });
    window.addEventListener('blur',()=>{ if(state.running) pauseSession(); });
    function tick(){ if(state.paused||!state.running) return; const now=performance.now(); state.elapsed=(now-state.startTime)/1000; if(state.mode.startsWith('time')){ state.remaining=Math.max(0, parseInt(state.mode.split('-')[1],10)-Math.floor(state.elapsed)); if(state.remaining===0) return endSession(); } renderMetrics(); }

    function loadSentence(){ if(state.mode==='sentences'){ if(state.sentenceIndex>=state.totalSentences) return endSession(); state.currentSentence=state.chosen[state.sentenceIndex % state.chosen.length]; $('#sentenceIdx').textContent=`Sentence ${state.sentenceIndex+1} / ${state.totalSentences}`; } else { state.currentSentence=state.chosen[state.sentenceIndex % state.chosen.length]; $('#sentenceIdx').textContent=`Timed mode • ${state.remaining}s left`; } state.pos=0; renderSentence(); }
    function nextSentence(){ state.sentenceIndex++; loadSentence(); }
    function renderSentence(){ const s=state.currentSentence; const typed=s.slice(0,state.pos); const rest=s.slice(state.pos); const safe=txt=>txt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); $('#sentence').innerHTML = `<span class='typed-correct'>${safe(typed)}</span><span class='caret'></span><span class='target'>${safe(rest)}</span>`; }
    function renderMetrics(){ const minutes=state.elapsed/60; const grossWpm=minutes>0?Math.round((state.correct/5)/minutes):0; const acc=state.typed>0?Math.max(0,Math.round((state.correct/state.typed)*100)):100; $('#mWpm').textContent=grossWpm; $('#mAcc').textContent=acc+'%'; $('#mErr').textContent=state.errors; $('#mTime').textContent=state.mode==='sentences'?Math.floor(state.elapsed)+'s':state.remaining+'s'; }

    // --- Keyboard helpers (paste above your keydown/keyup listeners) ---
function mapKeyLabel(e){
  if (e.key === ' ') return 'Space';
  if (['Backspace','Tab','CapsLock','Enter','Shift'].includes(e.key)) return e.key;
  if (e.key.length === 1) return e.key; // letters, digits, symbols
  return null;
}

function setKeyActive(container, key, on){
  const el = container.querySelector(`.key[data-key="${CSS.escape(key)}"]`);
  if (el) el.classList.toggle('active', !!on);
}

function recordKey(k, err = false){
  state.perKey[k] = state.perKey[k] || { hits: 0, errors: 0 };
  state.perKey[k].hits++;
  if (err) state.perKey[k].errors++;
}

    // Keyboard handling (single listener)
document.addEventListener('keydown', (e) => {
  // prevent Space from clicking focused buttons while typing
  if (state.running && !state.paused && e.key === ' ') e.preventDefault();

  // quick shortcut: Alt+E ends session
  if (e.altKey && (e.key === 'e' || e.key === 'E')) {
    e.preventDefault();
    endSession();
    return;
  }

  if (!state.running || state.paused) return;

  const keyLabel = mapKeyLabel(e);
  if (keyLabel) setKeyActive($('#kbd'), keyLabel, true);

  if (e.key === 'Escape') { pauseSession(); return; }
  if (e.key === 'Tab') { e.preventDefault(); }

  const expected = state.currentSentence[state.pos];

  if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Tab') {
    let hit = e.key;
    if (e.key === 'Enter') hit = '\n';
    if (e.key === 'Tab')   hit = '\t';

    if (e.key === 'Backspace') {
      if (state.pos > 0) {
        state.pos--;
        state.typed++;
        renderSentence();
      }
      return;
    }

    const expectedChar = expected;
    if (hit === expectedChar) {
      state.correct++; state.pos++; state.typed++; recordKey(hit);
    } else {
      state.errors++; state.typed++; recordKey(hit, true);
    }

    if (state.pos >= state.currentSentence.length) {
      state.sentenceIndex++; loadSentence();
    } else {
      renderSentence();
    }
    renderMetrics();
  }
});

document.addEventListener('keyup', (e) => {
  const keyLabel = mapKeyLabel(e);
  if (keyLabel) setKeyActive($('#kbd'), keyLabel, false);
});

    function endSession(silent){
  // Allow ending even if timer already stopped, as long as user typed something
  if (!state.running && state.correct === 0 && state.typed === 0) {
    alert('No active session to end.');
    return;
  }

  clearInterval(state.timer);
  state.running = false;
  state.paused = false;
  $('#focusOverlay').classList.remove('show');

  // Final stats (gross WPM + accuracy)
  const minutes = state.elapsed / 60;
  const wpm = minutes > 0 ? Math.round((state.correct / 5) / minutes) : 0;
  const acc = state.typed > 0 ? Math.max(0, Math.round((state.correct / state.typed) * 100)) : 100;

  // Stamp summary UI
  const { date, time } = formatDateTime();
  $('#sWpm').textContent = wpm;
  $('#sAcc').textContent = acc + '%';
  $('#sErr').textContent = state.errors;
  $('#sDur').textContent = Math.floor(state.elapsed) + 's';
  $('#sName').textContent = state.studentName;
  $('#sClass').textContent = state.classPeriod;
  $('#sDate').textContent = date;
  $('#sTime').textContent = time;
  $('#sSid').textContent = state.sessionId.slice(0, 8);

  // Heatmap render
  const hm = $('#heatmap');
  hm.querySelectorAll('.key').forEach(k => {
    k.removeAttribute('data-hit');
    k.style.removeProperty('--heat');
  });
  Object.entries(state.perKey).forEach(([k /*, v*/]) => {
    heatKey(hm, k);
  });

  // Show summary
  $('#summaryArea').style.display = '';
  if (!silent) goto('view-student');
}

    $('#restartBtn').addEventListener('click', ()=>{ $('#summaryArea').style.display='none'; $('#sessionArea').style.display='none'; goto('view-student'); });

    $('#postResultsBtn').addEventListener('click', async () => {
  const minutes = state.elapsed / 60;
  const wpm = minutes > 0 ? Math.round((state.correct / 5) / minutes) : 0;
  const acc = state.typed > 0 ? Math.max(0, Math.round((state.correct / state.typed) * 100)) : 100;

  // Build form data (simple request → no CORS preflight)
  const form = new URLSearchParams();
  form.append('token', CONFIG.SHARED_TOKEN);
  form.append('name', state.studentName);
  form.append('classPeriod', state.classPeriod);
  form.append('wpm', String(wpm));
  form.append('accuracy', String(acc));
  form.append('errors', String(state.errors));
  form.append('duration', String(Math.floor(state.elapsed)));
  form.append('sentences', String(state.mode === 'sentences'
    ? Math.min(state.sentenceIndex, state.totalSentences)
    : state.sentenceIndex));
  form.append('mode', state.mode);
  form.append('sessionId', state.sessionId);
  form.append('userAgent', navigator.userAgent);

  try {
    const res = await fetch(CONFIG.WRITE_URL + '?mode=write', {
      method: 'POST',
      body: form // no headers on purpose
    });

    const text = await res.text(); // raw text to surface server messages
    if (!res.ok) {
      console.error('Submit error', res.status, text);
      alert('Submit failed: ' + text);
      return;
    }

    let j; try { j = JSON.parse(text); } catch { j = {}; }
    alert('Submitted! Row: ' + (j.row || '?'));
  } catch (err) {
    console.error(err);
    alert('Network or script error submitting results.');
  }
});

    // ===== Teacher dashboard =====
$('#refreshBtn').addEventListener('click', loadResults);
$('#exportAllBtn').addEventListener('click', () => exportRows(window.__rows || [], 'all_results.csv'));
$('#exportFilteredBtn').addEventListener('click', () => exportRows(getFiltered(), 'filtered_results.csv'));

async function loadResults(){
  try{
    const res = await fetch(CONFIG.READ_URL, { method:'GET', credentials:'include' });
    if(!res.ok) throw new Error('Auth or network error');
    const data = await res.json();
    window.__rows = data.rows || [];
    renderTable(window.__rows);
  }catch(err){
    alert('Failed to load results. Are you signed into your Google account with access?');
    console.error(err);
  }
}

function renderTable(rows){
  const tbody = document.querySelector('#table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td>${escapeHtml(r.name)}</td>` +
      `<td>${escapeHtml(r.classPeriod)}</td>` +
      `<td>${escapeHtml(r.date)}</td>` +
      `<td>${escapeHtml(r.time)}</td>` +
      `<td>${r.wpm}</td>` +
      `<td>${r.accuracy}</td>` +
      `<td>${r.errors}</td>` +
      `<td>${r.duration}</td>` +
      `<td>${r.sentences}</td>` +
      `<td>${escapeHtml(r.mode)}</td>` +
      `<td>${escapeHtml(r.sessionId)}</td>`;
    tbody.appendChild(tr);
  });
  const rowCountEl = document.querySelector('#rowCount');
  if (rowCountEl) rowCountEl.textContent = rows.length;
}

function getFiltered(){
  const name = (document.querySelector('#filterName')?.value || '').trim().toLowerCase();
  const cls  = (document.querySelector('#filterClass')?.value || '');
  const from = (document.querySelector('#filterFrom')?.value || '');
  const to   = (document.querySelector('#filterTo')?.value || '');
  const minW = parseInt((document.querySelector('#filterWpm')?.value || '0'), 10);
  const minA = parseInt((document.querySelector('#filterAcc')?.value || '0'), 10);

  return (window.__rows || []).filter(r => {
    if (name && !r.name.toLowerCase().includes(name)) return false;
    if (cls && r.classPeriod !== cls) return false;
    if (from && r.dateISO < from) return false;
    if (to && r.dateISO > to) return false;
    if (r.wpm < minW) return false;
    if (r.accuracy < minA) return false;
    return true;
  });
}

function exportRows(rows, filename){
  if (!rows.length) { alert('No rows to export.'); return; }
  const out = rows.map(r => ({
    name: r.name,
    date: r.date,
    time: r.time,
    wpm: r.wpm,
    accuracy: r.accuracy,
    errors: r.errors,
    classPeriod: r.classPeriod,
    duration_seconds: r.duration,
    sentences_completed: r.sentences,
    mode: r.mode,
    session_id: r.sessionId
  }));
  downloadCSV(filename, out);
}

function escapeHtml(s){
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// Load results when navigating to Teacher view
(function(){
  const btn = document.querySelector('[data-goto="view-teacher"]');
  if (btn) btn.addEventListener('click', loadResults);
})();

  }); // DOMContentLoaded

})(); // IIFE

