import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue, set, get, update } from "firebase/database";

// ─── Firebase Sync Helper ─────────────────────────────────────────────────────
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

const calcMaxImp = (playerCount) => Math.max(1, playerCount - 1); 

const DEFAULT_SETTINGS = {
  roundTime: 60,
  votingTime: 30,
  numberOfRounds: 1,
  gameMode: "word",
  impostorMode: "random",
  impostorCount: 1,
  impostorRandomMode: "balanced",
  impostorCustomMin: 0,
  impostorCustomMax: 4,
  showImpostorCount: false,
  impostorNeverGoesFirst: false,
  selectedCategories: ALL_CATEGORIES.slice(0, 6),
  showCategoryToImpostor: true,
  showHintToImpostor: false,
  impostorsKnowEachOther: true,
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

// ─── CSS (Scrollbar and iOS Zoom fixes added) ─────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  body{background:#080812;overscroll-behavior:none;-webkit-font-smoothing:antialiased;}
  
  /* Stops double-tap to zoom on mobile */
  button, input, select, textarea { touch-action: manipulation; font-family: inherit; }

  /* Sleek modern scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.82)}to{opacity:1;transform:scale(1)}}
  @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.12)}70%{transform:scale(0.96)}100%{transform:scale(1);opacity:1}}
  @keyframes glowPulse{0%,100%{filter:drop-shadow(0 0 8px rgba(147,51,234,.55))}50%{filter:drop-shadow(0 0 22px rgba(147,51,234,1))}}
  @keyframes timerUrgent{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
  @keyframes ringPulse{0%,100%{box-shadow:0 0 0 0 rgba(147,51,234,.45)}50%{box-shadow:0 0 0 14px rgba(147,51,234,0)}}
  
  .fu{animation:fadeUp .38s ease both}
  .si{animation:scaleIn .32s cubic-bezier(.34,1.56,.64,1) both}
  .bi{animation:bounceIn .48s cubic-bezier(.34,1.56,.64,1) both}
  .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
  .d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}
  
  .press:active{transform:scale(.96);transition:transform .1s}
  .ch{transition:all .2s ease}.ch:active{transform:scale(.97)}
`;

export default function ImposterGame() {
  const localDeviceId = getDeviceId();
  
  // --- MULTIPLAYER ROOM & HOST STATE ---
  const [roomId, setRoomId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [playersData, setPlayersData] = useState([]); 
  const isHost = hostId === localDeviceId;
  
  // --- LOCAL NAVIGATION VS GLOBAL PHASE ---
  const [localScreen, setLocalScreen] = useState("home"); 
  const globalPhaseRef = useRef(null);
  
  // --- SYNCED GAME STATE ---
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [gameState, setGameState] = useState(null);
  const [revealedSet, setRevealedSet] = useState(new Set());
  const [votes, setVotes] = useState({});
  const [scores, setScores] = useState({});
  const [roundResults, setRoundResults] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  
  // --- LOCAL ONLY STATE ---
  const [newName, setNewName] = useState(""); 
  const [revealPlayer, setRevealPlayer] = useState(null);
  const [showWord, setShowWord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [settingsTab, setSettingsTab] = useState("game");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const timerRef = useRef(null);
  
  // Derived state
  const playerNames = playersData.map(p => p.name);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // ─── Firebase Hook ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.hostId) setHostId(data.hostId);
        if (data.settings) setSettings(data.settings);
        if (data.playersData) setPlayersData(data.playersData);
        else setPlayersData([]);
        
        if (data.gamePhase && data.gamePhase !== globalPhaseRef.current) {
          globalPhaseRef.current = data.gamePhase;
          setLocalScreen(data.gamePhase); 
        }

        if (data.gameState !== undefined) setGameState(data.gameState);
        if (data.revealedSet) setRevealedSet(new Set(data.revealedSet));
        else setRevealedSet(new Set());
        
        if (data.votes) {
          const parsedVotes = {};
          Object.keys(data.votes).forEach(v => { parsedVotes[v] = new Set(data.votes[v]); });
          setVotes(parsedVotes);
        } else setVotes({});
        
        if (data.scores) setScores(data.scores);
        else setScores({});
        
        if (data.currentRound) setCurrentRound(data.currentRound);
        if (data.roundResults !== undefined) setRoundResults(data.roundResults);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // Global Timer Controller
  useEffect(() => {
    if (localScreen === "game" && gameState) {
      startTimer(settings.roundTime, () => pushUpdate({ gamePhase: "vote" }));
    } else if (localScreen === "vote") {
      startTimer(settings.votingTime, () => {});
    } else {
      clearInterval(timerRef.current);
    }
  }, [localScreen, gameState, settings.roundTime, settings.votingTime]);

  const pushUpdate = (updates) => {
    if (!roomId) return;
    update(ref(db, `rooms/${roomId}`), updates);
  };

  const handleCreateRoom = async () => {
    const newRoomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    await set(ref(db, `rooms/${newRoomId}`), {
      gamePhase: "lobby",
      hostId: localDeviceId,
      settings: DEFAULT_SETTINGS,
      playersData: [], 
      scores: {},
      currentRound: 1,
      votes: {},
      revealedSet: []
    });
    setRoomId(newRoomId);
  };

  const handleJoinRoom = async () => {
    if (!joinCode) return;
    const code = joinCode.toUpperCase();
    const snapshot = await get(ref(db, `rooms/${code}`));
    if (snapshot.exists()) setRoomId(code);
    else alert("Room not found! Check the code and try again.");
  };

  const setSetting = (k, v) => {
    if (isHost) pushUpdate({ [`settings/${k}`]: v });
  };

  const handleAddPlayer = () => {
    if (!newName.trim()) return;
    if (playersData.some(p => p.name.toLowerCase() === newName.trim().toLowerCase())) {
        alert("That name is already taken!");
        return;
    }
    const newData = [...playersData, { name: newName.trim(), ownerId: localDeviceId }];
    pushUpdate({ playersData: newData });
    setNewName("");
  };

  const handleRemovePlayer = (idx) => {
    const newData = [...playersData];
    newData.splice(idx, 1);
    pushUpdate({ playersData: newData });
  };

  const resolveImpostorCount = (playerCount, cfg) => {
    if (cfg.impostorMode === "fixed") return Math.min(Math.max(1, cfg.impostorCount), calcMaxImp(playerCount));
    if (cfg.impostorRandomMode === "balanced") return Math.max(1, Math.round(playerCount / 4));
    if (cfg.impostorRandomMode === "chaos") return Math.floor(Math.random() * (playerCount + 1));
    const lo = Math.max(0, Math.min(cfg.impostorCustomMin, playerCount));
    const hi = Math.max(lo, Math.min(cfg.impostorCustomMax, playerCount));
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  };

  const startGame = () => {
    if (playersData.length < 3) return;
    const cats = settings.selectedCategories.length ? settings.selectedCategories : ALL_CATEGORIES;
    const cat  = pickRandom(cats);
    const word = pickRandom(WORD_DATA[cat].words);
    const count = resolveImpostorCount(playersData.length, settings);
    const impostors = shuffle([...playerNames]).slice(0, count);
    const assignments = {};
    playerNames.forEach(p => { assignments[p] = impostors.includes(p) ? null : word; });
    
    pushUpdate({
      gameState: { category: cat, secretWord: word, impostors, assignments, impostorCount: count },
      revealedSet: [],
      votes: {},
      roundResults: null,
      gamePhase: "reveal" 
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
    Object.values(votes).forEach(voteSet => {
      voteSet.forEach(suspect => { tally[suspect] = (tally[suspect] || 0) + 1; });
    });

    const maxVotes = Math.max(...Object.values(tally));
    const eliminated = maxVotes > 0 ? Object.keys(tally).filter(p => tally[p] === maxVotes) : [];
    const impostors = gameState.impostors;
    const caughtImpostors = impostors.filter(imp => eliminated.includes(imp));
    const allCaught = caughtImpostors.length === impostors.length;
    const ns = { ...scores };

    if (allCaught) {
      playerNames.filter(p => !impostors.includes(p)).forEach(p => { ns[p] = (ns[p] || 0) + 2; });
    } else if (caughtImpostors.length === 0) {
      impostors.forEach(p => { ns[p] = (ns[p] || 0) + 3; });
    } else {
      impostors.filter(p => !caughtImpostors.includes(p)).forEach(p => { ns[p] = (ns[p] || 0) + 2; });
      playerNames.filter(p => !impostors.includes(p)).forEach(p => {
        const myVotes = votes[p] || new Set();
        if ([...myVotes].some(v => caughtImpostors.includes(v))) ns[p] = (ns[p] || 0) + 1;
      });
    }

    pushUpdate({ scores: ns, roundResults: { tally, eliminated, caughtImpostors, allCaught }, gamePhase: "result" });
  };

  const nextRound = () => {
    if (currentRound >= settings.numberOfRounds) {
      pushUpdate({ gamePhase: "scoreboard" });
    } else {
      pushUpdate({ currentRound: currentRound + 1 });
      startGame();
    }
  };

  const resetAll = () => pushUpdate({ gamePhase: "lobby", scores: {}, currentRound: 1, gameState: null, votes: {} });

  // ─── Styled Components ───────────────────────────────────────────────────────
  const F = { fontFamily: "'Outfit', sans-serif" };
  const wrap  = { minHeight:"100vh", background:"#080812", color:"#e8e4f0", ...F, display:"flex", flexDirection:"column", alignItems:"center" };
  const scr   = { width:"100%", maxWidth:430, minHeight:"100vh", display:"flex", flexDirection:"column", paddingBottom:40, position:"relative", overflow:"hidden" };
  const PX    = { padding:"0 20px" };
  const card  = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:20, marginBottom:12 };
  const cardP = { background:"rgba(147,51,234,0.1)", border:"1px solid rgba(147,51,234,0.28)", borderRadius:20, padding:20, marginBottom:12 };
  const btnP  = { background:"linear-gradient(135deg,#9333ea,#6366f1)", color:"#fff", border:"none", borderRadius:16, padding:"16px 32px", fontSize:16, fontWeight:700, cursor:"pointer", width:"100%", boxShadow:"0 8px 28px rgba(99,102,241,.35)", letterSpacing:"-0.2px", ...F };
  const btnS  = { background:"rgba(255,255,255,0.07)", color:"#e8e4f0", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:"14px 32px", fontSize:15, fontWeight:600, cursor:"pointer", width:"100%", ...F };
  const btnD  = { background:"rgba(239,68,68,0.1)", color:"#f87171", border:"1px solid rgba(239,68,68,0.22)", borderRadius:16, padding:"13px 32px", fontSize:15, fontWeight:600, cursor:"pointer", width:"100%", ...F };
  const ROW   = { display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 };
  const HDR   = { display:"flex", alignItems:"center", padding:"20px 20px 0", gap:12 };
  const BK    = { background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, width:40, height:40, cursor:"pointer", color:"#e8e4f0", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 };
  const TTL   = { fontSize:19, fontWeight:700, flex:1, textAlign:"center", paddingRight:40 };
  
  // NOTE: fontSize: 16 prevents iOS auto-zoom on inputs
  const INP   = { background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"12px 16px", color:"#e8e4f0", fontSize:16, width:"100%", outline:"none", ...F };

  const Toggle = ({ value, onChange, disabled }) => (
    <button onClick={() => !disabled && onChange(!value)} className="press" style={{ width:48, height:26, background:value?"#9333ea":"rgba(255,255,255,0.14)", borderRadius:13, border:"none", cursor:disabled?"default":"pointer", position:"relative", transition:"background .22s", flexShrink:0, opacity: disabled ? 0.5 : 1 }}>
      <div style={{ width:20, height:20, background:"#fff", borderRadius:"50%", position:"absolute", top:3, left:value?25:3, transition:"left .22s", boxShadow:"0 1px 4px rgba(0,0,0,.3)" }} />
    </button>
  );

  const Stepper = ({ value, min, max, step = 1, onChange, disabled }) => (
    <div style={{ display:"flex", alignItems:"center", gap:12, opacity: disabled ? 0.5 : 1 }}>
      <button disabled={disabled} className="press" onClick={() => onChange(Math.max(min, value - step))} style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.1)", border:"none", color:"#e8e4f0", fontSize:22, cursor:disabled?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, ...F }}>−</button>
      <span style={{ fontSize:20, fontWeight:800, minWidth:32, textAlign:"center", ...F }}>{value}</span>
      <button disabled={disabled} className="press" onClick={() => onChange(Math.min(max, value + step))} style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.1)", border:"none", color:"#e8e4f0", fontSize:22, cursor:disabled?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, ...F }}>+</button>
    </div>
  );

  const SRow = ({ icon, label, sub, right }) => (
    <div style={{ ...ROW, padding:"13px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
        {icon && <span style={{ fontSize:17 }}>{icon}</span>}
        <div><div style={{ fontWeight:600, fontSize:15, ...F }}>{label}</div>{sub && <div style={{ color:"#64748b", fontSize:12, marginTop:1, ...F }}>{sub}</div>}</div>
      </div>{right}
    </div>
  );

  const ExitButton = () => (
    <button onClick={() => setShowExitConfirm(true)} className="press" style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.22)", borderRadius:10, padding:"6px 14px", cursor:"pointer", color:"#f87171", fontSize:13, fontWeight:700, ...F }}>✕ Exit</button>
  );

  const ExitConfirmModal = () => !showExitConfirm ? null : (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000, padding:"0 0 28px" }}>
      <div style={{ width:"100%", maxWidth:430, background:"#13131f", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"24px 24px 20px 20px", padding:28 }} className="si">
        <div style={{ fontSize:22, marginBottom:8, lineHeight:1 }}>🚪</div>
        <div style={{ fontWeight:800, fontSize:18, marginBottom:6, ...F }}>Exit Game?</div>
        <div style={{ color:"#64748b", fontSize:14, marginBottom:24, lineHeight:1.6, ...F }}>This ends the current game and returns to the home screen.</div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setShowExitConfirm(false)} className="press" style={{ ...btnS, flex:1, padding:"13px 0" }}>Keep Playing</button>
          <button onClick={() => { setShowExitConfirm(false); resetAll(); }} className="press" style={{ ...btnD, flex:1, padding:"13px 0" }}>Exit Game</button>
        </div>
      </div>
    </div>
  );

  // ─── START SCREEN (No Room) ──────────────────────────────────────────────────
  if (!roomId) return (
    <div style={wrap}><div style={scr}>
      <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:340, height:340, background:"radial-gradient(circle,rgba(147,51,234,.14) 0%,transparent 70%)", pointerEvents:"none" }} />
      <div style={{ textAlign:"center", padding:"60px 24px 28px" }} className="fu">
        <div style={{ fontSize:80, lineHeight: 1, marginBottom:14, display:"inline-block", animation:"glowPulse 3s ease infinite" }}>🕵️</div>
        {/* Added explicit lineHeight: 1.1 to fix mobile overlap */}
        <div style={{ fontSize:44, fontWeight:900, lineHeight: 1.1, letterSpacing:"-1.5px", background:"linear-gradient(135deg,#c084fc 0%,#818cf8 50%,#38bdf8 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:6, ...F }}>Impostor</div>
        <div style={{ color:"#64748b", fontSize:14, ...F }}>Play with friends on multiple devices</div>
      </div>
      <div style={{ ...PX, display:"flex", flexDirection:"column", gap:10 }}>
        <button style={btnP} className="press fu d1" onClick={handleCreateRoom}>➕ Create New Room</button>
        <div style={{ display:"flex", gap:8 }} className="fu d2">
          <input style={{...INP, flex: 1, textTransform: "uppercase", textAlign: "center", fontWeight: "bold", letterSpacing: "2px"}} placeholder="ROOM CODE" maxLength={4} value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button style={{...btnS, width: "auto"}} className="press" onClick={handleJoinRoom}>Join</button>
        </div>
        <button style={{...btnS, marginTop: 10}} className="press fu d3" onClick={() => setLocalScreen("howto")}>❓ How to Play</button>
      </div>
    </div></div>
  );

  // ─── HOW TO PLAY ──────────────────────────────────────────────────────────
  if (localScreen === "howto") {
    const steps = [
      { icon:"⚙️", title:"Setup Game",    desc:"Choose players, categories, and settings. One or more players become secret impostors." },
      { icon:"👁️", title:"Reveal Words",  desc:"Pick your name from the list and view your word privately. Impostors only see the category." },
      { icon:"💬", title:"Give Clues",    desc:"Take turns giving one clue word. Impostors must bluff without knowing the secret word." },
      { icon:"🗳️", title:"Vote",          desc:"Each player votes for up to as many suspects as there are impostors. The most-voted players are eliminated." },
    ];
    return (
      <div style={wrap}><div style={scr}>
        <div style={HDR}><button style={BK} className="press" onClick={() => setLocalScreen(globalPhaseRef.current || "home")}>‹</button><div style={TTL}>How to Play</div></div>
        <div style={{ padding:"20px 20px 0", display:"flex", flexDirection:"column", gap:12 }}>
          {steps.map((s, i) => (
            <div key={i} style={card} className={`fu d${i+1}`}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:46, height:46, borderRadius:"50%", background:"rgba(147,51,234,.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, lineHeight: 1, flexShrink:0, border:"1px solid rgba(147,51,234,.3)" }}>{s.icon}</div>
                <div><div style={{ fontWeight:700, fontSize:16, marginBottom:4, ...F }}>{s.title}</div><div style={{ color:"#94a3b8", fontSize:14, lineHeight:1.6, ...F }}>{s.desc}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div></div>
    );
  }

  // ─── SETTINGS ─────────────────────────────────────────────────────────────
  if (localScreen === "settings") {
    const displayPlayerCount = Math.max(3, playersData.length);
    const maxImpFixed = calcMaxImp(displayPlayerCount);
    const balancedCount = Math.max(1, Math.round(displayPlayerCount / 4));

    return (
      <div style={wrap}><div style={scr}>
        <div style={HDR}><button style={BK} className="press" onClick={() => setLocalScreen(globalPhaseRef.current || "home")}>‹</button><div style={TTL}>Game Settings</div></div>
        
        {!isHost && (
          <div style={{ background:"rgba(239,68,68,0.1)", color:"#f87171", padding:"10px", textAlign:"center", fontSize:12, fontWeight:700, margin:"14px 20px 0", borderRadius:10, ...F }}>
            Only the host can change settings
          </div>
        )}

        <div style={{ display:"flex", margin:"14px 20px 0", background:"rgba(255,255,255,0.05)", borderRadius:14, padding:4, gap:3 }}>
          {[["game","🎮 Game"],["impostor","🕵️ Impostor"],["categories","📂 Cats"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setSettingsTab(tab)} style={{ flex:1, padding:"8px 0", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:settingsTab===tab?"rgba(147,51,234,.38)":"transparent", color:settingsTab===tab?"#c084fc":"#64748b", transition:"all .2s", ...F }}>{label}</button>
          ))}
        </div>
        <div style={{ padding:"14px 20px 0", flex:1, overflowY:"auto" }}>
          {settingsTab === "game" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ ...cardP, marginBottom:0, textAlign:"center", padding:18 }}>
                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:".8px", marginBottom:10, ...F }}>Players</div>
                  <div style={{ fontSize:32, fontWeight:800, color:"#fff", ...F }}>{playersData.length}</div>
                </div>
                <div style={{ ...card, marginBottom:0, textAlign:"center", padding:18 }}>
                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:".8px", marginBottom:10, ...F }}>Rounds</div>
                  <Stepper value={settings.numberOfRounds} min={1} max={10} onChange={v => setSetting("numberOfRounds", v)} disabled={!isHost} />
                </div>
              </div>
              <div style={card}>
                <SRow icon="⏱️" label="Round Time" sub={`${settings.roundTime} seconds`} right={<Stepper value={settings.roundTime} min={20} max={180} step={10} onChange={v => setSetting("roundTime", v)} disabled={!isHost}/>} />
                <SRow icon="🗳️" label="Voting Time" sub={`${settings.votingTime} seconds`} right={<Stepper value={settings.votingTime} min={15} max={90} step={5} onChange={v => setSetting("votingTime", v)} disabled={!isHost}/>} />
              </div>
            </div>
          )}
          {settingsTab === "impostor" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ fontSize:12, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:".8px", marginBottom:4, ...F }}>🕵️ Mode</div>
              
              <div onClick={() => setSetting("impostorMode", "fixed")} className="ch" style={{ ...card, marginBottom:0, cursor:isHost?"pointer":"default", border:settings.impostorMode==="fixed"?"1px solid rgba(147,51,234,.5)":"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15, ...F }}>Fixed</div></div>
                  <div style={{ width:22, height:22, borderRadius:"50%", border:settings.impostorMode==="fixed"?"6px solid #9333ea":"2px solid rgba(255,255,255,0.2)" }} />
                </div>
                {settings.impostorMode === "fixed" && (
                  <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                    <Stepper value={Math.min(settings.impostorCount, maxImpFixed)} min={1} max={maxImpFixed} onChange={v => setSetting("impostorCount", v)} disabled={!isHost} />
                    <div style={{ fontSize:12, color:"#64748b", ...F }}>
                      {Math.min(settings.impostorCount, maxImpFixed)} impostor{Math.min(settings.impostorCount, maxImpFixed) !== 1 ? "s" : ""} out of {displayPlayerCount} players
                    </div>
                  </div>
                )}
              </div>
              
              <div onClick={() => setSetting("impostorMode", "random")} className="ch" style={{ ...card, marginBottom:0, cursor:isHost?"pointer":"default", border:settings.impostorMode==="random"?"1px solid rgba(147,51,234,.5)":"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15, ...F }}>Random</div></div>
                  <div style={{ width:22, height:22, borderRadius:"50%", border:settings.impostorMode==="random"?"6px solid #9333ea":"2px solid rgba(255,255,255,0.2)" }} />
                </div>
                {settings.impostorMode === "random" && (
                  <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid rgba(147,51,234,.2)" }}>
                    <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                      {["balanced","chaos","custom"].map(mode => (
                        <button key={mode} onClick={e => { e.stopPropagation(); setSetting("impostorRandomMode", mode); }} style={{ flex:1, padding:"9px 0", borderRadius:10, border:settings.impostorRandomMode===mode?"1px solid rgba(147,51,234,.6)":"1px solid rgba(255,255,255,0.1)", background:settings.impostorRandomMode===mode?"rgba(147,51,234,.2)":"transparent", color:settings.impostorRandomMode===mode?"#c084fc":"#94a3b8", fontSize:12, fontWeight:700, cursor:isHost?"pointer":"default", textTransform:"capitalize", opacity: isHost ? 1 : 0.5 }}>{mode}</button>
                      ))}
                    </div>
                    
                    {settings.impostorRandomMode === "custom" && (
                      <div className="si" style={{ marginBottom:14 }}>
                        <div style={{ fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:10, ...F }}>Range (min → max)</div>
                        <div style={{ display:"flex", alignItems:"center", gap:16, justifyContent:"center" }}>
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:11, color:"#64748b", marginBottom:6, ...F }}>Min</div>
                            <Stepper value={Math.min(settings.impostorCustomMin, settings.impostorCustomMax)} min={0} max={settings.impostorCustomMax} onChange={v => setSetting("impostorCustomMin", v)} disabled={!isHost}/>
                          </div>
                          <div style={{ color:"#64748b", fontSize:20 }}>→</div>
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:11, color:"#64748b", marginBottom:6, ...F }}>Max</div>
                            <Stepper value={Math.min(settings.impostorCustomMax, displayPlayerCount)} min={settings.impostorCustomMin} max={displayPlayerCount} onChange={v => setSetting("impostorCustomMax", v)} disabled={!isHost}/>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"8px 16px", background:"rgba(147,51,234,.15)", borderRadius:10, marginBottom:12 }}>
                      <span>⇄</span>
                      <span style={{ fontSize:13, fontWeight:600, color:"#c084fc", ...F }}>
                        {settings.impostorRandomMode === "balanced"
                          ? `Balanced (~${balancedCount} impostor${balancedCount !== 1 ? "s" : ""})`
                          : settings.impostorRandomMode === "chaos"
                          ? `Chaos (0 – ${displayPlayerCount} impostors)`
                          : `${Math.min(settings.impostorCustomMin, displayPlayerCount)} – ${Math.min(settings.impostorCustomMax, displayPlayerCount)} impostors`}
                      </span>
                    </div>

                  </div>
                )}
              </div>
              
              <div style={card}>
                <SRow icon="👁️" label="Show Impostor Count" right={<Toggle value={settings.showImpostorCount} onChange={v => setSetting("showImpostorCount", v)} disabled={!isHost} />} />
                <SRow icon="👁️" label="Show Category to Impostor" right={<Toggle value={settings.showCategoryToImpostor} onChange={v => setSetting("showCategoryToImpostor", v)} disabled={!isHost} />} />
                <SRow icon="💡" label="Show Hint to Impostor" right={<Toggle value={settings.showHintToImpostor} onChange={v => setSetting("showHintToImpostor", v)} disabled={!isHost} />} />
                <SRow icon="👥" label="Impostors Know Each Other" right={<Toggle value={settings.impostorsKnowEachOther} onChange={v => setSetting("impostorsKnowEachOther", v)} disabled={!isHost} />} />
              </div>
            </div>
          )}
          {settingsTab === "categories" && (
            <div>
              <div style={{ display:"flex", gap:8, marginBottom:14, alignItems:"center" }}>
                <button disabled={!isHost} className="press" style={{ ...btnS, padding:"8px 16px", fontSize:13, width:"auto", opacity: isHost ? 1 : 0.5 }} onClick={() => setSetting("selectedCategories", ALL_CATEGORIES)}>All</button>
                <button disabled={!isHost} className="press" style={{ ...btnS, padding:"8px 16px", fontSize:13, width:"auto", opacity: isHost ? 1 : 0.5 }} onClick={() => setSetting("selectedCategories", [])}>None</button>
                <div style={{ flex:1, textAlign:"right", fontSize:13, color:"#64748b", ...F }}>{settings.selectedCategories.length}/{ALL_CATEGORIES.length}</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {ALL_CATEGORIES.map(cat => {
                  const sel = settings.selectedCategories.includes(cat);
                  return (
                    <div key={cat} onClick={() => isHost && setSetting("selectedCategories", sel ? settings.selectedCategories.filter(c => c !== cat) : [...settings.selectedCategories, cat])} className="ch" style={{ background:sel?"rgba(147,51,234,.15)":"rgba(255,255,255,0.04)", border:sel?"1px solid rgba(147,51,234,.4)":"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"12px 14px", cursor:isHost?"pointer":"default", display:"flex", alignItems:"center", gap:8, opacity: (!isHost && !sel) ? 0.5 : 1 }}>
                      <span style={{ fontSize:18, lineHeight: 1 }}>{WORD_DATA[cat].icon}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:sel?"#c084fc":"#94a3b8", ...F }}>{cat}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div></div>
    );
  }

  // ─── LOBBY (Dynamic Player Adding) ───────────────────────────────────────────
  if (localScreen === "lobby") return (
    <div style={wrap}><div style={scr}>
      <div style={{ textAlign:"center", padding:"40px 24px 20px" }} className="fu">
        <div style={{ fontSize:32, fontWeight:900, letterSpacing:"-1px", color: "#c084fc", ...F }}>Room: {roomId}</div>
        <div style={{ color:"#64748b", fontSize:14, marginTop:4, ...F }}>Share this code with your friends</div>
      </div>
      
      <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:10, flex:1 }} className="fu d1">
        <div style={{ display:"flex", gap:8 }}>
          <input style={{...INP, flex: 1}} placeholder="Enter your name" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}/>
          <button style={{...btnP, width: "auto", padding:"12px 20px"}} onClick={handleAddPlayer}>Add</button>
        </div>

        <div style={{ marginTop: 10 }}>
          {playersData.map((p, i) => {
            const isMine = p.ownerId === localDeviceId;
            return (
              <div key={i} className="si" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"rgba(255,255,255,0.05)", borderRadius:12, marginBottom:8 }}>
                <div style={{ fontWeight:600, color:isMine?"#4ade80":"#e8e4f0", ...F }}>{p.name} {isMine && "(You)"}</div>
                {(isHost || isMine) && (
                  <button onClick={() => handleRemovePlayer(i)} style={{ background:"transparent", border:"none", color:"#f87171", cursor:"pointer", fontSize:18 }}>✕</button>
                )}
              </div>
            )
          })}
          {playersData.length === 0 && (
             <div style={{ textAlign: "center", color: "#64748b", padding: "20px", fontSize: 13, ...F }}>No players yet. Add your name above!</div>
          )}
        </div>
      </div>

      <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:10 }} className="fu d2">
        <div style={{ display:"flex", gap:10 }}>
          <button style={{...btnS, flex:1}} onClick={() => setLocalScreen("settings")}>⚙️ Settings</button>
          <button style={{...btnS, flex:1}} onClick={() => setLocalScreen("howto")}>❓ How to Play</button>
        </div>
        {isHost ? (
          <button style={{...btnP, opacity: playersData.length >= 3 ? 1 : 0.5}} onClick={startGame} disabled={playersData.length < 3}>
            {playersData.length < 3 ? "Need 3+ Players" : "Start Game"}
          </button>
        ) : (
          <div style={{ textAlign:"center", color:"#64748b", fontSize:13, padding:"10px 0", ...F }}>Waiting for host to start...</div>
        )}
      </div>
    </div></div>
  );

  // ─── WORD REVEAL ──────────────────────────────────────────────────────────
  if (localScreen === "reveal" && gameState) {
    const allRevealed = revealedSet.size === playersData.length;

    if (!revealPlayer) return (
      <div style={wrap}><div style={scr}>
        <ExitConfirmModal />
        <div style={{ padding:"20px 20px 10px" }}>
          <div style={{ ...ROW, marginBottom:10 }}>
            <div>
              <div style={{ fontSize:12, color:"#64748b", fontWeight:600, marginBottom:2, ...F }}>Round {currentRound} of {settings.numberOfRounds}</div>
              <div style={{ fontSize:22, fontWeight:800, ...F }}>Pick Your Name</div>
            </div>
            <ExitButton />
          </div>
        </div>
        <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:10, flex:1 }}>
          {playersData.map((p, i) => {
            const name = p.name;
            const done = revealedSet.has(name);
            const isMyDevice = p.ownerId === localDeviceId;
            
            return (
              <button key={i} disabled={done || !isMyDevice} onClick={() => { setRevealPlayer(name); setShowWord(false); }}
                className={`press fu d${Math.min(i+1,6)}`}
                style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", borderRadius:18, background:done?"rgba(34,197,94,0.07)":"rgba(255,255,255,0.06)", border:done?"1px solid rgba(34,197,94,0.22)":"1px solid rgba(255,255,255,0.1)", cursor:(done || !isMyDevice)?"default":"pointer", textAlign:"left", width:"100%", transition:"all .2s", opacity: (!isMyDevice && !done) ? 0.5 : 1 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:done?"rgba(34,197,94,0.14)":"linear-gradient(135deg,#9333ea,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, flexShrink:0, color:"#fff", ...F }}>
                  {done ? "✓" : i+1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:16, color:done?"#4ade80":"#e8e4f0", ...F }}>{name}</div>
                  <div style={{ fontSize:12, color:done?"#4ade80":"#64748b", marginTop:2, ...F }}>{done ? "Role revealed" : isMyDevice ? "Tap to see your role" : "Waiting for them..."}</div>
                </div>
                {(!done && isMyDevice) && <div style={{ color:"#64748b", fontSize:22 }}>›</div>}
              </button>
            );
          })}
        </div>
        <div style={{ padding:"14px 20px 0" }}>
          {allRevealed
            ? (isHost 
                ? <button style={btnP} className="press bi" onClick={() => pushUpdate({ gamePhase: "game" })}>Start Discussion ›</button> 
                : <div style={{ textAlign:"center", color:"#64748b", fontSize:14, padding:"12px 0", ...F }}>Waiting for host to begin...</div>)
            : <div style={{ textAlign:"center", color:"#64748b", fontSize:14, padding:"12px 0", ...F }}>{playersData.length - revealedSet.size} player{playersData.length - revealedSet.size !== 1 ? "s" : ""} remaining</div>
          }
        </div>
      </div></div>
    );

    const isImp = gameState.impostors.includes(revealPlayer);
    return (
      <div style={wrap}><div style={scr}>
        <ExitConfirmModal />
        <div style={{ ...ROW, padding:"20px 20px 0" }}>
          <button onClick={() => { setRevealPlayer(null); setShowWord(false); }} className="press" style={{ ...BK, fontSize:16 }}>‹</button>
          <ExitButton />
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px 24px 32px" }}>
          <div style={{ fontSize:13, color:"#64748b", marginBottom:8, ...F }}>Round {currentRound} of {settings.numberOfRounds}</div>
          {!showWord ? (
            <div style={{ textAlign:"center", width:"100%" }} className="si">
              {/* Added explicit lineHeight: 1 */}
              <div style={{ fontSize:72, lineHeight: 1, marginBottom:18, display:"inline-block", animation:"glowPulse 2s ease infinite" }}>🔒</div>
              <div style={{ fontSize:26, fontWeight:800, lineHeight: 1.2, marginBottom:8, ...F }}>{revealPlayer}</div>
              <button style={{ ...btnP, animation:"ringPulse 2s ease infinite" }} className="press" onClick={() => setShowWord(true)}>Reveal My Role</button>
            </div>
          ) : (
            <div style={{ width:"100%", textAlign:"center" }} className="bi">
              {isImp ? (
                <>
                  <div style={{ fontSize:64, lineHeight: 1, marginBottom:14 }}>🕵️</div>
                  <div style={{ display:"inline-block", background:"rgba(239,68,68,0.14)", border:"1px solid rgba(239,68,68,.35)", borderRadius:12, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#f87171", marginBottom:16, textTransform:"uppercase", ...F }}>You are the Impostor</div>
                  {settings.showCategoryToImpostor && <div style={{ ...card, marginTop:8 }}><div style={{ fontSize:11, color:"#94a3b8", marginBottom:4, textTransform:"uppercase", ...F }}>Category</div><div style={{ fontSize:28, fontWeight:800, color:"#c084fc", ...F }}>{WORD_DATA[gameState.category].icon} {gameState.category}</div></div>}
                  {settings.impostorsKnowEachOther && gameState.impostors.length > 1 && <div style={{ ...card, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)" }}><div style={{ fontSize:11, color:"#f87171", marginBottom:6, textTransform:"uppercase", ...F }}>Fellow Impostors</div>{gameState.impostors.filter(p => p !== revealPlayer).map(p => <div key={p} style={{ fontWeight:700, fontSize:15, padding:"4px 0", ...F }}>{p}</div>)}</div>}
                </>
              ) : (
                <>
                  <div style={{ fontSize:64, lineHeight: 1, marginBottom:14 }}>✅</div>
                  <div style={{ display:"inline-block", background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.28)", borderRadius:12, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#4ade80", marginBottom:16, textTransform:"uppercase", ...F }}>Civilian</div>
                  <div style={card}><div style={{ fontSize:11, color:"#94a3b8", marginBottom:8, textTransform:"uppercase", ...F }}>Your Secret Word</div><div style={{ fontSize:38, fontWeight:900, color:"#fff", marginBottom:6, ...F }}>{gameState.secretWord}</div><div style={{ color:"#64748b", fontSize:13, ...F }}>{WORD_DATA[gameState.category].icon} {gameState.category}</div></div>
                </>
              )}
              <div style={{ marginTop:14, color:"#64748b", fontSize:13, marginBottom:16, ...F }}>Memorize your role, then pass the phone.</div>
              <button style={btnP} className="press" onClick={() => {
                pushUpdate({ revealedSet: [...Array.from(revealedSet), revealPlayer] });
                setRevealPlayer(null);
                setShowWord(false);
              }}>Done</button>
            </div>
          )}
        </div>
      </div></div>
    );
  }

  // ─── GAME / DISCUSSION ────────────────────────────────────────────────────
  if (localScreen === "game" && gameState) {
    const pct = timeLeft != null ? Math.round((timeLeft / settings.roundTime) * 100) : 100;
    const urgent = timeLeft != null && timeLeft <= 15;
    return (
      <div style={wrap}><div style={scr}>
        <ExitConfirmModal />
        <div style={{ padding:"20px 20px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:13, color:"#64748b", fontWeight:600, ...F }}>Round {currentRound}/{settings.numberOfRounds}</div>
              <ExitButton />
            </div>
            <div style={{ fontSize:38, fontWeight:900, fontVariantNumeric:"tabular-nums", color:urgent?"#f87171":"#e8e4f0", animation:urgent?"timerUrgent 1s ease infinite":"none", ...F }}>{timeLeft}s</div>
          </div>
          <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}><div style={{ height:"100%", width:`${pct}%`, background:pct>30?"linear-gradient(90deg,#9333ea,#6366f1)":"linear-gradient(90deg,#ef4444,#f97316)", borderRadius:3, transition:"width 1s linear" }} /></div>
        </div>
        <div style={{ flex:1, padding:"18px 20px 0", display:"flex", flexDirection:"column", gap:12 }}>
          <div style={cardP} className="si">
            <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, marginBottom:4, textTransform:"uppercase", ...F }}>Category</div>
            <div style={{ fontSize:28, fontWeight:800, ...F }}>{WORD_DATA[gameState.category].icon} {gameState.category}</div>
            {settings.showImpostorCount && <div style={{ marginTop:8, fontSize:13, color:"#94a3b8", ...F }}>{gameState.impostorCount} impostor{gameState.impostorCount !== 1 ? "s" : ""} among you</div>}
          </div>
          <div style={card} className="fu d2">
            <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, marginBottom:10, textTransform:"uppercase", ...F }}>Players</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {playerNames.map((p, i) => <div key={i} style={{ background:"rgba(255,255,255,0.07)", borderRadius:10, padding:"6px 12px", fontSize:14, fontWeight:600, ...F }}>{p}</div>)}
            </div>
          </div>
        </div>
        <div style={PX}>
          {isHost ? (
            <button style={btnP} className="press" onClick={() => pushUpdate({ gamePhase: "vote" })}>Go to Vote ›</button>
          ) : (
             <div style={{ textAlign:"center", color:"#64748b", fontSize:13, padding:"10px 0", ...F }}>Waiting for host to end discussion...</div>
          )}
        </div>
      </div></div>
    );
  }

  // ─── VOTE ─────────────────────────────────────────────────────────────────
  if (localScreen === "vote" && gameState) {
    const pct = timeLeft != null ? Math.round((timeLeft / settings.votingTime) * 100) : 100;

    const toggleVote = (voter, suspect) => {
      const currentArray = votes[voter] ? Array.from(votes[voter]) : [];
      const newArray = currentArray.includes(suspect) ? currentArray.filter(v => v !== suspect) : [...currentArray, suspect];
      pushUpdate({ [`votes/${voter}`]: newArray });
    };

    const voterDone = (voter) => { const v = votes[voter]; return v && v.size >= 1; };
    const allVoted = playerNames.every(voterDone);

    return (
      <div style={wrap}><div style={scr}>
        <ExitConfirmModal />
        <div style={{ padding:"20px 20px 10px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:18, fontWeight:800, ...F }}>Vote for Impostors</div>
              <div style={{ fontSize:12, color:"#64748b", marginTop:2, ...F }}>Select everyone you think is an impostor</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <ExitButton />
              <div style={{ fontSize:28, fontWeight:900, fontVariantNumeric:"tabular-nums", color:pct<30?"#f87171":"#e8e4f0", ...F }}>{timeLeft}s</div>
            </div>
          </div>
          <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}><div style={{ height:"100%", width:`${pct}%`, background:pct>30?"linear-gradient(90deg,#9333ea,#6366f1)":"linear-gradient(90deg,#ef4444,#f97316)", borderRadius:2, transition:"width 1s linear" }} /></div>
        </div>

        <div style={{ padding:"0 20px", flex:1, overflowY:"auto" }}>
          {playersData.map((voterObj, vi) => {
            const voter = voterObj.name;
            const myVotes = votes[voter] || new Set();
            const done = voterDone(voter);
            const isMyDevice = voterObj.ownerId === localDeviceId;

            return (
              <div key={vi} style={{ marginBottom:20, opacity: isMyDevice ? 1 : 0.6 }} className={`fu d${Math.min(vi+1,6)}`}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:"#c084fc", ...F }}>{voter} {isMyDevice ? "(You)" : ""}</span>
                  <span style={{ fontSize:11, color:done?"#4ade80":"#64748b", ...F }}>{myVotes.size} selected{done ? " ✓" : ""}</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {playersData.filter(p => p.name !== voter).map((suspectObj, si) => {
                    const suspect = suspectObj.name;
                    const sel = myVotes.has(suspect);
                    return (
                      <button key={si} disabled={!isMyDevice} onClick={() => toggleVote(voter, suspect)} className="press"
                        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderRadius:14, background:sel?"rgba(147,51,234,.2)":"rgba(255,255,255,0.04)", border:sel?"1px solid rgba(147,51,234,.5)":"1px solid rgba(255,255,255,0.07)", cursor:isMyDevice?"pointer":"default", color:sel?"#c084fc":"#e8e4f0", fontSize:15, fontWeight:600, transition:"all .15s", width:"100%", textAlign:"left", ...F }}>
                        <span>{suspect}</span>
                        {sel && <span style={{ fontSize:16 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding:"10px 20px 0" }}>
          {isHost ? (
            <button style={{ ...btnP, opacity:allVoted?1:0.45 }} className="press" onClick={submitVotes} disabled={!allVoted}>
              {allVoted ? "Submit Votes" : `${playerNames.filter(p => !voterDone(p)).length} player${playerNames.filter(p => !voterDone(p)).length !== 1 ? "s" : ""} haven't voted yet`}
            </button>
          ) : (
            <div style={{ textAlign:"center", color:"#64748b", fontSize:13, padding:"10px 0", ...F }}>Waiting for host to submit votes...</div>
          )}
        </div>
      </div></div>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────────────────────
  if (localScreen === "result" && gameState && roundResults) {
    const tally = roundResults.tally || {};
    const caughtImpostors = roundResults.caughtImpostors || [];
    const allCaught = !!roundResults.allCaught;

    const noCaught = caughtImpostors.length === 0;
    const emoji = allCaught ? "🎉" : noCaught ? "😈" : "🤝";
    const headline = allCaught ? (gameState.impostors.length > 1 ? "All Impostors Caught!" : "Impostor Caught!") : noCaught ? (gameState.impostors.length > 1 ? "Impostors Win!" : "Impostor Wins!") : `${caughtImpostors.length} of ${gameState.impostors.length} Caught`;
    const subtitle = allCaught ? "Civilians earn +2 points each" : noCaught ? `Impostors each earn +3 points` : "Partial catch — uncaught impostors earn +2, catching civilians earn +1";

    return (
      <div style={wrap}><div style={scr}>
        <ExitConfirmModal />
        <div style={{ ...ROW, padding:"20px 20px 0", justifyContent:"flex-end" }}><ExitButton /></div>
        <div style={{ padding:"20px 24px 16px", textAlign:"center" }} className="bi">
          <div style={{ fontSize:64, lineHeight: 1, marginBottom:10 }}>{emoji}</div>
          <div style={{ fontSize:26, fontWeight:900, lineHeight: 1.2, letterSpacing:"-.5px", marginBottom:4, ...F }}>{headline}</div>
          <div style={{ color:"#64748b", fontSize:13, lineHeight:1.5, ...F }}>{subtitle}</div>
        </div>
        <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={card} className="fu d1">
            <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, marginBottom:6, textTransform:"uppercase", ...F }}>The Word Was</div>
            <div style={{ fontSize:32, fontWeight:900, ...F }}>{gameState.secretWord}</div>
            <div style={{ color:"#64748b", fontSize:13, marginTop:4, ...F }}>{gameState.category}</div>
          </div>
          <div style={card} className="fu d2">
            <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, marginBottom:10, textTransform:"uppercase", ...F }}>Impostor{gameState.impostors.length > 1 ? "s" : ""}</div>
            {gameState.impostors.map((p, i) => {
              const caught = caughtImpostors.includes(p);
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:i < gameState.impostors.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                  <span style={{ fontWeight:700, fontSize:15, ...F }}>{p}</span>
                  <div style={{ display:"flex", gap:6 }}>
                    <span style={{ background:"rgba(239,68,68,.14)", color:"#f87171", border:"1px solid rgba(239,68,68,.28)", borderRadius:8, padding:"2px 10px", fontSize:11, fontWeight:700, ...F }}>IMPOSTOR</span>
                    <span style={{ background:caught?"rgba(34,197,94,.14)":"rgba(239,68,68,.14)", color:caught?"#4ade80":"#f87171", border:caught?"1px solid rgba(34,197,94,.28)":"1px solid rgba(239,68,68,.28)", borderRadius:8, padding:"2px 10px", fontSize:11, fontWeight:700, ...F }}>{caught ? "CAUGHT" : "FREE"}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={card} className="fu d3">
            <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, marginBottom:10, textTransform:"uppercase", ...F }}>Vote Tally</div>
            {Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([p, v]) => {
              const isImp = gameState.impostors.includes(p);
              const barW = Math.max(4, Math.round((v / playerNames.length) * 120));
              return (
                <div key={p} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0" }}>
                  <span style={{ fontWeight:600, fontSize:14, flex:1, color:isImp?"#f87171":"#e8e4f0", ...F }}>{p}{isImp ? " 🕵️" : ""}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:barW, height:5, background:isImp?"#ef4444":"#9333ea", borderRadius:3 }} />
                    <span style={{ color:"#64748b", fontSize:12, minWidth:24, textAlign:"right", ...F }}>{v}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {isHost ? (
            <button style={btnP} className="press fu d4" onClick={nextRound}>
              {currentRound >= settings.numberOfRounds ? "View Final Scores" : `Next Round (${currentRound+1}/${settings.numberOfRounds})`}
            </button>
          ) : (
             <div style={{ textAlign:"center", color:"#64748b", fontSize:13, padding:"10px 0", ...F }}>Waiting for host to proceed...</div>
          )}
        </div>
      </div></div>
    );
  }

  // ─── SCOREBOARD ───────────────────────────────────────────────────────────
  if (localScreen === "scoreboard") {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return (
      <div style={wrap}><div style={scr}>
        <div style={HDR}><button style={BK} className="press" onClick={() => setLocalScreen("lobby")}>‹</button><div style={TTL}>Final Scores</div></div>
        <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:10 }}>
          {sorted.map(([name, score], i) => (
            <div key={name} className={`fu d${Math.min(i+1,6)}`} style={{ display:"flex", alignItems:"center", gap:16, padding:20, borderRadius:20, background:i===0?"rgba(234,179,8,0.09)":"rgba(255,255,255,0.05)", border:i===0?"1px solid rgba(234,179,8,0.22)":"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize:28, width:36, textAlign:"center", lineHeight: 1 }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`}</div>
              <div style={{ flex:1, fontWeight:700, fontSize:16, ...F }}>{name}</div>
              <div style={{ fontSize:28, fontWeight:900, color:i===0?"#fbbf24":"#e8e4f0", ...F }}>{score}</div>
            </div>
          ))}
          <div style={{ height:6 }} />
          {isHost ? (
             <button style={btnP} className="press" onClick={() => pushUpdate({ gamePhase: "lobby", scores: {}, currentRound: 1, gameState: null, votes: {} })}>Play Again</button>
          ) : (
             <div style={{ textAlign:"center", color:"#64748b", fontSize:13, padding:"10px 0", ...F }}>Waiting for host to start a new game...</div>
          )}
        </div>
      </div></div>
    );
  }

  return null;
}