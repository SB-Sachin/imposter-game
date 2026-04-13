import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue, set, get, update } from "firebase/database";

// ─── Device ID ────────────────────────────────────────────────────────────────
const getDeviceId = () => {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem("deviceId", id);
  }
  return id;
};

// ─── Word Data ────────────────────────────────────────────────────────────────
const WORD_DATA = {
  "Food & Drink":{ icon:"🍕", words:["Pizza","Sushi","Tacos","Burger","Ramen","Pasta","Curry","Steak","Salad","Sandwich","Burrito","Falafel","Dim Sum","Paella","Risotto","Pho","Bibimbap","Gyoza","Croissant","Waffle","Pancake","Donut","Cheesecake","Tiramisu","Gelato","Sorbet","Churros","Baklava","Macaron","Brownie"] },
  "Animals":     { icon:"🦁", words:["Elephant","Penguin","Dolphin","Tiger","Gorilla","Flamingo","Octopus","Cheetah","Koala","Giraffe","Platypus","Axolotl","Chameleon","Narwhal","Pangolin","Meerkat","Capybara","Quokka","Wolverine","Mandrill","Ocelot","Binturong","Tapir","Fossa","Serval","Kinkajou","Numbat","Dik-Dik","Gerenuk","Okapi"] },
  "Sports":      { icon:"⚽", words:["Soccer","Basketball","Tennis","Baseball","Swimming","Cycling","Boxing","Wrestling","Archery","Fencing","Polo","Cricket","Rugby","Lacrosse","Volleyball","Badminton","Squash","Surfing","Skiing","Skateboarding","Bobsled","Curling","Biathlon","Triathlon","Pentathlon","Snooker","Darts","Bowls","Croquet","Kabaddi"] },
  "Movies":      { icon:"🎬", words:["Titanic","Inception","Interstellar","Gladiator","Braveheart","Casablanca","Psycho","Vertigo","Alien","Matrix","Godfather","Goodfellas","Scarface","Fargo","Parasite","Oldboy","Amelie","Pan's Labyrinth","City of God","Spirited Away","Princess Mononoke","Akira","Blade Runner","2001: A Space Odyssey","A Clockwork Orange","Full Metal Jacket","Apocalypse Now","Platoon","Saving Private Ryan","Dunkirk"] },
  "Countries":   { icon:"🌍", words:["Iceland","Mongolia","Ethiopia","Peru","Croatia","New Zealand","Morocco","Vietnam","Chile","Finland","Georgia","Cambodia","Ecuador","Laos","Namibia","Slovenia","Bolivia","Jordan","Myanmar","Bhutan","Oman","Kosovo","Suriname","Eritrea","Djibouti","Tuvalu","Vanuatu","Kiribati","Nauru","Palau"] },
  "Professions": { icon:"👔", words:["Surgeon","Architect","Sommelier","Taxidermist","Cartographer","Actuary","Podiatrist","Metallurgist","Cryptographer","Mortician","Museologist","Lepidopterist","Archivist","Stenographer","Toxicologist","Geologist","Epidemiologist","Glaciologist","Audiologist","Orthoptist","Prosthetist","Zymologist","Agronomist","Volcanologist","Ornithologist","Herpetologist","Malacologist","Mycologist","Paleontologist","Immunologist"] },
  "Technology":  { icon:"💻", words:["Algorithm","Blockchain","Firewall","Bandwidth","Encryption","API","Database","Compiler","Bootloader","Kernel","Docker","Kubernetes","Sandbox","Repository","Framework","Middleware","Cache","Latency","Checksum","Packet","Router","Protocol","Hypervisor","Recursion","Heap","Stack","Thread","Daemon","Binary","Bitstream"] },
  "Music":       { icon:"🎵", words:["Guitar","Saxophone","Theremin","Harpsichord","Didgeridoo","Bouzouki","Sitar","Koto","Mbira","Dulcimer","Balalaika","Zither","Hurdy-Gurdy","Bassoon","Oboe","Flugelhorn","Tuba","Euphonium","Cimbalom","Nyckelharpa","Erhu","Oud","Saz","Rebec","Lute","Theorbo","Crumhorn","Serpent","Ophicleide","Cornett"] },
  "Space":       { icon:"🚀", words:["Neutron Star","Quasar","Pulsar","Magnetar","Nebula","Supernova","Black Hole","Dark Matter","Singularity","Event Horizon","Wormhole","Solar Wind","Cosmic Ray","Asteroid","Comet","Meteor","Exoplanet","Binary Star","Red Dwarf","White Dwarf","Brown Dwarf","Kuiper Belt","Oort Cloud","Heliopause","Chromosphere","Photosphere","Corona","Prominence","Sunspot","Zodiacal Light"] },
  "History":     { icon:"🏛️", words:["Colosseum","Stonehenge","Machu Picchu","Pompeii","Angkor Wat","Petra","Teotihuacan","Chichen Itza","Moai","Great Wall","Parthenon","Pantheon","Hagia Sophia","Alhambra","Versailles","Forbidden City","Taj Mahal","Acropolis","Epidaurus","Delphi","Olympia","Ephesus","Carthage","Babylon","Nineveh","Memphis","Thebes","Persepolis","Tikal","Mesa Verde"] },
  "Science":     { icon:"🔬", words:["Photosynthesis","Entropy","Osmosis","Diffusion","Catalysis","Fermentation","Electrolysis","Sublimation","Magnetism","Thermodynamics","Quantum","Relativity","Superconductivity","Fluorescence","Bioluminescence","Chemiluminescence","Radioactivity","Fission","Fusion","Isotope","Polymer","Enzyme","Mitosis","Meiosis","Symbiosis","Parasitism","Mutualism","Commensalism","Trophism","Geotropism"] },
  "Mythology":   { icon:"⚡", words:["Minotaur","Medusa","Cerberus","Hydra","Chimera","Sphinx","Griffin","Basilisk","Kraken","Leviathan","Fenrir","Jormungandr","Anubis","Osiris","Ra","Horus","Thoth","Sekhmet","Ares","Athena","Poseidon","Hades","Dionysus","Persephone","Orpheus","Icarus","Prometheus","Tantalus","Sisyphus","Odysseus"] },
  "Art":         { icon:"🎨", words:["Impressionism","Surrealism","Cubism","Expressionism","Minimalism","Abstract","Baroque","Renaissance","Romanticism","Dadaism","Futurism","Constructivism","Fauvism","Pointillism","Symbolism","Realism","Naturalism","Mannerism","Rococo","Neoclassicism","Pre-Raphaelite","Art Nouveau","Art Deco","Bauhaus","Pop Art","Op Art","Conceptualism","Fluxus","Neo-Expressionism","Street Art"] },
  "Geography":   { icon:"🌋", words:["Fjord","Atoll","Strait","Peninsula","Archipelago","Plateau","Delta","Tundra","Savanna","Taiga","Permafrost","Estuary","Lagoon","Caldera","Rift Valley","Mesa","Butte","Moraine","Drumlin","Esker","Glacial","Karst","Sinkhole","Cave System","Canyon","Gorge","Ravine","Geyser","Hot Spring","Mud Volcano"] },
  "Vehicles":    { icon:"🚗", words:["Zeppelin","Catamaran","Hovercraft","Snowmobile","Rickshaw","Gondola","Monorail","Submarine","Trawler","Dinghy","Hydrofoil","Trimaran","Kayak","Outrigger","Punt","Barge","Tugboat","Icebreaker","Frigate","Destroyer","Corvette","Galleon","Clipper","Schooner","Brigantine","Sloop","Ketch","Yawl","Felucca","Dhow"] },
};

const ALL_CATEGORIES = Object.keys(WORD_DATA);
const calcMaxImp = (n) => Math.max(1, n - 1);

