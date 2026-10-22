/* ============================================================
   RecallAR — Final Mobile App Version
   ============================================================ */

/* ---------- ICON LIBRARY ---------- */
const ICONS = {
  keys:{emoji:"🔑",img:"https://img.icons8.com/fluency/96/key.png"},
  phone:{emoji:"📱",img:"https://img.icons8.com/fluency/96/smartphone.png"},
  bag:{emoji:"👜",img:"https://img.icons8.com/fluency/96/handbag.png"},
  spoon:{emoji:"🥄",img:"https://img.icons8.com/fluency/96/spoon.png"},
  book:{emoji:"📖",img:"https://img.icons8.com/fluency/96/book.png"},
  bottle:{emoji:"🍼",img:"https://img.icons8.com/fluency/96/water-bottle.png"},
  plate:{emoji:"🍽️",img:"https://img.icons8.com/fluency/96/plate.png"},
  pillow:{emoji:"🛏️",img:"https://img.icons8.com/fluency/96/bed.png"},
  shoe:{emoji:"👟",img:"https://img.icons8.com/fluency/96/sneakers.png"},
  door:{emoji:"🚪",img:"https://img.icons8.com/fluency/96/door.png"},
  clock:{emoji:"⏰",img:"https://img.icons8.com/fluency/96/clock.png"},
  medicine:{emoji:"💊",img:"https://img.icons8.com/fluency/96/pill.png"},
  toothbrush:{emoji:"🪥",img:"https://img.icons8.com/fluency/96/toothbrush.png"},
  towel:{emoji:"🧻",img:"https://img.icons8.com/fluency/96/towel.png"},
  shirt:{emoji:"👕",img:"https://img.icons8.com/fluency/96/t-shirt.png"},
  cup:{emoji:"☕",img:"https://img.icons8.com/fluency/96/coffee.png"},
  wallet:{emoji:"👛",img:"https://img.icons8.com/fluency/96/wallet.png"},
  glasses:{emoji:"👓",img:"https://img.icons8.com/fluency/96/glasses.png"},
  umbrella:{emoji:"☂️",img:"https://img.icons8.com/fluency/96/umbrella.png"},
  watch:{emoji:"⌚",img:"https://img.icons8.com/fluency/96/watch.png"},
  car:{emoji:"🚗",img:"https://img.icons8.com/fluency/96/car.png"},
  bus:{emoji:"🚌",img:"https://img.icons8.com/fluency/96/bus.png"},
  stairs:{emoji:"🪜",img:"https://img.icons8.com/fluency/96/stairs.png"},
  apple:{emoji:"🍎",img:"https://img.icons8.com/fluency/96/apple.png"},
  banana:{emoji:"🍌",img:"https://img.icons8.com/fluency/96/banana.png"},
  water:{emoji:"💧",img:"https://img.icons8.com/fluency/96/water.png"},
  bread:{emoji:"🍞",img:"https://img.icons8.com/fluency/96/bread.png"},
  milk:{emoji:"🥛",img:"https://img.icons8.com/fluency/96/milk.png"},
  egg:{emoji:"🥚",img:"https://img.icons8.com/fluency/96/egg.png"},
  fish:{emoji:"🐟",img:"https://img.icons8.com/fluency/96/fish.png"},
  cat:{emoji:"🐱",img:"https://img.icons8.com/fluency/96/cat.png"},
  dog:{emoji:"🐶",img:"https://img.icons8.com/fluency/96/dog.png"},
  tree:{emoji:"🌳",img:"https://img.icons8.com/fluency/96/tree.png"},
  flower:{emoji:"🌷",img:"https://img.icons8.com/fluency/96/flower.png"},
  sun:{emoji:"☀️",img:"https://img.icons8.com/fluency/96/sun.png"},
  moon:{emoji:"🌙",img:"https://img.icons8.com/fluency/96/moon.png"},
  home:{emoji:"🏠",img:"https://img.icons8.com/fluency/96/home.png"},
  heart:{emoji:"❤️",img:"https://img.icons8.com/fluency/96/heart.png"},
  star:{emoji:"⭐",img:"https://img.icons8.com/fluency/96/star.png"},
  check:{emoji:"✅",img:"https://img.icons8.com/fluency/96/checkmark.png"},
  cross:{emoji:"❌",img:"https://img.icons8.com/fluency/96/delete-sign.png"},
};

const CATEGORIES = ["Daily Living","Memory","Attention","Recognition","Sequencing","General Cognitive Activity"];
const DIFFICULTIES = ["Easy","Moderate","Challenging"];
const TASK_TYPES = [
  {id:"multiple_choice",label:"Multiple Choice"},
  {id:"yes_no",label:"Yes / No"},
  {id:"ordering",label:"Ordering"},
  {id:"memory_recall",label:"Memory Recall"},
  {id:"image_selection",label:"Image Selection"},
];

/* ---------- STATE ---------- */
const state = {
  screen: "landing",
  editingActivityId: null,
  editingTask: null,
  userSession: null,
  userTasks: [],
  userIndex: 0,
  userAttempts: [],
  userActivity: null,
  recognition: { mode: "people", loopId: null },
  patientTab: "home",
  caregiverTab: "dashboard",
};

/* ---------- HELPERS ---------- */
const $ = (sel) => document.querySelector(sel);
const uid = () => "id-" + Math.random().toString(36).slice(2,10) + Date.now().toString(36);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const now = () => Date.now();

function iconFor(k){ return ICONS[k] || {emoji:"❔",img:""}; }
function renderIcon(k,size=52){
  const i = iconFor(k);
  if (i.img) return `<img class="option-img" style="width:${size}px;height:${size}px;" src="${i.img}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" /><span style="display:none;font-size:${size}px;line-height:1;">${i.emoji}</span>`;
  return `<span style="font-size:${size}px;line-height:1;">${i.emoji}</span>`;
}

/* ============================================================
   MOBILE STORAGE (IndexedDB)
   ============================================================ */
const DB_NAME = "recallar_db";
const DB_VERSION = 1;
let db = null;

async function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      const stores = ["activities", "tasks", "sessions", "attempts", "face_registry", "object_registry", "meta"];
      stores.forEach(store => {
        if (!d.objectStoreNames.contains(store)) {
          d.createObjectStore(store, { keyPath: "id" });
        }
      });
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

