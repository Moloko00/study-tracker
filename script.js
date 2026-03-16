const STORAGE_KEY = "study-tracker-sessions-v1";
const THEME_KEY = "study-tracker-theme";
const DAILY_GOAL = 7;

const elements = {
  form: document.getElementById("sessionForm"),
  formError: document.getElementById("formError"),
  tableBody: document.getElementById("sessionTableBody"),
  subjectFilter: document.getElementById("subjectFilter"),
  todayHours: document.getElementById("todayHours"),
  weekHours: document.getElementById("weekHours"),
  avgHours: document.getElementById("avgHours"),
  bestDay: document.getElementById("bestDay"),
  mostSubject: document.getElementById("mostSubject"),
  totalSessions: document.getElementById("totalSessions"),
  goalText: document.getElementById("goalText"),
  goalBar: document.getElementById("goalBar"),
  goalStatus: document.getElementById("goalStatus"),
  streak: document.getElementById("streak"),
  weeklySummary: document.getElementById("weeklySummary"),
  dailyChart: document.getElementById("dailyChart"),
  weeklyChart: document.getElementById("weeklyChart"),
  barTemplate: document.getElementById("barTemplate"),
  themeToggle: document.getElementById("themeToggle"),
};

let sessions = loadSessions();

setDefaultDateTime();
applyTheme(loadTheme());
render();

elements.form.addEventListener("submit", onSaveSession);
elements.subjectFilter.addEventListener("change", renderTable);
elements.themeToggle.addEventListener("click", toggleTheme);

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function setDefaultDateTime() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  elements.form.date.value = date;
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  elements.themeToggle.textContent = theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
}

