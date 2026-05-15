import { useState, useEffect, useRef } from "react";

// ── Exact IAT 2026 syllabus topics ──────────────────────────────────────────
const SUBJECTS = {
  Maths: {
    color: "#f59e0b", icon: "∑", priority: "HIGH",
    topics: [
      { name:"Sets, Relations & Functions", cls:"11", subtopics:"Types of sets, Cartesian product, domain/range, types of functions, composition, inverse" },
      { name:"Trigonometry", cls:"11", subtopics:"Identities, equations, inverse trig functions, properties of triangles, heights & distances" },
      { name:"Complex Numbers & Quadratic Equations", cls:"11", subtopics:"Argand plane, modulus/argument, polar form, De Moivre's theorem, roots of complex numbers" },
      { name:"Permutations & Combinations", cls:"11", subtopics:"Fundamental principle, nPr, nCr, circular permutations, multinomial theorem" },
      { name:"Binomial Theorem", cls:"11", subtopics:"Binomial expansion, general term, middle term, properties of binomial coefficients" },
      { name:"Sequence & Series", cls:"11", subtopics:"AP, GP, HP, AM-GM-HM inequalities, sum of special series, infinite GP" },
      { name:"Straight Lines & Conic Sections", cls:"11", subtopics:"Slope, various forms, distance formulas; circle, parabola, ellipse, hyperbola — standard equations and properties" },
      { name:"Limits & Derivatives", cls:"11", subtopics:"Epsilon-delta definition, L'Hôpital, standard limits, first principles, differentiation rules" },
      { name:"Statistics & Probability", cls:"11", subtopics:"Mean/median/mode, variance, SD, random experiments, classical probability, addition theorem" },
      { name:"Relations & Functions (Class 12)", cls:"12", subtopics:"Equivalence relations, injective/surjective/bijective, binary operations" },
      { name:"Matrices & Determinants", cls:"12", subtopics:"Matrix operations, transpose, adjoint, inverse, Cramer's rule, system of linear equations" },
      { name:"Continuity & Differentiability", cls:"12", subtopics:"Continuity conditions, chain rule, implicit/parametric differentiation, higher-order derivatives, Rolle's & MVT" },
      { name:"Application of Derivatives", cls:"12", subtopics:"Tangents/normals, increasing/decreasing, maxima/minima, rate of change, approximations" },
      { name:"Integrals", cls:"12", subtopics:"Standard integrals, substitution, by-parts, partial fractions, definite integral properties, area under curve" },
      { name:"Differential Equations", cls:"12", subtopics:"Order & degree, variable separable, homogeneous, linear first-order DE, applications" },
      { name:"Vector Algebra", cls:"12", subtopics:"Types, dot/cross product, scalar triple product, vector triple product, applications in geometry" },
      { name:"3D Geometry", cls:"12", subtopics:"Direction cosines, line equations, plane equations, angle between line/plane, distance formulas" },
      { name:"Probability (Class 12)", cls:"12", subtopics:"Conditional probability, Bayes' theorem, independent events, binomial distribution, expected value" }
    ]
  },
  Physics: {
    color: "#3b82f6", icon: "⚛", priority: "MEDIUM",
    topics: [
      { name:"Units, Dimensions & Measurement", cls:"11", subtopics:"SI units, dimensional analysis, significant figures, errors, instruments (vernier, screw gauge)" },
      { name:"Kinematics", cls:"11", subtopics:"Displacement/velocity/acceleration, equations of motion, projectile motion, relative velocity, circular motion basics" },
      { name:"Laws of Motion", cls:"11", subtopics:"Newton's three laws, free-body diagrams, friction (static/kinetic), circular motion, pseudo forces" },
      { name:"Work, Energy & Power", cls:"11", subtopics:"Work-energy theorem, conservative forces, PE & KE, elastic/inelastic collisions, power" },
      { name:"Rotational Motion", cls:"11", subtopics:"Moment of inertia, torque, angular momentum, conservation of L, rolling without slipping" },
      { name:"Gravitation", cls:"11", subtopics:"Kepler's laws, Newton's law of gravitation, g variation, orbital velocity, escape velocity, satellites" },
      { name:"Properties of Matter", cls:"11", subtopics:"Elasticity (stress/strain, Young's modulus), fluid pressure, Pascal's law, Bernoulli, viscosity, surface tension" },
      { name:"Thermodynamics", cls:"11", subtopics:"Zeroth/first/second laws, heat engines, Carnot cycle, entropy, specific heat of gases, thermodynamic processes" },
      { name:"Kinetic Theory of Gases", cls:"11", subtopics:"Ideal gas equation, KE–temperature relation, degrees of freedom, Maxwell speed distribution basics" },
      { name:"Oscillations & Waves", cls:"11", subtopics:"SHM, energy in SHM, superposition, beats, Doppler effect, standing waves, resonance" },
      { name:"Electric Charges & Fields", cls:"12", subtopics:"Coulomb's law, electric field, Gauss's law applications, dipole, field lines, electric flux" },
      { name:"Electrostatic Potential & Capacitance", cls:"12", subtopics:"Potential due to point charge/dipole, equipotential surfaces, capacitors, energy stored, dielectrics" },
      { name:"Current Electricity", cls:"12", subtopics:"Ohm's law, resistivity, Kirchhoff's laws, Wheatstone bridge, potentiometer, cell EMF & internal resistance" },
      { name:"Magnetic Effects of Current", cls:"12", subtopics:"Biot-Savart, Ampere's law, force on current, cyclotron, galvanometer, ammeter/voltmeter" },
      { name:"Electromagnetic Induction", cls:"12", subtopics:"Faraday's laws, Lenz's law, motional EMF, self/mutual inductance, energy in inductor, AC basics" },
      { name:"Optics", cls:"12", subtopics:"Reflection/refraction laws, mirrors/lenses, optical instruments, wave optics (interference, diffraction, polarisation)" },
      { name:"Dual Nature of Matter & Radiation", cls:"12", subtopics:"Photoelectric effect, Einstein's equation, de Broglie wavelength, Davisson-Germer experiment" },
      { name:"Atoms & Nuclei", cls:"12", subtopics:"Bohr model, hydrogen spectrum, nuclear binding energy, radioactive decay laws, fission/fusion" },
      { name:"Semiconductor Electronics", cls:"12", subtopics:"p-n junction, diode characteristics, rectifiers, Zener diode, transistor (BJT), logic gates" }
    ]
  },
  Chemistry: {
    color: "#10b981", icon: "⚗", priority: "MEDIUM",
    topics: [
      { name:"Basic Concepts & Stoichiometry", cls:"11", subtopics:"Mole concept, empirical/molecular formula, limiting reagent, percentage yield, concentration units" },
      { name:"Atomic Structure", cls:"11", subtopics:"Bohr model, quantum numbers, orbitals, aufbau/Hund/Pauli, electronic configuration, hydrogen spectrum" },
      { name:"Periodic Table & Periodicity", cls:"11", subtopics:"Periodic trends: atomic radius, IE, EA, electronegativity, oxidation states, anomalies" },
      { name:"Chemical Bonding & Molecular Structure", cls:"11", subtopics:"Ionic/covalent/metallic bonding, VSEPR, hybridisation, MOT (O₂, N₂, HF), resonance, polarity" },
      { name:"States of Matter", cls:"11", subtopics:"Ideal gas laws, kinetic theory, real gases (van der Waals), liquefaction, hydrogen bonding effects" },
      { name:"Thermodynamics (Chemistry)", cls:"11", subtopics:"ΔH, Hess's law, bond enthalpies, ΔG = ΔH − TΔS, spontaneity, entropy changes" },
      { name:"Chemical Equilibrium", cls:"11", subtopics:"Kc, Kp, Le Chatelier's principle, ionic equilibrium, pH, buffer solutions, solubility product" },
      { name:"Redox Reactions", cls:"11", subtopics:"Oxidation states, balancing by ion-electron method, disproportionation, electrochemical series" },
      { name:"Organic Chemistry Basics", cls:"11", subtopics:"Hybridisation, IUPAC nomenclature, isomerism, inductive/resonance effects, reaction intermediates, types of reactions" },
      { name:"Hydrocarbons", cls:"11", subtopics:"Alkanes (free radical), alkenes (addition, Markovnikov), alkynes, benzene (electrophilic substitution)" },
      { name:"Solid State", cls:"12", subtopics:"Unit cells, crystal systems, packing efficiency, radius ratio, defects (Schottky, Frenkel), properties" },
      { name:"Solutions", cls:"12", subtopics:"Molarity/molality/mole fraction, Henry's law, Raoult's law, colligative properties, osmosis, van't Hoff factor" },
      { name:"Electrochemistry", cls:"12", subtopics:"Electrochemical cells, Nernst equation, EMF, cell potential, electrolysis, Faraday's laws, conductance" },
      { name:"Chemical Kinetics", cls:"12", subtopics:"Rate laws, order/molecularity, integrated rate equations, half-life, Arrhenius equation, activation energy" },
      { name:"d & f Block & Coordination Compounds", cls:"12", subtopics:"Transition metals properties, Werner's theory, CFSE, nomenclature, isomerism, magnetic properties" },
      { name:"Haloalkanes & Haloarenes", cls:"12", subtopics:"SN1/SN2 mechanisms, E1/E2 elimination, Walden inversion, Grignard reagent, aryl halide reactions" },
      { name:"Aldehydes, Ketones & Carboxylic Acids", cls:"12", subtopics:"Nucleophilic addition, aldol condensation, Cannizzaro, oxidation states, acidity trends, esterification" },
      { name:"Amines & Nitrogen Compounds", cls:"12", subtopics:"Basicity, Gabriel synthesis, Hofmann degradation, diazonium salts, coupling reactions" },
      { name:"Biomolecules & Polymers", cls:"12", subtopics:"Carbohydrates (mono/di/polysaccharides), proteins (structure), DNA/RNA, enzyme action, addition/condensation polymers" }
    ]
  },
  Biology: {
    color: "#ec4899", icon: "🧬", priority: "HIGH",
    topics: [
      { name:"Diversity in Living World", cls:"11", subtopics:"Taxonomy hierarchy, Five-Kingdom classification, viruses/viroids, ICZN/ICBN rules, biodiversity indices" },
      { name:"Structural Organisation in Animals & Plants", cls:"11", subtopics:"Morphology of root/stem/leaf/flower/fruit, animal tissues (epithelial, connective, muscular, neural)" },
      { name:"Cell Structure & Functions", cls:"11", subtopics:"Prokaryote vs eukaryote, cell organelles (structure & function), plasma membrane models, cell wall" },
      { name:"Biomolecules", cls:"11", subtopics:"Carbohydrates, proteins (primary–quaternary), lipids, enzymes (kinetics, inhibition, cofactors), nucleic acids" },
      { name:"Cell Division", cls:"11", subtopics:"Cell cycle phases (G1/S/G2/M), mitosis stages, meiosis I & II, significance, checkpoints" },
      { name:"Photosynthesis", cls:"11", subtopics:"Light reactions (PS I & II, Z-scheme), Calvin cycle (C3), C4 pathway, photorespiration, factors affecting rate" },
      { name:"Respiration in Plants", cls:"11", subtopics:"Glycolysis, Krebs cycle, ETC, ATP yield, fermentation, respiratory quotient, amphibolic pathways" },
      { name:"Plant Growth & Development", cls:"11", subtopics:"Growth regulators (auxin, gibberellin, cytokinin, ABA, ethylene), photoperiodism, vernalisation, tropisms" },
      { name:"Digestion & Absorption", cls:"11", subtopics:"Alimentary canal anatomy, digestive enzymes, absorption mechanisms, liver functions, disorders" },
      { name:"Breathing & Gas Exchange", cls:"11", subtopics:"Respiratory organs, pulmonary volumes, O₂/CO₂ transport (Hb, carbonic anhydrase), disorders" },
      { name:"Body Fluids & Circulation", cls:"11", subtopics:"Blood composition, cardiac cycle, conduction system, ECG basics, lymph, blood groups, disorders" },
      { name:"Excretion", cls:"11", subtopics:"Nephron structure, filtration/reabsorption/secretion, ADH, renin-angiotensin, dialysis, disorders" },
      { name:"Neural Control & Coordination", cls:"11", subtopics:"Neuron structure, resting/action potential, synapse, CNS/PNS, reflex arc, sense organs" },
      { name:"Chemical Coordination", cls:"11", subtopics:"Endocrine glands, hormone types (peptide/steroid/amino acid), feedback regulation, disorders" },
      { name:"Reproduction in Organisms", cls:"12", subtopics:"Asexual & sexual reproduction types, fertilisation mechanisms, reproductive structures" },
      { name:"Sexual Reproduction in Flowering Plants", cls:"12", subtopics:"Flower structure, microsporogenesis, megasporogenesis, pollination, double fertilisation, seed development" },
      { name:"Human Reproduction", cls:"12", subtopics:"Male/female reproductive anatomy, spermatogenesis, oogenesis, menstrual cycle, implantation, parturition" },
      { name:"Genetics & Mendelian Inheritance", cls:"12", subtopics:"Mendel's laws, dominance/recessiveness, dihybrid cross, linkage, crossing over, sex-linked inheritance, blood groups" },
      { name:"Molecular Basis of Inheritance", cls:"12", subtopics:"DNA structure (Chargaff), replication (semi-conservative), transcription, genetic code, translation, regulation (lac operon)" },
      { name:"Evolution", cls:"12", subtopics:"Origin of life, Darwin's theory, Neo-Darwinism, Hardy-Weinberg, speciation, adaptive radiation, human evolution" },
      { name:"Human Health & Disease", cls:"12", subtopics:"Innate/adaptive immunity, vaccines, pathogens (bacterial/viral/protozoan), cancer, drugs & alcohol" },
      { name:"Biotechnology", cls:"12", subtopics:"Recombinant DNA, restriction enzymes, vectors, PCR, gel electrophoresis, transgenic organisms, ELISA, GMO applications" },
      { name:"Ecosystem & Ecology", cls:"12", subtopics:"Food chains/webs, energy flow (10% law), biogeochemical cycles, ecological pyramids, succession" },
      { name:"Biodiversity & Conservation", cls:"12", subtopics:"Types of biodiversity, hotspots, IUCN categories, in-situ/ex-situ conservation, threats, conventions" }
    ]
  }
};