async function dbAll(store) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, "readonly").objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(store, key) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, "readonly").objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(store, value) {
  return new Promise((resolve, reject) => {
    const key = value.id || value.name || value.key;
    if (key) value.id = key;
    const req = db.transaction(store, "readwrite").objectStore(store).put(value);
    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(store, key) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, "readwrite").objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ---------- SEED ---------- */
async function seedIfEmpty() {
  const metas = await dbAll("meta");
  if (metas.find(m => m.key === "seeded")) return;

  const activityId = uid();
  await dbPut("activities", {
    id: activityId, name: "Before Leaving Home", category: "Daily Living",
    description: "Practice remembering important items and steps before leaving home.",
    difficulty: "Easy", estimated_minutes: 5,
    instructions: "Let's complete this activity together.",
    icon: "home", is_active: 1, order_index: 0, created_at: now(),
  });

  const tasks = [
    {id:uid(),activity_id:activityId,type:"multiple_choice",prompt:"What should you take before leaving home?",hint:"Think about what opens the door.",explanation:"Keys are important before leaving home.",order_index:0,points:1,options:[
      {label:"Keys",icon:"keys",correct:true},{label:"Spoon",icon:"spoon",correct:false},{label:"Book",icon:"book",correct:false},{label:"Bottle",icon:"bottle",correct:false},
    ]},
    {id:uid(),activity_id:activityId,type:"multiple_choice",prompt:"Which item would you normally use to contact someone?",hint:"You carry it in your pocket.",explanation:"A phone is used to contact someone.",order_index:1,points:1,options:[
      {label:"Phone",icon:"phone",correct:true},{label:"Plate",icon:"plate",correct:false},{label:"Pillow",icon:"pillow",correct:false},{label:"Shoe",icon:"shoe",correct:false},
    ]},
    {id:uid(),activity_id:activityId,type:"ordering",prompt:"Arrange these steps in the correct order.",hint:"Start with what you pick up first.",explanation:"First take your keys, then phone, then bag, then leave.",order_index:2,points:2,options:[
      {label:"Take your keys",icon:"keys",correct:false,order:0},{label:"Take your phone",icon:"phone",correct:false,order:1},{label:"Take your bag",icon:"bag",correct:false,order:2},{label:"Leave the house",icon:"door",correct:false,order:3},
    ]},
    {id:uid(),activity_id:activityId,type:"memory_recall",prompt:"Which items do you remember seeing?",hint:"Pick the ones from before.",explanation:"Keys, phone and bag were shown earlier.",order_index:3,points:2,options:[
      {label:"Keys",icon:"keys",correct:true},{label:"Phone",icon:"phone",correct:true},{label:"Bag",icon:"bag",correct:true},{label:"Apple",icon:"apple",correct:false},
    ]},
    {id:uid(),activity_id:activityId,type:"yes_no",prompt:"Do you need your keys before leaving home?",hint:"Think about locking the door.",explanation:"Yes, you need your keys.",order_index:4,points:1,options:[
      {label:"Yes",icon:"check",correct:true},{label:"No",icon:"cross",correct:false},
    ]},
  ];

  for (const t of tasks) await dbPut("tasks", t);
  await dbPut("meta", { id: "seeded", key: "seeded", value: true });
}

/* ============================================================
   ROUTER
   ============================================================ */
async function render() {
  const app = $("#app");
  let html = "";
  try {
    switch (state.screen) {
      case "landing":             html = viewLanding();                  break;
      case "role":                html = viewRoleSelection();            break;
      case "patient_home":        html = await viewPatientHome();        break;
      case "patient_activities":  html = await viewPatientActivities();  break;
      case "patient_memory":      html = await viewPatientMemory();      break;
      case "patient_help":        html = viewPatientHelp();              break;
      case "ar_mode":             html = viewArMode();                   break;
      case "user_runner":         html = viewUserRunner();               break;
      case "user_feedback":       html = viewUserFeedback();             break;
      case "user_completion":     html = viewUserCompletion();           break;
      case "user_face_check":     html = viewUserFaceCheck();            break;
      case "user_object_check":   html = viewUserObjectCheck();          break;
      case "caregiver":           html = await viewCaregiverDashboard(); break;
      case "activity_form":       html = await viewActivityForm();       break;
      case "task_form":           html = await viewTaskForm();           break;
      case "analytics":           html = await viewAnalytics();          break;
      case "recognition":         html = await viewRecognition();        break;
      case "loading":             html = `<div class="spinner"></div>`;  break;
      default:                    html = `<div style="padding:40px;">Unknown screen: ${state.screen}</div>`;
    }
  } catch (err) {
    console.error("Render error:", err);
    html = `<div style="padding:40px;color:#D9455F;font-family:monospace;"><h2>Render error</h2><pre>${err?.message || err}</pre></div>`;
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);

  if (["recognition","user_face_check","user_object_check","ar_mode"].includes(state.screen)) {
    attachRecognitionHooks();
  }
}

// Hardware Back Button Logic
window.addEventListener('popstate', (e) => {
  if (state.screen === "landing") return;
  e.preventDefault();
  
  if (state.screen === "caregiver" || state.screen === "patient_home" || state.screen === "role") {
    goLanding();
  } else if (state.screen === "user_runner" || state.screen === "user_feedback") {
    stopRecognition();
    state.screen = "patient_home";
    render();
  } else if (state.screen === "user_completion") {
    finishUserFlow();
  } else if (state.screen === "activity_form") {
    goCaregiverTab("activities");
  } else if (state.screen === "task_form") {
    state.screen = "activity_form";
    render();
  } else {
    stopRecognition();
    state.screen = "patient_home"; 
    render();
  }
});

/* ============================================================
   LANDING
   ============================================================ */
function viewLanding() {
  return `
    <div class="landing">
      <div class="nav">
        <div class="container nav-inner">
          <div class="brand">
            <div class="brand-mark">R</div>
            RecallAR
          </div>
          <div class="nav-links">
            <a class="nav-link" onclick="scrollToFeatures()">Overview</a>
            <a class="nav-link" onclick="scrollToFeatures()">AR Support</a>
            <a class="nav-link" onclick="goRole()">Access</a>
          </div>
          <div class="nav-cta">
            <button class="btn btn-ghost" onclick="goCaregiver()">Caregiver</button>
            <button class="btn btn-primary" onclick="goPatient()">Begin Session</button>
          </div>
        </div>
      </div>

      <div class="hero">
        <div class="container hero-inner">
          <div class="hero-copy">
            <div class="eyebrow">
              <span class="eyebrow-dot"></span>
              AR cognitive assistance · Research prototype
            </div>
            <h1>
              Memory,<br>
              <em>guided</em> — softly.
            </h1>
            <p class="hero-sub">
              A spatial cognitive assistant for people living with mild cognitive impairment.
              Recognizes familiar faces and objects, guides daily routines, and keeps caregivers informed — through calm AR overlays.
            </p>
            <div class="hero-cta">
              <button class="btn btn-primary btn-lg" onclick="goPatient()">
                Begin patient session
              </button>
              <button class="btn btn-secondary btn-lg" onclick="goCaregiver()">
                Caregiver dashboard
              </button>
            </div>
            <div class="hero-meta">
              <div class="hero-meta-item">
                <span class="hero-meta-value">128-d</span>
                <span class="hero-meta-label">Face embedding</span>
              </div>
              <div class="hero-meta-item">
                <span class="hero-meta-value">80</span>
                <span class="hero-meta-label">Object classes</span>
              </div>
              <div class="hero-meta-item">
                <span class="hero-meta-value">100%</span>
                <span class="hero-meta-label">Local · offline</span>
              </div>
            </div>
          </div>

          <div class="hero-visual">
            <div class="preview preview-ar">
              <div class="ar-frame">
                <div class="ar-top">
                  <span class="ar-pulse"></span>
                  RECOGNIZING
                </div>
                <div class="ar-marker m1"></div>
                <div class="ar-marker m2"></div>
                <div class="ar-overlay">
                  <div class="ar-overlay-avatar">🧑</div>
                  <div>
                    <span class="ar-overlay-name">Familiar face</span>
                    <span class="ar-overlay-role">Granddaughter · 94%</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="preview preview-vr">
              <div class="vr-frame">
                <div class="vr-panel">
                  <div class="vr-panel-label">Today's Routine</div>
                  <div class="vr-panel-row"><span class="vr-panel-dot done"></span> Brush teeth</div>
                  <div class="vr-panel-row"><span class="vr-panel-dot done"></span> Take medicine</div>
                  <div class="vr-panel-row"><span class="vr-panel-dot"></span> Morning walk</div>
                </div>
              </div>
            </div>
            <div class="preview preview-card">
              <div class="recognition-frame">
                <div class="recog-avatar">👵</div>
                <div class="recog-meta">
                  <div class="recog-name">Familiar person</div>
                  <div class="recog-role">Granddaughter</div>
                  <span class="recog-badge">✓ Recognized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function scrollToFeatures(){ /* no-op */ }

/* ============================================================
   ROLE SELECTION
   ============================================================ */
function viewRoleSelection() {
  return `
    <div class="role-screen">
      <div class="role-card">
        <div class="role-header">
          <div class="role-mark">R</div>
          <h1>Who is using RecallAR?</h1>
          <p>Choose how you would like to continue</p>
        </div>
        <div class="role-grid">
          <button class="role-option" onclick="goCaregiver()">
            <div class="role-icon-wrap caregiver">🧑‍⚕️</div>
            <div>
              <h2>Caregiver</h2>
              <p>Create activities, register familiar faces and objects, and review session insights.</p>
            </div>
            <span class="role-cta">Open dashboard →</span>
          </button>
          <button class="role-option" onclick="goPatient()">
            <div class="role-icon-wrap patient">👤</div>
            <div>
              <h2>Patient</h2>
              <p>Begin your guided routine, recognize people and objects, and revisit familiar memories.</p>
            </div>
            <span class="role-cta">Start session →</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function goLanding(){ stopRecognition(); state.screen = "landing"; render(); }
function goRole(){ stopRecognition(); state.screen = "role"; render(); }
function goCaregiver(){ stopRecognition(); state.screen = "caregiver"; state.caregiverTab = "dashboard"; render(); }
function goPatient(){ stopRecognition(); state.screen = "patient_home"; state.patientTab = "home"; render(); }

/* ============================================================
   PATIENT HOME
   ============================================================ */
async function viewPatientHome() {
  const activities = (await dbAll("activities")).filter(a => a.is_active).sort((a,b)=>(a.order_index||0)-(b.order_index||0));
  const next = activities[0];

  return `
    <div class="patient-shell">
      <div class="container">
        <div class="patient-topbar">
          <div class="patient-topbar-inner">
            <div class="patient-greeting">
              <small>Good day</small>
              User
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button onclick="goLanding()" class="btn btn-ghost" style="font-size: 13px; padding: 6px 12px; border-radius: 20px;">
                ← Exit
              </button>
              <div class="patient-avatar-chip">
                <div class="pav">👤</div>
                <span>User</span>
              </div>
            </div>
          </div>
        </div>

        <div class="patient-home">
          ${next ? `
          <div class="primary-session-card">
            <div class="primary-session-copy">
              <span class="ps-eyebrow">Next up · ${esc(next.category)}</span>
              <h2>${esc(next.name)}</h2>
              <p>${esc(next.description || "Let's go through this together, one step at a time.")}</p>
              <button class="btn btn-primary btn-lg" onclick="startUserActivity('${next.id}')">
                ▶ &nbsp; Start activity
              </button>
            </div>
            <div class="primary-session-visual">
              <div class="session-orb-ring"></div>
              <div class="session-orb"></div>
              <div class="session-orb-icon">${iconFor(next.icon || "home").emoji}</div>
            </div>
          </div>
          ` : `
          <div class="primary-session-card">
            <div class="primary-session-copy">
              <span class="ps-eyebrow">Nothing scheduled</span>
              <h2>All clear for now</h2>
              <p>Your caregiver hasn't scheduled an activity yet. Take a moment to relax.</p>
            </div>
          </div>
          `}

          <div class="quick-actions" style="grid-template-columns: repeat(3, 1fr);">
            <button class="quick-card" onclick="openArMode()">
              <div class="quick-card-icon lav">📷</div>
              <div>
                <h3>Where am I?</h3>
                <p>Use the camera to understand your surroundings.</p>
              </div>
            </button>
            <button class="quick-card" onclick="openArMode('people')">
              <div class="quick-card-icon teal">👤</div>
              <div>
                <h3>Who is this?</h3>
                <p>Recognize familiar people nearby.</p>
              </div>
            </button>
            <button class="quick-card" onclick="goPatientMemory()">
              <div class="quick-card-icon amber">📸</div>
              <div>
                <h3>My memories</h3>
                <p>Revisit familiar people and places.</p>
              </div>
            </button>
          </div>

          <div class="reminder-strip">
            <div class="reminder-strip-icon">💊</div>
            <div class="reminder-strip-body">
              <div class="reminder-strip-label">Reminder</div>
              <div class="reminder-strip-text">Time to take your morning medicine after breakfast.</div>
            </div>
            <button class="btn btn-secondary" onclick="goPatientActivities()">Open</button>
          </div>
        </div>
      </div>

      ${renderBottomNav("home")}
    </div>
  `;
}

async function viewPatientActivities() {
  const activities = (await dbAll("activities")).filter(a => a.is_active).sort((a,b)=>(a.order_index||0)-(b.order_index||0));

  return `
    <div class="patient-shell">
      <div class="container">
        <div class="patient-topbar">
          <div class="patient-topbar-inner">
            <div class="patient-greeting">
              <small>Today</small>
              Your activities
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button onclick="goLanding()" class="btn btn-ghost" style="font-size: 13px; padding: 6px 12px; border-radius: 20px;">
                ← Exit
              </button>
              <div class="patient-avatar-chip">
                <div class="pav">👤</div>
                <span>User</span>
              </div>
            </div>
          </div>
        </div>

        <div class="patient-home">
          ${activities.length === 0
            ? `<div class="empty-card"><div class="emoji">🗂️</div><h3>Nothing scheduled</h3><p>Your caregiver hasn't added any activities yet.</p></div>`
            : `<div class="activity-list">${activities.map(a => `
                <div class="activity-row" onclick="startUserActivity('${a.id}')">
                  <div class="activity-thumb">${renderIcon(a.icon||"home",30)}</div>
                  <div class="activity-meta">
                    <h3>${esc(a.name)}</h3>
                    <p>${esc(a.category)} · ${a.estimated_minutes || 0} min</p>
                  </div>
                  <span class="chevron">›</span>
                </div>`).join("")}
              </div>`}
        </div>
      </div>
      ${renderBottomNav("activities")}
    </div>
  `;
}

async function viewPatientMemory() {
  const people = await dbAll("face_registry");
  const objects = await dbAll("object_registry");

  const peopleCards = people.length === 0
    ? `<p style="color:var(--ink-muted);font-size:14.5px;padding:20px 0;">No familiar people registered yet.</p>`
    : people.map(p => `
        <div class="quick-card" style="cursor:default;">
          <div class="quick-card-icon teal" style="font-size:26px;">👤</div>
          <div>
            <h3 style="font-family:'Instrument Serif',serif;font-size:22px;font-weight:400;letter-spacing:-0.02em;">${esc(p.name)}</h3>
            <p>${esc(p.relationship || "Familiar person")}</p>
          </div>
        </div>
      `).join("");

  const objectCards = objects.length === 0
    ? `<p style="color:var(--ink-muted);font-size:14.5px;padding:20px 0;">No objects registered yet.</p>`
    : objects.map(o => `
        <div class="quick-card" style="cursor:default;">
          <div class="quick-card-icon amber" style="font-size:26px;">📦</div>
          <div>
            <h3 style="font-family:'Instrument Serif',serif;font-size:22px;font-weight:400;letter-spacing:-0.02em;">${esc(o.name)}</h3>
            <p>${esc(o.description || o.cocoClass || "Familiar object")}</p>
          </div>
        </div>
      `).join("");

  return `
    <div class="patient-shell">
      <div class="container">
        <div class="patient-topbar">
          <div class="patient-topbar-inner">
            <div class="patient-greeting">
              <small>Familiar</small>
              My memories
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button onclick="goLanding()" class="btn btn-ghost" style="font-size: 13px; padding: 6px 12px; border-radius: 20px;">
                ← Exit
              </button>
              <div class="patient-avatar-chip">
                <div class="pav">👤</div>
                <span>User</span>
              </div>
            </div>
          </div>
        </div>

        <div class="patient-home">
          <div class="section-head" style="margin-top:12px;">
            <h2>People you know</h2>
          </div>
          <div class="quick-actions">${peopleCards}</div>

          <div class="section-head" style="margin-top:32px;">
            <h2>Familiar objects</h2>
          </div>
          <div class="quick-actions">${objectCards}</div>
        </div>
      </div>
      ${renderBottomNav("memory")}
    </div>
  `;
}

function viewPatientHelp() {
  return `
    <div class="patient-shell">
      <div class="container">
        <div class="patient-topbar">
          <div class="patient-topbar-inner">
            <div class="patient-greeting">
              <small>Need assistance?</small>
              Help
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button onclick="goLanding()" class="btn btn-ghost" style="font-size: 13px; padding: 6px 12px; border-radius: 20px;">
                ← Exit
              </button>
              <div class="patient-avatar-chip">
                <div class="pav">👤</div>
                <span>User</span>
              </div>
            </div>
          </div>
        </div>

        <div class="patient-home">
          <div class="quick-actions">
            <button class="quick-card" onclick="alert('Calling caregiver…')">
              <div class="quick-card-icon lav">📞</div>
              <div>
                <h3>Call caregiver</h3>
                <p>Reach your caregiver right away.</p>
              </div>
            </button>
            <button class="quick-card" onclick="alert('Emergency services…')">
              <div class="quick-card-icon rose">🚨</div>
              <div>
                <h3>Emergency help</h3>
                <p>Contact emergency services.</p>
              </div>
            </button>
            <button class="quick-card" onclick="openArMode()">
              <div class="quick-card-icon teal">📷</div>
              <div>
                <h3>Look around</h3>
                <p>Use the camera to understand where you are.</p>
              </div>
            </button>
            <button class="quick-card" onclick="goLanding()">
              <div class="quick-card-icon amber">🏠</div>
              <div>
                <h3>Return home</h3>
                <p>Back to the main screen.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      ${renderBottomNav("help")}
    </div>
  `;
}

function renderBottomNav(active) {
  const items = [
    { id:"home",       icon:"🏠", label:"Home",       action:"goPatient()" },
    { id:"activities", icon:"✅", label:"Activities", action:"goPatientActivities()" },
    { id:"memory",     icon:"📸", label:"Memory",     action:"goPatientMemory()" },
    { id:"help",       icon:"🆘", label:"Help",       action:"goPatientHelp()" },
  ];
  return `
    <div class="bottom-nav">
      ${items.map(it => `
        <button class="bottom-nav-btn ${active === it.id ? "active" : ""}" onclick="${it.action}">
          <div class="bottom-nav-icon">${it.icon}</div>
          <div class="bottom-nav-label">${it.label}</div>
        </button>
      `).join("")}
    </div>
  `;
}

function goPatientActivities(){ stopRecognition(); state.screen = "patient_activities"; render(); }
function goPatientMemory(){ stopRecognition(); state.screen = "patient_memory"; render(); }
function goPatientHelp(){ stopRecognition(); state.screen = "patient_help"; render(); }

/* ============================================================
   AR MODE
   ============================================================ */
function openArMode(mode) {
  state.screen = "ar_mode";
  state.recognition.mode = mode === "people" ? "people" : "live";
  render();
}

function viewArMode() {
  return `
    <div class="ar-screen">
      <div class="ar-camera-wrap">
        <video id="camera" autoplay muted playsinline></video>
        <canvas id="overlay"></canvas>

        <div class="ar-hud-top">
          <div class="ar-status-pill">
            <span class="ar-status-dot"></span>
            Recognizing…
          </div>
          <button class="ar-exit-btn" onclick="closeArMode()">✕ &nbsp;Done</button>
        </div>

        <div class="ar-overlay-stack" id="ar-overlay-stack"></div>

        <div class="ar-hud-bottom">
          <div class="ar-hint-chip">Point the camera at people or objects</div>
          <button class="ar-done-btn" onclick="closeArMode()">Done</button>
        </div>
      </div>
    </div>
  `;
}

function closeArMode() {
  stopRecognition();
  state.screen = "patient_home";
  render();
}

/* ============================================================
   USER ACTIVITY RUNNER
   ============================================================ */
function viewUserRunner() {
  const i = state.userIndex;
  const task = state.userTasks[i];
  if (!task) return "";

  const dots = state.userTasks.map((_,idx) =>
    `<div class="step-dot ${idx<i?"done":idx===i?"current":""}"></div>`
  ).join("");

  return `
    <div class="patient-shell" style="padding-bottom: 40px;">
      <div class="container" style="max-width: 900px;">
        <div class="patient-topbar">
          <div class="patient-topbar-inner">
            <div class="patient-greeting">
              <small>Step ${i+1} of ${state.userTasks.length}</small>
              ${esc(state.userActivity?.name || "Activity")}
            </div>
            <div class="patient-avatar-chip">
              <div class="pav">👤</div>
              <span>User</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 30px;">
          <div class="step-dots" style="margin-bottom: 32px;">${dots}</div>

          <div style="background: linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 100%);
                      border: 1px solid var(--line);
                      border-radius: var(--r-2xl);
                      padding: 48px 44px;
                      text-align: center;
                      box-shadow: 0 2px 6px rgba(11,20,55,0.04), 0 16px 44px rgba(11,20,55,0.06), 0 32px 80px rgba(123,127,239,0.06);">

            <div style="font-family: 'Instrument Serif', serif;
                        font-size: clamp(28px, 4vw, 44px);
                        font-weight: 400;
                        letter-spacing: -0.025em;
                        line-height: 1.15;
                        color: var(--ink);
                        margin-bottom: 40px;">
              ${esc(task.prompt)}
            </div>

            <div class="option-grid" id="option-grid"
                 style="display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 18px;
                        margin-top: 24px;">
              ${task.options.map((o,oi)=>`
                <button class="option-card" data-oi="${oi}" onclick="userPick(${oi})">
                  ${renderIcon(o.icon, 72)}
                  <div class="option-label">${esc(o.label)}</div>
                </button>`).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function startUserActivity(activityId) {
  const activity = await dbGet("activities", activityId);
  const tasks = (await dbAll("tasks")).filter(t => t.activity_id === activityId).sort((a,b)=>(a.order_index||0)-(b.order_index||0));
  if (!tasks.length) { alert("This activity has no tasks yet."); return; }

  const session = {
    id: uid(), activity_id: activityId, started_at: now(), completed_at: null, duration_seconds: 0,
    total_tasks: tasks.length, correct_tasks: 0,
    total_points: tasks.reduce((s,t)=>s+(t.points||1),0),
    earned_points: 0, score_percent: 0, status: "in_progress",
  };
  await dbPut("sessions", session);

  state.userSession = session;
  state.userTasks = tasks;
  state.userIndex = 0;
  state.userAttempts = [];
  state.userActivity = activity;
  state.screen = "user_runner";
  render();
}

async function userPick(optionIndex) {
  const task = state.userTasks[state.userIndex];
  const selected = task.options[optionIndex];
  let correct = false, correctLabels = [];

  if (["multiple_choice","yes_no","memory_recall","image_selection"].includes(task.type)) {
    correct = !!selected.correct;
    correctLabels = task.options.filter(o=>o.correct).map(o=>o.label);
  } else if (task.type === "ordering") {
    correct = selected.order === state.userIndex;
    correctLabels = task.options.slice().sort((a,b)=>a.order-b.order).map(o=>o.label);
  }

  await dbPut("attempts", {
    id: uid(), session_id: state.userSession.id, task_id: task.id,
    selected_json: JSON.stringify([selected.label]),
    is_correct: correct?1:0, time_taken_seconds: 0, attempted_at: now(),
  });
  state.userAttempts.push({ correct, task, selected, correctLabels });

  state.userSession.correct_tasks += correct?1:0;
  state.userSession.earned_points += correct ? (task.points||1) : 0;
  await dbPut("sessions", state.userSession);

  const cards = document.querySelectorAll(".option-card");
  cards.forEach(c=>c.style.pointerEvents="none");
  if (correct) cards[optionIndex].classList.add("correct");
  else { cards[optionIndex].classList.add("wrong"); task.options.forEach((o,oi)=>{ if (o.correct) cards[oi].classList.add("correct"); }); }

  setTimeout(()=>{ state.screen = "user_feedback"; render(); }, 900);
}

/* ============================================================
   USER FEEDBACK
   ============================================================ */
function viewUserFeedback() {
  const last = state.userAttempts[state.userAttempts.length-1];
  const task = last.task;
  const isCorrect = last.correct;
  const isLast = state.userIndex >= state.userTasks.length-1;
  const explanation = task.explanation || (isCorrect ? "Well done." : `The correct answer is: ${last.correctLabels.join(", ")}`);

  return `
    <div class="patient-shell" style="padding-bottom: 40px;">
      <div class="container" style="max-width: 720px;">
        <div style="margin-top: 60px;">
          <div style="background: linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 100%);
                      border: 1px solid var(--line);
                      border-radius: var(--r-2xl);
                      padding: 60px 40px;
                      text-align: center;
                      box-shadow: 0 2px 6px rgba(11,20,55,0.04), 0 16px 44px rgba(11,20,55,0.06), 0 32px 80px rgba(123,127,239,0.06);">

            <div style="font-size: 96px; margin-bottom: 24px; line-height: 1;">${isCorrect ? "✅" : "💡"}</div>

            <h2 style="font-family: 'Instrument Serif', serif;
                       font-size: 44px;
                       font-weight: 400;
                       letter-spacing: -0.025em;
                       margin-bottom: 16px;
                       color: ${isCorrect ? 'var(--success)' : 'var(--amber-deep)'};">
              ${isCorrect ? "Correct!" : "Not quite."}
            </h2>

            <p style="font-size: 20px;
                      color: var(--ink-muted);
                      line-height: 1.6;
                      margin-bottom: 40px;
                      max-width: 500px;
                      margin-left: auto;
                      margin-right: auto;">
              ${esc(explanation)}
            </p>

            <button class="btn btn-primary btn-lg" style="min-width: 260px;" onclick="userContinue()">
              ${isLast ? "Finish" : "Continue"} →
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function userContinue() {
  const isLast = state.userIndex >= state.userTasks.length-1;
  if (isLast) {
    const session = state.userSession;
    session.completed_at = now();
    session.duration_seconds = Math.round((session.completed_at - session.started_at)/1000);
    session.score_percent = session.total_points ? Math.round((session.earned_points/session.total_points)*100) : 0;
    session.status = "completed";
    await dbPut("sessions", session);
    state.screen = "user_completion";
  } else { state.userIndex += 1; state.screen = "user_runner"; }
  render();
}

/* ============================================================
   USER COMPLETION
   ============================================================ */
function viewUserCompletion() {
  const s = state.userSession;
  const score = Math.round(s.score_percent||0);
  const time = formatDuration(s.duration_seconds||0);

  return `
    <div class="patient-shell" style="padding-bottom: 40px;">
      <div class="container" style="max-width: 720px;">
        <div style="margin-top: 60px;">
          <div style="background: linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 100%);
                      border: 1px solid var(--line);
                      border-radius: var(--r-2xl);
                      padding: 60px 40px;
                      text-align: center;
                      box-shadow: 0 2px 6px rgba(11,20,55,0.04), 0 16px 44px rgba(11,20,55,0.06), 0 32px 80px rgba(123,127,239,0.06);">

            <div style="font-size: 108px; margin-bottom: 24px; line-height: 1;">🏆</div>

            <h2 style="font-family: 'Instrument Serif', serif;
                       font-size: 44px;
                       font-weight: 400;
                       letter-spacing: -0.025em;
                       margin-bottom: 12px;">
              Well done!
            </h2>

            <p style="font-size: 18px; color: var(--ink-muted); margin-bottom: 24px;">
              You finished <strong>${esc(state.userActivity?.name || "your activity")}</strong>.
            </p>

            <div style="font-family: 'Instrument Serif', serif;
                        font-size: 76px;
                        font-weight: 500;
                        letter-spacing: -0.04em;
                        background: linear-gradient(135deg, #7A7EF5 0%, var(--lav) 40%, var(--lav-deep) 100%);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        line-height: 1;
                        margin-bottom: 12px;">
              ${score}%
            </div>

            <p style="color: var(--ink-muted); font-size: 16px; font-weight: 600; margin-bottom: 32px;">
              ${s.correct_tasks} of ${s.total_tasks} correct &nbsp;·&nbsp; ${time}
            </p>

            <div class="step-dots" style="margin-bottom: 36px;">
              ${state.userTasks.map(()=>`<div class="step-dot done"></div>`).join("")}
            </div>

            <button class="btn btn-primary btn-lg" style="min-width: 260px;" onclick="finishUserFlow()">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function formatDuration(sec) {
  const m = Math.floor(sec/60), s = sec%60;
  return `${m} min ${s} sec`;
}

async function finishUserFlow() {
  const activities = (await dbAll("activities")).filter(a=>a.is_active).sort((a,b)=>(a.order_index||0)-(b.order_index||0));
  const idx = activities.findIndex(a=>a.id===state.userActivity?.id);
  const next = activities[idx+1];
  state.userSession = null; state.userTasks = []; state.userIndex = 0;
  if (next) startUserActivity(next.id);
  else { state.screen = "patient_home"; render(); }
}

/* ============================================================
   USER RECOGNITION
   ============================================================ */
function openUserFaceCheck() {
  state.recognition.mode = "user_faces";
  state.screen = "user_face_check";
  render();
}
function openUserObjectCheck() {
  state.recognition.mode = "user_objects";
  state.screen = "user_object_check";
  render();
}

function viewUserFaceCheck() {
  return `
    <div class="patient-shell">
      <div class="container" style="max-width:900px;">
        <h1 class="user-help-title">Who is with me?</h1>
        <div class="camera-box user-camera-box">
          <video id="camera" autoplay muted playsinline></video>
          <canvas id="overlay"></canvas>
          <div class="camera-status"><span class="status-dot"></span> Looking…</div>
        </div>
        <div id="user-recog-result" class="user-recog-result">
          <p class="user-recog-empty">Looking for faces…</p>
        </div>
        <button class="btn btn-primary btn-block" style="font-size:20px;padding:20px;margin-top:24px;" onclick="closeUserRecognition()">Done</button>
      </div>
    </div>
  `;
}

function viewUserObjectCheck() {
  return `
    <div class="patient-shell">
      <div class="container" style="max-width:900px;">
        <h1 class="user-help-title">What is this?</h1>
        <div class="camera-box user-camera-box">
          <video id="camera" autoplay muted playsinline></video>
          <canvas id="overlay"></canvas>
          <div class="camera-status"><span class="status-dot"></span> Looking…</div>
        </div>
        <div id="user-recog-result" class="user-recog-result">
          <p class="user-recog-empty">Looking for objects…</p>
        </div>
        <button class="btn btn-primary btn-block" style="font-size:20px;padding:20px;margin-top:24px;" onclick="closeUserRecognition()">Done</button>
      </div>
    </div>
  `;
}

function closeUserRecognition() {
  stopRecognition();
  state.screen = "patient_home";
  render();
}

/* ============================================================
   CAREGIVER DASHBOARD
   ============================================================ */
async function viewCaregiverDashboard() {
  const activities = (await dbAll("activities")).sort((a,b) => (a.order_index||0) - (b.order_index||0));
  const sessions = await dbAll("sessions");
  const completed = sessions.filter(s => s.status === "completed");
  const people = await dbAll("face_registry");
  const objects = await dbAll("object_registry");

  const tab = state.caregiverTab || "dashboard";

  return `
    <div class="caregiver-shell">
      ${renderSidebar(tab)}
      <div class="main">
        ${await renderCaregiverMain(tab, { activities, sessions, completed, people, objects })}
      </div>
    </div>
  `;
}

function renderSidebar(active) {
  const items = [
    { id:"dashboard",   icon:"▦",  label:"Dashboard",    action:"goCaregiverTab('dashboard')" },
    { id:"activities",  icon:"✓",  label:"Activities",   action:"goCaregiverTab('activities')" },
    { id:"people",      icon:"◉",  label:"People",       action:"goRecognition('people')" },
    { id:"objects",     icon:"◇",  label:"Objects",      action:"goRecognition('objects')" },
    { id:"recognition", icon:"◐",  label:"Recognition",  action:"goRecognition('live')" },
    { id:"analytics",   icon:"▤",  label:"Analytics",    action:"goAnalytics()" },
  ];

  return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-mark">R</div>
        RecallAR
      </div>
      
      <button onclick="goLanding()" class="btn btn-secondary" style="width: 100%; margin-bottom: 20px; display: flex; justify-content: flex-start; padding-left: 16px;">
        <span style="font-size: 18px; margin-right: 8px;">←</span> Switch Role (Exit)
      </button>
      
      <div class="sidebar-section">Workspace</div>
      ${items.map(it => `
        <div class="sidebar-link ${active === it.id ? "active" : ""}" onclick="${it.action}">
          <span class="sidebar-link-icon">${it.icon}</span>
          <span>${it.label}</span>
        </div>
      `).join("")}

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-av">🧑‍⚕️</div>
          <div>
            <div class="sidebar-user-name">Caregiver</div>
            <div class="sidebar-user-role">Demo session</div>
          </div>
        </div>
      </div>
    </aside>
  `;
}

function goCaregiverTab(tab) {
  stopRecognition();
  state.screen = "caregiver";
  state.caregiverTab = tab;
  render();
}
function goRecognition(mode) {
  state.recognition.mode = mode === "objects" ? "objects" : (mode === "live" ? "live" : "people");
  state.screen = "recognition";
  render();
}
function goAnalytics() {
  stopRecognition();
  state.screen = "analytics";
  render();
}

async function renderCaregiverMain(tab, data) {
  if (tab === "activities") return renderCaregiverActivities(data);
  if (tab === "people" || tab === "objects") return renderCaregiverPeopleTab(data, tab);
  return renderCaregiverOverview(data);
}

async function renderCaregiverOverview({ activities, sessions, completed, people, objects }) {
  const avg = avgScore(completed);
  const attempts = await dbAll("attempts");
  const totalAccuracy = attempts.length
    ? Math.round(attempts.filter(a=>a.is_correct).length / attempts.length * 100) : 0;

  const recent = sessions.slice().sort((a,b)=>b.completed_at-a.completed_at).slice(0, 5);

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(); day.setDate(day.getDate() - i);
    const start = new Date(day).setHours(0,0,0,0);
    const end   = new Date(day).setHours(23,59,59,999);
    const count = completed.filter(s => s.completed_at >= start && s.completed_at <= end).length;
    last7.push({ day: day.toLocaleDateString("en",{weekday:"short"}), count });
  }
  const maxCount = Math.max(1, ...last7.map(d=>d.count));

  return `
    <div class="main-topbar" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1>Caregiver dashboard</h1>
        <p>Overview of activity performance and engagement</p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-ghost" onclick="goLanding()" style="border: 1px solid var(--border);">← Exit</button>
        <button class="btn btn-primary" onclick="newActivity()">+ New activity</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total activities</div>
        <div class="stat-value">${activities.length}</div>
        <span class="stat-delta up">+${activities.filter(a=>a.is_active).length} active</span>
      </div>
      <div class="stat-card">
        <div class="stat-label">Completed sessions</div>
        <div class="stat-value">${completed.length}</div>
        <span class="stat-delta flat">all time</span>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average score</div>
        <div class="stat-value">${avg}<small>%</small></div>
        <span class="stat-delta ${avg >= 70 ? "up" : "flat"}">${avg >= 70 ? "on track" : "needs review"}</span>
      </div>
      <div class="stat-card">
        <div class="stat-label">Task accuracy</div>
        <div class="stat-value">${totalAccuracy}<small>%</small></div>
        <span class="stat-delta flat">${attempts.length} attempts</span>
      </div>
    </div>

    <div class="dash-grid">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Sessions — last 7 days</h3>
            <p>Completed activity runs per day</p>
          </div>
          <span class="panel-chip">weekly</span>
        </div>
        <div class="bar-chart-wrap">
          ${last7.map(d => `
            <div class="bar-col">
              <div class="bar-fill" style="height:${Math.max(6, (d.count / maxCount) * 100)}%;" title="${d.count} sessions"></div>
              <div class="bar-label">${d.day}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Registered people</h3>
            <p>Familiar faces in the system</p>
          </div>
          <span class="panel-chip">${people.length}</span>
        </div>
        <div class="session-list">
          ${people.length === 0
            ? `<p style="color:var(--ink-muted);font-size:14px;padding:12px 0;">No people registered yet.</p>`
            : people.slice(0,5).map(p => `
                <div class="session-row">
                  <div class="session-icon">👤</div>
                  <div class="session-body">
                    <div class="session-title">${esc(p.name)}</div>
                    <div class="session-meta">${esc(p.relationship || "Familiar person")}</div>
                  </div>
                </div>`).join("")}
        </div>
        <div style="margin-top:16px;">
          <button class="btn btn-secondary btn-block" onclick="goRecognition('people')">Manage people</button>
        </div>
      </div>
    </div>

    <div class="dash-grid-3">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Recent sessions</h3>
            <p>Latest activity runs</p>
          </div>
        </div>
        <div class="session-list">
          ${recent.length === 0
            ? `<p style="color:var(--ink-muted);font-size:14px;padding:12px 0;">No sessions yet.</p>`
            : recent.map(s => {
                const a = activities.find(x => x.id === s.activity_id);
                const scoreCls = (s.score_percent || 0) >= 70 ? "good" : "warn";
                return `
                  <div class="session-row">
                    <div class="session-icon">${iconFor(a?.icon || "home").emoji}</div>
                    <div class="session-body">
                      <div class="session-title">${esc(a?.name || "Activity")}</div>
                      <div class="session-meta">${new Date(s.completed_at).toLocaleString()}</div>
                    </div>
                    <div class="session-score ${scoreCls}">${Math.round(s.score_percent || 0)}%</div>
                  </div>`;
              }).join("")}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Registered objects</h3>
            <p>Familiar items recognized by the app</p>
          </div>
          <span class="panel-chip">${objects.length}</span>
        </div>
        <div class="session-list">
          ${objects.length === 0
            ? `<p style="color:var(--ink-muted);font-size:14px;padding:12px 0;">No objects registered yet.</p>`
            : objects.slice(0,5).map(o => `
                <div class="session-row">
                  <div class="session-icon">📦</div>
                  <div class="session-body">
                    <div class="session-title">${esc(o.name)}</div>
                    <div class="session-meta">${esc(o.cocoClass || "object")}</div>
                  </div>
                </div>`).join("")}
        </div>
        <div style="margin-top:16px;">
          <button class="btn btn-secondary btn-block" onclick="goRecognition('objects')">Manage objects</button>
        </div>
      </div>
    </div>
  `;
}

async function renderCaregiverActivities({ activities }) {
  const rows = activities.length === 0
    ? `<div class="empty-card"><div class="emoji">🗂️</div><h3>No activities yet</h3><p>Create your first cognitive activity to get started.</p><button class="btn btn-primary" onclick="newActivity()">+ Create activity</button></div>`
    : activities.map(a => `
        <div class="activity-row" onclick="editActivity('${a.id}')">
          <div class="activity-thumb">${renderIcon(a.icon||"home",30)}</div>
          <div class="activity-meta">
            <h3>${esc(a.name)}</h3>
            <p>${esc(a.category)} • ${esc(a.difficulty)} • ${a.estimated_minutes||0} min</p>
          </div>
          <span class="pill ${a.is_active?"active":"inactive"}">${a.is_active?"Active":"Inactive"}</span>
          <span class="chevron">›</span>
        </div>`).join("");

  return `
    <div class="main-topbar" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1>Activities</h1>
        <p>Manage personalized cognitive activities</p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-ghost" onclick="goLanding()" style="border: 1px solid var(--border);">← Exit</button>
        <button class="btn btn-primary" onclick="newActivity()">+ New activity</button>
      </div>
    </div>
    <div class="activity-list">${rows}</div>
  `;
}

async function renderCaregiverPeopleTab() {
  return `
    <div class="main-topbar">
      <div>
        <h1>Recognition</h1>
        <p>Register and manage familiar people &amp; objects</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost" onclick="goRecognition('people')">People</button>
        <button class="btn btn-ghost" onclick="goRecognition('objects')">Objects</button>
        <button class="btn btn-primary" onclick="goRecognition('live')">Live view</button>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Quick access</h3>
          <p>Use the recognition screens to register new entries.</p>
        </div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="goRecognition('people')">👥 Register a person</button>
        <button class="btn btn-primary" onclick="goRecognition('objects')">📦 Register an object</button>
        <button class="btn btn-secondary" onclick="goRecognition('live')">📷 Open live view</button>
      </div>
    </div>
  `;
}

function avgScore(sessions) {
  if (!sessions.length) return 0;
  return Math.round(sessions.reduce((s,x)=>s+(x.score_percent||0),0) / sessions.length);
}

/* ============================================================
   ACTIVITY FORM
   ============================================================ */
function newActivity(){ state.editingActivityId = null; state.screen = "activity_form"; render(); }
async function editActivity(id){ state.editingActivityId = id; state.screen = "activity_form"; render(); }

async function viewActivityForm() {
  const isEdit = !!state.editingActivityId;
  const activity = isEdit ? await dbGet("activities", state.editingActivityId) : null;
  const tasks = isEdit ? (await dbAll("tasks")).filter(t => t.activity_id === state.editingActivityId).sort((a,b)=>(a.order_index||0)-(b.order_index||0)) : [];

  const emojiGrid = Object.entries(ICONS).map(([k,v]) =>
    `<button type="button" class="emoji-option ${activity?.icon===k?"selected":""}" data-icon="${k}" onclick="pickIcon('${k}')">${v.emoji}</button>`).join("");

  const taskRows = tasks.length === 0
    ? `<div class="empty-card" style="padding:40px 20px;"><div class="emoji">🧩</div><h3>No tasks yet</h3><p>Add your first task to build this activity.</p></div>`
    : tasks.map((t,i) => `
        <div class="task-item">
          <div class="task-order">${i+1}</div>
          <div class="task-body">
            <div class="task-type">${taskTypeLabel(t.type)} • ${t.points} pt</div>
            <div class="task-prompt">${esc(t.prompt)}</div>
            <div class="task-answer">${taskAnswerSummary(t)}</div>
          </div>
          <div class="task-actions">
            <button class="icon-btn" title="Edit" onclick="editTask('${t.id}')">✏️</button>
            <button class="icon-btn" title="Duplicate" onclick="duplicateTask('${t.id}')">📋</button>
            <button class="icon-btn" title="Delete" onclick="deleteTask('${t.id}')">🗑️</button>
          </div>
        </div>`).join("");

  const activeVal = activity ? (activity.is_active ? 1 : 0) : 1;

  return `
    <div class="caregiver-shell">
      ${renderSidebar("activities")}
      <div class="main">
        <div class="main-topbar">
          <div>
            <h1>${isEdit ? "Edit activity" : "Create activity"}</h1>
            <p>${isEdit ? "Update the activity details and tasks." : "Give the activity a name, then add tasks step by step."}</p>
          </div>
          <button class="btn btn-ghost" onclick="goCaregiverTab('activities')">← Back</button>
        </div>

        <div class="form-card">
          <div class="form-row"><label>Activity name</label><input type="text" id="a-name" placeholder="e.g. Taking Medicine" value="${esc(activity?.name||"")}" /></div>
          <div class="form-grid-2">
            <div class="form-row"><label>Category</label><select id="a-category">${CATEGORIES.map(c=>`<option ${activity?.category===c?"selected":""}>${c}</option>`).join("")}</select></div>
            <div class="form-row"><label>Difficulty</label><select id="a-difficulty">${DIFFICULTIES.map(d=>`<option ${activity?.difficulty===d?"selected":""}>${d}</option>`).join("")}</select></div>
          </div>
          <div class="form-row"><label>Description (optional)</label><textarea id="a-description" placeholder="Short description...">${esc(activity?.description||"")}</textarea></div>
          <div class="form-grid-2">
            <div class="form-row"><label>Duration (minutes)</label><input type="number" id="a-duration" min="1" max="60" value="${activity?.estimated_minutes||5}" /></div>
            <div class="form-row"><label>Active</label><select id="a-active">
              <option value="1" ${activeVal?"selected":""}>Yes</option>
              <option value="0" ${!activeVal?"selected":""}>No</option>
            </select></div>
          </div>
          <div class="form-row"><label>Icon</label><div class="emoji-picker">${emojiGrid}</div><input type="hidden" id="a-icon" value="${esc(activity?.icon||"home")}" /></div>
        </div>

        <div class="section-head">
          <h2>Tasks</h2>
          <button class="btn btn-primary" onclick="addTaskToActivity()">+ Add task</button>
        </div>
        <div id="task-list">${taskRows}</div>

        <div class="modal-actions" style="margin-top:32px; justify-content:space-between; display:flex;">
          ${isEdit ? `<button class="btn btn-danger-ghost" onclick="removeActivity()">Delete activity</button>` : `<span></span>`}
          <div style="display:flex;gap:12px;">
            <button class="btn btn-secondary" onclick="goCaregiverTab('activities')">Cancel</button>
            <button class="btn btn-primary" onclick="saveActivity()">Save activity</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function pickIcon(key) {
  document.querySelectorAll(".emoji-option").forEach(el=>el.classList.remove("selected"));
  document.querySelector(`.emoji-option[data-icon="${key}"]`)?.classList.add("selected");
  $("#a-icon").value = key;
}

async function saveActivity() {
  const name = $("#a-name").value.trim();
  if (!name) { alert("Please enter an activity name."); return; }

  const id = state.editingActivityId || uid();
  const existing = state.editingActivityId ? await dbGet("activities", id) : null;
  const allActivities = await dbAll("activities");

  const activity = {
    id, name,
    category: $("#a-category").value,
    description: $("#a-description").value.trim(),
    difficulty: $("#a-difficulty").value,
    estimated_minutes: parseInt($("#a-duration").value) || 5,
    instructions: existing?.instructions || "Let's complete this activity together.",
    icon: $("#a-icon").value || "home",
    is_active: parseInt($("#a-active").value),
    order_index: existing?.order_index ?? allActivities.length,
    created_at: existing?.created_at || now(),
  };

  try {
    await dbPut("activities", activity);
  } catch (e) {
    console.error("Save failed:", e);
    alert("Could not save: " + e.message);
    return;
  }

  state.editingActivityId = null;
  goCaregiverTab("activities");
}

async function removeActivity() {
  if (!state.editingActivityId) return;
  if (!confirm("Delete this activity and all its tasks?")) return;

  try {
    const tasks = (await dbAll("tasks")).filter(t => t.activity_id === state.editingActivityId);
    for (const t of tasks) await dbDelete("tasks", t.id);
    await dbDelete("activities", state.editingActivityId);
  } catch (e) {
    console.error("Delete failed:", e);
    alert("Could not delete: " + e.message);
    return;
  }

  state.editingActivityId = null;
  goCaregiverTab("activities");
}

/* ============================================================
   TASK FORM
   ============================================================ */
async function addTaskToActivity(){ state.editingTask = null; state.screen = "task_form"; render(); }
async function editTask(id){ state.editingTask = await dbGet("tasks", id); state.screen = "task_form"; render(); }

async function duplicateTask(id) {
  try {
    const orig = await dbGet("tasks", id);
    if (!orig) return;
    await dbPut("tasks", {...orig, id: uid(), order_index: (orig.order_index||0) + 0.5});
    const all = (await dbAll("tasks")).filter(t => t.activity_id === state.editingActivityId).sort((a,b)=>(a.order_index||0)-(b.order_index||0));
    for (let i=0;i<all.length;i++){ all[i].order_index = i; await dbPut("tasks", all[i]); }
  } catch (e) {
    console.error("Duplicate failed:", e);
    alert("Could not duplicate: " + e.message);
    return;
  }
  await render();
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  try {
    await dbDelete("tasks", id);
    const all = (await dbAll("tasks")).filter(t => t.activity_id === state.editingActivityId).sort((a,b)=>(a.order_index||0)-(b.order_index||0));
    for (let i=0;i<all.length;i++){ all[i].order_index = i; await dbPut("tasks", all[i]); }
  } catch (e) {
    console.error("Delete failed:", e);
    alert("Could not delete: " + e.message);
    return;
  }
  await render();
}

function taskTypeLabel(t){ return TASK_TYPES.find(x=>x.id===t)?.label || t; }
function taskAnswerSummary(task) {
  if (!task.options) return "";
  if (task.type === "ordering") return `Sequence: ${task.options.slice().sort((a,b)=>a.order-b.order).map(o=>o.label).join(" → ")}`;
  const correct = task.options.filter(o=>o.correct).map(o=>o.label);
  return `Answer: ${correct.join(", ") || "—"}`;
}

async function viewTaskForm() {
  const editing = state.editingTask;
  const type = editing?.type || "multiple_choice";
  const typeOptions = TASK_TYPES.map(t=>`<option value="${t.id}" ${type===t.id?"selected":""}>${t.label}</option>`).join("");
  const defaultOptions = editing?.options || [{label:"",icon:"keys",correct:false},{label:"",icon:"phone",correct:false}];
  const optionsHtml = defaultOptions.map((o,i)=>renderOptionRow(o,i)).join("");

  return `
    <div class="caregiver-shell">
      ${renderSidebar("activities")}
      <div class="main">
        <div class="main-topbar">
          <div>
            <h1>${editing?"Edit task":"Add task"}</h1>
            <p>Choose a task type, enter the prompt, then pick the correct answer visually.</p>
          </div>
          <button class="btn btn-ghost" onclick="state.screen='activity_form';render();">← Back</button>
        </div>

        <div class="form-card">
          <div class="form-grid-2">
            <div class="form-row"><label>Task type</label><select id="t-type" onchange="changeTaskType()">${typeOptions}</select></div>
            <div class="form-row"><label>Points</label><input type="number" id="t-points" min="1" max="10" value="${editing?.points||1}" /></div>
          </div>
          <div class="form-row"><label>Question / instruction</label><textarea id="t-prompt" placeholder="What should you take before leaving home?">${esc(editing?.prompt||"")}</textarea></div>
          <div class="form-row"><label>Options</label><div id="options-list">${optionsHtml}</div><button class="btn btn-secondary mt-8" type="button" onclick="addOptionRow()">+ Add option</button></div>
          <div class="form-row"><label>Hint (optional)</label><input type="text" id="t-hint" value="${esc(editing?.hint||"")}" placeholder="A gentle reminder..." /></div>
          <div class="form-row"><label>Explanation (optional)</label><input type="text" id="t-explanation" value="${esc(editing?.explanation||"")}" placeholder="Why this answer is correct..." /></div>
        </div>

        <div class="modal-actions" style="justify-content:flex-end;display:flex;gap:12px;">
          <button class="btn btn-secondary" onclick="state.screen='activity_form';render();">Cancel</button>
          <button class="btn btn-primary" onclick="saveTask()">Save task</button>
        </div>
      </div>
    </div>
  `;
}

function renderOptionRow(opt, i) {
  return `
    <div class="option-row" data-opt-index="${i}">
      <select class="opt-icon" style="width:120px;">
        ${Object.entries(ICONS).map(([k,v])=>`<option value="${k}" ${opt.icon===k?"selected":""}>${v.emoji} ${k}</option>`).join("")}
      </select>
      <input type="text" class="opt-label" placeholder="Label" value="${esc(opt.label)}" />
      <button type="button" class="correct-toggle ${opt.correct?"on":""}" onclick="toggleCorrect(this)">${opt.correct?"✓":"○"}</button>
      <button type="button" class="icon-btn" onclick="this.parentElement.remove()">🗑️</button>
    </div>
  `;
}
function toggleCorrect(btn){ btn.classList.toggle("on"); btn.textContent = btn.classList.contains("on")?"✓":"○"; }
function addOptionRow() {
  const list = $("#options-list");
  const div = document.createElement("div");
  div.innerHTML = renderOptionRow({label:"",icon:"keys",correct:false}, list.children.length);
  list.appendChild(div.firstElementChild);
}
function changeTaskType() {
  const type = $("#t-type").value;
  const list = $("#options-list");
  list.innerHTML = "";
  if (type === "yes_no") {
    list.innerHTML = renderOptionRow({label:"Yes",icon:"check",correct:true},0) + renderOptionRow({label:"No",icon:"cross",correct:false},1);
  } else if (type === "ordering") {
    list.innerHTML = renderOptionRow({label:"Step 1",icon:"keys",correct:false,order:0},0) + renderOptionRow({label:"Step 2",icon:"phone",correct:false,order:1},1) + renderOptionRow({label:"Step 3",icon:"bag",correct:false,order:2},2);
  } else {
    list.innerHTML = renderOptionRow({label:"",icon:"keys",correct:false},0) + renderOptionRow({label:"",icon:"phone",correct:false},1);
  }
}

async function saveTask() {
  const type = $("#t-type").value;
  const prompt = $("#t-prompt").value.trim();
  if (!prompt) { alert("Please enter the question."); return; }

  const rows = Array.from(document.querySelectorAll(".option-row"));
  const options = rows.map((row,i) => ({
    label: row.querySelector(".opt-label").value.trim(),
    icon: row.querySelector(".opt-icon").value,
    correct: row.querySelector(".correct-toggle").classList.contains("on"),
    order: i,
  })).filter(o=>o.label);
  if (options.length < 2) { alert("Please add at least two options."); return; }

  const id = state.editingTask?.id || uid();
  const existing = state.editingTask;
  const activityId = state.editingActivityId;
  const allTasks = (await dbAll("tasks")).filter(t => t.activity_id === activityId);

  try {
    await dbPut("tasks", {
      id, activity_id: activityId, type, prompt,
      hint: $("#t-hint").value.trim(),
      explanation: $("#t-explanation").value.trim(),
      order_index: existing?.order_index ?? allTasks.length,
      points: parseInt($("#t-points").value)||1,
      options,
    });
  } catch (e) {
    console.error("Save task failed:", e);
    alert("Could not save task: " + e.message);
    return;
  }

  state.editingTask = null;
  state.screen = "activity_form";
  await render();
}

/* ============================================================
   ANALYTICS
   ============================================================ */
async function viewAnalytics() {
  const sessions = (await dbAll("sessions")).filter(s=>s.status==="completed");
  const attempts = await dbAll("attempts");
  const activities = await dbAll("activities");

  const totalAccuracy = attempts.length ? Math.round(attempts.filter(a=>a.is_correct).length / attempts.length * 100) : 0;
  const avg = avgScore(sessions);

  const last7 = [];
  for (let i=6;i>=0;i--) {
    const day = new Date(); day.setDate(day.getDate()-i);
    const start = new Date(day).setHours(0,0,0,0);
    const end = new Date(day).setHours(23,59,59,999);
    const count = sessions.filter(s=>s.completed_at>=start && s.completed_at<=end).length;
    last7.push({ day: day.toLocaleDateString("en",{weekday:"short"}), count });
  }
  const maxCount = Math.max(1, ...last7.map(d=>d.count));
  const recent = sessions.slice().sort((a,b)=>b.completed_at-a.completed_at).slice(0,5);

  return `
    <div class="caregiver-shell">
      ${renderSidebar("analytics")}
      <div class="main">
        <div class="main-topbar">
          <div>
            <h1>Analytics</h1>
            <p>Activity performance metrics for review. Not a medical diagnosis.</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Sessions completed</div>
            <div class="stat-value">${sessions.length}</div>
            <span class="stat-delta flat">all time</span>
          </div>
          <div class="stat-card">
            <div class="stat-label">Average score</div>
            <div class="stat-value">${avg}<small>%</small></div>
            <span class="stat-delta ${avg>=70?"up":"flat"}">${avg>=70?"on track":"review"}</span>
          </div>
          <div class="stat-card">
            <div class="stat-label">Task accuracy</div>
            <div class="stat-value">${totalAccuracy}<small>%</small></div>
            <span class="stat-delta flat">${attempts.length} attempts</span>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total activities</div>
            <div class="stat-value">${activities.length}</div>
            <span class="stat-delta up">${activities.filter(a=>a.is_active).length} active</span>
          </div>
        </div>

        <div class="dash-grid">
          <div class="panel">
            <div class="panel-head">
              <div>
                <h3>Sessions — last 7 days</h3>
                <p>Completed activity runs per day</p>
              </div>
              <span class="panel-chip">weekly</span>
            </div>
            <div class="bar-chart-wrap">
              ${last7.map(d => `
                <div class="bar-col">
                  <div class="bar-fill teal" style="height:${Math.max(6, (d.count / maxCount) * 100)}%;"></div>
                  <div class="bar-label">${d.day}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <div>
                <h3>Recent sessions</h3>
                <p>Latest activity runs</p>
              </div>
            </div>
            <div class="session-list">
              ${recent.length===0 ? `<p style="color:var(--ink-muted);font-size:14px;padding:12px 0;">No sessions yet.</p>` :
                recent.map(s=>{
                  const a = activities.find(x=>x.id===s.activity_id);
                  const cls = (s.score_percent||0) >= 70 ? "good" : "warn";
                  return `
                    <div class="session-row">
                      <div class="session-icon">${iconFor(a?.icon||"home").emoji}</div>
                      <div class="session-body">
                        <div class="session-title">${esc(a?.name||"Activity")}</div>
                        <div class="session-meta">${new Date(s.completed_at).toLocaleString()}</div>
                      </div>
                      <div class="session-score ${cls}">${Math.round(s.score_percent||0)}%</div>
                    </div>`;
                }).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   RECOGNITION
   ============================================================ */
async function openRecognition() {
  state.screen = "recognition";
  state.recognition.mode = "people";
  render();
}

async function viewRecognition() {
  const mode = state.recognition.mode;
  const people = await dbAll("face_registry");
  const objects = await dbAll("object_registry");

  const tabs = `
    <div class="tab-row">
      <button class="tab-btn ${mode==="people"?"active":""}" onclick="switchRecog('people')">👥 People</button>
      <button class="tab-btn ${mode==="objects"?"active":""}" onclick="switchRecog('objects')">📦 Objects</button>
      <button class="tab-btn ${mode==="live"?"active":""}" onclick="switchRecog('live')">📷 Live view</button>
    </div>
  `;

  let body = "";
  if (mode === "people")   body = peoplePanel(people);
  else if (mode === "objects") body = objectsPanel(objects);
  else body = livePanel();

  return `
    <div class="caregiver-shell">
      ${renderSidebar(mode === "objects" ? "objects" : "people")}
      <div class="main">
        <div class="main-topbar" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1>Recognition</h1>
            <p>Register and identify familiar people &amp; objects using the webcam.</p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-ghost" onclick="goLanding()" style="border: 1px solid var(--border);">← Exit</button>
            <button class="btn btn-ghost" onclick="goCaregiverTab('dashboard')">← Dashboard</button>
          </div>
        </div>
        ${tabs}
        ${body}
      </div>
    </div>
  `;
}

function peoplePanel(people) {
  const rows = people.length === 0
    ? `<p style="color:var(--ink-muted);font-size:14.5px;padding:20px 0;">No people registered yet.</p>`
    : people.map(p => `
        <div class="person-row">
          <div class="person-avatar">👤</div>
          <div class="person-info"><h4>${esc(p.name)}</h4><p>${esc(p.relationship || "—")}</p></div>
          <button class="btn btn-danger-ghost btn-tiny" onclick="deletePerson('${esc(p.name)}')">Delete</button>
        </div>`).join("");

  return `
    <div class="recognition-grid">
      <div>
        <div class="camera-box">
          <video id="camera" autoplay muted playsinline></video>
          <canvas id="overlay"></canvas>
          <div class="camera-status"><span class="status-dot"></span> Camera ready</div>
        </div>
        <div class="capture-hint">Look directly at the camera. Fill the frame with the face. Then click "Register face".</div>
        <div class="form-inline">
          <input type="text" id="person-name" placeholder="Name (e.g. Priya)" />
          <input type="text" id="person-relationship" placeholder="Relationship (e.g. Granddaughter)" />
          <button class="btn btn-primary" onclick="registerFace()">📸 Register face</button>
        </div>
      </div>
      <div>
        <div class="section-head"><h2 style="font-size:20px;">Registered people</h2></div>
        <div class="people-list">${rows}</div>
      </div>
    </div>
  `;
}

function objectsPanel(objects) {
  const rows = objects.length === 0
    ? `<p style="color:var(--ink-muted);font-size:14.5px;padding:20px 0;">No objects registered yet.</p>`
    : objects.map(o => `
        <div class="person-row">
          <div class="person-avatar object">📦</div>
          <div class="person-info"><h4>${esc(o.name)}</h4><p>${esc(o.description || o.cocoClass || "—")}</p></div>
          <button class="btn btn-danger-ghost btn-tiny" onclick="deleteObject('${esc(o.name)}')">Delete</button>
        </div>`).join("");

  return `
    <div class="recognition-grid">
      <div>
        <div class="camera-box">
          <video id="camera" autoplay muted playsinline></video>
          <canvas id="overlay"></canvas>
          <div class="camera-status"><span class="status-dot"></span> Camera ready</div>
        </div>
        <div class="capture-hint">Point at common objects (bottle, cup, phone, chair, book). Register with a custom name.</div>
        <div class="form-inline">
          <input type="text" id="object-name" placeholder="Custom name (e.g. My Water Bottle)" />
          <input type="text" id="object-desc" placeholder="Description (optional)" />
          <button class="btn btn-primary" onclick="registerObject()">📸 Register object</button>
        </div>
      </div>
      <div>
        <div class="section-head"><h2 style="font-size:20px;">Registered objects</h2></div>
        <div class="people-list">${rows}</div>
      </div>
    </div>
  `;
}

function livePanel() {
  return `
    <div class="camera-box" style="max-width:820px;margin:0 auto;">
      <video id="camera" autoplay muted playsinline></video>
      <canvas id="overlay"></canvas>
      <div class="camera-status"><span class="status-dot"></span> Live recognition</div>
    </div>
    <div class="section-head mt-24"><h2 style="font-size:20px;">Detected</h2></div>
    <div id="detected-chips"><p style="color:var(--ink-muted);font-size:14px;">Looking...</p></div>
  `;
}

/* ============================================================
   RECOGNITION HOOKS + LOOPS
   ============================================================ */
async function attachRecognitionHooks() {
  const video = $("#camera");
  if (!video) return;

  const statusEl = document.querySelector(".camera-status");
  if (statusEl) {
    statusEl.innerHTML = `<span class="status-dot"></span> Starting camera...`;
  }

  try {
    await Recog.startCamera(video);
    
    if (statusEl) {
      statusEl.innerHTML = `<span class="status-dot"></span> Loading AI models...`;
    }
  } catch (err) {
    console.error("Camera error:", err);
    video.parentElement.innerHTML = `<div class="camera-placeholder" style="color:#fff; padding: 40px; text-align: center;">Camera access denied or unavailable.<br>Please allow camera access in your phone settings and reload the app.</div>`;
    return;
  }

  const isUserMode = ["user_face_check","user_object_check"].includes(state.screen);
  const isArMode = state.screen === "ar_mode";

  Recog.loadAll()
    .then(() => {
      if (statusEl) {
        statusEl.innerHTML = `<span class="status-dot"></span> Camera ready`;
      }

      if (isUserMode) startUserRecognitionLoop();
      else if (isArMode) startArRecognitionLoop();
      else startRecognitionLoop();
    })
    .catch((err) => {
      console.error("Model load error:", err);
      if (statusEl) {
        statusEl.innerHTML = `<span class="status-dot" style="background:#D9455F; box-shadow: 0 0 12px #D9455F;"></span> Model load failed`;
      }
      alert("Could not load AI models. Please check your internet connection for the first run (needs ~15 MB).");
    });
}

function startRecognitionLoop() {
  const video = $("#camera");
  const canvas = $("#overlay");
  if (!video || !canvas) return;

  const ctx = canvas.getContext("2d");

  const tick = async () => {
    if (state.screen !== "recognition" || !$("#camera")) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      if (state.recognition.mode === "people") {
        const faces = await Recog.detectFaces(video);
        const registry = await loadFaceRegistryMap();
        for (const f of faces) {
          const { name, score } = Recog.findBestMatch(f.embedding, registry);
          drawBox(ctx, f.box, name ? `${name} ${Math.round(score*100)}%` : "Unknown", !!name, "#2E9E5B");
        }
      } else if (state.recognition.mode === "objects") {
        const objs = await Recog.detectObjects(video);
        const registry = await loadObjectRegistryMap();
        for (const o of objs) {
          const known = registry[o.label];
          const label = known ? known.name : o.label;
          drawBox(ctx, o.box, `${label} ${Math.round(o.score*100)}%`, !!known, "#2E9E5B");
        }
      } else {
        const [faces, objs] = await Promise.all([Recog.detectFaces(video), Recog.detectObjects(video)]);
        const faceReg = await loadFaceRegistryMap();
        const objReg = await loadObjectRegistryMap();
        const chips = [];

        for (const f of faces) {
          const { name, score } = Recog.findBestMatch(f.embedding, faceReg);
          drawBox(ctx, f.box, name ? `${name} ${Math.round(score*100)}%` : "Unknown person", !!name, "#2E9E5B");
          chips.push({ label: name || "Unknown person", known: !!name });
        }
        for (const o of objs) {
          const known = objReg[o.label];
          const label = known ? known.name : o.label;
          drawBox(ctx, o.box, `${label} ${Math.round(o.score*100)}%`, !!known, "#2E9E5B");
          chips.push({ label, known: !!known });
        }
        updateChips(chips);
      }
    } catch (err) {
      console.error("Recognition loop error:", err);
    }

    state.recognition.loopId = setTimeout(tick, 350);
  };

  tick();
}

function startArRecognitionLoop() {
  const video = $("#camera");
  const canvas = $("#overlay");
  if (!video || !canvas) return;

  const ctx = canvas.getContext("2d");

  const tick = async () => {
    if (state.screen !== "ar_mode" || !$("#camera")) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const [faces, objs] = await Promise.all([Recog.detectFaces(video), Recog.detectObjects(video)]);
      const faceReg = await loadFaceRegistryMap();
      const objReg = await loadObjectRegistryMap();

      const overlayStack = $("#ar-overlay-stack");
      const cards = [];

      for (const f of faces) {
        const { name, score } = Recog.findBestMatch(f.embedding, faceReg);
        drawBox(ctx, f.box, name ? `${name}` : "Unknown", !!name, "#6EE7B7");
        if (name) {
          cards.push(`
            <div class="ar-overlay-card">
              <div class="aro-avatar">👤</div>
              <div>
                <div class="aro-name">${esc(name)}</div>
                <div class="aro-role">${esc(faceReg[name]?.relationship || "Familiar person")}</div>
                <div class="aro-conf">MATCH ${Math.round(score*100)}%</div>
              </div>
            </div>`);
        }
      }

      for (const o of objs) {
        const known = objReg[o.label];
        const label = known ? known.name : o.label;
        drawBox(ctx, o.box, label, !!known, "#6EE7B7");
        if (known) {
          cards.push(`
            <div class="ar-overlay-card">
              <div class="aro-avatar obj">📦</div>
              <div>
                <div class="aro-name">${esc(label)}</div>
                <div class="aro-role">${esc(known.description || "Familiar object")}</div>
                <div class="aro-conf">MATCH ${Math.round(o.score*100)}%</div>
              </div>
            </div>`);
        }
      }

      if (overlayStack) {
        const uniq = [];
        const seen = new Set();
        for (const c of cards) { if (!seen.has(c)) { seen.add(c); uniq.push(c); } }
        overlayStack.innerHTML = uniq.slice(0, 3).join("");
      }
    } catch (err) {
      console.error("AR recognition error:", err);
    }

    state.recognition.loopId = setTimeout(tick, 400);
  };

  tick();
}

function drawBox(ctx, box, label, known, color) {
  const [x1, y1, x2, y2] = box;
  ctx.strokeStyle = known ? color : "#E8B14C";
  ctx.lineWidth = 3;
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  ctx.font = "600 15px Inter, sans-serif";
  const textW = ctx.measureText(label).width + 16;
  ctx.fillStyle = known ? color : "#E8B14C";
  ctx.fillRect(x1, Math.max(0, y1 - 26), textW, 24);
  ctx.fillStyle = "#fff";
  ctx.fillText(label, x1 + 8, Math.max(18, y1 - 8));
}

function updateChips(chips) {
  const el = $("#detected-chips");
  if (!el) return;
  if (chips.length === 0) { el.innerHTML = `<p style="color:var(--ink-muted);font-size:14px;">Nothing detected.</p>`; return; }
  el.innerHTML = chips.map(c => `<span class="detected-chip ${c.known?"known":"unknown"}">${c.known?"✓":"?"} ${esc(c.label)}</span>`).join("");
}

async function loadFaceRegistryMap() {
  const rows = await dbAll("face_registry");
  const map = {};
  for (const r of rows) map[r.name] = r;
  return map;
}
async function loadObjectRegistryMap() {
  const rows = await dbAll("object_registry");
  const map = {};
  for (const r of rows) map[r.cocoClass || r.name] = r;
  return map;
}

async function registerFace() {
  const name = $("#person-name").value.trim();
  const relationship = $("#person-relationship").value.trim();
  if (!name) { alert("Enter a name."); return; }

  const video = $("#camera");
  if (!video) return;

  try {
    const faces = await Recog.detectFaces(video);
    if (!faces.length) { alert("No face detected. Look at the camera and try again."); return; }

    const largest = faces.reduce((a,b) => {
      const aA = (a.box[2]-a.box[0]) * (a.box[3]-a.box[1]);
      const bA = (b.box[2]-b.box[0]) * (b.box[3]-b.box[1]);
      return aA > bA ? a : b;
    });

    await dbPut("face_registry", { id: name, name, relationship, embedding: largest.embedding, created_at: now() });
    $("#person-name").value = "";
    $("#person-relationship").value = "";
    await render();
  } catch (err) {
    console.error(err);
    alert("Could not register face: " + err.message);
  }
}

async function registerObject() {
  const name = $("#object-name").value.trim();
  const description = $("#object-desc").value.trim();
  if (!name) { alert("Enter a name."); return; }

  const video = $("#camera");
  if (!video) return;

  try {
    const objs = await Recog.detectObjects(video);
    
    let cocoClass = "custom";

    // If the AI finds an object, use its label
    if (objs.length > 0) {
      const largest = objs.reduce((a,b) => {
        const aA = (a.box[2]-a.box[0]) * (a.box[3]-a.box[1]);
        const bA = (b.box[2]-b.box[0]) * (b.box[3]-b.box[1]);
        return aA > bA ? a : b;
      });
      cocoClass = largest.label;
    }

    await dbPut("object_registry", { 
      id: name, 
      name, 
      description, 
      cocoClass: cocoClass, 
      created_at: now() 
    });
    
    $("#object-name").value = "";
    $("#object-desc").value = "";
    
    alert("Object saved successfully!");
    await render();
  } catch (err) {
    console.error(err);
    alert("Could not register object: " + err.message);
  }
}

async function deletePerson(name) {
  if (!confirm(`Delete "${name}"?`)) return;
  await dbDelete("face_registry", name);
  await render();
}
async function deleteObject(name) {
  if (!confirm(`Delete "${name}"?`)) return;
  await dbDelete("object_registry", name);
  await render();
}

function switchRecog(mode) {
  state.recognition.mode = mode;
  render();
}

function stopRecognition() {
  if (state.recognition.loopId) { clearTimeout(state.recognition.loopId); state.recognition.loopId = null; }
  Recog.stopCamera();
}

/* ============================================================
   USER RECOGNITION LOOP
   ============================================================ */
function startUserRecognitionLoop() {
  const video = $("#camera");
  const canvas = $("#overlay");
  if (!video || !canvas) return;

  const ctx = canvas.getContext("2d");
  const mode = state.recognition.mode;

  const tick = async () => {
    if (!["user_face_check","user_object_check"].includes(state.screen) || !$("#camera")) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      if (mode === "user_faces") {
        const faces = await Recog.detectFaces(video);
        const registry = await loadFaceRegistryMap();
        const recognized = [];
        for (const f of faces) {
          const { name } = Recog.findBestMatch(f.embedding, registry);
          const known = !!name;
          drawBox(ctx, f.box, name ? name : "Not sure", known, "#2E9E5B");
          recognized.push({ name: name || "Not sure", relationship: registry[name]?.relationship || "", known });
        }
        showUserFacesResult(recognized);
      } else {
        const objs = await Recog.detectObjects(video);
        const registry = await loadObjectRegistryMap();
        const recognized = [];
        for (const o of objs) {
          const known = registry[o.label];
          const label = known ? known.name : o.label;
          drawBox(ctx, o.box, label, !!known, "#2E9E5B");
          recognized.push({ name: label, known: !!known });
        }
        showUserObjectsResult(recognized);
      }
    } catch (err) {
      console.error("User recognition error:", err);
    }

    state.recognition.loopId = setTimeout(tick, 400);
  };

  tick();
}

function showUserFacesResult(list) {
  const el = $("#user-recog-result");
  if (!el) return;
  if (list.length === 0) { el.innerHTML = `<p class="user-recog-empty">No one detected. Point the camera at a person.</p>`; return; }
  const seen = new Set();
  const unique = list.filter(p => { const k = p.name; if (seen.has(k)) return false; seen.add(k); return true; });
  el.innerHTML = unique.map(p => `
    <div class="user-recog-card ${p.known ? "known" : "unknown"}">
      <div class="user-recog-emoji">${p.known ? "👤" : "❔"}</div>
      <div>
        <div class="user-recog-name">${esc(p.name)}</div>
        ${p.relationship ? `<div class="user-recog-sub">${esc(p.relationship)}</div>` : ``}
      </div>
    </div>
  `).join("");
}

function showUserObjectsResult(list) {
  const el = $("#user-recog-result");
  if (!el) return;
  if (list.length === 0) { el.innerHTML = `<p class="user-recog-empty">No objects detected. Point the camera at an object.</p>`; return; }
  const seen = new Set();
  const unique = list.filter(o => { const k = o.name; if (seen.has(k)) return false; seen.add(k); return true; });
  el.innerHTML = unique.map(o => `
    <div class="user-recog-card ${o.known ? "known" : "unknown"}">
      <div class="user-recog-emoji">${o.known ? "📦" : "❔"}</div>
      <div class="user-recog-name">${esc(o.name)}</div>
    </div>
  `).join("");
}

/* ============================================================
   BOOTSTRAP
   ============================================================ */
(async function boot() {
  state.screen = "loading";
  render();
  try {
    await openDB();
    await seedIfEmpty();
  } catch (e) {
    console.error("Boot failed:", e);
    document.getElementById("app").innerHTML = `
      <div style="padding:60px;text-align:center;font-family:Inter,sans-serif;">
        <h1 style="color:#D9455F;">Storage Error</h1>
        <p style="color:#5A5F73;font-size:16px;margin-top:12px;">
          Could not open the local database.<br>Please restart the app.
        </p>
      </div>`;
    return;
  }
  state.screen = "landing";
  render();
})();