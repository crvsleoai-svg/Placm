/* ==========================================================================
   PLACEMENT COMMAND CENTER — script.js
   Vanilla JS. No build step. No frameworks. No network calls.
   Data layer: DATA (in-memory) <-> localStorage("pcc_data")
   ========================================================================== */

const STORAGE_KEY = "pcc_data_v1";
let DATA = null;
let currentMode = "full";

/* ---------------------------------------------------------------------- */
/* Storage                                                                 */
/* ---------------------------------------------------------------------- */

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      DATA = migrateData(parsed);
    } else {
      DATA = buildDefaultData();
    }
  } catch (e) {
    console.error("Failed to load data, starting fresh.", e);
    DATA = buildDefaultData();
  }
  saveData();
}

function migrateData(parsed) {
  const fresh = buildDefaultData();
  // shallow-merge top level, keep arrays/objects the user already has
  const merged = { ...fresh, ...parsed };
  // ensure new keys added after user's first save still exist
  Object.keys(fresh).forEach(k => {
    if (merged[k] === undefined) merged[k] = fresh[k];
  });
  if (!merged.offcampusWatchlist || merged.offcampusWatchlist.length === 0) {
    merged.offcampusWatchlist = fresh.offcampusWatchlist;
  }
  if (!merged.govExams || merged.govExams.length === 0) {
    merged.govExams = fresh.govExams;
  }
  return merged;
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
    const el = document.getElementById("saveIndicator");
    if (el) {
      el.textContent = "Saved " + new Date().toLocaleTimeString();
      el.classList.remove("flash");
      void el.offsetWidth;
      el.classList.add("flash");
    }
  } catch (e) {
    console.error("Save failed", e);
    const el = document.getElementById("saveIndicator");
    if (el) el.textContent = "Save failed — storage may be full";
  }
}