const DEFAULT_SETTINGS = {
  roundTime: 60, votingTime: 30, numberOfRounds: 1, gameMode: "word",
  impostorMode: "random", impostorCount: 1, impostorRandomMode: "balanced",
  impostorCustomMin: 0, impostorCustomMax: 4,
  showImpostorCount: false, impostorNeverGoesFirst: false,
  selectedCategories: ALL_CATEGORIES.slice(0, 6),
  showCategoryToImpostor: true, showHintToImpostor: false, impostorsKnowEachOther: true,
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─── Design System CSS ────────────────────────────────────────────────────────
const DESIGN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  /* ── Reset & Base ─────────────────────────────── */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  :root {
    /* Color tokens */
    --bg:          #07080f;
    --surface:     #0e0f1a;
    --surface-2:   #14162a;
    --border:      rgba(255,255,255,0.07);
    --border-2:    rgba(255,255,255,0.12);

    --text-primary:   #f0eef8;
    --text-secondary: #8b89a0;
    --text-muted:     #454360;

    /* Accent — amber/gold for key actions */
    --gold:        #f59e0b;
    --gold-dim:    rgba(245,158,11,0.12);
    --gold-border: rgba(245,158,11,0.3);

    /* Violet for structural highlights */
    --violet:        #7c3aed;
    --violet-light:  #a78bfa;
    --violet-dim:    rgba(124,58,237,0.15);
    --violet-border: rgba(124,58,237,0.35);

    /* Semantic */
    --red:         #ef4444;
    --red-dim:     rgba(239,68,68,0.12);
    --red-border:  rgba(239,68,68,0.28);
    --green:       #22c55e;
    --green-dim:   rgba(34,197,94,0.1);
    --green-border:rgba(34,197,94,0.25);

    /* Typography */
    --font-display: 'Syne', system-ui, sans-serif;
    --font-body:    'DM Sans', system-ui, sans-serif;

    /* Spacing */
    --page-px: 20px;
    --radius-sm: 10px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 24px;
  }

  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    overscroll-behavior: none;
  }

  /* Prevent iOS double-tap zoom */
  button, input, select, textarea {
    touch-action: manipulation;
    font-family: inherit;
  }

  /* Minimal scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  /* ── Keyframes ─────────────────────────────────── */

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); filter: blur(6px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes scaleSpring {
    from { opacity: 0; transform: scale(0.88); filter: blur(4px); }
    to   { opacity: 1; transform: scale(1);    filter: blur(0);   }
  }

  @keyframes celebrationBounce {
    0%   { opacity: 0; transform: scale(0.4) rotate(-8deg); }
    55%  { opacity: 1; transform: scale(1.15) rotate(3deg); }
    75%  { transform: scale(0.94) rotate(-1deg); }
    100% { transform: scale(1) rotate(0deg); }
  }

  @keyframes ambientGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50%       { opacity: 0.7; transform: scale(1.08); }
  }

  @keyframes lockPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
    50%       { box-shadow: 0 0 0 18px rgba(124,58,237,0); }
  }

  @keyframes timerUrgent {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.1); }
  }

  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  @keyframes shimmer {
    from { background-position: -200% center; }
    to   { background-position: 200% center;  }
  }

  /* ── Animation utility classes ─────────────────── */

  .anim-fade-up   { animation: fadeUp 0.38s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-scale-in  { animation: scaleSpring 0.32s cubic-bezier(0.34,1.56,0.64,1) both; }
  .anim-celebrate { animation: celebrationBounce 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
  .anim-slide-up  { animation: slideUp 0.36s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-fade-in   { animation: fadeIn 0.22s ease both; }

  .delay-1 { animation-delay: 0.05s; }
  .delay-2 { animation-delay: 0.1s;  }
  .delay-3 { animation-delay: 0.15s; }
  .delay-4 { animation-delay: 0.2s;  }
  .delay-5 { animation-delay: 0.25s; }
  .delay-6 { animation-delay: 0.3s;  }

  /* ── Interactive states ────────────────────────── */

  .btn-press {
    transition: transform 0.12s ease, opacity 0.12s ease;
  }
  .btn-press:active {
    transform: scale(0.96);
    opacity: 0.88;
  }

  .hoverable {
    transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  }

  /* ── Reduce motion ─────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ── Layout primitives ─────────────────────────── */

  .screen {
    width: 100%;
    max-width: 430px;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    padding-bottom: 40px;
    position: relative;
    overflow: hidden;
  }

  /* ── Typography ────────────────────────────────── */
  .display { font-family: var(--font-display); }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function ImposterGame() {
  const localDeviceId = getDeviceId();

  const [roomId, setRoomId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [playersData, setPlayersData] = useState([]);
  const isHost = hostId === localDeviceId;

  const [localScreen, setLocalScreen] = useState("home");
  const globalPhaseRef = useRef(null);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [gameState, setGameState] = useState(null);
  const [revealedSet, setRevealedSet] = useState(new Set());
  const [votes, setVotes] = useState({});
  const [scores, setScores] = useState({});
  const [roundResults, setRoundResults] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);

  const [newName, setNewName] = useState("");
  const [revealPlayer, setRevealPlayer] = useState(null);
  const [showWord, setShowWord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [settingsTab, setSettingsTab] = useState("game");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const timerRef = useRef(null);

  const playerNames = playersData.map(p => p.name);

  // Inject CSS once
  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-impostor-design", "1");
    el.textContent = DESIGN_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Firebase sync
  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsub = onValue(roomRef, (snap) => {
      const d = snap.val();
      if (!d) return;
      if (d.hostId) setHostId(d.hostId);
      if (d.settings) setSettings(d.settings);
      setPlayersData(d.playersData || []);
      if (d.gamePhase && d.gamePhase !== globalPhaseRef.current) {
        globalPhaseRef.current = d.gamePhase;
        setLocalScreen(d.gamePhase);
      }
      if (d.gameState !== undefined) setGameState(d.gameState);
      setRevealedSet(new Set(d.revealedSet || []));
      if (d.votes) {
        const pv = {};
        Object.keys(d.votes).forEach(v => { pv[v] = new Set(d.votes[v]); });
        setVotes(pv);
      } else setVotes({});
      if (d.scores) setScores(d.scores);
      if (d.currentRound) setCurrentRound(d.currentRound);
      if (d.roundResults !== undefined) setRoundResults(d.roundResults);
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (localScreen === "game" && gameState) {
      startTimer(settings.roundTime, () => pushUpdate({ gamePhase: "vote" }));
    } else if (localScreen === "vote") {
      startTimer(settings.votingTime, () => {});
    } else {
      clearInterval(timerRef.current);
    }
  }, [localScreen, gameState?.category]);

  const pushUpdate = (u) => { if (roomId) update(ref(db, `rooms/${roomId}`), u); };
  const setSetting = (k, v) => { if (isHost) pushUpdate({ [`settings/${k}`]: v }); };

  const handleCreateRoom = async () => {
    const id = Math.random().toString(36).substring(2, 6).toUpperCase();
    await set(ref(db, `rooms/${id}`), {
      gamePhase: "lobby", hostId: localDeviceId, settings: DEFAULT_SETTINGS,
      playersData: [], scores: {}, currentRound: 1, votes: {}, revealedSet: [],
    });
    setRoomId(id);
  };

  const handleJoinRoom = async () => {
    if (!joinCode) return;
    const code = joinCode.toUpperCase();
    const snap = await get(ref(db, `rooms/${code}`));
    if (snap.exists()) setRoomId(code);
    else alert("Room not found — check the code and try again.");
  };

  const handleAddPlayer = () => {
    if (!newName.trim()) return;
    if (playersData.some(p => p.name.toLowerCase() === newName.trim().toLowerCase())) {
      alert("That name is already taken!"); return;
    }
    pushUpdate({ playersData: [...playersData, { name: newName.trim(), ownerId: localDeviceId }] });
    setNewName("");
  };

  const handleRemovePlayer = (idx) => {
    const nd = [...playersData]; nd.splice(idx, 1);
    pushUpdate({ playersData: nd });
  };

  const resolveImpostorCount = (n, cfg) => {
    if (cfg.impostorMode === "fixed") return Math.min(Math.max(1, cfg.impostorCount), calcMaxImp(n));
    if (cfg.impostorRandomMode === "balanced") return Math.max(1, Math.round(n / 4));
    if (cfg.impostorRandomMode === "chaos") return Math.floor(Math.random() * (n + 1));
    const lo = Math.max(0, Math.min(cfg.impostorCustomMin, n));
    const hi = Math.max(lo, Math.min(cfg.impostorCustomMax, n));
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  };

  const startGame = () => {
    if (playersData.length < 3) return;
    const cats = settings.selectedCategories.length ? settings.selectedCategories : ALL_CATEGORIES;
    const cat = pickRandom(cats);
    const word = pickRandom(WORD_DATA[cat].words);
    const count = resolveImpostorCount(playersData.length, settings);
    const impostors = shuffle([...playerNames]).slice(0, count);
    const assignments = {};
    playerNames.forEach(p => { assignments[p] = impostors.includes(p) ? null : word; });
    pushUpdate({
      gameState: { category: cat, secretWord: word, impostors, assignments, impostorCount: count },
      revealedSet: [], votes: {}, roundResults: null, gamePhase: "reveal",
    });
  };

  const startTimer = (duration, onEnd) => {
    setTimeLeft(duration);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); onEnd(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const submitVotes = () => {
    clearInterval(timerRef.current);
    const tally = {};
    playerNames.forEach(p => { tally[p] = 0; });
    Object.values(votes).forEach(vs => vs.forEach(s => { tally[s] = (tally[s] || 0) + 1; }));
    const maxV = Math.max(...Object.values(tally));
    const eliminated = maxV > 0 ? Object.keys(tally).filter(p => tally[p] === maxV) : [];
    const impostors = gameState.impostors;
    const caught = impostors.filter(i => eliminated.includes(i));
    const allCaught = caught.length === impostors.length;
    const ns = { ...scores };
    if (allCaught) {
      playerNames.filter(p => !impostors.includes(p)).forEach(p => { ns[p] = (ns[p] || 0) + 2; });
    } else if (caught.length === 0) {
      impostors.forEach(p => { ns[p] = (ns[p] || 0) + 3; });
    } else {
      impostors.filter(p => !caught.includes(p)).forEach(p => { ns[p] = (ns[p] || 0) + 2; });
      playerNames.filter(p => !impostors.includes(p)).forEach(p => {
        const mv = votes[p] || new Set();
        if ([...mv].some(v => caught.includes(v))) ns[p] = (ns[p] || 0) + 1;
      });
    }
    pushUpdate({ scores: ns, roundResults: { tally, eliminated, caughtImpostors: caught, allCaught }, gamePhase: "result" });
  };

  const nextRound = () => {
    if (currentRound >= settings.numberOfRounds) pushUpdate({ gamePhase: "scoreboard" });
    else { pushUpdate({ currentRound: currentRound + 1 }); startGame(); }
  };

  const resetAll = () => pushUpdate({ gamePhase: "lobby", scores: {}, currentRound: 1, gameState: null, votes: {} });

  // ─── Style Tokens ─────────────────────────────────────────────────────────
  const s = {
    wrap: {
      minHeight: "100dvh",
      background: "var(--bg)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    // Buttons
    btnGold: {
      background: "var(--gold)",
      color: "#07080f",
      border: "none",
      borderRadius: "var(--radius-md)",
      padding: "15px 24px",
      fontSize: 15,
      fontWeight: 700,
      fontFamily: "var(--font-body)",
      cursor: "pointer",
      width: "100%",
      letterSpacing: "-0.1px",
      boxShadow: "0 4px 24px rgba(245,158,11,0.25), 0 1px 0 rgba(255,255,255,0.15) inset",
    },
    btnGhost: {
      background: "rgba(255,255,255,0.05)",
      color: "var(--text-primary)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "14px 24px",
      fontSize: 15,
      fontWeight: 500,
      fontFamily: "var(--font-body)",
      cursor: "pointer",
      width: "100%",
    },
    btnDanger: {
      background: "var(--red-dim)",
      color: "var(--red)",
      border: "1px solid var(--red-border)",
      borderRadius: "var(--radius-md)",
      padding: "13px 24px",
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "var(--font-body)",
      cursor: "pointer",
      width: "100%",
    },
    btnIcon: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)",
      width: 40,
      height: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "var(--text-secondary)",
      fontSize: 18,
      flexShrink: 0,
    },
    // Cards
    card: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: 20,
      marginBottom: 10,
    },
    cardViolet: {
      background: "var(--violet-dim)",
      border: "1px solid var(--violet-border)",
      borderRadius: "var(--radius-lg)",
      padding: 20,
      marginBottom: 10,
    },
    cardGold: {
      background: "var(--gold-dim)",
      border: "1px solid var(--gold-border)",
      borderRadius: "var(--radius-lg)",
      padding: 20,
      marginBottom: 10,
    },
    // Input
    input: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid var(--border-2)",
      borderRadius: "var(--radius-sm)",
      padding: "13px 16px",
      color: "var(--text-primary)",
      fontSize: 16, // 16px prevents iOS auto-zoom
      fontFamily: "var(--font-body)",
      width: "100%",
      outline: "none",
      transition: "border-color 0.18s ease",
    },
    // Layout
    px: { padding: "0 var(--page-px)" },
    row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
    header: { display: "flex", alignItems: "center", padding: "20px var(--page-px) 0", gap: 12 },
    headerTitle: {
      fontSize: 17,
      fontWeight: 700,
      fontFamily: "var(--font-display)",
      flex: 1,
      textAlign: "center",
      paddingRight: 40,
      letterSpacing: "-0.3px",
    },
    // Labels
    eyebrow: {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.9px",
      marginBottom: 6,
      display: "block",
    },
  };

  // ─── Sub-components ───────────────────────────────────────────────────────

  const Toggle = ({ value, onChange, disabled }) => (
    <button
      onClick={() => !disabled && onChange(!value)}
      className="btn-press"
      style={{
        width: 46,
        height: 26,
        background: value ? "var(--violet)" : "rgba(255,255,255,0.1)",
        borderRadius: 13,
        border: "none",
        cursor: disabled ? "default" : "pointer",
        position: "relative",
        transition: "background 0.22s ease",
        flexShrink: 0,
        opacity: disabled ? 0.45 : 1,
        boxShadow: value ? "0 2px 12px rgba(124,58,237,0.4)" : "none",
      }}
    >
      <div style={{
        width: 20, height: 20, background: "#fff", borderRadius: "50%",
        position: "absolute", top: 3, left: value ? 23 : 3,
        transition: "left 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.4)",
      }} />
    </button>
  );

  const Stepper = ({ value, min, max, step = 1, onChange, disabled }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: disabled ? 0.45 : 1 }}>
      <button
        className="btn-press"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
        style={{
          width: 34, height: 34, borderRadius: 9,
          background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)",
          color: "var(--text-primary)", fontSize: 20, cursor: disabled ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500,
          fontFamily: "var(--font-body)",
          opacity: value <= min ? 0.35 : 1,
          transition: "opacity 0.15s",
        }}
      >−</button>
      <span style={{ fontSize: 20, fontWeight: 700, minWidth: 28, textAlign: "center", fontFamily: "var(--font-display)" }}>{value}</span>
      <button
        className="btn-press"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
        style={{
          width: 34, height: 34, borderRadius: 9,
          background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)",
          color: "var(--text-primary)", fontSize: 20, cursor: disabled ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500,
          fontFamily: "var(--font-body)",
          opacity: value >= max ? 0.35 : 1,
          transition: "opacity 0.15s",
        }}
      >+</button>
    </div>
  );

  const SettingRow = ({ icon, label, sub, right, last }) => (
    <div style={{
      ...s.row,
      padding: "13px 0",
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        {icon && <span style={{ fontSize: 16, opacity: 0.8 }}>{icon}</span>}
        <div>
          <div style={{ fontWeight: 500, fontSize: 14, color: "var(--text-primary)" }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );

  const ExitBtn = () => (
    <button
      className="btn-press"
      onClick={() => setShowExitConfirm(true)}
      style={{
        background: "var(--red-dim)",
        border: "1px solid var(--red-border)",
        borderRadius: "var(--radius-sm)",
        padding: "6px 12px",
        color: "var(--red)",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "var(--font-body)",
        cursor: "pointer",
        letterSpacing: "0.2px",
      }}
    >
      Exit
    </button>
  );

  const ExitModal = () => !showExitConfirm ? null : (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(7,8,15,0.85)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 1000, padding: "0 0 24px",
      backdropFilter: "blur(8px)",
    }}>
      <div className="anim-slide-up" style={{
        width: "100%", maxWidth: 430,
        background: "var(--surface-2)",
        border: "1px solid var(--border-2)",
        borderRadius: "var(--radius-xl) var(--radius-xl) var(--radius-lg) var(--radius-lg)",
        padding: 28,
      }}>
        <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>🚪</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.3px" }}>
          Exit game?
        </div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
          This ends the current game for everyone and returns to the lobby.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-press hoverable" onClick={() => setShowExitConfirm(false)} style={{ ...s.btnGhost, flex: 1, padding: "13px 0" }}>
            Keep playing
          </button>
          <button className="btn-press" onClick={() => { setShowExitConfirm(false); resetAll(); }} style={{ ...s.btnDanger, flex: 1, padding: "13px 0" }}>
            Exit game
          </button>
        </div>
      </div>
    </div>
  );

  const TimerBar = ({ timeLeft: tl, totalTime }) => {
    const pct = tl != null ? Math.round((tl / totalTime) * 100) : 100;
    const urgent = tl != null && tl <= 15;
    return (
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 10 }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: urgent ? "var(--red)" : "var(--violet)",
          borderRadius: 2,
          transition: "width 1s linear, background 0.4s ease",
          boxShadow: urgent ? "0 0 8px rgba(239,68,68,0.6)" : "none",
        }} />
      </div>
    );
  };

  const RoundBadge = () => (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-muted)",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid var(--border)",
      borderRadius: 6,
      padding: "3px 8px",
      fontFamily: "var(--font-body)",
    }}>
      Round {currentRound}/{settings.numberOfRounds}
    </span>
  );

  // ─── LANDING (no room) ────────────────────────────────────────────────────
  if (!roomId) return (
    <div style={s.wrap}>
      <div className="screen">
        {/* Ambient background */}
        <div style={{
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
          width: 400, height: 400,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 68%)",
          pointerEvents: "none",
          animation: "ambientGlow 6s ease-in-out infinite",
        }} />

        {/* Hero */}
        <div className="anim-fade-up" style={{ textAlign: "center", padding: "72px 24px 36px" }}>
          <div style={{ fontSize: 76, lineHeight: 1, marginBottom: 20 }}>🕵️</div>
          <h1 className="display" style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 10,
            color: "var(--text-primary)",
          }}>
            Impostor
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Social deduction. One phone or many.
          </p>
        </div>

        {/* Actions */}
        <div style={{ ...s.px, display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-press anim-fade-up delay-1" style={s.btnGold} onClick={handleCreateRoom}>
            Create room
          </button>

          <div className="anim-fade-up delay-2" style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...s.input, flex: 1, textAlign: "center", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 700, fontFamily: "var(--font-display)" }}
              placeholder="ROOM CODE"
              maxLength={4}
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleJoinRoom()}
            />
            <button className="btn-press hoverable" onClick={handleJoinRoom} style={{
              ...s.btnGhost,
              width: "auto",
              padding: "13px 20px",
              flexShrink: 0,
            }}>
              Join
            </button>
          </div>

          <button className="btn-press anim-fade-up delay-3" onClick={() => setLocalScreen("howto")} style={{
            ...s.btnGhost, marginTop: 4,
          }}>
            How to play
          </button>
        </div>
      </div>
    </div>
  );

  // ─── HOW TO PLAY ──────────────────────────────────────────────────────────
  if (localScreen === "howto") {
    const steps = [
      { icon: "⚙️", step: "01", title: "Setup the room", desc: "Create a room and share the 4-letter code. Each player joins on their own device — or pass one phone around." },
      { icon: "👁️", step: "02", title: "Reveal your role", desc: "Tap your name to see your word privately. Impostors only know the category." },
      { icon: "💬", step: "03", title: "Give clues", desc: "Take turns giving one word that relates to the secret word. Don't be too obvious." },
      { icon: "🗳️", step: "04", title: "Vote and reveal", desc: "Vote for whoever you think is the impostor. The most-voted player is eliminated." },
    ];
    return (
      <div style={s.wrap}>
        <div className="screen">
          <div style={s.header}>
            <button className="btn-press" style={s.btnIcon} onClick={() => setLocalScreen(globalPhaseRef.current || "home")}>‹</button>
            <div style={s.headerTitle}>How to Play</div>
          </div>
          <div style={{ padding: "20px var(--page-px) 0", display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map((st, i) => (
              <div key={i} className={`anim-fade-up delay-${i + 1}`} style={s.card}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    fontSize: 24, lineHeight: 1, width: 44, height: 44,
                    borderRadius: 12, background: "var(--surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>{st.icon}</div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "1px", marginBottom: 4 }}>
                      STEP {st.step}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 5, letterSpacing: "-0.2px" }}>
                      {st.title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{st.desc}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Scoring */}
            <div className="anim-fade-up delay-5" style={s.cardGold}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.2px" }}>
                🏆 Scoring
              </div>
              {[
                ["All impostors caught", "+2 pts each civilian"],
                ["Impostor survives", "+3 pts impostor"],
                ["Partial catch", "+2 free impostor, +1 catching civilian"],
              ].map(([when, pts]) => (
                <div key={when} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(245,158,11,0.1)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{when}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", fontFamily: "var(--font-body)" }}>{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SETTINGS ─────────────────────────────────────────────────────────────
  if (localScreen === "settings") {
    const displayCount = Math.max(3, playersData.length);
    const maxImpFixed = calcMaxImp(displayCount);
    const balancedCount = Math.max(1, Math.round(displayCount / 4));

    return (
      <div style={s.wrap}>
        <div className="screen">
          <div style={s.header}>
            <button className="btn-press" style={s.btnIcon} onClick={() => setLocalScreen(globalPhaseRef.current || "home")}>‹</button>
            <div style={s.headerTitle}>Settings</div>
          </div>

          {!isHost && (
            <div className="anim-fade-up" style={{
              margin: "12px 20px 0",
              background: "var(--red-dim)", border: "1px solid var(--red-border)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px", fontSize: 12, color: "var(--red)", fontWeight: 600,
              textAlign: "center",
            }}>
              Only the host can change settings
            </div>
          )}

          {/* Tab bar */}
          <div style={{
            display: "flex", margin: "14px 20px 0",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: 4, gap: 3,
          }}>
            {[["game", "Game"], ["impostor", "Impostor"], ["categories", "Categories"]].map(([tab, label]) => (
              <button key={tab} onClick={() => setSettingsTab(tab)} style={{
                flex: 1, padding: "8px 0", borderRadius: 10,
                border: settingsTab === tab ? "1px solid var(--violet-border)" : "none",
                background: settingsTab === tab ? "var(--violet-dim)" : "transparent",
                color: settingsTab === tab ? "var(--violet-light)" : "var(--text-muted)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "all 0.18s ease",
              }}>{label}</button>
            ))}
          </div>

          <div style={{ padding: "14px 20px 0", flex: 1, overflowY: "auto" }}>

            {/* ── GAME TAB ── */}
            {settingsTab === "game" && (
              <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ ...s.card, marginBottom: 0, textAlign: "center", padding: "18px 14px" }}>
                    <span style={s.eyebrow}>Players</span>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                      {playersData.length}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>in lobby</div>
                  </div>
                  <div style={{ ...s.card, marginBottom: 0, textAlign: "center", padding: "18px 14px" }}>
                    <span style={s.eyebrow}>Rounds</span>
                    <Stepper value={settings.numberOfRounds} min={1} max={10} onChange={v => setSetting("numberOfRounds", v)} disabled={!isHost} />
                  </div>
                </div>
                <div style={s.card}>
                  <SettingRow icon="⏱" label="Round time" sub={`${settings.roundTime} seconds of discussion`}
                    right={<Stepper value={settings.roundTime} min={20} max={180} step={10} onChange={v => setSetting("roundTime", v)} disabled={!isHost} />} />
                  <SettingRow icon="🗳" label="Voting time" sub={`${settings.votingTime} seconds to vote`}
                    right={<Stepper value={settings.votingTime} min={15} max={90} step={5} onChange={v => setSetting("votingTime", v)} disabled={!isHost} />}
                    last />
                </div>
              </div>
            )}

            {/* ── IMPOSTOR TAB ── */}
            {settingsTab === "impostor" && (
              <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Fixed */}
                <div
                  onClick={() => isHost && setSetting("impostorMode", "fixed")}
                  className="hoverable"
                  style={{
                    ...s.card,
                    marginBottom: 0,
                    cursor: isHost ? "pointer" : "default",
                    border: settings.impostorMode === "fixed" ? "1px solid var(--violet-border)" : "1px solid var(--border)",
                    background: settings.impostorMode === "fixed" ? "var(--violet-dim)" : "var(--surface)",
                  }}
                >
                  <div style={s.row}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Fixed count</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Same number of impostors every round</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: settings.impostorMode === "fixed" ? "6px solid var(--violet)" : "2px solid var(--border-2)",
                      transition: "border 0.2s ease", flexShrink: 0,
                    }} />
                  </div>
                  {settings.impostorMode === "fixed" && (
                    <div className="anim-scale-in" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <Stepper value={Math.min(settings.impostorCount, maxImpFixed)} min={1} max={maxImpFixed} onChange={v => setSetting("impostorCount", v)} disabled={!isHost} />
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {Math.min(settings.impostorCount, maxImpFixed)} of {displayCount} players
                      </div>
                    </div>
                  )}
                </div>

                {/* Random */}
                <div
                  onClick={() => isHost && setSetting("impostorMode", "random")}
                  className="hoverable"
                  style={{
                    ...s.card,
                    marginBottom: 0,
                    cursor: isHost ? "pointer" : "default",
                    border: settings.impostorMode === "random" ? "1px solid var(--violet-border)" : "1px solid var(--border)",
                    background: settings.impostorMode === "random" ? "var(--violet-dim)" : "var(--surface)",
                  }}
                >
                  <div style={s.row}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Random count</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Different each round</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: settings.impostorMode === "random" ? "6px solid var(--violet)" : "2px solid var(--border-2)",
                      transition: "border 0.2s ease", flexShrink: 0,
                    }} />
                  </div>
                  {settings.impostorMode === "random" && (
                    <div className="anim-scale-in" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                        {[["balanced", "Balanced"], ["chaos", "Chaos"], ["custom", "Custom"]].map(([mode, label]) => (
                          <button key={mode}
                            onClick={e => { e.stopPropagation(); setSetting("impostorRandomMode", mode); }}
                            style={{
                              flex: 1, padding: "8px 0", borderRadius: 10,
                              border: settings.impostorRandomMode === mode ? "1px solid var(--violet-border)" : "1px solid var(--border)",
                              background: settings.impostorRandomMode === mode ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                              color: settings.impostorRandomMode === mode ? "var(--violet-light)" : "var(--text-muted)",
                              fontSize: 12, fontWeight: 600, cursor: isHost ? "pointer" : "default",
                              fontFamily: "var(--font-body)",
                              transition: "all 0.18s ease",
                              opacity: isHost ? 1 : 0.5,
                            }}>{label}</button>
                        ))}
                      </div>

                      {settings.impostorRandomMode === "custom" && (
                        <div className="anim-scale-in" style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, textAlign: "center" }}>
                            Set the range — 0 means no impostors possible
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Min</div>
                              <Stepper value={settings.impostorCustomMin} min={0} max={settings.impostorCustomMax} onChange={v => setSetting("impostorCustomMin", v)} disabled={!isHost} />
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: 18 }}>→</div>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Max</div>
                              <Stepper value={settings.impostorCustomMax} min={settings.impostorCustomMin} max={displayCount} onChange={v => setSetting("impostorCustomMax", v)} disabled={!isHost} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{
                        fontSize: 12, fontWeight: 600, color: "var(--violet-light)",
                        background: "rgba(124,58,237,0.1)", borderRadius: 8,
                        padding: "8px 14px", textAlign: "center", marginBottom: 12,
                      }}>
                        {settings.impostorRandomMode === "balanced"
                          ? `~${balancedCount} impostor${balancedCount !== 1 ? "s" : ""} per round`
                          : settings.impostorRandomMode === "chaos"
                          ? `0 to ${displayCount} impostors — anything goes`
                          : `${settings.impostorCustomMin}–${Math.min(settings.impostorCustomMax, displayCount)} impostors`}
                      </div>

                      <SettingRow
                        icon="👁"
                        label="Show impostor count to civilians"
                        right={<Toggle value={settings.showImpostorCount} onChange={v => setSetting("showImpostorCount", v)} disabled={!isHost} />}
                        last
                      />
                    </div>
                  )}
                </div>

                <div style={s.card}>
                  <SettingRow icon="📂" label="Show category to impostor" right={<Toggle value={settings.showCategoryToImpostor} onChange={v => setSetting("showCategoryToImpostor", v)} disabled={!isHost} />} />
                  <SettingRow icon="💡" label="Show hint to impostor" sub="A vague hint about the topic" right={<Toggle value={settings.showHintToImpostor} onChange={v => setSetting("showHintToImpostor", v)} disabled={!isHost} />} />
                  <SettingRow icon="👥" label="Impostors know each other" right={<Toggle value={settings.impostorsKnowEachOther} onChange={v => setSetting("impostorsKnowEachOther", v)} disabled={!isHost} />} last />
                </div>
              </div>
            )}

            {/* ── CATEGORIES TAB ── */}
            {settingsTab === "categories" && (
              <div className="anim-fade-in">
                <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
                  <button className="btn-press" style={{ ...s.btnGhost, width: "auto", padding: "7px 14px", fontSize: 13 }}
                    disabled={!isHost} onClick={() => setSetting("selectedCategories", ALL_CATEGORIES)}>All</button>
                  <button className="btn-press" style={{ ...s.btnGhost, width: "auto", padding: "7px 14px", fontSize: 13 }}
                    disabled={!isHost} onClick={() => setSetting("selectedCategories", [])}>None</button>
                  <div style={{ flex: 1, textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>
                    {settings.selectedCategories.length} / {ALL_CATEGORIES.length}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {ALL_CATEGORIES.map(cat => {
                    const sel = settings.selectedCategories.includes(cat);
                    return (
                      <div key={cat}
                        className="btn-press hoverable"
                        onClick={() => isHost && setSetting("selectedCategories",
                          sel ? settings.selectedCategories.filter(c => c !== cat)
                              : [...settings.selectedCategories, cat]
                        )}
                        style={{
                          background: sel ? "var(--violet-dim)" : "var(--surface)",
                          border: sel ? "1px solid var(--violet-border)" : "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          padding: "12px 14px",
                          cursor: isHost ? "pointer" : "default",
                          display: "flex", alignItems: "center", gap: 8,
                          opacity: !isHost && !sel ? 0.45 : 1,
                        }}
                      >
                        <span style={{ fontSize: 18, lineHeight: 1 }}>{WORD_DATA[cat].icon}</span>
                        <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? "var(--violet-light)" : "var(--text-secondary)" }}>
                          {cat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── LOBBY ────────────────────────────────────────────────────────────────
  if (localScreen === "lobby") return (
    <div style={s.wrap}>
      <div className="screen">
        {/* Room code hero */}
        <div className="anim-fade-up" style={{ textAlign: "center", padding: "44px 24px 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 10 }}>
            Room code
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "8px",
            color: "var(--gold)",
            lineHeight: 1,
          }}>
            {roomId}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            Share this with friends to join
          </div>
        </div>

        {/* Add player */}
        <div style={{ ...s.px, marginBottom: 16 }} className="anim-fade-up delay-1">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...s.input, flex: 1 }}
              placeholder="Your name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddPlayer()}
            />
            <button className="btn-press" onClick={handleAddPlayer} style={{
              ...s.btnGold, width: "auto", padding: "13px 18px",
            }}>Add</button>
          </div>
        </div>

        {/* Player list */}
        <div style={{ ...s.px, flex: 1, overflowY: "auto" }}>
          {playersData.length === 0 ? (
            <div style={{
              textAlign: "center", color: "var(--text-muted)", padding: "32px 0",
              fontSize: 14, border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)",
            }}>
              No players yet — add your name above
            </div>
          ) : (
            playersData.map((p, i) => {
              const isMine = p.ownerId === localDeviceId;
              return (
                <div key={i} className={`anim-fade-up delay-${Math.min(i + 1, 6)}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  background: isMine ? "var(--green-dim)" : "var(--surface)",
                  border: `1px solid ${isMine ? "var(--green-border)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)", marginBottom: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: isMine ? "var(--green-dim)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${isMine ? "var(--green-border)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: isMine ? "var(--green)" : "var(--text-secondary)",
                      fontFamily: "var(--font-display)",
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontWeight: 500, color: isMine ? "var(--green)" : "var(--text-primary)", fontSize: 15 }}>
                      {p.name}
                    </span>
                    {isMine && <span style={{ fontSize: 10, color: "var(--green)", background: "var(--green-dim)", borderRadius: 5, padding: "2px 6px", fontWeight: 700, letterSpacing: "0.5px" }}>YOU</span>}
                    {i === 0 && isHost && <span style={{ fontSize: 10, color: "var(--gold)", background: "var(--gold-dim)", borderRadius: 5, padding: "2px 6px", fontWeight: 700, letterSpacing: "0.5px" }}>HOST</span>}
                  </div>
                  {(isHost || isMine) && (
                    <button className="btn-press" onClick={() => handleRemovePlayer(i)} style={{
                      background: "transparent", border: "none",
                      color: "var(--text-muted)", cursor: "pointer", fontSize: 18, padding: "0 4px",
                      lineHeight: 1,
                    }}>×</button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom actions */}
        <div style={{ ...s.px, display: "flex", flexDirection: "column", gap: 10, paddingTop: 16 }} className="anim-fade-up delay-2">
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-press hoverable" style={{ ...s.btnGhost, flex: 1 }} onClick={() => setLocalScreen("settings")}>
              ⚙ Settings
            </button>
            <button className="btn-press hoverable" style={{ ...s.btnGhost, flex: 1 }} onClick={() => setLocalScreen("howto")}>
              ? How to play
            </button>
          </div>
          {isHost ? (
            <button
              className="btn-press"
              style={{ ...s.btnGold, opacity: playersData.length >= 3 ? 1 : 0.45 }}
              onClick={startGame}
              disabled={playersData.length < 3}
            >
              {playersData.length < 3 ? `Need ${3 - playersData.length} more player${3 - playersData.length !== 1 ? "s" : ""}` : "Start game"}
            </button>
          ) : (
            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>
              Waiting for host to start…
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── WORD REVEAL — Name picker ────────────────────────────────────────────
  if (localScreen === "reveal" && gameState) {
    const allRevealed = revealedSet.size === playersData.length;

    if (!revealPlayer) return (
      <div style={s.wrap}>
        <div className="screen">
          <ExitModal />
          <div style={{ padding: "20px var(--page-px) 0" }}>
            <div style={{ ...s.row, marginBottom: 14 }}>
              <div>
                <RoundBadge />
                <h2 className="display" style={{ fontSize: 24, fontWeight: 800, marginTop: 8, letterSpacing: "-0.5px", lineHeight: 1 }}>
                  Pick your name
                </h2>
              </div>
              <ExitBtn />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Tap your name to see your role privately, then pass the phone.
            </p>
          </div>

          <div style={{ padding: "16px var(--page-px) 0", flex: 1, overflowY: "auto" }}>
            {playersData.map((p, i) => {
              const name = p.name;
              const done = revealedSet.has(name);
              const isMyDevice = p.ownerId === localDeviceId;
              return (
                <button key={i}
                  className={`btn-press anim-fade-up delay-${Math.min(i + 1, 6)}`}
                  disabled={done || !isMyDevice}
                  onClick={() => { setRevealPlayer(name); setShowWord(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px",
                    background: done ? "var(--green-dim)" : isMyDevice ? "var(--surface)" : "rgba(255,255,255,0.02)",
                    border: done ? "1px solid var(--green-border)" : isMyDevice ? "1px solid var(--border-2)" : "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: 8, cursor: done || !isMyDevice ? "default" : "pointer",
                    width: "100%", textAlign: "left",
                    opacity: !isMyDevice && !done ? 0.5 : 1,
                    transition: "all 0.18s ease",
                  }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: done ? "var(--green-dim)" : isMyDevice ? "var(--violet-dim)" : "rgba(255,255,255,0.04)",
                    border: done ? "1px solid var(--green-border)" : isMyDevice ? "1px solid var(--violet-border)" : "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: done ? "var(--green)" : isMyDevice ? "var(--violet-light)" : "var(--text-muted)",
                    fontFamily: "var(--font-display)",
                  }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: done ? "var(--green)" : "var(--text-primary)" }}>{name}</div>
                    <div style={{ fontSize: 12, color: done ? "var(--green)" : isMyDevice ? "var(--violet-light)" : "var(--text-muted)", marginTop: 2 }}>
                      {done ? "Role revealed" : isMyDevice ? "Tap to reveal" : "Waiting for them…"}
                    </div>
                  </div>
                  {(!done && isMyDevice) && <span style={{ color: "var(--text-muted)", fontSize: 20, lineHeight: 1 }}>›</span>}
                </button>
              );
            })}
          </div>

          <div style={{ ...s.px, paddingTop: 16 }}>
            {allRevealed
              ? isHost
                ? <button className="btn-press" style={s.btnGold} onClick={() => pushUpdate({ gamePhase: "game" })}>
                    Start discussion →
                  </button>
                : <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>Waiting for host…</div>
              : <div style={{
                  textAlign: "center", fontSize: 13, color: "var(--text-muted)",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "14px",
                }}>
                  {playersData.length - revealedSet.size} player{playersData.length - revealedSet.size !== 1 ? "s" : ""} still need to reveal
                </div>
            }
          </div>
        </div>
      </div>
    );

    // Individual role reveal
    const isImp = gameState.impostors.includes(revealPlayer);
    return (
      <div style={s.wrap}>
        <div className="screen">
          <ExitModal />
          <div style={{ ...s.row, padding: "20px var(--page-px) 0" }}>
            <button className="btn-press" style={s.btnIcon} onClick={() => { setRevealPlayer(null); setShowWord(false); }}>‹</button>
            <ExitBtn />
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 24px 32px" }}>
            <RoundBadge />

            {!showWord ? (
              <div className="anim-scale-in" style={{ textAlign: "center", width: "100%", marginTop: 24 }}>
                <div style={{
                  fontSize: 72, lineHeight: 1, marginBottom: 20, display: "inline-block",
                  animation: "ambientGlow 3s ease-in-out infinite",
                }}>🔒</div>
                <h2 className="display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" }}>
                  {revealPlayer}
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32, lineHeight: 1.5 }}>
                  Tap below to reveal your role privately.
                </p>
                <button className="btn-press" style={{
                  ...s.btnGold,
                  animation: "lockPulse 2.5s ease infinite",
                }} onClick={() => setShowWord(true)}>
                  Reveal my role
                </button>
              </div>
            ) : (
              <div className="anim-celebrate" style={{ width: "100%", textAlign: "center", marginTop: 24 }}>
                {isImp ? (
                  <>
                    <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}>🕵️</div>
                    <div style={{
                      display: "inline-block",
                      background: "var(--red-dim)", border: "1px solid var(--red-border)",
                      borderRadius: "var(--radius-sm)", padding: "5px 14px",
                      fontSize: 11, fontWeight: 700, color: "var(--red)",
                      textTransform: "uppercase", letterSpacing: "1px", marginBottom: 20,
                    }}>
                      You are the impostor
                    </div>

                    {settings.showCategoryToImpostor && (
                      <div style={{ ...s.card, textAlign: "left", marginBottom: 10 }}>
                        <span style={s.eyebrow}>Category</span>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>
                          {WORD_DATA[gameState.category].icon} {gameState.category}
                        </div>
                      </div>
                    )}
                    {settings.showHintToImpostor && (
                      <div style={{ ...s.card, textAlign: "left", marginBottom: 10 }}>
                        <span style={s.eyebrow}>Hint</span>
                        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                          Think about things related to {gameState.category.toLowerCase()}.
                        </div>
                      </div>
                    )}
                    {settings.impostorsKnowEachOther && gameState.impostors.length > 1 && (
                      <div style={{ background: "var(--red-dim)", border: "1px solid var(--red-border)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 10, textAlign: "left" }}>
                        <span style={{ ...s.eyebrow, color: "var(--red)" }}>Fellow impostors</span>
                        {gameState.impostors.filter(p => p !== revealPlayer).map(p => (
                          <div key={p} style={{ fontWeight: 600, fontSize: 15, padding: "4px 0" }}>{p}</div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}>✅</div>
                    <div style={{
                      display: "inline-block",
                      background: "var(--green-dim)", border: "1px solid var(--green-border)",
                      borderRadius: "var(--radius-sm)", padding: "5px 14px",
                      fontSize: 11, fontWeight: 700, color: "var(--green)",
                      textTransform: "uppercase", letterSpacing: "1px", marginBottom: 20,
                    }}>
                      Civilian
                    </div>
                    <div style={{ ...s.card, textAlign: "left", marginBottom: 10 }}>
                      <span style={s.eyebrow}>Your secret word</span>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1, marginBottom: 6 }}>
                        {gameState.secretWord}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {WORD_DATA[gameState.category].icon} {gameState.category}
                      </div>
                    </div>
                  </>
                )}

                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, marginTop: 10, lineHeight: 1.5 }}>
                  Memorise your role, then pass the phone.
                </p>
                <button className="btn-press" style={s.btnGold} onClick={() => {
                  pushUpdate({ revealedSet: [...Array.from(revealedSet), revealPlayer] });
                  setRevealPlayer(null);
                  setShowWord(false);
                }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── DISCUSSION ───────────────────────────────────────────────────────────
  if (localScreen === "game" && gameState) {
    const urgent = timeLeft != null && timeLeft <= 15;
    return (
      <div style={s.wrap}>
        <div className="screen">
          <ExitModal />

          {/* Top bar */}
          <div style={{ padding: "20px var(--page-px) 0" }}>
            <div style={{ ...s.row, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RoundBadge />
                <ExitBtn />
              </div>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: 36, fontWeight: 800, lineHeight: 1,
                color: urgent ? "var(--red)" : "var(--text-primary)",
                animation: urgent ? "timerUrgent 1s ease infinite" : "none",
                fontVariantNumeric: "tabular-nums",
              }}>
                {timeLeft}s
              </div>
            </div>
            <TimerBar timeLeft={timeLeft} totalTime={settings.roundTime} />
          </div>

          <div style={{ flex: 1, padding: "16px var(--page-px) 0", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Category */}
            <div className="anim-scale-in" style={s.cardViolet}>
              <span style={s.eyebrow}>Category</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>
                {WORD_DATA[gameState.category].icon} {gameState.category}
              </div>
              {settings.showImpostorCount && (
                <div style={{ fontSize: 12, color: "var(--violet-light)", marginTop: 8 }}>
                  {gameState.impostorCount} impostor{gameState.impostorCount !== 1 ? "s" : ""} among you
                </div>
              )}
            </div>

            {/* Players */}
            <div className="anim-fade-up delay-2" style={s.card}>
              <span style={s.eyebrow}>Players</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {playerNames.map((p, i) => (
                  <span key={i} style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "5px 11px", fontSize: 13, fontWeight: 500,
                  }}>{p}</span>
                ))}
              </div>
            </div>

            {/* Instruction */}
            <div className="anim-fade-up delay-3" style={{
              ...s.card,
              background: "transparent",
              border: "1px dashed var(--border)",
            }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Each player gives one word as a clue. Be specific enough to signal you know the word — vague enough to fool the impostor.
              </p>
            </div>
          </div>

          <div style={{ ...s.px, paddingTop: 16 }}>
            {isHost ? (
              <button className="btn-press" style={s.btnGold} onClick={() => pushUpdate({ gamePhase: "vote" })}>
                Go to vote →
              </button>
            ) : (
              <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>
                Waiting for host to end discussion…
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── VOTE ─────────────────────────────────────────────────────────────────
  if (localScreen === "vote" && gameState) {
    const toggleVote = (voter, suspect) => {
      const cur = votes[voter] ? Array.from(votes[voter]) : [];
      const next = cur.includes(suspect) ? cur.filter(v => v !== suspect) : [...cur, suspect];
      pushUpdate({ [`votes/${voter}`]: next });
    };
    const voterDone = (voter) => { const v = votes[voter]; return v && v.size >= 1; };
    const allVoted = playerNames.every(voterDone);

    return (
      <div style={s.wrap}>
        <div className="screen">
          <ExitModal />
          <div style={{ padding: "20px var(--page-px) 10px" }}>
            <div style={{ ...s.row, marginBottom: 10 }}>
              <div>
                <h2 className="display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>
                  Vote
                </h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  Select everyone you think is an impostor
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ExitBtn />
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28, fontWeight: 800, lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  color: timeLeft != null && timeLeft <= 15 ? "var(--red)" : "var(--text-primary)",
                }}>{timeLeft}s</div>
              </div>
            </div>
            <TimerBar timeLeft={timeLeft} totalTime={settings.votingTime} />
          </div>

          <div style={{ padding: "0 var(--page-px)", flex: 1, overflowY: "auto" }}>
            {playersData.map((voterObj, vi) => {
              const voter = voterObj.name;
              const myVotes = votes[voter] || new Set();
              const done = voterDone(voter);
              const isMyDevice = voterObj.ownerId === localDeviceId;

              return (
                <div key={vi} className={`anim-fade-up delay-${Math.min(vi + 1, 6)}`}
                  style={{ marginBottom: 20, opacity: isMyDevice ? 1 : 0.55 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--violet-light)" }}>
                      {voter} {isMyDevice ? "(You)" : ""}
                    </span>
                    {done
                      ? <span style={{ fontSize: 11, color: "var(--green)", background: "var(--green-dim)", borderRadius: 5, padding: "2px 6px", fontWeight: 700 }}>✓ Voted</span>
                      : <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{myVotes.size} selected</span>
                    }
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {playersData.filter(p => p.name !== voter).map((suspectObj, si) => {
                      const suspect = suspectObj.name;
                      const sel = myVotes.has(suspect);
                      return (
                        <button key={si}
                          className="btn-press"
                          disabled={!isMyDevice}
                          onClick={() => toggleVote(voter, suspect)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px",
                            background: sel ? "var(--violet-dim)" : "var(--surface)",
                            border: sel ? "1px solid var(--violet-border)" : "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            cursor: isMyDevice ? "pointer" : "default",
                            color: sel ? "var(--violet-light)" : "var(--text-primary)",
                            fontSize: 14, fontWeight: sel ? 600 : 400,
                            fontFamily: "var(--font-body)",
                            textAlign: "left", width: "100%",
                            transition: "all 0.16s ease",
                          }}>
                          <span>{suspect}</span>
                          {sel && <span className="anim-scale-in" style={{ fontSize: 14, color: "var(--violet-light)" }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ ...s.px, paddingTop: 10 }}>
            {isHost ? (
              <button className="btn-press" style={{ ...s.btnGold, opacity: allVoted ? 1 : 0.45 }}
                onClick={submitVotes} disabled={!allVoted}>
                {allVoted
                  ? "Reveal results →"
                  : `${playerNames.filter(p => !voterDone(p)).length} player${playerNames.filter(p => !voterDone(p)).length !== 1 ? "s" : ""} haven't voted`}
              </button>
            ) : (
              <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>
                Waiting for host to reveal…
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────────────────────
  if (localScreen === "result" && gameState && roundResults) {
    const tally = roundResults.tally || {};
    const caught = roundResults.caughtImpostors || [];
    const allCaught = !!roundResults.allCaught;
    const noCaught = caught.length === 0;

    const outcome = allCaught ? "win" : noCaught ? "lose" : "partial";
    const emoji = outcome === "win" ? "🎉" : outcome === "lose" ? "💀" : "🤝";
    const headline = outcome === "win"
      ? (gameState.impostors.length > 1 ? "All impostors caught!" : "Impostor caught!")
      : outcome === "lose"
      ? (gameState.impostors.length > 1 ? "Impostors win!" : "Impostor wins!")
      : `${caught.length} of ${gameState.impostors.length} caught`;
    const sub = outcome === "win"
      ? "Civilians earn +2 pts each"
      : outcome === "lose"
      ? "Impostors each earn +3 pts"
      : "Partial catch — free impostors +2, catching civilians +1";

    return (
      <div style={s.wrap}>
        <div className="screen">
          <ExitModal />
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px var(--page-px) 0" }}>
            <ExitBtn />
          </div>

          {/* Outcome hero */}
          <div style={{ padding: "24px var(--page-px) 16px", textAlign: "center" }}>
            <div className="anim-celebrate" style={{ fontSize: 64, lineHeight: 1, marginBottom: 14 }}>{emoji}</div>
            <h2 className="display anim-fade-up delay-1" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6, lineHeight: 1.1 }}>
              {headline}
            </h2>
            <p className="anim-fade-up delay-2" style={{ fontSize: 13, color: "var(--text-muted)" }}>{sub}</p>
          </div>

          <div style={{ padding: "0 var(--page-px)", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Secret word */}
            <div className="anim-fade-up delay-2" style={s.card}>
              <span style={s.eyebrow}>The word was</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1, marginBottom: 4 }}>
                {gameState.secretWord}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {WORD_DATA[gameState.category].icon} {gameState.category}
              </div>
            </div>

            {/* Impostors */}
            <div className="anim-fade-up delay-3" style={s.card}>
              <span style={s.eyebrow}>Impostor{gameState.impostors.length > 1 ? "s" : ""}</span>
              {gameState.impostors.map((p, i) => {
                const wasCaught = caught.includes(p);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: i < gameState.impostors.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{
                        background: "var(--red-dim)", color: "var(--red)",
                        border: "1px solid var(--red-border)", borderRadius: 6,
                        padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
                      }}>IMPOSTOR</span>
                      <span style={{
                        background: wasCaught ? "var(--green-dim)" : "var(--red-dim)",
                        color: wasCaught ? "var(--green)" : "var(--red)",
                        border: wasCaught ? "1px solid var(--green-border)" : "1px solid var(--red-border)",
                        borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
                      }}>{wasCaught ? "CAUGHT" : "FREE"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vote tally */}
            <div className="anim-fade-up delay-4" style={s.card}>
              <span style={s.eyebrow}>Vote tally</span>
              {Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([p, v]) => {
                const isImp = gameState.impostors.includes(p);
                const maxV = Math.max(...Object.values(tally), 1);
                const pct = Math.round((v / maxV) * 100);
                return (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <span style={{ fontWeight: isImp ? 700 : 400, fontSize: 13, flex: 1, color: isImp ? "var(--red)" : "var(--text-primary)" }}>
                      {p}{isImp ? " 🕵️" : ""}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        height: 4, borderRadius: 2,
                        width: `${Math.max(6, pct * 0.8)}%`,
                        background: isImp ? "var(--red)" : "var(--violet)",
                        transition: "width 0.6s ease",
                      }} />
                      <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 20, textAlign: "right" }}>{v}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {isHost ? (
              <button className="btn-press anim-fade-up delay-5" style={s.btnGold} onClick={nextRound}>
                {currentRound >= settings.numberOfRounds ? "View final scores →" : `Next round (${currentRound + 1}/${settings.numberOfRounds}) →`}
              </button>
            ) : (
              <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>
                Waiting for host to continue…
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── SCOREBOARD ───────────────────────────────────────────────────────────
  if (localScreen === "scoreboard") {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const medals = ["🥇", "🥈", "🥉"];

    return (
      <div style={s.wrap}>
        <div className="screen">
          <div style={s.header}>
            <button className="btn-press" style={s.btnIcon} onClick={() => setLocalScreen("lobby")}>‹</button>
            <div style={s.headerTitle}>Final scores</div>
          </div>

          <div style={{ padding: "20px var(--page-px) 0", display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map(([name, score], i) => (
              <div key={name} className={`anim-fade-up delay-${Math.min(i + 1, 6)}`} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                borderRadius: "var(--radius-lg)",
                background: i === 0 ? "var(--gold-dim)" : "var(--surface)",
                border: `1px solid ${i === 0 ? "var(--gold-border)" : "var(--border)"}`,
                boxShadow: i === 0 ? "0 4px 24px rgba(245,158,11,0.12)" : "none",
              }}>
                <div style={{ fontSize: 26, width: 34, textAlign: "center", lineHeight: 1 }}>
                  {medals[i] || <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-muted)" }}>{i + 1}.</span>}
                </div>
                <div style={{ flex: 1, fontWeight: i === 0 ? 700 : 500, fontSize: 15 }}>{name}</div>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28, fontWeight: 800, lineHeight: 1,
                  color: i === 0 ? "var(--gold)" : "var(--text-primary)",
                }}>{score}</div>
              </div>
            ))}
          </div>

          <div style={{ ...s.px, marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {isHost ? (
              <button className="btn-press" style={s.btnGold} onClick={() => pushUpdate({ gamePhase: "lobby", scores: {}, currentRound: 1, gameState: null, votes: {} })}>
                Play again
              </button>
            ) : (
              <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>
                Waiting for host…
              </div>
            )}
            <button className="btn-press hoverable" style={s.btnGhost} onClick={() => setLocalScreen("lobby")}>
              Back to lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}