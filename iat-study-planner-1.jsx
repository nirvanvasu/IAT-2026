import { useState, useEffect, useRef } from "react";

const SUBJECTS = {
  Maths: {
    color: "#f59e0b", icon: "∑", priority: "HIGH",
    class11: ["Sets & Relations","Trigonometry","Complex Numbers","Sequence & Series","Straight Lines","Conic Sections","Limits & Derivatives","Statistics & Probability"],
    class12: ["Relations & Functions","Matrices & Determinants","Continuity & Differentiability","Application of Derivatives","Integrals","Differential Equations","Vector Algebra","3D Geometry","Probability"]
  },
  Physics: {
    color: "#3b82f6", icon: "⚛", priority: "MEDIUM",
    class11: ["Physical World & Units","Motion in a Straight Line","Motion in a Plane","Laws of Motion","Work Energy Power","Gravitation","Thermodynamics","Waves"],
    class12: ["Electric Charges & Fields","Current Electricity","Magnetic Effects","Electromagnetic Induction","Optics","Dual Nature of Matter","Atoms & Nuclei","Semiconductors"]
  },
  Chemistry: {
    color: "#10b981", icon: "⚗", priority: "MEDIUM",
    class11: ["Some Basic Concepts","Structure of Atom","Periodic Table","Chemical Bonding","States of Matter","Thermodynamics","Equilibrium","Organic Chemistry Basics"],
    class12: ["Solid State","Solutions","Electrochemistry","Chemical Kinetics","Coordination Compounds","Aldehydes & Ketones","Amines","Polymers & Biomolecules"]
  },
  Biology: {
    color: "#ec4899", icon: "🧬", priority: "HIGH",
    class11: ["Cell Structure","Cell Division","Biomolecules","Photosynthesis","Respiration","Plant Growth","Digestion","Breathing & Exchange"],
    class12: ["Sexual Reproduction","Genetics & Mendel","Molecular Basis of Inheritance","Evolution","Human Health & Disease","Biotechnology","Ecosystem","Biodiversity"]
  }
};

const WEEK_PLAN = [
  { week: 1, focus: "Class 11 Foundations", detail: "Cover all Class 11 basics, focus on Maths & Biology" },
  { week: 2, focus: "Class 12 Core Concepts", detail: "Tackle Class 12 topics, prioritise weak areas" },
  { week: 3, focus: "Deep Practice + MCQ Drill", detail: "Topic-wise quizzes daily, simulate IAT MCQ format" },
  { week: 4, focus: "Full Mock Tests + Revision", detail: "3 full mocks, review mistakes, final revision" }
];

const MCQ_PROMPT = (topic, subject) =>
`You are an expert IAT (IISER Aptitude Test) question setter. Generate ONE high-quality IAT-style MCQ on "${topic}" from ${subject} (NCERT Class 11/12).

IAT questions test CONCEPTUAL UNDERSTANDING and APPLICATION, not rote memorization. The question should require thinking, not just recall.

Return ONLY valid JSON (no markdown, no backticks):
{
  "question": "Full question text. May include a scenario, data, or application.",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct": 0,
  "explanation": "Clear 2-3 sentence explanation of why the answer is correct and why the others are wrong.",
  "difficulty": "Easy|Medium|Hard",
  "concept": "The core concept being tested"
}

Rules:
- correct is the 0-based index (0=A,1=B,2=C,3=D)
- All 4 options must be plausible — no obviously wrong choices
- Lean Medium or Hard difficulty for real IAT level
- The question must be self-contained and unambiguous
- For Maths: include a calculation or reasoning step
- For Biology: test application of concepts, not just definitions
- For Physics: may include a scenario with units/values
- For Chemistry: may test reaction outcomes or periodic trends`;