// ── Prompt builders ──────────────────────────────────────────────────────────

const NOTES_PROMPT = (topic, subtopics, subject) => `
You are a senior IAT/IISER faculty with 15 years of experience. Create DEEP, EXAM-READY study notes on "${topic}" for ${subject} (NCERT Class 11/12, IAT 2026).

Subtopics covered: ${subtopics}

Return ONLY valid JSON — no markdown, no backticks, no extra text:
{
  "summary": "3-4 sentences giving a rich conceptual overview — what this topic is, why it matters scientifically, and how it connects to other topics",
  "key_concepts": [
    "Concept name: Full explanation in 2-3 sentences with the underlying principle clearly stated",
    "Concept name: Full explanation...",
    "Concept name: Full explanation...",
    "Concept name: Full explanation...",
    "Concept name: Full explanation..."
  ],
  "important_formulas": [
    "Formula or fact with units and conditions of applicability",
    "Formula or fact...",
    "Formula or fact...",
    "Formula or fact..."
  ],
  "deep_insight": "A paragraph (4-5 sentences) giving deeper scientific understanding — the 'why behind the what'. Include connections to real-world phenomena or other topics in the IAT syllabus.",
  "remember": [
    "Memory trick or mnemonic with explanation of why it works",
    "Memory trick..."
  ],
  "common_mistakes": [
    "Specific mistake students make, with explanation of the correct reasoning",
    "Specific mistake..."
  ],
  "iat_focus": "What IAT specifically tests in this topic — the type of question, depth required, commonly tested edge cases, and a typical question pattern with approach hint"
}`;