function toggleTheme() {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function onSaveSession(event) {
  event.preventDefault();
  elements.formError.textContent = "";

  const payload = {
    id: elements.form.editingId.value || crypto.randomUUID(),
    subject: elements.form.subject.value,
    topic: elements.form.topic.value.trim(),
    date: elements.form.date.value,
    startTime: elements.form.startTime.value,
    endTime: elements.form.endTime.value,
    notes: elements.form.notes.value.trim(),
  };

  const duration = getDurationHours(payload.startTime, payload.endTime);

  if (!payload.date || !payload.topic || !payload.startTime || !payload.endTime) {
    elements.formError.textContent = "Please complete all required fields.";
    return;
  }

  if (Number.isNaN(duration) || duration <= 0) {
    elements.formError.textContent = "Invalid session: end time must be later than start time.";
    return;
  }

  payload.durationHours = duration;

  const idx = sessions.findIndex((s) => s.id === payload.id);
  if (idx >= 0) {
    sessions[idx] = payload;
  } else {
    sessions.push(payload);
  }

  sessions.sort((a, b) => {
    const ad = `${a.date}T${a.startTime}`;
    const bd = `${b.date}T${b.startTime}`;
    return bd.localeCompare(ad);
  });

  saveSessions();
  elements.form.reset();
  elements.form.editingId.value = "";
  setDefaultDateTime();
  render();
}

function getDurationHours(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const delta = endMinutes - startMinutes;
  return Math.round((delta / 60) * 100) / 100;
}

function render() {
  renderTable();
  renderStats();
  renderWeeklySummary();
  renderCharts();
}

function getDateOnly(dt = new Date()) {
  return dt.toISOString().slice(0, 10);
}

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function hoursForDate(dateStr) {
  return sessions
    .filter((s) => s.date === dateStr)
    .reduce((sum, s) => sum + Number(s.durationHours || 0), 0);
}

function renderStats() {
  const today = getDateOnly();
  const startOfWeek = getWeekStart();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const todayHours = hoursForDate(today);
  const weekSessions = sessions.filter((s) => {
    const d = new Date(`${s.date}T00:00`);
    return d >= startOfWeek && d < endOfWeek;
  });
  const weekHours = weekSessions.reduce((sum, s) => sum + s.durationHours, 0);
  const avg = weekHours / 7;

  const byDay = {};
  const bySubject = {};

  for (const s of weekSessions) {
    byDay[s.date] = (byDay[s.date] || 0) + s.durationHours;
    bySubject[s.subject] = (bySubject[s.subject] || 0) + s.durationHours;
  }

  const bestDayEntry = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  const bestDayText = bestDayEntry ? `${bestDayEntry[0]} (${bestDayEntry[1].toFixed(1)}h)` : "-";
  const topSubjEntry = Object.entries(bySubject).sort((a, b) => b[1] - a[1])[0];

  elements.todayHours.textContent = `${todayHours.toFixed(1)}h`;
  elements.weekHours.textContent = `${weekHours.toFixed(1)}h`;
  elements.avgHours.textContent = `${avg.toFixed(1)}h`;
  elements.bestDay.textContent = bestDayText;
  elements.mostSubject.textContent = topSubjEntry ? `${topSubjEntry[0]} (${topSubjEntry[1].toFixed(1)}h)` : "-";
  elements.totalSessions.textContent = String(sessions.length);

  const pct = Math.min((todayHours / DAILY_GOAL) * 100, 100);
  elements.goalText.textContent = `${pct.toFixed(0)}%`;
  elements.goalBar.style.width = `${pct}%`;
  if (todayHours >= DAILY_GOAL) {
    elements.goalStatus.textContent = "🎉 Daily goal reached! Great work.";
    elements.goalStatus.style.color = "var(--ok)";
  } else {
    elements.goalStatus.textContent = `${(DAILY_GOAL - todayHours).toFixed(1)}h left to hit today's goal.`;
    elements.goalStatus.style.color = "var(--muted)";
  }

  elements.streak.textContent = `🔥 Streak: ${calculateStreak()} day${calculateStreak() === 1 ? "" : "s"}`;
}

function calculateStreak() {
  if (!sessions.length) return 0;
  const studiedDays = [...new Set(sessions.map((s) => s.date))].sort().reverse();
  let streak = 0;
  let cursor = new Date();

  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (studiedDays.includes(dateStr)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      if (streak === 0) cursor.setDate(cursor.getDate() - 1);
      else break;
      const prevDateStr = cursor.toISOString().slice(0, 10);
      if (studiedDays.includes(prevDateStr)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

function renderTable() {
  const filter = elements.subjectFilter.value;
  const filtered = sessions.filter((s) => filter === "All" || s.subject === filter);

  elements.tableBody.innerHTML = "";
  if (!filtered.length) {
    elements.tableBody.innerHTML = `<tr><td colspan="7">No study sessions yet.</td></tr>`;
    return;
  }

  for (const s of filtered) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.date}</td>
      <td>${s.subject}</td>
      <td>${escapeHtml(s.topic)}</td>
      <td>${s.startTime} - ${s.endTime}</td>
      <td>${s.durationHours.toFixed(2)}h</td>
      <td>${escapeHtml(s.notes || "-")}</td>
      <td>
        <div class="action-group">
          <button class="btn small" data-action="edit" data-id="${s.id}">Edit</button>
          <button class="btn small secondary" data-action="delete" data-id="${s.id}">Delete</button>
        </div>
      </td>
    `;
    elements.tableBody.appendChild(tr);
  }

  elements.tableBody.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (btn.dataset.action === "edit") editSession(id);
      if (btn.dataset.action === "delete") deleteSession(id);
    });
  });
}

function editSession(id) {
  const s = sessions.find((x) => x.id === id);
  if (!s) return;
  elements.form.subject.value = s.subject;
  elements.form.topic.value = s.topic;
  elements.form.date.value = s.date;
  elements.form.startTime.value = s.startTime;
  elements.form.endTime.value = s.endTime;
  elements.form.notes.value = s.notes || "";
  elements.form.editingId.value = s.id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteSession(id) {
  sessions = sessions.filter((s) => s.id !== id);
  saveSessions();
  render();
}

function renderWeeklySummary() {
  const startOfWeek = getWeekStart();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const weekSessions = sessions.filter((s) => {
    const d = new Date(`${s.date}T00:00`);
    return d >= startOfWeek && d < endOfWeek;
  });

  const subjectHours = {
    Mathematics: 0,
    "Computer Science": 0,
    "Cloud/DevOps": 0,
  };

  weekSessions.forEach((s) => {
    subjectHours[s.subject] = (subjectHours[s.subject] || 0) + s.durationHours;
  });

  elements.weeklySummary.innerHTML = "";
  Object.entries(subjectHours).forEach(([subject, hours]) => {
    const li = document.createElement("li");
    li.textContent = `${subject}: ${hours.toFixed(2)}h`;
    elements.weeklySummary.appendChild(li);
  });
}

function renderCharts() {
  const dailyData = last7DaysData();
  const weeklyData = last6WeeksData();
  renderBarChart(elements.dailyChart, dailyData);
  renderBarChart(elements.weeklyChart, weeklyData);
}

function last7DaysData() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ label: key.slice(5), value: hoursForDate(key) });
  }
  return out;
}

function last6WeeksData() {
  const out = [];
  for (let i = 5; i >= 0; i--) {
    const start = getWeekStart(new Date());
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const val = sessions
      .filter((s) => {
        const d = new Date(`${s.date}T00:00`);
        return d >= start && d < end;
      })
      .reduce((sum, s) => sum + s.durationHours, 0);
    out.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, value: val });
  }
  return out;
}

function renderBarChart(root, data) {
  root.innerHTML = "";
  const max = Math.max(...data.map((d) => d.value), 1);

  data.forEach((point) => {
    const node = elements.barTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".bar-label").textContent = point.label;
    node.querySelector(".bar-value").textContent = `${point.value.toFixed(1)}h`;
    node.querySelector(".bar-fill").style.width = `${(point.value / max) * 100}%`;
    root.appendChild(node);
  });
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