export default function IATStudyPlanner() {
  const [tab, setTab] = useState("dashboard");
  const [completedTopics, setCompletedTopics] = useState({});
  const [studyLog, setStudyLog] = useState([]);
  const [selSub, setSelSub] = useState("Maths");
  const [todayHours, setTodayHours] = useState(0);
  const [myNotes, setMyNotes] = useState({});
  const [activeNote, setActiveNote] = useState("");
  const [aiNotes, setAiNotes] = useState({});
  const [aiNoteContent, setAiNoteContent] = useState(null);
  const [aiNoteTopic, setAiNoteTopic] = useState(null);
  const [loadingNote, setLoadingNote] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Quiz state
  const [quizMode, setQuizMode] = useState("select");
  const [quizSub, setQuizSub] = useState("Maths");
  const [currentQ, setCurrentQ] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [quizStats, setQuizStats] = useState({ correct: 0, wrong: 0, score: 0 });

  // Mock test state
  const [mockQuestions, setMockQuestions] = useState([]);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockDone, setMockDone] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const [mockTime, setMockTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (loaded) saveData(); }, [completedTopics, studyLog, todayHours, myNotes, aiNotes, quizStats]);
  useEffect(() => () => clearInterval(timerRef.current), []);

  async function loadData() {
    try {
      const keys = ["iat_completed","iat_log","iat_hours","iat_mynotes","iat_ainotes","iat_stats"];
      const results = await Promise.all(keys.map(k => window.storage.get(k).catch(() => null)));
      if (results[0]) setCompletedTopics(JSON.parse(results[0].value));
      if (results[1]) setStudyLog(JSON.parse(results[1].value));
      if (results[2]) setTodayHours(JSON.parse(results[2].value));
      if (results[3]) setMyNotes(JSON.parse(results[3].value));
      if (results[4]) setAiNotes(JSON.parse(results[4].value));
      if (results[5]) setQuizStats(JSON.parse(results[5].value));
    } catch(e) {}
    setLoaded(true);
  }

  async function saveData() {
    try {
      await window.storage.set("iat_completed", JSON.stringify(completedTopics));
      await window.storage.set("iat_log", JSON.stringify(studyLog));
      await window.storage.set("iat_hours", JSON.stringify(todayHours));
      await window.storage.set("iat_mynotes", JSON.stringify(myNotes));
      await window.storage.set("iat_ainotes", JSON.stringify(aiNotes));
      await window.storage.set("iat_stats", JSON.stringify(quizStats));
    } catch(e) {}
  }

  function toggleTopic(sub, cls, topic) {
    const key = `${sub}_${cls}_${topic}`;
    const wasDone = completedTopics[key];
    setCompletedTopics(p => ({ ...p, [key]: !p[key] }));
    if (!wasDone) setStudyLog(p => [{ time: new Date().toLocaleString(), text: `✅ ${topic} (${sub} · ${cls})` }, ...p.slice(0,19)]);
  }

  function getProgress(sub) {
    const s = SUBJECTS[sub];
    const total = s.class11.length + s.class12.length;
    const done = [...s.class11.map(t=>`${sub}_Class 11_${t}`),...s.class12.map(t=>`${sub}_Class 12_${t}`)].filter(k=>completedTopics[k]).length;
    return { done, total, pct: Math.round((done/total)*100) };
  }

  function getTotalPct() {
    let d=0,t=0;
    Object.keys(SUBJECTS).forEach(s=>{ const p=getProgress(s); d+=p.done; t+=p.total; });
    return Math.round((d/t)*100);
  }

  async function callClaude(prompt, maxTokens=1000) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] })
    });
    const data = await res.json();
    return data.content.map(i=>i.text||"").join("").replace(/```json|```/g,"").trim();
  }

  async function generateMCQ(subject, topic) {
    setLoadingQ(true); setCurrentQ(null); setSelectedOpt(null); setRevealed(false);
    try {
      const txt = await callClaude(MCQ_PROMPT(topic, subject));
      setCurrentQ({ ...JSON.parse(txt), subject, topic });
    } catch(e) {
      setCurrentQ({ question:`What is the fundamental concept underlying ${topic}?`, options:["A) Concept A","B) Concept B","C) Concept C","D) Concept D"], correct:0, explanation:"Could not generate. Please retry.", difficulty:"Medium", concept:topic, subject, topic });
    }
    setLoadingQ(false);
  }

  function handleOptionSelect(idx) {
    if (revealed) return;
    setSelectedOpt(idx);
    setRevealed(true);
    const isCorrect = idx === currentQ.correct;
    setQuizStats(p => ({ correct: p.correct+(isCorrect?1:0), wrong: p.wrong+(isCorrect?0:1), score: p.score+(isCorrect?4:-1) }));
    setStudyLog(p => [{ time: new Date().toLocaleString(), text: `${isCorrect?"✅ +4":"❌ −1"} MCQ: ${currentQ.topic} (${currentQ.subject})` }, ...p.slice(0,19)]);
  }

  async function startMockTest() {
    setMockLoading(true); setMockQuestions([]); setMockAnswers({}); setMockIndex(0); setMockDone(false); setMockTime(0);
    clearInterval(timerRef.current);

    const topics = [];
    Object.keys(SUBJECTS).forEach(sub => {
      const all = [...SUBJECTS[sub].class11, ...SUBJECTS[sub].class12];
      const shuffled = all.sort(()=>Math.random()-0.5);
      shuffled.slice(0, 4).forEach(t => topics.push({ subject: sub, topic: t }));
    });
    const selected = topics.sort(()=>Math.random()-0.5).slice(0,15);

    const questions = [];
    for(const {subject, topic} of selected) {
      try {
        const txt = await callClaude(MCQ_PROMPT(topic, subject), 800);
        questions.push({ ...JSON.parse(txt), subject, topic });
      } catch(e) {
        questions.push({ question:`[${subject}] Core concept of ${topic}?`, options:["A) Option A","B) Option B","C) Option C","D) Option D"], correct:0, explanation:"Retry for explanation.", difficulty:"Medium", concept:topic, subject, topic });
      }
    }

    setMockQuestions(questions);
    setMockLoading(false);
    timerRef.current = setInterval(() => setMockTime(t => t+1), 1000);
  }

  function handleMockAnswer(idx) {
    if (mockAnswers[mockIndex] !== undefined) return;
    setMockAnswers(p => ({ ...p, [mockIndex]: idx }));
  }

  function finishMock() {
    clearInterval(timerRef.current);
    setMockDone(true);
    const { score, correct, wrong } = getMockScore();
    setQuizStats(p => ({ correct: p.correct+correct, wrong: p.wrong+wrong, score: p.score+score }));
  }

  function getMockScore() {
    let score=0,correct=0,wrong=0;
    mockQuestions.forEach((q,i) => {
      const ans=mockAnswers[i];
      if (ans===undefined) return;
      if (ans===q.correct) { score+=4; correct++; } else { score-=1; wrong++; }
    });
    return { score, correct, wrong, attempted: Object.keys(mockAnswers).length };
  }

  function fmtTime(s) { return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }

  async function generateAiNotes(subject, topic) {
    const key = `${subject}_${topic}`;
    setAiNoteTopic({ subject, topic }); setAiNoteContent(null);
    if (aiNotes[key]) { setAiNoteContent(aiNotes[key]); return; }
    setLoadingNote(true);
    try {
      const txt = await callClaude(
        `Create IAT-exam-focused NCERT study notes for "${topic}" in ${subject} (Class 11/12).
Return ONLY valid JSON (no markdown):
{"summary":"2-3 sentence overview","key_concepts":["concept 1","concept 2","concept 3","concept 4","concept 5"],"important_formulas":["formula/fact 1","formula/fact 2","formula/fact 3"],"remember":["memory tip 1","tip 2"],"common_mistakes":["mistake 1","mistake 2"],"exam_tips":"what IAT specifically tests in this topic"}`
      );
      const parsed = JSON.parse(txt);
      setAiNoteContent(parsed);
      setAiNotes(p => ({ ...p, [key]: parsed }));
    } catch(e) {
      setAiNoteContent({ summary:"Could not load. Try again.", key_concepts:[], important_formulas:[], remember:[], common_mistakes:[], exam_tips:"" });
    }
    setLoadingNote(false);
  }

  const totalPct = getTotalPct();
  const accuracy = quizStats.correct+quizStats.wrong > 0 ? Math.round((quizStats.correct/(quizStats.correct+quizStats.wrong))*100) : 0;

  const SubjectTabs = ({ value, onChange }) => (
    <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>
      {Object.keys(SUBJECTS).map(s=>(
        <button key={s} onClick={()=>onChange(s)} style={{ padding:"5px 12px",borderRadius:20,border:`2px solid ${value===s?SUBJECTS[s].color:"#1e293b"}`,background:value===s?SUBJECTS[s].color+"20":"#0f172a",color:value===s?SUBJECTS[s].color:"#64748b",cursor:"pointer",fontSize:12,fontWeight:700 }}>{SUBJECTS[s].icon} {s}</button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#e2e8f0", fontFamily:"system-ui,sans-serif" }}>
      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", padding:"18px 16px 0", borderBottom:"1px solid #1e293b" }}>
        <div style={{ maxWidth:620, margin:"0 auto" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:10,letterSpacing:3,color:"#818cf8",textTransform:"uppercase" }}>IISER Aptitude Test</div>
              <div style={{ fontSize:19,fontWeight:800,color:"#fff",marginTop:2 }}>IAT 2026 Study Hub</div>
              <div style={{ fontSize:11,color:"#475569",marginTop:2 }}>60 MCQs · +4/−1 · 3 Hours · June 7, 2026</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:26,fontWeight:900,color:"#818cf8" }}>{totalPct}%</div>
              <div style={{ fontSize:10,color:"#475569" }}>syllabus done</div>
            </div>
          </div>
          <div style={{ height:4,background:"#1e293b",borderRadius:2,margin:"12px 0 0",overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${totalPct}%`,background:"linear-gradient(90deg,#6366f1,#a78bfa)",borderRadius:2,transition:"width 0.5s" }} />
          </div>
          <div style={{ display:"flex",gap:2,marginTop:10,overflowX:"auto",paddingBottom:0 }}>
            {[["dashboard","📊 Dash"],["topics","📚 Topics"],["ainotes","🤖 Notes"],["quiz","🧠 Quiz"],["mock","🎯 Mock"],["myNotes","✏️ Mine"],["log","📋 Log"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{ padding:"7px 10px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap",background:tab===id?"#080810":"transparent",color:tab===id?"#a78bfa":"#64748b",borderBottom:tab===id?"2px solid #818cf8":"2px solid transparent" }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:620, margin:"0 auto", padding:"16px" }}>

        {/* DASHBOARD */}
        {tab==="dashboard" && (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14 }}>
              {[["🎯","IAT Score",quizStats.score,"#818cf8"],["✅","Accuracy",`${accuracy}%`,"#10b981"],["📝","Questions",quizStats.correct+quizStats.wrong,"#f59e0b"]].map(([icon,label,val,color])=>(
                <div key={label} style={{ background:"#0f172a",borderRadius:10,padding:"11px 8px",border:"1px solid #1e293b",textAlign:"center" }}>
                  <div style={{ fontSize:16 }}>{icon}</div>
                  <div style={{ fontSize:18,fontWeight:900,color }}>{val}</div>
                  <div style={{ fontSize:10,color:"#475569" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#0f172a",borderRadius:12,padding:14,marginBottom:12,border:"1px solid #1e293b" }}>
              <div style={{ fontSize:11,color:"#64748b",marginBottom:8 }}>Today's Hours (Goal: 5–6 hrs)</div>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <button onClick={()=>setTodayHours(h=>Math.max(0,+(h-0.5).toFixed(1)))} style={{ width:30,height:30,borderRadius:"50%",border:"1px solid #334155",background:"#1e293b",color:"#fff",fontSize:16,cursor:"pointer" }}>−</button>
                <div style={{ flex:1,textAlign:"center" }}><span style={{ fontSize:28,fontWeight:900,color:"#818cf8" }}>{todayHours}</span><span style={{ color:"#475569" }}> hrs</span></div>
                <button onClick={()=>setTodayHours(h=>+(h+0.5).toFixed(1))} style={{ width:30,height:30,borderRadius:"50%",border:"1px solid #334155",background:"#1e293b",color:"#fff",fontSize:16,cursor:"pointer" }}>+</button>
              </div>
              <div style={{ marginTop:8,height:5,background:"#1e293b",borderRadius:3 }}>
                <div style={{ height:"100%",width:`${Math.min(100,(todayHours/6)*100)}%`,background:todayHours>=5?"#10b981":"#f59e0b",borderRadius:3,transition:"width 0.3s" }} />
              </div>
              {todayHours>=5&&<div style={{ textAlign:"center",color:"#10b981",fontSize:11,marginTop:4 }}>🎉 Goal reached!</div>}
            </div>
            {Object.entries(SUBJECTS).map(([name,s])=>{
              const p=getProgress(name);
              return (
                <div key={name} onClick={()=>{setSelSub(name);setTab("topics");}} style={{ background:"#0f172a",borderRadius:12,padding:13,marginBottom:8,border:"1px solid #1e293b",cursor:"pointer" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:32,height:32,borderRadius:8,background:s.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>{s.icon}</div>
                      <div><div style={{ fontWeight:700,fontSize:14 }}>{name}</div><div style={{ fontSize:10,color:"#475569" }}>{p.done}/{p.total} · {s.priority} PRIORITY</div></div>
                    </div>
                    <div style={{ fontSize:22,fontWeight:900,color:s.color }}>{p.pct}%</div>
                  </div>
                  <div style={{ marginTop:8,height:3,background:"#1e293b",borderRadius:2 }}>
                    <div style={{ height:"100%",width:`${p.pct}%`,background:s.color,borderRadius:2 }} />
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize:10,color:"#475569",letterSpacing:2,textTransform:"uppercase",margin:"16px 0 8px" }}>4-Week Strategy</div>
            {WEEK_PLAN.map((w,i)=>(
              <div key={i} style={{ display:"flex",gap:12,background:"#0f172a",borderRadius:10,padding:12,marginBottom:7,border:"1px solid #1e293b" }}>
                <div style={{ minWidth:34,textAlign:"center" }}>
                  <div style={{ fontSize:9,color:"#475569" }}>WK</div>
                  <div style={{ fontSize:22,fontWeight:900,color:"#818cf8" }}>{w.week}</div>
                </div>
                <div><div style={{ fontWeight:700,fontSize:13 }}>{w.focus}</div><div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{w.detail}</div></div>
              </div>
            ))}
            <div style={{ background:"#0f172a",borderRadius:12,padding:14,border:"1px solid #312e81",marginTop:8 }}>
              <div style={{ fontSize:10,color:"#818cf8",fontWeight:700,letterSpacing:1,marginBottom:8 }}>📋 IAT 2026 QUICK FACTS</div>
              {[["Date","June 7, 2026"],["Mode","Computer-Based Test (CBT)"],["Questions","60 MCQs (15 per subject)"],["Marking","+4 correct · −1 wrong · 0 skipped"],["Duration","3 Hours (180 minutes)"],["Syllabus","NCERT Class 11 & 12"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1e293b",fontSize:12 }}>
                  <span style={{ color:"#64748b" }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOPICS */}
        {tab==="topics" && (
          <div>
            <SubjectTabs value={selSub} onChange={setSelSub} />
            {["Class 11","Class 12"].map(cls=>(
              <div key={cls} style={{ marginBottom:16 }}>
                <div style={{ fontSize:10,color:"#475569",letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>{cls}</div>
                {SUBJECTS[selSub][cls==="Class 11"?"class11":"class12"].map(topic=>{
                  const key=`${selSub}_${cls}_${topic}`, done=completedTopics[key];
                  return (
                    <div key={topic} style={{ display:"flex",alignItems:"center",gap:8,background:"#0f172a",borderRadius:10,padding:"9px 12px",marginBottom:5,border:`1px solid ${done?SUBJECTS[selSub].color+"50":"#1e293b"}` }}>
                      <div onClick={()=>toggleTopic(selSub,cls,topic)} style={{ width:18,height:18,borderRadius:5,border:`2px solid ${done?SUBJECTS[selSub].color:"#334155"}`,background:done?SUBJECTS[selSub].color:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000" }}>{done?"✓":""}</div>
                      <span style={{ flex:1,fontSize:13,color:done?"#475569":"#e2e8f0",textDecoration:done?"line-through":"none" }}>{topic}</span>
                      <button onClick={()=>{generateAiNotes(selSub,topic);setTab("ainotes");}} style={{ fontSize:10,padding:"2px 7px",borderRadius:5,border:"none",background:"#1e1b4b",color:"#a78bfa",cursor:"pointer" }}>Notes</button>
                      <button onClick={()=>{setQuizSub(selSub);setQuizMode("topic");generateMCQ(selSub,topic);setTab("quiz");}} style={{ fontSize:10,padding:"2px 7px",borderRadius:5,border:"none",background:"#1e293b",color:"#60a5fa",cursor:"pointer" }}>Quiz</button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* AI NOTES */}
        {tab==="ainotes" && (
          <div>
            <SubjectTabs value={selSub} onChange={setSelSub} />
            {!aiNoteTopic ? (
              <div>
                <div style={{ fontSize:12,color:"#64748b",marginBottom:10 }}>Select a topic for AI-generated IAT study notes:</div>
                {["Class 11","Class 12"].map(cls=>(
                  <div key={cls} style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10,color:"#475569",letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>{cls}</div>
                    {SUBJECTS[selSub][cls==="Class 11"?"class11":"class12"].map(topic=>{
                      const cached=aiNotes[`${selSub}_${topic}`];
                      return (
                        <button key={topic} onClick={()=>generateAiNotes(selSub,topic)} style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #1e293b",background:"#0f172a",color:"#e2e8f0",cursor:"pointer",textAlign:"left",fontSize:13,marginBottom:5,display:"flex",justifyContent:"space-between" }}>
                          <span>{topic}</span><span style={{ fontSize:10,color:cached?"#10b981":"#a78bfa" }}>{cached?"✓ Cached":"Generate →"}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
                  <button onClick={()=>{setAiNoteTopic(null);setAiNoteContent(null);}} style={{ padding:"4px 10px",borderRadius:7,border:"1px solid #334155",background:"#0f172a",color:"#94a3b8",cursor:"pointer",fontSize:11 }}>← Back</button>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10,color:SUBJECTS[aiNoteTopic.subject]?.color,fontWeight:700 }}>{aiNoteTopic.subject}</div>
                    <div style={{ fontSize:15,fontWeight:800 }}>{aiNoteTopic.topic}</div>
                  </div>
                  <button onClick={()=>{setAiNoteContent(null);const k=`${aiNoteTopic.subject}_${aiNoteTopic.topic}`;setAiNotes(p=>{const n={...p};delete n[k];return n;});generateAiNotes(aiNoteTopic.subject,aiNoteTopic.topic);}} style={{ fontSize:11,padding:"4px 10px",borderRadius:7,border:"1px solid #334155",background:"#0f172a",color:"#60a5fa",cursor:"pointer" }}>↻ Refresh</button>
                </div>
                {loadingNote ? (
                  <div style={{ textAlign:"center",padding:50,color:"#475569" }}>🤖 Generating IAT notes...</div>
                ) : aiNoteContent && (
                  <div>
                    {[
                      ["📌 OVERVIEW","#818cf8",<p key="s" style={{fontSize:13,lineHeight:1.7,margin:0}}>{aiNoteContent.summary}</p>],
                      ["🔑 KEY CONCEPTS","#60a5fa",(aiNoteContent.key_concepts||[]).map((c,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:"#3b82f6",fontWeight:700,minWidth:16,fontSize:13}}>{i+1}.</span><span style={{fontSize:13,lineHeight:1.5}}>{c}</span></div>)],
                      ["⚡ FORMULAS & FACTS","#f59e0b",(aiNoteContent.important_formulas||[]).map((f,i)=><div key={i} style={{background:"#0a0f1e",borderRadius:7,padding:"7px 11px",marginBottom:5,fontSize:13,fontFamily:"monospace",color:"#fbbf24"}}>{f}</div>)],
                      ["🧠 MEMORY TRICKS","#10b981",(aiNoteContent.remember||[]).map((r,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span>💡</span><span style={{fontSize:13,lineHeight:1.5}}>{r}</span></div>)],
                      ["⚠️ COMMON MISTAKES","#ef4444",(aiNoteContent.common_mistakes||[]).map((m,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:"#ef4444"}}>✗</span><span style={{fontSize:13,lineHeight:1.5}}>{m}</span></div>)],
                      ["🎯 IAT EXAM TIP","#a78bfa",<p key="et" style={{fontSize:13,lineHeight:1.7,margin:0}}>{aiNoteContent.exam_tips}</p>]
                    ].filter(([,,c])=>c&&(Array.isArray(c)?c.length>0:true)).map(([title,color,content])=>(
                      <div key={title} style={{ background:"#0f172a",borderRadius:12,padding:14,marginBottom:10,border:`1px solid ${color}30` }}>
                        <div style={{ fontSize:10,color,fontWeight:700,letterSpacing:1,marginBottom:8 }}>{title}</div>
                        {content}
                      </div>
                    ))}
                    <button onClick={()=>{setQuizMode("topic");generateMCQ(aiNoteTopic.subject,aiNoteTopic.topic);setTab("quiz");}} style={{ width:"100%",padding:11,borderRadius:10,border:"none",background:"#4f46e5",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13,marginTop:4 }}>🧠 Quiz me on this</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* QUIZ */}
        {tab==="quiz" && (
          <div>
            {quizMode==="select" && (
              <div>
                <div style={{ fontSize:12,color:"#64748b",marginBottom:12 }}>Pick a subject and topic for IAT-style MCQ practice (+4/−1):</div>
                <SubjectTabs value={quizSub} onChange={setQuizSub} />
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  {[...SUBJECTS[quizSub].class11,...SUBJECTS[quizSub].class12].map(topic=>(
                    <button key={topic} onClick={()=>{setQuizMode("topic");generateMCQ(quizSub,topic);}} style={{ padding:"11px 14px",borderRadius:10,border:"1px solid #1e293b",background:"#0f172a",color:"#e2e8f0",cursor:"pointer",textAlign:"left",fontSize:13,display:"flex",justifyContent:"space-between" }}>
                      {topic}<span style={{ color:SUBJECTS[quizSub].color }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizMode==="topic" && (
              <div>
                <div style={{ display:"flex",gap:8,marginBottom:14 }}>
                  <button onClick={()=>setQuizMode("select")} style={{ padding:"4px 10px",borderRadius:7,border:"1px solid #334155",background:"#0f172a",color:"#94a3b8",cursor:"pointer",fontSize:11 }}>← Topics</button>
                  <div style={{ display:"flex",gap:6,flex:1,justifyContent:"flex-end" }}>
                    {[["Score",quizStats.score,"#818cf8"],["✅",quizStats.correct,"#10b981"],["❌",quizStats.wrong,"#ef4444"]].map(([l,v,c])=>(
                      <div key={l} style={{ background:"#0f172a",borderRadius:8,padding:"5px 10px",border:"1px solid #1e293b",textAlign:"center",minWidth:44 }}>
                        <div style={{ fontSize:14,fontWeight:900,color:c }}>{v}</div>
                        <div style={{ fontSize:9,color:"#475569" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {loadingQ && <div style={{ textAlign:"center",padding:50,color:"#475569" }}>🤖 Generating IAT-style MCQ...</div>}

                {!loadingQ && currentQ && (
                  <div>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                      <span style={{ fontSize:11,color:SUBJECTS[currentQ.subject]?.color,fontWeight:700 }}>{currentQ.subject} · {currentQ.topic}</span>
                      <span style={{ fontSize:10,padding:"2px 8px",borderRadius:10,background:"#1e293b",color:currentQ.difficulty==="Hard"?"#ef4444":currentQ.difficulty==="Medium"?"#f59e0b":"#10b981" }}>{currentQ.difficulty}</span>
                    </div>
                    <div style={{ background:"#0f172a",borderRadius:12,padding:14,marginBottom:12,border:"1px solid #1e293b" }}>
                      <div style={{ fontSize:14,lineHeight:1.7 }}>{currentQ.question}</div>
                      {currentQ.concept&&<div style={{ fontSize:11,color:"#475569",marginTop:6,fontStyle:"italic" }}>Concept: {currentQ.concept}</div>}
                    </div>

                    {currentQ.options.map((opt,i)=>{
                      const isCorrect=i===currentQ.correct, isSelected=i===selectedOpt;
                      let bg="#0f172a",bdr="#1e293b",col="#e2e8f0";
                      if(revealed){ if(isCorrect){bg="#064e3b";bdr="#10b981";col="#6ee7b7";} else if(isSelected){bg="#450a0a";bdr="#ef4444";col="#fca5a5";} }
                      return (
                        <div key={i} onClick={()=>handleOptionSelect(i)} style={{ background:bg,border:`1px solid ${bdr}`,borderRadius:10,padding:"11px 14px",marginBottom:7,cursor:revealed?"default":"pointer",color:col,fontSize:13,lineHeight:1.5,transition:"all 0.2s" }}>
                          {opt}
                          {revealed&&isCorrect&&<span style={{ float:"right",color:"#10b981",fontWeight:700 }}>✓ +4</span>}
                          {revealed&&isSelected&&!isCorrect&&<span style={{ float:"right",color:"#ef4444",fontWeight:700 }}>✗ −1</span>}
                        </div>
                      );
                    })}

                    {revealed&&(
                      <div>
                        <div style={{ background:"#0a0a1a",borderRadius:10,padding:12,marginBottom:10,border:"1px solid #334155" }}>
                          <div style={{ fontSize:10,color:"#818cf8",fontWeight:700,marginBottom:4 }}>💡 EXPLANATION</div>
                          <div style={{ fontSize:13,lineHeight:1.6 }}>{currentQ.explanation}</div>
                        </div>
                        <button onClick={()=>generateMCQ(currentQ.subject,currentQ.topic)} style={{ width:"100%",padding:11,borderRadius:10,border:"none",background:"#4f46e5",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13 }}>Next Question →</button>
                      </div>
                    )}
                    {!revealed&&<div style={{ textAlign:"center",fontSize:11,color:"#475569",marginTop:8 }}>Tap an option · +4 correct · −1 wrong · IAT format</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MOCK TEST */}
        {tab==="mock" && (
          <div>
            {!mockLoading && mockQuestions.length===0 && (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:36,marginBottom:10 }}>🎯</div>
                <div style={{ fontSize:18,fontWeight:800,marginBottom:6 }}>Full IAT Mock Test</div>
                <div style={{ fontSize:13,color:"#64748b",marginBottom:18,lineHeight:1.8 }}>
                  15 IAT-style MCQs across all 4 subjects<br/>
                  Same format as the real exam<br/>
                  +4 correct · −1 wrong · 0 skipped
                </div>
                <div style={{ background:"#0f172a",borderRadius:12,padding:14,marginBottom:18,border:"1px solid #312e81",textAlign:"left" }}>
                  {[["Questions","15 mixed (Physics, Chem, Maths, Bio)"],["Format","4-option MCQ, single correct"],["Scoring","+4 / −1 / 0"],["Strategy","Skip if unsure — avoid −1"],["Time","Track yourself (timer shown)"]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1e293b",fontSize:12 }}>
                      <span style={{ color:"#64748b" }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={startMockTest} style={{ width:"100%",padding:14,borderRadius:12,border:"none",background:"linear-gradient(135deg,#6366f1,#a78bfa)",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer" }}>
                  Start Mock Test →
                </button>
              </div>
            )}

            {mockLoading && (
              <div style={{ textAlign:"center",padding:60 }}>
                <div style={{ fontSize:32,marginBottom:10 }}>🤖</div>
                <div style={{ fontSize:14,color:"#64748b" }}>Generating 15 IAT-style questions...</div>
                <div style={{ fontSize:11,color:"#334155",marginTop:4 }}>Takes ~30 seconds</div>
              </div>
            )}

            {!mockLoading && mockQuestions.length>0 && !mockDone && (() => {
              const q = mockQuestions[mockIndex];
              const ans = mockAnswers[mockIndex];
              const isAnswered = ans !== undefined;
              return (
                <div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,background:"#0f172a",borderRadius:10,padding:"10px 14px",border:"1px solid #1e293b" }}>
                    <div>
                      <div style={{ fontSize:11,color:"#64748b" }}>Q {mockIndex+1} of {mockQuestions.length}</div>
                      <div style={{ fontSize:11,color:SUBJECTS[q?.subject]?.color,fontWeight:700 }}>{q?.subject} · {q?.topic}</div>
                    </div>
                    <div style={{ fontFamily:"monospace",fontSize:16,fontWeight:700,color:"#818cf8" }}>{fmtTime(mockTime)}</div>
                  </div>

                  {/* Dot nav */}
                  <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginBottom:12 }}>
                    {mockQuestions.map((_,i)=>(
                      <div key={i} onClick={()=>setMockIndex(i)} style={{ width:22,height:22,borderRadius:5,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,
                        background:mockAnswers[i]!==undefined?(mockAnswers[i]===mockQuestions[i].correct?"#064e3b":"#450a0a"):i===mockIndex?"#312e81":"#1e293b",
                        color:mockAnswers[i]!==undefined?(mockAnswers[i]===mockQuestions[i].correct?"#6ee7b7":"#fca5a5"):i===mockIndex?"#a78bfa":"#475569",
                        border:i===mockIndex?"1px solid #818cf8":"1px solid transparent"
                      }}>{i+1}</div>
                    ))}
                  </div>

                  <div style={{ background:"#0f172a",borderRadius:12,padding:14,marginBottom:12,border:"1px solid #1e293b" }}>
                    <div style={{ fontSize:14,lineHeight:1.7 }}>{q?.question}</div>
                  </div>

                  {q?.options.map((opt,i)=>{
                    const isCorrect=i===q.correct, isSelected=i===ans;
                    let bg="#0f172a",bdr="#1e293b",col="#e2e8f0";
                    if(isAnswered){ if(isCorrect){bg="#064e3b";bdr="#10b981";col="#6ee7b7";} else if(isSelected){bg="#450a0a";bdr="#ef4444";col="#fca5a5";} }
                    return (
                      <div key={i} onClick={()=>handleMockAnswer(i)} style={{ background:bg,border:`1px solid ${bdr}`,borderRadius:10,padding:"11px 14px",marginBottom:7,cursor:isAnswered?"default":"pointer",color:col,fontSize:13,lineHeight:1.5 }}>
                        {opt}
                        {isAnswered&&isCorrect&&<span style={{ float:"right",color:"#10b981",fontWeight:700 }}>✓ +4</span>}
                        {isAnswered&&isSelected&&!isCorrect&&<span style={{ float:"right",color:"#ef4444",fontWeight:700 }}>✗ −1</span>}
                      </div>
                    );
                  })}

                  {isAnswered&&(
                    <div style={{ background:"#0a0a1a",borderRadius:10,padding:12,marginBottom:10,border:"1px solid #334155" }}>
                      <div style={{ fontSize:10,color:"#818cf8",fontWeight:700,marginBottom:4 }}>💡 EXPLANATION</div>
                      <div style={{ fontSize:12,lineHeight:1.6,color:"#cbd5e1" }}>{q?.explanation}</div>
                    </div>
                  )}

                  {!isAnswered&&(
                    <button onClick={()=>handleMockAnswer(-1)} style={{ width:"100%",padding:9,borderRadius:8,border:"1px dashed #334155",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:12,marginBottom:8 }}>
                      Skip this question (0 marks)
                    </button>
                  )}

                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>setMockIndex(i=>Math.max(0,i-1))} style={{ padding:"11px 14px",borderRadius:10,border:"1px solid #334155",background:"#0f172a",color:"#94a3b8",cursor:"pointer" }}>←</button>
                    {mockIndex<mockQuestions.length-1 ? (
                      <button onClick={()=>setMockIndex(i=>i+1)} style={{ flex:1,padding:11,borderRadius:10,border:"none",background:"#4f46e5",color:"#fff",fontWeight:700,cursor:"pointer" }}>Next →</button>
                    ) : (
                      <button onClick={finishMock} style={{ flex:1,padding:11,borderRadius:10,border:"none",background:"#10b981",color:"#fff",fontWeight:700,cursor:"pointer" }}>Finish & Score ✓</button>
                    )}
                  </div>
                </div>
              );
            })()}

            {mockDone && (() => {
              const { score,correct,wrong,attempted } = getMockScore();
              const skipped = mockQuestions.length-attempted;
              const pct = Math.round((correct/mockQuestions.length)*100);
              return (
                <div>
                  <div style={{ textAlign:"center",marginBottom:14 }}>
                    <div style={{ fontSize:36,marginBottom:6 }}>{pct>=60?"🏆":pct>=40?"👍":"📚"}</div>
                    <div style={{ fontSize:26,fontWeight:900,color:score>=0?"#10b981":"#ef4444" }}>{score} / {mockQuestions.length*4}</div>
                    <div style={{ fontSize:12,color:"#64748b" }}>Time taken: {fmtTime(mockTime)}</div>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:14 }}>
                    {[["✅",correct,"Correct","#10b981"],["❌",wrong,"Wrong","#ef4444"],["⬜",skipped,"Skipped","#64748b"],["🎯",`${pct}%`,"Accuracy","#818cf8"]].map(([ic,v,l,c])=>(
                      <div key={l} style={{ background:"#0f172a",borderRadius:10,padding:"9px 6px",border:"1px solid #1e293b",textAlign:"center" }}>
                        <div style={{ fontSize:14 }}>{ic}</div>
                        <div style={{ fontSize:15,fontWeight:900,color:c }}>{v}</div>
                        <div style={{ fontSize:9,color:"#475569" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:11,color:"#64748b",marginBottom:8 }}>Review:</div>
                  {mockQuestions.map((q,i)=>{
                    const a=mockAnswers[i], correct=a===q.correct;
                    return (
                      <div key={i} style={{ background:"#0f172a",borderRadius:10,padding:12,marginBottom:7,border:`1px solid ${a===undefined?"#1e293b":correct?"#064e3b":"#450a0a"}` }}>
                        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                          <span style={{ fontSize:10,color:SUBJECTS[q.subject]?.color,fontWeight:700 }}>Q{i+1} · {q.subject} · {q.difficulty}</span>
                          <span style={{ fontSize:11,fontWeight:700,color:a===undefined?"#64748b":correct?"#10b981":"#ef4444" }}>{a===undefined?"Skipped":correct?"+4":"−1"}</span>
                        </div>
                        <div style={{ fontSize:12,lineHeight:1.5,marginBottom:5 }}>{q.question}</div>
                        <div style={{ fontSize:11,color:"#10b981" }}>✓ {q.options[q.correct]}</div>
                        {a!==undefined&&!correct&&<div style={{ fontSize:11,color:"#ef4444" }}>✗ Your answer: {q.options[a]}</div>}
                      </div>
                    );
                  })}
                  <button onClick={()=>{setMockQuestions([]);setMockDone(false);}} style={{ width:"100%",padding:12,borderRadius:10,border:"none",background:"#4f46e5",color:"#fff",fontWeight:700,cursor:"pointer",marginTop:8 }}>Try Another Mock →</button>
                </div>
              );
            })()}
          </div>
        )}

        {/* MY NOTES */}
        {tab==="myNotes" && (
          <div>
            <SubjectTabs value={selSub} onChange={s=>{setSelSub(s);setActiveNote(myNotes[s]||"");}} />
            <div style={{ fontSize:11,color:"#475569",marginBottom:8 }}>Your personal notes for {selSub} · auto-saved</div>
            <textarea value={activeNote} onChange={e=>{setActiveNote(e.target.value);setMyNotes(p=>({...p,[selSub]:e.target.value}));}}
              placeholder={`Write your own notes, formulas, shortcuts for ${selSub}...`}
              style={{ width:"100%",minHeight:300,background:"#0f172a",border:"1px solid #334155",borderRadius:12,padding:14,color:"#e2e8f0",fontSize:13,resize:"vertical",lineHeight:1.7,boxSizing:"border-box" }} />
            <div style={{ fontSize:11,color:"#10b981",marginTop:5 }}>✓ Saved across sessions</div>
          </div>
        )}

        {/* LOG */}
        {tab==="log" && (
          <div>
            <div style={{ fontSize:11,color:"#475569",marginBottom:10 }}>Recent activity</div>
            {studyLog.length===0
              ? <div style={{ textAlign:"center",color:"#334155",padding:40 }}>No activity yet. Start studying! 🚀</div>
              : studyLog.map((e,i)=>(
                <div key={i} style={{ background:"#0f172a",borderRadius:10,padding:"9px 12px",marginBottom:7,border:"1px solid #1e293b" }}>
                  <div style={{ fontSize:13 }}>{e.text}</div>
                  <div style={{ fontSize:10,color:"#475569",marginTop:2 }}>{e.time}</div>
                </div>
              ))
            }
          </div>
        )}

      </div>
    </div>
  );
}