/* ---------------------------------------------------------------------- */
/* Small utils                                                             */
/* ---------------------------------------------------------------------- */

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
function el(tag, attrs, children) {
  const e = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(k => {
    if (k === "class") e.className = attrs[k];
    else if (k === "html") e.innerHTML = attrs[k];
    else if (k.startsWith("on") && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  });
  (children || []).forEach(c => { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  return e;
}
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function pct(n, d) { return d > 0 ? Math.round((n / d) * 100) : 0; }
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
function startOfWeek(dateObj) {
  const d = new Date(dateObj);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
}
function toISODate(d) {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}
function withinRange(iso, fromISO, toISO_) {
  if (!iso) return false;
  return iso >= fromISO && iso <= toISO_;
}
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str).replace(/[&<>"']/g, s => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[s]));
}

/* ---------------------------------------------------------------------- */
/* Countdown + urgency                                                     */
/* ---------------------------------------------------------------------- */

function calculateCountdown() {
  const deadline = new Date(DEADLINE_ISO);
  const now = new Date();
  const ms = deadline - now;
  const days = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  let urgency;
  if (days > 90) urgency = "NORMAL SPRINT";
  else if (days > 60) urgency = "HIGH FOCUS";
  else if (days > 30) urgency = "INTENSIVE";
  else if (days > 14) urgency = "URGENT";
  else urgency = "FINAL SPRINT";
  return { days, urgency };
}

/* ---------------------------------------------------------------------- */
/* Streak                                                                   */
/* ---------------------------------------------------------------------- */

function computeStreak() {
  // a day "counts" if at least one today-task was checked that day
  let streak = 0;
  let cursor = new Date();
  for (;;) {
    const iso = toISODate(cursor);
    const day = DATA.todayTasks[iso];
    const didSomething = day && day.tasks && day.tasks.some(t => t.checked);
    if (didSomething) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // allow today to be "in progress" without breaking the streak count from yesterday
      if (iso === toISODate(new Date())) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

/* ---------------------------------------------------------------------- */
/* Quotes — deterministic by date, no API                                  */
/* ---------------------------------------------------------------------- */

function quoteOfTheDay() {
  const iso = toISODate(new Date());
  let hash = 0;
  for (let i = 0; i < iso.length; i++) hash = (hash * 31 + iso.charCodeAt(i)) >>> 0;
  return QUOTES[hash % QUOTES.length];
}

/* ---------------------------------------------------------------------- */
/* Header render                                                           */
/* ---------------------------------------------------------------------- */

function renderHeader() {
  const { days, urgency } = calculateCountdown();
  $("#countdownDays").textContent = days;
  $("#countdownUrgency").textContent = urgency;
  $("#countdownUrgency").dataset.level = urgency.replace(/\s+/g, "-");
  $("#todayDateLabel").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

  const iso = toISODate(new Date());
  const todayEntry = DATA.todayTasks[iso];
  const completion = todayEntry ? pct(todayEntry.tasks.filter(t => t.checked).length, todayEntry.tasks.length) : 0;
  $("#headerCompletion").textContent = completion + "%";
  $("#headerStreak").textContent = computeStreak();

  const weekStartISO = toISODate(startOfWeek(new Date()));
  const weekEndISO = toISODate(new Date());
  const appsThisWeek = DATA.offcampus.filter(a => withinRange(a.dateApplied, weekStartISO, weekEndISO)).length
    + DATA.campusCompanies.filter(c => c.applied && withinRange(c._appliedDate || "", weekStartISO, weekEndISO)).length;
  $("#headerAppsWeek").textContent = appsThisWeek;

  const dsaThisWeek = DATA.dsa.filter(r => withinRange(r.date, weekStartISO, weekEndISO)).length;
  const aptThisWeek = DATA.aptitude.reduce((sum, r) => sum + (withinRange(r.date, weekStartISO, weekEndISO) ? (Number(r.attempted) || 0) : 0), 0);
  $("#headerProblemsWeek").textContent = (dsaThisWeek + aptThisWeek);

  $("#quoteOfDay").textContent = quoteOfTheDay();

  $all(".mode-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === currentMode));
  $("#modeHint").textContent = TIME_MODES[currentMode].hint.toUpperCase();
}

/* ---------------------------------------------------------------------- */
/* Navigation                                                               */
/* ---------------------------------------------------------------------- */

function switchView(name) {
  $all(".view").forEach(v => v.classList.toggle("visible", v.id === "view-" + name));
  $all(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  if (name === "today") renderToday();
  if (name === "dashboard") renderDashboard();
  if (name === "campus") renderCampus();
  if (name === "offcampus") renderOffCampus();
  if (name === "government") renderGovernment();
  if (name === "settings") renderSettings();
}

function setMode(mode) {
  currentMode = mode;
  DATA.settings.lastMode = mode;
  saveData();
  renderHeader();
  renderToday();
}

/* ---------------------------------------------------------------------- */
/* TODAY — daily execution system                                          */
/* ---------------------------------------------------------------------- */

function ensureTodayTasks(dateISO, mode) {
  let entry = DATA.todayTasks[dateISO];
  const modeConf = TIME_MODES[mode];
  const wanted = modeConf.tasks;
  if (!entry || entry.mode !== mode) {
    // build fresh, but preserve checked/actual values for tasks that existed before
    const prevTasksByKey = {};
    if (entry) entry.tasks.forEach(t => prevTasksByKey[t.key] = t);
    const tasks = wanted.map(key => {
      const cat = TODAY_CATEGORIES.find(c => c.key === key);
      const prev = prevTasksByKey[key];
      return prev ? prev : {
        key, label: cat ? cat.label : key,
        checked: false,
        planned: (MODE_TASK_MINUTES[mode] && MODE_TASK_MINUTES[mode][key]) || 15,
        actual: 0,
        status: "Not started",
        notes: ""
      };
    });
    entry = { mode, dateISO, tasks };
    DATA.todayTasks[dateISO] = entry;
    saveData();
  }
  return entry;
}

function renderToday() {
  const dateISO = toISODate(new Date());
  const entry = ensureTodayTasks(dateISO, currentMode);
  $("#todayTitle").textContent = "TODAY — " + new Date().toLocaleDateString(undefined, { day:"2-digit", month:"long", year:"numeric" }).toUpperCase();
  $("#todayModeLabel").textContent = TIME_MODES[entry.mode].label;

  const wrap = $("#todayChecklist");
  wrap.innerHTML = "";
  entry.tasks.forEach((t, idx) => {
    const row = el("div", { class: "today-row" + (t.checked ? " done" : "") });

    const cb = el("input", { type: "checkbox" });
    cb.checked = t.checked;
    cb.addEventListener("change", () => {
      t.checked = cb.checked;
      t.status = cb.checked ? "Done" : (t.status === "Done" ? "Not started" : t.status);
      saveData();
      renderToday();
      renderHeader();
    });

    const label = el("span", { class: "today-label" }, [t.label]);

    const planned = el("input", { type: "number", min: "0", class: "mini-input", title: "Planned minutes" });
    planned.value = t.planned;
    planned.addEventListener("change", () => { t.planned = Number(planned.value) || 0; saveData(); });

    const actual = el("input", { type: "number", min: "0", class: "mini-input", title: "Actual minutes" });
    actual.value = t.actual;
    actual.addEventListener("change", () => { t.actual = Number(actual.value) || 0; saveData(); });

    const status = el("select", { class: "mini-select" });
    ["Not started","In progress","Done","Skipped"].forEach(s => {
      const o = el("option", { value: s }, [s]);
      if (t.status === s) o.selected = true;
      status.appendChild(o);
    });
    status.addEventListener("change", () => {
      t.status = status.value;
      t.checked = status.value === "Done";
      saveData();
      renderToday();
      renderHeader();
    });

    const notes = el("input", { type: "text", class: "notes-input", placeholder: "notes…" });
    notes.value = t.notes || "";
    notes.addEventListener("change", () => { t.notes = notes.value; saveData(); });

    row.appendChild(cb);
    row.appendChild(label);
    row.appendChild(el("span", { class: "field-label" }, ["planned"]));
    row.appendChild(planned);
    row.appendChild(el("span", { class: "field-label" }, ["actual"]));
    row.appendChild(actual);
    row.appendChild(status);
    row.appendChild(notes);
    wrap.appendChild(row);
  });

  // TODAY'S STATUS summary
  const statusWrap = $("#todayStatusSummary");
  statusWrap.innerHTML = "";
  const doneCount = entry.tasks.filter(t => t.checked).length;
  entry.tasks.forEach(t => {
    statusWrap.appendChild(el("span", { class: "status-chip" + (t.checked ? " ok" : "") }, [t.label + (t.checked ? " ✓" : "")]));
  });
  $("#todayCompletionText").textContent = doneCount + " / " + entry.tasks.length + " complete";

  // "What matters most tomorrow" — weakest unfinished item, falling back to weak-area detector
  const unfinished = entry.tasks.filter(t => !t.checked);
  let nextFocus;
  if (unfinished.length) {
    nextFocus = unfinished[0].label;
  } else {
    const weak = detectWeakAreas();
    nextFocus = weak.length ? weak[0].label : "Keep the streak going — revision + a mock test.";
  }
  $("#tomorrowFocus").textContent = nextFocus;

  const weekday = new Date().getDay();
  $("#weeklyFocusHint").textContent = WEEKLY_FOCUS[weekday];
}

/* ---------------------------------------------------------------------- */
/* Generic tracker CRUD component                                          */
/* Renders: optional stats block, add/edit form, filterable table.         */
/* ---------------------------------------------------------------------- */

function renderTracker(containerEl, opts) {
  // opts: { key, schema, title, statsFn(records)->HTMLnodes[], rowSummary(record)->string[] columns to show in table (keys) }
  const records = DATA[opts.key];
  containerEl.innerHTML = "";

  const card = el("div", { class: "panel" });
  card.appendChild(el("h3", {}, [opts.title]));

  if (opts.statsFn) {
    const statsBar = el("div", { class: "stat-row" });
    opts.statsFn(records).forEach(s => statsBar.appendChild(s));
    card.appendChild(statsBar);
  }

  // toolbar: search + add button
  const toolbar = el("div", { class: "toolbar" });
  const search = el("input", { type: "text", placeholder: "Search…", class: "search-input" });
  const addBtn = el("button", { class: "btn primary" }, ["+ Add entry"]);
  toolbar.appendChild(search);
  toolbar.appendChild(addBtn);
  card.appendChild(toolbar);

  const formHost = el("div", { class: "form-host" });
  card.appendChild(formHost);

  const tableHost = el("div", { class: "table-host" });
  card.appendChild(tableHost);

  function refreshTable() {
    tableHost.innerHTML = "";
    const q = search.value.trim().toLowerCase();
    const cols = opts.columns || opts.schema.slice(0, 6).map(f => f.key);
    const table = el("table", { class: "data-table" });
    const thead = el("thead");
    const headRow = el("tr");
    cols.forEach(c => {
      const field = opts.schema.find(f => f.key === c);
      headRow.appendChild(el("th", {}, [field ? field.label : c]));
    });
    headRow.appendChild(el("th", {}, ["Actions"]));
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = el("tbody");
    const filtered = records.filter(r => {
      if (!q) return true;
      return cols.some(c => String(r[c] || "").toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      const emptyRow = el("tr");
      const td = el("td", { colspan: String(cols.length + 1), class: "empty-cell" }, [
        records.length === 0 ? "No entries yet — add your first one above." : "No entries match your search."
      ]);
      emptyRow.appendChild(td);
      tbody.appendChild(emptyRow);
    }

    filtered.slice().reverse().forEach(r => {
      const tr = el("tr");
      cols.forEach(c => {
        const field = opts.schema.find(f => f.key === c);
        let val = r[c];
        if (field && field.type === "checkbox") val = val ? "✓" : "—";
        if (field && field.type === "date") val = val ? fmtDate(val) : "—";
        if (field && field.type === "textarea" && val && val.length > 60) val = val.slice(0, 60) + "…";
        tr.appendChild(el("td", {}, [String(val === undefined || val === null || val === "" ? "—" : val)]));
      });
      const actionsTd = el("td", { class: "actions-cell" });
      const editBtn = el("button", { class: "btn tiny" }, ["Edit"]);
      editBtn.addEventListener("click", () => openForm(r));
      const delBtn = el("button", { class: "btn tiny danger" }, ["Delete"]);
      delBtn.addEventListener("click", () => {
        if (confirm("Delete this entry?")) {
          const i = DATA[opts.key].findIndex(x => x.id === r.id);
          if (i > -1) DATA[opts.key].splice(i, 1);
          saveData();
          refreshTable();
          if (opts.onChange) opts.onChange();
        }
      });
      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(delBtn);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableHost.appendChild(table);
  }

  function openForm(existing) {
    formHost.innerHTML = "";
    const form = el("div", { class: "record-form" });
    const inputs = {};
    opts.schema.forEach(field => {
      const group = el("label", { class: "form-field" }, [field.label]);
      let input;
      const currentVal = existing ? existing[field.key] : (field.default ? field.default() : "");
      if (field.type === "textarea") {
        input = el("textarea", { rows: "2" });
        input.value = currentVal || "";
      } else if (field.type === "checkbox") {
        input = el("input", { type: "checkbox" });
        input.checked = !!currentVal;
      } else if (field.type === "select") {
        input = el("select");
        if (field.allowCustom) {
          input.appendChild(el("option", { value: "" }, ["— choose or type custom below —"]));
        }
        (field.options || []).forEach(o => {
          const opt = el("option", { value: o }, [o]);
          if (currentVal === o) opt.selected = true;
          input.appendChild(opt);
        });
      } else {
        input = el("input", { type: field.type === "number" ? "number" : field.type === "date" ? "date" : "text" });
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        input.value = currentVal === undefined || currentVal === null ? "" : currentVal;
      }
      group.appendChild(input);
      inputs[field.key] = input;
      form.appendChild(group);

      if (field.allowCustom) {
        const customInput = el("input", { type: "text", placeholder: "or type a custom value…", class: "custom-field" });
        if (currentVal && field.options && !field.options.includes(currentVal)) customInput.value = currentVal;
        form.appendChild(el("label", { class: "form-field custom-label" }, ["Custom " + field.label.toLowerCase(), customInput]));
        inputs[field.key + "__custom"] = customInput;
      }
    });

    const actions = el("div", { class: "form-actions" });
    const saveBtn = el("button", { class: "btn primary" }, [existing ? "Save changes" : "Add entry"]);
    const cancelBtn = el("button", { class: "btn" }, ["Cancel"]);
    saveBtn.addEventListener("click", () => {
      const record = existing ? { ...existing } : { id: uid() };
      let missingRequired = false;
      opts.schema.forEach(field => {
        const inputEl = inputs[field.key];
        let value;
        if (field.type === "checkbox") value = inputEl.checked;
        else value = inputEl.value;
        if (field.allowCustom && inputs[field.key + "__custom"].value.trim()) {
          value = inputs[field.key + "__custom"].value.trim();
        }
        if (field.type === "number" && value !== "") value = Number(value);
        if (field.required && (value === "" || value === undefined)) missingRequired = true;
        record[field.key] = value;
      });
      if (missingRequired) { alert("Please fill in the required field(s)."); return; }
      if (!existing) {
        DATA[opts.key].push(record);
      } else {
        const i = DATA[opts.key].findIndex(x => x.id === existing.id);
        if (i > -1) DATA[opts.key][i] = record;
      }
      saveData();
      formHost.innerHTML = "";
      refreshTable();
      if (opts.statsFn) { // repaint stats bar
        renderTracker(containerEl, opts);
      }
      if (opts.onChange) opts.onChange();
    });
    cancelBtn.addEventListener("click", () => { formHost.innerHTML = ""; });
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    form.appendChild(actions);
    formHost.appendChild(form);
    formHost.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  addBtn.addEventListener("click", () => openForm(null));
  search.addEventListener("input", refreshTable);
  refreshTable();
  containerEl.appendChild(card);
}

function statCard(value, label) {
  return el("div", { class: "stat-card" }, [
    el("div", { class: "stat-value" }, [String(value)]),
    el("div", { class: "stat-label" }, [label])
  ]);
}

/* ---------------------------------------------------------------------- */
/* Readiness engine — heuristic, effort-weighted, not a guarantee          */
/* ---------------------------------------------------------------------- */

function readinessDSA() {
  let score = 0;
  DATA.dsa.forEach(r => {
    if (r.independent && r.canExplain) score += 4;
    else if (r.independent) score += 3;
    else if (r.solved) score += 1.5;
    else if (r.attempted) score += 0.5;
  });
  return clamp(Math.round(score / 200 * 100), 0, 100);
}
function readinessAptitude() {
  const withAttempts = DATA.aptitude.filter(r => Number(r.attempted) > 0);
  if (!withAttempts.length) return 0;
  const totalAttempted = withAttempts.reduce((s, r) => s + Number(r.attempted), 0);
  const totalCorrect = withAttempts.reduce((s, r) => s + Number(r.correct || 0), 0);
  const accuracy = pct(totalCorrect, totalAttempted);
  const volumeFactor = clamp(totalAttempted / 300, 0, 1); // 300+ attempted = full volume credit
  return clamp(Math.round(accuracy * volumeFactor), 0, 100);
}
function readinessCS() {
  if (!DATA.cs.length) return 0;
  const ready = DATA.cs.filter(r => r.canExplain && r.interviewReady).length;
  return clamp(Math.round(ready / Math.max(8, DATA.cs.length) * 100), 0, 100);
}
function readinessJavaSql() {
  const all = [...DATA.java, ...DATA.sql];
  if (!all.length) return 0;
  const ready = all.filter(r => r.canExplain).length;
  return clamp(Math.round(ready / Math.max(10, all.length) * 100), 0, 100);
}
function readinessResume() {
  if (!DATA.resume.length) return 0;
  const strong = DATA.resume.filter(r => r.spoken && Number(r.confidence) >= 7 && Number(r.technicalAccuracy) >= 7).length;
  return clamp(Math.round(strong / Math.max(RESUME_QUESTIONS.length, DATA.resume.length) * 100), 0, 100);
}
function readinessProject() {
  if (!DATA.project.length) return 0;
  const strong = DATA.project.filter(r => r.canExplainWithoutNotes && Number(r.confidence) >= 7).length;
  return clamp(Math.round(strong / Math.max(6, DATA.project.length) * 100), 0, 100);
}
function readinessTechnical() {
  if (!DATA.technical.length) return 0;
  const avg = DATA.technical.reduce((s, r) => s + (Number(r.score) || 0), 0) / DATA.technical.length;
  return clamp(Math.round(avg * 10), 0, 100);
}
function readinessHR() {
  if (!DATA.hr.length) return 0;
  const strong = DATA.hr.filter(r => r.spokenAnswer && Number(r.confidence) >= 7).length;
  return clamp(Math.round(strong / Math.max(HR_QUESTIONS.length, DATA.hr.length) * 100), 0, 100);
}
function readinessOA() {
  if (!DATA.oa.length) return 0;
  const avg = DATA.oa.reduce((s, r) => s + (Number(r.attempted) ? pct(Number(r.correct||0), Number(r.attempted)) : 0), 0) / DATA.oa.length;
  return clamp(Math.round(avg), 0, 100);
}
function readinessMock() {
  if (!DATA.mockInterview.length) return 0;
  const keys = ["technicalScore","dsaScore","csScore","projectScore","communicationScore","englishScore","hrScore"];
  let total = 0, count = 0;
  DATA.mockInterview.forEach(r => keys.forEach(k => { if (r[k] !== undefined && r[k] !== "") { total += Number(r[k]); count++; } }));
  if (!count) return 0;
  return clamp(Math.round((total / count) * 10), 0, 100);
}
function readinessEnglish() {
  if (!DATA.english.length) return 0;
  const avg = DATA.english.reduce((s, r) => s + ((Number(r.confidence||0) + Number(r.clarity||0) + Number(r.fluency||0)) / 3), 0) / DATA.english.length;
  return clamp(Math.round(avg * 10), 0, 100);
}
function readinessApplications() {
  const weekStartISO = toISODate(startOfWeek(new Date()));
  const weekEndISO = toISODate(new Date());
  const count = DATA.offcampus.filter(a => withinRange(a.dateApplied, weekStartISO, weekEndISO)).length;
  return clamp(Math.round(count / 5 * 100), 0, 100);
}

function allReadiness() {
  return [
    { key:"dsa", label:"DSA", value: readinessDSA() },
    { key:"aptitude", label:"Aptitude", value: readinessAptitude() },
    { key:"cs", label:"CS Fundamentals", value: readinessCS() },
    { key:"javaSql", label:"Java / OOP / SQL", value: readinessJavaSql() },
    { key:"resume", label:"Resume", value: readinessResume() },
    { key:"project", label:"Project Interview", value: readinessProject() },
    { key:"technical", label:"Technical Interview", value: readinessTechnical() },
    { key:"hr", label:"HR Interview", value: readinessHR() },
    { key:"oa", label:"OA", value: readinessOA() },
    { key:"mock", label:"Mock Interviews", value: readinessMock() },
    { key:"english", label:"English / Communication", value: readinessEnglish() },
    { key:"applications", label:"Applications (this week)", value: readinessApplications() }
  ];
}

function overallReadiness() {
  const all = allReadiness();
  return Math.round(all.reduce((s, r) => s + r.value, 0) / all.length);
}

/* ---------------------------------------------------------------------- */
/* Weak area detector                                                      */
/* ---------------------------------------------------------------------- */

function detectWeakAreas() {
  const issues = [];
  const apt = readinessAptitude();
  const dsaAcc = (() => {
    const attempted = DATA.dsa.filter(r => r.attempted).length;
    const solved = DATA.dsa.filter(r => r.solved).length;
    return attempted ? pct(solved, attempted) : null;
  })();

  if (dsaAcc !== null && dsaAcc < 60) issues.push({ label: "DSA accuracy below 60%", severity: "HIGH PRIORITY" });
  if (DATA.aptitude.length && apt < 70) issues.push({ label: "Aptitude accuracy below 70%", severity: "HIGH PRIORITY" });
  const csAcc = (() => {
    const total = DATA.cs.length;
    const correct = DATA.cs.filter(r => r.correct).length;
    return total ? pct(correct, total) : null;
  })();
  if (csAcc !== null && csAcc < 70) issues.push({ label: "CS interview accuracy below 70%", severity: "HIGH PRIORITY" });

  const projWeak = DATA.project.some(r => (Number(r.confidence) || 0) < 7) || DATA.project.length === 0;
  if (projWeak) issues.push({ label: "Project explanation below 7/10 (or not yet practiced)", severity: "HIGH PRIORITY" });

  const commWeak = DATA.english.length === 0 || DATA.english.some(r => (Number(r.clarity)||0) < 6);
  if (commWeak) issues.push({ label: "Communication below 6/10 (or not yet tracked)", severity: "NEEDS WORK" });

  if (readinessApplications() < 100) issues.push({ label: "Applications below weekly target", severity: "ACTION REQUIRED" });

  const lastMock = DATA.mockInterview.slice().sort((a,b) => (a.date||"").localeCompare(b.date||"")).pop();
  const daysSinceMock = lastMock ? Math.floor((new Date() - new Date(lastMock.date)) / 86400000) : Infinity;
  if (daysSinceMock >= 14) issues.push({ label: "No mock interview in 14+ days", severity: "INTERVIEW PRACTICE REQUIRED" });

  const lastAptMock = DATA.aptitude.slice().sort((a,b) => (a.date||"").localeCompare(b.date||"")).pop();
  if (!lastAptMock) issues.push({ label: "No recent aptitude practice", severity: "MOCK REQUIRED" });

  if (!DATA.oa.length) issues.push({ label: "No recent OA practice", severity: "OA PRACTICE REQUIRED" });

  const order = { "HIGH PRIORITY": 0, "ACTION REQUIRED": 1, "INTERVIEW PRACTICE REQUIRED": 2, "OA PRACTICE REQUIRED": 3, "MOCK REQUIRED": 4, "NEEDS WORK": 5 };
  issues.sort((a,b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
  return issues.slice(0, 5);
}

/* ---------------------------------------------------------------------- */
/* Dashboard view                                                          */
/* ---------------------------------------------------------------------- */

function renderDashboard() {
  const overall = overallReadiness();
  $("#overallReadinessValue").textContent = overall + "%";
  $("#overallReadinessBar").style.width = overall + "%";

  const grid = $("#readinessGrid");
  grid.innerHTML = "";
  allReadiness().forEach(r => {
    const row = el("div", { class: "readiness-row" });
    row.appendChild(el("span", { class: "readiness-label" }, [r.label]));
    const barTrack = el("div", { class: "bar-track" });
    const bar = el("div", { class: "bar-fill" });
    bar.style.width = r.value + "%";
    barTrack.appendChild(bar);
    row.appendChild(barTrack);
    row.appendChild(el("span", { class: "readiness-value" }, [r.value + "%"]));
    grid.appendChild(row);
  });

  const weakList = $("#weakAreasList");
  weakList.innerHTML = "";
  const weak = detectWeakAreas();
  if (!weak.length) {
    weakList.appendChild(el("li", { class: "weak-empty" }, ["No major weak areas detected yet — keep logging your work to keep this accurate."]));
  } else {
    weak.forEach(w => {
      weakList.appendChild(el("li", {}, [
        el("span", { class: "sev-badge" }, [w.severity]),
        " " + w.label
      ]));
    });
  }

  renderWeeklyReview();
  renderMonthlySummary();

  $("#campusStatusCount").textContent = DATA.campusCompanies.length;
  $("#offcampusStatusCount").textContent = DATA.offcampus.length;
  $("#govStatusCount").textContent = DATA.govExams.length;
}

function weekBounds(dateInWeek) {
  const start = startOfWeek(dateInWeek);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { startISO: toISODate(start), endISO: toISODate(end) };
}

function renderWeeklyReview() {
  const { startISO, endISO } = weekBounds(new Date());
  $("#weekRangeLabel").textContent = fmtDate(startISO) + " – " + fmtDate(endISO);

  const dsaCount = DATA.dsa.filter(r => withinRange(r.date, startISO, endISO)).length;
  const aptCount = DATA.aptitude.filter(r => withinRange(r.date, startISO, endISO)).reduce((s,r)=>s+(Number(r.attempted)||0),0);
  const csCount = DATA.cs.filter(r => withinRange(r.date, startISO, endISO)).length;
  const sqlCount = DATA.sql.filter(r => withinRange(r.date, startISO, endISO)).length;
  const resumeCount = DATA.dailyLog.filter(r => withinRange(r.date, startISO, endISO)).reduce((s,r)=>s+(Number(r.resumeQuestions)||0),0);
  const projectCount = DATA.project.filter(r => withinRange(r.lastPracticed, startISO, endISO)).length;
  const englishMin = DATA.english.filter(r => withinRange(r.date, startISO, endISO)).reduce((s,r)=>s + (Number(r.readingMin)||0)+(Number(r.speakingMin)||0)+(Number(r.technicalSpeakingMin)||0)+(Number(r.hrSpeakingMin)||0), 0);
  const apps = DATA.offcampus.filter(r => withinRange(r.dateApplied, startISO, endISO)).length;
  const referralsCount = DATA.referrals.filter(r => withinRange(r.date, startISO, endISO)).length;
  const oaCount = DATA.oa.filter(r => withinRange(r.date, startISO, endISO)).length;
  const mockCount = DATA.mockInterview.filter(r => withinRange(r.date, startISO, endISO)).length;

  const stats = { dsaCount, aptCount, csCount, sqlCount, resumeCount, projectCount, englishMin, apps, referralsCount, oaCount, mockCount };
  const box = $("#weeklyStatsGrid");
  box.innerHTML = "";
  const labels = {
    dsaCount:"DSA problems", aptCount:"Aptitude questions", csCount:"CS questions",
    sqlCount:"SQL questions", resumeCount:"Resume questions", projectCount:"Project practice",
    englishMin:"English minutes", apps:"Applications", referralsCount:"Referrals",
    oaCount:"OAs", mockCount:"Mock interviews"
  };
  Object.keys(labels).forEach(k => box.appendChild(statCard(stats[k], labels[k])));

  // load / save free-text reflection fields, keyed by week start
  let review = DATA.weeklyReviews.find(w => w.weekStart === startISO);
  if (!review) {
    review = { weekStart: startISO, bestImprovement: "", biggestWeakness: "", mostWastedTime: "", nextWeekPriority: "" };
    DATA.weeklyReviews.push(review);
  }
  ["bestImprovement","biggestWeakness","mostWastedTime","nextWeekPriority"].forEach(field => {
    const input = $("#wr_" + field);
    input.value = review[field] || "";
    input.oninput = () => { review[field] = input.value; saveData(); };
  });
}

function renderMonthlySummary() {
  const months = [
    { label: "September 2026", from: "2026-09-01", to: "2026-09-30" },
    { label: "October 2026", from: "2026-10-01", to: "2026-10-31" },
    { label: "November 2026", from: "2026-11-01", to: "2026-11-30" },
    { label: "December 2026", from: "2026-12-01", to: "2026-12-31" }
  ];
  const tbody = $("#monthlyTableBody");
  tbody.innerHTML = "";
  months.forEach(m => {
    const dsaCount = DATA.dsa.filter(r => withinRange(r.date, m.from, m.to)).length;
    const aptCount = DATA.aptitude.filter(r => withinRange(r.date, m.from, m.to)).length;
    const csCount = DATA.cs.filter(r => withinRange(r.date, m.from, m.to)).length;
    const apps = DATA.offcampus.filter(r => withinRange(r.dateApplied, m.from, m.to)).length;
    const oaCount = DATA.oa.filter(r => withinRange(r.date, m.from, m.to)).length;
    const mockCount = DATA.mockInterview.filter(r => withinRange(r.date, m.from, m.to)).length;
    const tr = el("tr", {}, [
      el("td", {}, [m.label]),
      el("td", {}, [String(apps)]),
      el("td", {}, [String(oaCount)]),
      el("td", {}, [String(mockCount)]),
      el("td", {}, [String(dsaCount)]),
      el("td", {}, [String(aptCount)]),
      el("td", {}, [String(csCount)])
    ]);
    tbody.appendChild(tr);
  });
}

/* ---------------------------------------------------------------------- */
/* CAMPUS PLACEMENTS                                                       */
/* ---------------------------------------------------------------------- */

let campusSubTab = "overview";

function renderCampus() {
  $all("#view-campus .subtab-btn").forEach(b => b.classList.toggle("active", b.dataset.sub === campusSubTab));
  const host = $("#campusContent");
  host.innerHTML = "";

  if (campusSubTab === "overview") {
    const panel = el("div", { class: "panel" });
    panel.appendChild(el("h3", {}, ["Campus readiness"]));
    const grid = el("div", { class: "stat-row" });
    ["dsa","aptitude","cs","javaSql","resume","project","technical","hr"].forEach(key => {
      const r = allReadiness().find(x => x.key === key);
      grid.appendChild(statCard(r.value + "%", r.label + " readiness"));
    });
    panel.appendChild(grid);

    const companies = DATA.campusCompanies;
    const funnel = el("div", { class: "stat-row" });
    funnel.appendChild(statCard(companies.length, "Companies visited"));
    funnel.appendChild(statCard(companies.filter(c=>c.eligible).length, "Eligible"));
    funnel.appendChild(statCard(companies.filter(c=>!c.eligible).length, "Not eligible"));
    funnel.appendChild(statCard(companies.filter(c=>c.applied).length, "Applied"));
    funnel.appendChild(statCard(companies.filter(c=>c.oa).length, "OA received"));
    funnel.appendChild(statCard(companies.filter(c=>c.interview).length, "Interview received"));
    funnel.appendChild(statCard(companies.filter(c=>c.status==="Selected").length, "Selected"));
    funnel.appendChild(statCard(companies.filter(c=>c.status==="Rejected").length, "Rejected"));
    panel.appendChild(el("h3", {}, ["Company funnel"]));
    panel.appendChild(funnel);
    panel.appendChild(el("p", { class: "note" }, ["Readiness is measured from tracked practice, not predicted — there is no promised outcome here."]));
    host.appendChild(panel);
  }
  else if (campusSubTab === "companies") {
    renderTracker(host, {
      key: "campusCompanies", schema: SCHEMAS.campusCompanies, title: "Company tracker",
      columns: ["company","role","package","eligible","applied","status"],
    });
  }
  else if (campusSubTab === "dsa") {
    renderTracker(host, {
      key: "dsa", schema: SCHEMAS.dsa, title: "DSA tracker",
      columns: ["date","problem","topic","difficulty","solved","independent"],
      statsFn: (records) => {
        const attempted = records.filter(r=>r.attempted).length;
        const solved = records.filter(r=>r.solved).length;
        const independent = records.filter(r=>r.independent).length;
        return [
          statCard(attempted, "Attempted"),
          statCard(solved, "Solved"),
          statCard(independent, "Independent"),
          statCard(records.filter(r=>r.difficulty==="Easy").length, "Easy"),
          statCard(records.filter(r=>r.difficulty==="Medium").length, "Medium"),
          statCard(records.filter(r=>r.difficulty==="Hard").length, "Hard"),
          statCard(pct(solved, attempted) + "%", "Accuracy"),
        ];
      }
    });
  }
  else if (campusSubTab === "aptitude") {
    renderTracker(host, {
      key: "aptitude", schema: SCHEMAS.aptitude, title: "Aptitude tracker",
      columns: ["date","topic","attempted","correct","wrong"],
      statsFn: (records) => {
        const attempted = records.reduce((s,r)=>s+(Number(r.attempted)||0),0);
        const correct = records.reduce((s,r)=>s+(Number(r.correct)||0),0);
        return [
          statCard(attempted, "Total attempted"),
          statCard(correct, "Total correct"),
          statCard(pct(correct, attempted) + "%", "Accuracy"),
          statCard(records.length, "Sessions logged"),
        ];
      }
    });
  }
  else if (campusSubTab === "cs") {
    renderTracker(host, {
      key: "cs", schema: SCHEMAS.cs, title: "CS fundamentals",
      columns: ["date","topic","question","interviewReady","nextRevision"],
      statsFn: (records) => [
        statCard(records.length, "Total questions"),
        statCard(records.filter(r=>r.interviewReady).length, "Interview-ready"),
        statCard(records.filter(r=>r.canExplain).length, "Can explain"),
      ]
    });
  }
  else if (campusSubTab === "java") {
    const wrap = el("div");
    const j = el("div"); renderTracker(j, {
      key: "java", schema: SCHEMAS.java, title: "Java / OOP tracker",
      columns: ["date","topic","question","understood","canExplain"],
      statsFn: (records) => [statCard(records.length,"Logged"), statCard(records.filter(r=>r.canExplain).length,"Can explain")]
    });
    const s = el("div"); renderTracker(s, {
      key: "sql", schema: SCHEMAS.sql, title: "SQL / DBMS tracker",
      columns: ["date","topic","question","correct","canExplain"],
      statsFn: (records) => [statCard(records.length,"Logged"), statCard(records.filter(r=>r.correct).length,"Correct")]
    });
    wrap.appendChild(j); wrap.appendChild(s);
    host.appendChild(wrap);
  }
  else if (campusSubTab === "resume") {
    renderTracker(host, {
      key: "resume", schema: SCHEMAS.resume, title: "Resume questions",
      columns: ["question","spoken","confidence","technicalAccuracy","communication"],
      statsFn: (records) => [
        statCard(records.length + " / " + RESUME_QUESTIONS.length, "Questions covered"),
        statCard(records.filter(r=>r.spoken).length, "Spoken out loud"),
      ]
    });
  }
  else if (campusSubTab === "project") {
    renderTracker(host, {
      key: "project", schema: SCHEMAS.project, title: "Project interview prep",
      columns: ["projectName","topic","practiced","canExplainWithoutNotes","confidence"],
      statsFn: (records) => [
        statCard(records.length, "Topics logged"),
        statCard(records.filter(r=>r.canExplainWithoutNotes).length, "Explain without notes"),
      ]
    });
  }
  else if (campusSubTab === "technical") {
    renderTracker(host, {
      key: "technical", schema: SCHEMAS.technical, title: "Technical interview question bank",
      columns: ["date","category","question","correct","score"],
      statsFn: (records) => {
        const avg = records.length ? (records.reduce((s,r)=>s+(Number(r.score)||0),0)/records.length).toFixed(1) : "0.0";
        return [statCard(records.length,"Questions"), statCard(avg + "/10","Average score")];
      }
    });
  }
  else if (campusSubTab === "hr") {
    renderTracker(host, {
      key: "hr", schema: SCHEMAS.hr, title: "HR interview prep",
      columns: ["date","question","confidence"],
      statsFn: (records) => [statCard(records.length + " / " + HR_QUESTIONS.length, "Questions covered")]
    });
  }
  else if (campusSubTab === "oa") {
    renderTracker(host, {
      key: "oa", schema: SCHEMAS.oa, title: "OA / mock assessment tracker",
      columns: ["date","company","testName","correct","passed"],
      statsFn: (records) => [
        statCard(records.length, "Tests logged"),
        statCard(records.filter(r=>r.passed).length, "Passed"),
      ]
    });
  }
  else if (campusSubTab === "mock") {
    renderTracker(host, {
      key: "mockInterview", schema: SCHEMAS.mockInterview, title: "Mock interviews",
      columns: ["date","type","technicalScore","hrScore","nextMockDate"],
      statsFn: (records) => [statCard(records.length, "Mock interviews logged")]
    });
  }
  else if (campusSubTab === "communication") {
    renderTracker(host, {
      key: "english", schema: SCHEMAS.english, title: "English & communication practice",
      columns: ["date","readingMin","speakingMin","clarity","fluency"],
      statsFn: (records) => [
        statCard(records.length, "Sessions logged"),
        statCard(records.reduce((s,r)=>s+(Number(r.readingMin)||0)+(Number(r.speakingMin)||0),0), "Total minutes"),
      ]
    });
  }
  else if (campusSubTab === "checklist") {
    switchView("today");
  }
}

/* ---------------------------------------------------------------------- */
/* OFF-CAMPUS                                                              */
/* ---------------------------------------------------------------------- */

let offcampusSubTab = "overview";

function renderOffCampus() {
  $all("#view-offcampus .subtab-btn").forEach(b => b.classList.toggle("active", b.dataset.sub === offcampusSubTab));
  const host = $("#offcampusContent");
  host.innerHTML = "";

  if (offcampusSubTab === "overview") {
    const panel = el("div", { class: "panel" });
    const { startISO, endISO } = weekBounds(new Date());
    const monthStart = toISODate(new Date()).slice(0,7) + "-01";
    const apps = DATA.offcampus;
    const weekCount = apps.filter(a => withinRange(a.dateApplied, startISO, endISO)).length;
    const monthCount = apps.filter(a => (a.dateApplied||"").startsWith(toISODate(new Date()).slice(0,7))).length;
    const oaCount = apps.filter(a=>a.oa).length;
    const interviewCount = apps.filter(a=>a.interview).length;
    const rejected = apps.filter(a=>a.status==="Rejected").length;
    const offers = apps.filter(a=>a.status==="Offer").length;
    const grid = el("div", { class: "stat-row" });
    grid.appendChild(statCard(weekCount, "Applications this week"));
    grid.appendChild(statCard(monthCount, "Applications this month"));
    grid.appendChild(statCard(apps.length, "Total applications"));
    grid.appendChild(statCard(oaCount, "OAs"));
    grid.appendChild(statCard(interviewCount, "Interviews"));
    grid.appendChild(statCard(rejected, "Rejections"));
    grid.appendChild(statCard(offers, "Offers"));
    grid.appendChild(statCard(pct(interviewCount, apps.length) + "%", "Application → interview"));
    panel.appendChild(el("h3",{},["Off-campus overview"]));
    panel.appendChild(grid);
    panel.appendChild(el("p", { class: "note" }, [
      "Daily target — minimum 3 quality applications/day, target 5/day, strong day 8–10/day. Only verified, eligible applications count as real progress."
    ]));
    host.appendChild(panel);
  }
  else if (offcampusSubTab === "applications") {
    renderTracker(host, {
      key: "offcampus", schema: SCHEMAS.offcampus, title: "Off-campus application tracker",
      columns: ["dateFound","company","role","eligible","dateApplied","status"],
      statsFn: (records) => [
        statCard(records.length, "Total"),
        statCard(records.filter(r=>r.status==="Applied"||r.dateApplied).length, "Applied"),
        statCard(records.filter(r=>r.status==="Offer").length, "Offers"),
      ]
    });
  }
  else if (offcampusSubTab === "sites") {
    const panel = el("div", { class: "panel" });
    panel.appendChild(el("h3",{},["Job sites"]));
    const grid = el("div", { class: "link-grid" });
    JOB_SITES.forEach(site => {
      const card = el("a", { class: "link-card", href: site.url, target: "_blank", rel: "noopener noreferrer" }, [site.name]);
      grid.appendChild(card);
    });
    panel.appendChild(grid);
    panel.appendChild(el("p", { class: "warn-note" }, ["VERIFY ON OFFICIAL COMPANY CAREERS PAGE BEFORE APPLYING."]));
    host.appendChild(panel);

    const safety = el("div", { class: "panel safety-panel" });
    safety.appendChild(el("h3",{},["Application safety"]));
    const list = el("ul", { class: "safety-list" }, [
      "NEVER PAY MONEY FOR A JOB.",
      "NEVER SHARE OTP.",
      "NEVER SHARE BANK PASSWORD / PIN.",
      "VERIFY THE COMPANY DOMAIN.",
      "VERIFY THE JOB ON THE OFFICIAL CAREERS SITE.",
      "BE CAREFUL WITH TELEGRAM/WHATSAPP \"RECRUITERS\".",
      "DO NOT TRUST \"GUARANTEED JOB\" OFFERS."
    ].map(t => el("li", {}, [t])));
    safety.appendChild(list);
    host.appendChild(safety);
  }
  else if (offcampusSubTab === "watchlist") {
    const panel = el("div", { class: "panel" });
    panel.appendChild(el("h3",{},["Company watchlist"]));
    panel.appendChild(el("p", { class: "warn-note" }, ["WATCHLIST — NOT A CLAIM THAT THESE COMPANIES ARE CURRENTLY HIRING."]));
    const search = el("input", { type: "text", placeholder: "Search companies…", class: "search-input" });
    panel.appendChild(search);
    const tableHost = el("div", { class: "table-host" });
    panel.appendChild(tableHost);

    function refreshWatchlist() {
      tableHost.innerHTML = "";
      const q = search.value.trim().toLowerCase();
      const table = el("table", { class: "data-table" });
      table.appendChild(el("thead", {}, [el("tr", {}, ["Company","Careers link","LinkedIn link","Target roles","Notes","Last checked"].map(h=>el("th",{},[h])))]));
      const tbody = el("tbody");
      DATA.offcampusWatchlist.filter(c => !q || c.company.toLowerCase().includes(q)).forEach(c => {
        const tr = el("tr");
        tr.appendChild(el("td", {}, [c.company]));
        ["careersLink","linkedinLink","targetRoles","notes","lastChecked"].forEach(field => {
          const isDate = field === "lastChecked";
          const input = el("input", { type: isDate ? "date" : "text", class: "inline-input" });
          input.value = c[field] || "";
          input.addEventListener("change", () => { c[field] = input.value; saveData(); });
          tr.appendChild(el("td", {}, [input]));
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableHost.appendChild(table);
    }
    search.addEventListener("input", refreshWatchlist);
    refreshWatchlist();
    host.appendChild(panel);
  }
  else if (offcampusSubTab === "referrals") {
    renderTracker(host, {
      key: "referrals", schema: SCHEMAS.referrals, title: "Referral / networking tracker",
      columns: ["date","person","company","referralRequested","result"],
      statsFn: (records) => [
        statCard(records.length, "Actions logged"),
        statCard(records.filter(r=>r.referralRequested).length, "Referrals requested"),
      ]
    });
  }
}

/* ---------------------------------------------------------------------- */
/* GOVERNMENT EXAMS                                                         */
/* ---------------------------------------------------------------------- */

let govSubTab = "overview";

function renderGovernment() {
  $all("#view-government .subtab-btn").forEach(b => b.classList.toggle("active", b.dataset.sub === govSubTab));
  const host = $("#governmentContent");
  host.innerHTML = "";

  if (govSubTab === "overview") {
    const panel = el("div", { class: "panel" });
    panel.appendChild(el("h3",{},["Government opportunities overview"]));
    const grid = el("div", { class: "stat-row" });
    grid.appendChild(statCard(DATA.govExams.length, "Tracked exams"));
    grid.appendChild(statCard(DATA.govExams.filter(e=>e.eligible).length, "Eligible"));
    grid.appendChild(statCard(DATA.govExams.filter(e=>e.applied).length, "Applied"));
    grid.appendChild(statCard(DATA.govExams.filter(e=>e.examCompleted).length, "Exams completed"));
    panel.appendChild(grid);
    panel.appendChild(el("p", { class: "warn-note" }, ["ALWAYS VERIFY THE LATEST OFFICIAL NOTIFICATION BEFORE APPLYING. Dates here are reference only unless marked Official and recently verified."]));

    const syl = el("div", { class: "syllabus-grid" });
    Object.keys(GOV_SYLLABUS_REFERENCE).forEach(cat => {
      syl.appendChild(el("div", { class: "syllabus-card" }, [
        el("h4", {}, [cat]),
        el("p", {}, [GOV_SYLLABUS_REFERENCE[cat].join(", ")])
      ]));
    });
    panel.appendChild(el("h3",{},["What to study — by category"]));
    panel.appendChild(syl);
    host.appendChild(panel);
  }
  else if (govSubTab === "tracker") {
    renderTracker(host, {
      key: "govExams", schema: SCHEMAS.govExams, title: "Government exam tracker",
      columns: ["exam","organization","examDate","status","dateType","eligible"],
      statsFn: (records) => [
        statCard(records.length, "Exams tracked"),
        statCard(records.filter(r=>r.applied).length, "Applied"),
      ]
    });
  }
  else if (govSubTab === "links") {
    const panel = el("div", { class: "panel" });
    panel.appendChild(el("h3",{},["Official links"]));
    const grid = el("div", { class: "link-grid" });
    GOV_LINKS.forEach(link => {
      grid.appendChild(el("a", { class: "link-card", href: link.url, target: "_blank", rel: "noopener noreferrer" }, [link.name]));
    });
    panel.appendChild(grid);
    panel.appendChild(el("p", { class: "warn-note" }, ["Use official sites as the source of truth. Government recruitment dates change — do not treat any date here as final."]));
    host.appendChild(panel);
  }
}

/* ---------------------------------------------------------------------- */
/* SETTINGS: profile, daily log, backup, search                            */
/* ---------------------------------------------------------------------- */

function renderSettings() {
  const p = DATA.profile;
  ["name","degree","branch","graduationYear","cgpa","skills","targetRoles","targetLocations","targetPackage"].forEach(k => {
    const input = $("#profile_" + k);
    if (!input) return;
    input.value = p[k] || "";
    input.oninput = () => { p[k] = input.value; saveData(); };
  });

  renderTracker($("#dailyLogHost"), {
    key: "dailyLog", schema: SCHEMAS.dailyLog, title: "Daily log",
    columns: ["date","hoursStudied","dsaSolved","applications","mockInterview"],
    statsFn: (records) => [statCard(records.length, "Days logged")]
  });

  $("#exportBtn").onclick = exportData;
  $("#importFile").onchange = importData;
  $("#resetBtn").onclick = resetData;

  $("#globalSearchInput").oninput = runGlobalSearch;
}

/* ---------------------------------------------------------------------- */
/* Export / Import / Reset                                                 */
/* ---------------------------------------------------------------------- */

function exportData() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "placement-command-center-backup-" + toISODate(new Date()) + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importData(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!confirm("Import will replace your current data. Continue?")) return;
      DATA = migrateData(parsed);
      saveData();
      alert("Import complete.");
      switchView("dashboard");
    } catch (e) {
      alert("Could not read that file — make sure it's a valid backup JSON.");
    }
  };
  reader.readAsText(file);
  evt.target.value = "";
}

function resetData() {
  if (!confirm("This will permanently erase ALL data in this browser. Export a backup first if you're not sure. Continue?")) return;
  if (!confirm("Are you absolutely sure? This cannot be undone.")) return;
  DATA = buildDefaultData();
  saveData();
  switchView("today");
}

/* ---------------------------------------------------------------------- */
/* Global search                                                           */
/* ---------------------------------------------------------------------- */

function runGlobalSearch() {
  const q = $("#globalSearchInput").value.trim().toLowerCase();
  const resultsHost = $("#globalSearchResults");
  resultsHost.innerHTML = "";
  if (!q) return;

  const sources = [
    { label: "Campus companies", records: DATA.campusCompanies, fields: ["company","role","notes"] },
    { label: "Off-campus applications", records: DATA.offcampus, fields: ["company","role","notes"] },
    { label: "Government exams", records: DATA.govExams, fields: ["exam","organization","notes"] },
    { label: "DSA problems", records: DATA.dsa, fields: ["problem","topic","notes"] },
    { label: "CS questions", records: DATA.cs, fields: ["question","topic"] },
    { label: "Technical questions", records: DATA.technical, fields: ["question","category"] },
    { label: "Project prep", records: DATA.project, fields: ["projectName","topic"] },
  ];
  let any = false;
  sources.forEach(src => {
    const matches = src.records.filter(r => src.fields.some(f => String(r[f]||"").toLowerCase().includes(q)));
    if (matches.length) {
      any = true;
      const group = el("div", { class: "search-group" });
      group.appendChild(el("h4", {}, [src.label + " (" + matches.length + ")"]));
      const ul = el("ul");
      matches.slice(0, 8).forEach(m => {
        const text = src.fields.map(f => m[f]).filter(Boolean).join(" — ");
        ul.appendChild(el("li", {}, [text || "(untitled entry)"]));
      });
      group.appendChild(ul);
      resultsHost.appendChild(group);
    }
  });
  if (!any) resultsHost.appendChild(el("p", { class: "note" }, ["No matches found."]));
}

/* ---------------------------------------------------------------------- */
/* Init                                                                     */
/* ---------------------------------------------------------------------- */

function init() {
  loadData();
  currentMode = DATA.settings.lastMode || "full";
  DATA.settings.lastVisit = new Date().toISOString();
  saveData();

  $all(".nav-btn").forEach(b => b.addEventListener("click", () => switchView(b.dataset.view)));
  $all(".mode-btn").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $all("#view-campus .subtab-btn").forEach(b => b.addEventListener("click", () => { campusSubTab = b.dataset.sub; renderCampus(); }));
  $all("#view-offcampus .subtab-btn").forEach(b => b.addEventListener("click", () => { offcampusSubTab = b.dataset.sub; renderOffCampus(); }));
  $all("#view-government .subtab-btn").forEach(b => b.addEventListener("click", () => { govSubTab = b.dataset.sub; renderGovernment(); }));

  renderHeader();
  switchView("today");
  setInterval(renderHeader, 60000);
}

document.addEventListener("DOMContentLoaded", init);