const MCQ_PROMPT = (topic, subtopics, subject) => `
You are an expert IAT (IISER Aptitude Test) question setter with access to previous year papers. Generate ONE high-quality IAT-style MCQ on "${topic}" from ${subject}.

Subtopics in scope: ${subtopics}

IAT specifically tests: conceptual depth, application to novel situations, multi-step reasoning, NOT rote memorisation.

Return ONLY valid JSON (no markdown, no backticks):
{
  "question": "A clear, self-contained question. For Maths/Physics: include numerical values and units. For Biology/Chemistry: include a scenario or specific mechanism. Make it genuinely challenging.",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct": 0,
  "step_by_step": [
    "Step 1: State what the question is asking and identify the key concept",
    "Step 2: Write down relevant formula/principle with explanation of why it applies",
    "Step 3: Show full working or reasoning (include numbers for Maths/Physics)",
    "Step 4: Arrive at the answer and verify it makes physical/biological/chemical sense"
  ],
  "why_others_wrong": "Explain specifically why each wrong option is a common trap — what misconception leads students to choose B, C, or D",
  "concept_tested": "The precise sub-concept from the IAT syllabus being tested",
  "difficulty": "Medium|Hard",
  "iat_tip": "One sentence on how to approach this type of question quickly in an exam"
}

Rules:
- correct is 0-based index (0=A, 1=B, 2=C, 3=D)
- All 4 options must be plausible — no obviously wrong distractors
- Lean Hard for IAT — the exam is competitive
- Maths: require at least one calculation step
- Physics: test understanding of a principle, not just formula recall
- Chemistry: test mechanism or trend, not just a definition
- Biology: test application of a process, not just naming`;

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

  const [quizMode, setQuizMode] = useState("select");
  const [quizSub, setQuizSub] = useState("Maths");
  const [currentQ, setCurrentQ] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [quizStats, setQuizStats] = useState({ correct: 0, wrong: 0, score: 0 });

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
      const keys = ["iat2_completed","iat2_log","iat2_hours","iat2_mynotes","iat2_ainotes","iat2_stats"];
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
      await Promise.all([
        window.storage.set("iat2_completed", JSON.stringify(completedTopics)),
        window.storage.set("iat2_log", JSON.stringify(studyLog)),
        window.storage.set("iat2_hours", JSON.stringify(todayHours)),
        window.storage.set("iat2_mynotes", JSON.stringify(myNotes)),
        window.storage.set("iat2_ainotes", JSON.stringify(aiNotes)),
        window.storage.set("iat2_stats", JSON.stringify(quizStats))
      ]);
    } catch(e) {}
  }

  function toggleTopic(sub, topic) {
    const key = `${sub}_${topic}`;
    const wasDone = completedTopics[key];
    setCompletedTopics(p => ({ ...p, [key]: !p[key] }));
    if (!wasDone) setStudyLog(p => [{ time: new Date().toLocaleString(), text: `✅ ${topic} (${sub})` }, ...p.slice(0,29)]);
  }

  function getProgress(sub) {
    const topics = SUBJECTS[sub].topics;
    const done = topics.filter(t => completedTopics[`${sub}_${t.name}`]).length;
    return { done, total: topics.length, pct: Math.round((done / topics.length) * 100) };
  }

  function getTotalPct() {
    let d = 0, t = 0;
    Object.keys(SUBJECTS).forEach(s => { const p = getProgress(s); d += p.done; t += p.total; });
    return Math.round((d / t) * 100);
  }

  async function callClaude(prompt, maxTokens = 1200) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] })
    });
    const data = await res.json();
    return data.content.map(i => i.text || "").join("").replace(/```json[\s\S]*?```|```/g, "").trim();
  }

  async function generateMCQ(subject, topicObj) {
    setLoadingQ(true); setCurrentQ(null); setSelectedOpt(null); setRevealed(false); setShowSteps(false);
    try {
      const txt = await callClaude(MCQ_PROMPT(topicObj.name, topicObj.subtopics, subject), 1400);
      setCurrentQ({ ...JSON.parse(txt), subject, topicName: topicObj.name });
    } catch(e) {
      setCurrentQ({ question: `Explain a key application of ${topicObj.name} in ${subject}.`, options:["A) Application A","B) Application B","C) Application C","D) Application D"], correct:0, step_by_step:["Could not generate. Please retry."], why_others_wrong:"Could not generate.", concept_tested: topicObj.name, difficulty:"Medium", iat_tip:"Retry.", subject, topicName: topicObj.name });
    }
    setLoadingQ(false);
  }

  function handleOptionSelect(idx) {
    if (revealed) return;
    setSelectedOpt(idx);
    setRevealed(true);
    const isCorrect = idx === currentQ.correct;
    setQuizStats(p => ({ correct: p.correct+(isCorrect?1:0), wrong: p.wrong+(isCorrect?0:1), score: p.score+(isCorrect?4:-1) }));
    setStudyLog(p => [{ time: new Date().toLocaleString(), text: `${isCorrect?"✅ +4":"❌ −1"} MCQ: ${currentQ.topicName} (${currentQ.subject})` }, ...p.slice(0,29)]);
  }

  async function startMockTest() {
    setMockLoading(true); setMockQuestions([]); setMockAnswers({}); setMockIndex(0); setMockDone(false); setMockTime(0);
    clearInterval(timerRef.current);
    const selected = [];
    Object.keys(SUBJECTS).forEach(sub => {
      const shuffled = [...SUBJECTS[sub].topics].sort(() => Math.random()-0.5);
      shuffled.slice(0, 4).forEach(t => selected.push({ subject: sub, topicObj: t }));
    });
    const picks = selected.sort(() => Math.random()-0.5).slice(0,15);
    const questions = [];
    for (const { subject, topicObj } of picks) {
      try {
        const txt = await callClaude(MCQ_PROMPT(topicObj.name, topicObj.subtopics, subject), 1200);
        questions.push({ ...JSON.parse(txt), subject, topicName: topicObj.name });
      } catch(e) {
        questions.push({ question:`[${subject}] Core concept of ${topicObj.name}?`, options:["A) A","B) B","C) C","D) D"], correct:0, step_by_step:["Retry for steps."], why_others_wrong:"Retry.", concept_tested:topicObj.name, difficulty:"Medium", iat_tip:"Retry.", subject, topicName:topicObj.name });
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
    const { correct, wrong, score } = getMockScore();
    setQuizStats(p => ({ correct: p.correct+correct, wrong: p.wrong+wrong, score: p.score+score }));
  }

  function getMockScore() {
    let score=0,correct=0,wrong=0;
    mockQuestions.forEach((q,i) => {
      const ans = mockAnswers[i];
      if (ans === undefined) return;
      if (ans === q.correct) { score+=4; correct++; } else { score-=1; wrong++; }
    });
    return { score, correct, wrong, attempted: Object.keys(mockAnswers).length };
  }

  async function generateAiNotes(subject, topicObj) {
    const key = `${subject}_${topicObj.name}`;
    setAiNoteTopic({ subject, topicObj }); setAiNoteContent(null);
    if (aiNotes[key]) { setAiNoteContent(aiNotes[key]); return; }
    setLoadingNote(true);
    try {
      const txt = await callClaude(NOTES_PROMPT(topicObj.name, topicObj.subtopics, subject), 1500);
      const parsed = JSON.parse(txt);
      setAiNoteContent(parsed);
      setAiNotes(p => ({ ...p, [key]: parsed }));
    } catch(e) {
      setAiNoteContent({ summary:"Could not load. Please try again.", key_concepts:[], important_formulas:[], deep_insight:"", remember:[], common_mistakes:[], iat_focus:"" });
    }
    setLoadingNote(false);
  }

  function fmtTime(s) { return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }

  const totalPct = getTotalPct();
  const accuracy = quizStats.correct+quizStats.wrong > 0 ? Math.round((quizStats.correct/(quizStats.correct+quizStats.wrong))*100) : 0;

  const SubTabs = ({ value, onChange }) => (
    <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
      {Object.keys(SUBJECTS).map(s => (
        <button key={s} onClick={() => onChange(s)} style={{ padding:"5px 12px", borderRadius:20, border:`2px solid ${value===s?SUBJECTS[s].color:"#1e293b"}`, background:value===s?SUBJECTS[s].color+"20":"#0f172a", color:value===s?SUBJECTS[s].color:"#64748b", cursor:"pointer", fontSize:12, fontWeight:700 }}>
          {SUBJECTS[s].icon} {s}
        </button>
      ))}
    </div>
  );

  const card = (children, extra={}) => (
    <div style={{ background:"#0f172a", borderRadius:12, padding:14, marginBottom:10, border:"1px solid #1e293b", ...extra }}>{children}</div>
  );

  const sectionTitle = (icon, label, color) => (
    <div style={{ fontSize:10, color, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>{icon} {label}</div>
  );

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#e2e8f0", fontFamily:"system-ui,sans-serif" }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", padding:"18px 16px 0", borderBottom:"1px solid #1e293b" }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:10, letterSpacing:3, color:"#818cf8", textTransform:"uppercase" }}>IISER Aptitude Test</div>
              <div style={{ fontSize:19, fontWeight:800, color:"#fff", marginTop:2 }}>IAT 2026 Deep Study Hub</div>
              <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>60 MCQs · +4/−1 · 3 hrs · June 7, 2026</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:26, fontWeight:900, color:"#818cf8" }}>{totalPct}%</div>
              <div style={{ fontSize:10, color:"#475569" }}>done</div>
            </div>
          </div>
          <div style={{ height:4, background:"#1e293b", borderRadius:2, margin:"12px 0 0", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${totalPct}%`, background:"linear-gradient(90deg,#6366f1,#a78bfa)", borderRadius:2, transition:"width 0.5s" }} />
          </div>
          <div style={{ display:"flex", gap:2, marginTop:10, overflowX:"auto" }}>
            {[["dashboard","📊"],["topics","📚 Topics"],["ainotes","🤖 Notes"],["quiz","🧠 Quiz"],["mock","🎯 Mock"],["myNotes","✏️"],["log","📋"]].map(([id,lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding:"7px 10px", borderRadius:"8px 8px 0 0", border:"none", cursor:"pointer", fontSize:11, fontWeight:600, whiteSpace:"nowrap", background:tab===id?"#080810":"transparent", color:tab===id?"#a78bfa":"#64748b", borderBottom:tab===id?"2px solid #818cf8":"2px solid transparent" }}>{lbl}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"16px" }}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[["🎯","IAT Score",quizStats.score,"#818cf8"],["✅","Accuracy",`${accuracy}%`,"#10b981"],["📝","Attempted",quizStats.correct+quizStats.wrong,"#f59e0b"]].map(([ic,lbl,val,c]) => (
                <div key={lbl} style={{ background:"#0f172a", borderRadius:10, padding:"11px 8px", border:"1px solid #1e293b", textAlign:"center" }}>
                  <div style={{ fontSize:16 }}>{ic}</div>
                  <div style={{ fontSize:18, fontWeight:900, color:c }}>{val}</div>
                  <div style={{ fontSize:10, color:"#475569" }}>{lbl}</div>
                </div>
              ))}
            </div>

            {card(<>
              <div style={{ fontSize:11, color:"#64748b", marginBottom:8 }}>Today's Study Hours (Target: 5–6 hrs)</div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button onClick={() => setTodayHours(h => Math.max(0, +(h-0.5).toFixed(1)))} style={{ width:30, height:30, borderRadius:"50%", border:"1px solid #334155", background:"#1e293b", color:"#fff", fontSize:16, cursor:"pointer" }}>−</button>
                <div style={{ flex:1, textAlign:"center" }}><span style={{ fontSize:28, fontWeight:900, color:"#818cf8" }}>{todayHours}</span><span style={{ color:"#475569" }}> hrs</span></div>
                <button onClick={() => setTodayHours(h => +(h+0.5).toFixed(1))} style={{ width:30, height:30, borderRadius:"50%", border:"1px solid #334155", background:"#1e293b", color:"#fff", fontSize:16, cursor:"pointer" }}>+</button>
              </div>
              <div style={{ marginTop:8, height:5, background:"#1e293b", borderRadius:3 }}>
                <div style={{ height:"100%", width:`${Math.min(100,(todayHours/6)*100)}%`, background:todayHours>=5?"#10b981":"#f59e0b", borderRadius:3, transition:"width 0.3s" }} />
              </div>
              {todayHours>=5 && <div style={{ textAlign:"center", color:"#10b981", fontSize:11, marginTop:4 }}>🎉 Goal reached!</div>}
            </>)}

            {Object.entries(SUBJECTS).map(([name,s]) => {
              const p = getProgress(name);
              return (
                <div key={name} onClick={() => { setSelSub(name); setTab("topics"); }} style={{ background:"#0f172a", borderRadius:12, padding:13, marginBottom:8, border:"1px solid #1e293b", cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:8, background:s.color+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14 }}>{name}</div>
                        <div style={{ fontSize:10, color:"#475569" }}>{p.done}/{p.total} topics · {s.priority} PRIORITY</div>
                      </div>
                    </div>
                    <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{p.pct}%</div>
                  </div>
                  <div style={{ marginTop:8, height:3, background:"#1e293b", borderRadius:2 }}>
                    <div style={{ height:"100%", width:`${p.pct}%`, background:s.color, borderRadius:2 }} />
                  </div>
                </div>
              );
            })}

            {card(<>
              <div style={{ fontSize:10, color:"#818cf8", fontWeight:700, letterSpacing:1, marginBottom:8 }}>📋 IAT 2026 KEY FACTS</div>
              {[["Date","June 7, 2026"],["Mode","CBT — Computer Based"],["Questions","60 MCQs (15/subject)"],["Marking","+4 correct · −1 wrong · 0 skip"],["Duration","180 minutes"],["Syllabus","NCERT Class 11 & 12 (exact)"],["Institutes","7 IISERs + IISc + IIT Madras"]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #1e293b", fontSize:12 }}>
                  <span style={{ color:"#64748b" }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </>, { border:"1px solid #312e81" })}
          </div>
        )}

        {/* ── TOPICS ── */}
        {tab==="topics" && (
          <div>
            <SubTabs value={selSub} onChange={setSelSub} />
            <div style={{ fontSize:11, color:"#64748b", marginBottom:10 }}>{SUBJECTS[selSub].topics.length} topics · tap Notes or Quiz on any topic</div>
            {["11","12"].map(cls => {
              const filtered = SUBJECTS[selSub].topics.filter(t => t.cls === cls);
              if (!filtered.length) return null;
              return (
                <div key={cls} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:10, color:"#475569", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Class {cls}</div>
                  {filtered.map(topicObj => {
                    const done = completedTopics[`${selSub}_${topicObj.name}`];
                    return (
                      <div key={topicObj.name} style={{ background:"#0f172a", borderRadius:10, padding:"10px 12px", marginBottom:6, border:`1px solid ${done?SUBJECTS[selSub].color+"50":"#1e293b"}` }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                          <div onClick={() => toggleTopic(selSub, topicObj.name)} style={{ width:18, height:18, borderRadius:5, border:`2px solid ${done?SUBJECTS[selSub].color:"#334155"}`, background:done?SUBJECTS[selSub].color:"transparent", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, marginTop:1 }}>{done?"✓":""}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:done?"#475569":"#e2e8f0", textDecoration:done?"line-through":"none", marginBottom:2 }}>{topicObj.name}</div>
                            <div style={{ fontSize:10, color:"#475569", lineHeight:1.4 }}>{topicObj.subtopics}</div>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:6, marginTop:8 }}>
                          <button onClick={() => { generateAiNotes(selSub, topicObj); setTab("ainotes"); }} style={{ fontSize:11, padding:"3px 10px", borderRadius:6, border:"none", background:"#1e1b4b", color:"#a78bfa", cursor:"pointer" }}>🤖 Deep Notes</button>
                          <button onClick={() => { setQuizSub(selSub); setQuizMode("topic"); generateMCQ(selSub, topicObj); setTab("quiz"); }} style={{ fontSize:11, padding:"3px 10px", borderRadius:6, border:"none", background:"#1e293b", color:"#60a5fa", cursor:"pointer" }}>🧠 Quiz</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ── AI DEEP NOTES ── */}
        {tab==="ainotes" && (
          <div>
            <SubTabs value={selSub} onChange={setSelSub} />
            {!aiNoteTopic ? (
              <div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:10 }}>Select a topic for deep IAT-aligned notes:</div>
                {["11","12"].map(cls => {
                  const filtered = SUBJECTS[selSub].topics.filter(t => t.cls === cls);
                  return (
                    <div key={cls} style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10, color:"#475569", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Class {cls}</div>
                      {filtered.map(topicObj => {
                        const cached = aiNotes[`${selSub}_${topicObj.name}`];
                        return (
                          <button key={topicObj.name} onClick={() => generateAiNotes(selSub, topicObj)} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #1e293b", background:"#0f172a", color:"#e2e8f0", cursor:"pointer", textAlign:"left", marginBottom:5 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                              <div>
                                <div style={{ fontSize:13, fontWeight:600 }}>{topicObj.name}</div>
                                <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>{topicObj.subtopics.slice(0,60)}…</div>
                              </div>
                              <span style={{ fontSize:10, color:cached?"#10b981":"#a78bfa", whiteSpace:"nowrap", marginLeft:8 }}>{cached?"✓ Saved":"Generate →"}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <button onClick={() => { setAiNoteTopic(null); setAiNoteContent(null); }} style={{ padding:"4px 10px", borderRadius:7, border:"1px solid #334155", background:"#0f172a", color:"#94a3b8", cursor:"pointer", fontSize:11 }}>← Back</button>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:SUBJECTS[aiNoteTopic.subject]?.color, fontWeight:700 }}>{aiNoteTopic.subject}</div>
                    <div style={{ fontSize:15, fontWeight:800 }}>{aiNoteTopic.topicObj.name}</div>
                    <div style={{ fontSize:10, color:"#475569" }}>Class {aiNoteTopic.topicObj.cls}</div>
                  </div>
                  <button onClick={() => { setAiNoteContent(null); const k=`${aiNoteTopic.subject}_${aiNoteTopic.topicObj.name}`; setAiNotes(p=>{const n={...p};delete n[k];return n;}); generateAiNotes(aiNoteTopic.subject, aiNoteTopic.topicObj); }} style={{ fontSize:11, padding:"4px 10px", borderRadius:7, border:"1px solid #334155", background:"#0f172a", color:"#60a5fa", cursor:"pointer" }}>↻ Refresh</button>
                </div>

                {loadingNote ? (
                  <div style={{ textAlign:"center", padding:50, color:"#475569" }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>🤖</div>
                    <div>Generating deep IAT notes…</div>
                    <div style={{ fontSize:11, marginTop:4, color:"#334155" }}>This may take ~15 seconds</div>
                  </div>
                ) : aiNoteContent && (
                  <div>
                    {/* Summary */}
                    {card(<>
                      {sectionTitle("📌","Overview","#818cf8")}
                      <p style={{ fontSize:13, lineHeight:1.8, margin:0, color:"#cbd5e1" }}>{aiNoteContent.summary}</p>
                    </>, { border:"1px solid #4338ca50" })}

                    {/* Key Concepts */}
                    {aiNoteContent.key_concepts?.length > 0 && card(<>
                      {sectionTitle("🔑","Key Concepts","#60a5fa")}
                      {aiNoteContent.key_concepts.map((c,i) => {
                        const [name, ...rest] = c.split(":");
                        return (
                          <div key={i} style={{ marginBottom:10, paddingBottom:10, borderBottom:"1px solid #1e293b" }}>
                            <div style={{ fontSize:13, fontWeight:700, color:"#93c5fd", marginBottom:3 }}>{i+1}. {name}</div>
                            <div style={{ fontSize:13, lineHeight:1.7, color:"#cbd5e1" }}>{rest.join(":").trim()}</div>
                          </div>
                        );
                      })}
                    </>)}

                    {/* Formulas */}
                    {aiNoteContent.important_formulas?.length > 0 && card(<>
                      {sectionTitle("⚡","Formulas & Key Facts","#f59e0b")}
                      {aiNoteContent.important_formulas.map((f,i) => (
                        <div key={i} style={{ background:"#0a0f1e", borderRadius:7, padding:"8px 12px", marginBottom:6, fontSize:13, fontFamily:"monospace", color:"#fbbf24", lineHeight:1.6 }}>{f}</div>
                      ))}
                    </>)}

                    {/* Deep Insight */}
                    {aiNoteContent.deep_insight && card(<>
                      {sectionTitle("🔬","Deep Scientific Insight","#34d399")}
                      <p style={{ fontSize:13, lineHeight:1.8, margin:0, color:"#cbd5e1" }}>{aiNoteContent.deep_insight}</p>
                    </>, { border:"1px solid #065f4650" })}

                    {/* Memory Tricks */}
                    {aiNoteContent.remember?.length > 0 && card(<>
                      {sectionTitle("🧠","Memory Tricks & Mnemonics","#10b981")}
                      {aiNoteContent.remember.map((r,i) => (
                        <div key={i} style={{ display:"flex", gap:8, marginBottom:8, paddingBottom:8, borderBottom:"1px solid #1e293b" }}>
                          <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
                          <span style={{ fontSize:13, lineHeight:1.6, color:"#d1fae5" }}>{r}</span>
                        </div>
                      ))}
                    </>)}

                    {/* Common Mistakes */}
                    {aiNoteContent.common_mistakes?.length > 0 && card(<>
                      {sectionTitle("⚠️","Common Mistakes to Avoid","#ef4444")}
                      {aiNoteContent.common_mistakes.map((m,i) => (
                        <div key={i} style={{ display:"flex", gap:8, marginBottom:8, paddingBottom:8, borderBottom:"1px solid #1e293b" }}>
                          <span style={{ color:"#ef4444", fontSize:14, flexShrink:0 }}>✗</span>
                          <span style={{ fontSize:13, lineHeight:1.6, color:"#fecaca" }}>{m}</span>
                        </div>
                      ))}
                    </>, { border:"1px solid #7f1d1d50" })}

                    {/* IAT Focus */}
                    {aiNoteContent.iat_focus && card(<>
                      {sectionTitle("🎯","IAT-Specific Focus","#a78bfa")}
                      <p style={{ fontSize:13, lineHeight:1.8, margin:0, color:"#ddd6fe" }}>{aiNoteContent.iat_focus}</p>
                    </>, { border:"1px solid #4c1d9550" })}

                    <button onClick={() => { setQuizMode("topic"); generateMCQ(aiNoteTopic.subject, aiNoteTopic.topicObj); setTab("quiz"); }} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:"#4f46e5", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:13, marginTop:4 }}>
                      🧠 Quiz me on this topic →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── QUIZ ── */}
        {tab==="quiz" && (
          <div>
            {quizMode==="select" && (
              <div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:12 }}>Pick a topic for IAT-style MCQ practice with step-by-step solutions:</div>
                <SubTabs value={quizSub} onChange={setQuizSub} />
                {["11","12"].map(cls => {
                  const filtered = SUBJECTS[quizSub].topics.filter(t => t.cls===cls);
                  return (
                    <div key={cls} style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10, color:"#475569", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Class {cls}</div>
                      {filtered.map(topicObj => (
                        <button key={topicObj.name} onClick={() => { setQuizMode("topic"); generateMCQ(quizSub, topicObj); }} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #1e293b", background:"#0f172a", color:"#e2e8f0", cursor:"pointer", textAlign:"left", marginBottom:5, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600 }}>{topicObj.name}</div>
                            <div style={{ fontSize:10, color:"#475569", marginTop:1 }}>{topicObj.subtopics.slice(0,55)}…</div>
                          </div>
                          <span style={{ color:SUBJECTS[quizSub].color, flexShrink:0, marginLeft:8 }}>→</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {quizMode==="topic" && (
              <div>
                <div style={{ display:"flex", gap:8, marginBottom:14, alignItems:"center" }}>
                  <button onClick={() => setQuizMode("select")} style={{ padding:"4px 10px", borderRadius:7, border:"1px solid #334155", background:"#0f172a", color:"#94a3b8", cursor:"pointer", fontSize:11 }}>← Topics</button>
                  <div style={{ display:"flex", gap:6, marginLeft:"auto" }}>
                    {[["Score",quizStats.score,"#818cf8"],["✅",quizStats.correct,"#10b981"],["❌",quizStats.wrong,"#ef4444"]].map(([l,v,c]) => (
                      <div key={l} style={{ background:"#0f172a", borderRadius:8, padding:"4px 10px", border:"1px solid #1e293b", textAlign:"center" }}>
                        <div style={{ fontSize:14, fontWeight:900, color:c }}>{v}</div>
                        <div style={{ fontSize:9, color:"#475569" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {loadingQ && (
                  <div style={{ textAlign:"center", padding:50, color:"#475569" }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>🤖</div>
                    <div>Generating IAT-level MCQ…</div>
                  </div>
                )}

                {!loadingQ && currentQ && (
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:11, color:SUBJECTS[currentQ.subject]?.color, fontWeight:700 }}>{currentQ.subject} · {currentQ.topicName}</span>
                      <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"#1e293b", color:currentQ.difficulty==="Hard"?"#ef4444":"#f59e0b" }}>{currentQ.difficulty}</span>
                    </div>

                    {card(<>
                      <div style={{ fontSize:14, lineHeight:1.8, marginBottom:currentQ.concept_tested?6:0 }}>{currentQ.question}</div>
                      {currentQ.concept_tested && <div style={{ fontSize:11, color:"#475569", fontStyle:"italic" }}>Concept: {currentQ.concept_tested}</div>}
                    </>)}

                    {currentQ.options.map((opt,i) => {
                      const isCorrect = i===currentQ.correct, isSelected = i===selectedOpt;
                      let bg="#0f172a", bdr="#1e293b", col="#e2e8f0";
                      if (revealed) {
                        if (isCorrect) { bg="#064e3b"; bdr="#10b981"; col="#6ee7b7"; }
                        else if (isSelected) { bg="#450a0a"; bdr="#ef4444"; col="#fca5a5"; }
                      }
                      return (
                        <div key={i} onClick={() => handleOptionSelect(i)} style={{ background:bg, border:`1px solid ${bdr}`, borderRadius:10, padding:"12px 14px", marginBottom:7, cursor:revealed?"default":"pointer", color:col, fontSize:13, lineHeight:1.5, transition:"all 0.2s" }}>
                          {opt}
                          {revealed&&isCorrect && <span style={{ float:"right", color:"#10b981", fontWeight:700 }}>✓ +4</span>}
                          {revealed&&isSelected&&!isCorrect && <span style={{ float:"right", color:"#ef4444", fontWeight:700 }}>✗ −1</span>}
                        </div>
                      );
                    })}

                    {revealed && (
                      <div>
                        {/* IAT Tip */}
                        {currentQ.iat_tip && (
                          <div style={{ background:"#1c1917", borderRadius:8, padding:"8px 12px", marginBottom:10, border:"1px solid #78350f50", fontSize:12, color:"#fcd34d" }}>
                            ⚡ IAT Tip: {currentQ.iat_tip}
                          </div>
                        )}

                        {/* Step-by-step toggle */}
                        <button onClick={() => setShowSteps(p => !p)} style={{ width:"100%", padding:10, borderRadius:10, border:"1px solid #4338ca", background:showSteps?"#1e1b4b":"#0f172a", color:"#818cf8", fontWeight:700, cursor:"pointer", fontSize:13, marginBottom:8 }}>
                          {showSteps?"▲ Hide":"▼ Show"} Step-by-Step Solution
                        </button>

                        {showSteps && card(<>
                          {sectionTitle("📐","Full Solution","#818cf8")}
                          {(currentQ.step_by_step||[]).map((step,i) => (
                            <div key={i} style={{ display:"flex", gap:10, marginBottom:10 }}>
                              <div style={{ minWidth:24, height:24, borderRadius:"50%", background:"#312e81", color:"#a78bfa", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</div>
                              <div style={{ fontSize:13, lineHeight:1.7, color:"#e2e8f0", paddingTop:2 }}>{step}</div>
                            </div>
                          ))}
                          {currentQ.why_others_wrong && <>
                            <div style={{ height:1, background:"#1e293b", margin:"10px 0" }} />
                            {sectionTitle("⚠️","Why Other Options Are Wrong","#f87171")}
                            <p style={{ fontSize:13, lineHeight:1.7, margin:0, color:"#fecaca" }}>{currentQ.why_others_wrong}</p>
                          </>}
                        </>, { border:"1px solid #312e81" })}

                        <button onClick={() => generateMCQ(currentQ.subject, SUBJECTS[currentQ.subject].topics.find(t=>t.name===currentQ.topicName)||SUBJECTS[currentQ.subject].topics[0])} style={{ width:"100%", padding:11, borderRadius:10, border:"none", background:"#4f46e5", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:13, marginTop:4 }}>
                          Next Question →
                        </button>
                      </div>
                    )}
                    {!revealed && <div style={{ textAlign:"center", fontSize:11, color:"#475569", marginTop:8 }}>Tap an option · +4 correct · −1 wrong · IAT format</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MOCK TEST ── */}
        {tab==="mock" && (
          <div>
            {!mockLoading && mockQuestions.length===0 && (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🎯</div>
                <div style={{ fontSize:18, fontWeight:800, marginBottom:6 }}>Full IAT Mock Test</div>
                <div style={{ fontSize:13, color:"#64748b", marginBottom:18, lineHeight:1.8 }}>15 questions across all 4 subjects<br/>+4 correct · −1 wrong · Step-by-step review after</div>
                {card(<>
                  {[["Questions","15 (mixed Maths, Physics, Chem, Bio)"],["Format","4-option MCQ, single correct answer"],["Scoring","+4 / −1 / 0 (skip = 0, so skip when unsure!)"],["After","Full review with step-by-step solutions"]].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #1e293b", fontSize:12 }}>
                      <span style={{ color:"#64748b" }}>{k}</span><span style={{ fontWeight:600, textAlign:"right", maxWidth:"55%" }}>{v}</span>
                    </div>
                  ))}
                </>, { border:"1px solid #312e81" })}
                <button onClick={startMockTest} style={{ width:"100%", padding:14, borderRadius:12, border:"none", background:"linear-gradient(135deg,#6366f1,#a78bfa)", color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer" }}>
                  Start Mock Test →
                </button>
              </div>
            )}

            {mockLoading && (
              <div style={{ textAlign:"center", padding:60 }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🤖</div>
                <div style={{ fontSize:14, color:"#64748b" }}>Generating 15 deep IAT questions…</div>
                <div style={{ fontSize:11, color:"#334155", marginTop:4 }}>Takes ~45 seconds</div>
              </div>
            )}

            {!mockLoading && mockQuestions.length>0 && !mockDone && (() => {
              const q = mockQuestions[mockIndex];
              const ans = mockAnswers[mockIndex];
              const isAnswered = ans !== undefined;
              return (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, background:"#0f172a", borderRadius:10, padding:"10px 14px", border:"1px solid #1e293b" }}>
                    <div>
                      <div style={{ fontSize:11, color:"#64748b" }}>Q {mockIndex+1} / {mockQuestions.length}</div>
                      <div style={{ fontSize:11, color:SUBJECTS[q?.subject]?.color, fontWeight:700 }}>{q?.subject} · {q?.topicName}</div>
                    </div>
                    <div style={{ fontFamily:"monospace", fontSize:16, fontWeight:700, color:"#818cf8" }}>{fmtTime(mockTime)}</div>
                  </div>

                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
                    {mockQuestions.map((_,i) => (
                      <div key={i} onClick={() => setMockIndex(i)} style={{ width:22, height:22, borderRadius:5, cursor:"pointer", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700,
                        background:mockAnswers[i]!==undefined?(mockAnswers[i]===mockQuestions[i].correct?"#064e3b":"#450a0a"):i===mockIndex?"#312e81":"#1e293b",
                        color:mockAnswers[i]!==undefined?(mockAnswers[i]===mockQuestions[i].correct?"#6ee7b7":"#fca5a5"):i===mockIndex?"#a78bfa":"#475569",
                        border:i===mockIndex?"1px solid #818cf8":"1px solid transparent"
                      }}>{i+1}</div>
                    ))}
                  </div>

                  {card(<div style={{ fontSize:14, lineHeight:1.8 }}>{q?.question}</div>)}

                  {q?.options.map((opt,i) => {
                    const isCorrect=i===q.correct, isSelected=i===ans;
                    let bg="#0f172a",bdr="#1e293b",col="#e2e8f0";
                    if(isAnswered){ if(isCorrect){bg="#064e3b";bdr="#10b981";col="#6ee7b7";}else if(isSelected){bg="#450a0a";bdr="#ef4444";col="#fca5a5";} }
                    return (
                      <div key={i} onClick={() => handleMockAnswer(i)} style={{ background:bg, border:`1px solid ${bdr}`, borderRadius:10, padding:"11px 14px", marginBottom:7, cursor:isAnswered?"default":"pointer", color:col, fontSize:13, lineHeight:1.5 }}>
                        {opt}
                        {isAnswered&&isCorrect&&<span style={{ float:"right",color:"#10b981",fontWeight:700 }}>✓ +4</span>}
                        {isAnswered&&isSelected&&!isCorrect&&<span style={{ float:"right",color:"#ef4444",fontWeight:700 }}>✗ −1</span>}
                      </div>
                    );
                  })}

                  {!isAnswered && <button onClick={() => handleMockAnswer(-1)} style={{ width:"100%", padding:9, borderRadius:8, border:"1px dashed #334155", background:"transparent", color:"#64748b", cursor:"pointer", fontSize:12, marginBottom:8 }}>Skip (0 marks)</button>}

                  <div style={{ display:"flex", gap:8, marginTop:4 }}>
                    <button onClick={() => setMockIndex(i => Math.max(0,i-1))} style={{ padding:"11px 14px", borderRadius:10, border:"1px solid #334155", background:"#0f172a", color:"#94a3b8", cursor:"pointer" }}>←</button>
                    {mockIndex < mockQuestions.length-1
                      ? <button onClick={() => setMockIndex(i=>i+1)} style={{ flex:1, padding:11, borderRadius:10, border:"none", background:"#4f46e5", color:"#fff", fontWeight:700, cursor:"pointer" }}>Next →</button>
                      : <button onClick={finishMock} style={{ flex:1, padding:11, borderRadius:10, border:"none", background:"#10b981", color:"#fff", fontWeight:700, cursor:"pointer" }}>Finish & Score ✓</button>
                    }
                  </div>
                </div>
              );
            })()}

            {mockDone && (() => {
              const { score, correct, wrong, attempted } = getMockScore();
              const skipped = mockQuestions.length - attempted;
              const pct = Math.round((correct/mockQuestions.length)*100);
              return (
                <div>
                  <div style={{ textAlign:"center", marginBottom:14 }}>
                    <div style={{ fontSize:36, marginBottom:6 }}>{pct>=60?"🏆":pct>=40?"👍":"📚"}</div>
                    <div style={{ fontSize:26, fontWeight:900, color:score>=0?"#10b981":"#ef4444" }}>{score} / {mockQuestions.length*4}</div>
                    <div style={{ fontSize:12, color:"#64748b" }}>Time: {fmtTime(mockTime)}</div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6, marginBottom:14 }}>
                    {[["✅",correct,"Correct","#10b981"],["❌",wrong,"Wrong","#ef4444"],["⬜",skipped,"Skipped","#64748b"],["🎯",`${pct}%`,"Accuracy","#818cf8"]].map(([ic,v,l,c]) => (
                      <div key={l} style={{ background:"#0f172a", borderRadius:10, padding:"9px 6px", border:"1px solid #1e293b", textAlign:"center" }}>
                        <div style={{ fontSize:14 }}>{ic}</div>
                        <div style={{ fontSize:15, fontWeight:900, color:c }}>{v}</div>
                        <div style={{ fontSize:9, color:"#475569" }}>{l}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize:11, color:"#64748b", marginBottom:8 }}>Full review with solutions:</div>
                  {mockQuestions.map((q,i) => {
                    const a=mockAnswers[i], isCorrect=a===q.correct;
                    const [openSteps, setOpenSteps] = useState(false);
                    return (
                      <div key={i} style={{ background:"#0f172a", borderRadius:10, padding:12, marginBottom:8, border:`1px solid ${a===undefined?"#1e293b":isCorrect?"#064e3b":"#450a0a"}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:10, color:SUBJECTS[q.subject]?.color, fontWeight:700 }}>Q{i+1} · {q.subject} · {q.topicName}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:a===undefined?"#64748b":isCorrect?"#10b981":"#ef4444" }}>{a===undefined?"Skipped":isCorrect?"+4":"−1"}</span>
                        </div>
                        <div style={{ fontSize:12, lineHeight:1.6, marginBottom:6 }}>{q.question}</div>
                        <div style={{ fontSize:11, color:"#10b981", marginBottom:2 }}>✓ {q.options[q.correct]}</div>
                        {a!==undefined&&!isCorrect&&<div style={{ fontSize:11, color:"#ef4444", marginBottom:6 }}>✗ Your answer: {a>=0?q.options[a]:"Skipped"}</div>}
                        <button onClick={() => setOpenSteps(p=>!p)} style={{ fontSize:10, padding:"3px 8px", borderRadius:6, border:"1px solid #334155", background:"#1e293b", color:"#818cf8", cursor:"pointer", marginTop:4 }}>
                          {openSteps?"▲ Hide":"▼ Show"} Solution
                        </button>
                        {openSteps && (
                          <div style={{ marginTop:8, background:"#080810", borderRadius:8, padding:10 }}>
                            {(q.step_by_step||[]).map((step,j) => (
                              <div key={j} style={{ display:"flex", gap:8, marginBottom:7 }}>
                                <div style={{ minWidth:20, height:20, borderRadius:"50%", background:"#312e81", color:"#a78bfa", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{j+1}</div>
                                <div style={{ fontSize:12, lineHeight:1.6, color:"#e2e8f0" }}>{step}</div>
                              </div>
                            ))}
                            {q.why_others_wrong && <div style={{ marginTop:6, fontSize:11, color:"#fca5a5", lineHeight:1.5 }}>⚠️ {q.why_others_wrong}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => { setMockQuestions([]); setMockDone(false); }} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:"#4f46e5", color:"#fff", fontWeight:700, cursor:"pointer", marginTop:8 }}>Try Another Mock →</button>
                </div>
              );
            })()}
          </div>
        )}

        {/* MY NOTES */}
        {tab==="myNotes" && (
          <div>
            <SubTabs value={selSub} onChange={s => { setSelSub(s); setActiveNote(myNotes[s]||""); }} />
            <div style={{ fontSize:11, color:"#475569", marginBottom:8 }}>Your personal notes for {selSub} · auto-saved</div>
            <textarea value={activeNote} onChange={e => { setActiveNote(e.target.value); setMyNotes(p => ({...p,[selSub]:e.target.value})); }}
              placeholder={`Write your own notes, formulas, shortcuts for ${selSub}…`}
              style={{ width:"100%", minHeight:320, background:"#0f172a", border:"1px solid #334155", borderRadius:12, padding:14, color:"#e2e8f0", fontSize:13, resize:"vertical", lineHeight:1.8, boxSizing:"border-box" }} />
            <div style={{ fontSize:11, color:"#10b981", marginTop:5 }}>✓ Saved across sessions</div>
          </div>
        )}

        {/* LOG */}
        {tab==="log" && (
          <div>
            <div style={{ fontSize:11, color:"#475569", marginBottom:10 }}>Recent activity (last 30)</div>
            {studyLog.length===0
              ? <div style={{ textAlign:"center", color:"#334155", padding:40 }}>No activity yet. Start studying! 🚀</div>
              : studyLog.map((e,i) => (
                <div key={i} style={{ background:"#0f172a", borderRadius:10, padding:"9px 12px", marginBottom:6, border:"1px solid #1e293b" }}>
                  <div style={{ fontSize:13 }}>{e.text}</div>
                  <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>{e.time}</div>
                </div>
              ))
            }
          </div>
        )}

      </div>
    </div>
  );
}
