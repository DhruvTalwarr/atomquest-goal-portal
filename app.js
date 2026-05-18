const STORAGE_KEY = "atomquest-goal-portal-v1";

const users = [
  { id: "e1", name: "Aarav Mehta", role: "Employee", managerId: "m1", department: "Sales" },
  { id: "e2", name: "Nisha Rao", role: "Employee", managerId: "m1", department: "Sales" },
  { id: "e3", name: "Kabir Singh", role: "Employee", managerId: "m2", department: "Operations" },
  { id: "m1", name: "Priya Nair", role: "Manager", department: "Sales" },
  { id: "m2", name: "Rohan Shah", role: "Manager", department: "Operations" },
  { id: "admin", name: "HR Admin", role: "Admin", department: "People" }
];

const windows = [
  { id: "goal", label: "Phase 1 - Goal Setting", opens: "1 May", action: "Goal Creation, Submission & Approval" },
  { id: "q1", label: "Q1 Check-in", opens: "July", action: "Progress Update - Planned vs. Actual" },
  { id: "q2", label: "Q2 Check-in", opens: "October", action: "Progress Update - Planned vs. Actual" },
  { id: "q3", label: "Q3 Check-in", opens: "January", action: "Progress Update - Planned vs. Actual" },
  { id: "q4", label: "Q4 / Annual", opens: "March / April", action: "Final Achievement Capture" }
];

const thrustAreas = ["Revenue Growth", "Customer Experience", "Operational Excellence", "People Development", "Compliance", "Innovation"];
const uomTypes = ["Min Numeric", "Min %", "Max Numeric", "Max %", "Timeline", "Zero"];
const statuses = ["Not Started", "On Track", "Completed"];

let state = loadState();
let currentUserId = state.session.userId;
let currentView = "dashboard";

const viewEl = document.querySelector("#view");
const navEl = document.querySelector("#nav");
const alertsEl = document.querySelector("#alerts");
const userSelect = document.querySelector("#userSelect");
const themeButton = document.querySelector("#themeButton");

function defaultState() {
  const now = new Date().toISOString();
  return {
    session: { userId: "e1", activeWindow: "goal", theme: "light" },
    goals: [
      {
        id: uid(),
        employeeId: "e1",
        thrustArea: "Revenue Growth",
        title: "Increase enterprise sales pipeline",
        description: "Build qualified pipeline from strategic accounts.",
        uom: "Min Numeric",
        target: "1200000",
        deadline: "",
        weightage: 35,
        status: "On Track",
        actuals: { q1: "260000", q2: "", q3: "", q4: "" },
        submitted: true,
        locked: true,
        approvalStatus: "Approved",
        managerComment: "Approved with focus on weekly funnel hygiene.",
        sharedGroupId: null,
        primaryOwnerId: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uid(),
        employeeId: "e1",
        thrustArea: "Customer Experience",
        title: "Improve renewal conversion",
        description: "Lift renewal conversion on named accounts.",
        uom: "Min %",
        target: "88",
        deadline: "",
        weightage: 30,
        status: "On Track",
        actuals: { q1: "82", q2: "", q3: "", q4: "" },
        submitted: true,
        locked: true,
        approvalStatus: "Approved",
        managerComment: "",
        sharedGroupId: null,
        primaryOwnerId: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uid(),
        employeeId: "e1",
        thrustArea: "People Development",
        title: "Complete sales enablement certification",
        description: "Finish certification before the annual review cycle.",
        uom: "Timeline",
        target: "2026-03-31",
        deadline: "2026-03-31",
        weightage: 20,
        status: "Not Started",
        actuals: { q1: "", q2: "", q3: "", q4: "" },
        submitted: true,
        locked: true,
        approvalStatus: "Approved",
        managerComment: "",
        sharedGroupId: null,
        primaryOwnerId: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uid(),
        employeeId: "e1",
        thrustArea: "Compliance",
        title: "Maintain zero policy breaches",
        description: "No compliance misses during the review year.",
        uom: "Zero",
        target: "0",
        deadline: "",
        weightage: 15,
        status: "On Track",
        actuals: { q1: "0", q2: "", q3: "", q4: "" },
        submitted: true,
        locked: true,
        approvalStatus: "Approved",
        managerComment: "",
        sharedGroupId: null,
        primaryOwnerId: null,
        createdAt: now,
        updatedAt: now
      }
    ],
    checkins: [
      { id: uid(), employeeId: "e1", managerId: "m1", period: "q1", comment: "Good start. Keep pipeline hygiene visible in weekly reviews.", createdAt: now }
    ],
    notifications: [
      {
        id: uid(),
        channel: "Teams",
        recipientId: "e1",
        subject: "Q1 check-in comment logged",
        message: "Priya Nair logged a structured Q1 check-in comment.",
        linkView: "history",
        read: false,
        createdAt: now
      }
    ],
    entraSyncs: [
      { id: uid(), status: "Completed", message: "Seeded directory users and reporting lines loaded.", createdAt: now }
    ],
    audits: [
      { id: uid(), actorId: "m1", entity: "Goal", entityId: "seed", action: "Approved seeded goals", at: now }
    ],
    escalations: []
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    parsed.session = parsed.session || {};
    parsed.session.userId = parsed.session.userId || "e1";
    parsed.session.activeWindow = parsed.session.activeWindow || "goal";
    parsed.session.theme = parsed.session.theme || "light";
    parsed.notifications = parsed.notifications || [];
    parsed.entraSyncs = parsed.entraSyncs || [];
    parsed.audits = parsed.audits || [];
    parsed.escalations = parsed.escalations || [];
    return parsed;
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function currentUser() {
  return users.find(user => user.id === currentUserId);
}

function employeeGoals(employeeId) {
  return state.goals.filter(goal => goal.employeeId === employeeId);
}

function teamMembers(managerId = currentUserId) {
  return users.filter(user => user.role === "Employee" && user.managerId === managerId);
}

function userName(id) {
  return users.find(user => user.id === id)?.name || "Unknown";
}

function activeWindow() {
  return windows.find(item => item.id === state.session.activeWindow) || windows[0];
}

function activeQuarter() {
  return state.session.activeWindow === "goal" ? "q1" : state.session.activeWindow;
}

function setTitle(title) {
  document.querySelector("#pageTitle").textContent = title;
  document.querySelector("#roleLabel").textContent = `${currentUser().role} workspace`;
  document.querySelector("#activeCycleLabel").textContent = activeWindow().label;
  document.querySelector("#activeCycleHint").textContent = `${activeWindow().opens}: ${activeWindow().action}`;
}

function init() {
  applyTheme();
  userSelect.innerHTML = users.map(user => `<option value="${user.id}">${user.name} - ${user.role}</option>`).join("");
  userSelect.value = currentUserId;
  userSelect.addEventListener("change", () => {
    currentUserId = userSelect.value;
    state.session.userId = currentUserId;
    currentView = "dashboard";
    saveState();
    render();
  });
  themeButton.addEventListener("click", toggleTheme);
  document.querySelector("#seedButton").addEventListener("click", () => {
    if (!confirm("Reset the portal to seeded demo data?")) return;
    state = defaultState();
    currentUserId = state.session.userId;
    saveState();
    render();
  });
  document.querySelector("#exportButton").addEventListener("click", exportCsv);
  render();
}

function render() {
  applyTheme();
  userSelect.value = currentUserId;
  renderNav();
  renderAlerts();
  const user = currentUser();
  if (user.role === "Employee") renderEmployee();
  if (user.role === "Manager") renderManager();
  if (user.role === "Admin") renderAdmin();
}

function applyTheme() {
  const isDark = state.session.theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  themeButton.textContent = isDark ? "Light mode" : "Dark mode";
  themeButton.setAttribute("aria-pressed", String(isDark));
}

function toggleTheme() {
  state.session.theme = state.session.theme === "dark" ? "light" : "dark";
  saveState();
  applyTheme();
}

function navItems() {
  const role = currentUser().role;
  if (role === "Employee") return [["dashboard", "My goals"], ["checkins", "Quarterly check-ins"], ["history", "Feedback history"], ["notifications", "Notifications"]];
  if (role === "Manager") return [["dashboard", "Team dashboard"], ["approvals", "Goal approvals"], ["checkins", "Manager check-ins"], ["shared", "Shared goals"], ["notifications", "Notifications"]];
  return [["dashboard", "Admin dashboard"], ["cycles", "Cycles & exceptions"], ["reports", "Reports"], ["integrations", "Integrations"], ["audit", "Audit trail"], ["shared", "Shared goals"], ["notifications", "Notifications"]];
}

function renderNav() {
  navEl.innerHTML = navItems().map(([id, label]) => `<button class="${id === currentView ? "active" : ""}" data-view="${id}" type="button">${label}</button>`).join("");
  navEl.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      currentView = button.dataset.view;
      render();
    });
  });
}

function renderAlerts() {
  const messages = [];
  if (currentUser().role === "Employee") {
    const goals = employeeGoals(currentUserId);
    const validation = validateGoalSheet(goals);
    if (goals.some(goal => !goal.submitted) && validation.length) messages.push(validation.join(" "));
    if (goals.some(goal => goal.approvalStatus === "Returned")) messages.push("Your manager returned one or more goals for rework.");
  }
  if (currentUser().role === "Manager") {
    const pending = teamMembers().flatMap(member => employeeGoals(member.id)).filter(goal => goal.submitted && goal.approvalStatus === "Submitted").length;
    if (pending) messages.push(`${pending} submitted goal item${pending === 1 ? "" : "s"} need approval.`);
  }
  const unread = state.notifications.filter(item => item.recipientId === currentUserId && !item.read).length;
  if (unread) messages.push(`${unread} unread notification${unread === 1 ? "" : "s"} in your notification center.`);
  alertsEl.innerHTML = messages.map(message => `<div class="alert">${escapeHtml(message)}</div>`).join("");
}

function renderEmployee() {
  if (currentView === "checkins") return renderEmployeeCheckins();
  if (currentView === "history") return renderFeedbackHistory();
  if (currentView === "notifications") return renderNotifications();
  setTitle("My Goal Sheet");
  const goals = employeeGoals(currentUserId);
  const validation = validateGoalSheet(goals);
  const total = sumWeight(goals);
  viewEl.innerHTML = `
    <div class="grid">
      ${stat("Goals", goals.length, "Maximum 8 goals")}
      ${stat("Weightage", `${total}%`, "Must equal 100%")}
      ${stat("Status", sheetStatus(goals), "Manager approval state")}
      ${stat("Progress", `${Math.round(averageProgress(goals))}%`, "Tracking score only")}
    </div>
    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>Goal Creation & Approval</h3>
          <p>Create goals, validate weightage, and submit the sheet to your L1 manager.</p>
        </div>
        <div class="actions">
          <button type="button" id="addGoalButton" ${goals.length >= 8 ? "disabled" : ""}>Add goal</button>
          <button type="button" id="submitGoalsButton" ${validation.length || goals.every(goal => goal.submitted) ? "disabled" : ""}>Submit for approval</button>
        </div>
      </div>
      ${validation.length ? `<div class="alert">${validation.map(escapeHtml).join(" ")}</div>` : ""}
      <div class="goal-list">
        ${goals.length ? goals.map(goalCard).join("") : `<p class="empty">No goals yet. Add goals until total weightage equals 100%.</p>`}
      </div>
    </section>
  `;
  bindGoalActions();
  document.querySelector("#addGoalButton")?.addEventListener("click", () => openGoalEditor());
  document.querySelector("#submitGoalsButton")?.addEventListener("click", submitGoals);
}

function goalCard(goal) {
  const locked = goal.locked ? "Locked" : goal.submitted ? goal.approvalStatus : "Draft";
  const canEdit = canEditGoal(goal);
  return `
    <article class="card">
      <div class="panel-head">
        <div>
          <h4>${escapeHtml(goal.title)}</h4>
          <p>${escapeHtml(goal.description || "No description")}</p>
        </div>
        <span class="badge ${goal.approvalStatus === "Approved" ? "ok" : goal.approvalStatus === "Returned" ? "danger" : "info"}">${locked}</span>
      </div>
      <div class="meta">
        <span class="badge">${escapeHtml(goal.thrustArea)}</span>
        <span class="badge">${escapeHtml(goal.uom)}</span>
        <span class="badge">Target: ${escapeHtml(goal.target)}</span>
        <span class="badge">Weightage: ${goal.weightage}%</span>
        ${goal.sharedGroupId ? `<span class="badge info">Shared KPI</span>` : ""}
      </div>
      <div class="bar" aria-label="Progress"><span style="width:${Math.min(100, progressScore(goal))}%"></span></div>
      <div class="actions">
        <button class="ghost" data-action="edit" data-id="${goal.id}" ${canEdit ? "" : "disabled"} type="button">Edit</button>
        <button class="ghost" data-action="delete" data-id="${goal.id}" ${canEdit && !goal.sharedGroupId ? "" : "disabled"} type="button">Delete</button>
      </div>
    </article>
  `;
}

function canEditGoal(goal) {
  if (goal.locked) return false;
  if (goal.sharedGroupId) return true;
  return !goal.submitted || goal.approvalStatus === "Returned";
}

function bindGoalActions() {
  viewEl.querySelectorAll("[data-action='edit']").forEach(button => button.addEventListener("click", () => openGoalEditor(button.dataset.id)));
  viewEl.querySelectorAll("[data-action='delete']").forEach(button => button.addEventListener("click", () => {
    const goal = state.goals.find(item => item.id === button.dataset.id);
    if (!goal || !confirm(`Delete "${goal.title}"?`)) return;
    state.goals = state.goals.filter(item => item.id !== goal.id);
    audit("Deleted draft goal", goal.id);
    saveState();
    render();
  }));
}

function openGoalEditor(goalId) {
  const goal = state.goals.find(item => item.id === goalId);
  const title = goal ? "Edit goal" : "Add goal";
  const body = `
    <form id="goalForm" class="form-grid">
      <label class="field span-6"><span>Thrust area</span><select name="thrustArea">${options(thrustAreas, goal?.thrustArea)}</select></label>
      <label class="field span-6"><span>UoM</span><select name="uom">${options(uomTypes, goal?.uom)}</select></label>
      <label class="field span-8"><span>Goal title</span><input name="title" required value="${escapeAttr(goal?.title || "")}" ${goal?.sharedGroupId ? "readonly" : ""}></label>
      <label class="field span-4"><span>Weightage %</span><input name="weightage" type="number" min="10" max="100" required value="${goal?.weightage || 10}"></label>
      <label class="field span-6"><span>Target</span><input name="target" required value="${escapeAttr(goal?.target || "")}" ${goal?.sharedGroupId ? "readonly" : ""}></label>
      <label class="field span-6"><span>Deadline</span><input name="deadline" type="date" value="${escapeAttr(goal?.deadline || "")}" ${goal?.sharedGroupId ? "readonly" : ""}></label>
      <label class="field span-12"><span>Description</span><textarea name="description" ${goal?.sharedGroupId ? "readonly" : ""}>${escapeHtml(goal?.description || "")}</textarea></label>
      <div class="actions span-12"><button type="submit">Save goal</button></div>
    </form>
  `;
  openModal(title, body);
  document.querySelector("#goalForm").addEventListener("submit", event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (Number(data.weightage) < 10) return toast("Minimum weightage per goal is 10%.");
    const now = new Date().toISOString();
    if (goal) {
      Object.assign(goal, {
        thrustArea: goal.sharedGroupId ? goal.thrustArea : data.thrustArea,
        title: goal.sharedGroupId ? goal.title : data.title,
        description: goal.sharedGroupId ? goal.description : data.description,
        uom: goal.sharedGroupId ? goal.uom : data.uom,
        target: goal.sharedGroupId ? goal.target : data.target,
        deadline: goal.sharedGroupId ? goal.deadline : data.deadline,
        weightage: Number(data.weightage),
        submitted: false,
        approvalStatus: "Draft",
        locked: false,
        updatedAt: now
      });
      audit("Edited goal", goal.id);
    } else {
      state.goals.push({
        id: uid(),
        employeeId: currentUserId,
        thrustArea: data.thrustArea,
        title: data.title,
        description: data.description,
        uom: data.uom,
        target: data.target,
        deadline: data.deadline,
        weightage: Number(data.weightage),
        status: "Not Started",
        actuals: { q1: "", q2: "", q3: "", q4: "" },
        submitted: false,
        locked: false,
        approvalStatus: "Draft",
        managerComment: "",
        sharedGroupId: null,
        primaryOwnerId: null,
        createdAt: now,
        updatedAt: now
      });
      audit("Created goal", "new");
    }
    closeModal();
    saveState();
    render();
  });
}

function submitGoals() {
  const goals = employeeGoals(currentUserId);
  const validation = validateGoalSheet(goals);
  if (validation.length) return toast(validation.join(" "));
  goals.forEach(goal => {
    goal.submitted = true;
    goal.approvalStatus = "Submitted";
    goal.updatedAt = new Date().toISOString();
  });
  const managerId = currentUser().managerId;
  notify(managerId, "Email", "Goal sheet submitted", `${currentUser().name} submitted goals for L1 approval.`, "approvals");
  notify(managerId, "Teams", "Approval action required", `Review ${currentUser().name}'s submitted goal sheet.`, "approvals");
  audit("Submitted goal sheet", currentUserId);
  saveState();
  render();
}

function renderEmployeeCheckins() {
  setTitle("Quarterly Check-ins");
  const goals = employeeGoals(currentUserId).filter(goal => goal.approvalStatus === "Approved");
  const quarter = activeQuarter();
  viewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>Achievement Capture</h3>
          <p>Enter actual achievement and progress status for the active quarter.</p>
        </div>
        <label class="field compact"><span>Quarter</span><select id="quarterSelect">${windows.filter(w => w.id !== "goal").map(w => `<option value="${w.id}" ${quarter === w.id ? "selected" : ""}>${w.label}</option>`).join("")}</select></label>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Goal</th><th>Target</th><th>Actual</th><th>Status</th><th>Score</th><th>Action</th></tr></thead>
          <tbody>${goals.map(goal => checkinRow(goal, quarter)).join("") || `<tr><td colspan="6">No approved goals available for check-in.</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
  document.querySelector("#quarterSelect").addEventListener("change", event => {
    state.session.activeWindow = event.target.value;
    saveState();
    render();
  });
  viewEl.querySelectorAll("form").forEach(form => form.addEventListener("submit", saveActual));
}

function checkinRow(goal, quarter) {
  return `
    <tr>
      <td><strong>${escapeHtml(goal.title)}</strong><br><small>${escapeHtml(goal.uom)}</small></td>
      <td>${escapeHtml(goal.target)}</td>
      <td>
        <form class="mini-form" data-id="${goal.id}">
          <input name="actual" value="${escapeAttr(goal.actuals[quarter] || "")}" placeholder="Actual">
      </td>
      <td>
          <select name="status">${options(statuses, goal.status)}</select>
      </td>
      <td>${Math.round(progressScore(goal, quarter))}%</td>
      <td><button type="submit">Save</button></form></td>
    </tr>
  `;
}

function saveActual(event) {
  event.preventDefault();
  const goal = state.goals.find(item => item.id === event.currentTarget.dataset.id);
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const quarter = activeQuarter();
  goal.actuals[quarter] = data.actual;
  goal.status = data.status;
  goal.updatedAt = new Date().toISOString();
  syncSharedActual(goal, quarter, data.actual, data.status);
  notify(currentUser().managerId, "Teams", `${quarter.toUpperCase()} achievement updated`, `${currentUser().name} updated actual achievement for "${goal.title}".`, "checkins");
  audit(`Updated ${quarter.toUpperCase()} actual`, goal.id);
  saveState();
  render();
}

function syncSharedActual(goal, quarter, actual, status) {
  if (!goal.sharedGroupId) return;
  if (goal.primaryOwnerId && goal.primaryOwnerId !== goal.employeeId) return;
  state.goals
    .filter(item => item.sharedGroupId === goal.sharedGroupId && item.id !== goal.id)
    .forEach(item => {
      item.actuals[quarter] = actual;
      item.status = status;
      item.updatedAt = new Date().toISOString();
    });
}

function renderFeedbackHistory() {
  setTitle("Feedback History");
  const checkins = state.checkins.filter(item => item.employeeId === currentUserId);
  viewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h3>Manager Comments</h3><p>Structured check-in comments logged by your manager.</p></div></div>
      <div class="goal-list">
        ${checkins.map(item => `<article class="card"><div class="meta"><span class="badge info">${item.period.toUpperCase()}</span><span class="badge">${userName(item.managerId)}</span></div><p>${escapeHtml(item.comment)}</p></article>`).join("") || `<p class="empty">No check-in comments yet.</p>`}
      </div>
    </section>
  `;
}

function renderManager() {
  if (currentView === "approvals") return renderApprovals();
  if (currentView === "checkins") return renderManagerCheckins();
  if (currentView === "shared") return renderSharedGoals();
  if (currentView === "notifications") return renderNotifications();
  setTitle("Team Dashboard");
  const members = teamMembers();
  const allGoals = members.flatMap(member => employeeGoals(member.id));
  viewEl.innerHTML = `
    <div class="grid">
      ${stat("Team members", members.length, "Direct reports")}
      ${stat("Pending approvals", allGoals.filter(goal => goal.approvalStatus === "Submitted").length, "Submitted goals")}
      ${stat("Approved sheets", members.filter(member => sheetStatus(employeeGoals(member.id)) === "Approved").length, "Locked goal sheets")}
      ${stat("Avg progress", `${Math.round(averageProgress(allGoals))}%`, "Tracking only")}
    </div>
    <section class="panel">
      <div class="panel-head"><div><h3>Team Completion</h3><p>Goal approval and quarterly check-in visibility by employee.</p></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Department</th><th>Goal sheet</th><th>Goals</th><th>Progress</th><th>Latest check-in</th></tr></thead>
          <tbody>${members.map(member => {
            const goals = employeeGoals(member.id);
            return `<tr><td>${member.name}</td><td>${member.department}</td><td>${statusBadge(sheetStatus(goals))}</td><td>${goals.length}</td><td>${Math.round(averageProgress(goals))}%</td><td>${latestCheckin(member.id)}</td></tr>`;
          }).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderApprovals() {
  setTitle("Goal Approvals");
  const rows = teamMembers().flatMap(member => employeeGoals(member.id).map(goal => ({ member, goal })));
  viewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h3>L1 Approval Workflow</h3><p>Review submitted goals, edit target or weightage inline, approve, or return for rework.</p></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Goal</th><th>Target</th><th>Weight</th><th>Status</th><th>Manager comment</th><th>Action</th></tr></thead>
          <tbody>${rows.map(({ member, goal }) => approvalRow(member, goal)).join("") || `<tr><td colspan="7">No team goals available.</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
  viewEl.querySelectorAll("form").forEach(form => form.addEventListener("submit", saveApprovalEdit));
  viewEl.querySelectorAll("[data-approve]").forEach(button => button.addEventListener("click", () => approveGoal(button.dataset.approve)));
  viewEl.querySelectorAll("[data-return]").forEach(button => button.addEventListener("click", () => returnGoal(button.dataset.return)));
}

function approvalRow(member, goal) {
  const editable = goal.approvalStatus === "Submitted";
  return `
    <tr>
      <td>${member.name}</td>
      <td><strong>${escapeHtml(goal.title)}</strong><br><small>${escapeHtml(goal.thrustArea)}</small></td>
      <td><form data-id="${goal.id}"><input name="target" value="${escapeAttr(goal.target)}" ${editable && !goal.sharedGroupId ? "" : "readonly"}></td>
      <td><input name="weightage" type="number" min="10" value="${goal.weightage}" ${editable ? "" : "readonly"}></td>
      <td>${statusBadge(goal.approvalStatus)}</td>
      <td><textarea name="comment" ${editable ? "" : "readonly"}>${escapeHtml(goal.managerComment || "")}</textarea></td>
      <td><div class="actions"><button type="submit" class="ghost" ${editable ? "" : "disabled"}>Save</button><button type="button" class="ok" data-approve="${goal.id}" ${editable ? "" : "disabled"}>Approve</button><button type="button" class="danger" data-return="${goal.id}" ${editable ? "" : "disabled"}>Return</button></div></form></td>
    </tr>
  `;
}

function saveApprovalEdit(event) {
  event.preventDefault();
  const goal = state.goals.find(item => item.id === event.currentTarget.dataset.id);
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  goal.target = goal.sharedGroupId ? goal.target : data.target;
  goal.weightage = Number(data.weightage);
  goal.managerComment = data.comment;
  goal.updatedAt = new Date().toISOString();
  audit("Manager edited submitted goal", goal.id);
  saveState();
  render();
}

function approveGoal(goalId) {
  const goal = state.goals.find(item => item.id === goalId);
  const goals = employeeGoals(goal.employeeId);
  const validation = validateGoalSheet(goals);
  if (validation.length) return toast(`${userName(goal.employeeId)}: ${validation.join(" ")}`);
  goals.forEach(item => {
    item.approvalStatus = "Approved";
    item.locked = true;
    item.submitted = true;
    item.updatedAt = new Date().toISOString();
  });
  notify(goal.employeeId, "Email", "Goal sheet approved", `${currentUser().name} approved your goal sheet. Goals are now locked.`, "dashboard");
  notify(goal.employeeId, "Teams", "Goals locked", "Your approved goals are locked for the cycle.", "dashboard");
  audit("Approved goal sheet", goal.employeeId);
  saveState();
  render();
}

function returnGoal(goalId) {
  const goal = state.goals.find(item => item.id === goalId);
  goal.approvalStatus = "Returned";
  goal.submitted = false;
  goal.locked = false;
  goal.updatedAt = new Date().toISOString();
  notify(goal.employeeId, "Email", "Goal returned for rework", `${currentUser().name} returned "${goal.title}" for rework.`, "dashboard");
  audit("Returned goal for rework", goal.id);
  saveState();
  render();
}

function renderManagerCheckins() {
  setTitle("Manager Check-ins");
  const members = teamMembers();
  const quarter = activeQuarter();
  viewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div><h3>Quarterly Discussion Log</h3><p>Review planned vs. actual achievement and capture a structured comment.</p></div>
        <label class="field compact"><span>Quarter</span><select id="quarterSelect">${windows.filter(w => w.id !== "goal").map(w => `<option value="${w.id}" ${quarter === w.id ? "selected" : ""}>${w.label}</option>`).join("")}</select></label>
      </div>
      <div class="goal-list">${members.map(managerCheckinCard).join("")}</div>
    </section>
  `;
  document.querySelector("#quarterSelect").addEventListener("change", event => {
    state.session.activeWindow = event.target.value;
    saveState();
    render();
  });
  viewEl.querySelectorAll("form").forEach(form => form.addEventListener("submit", saveManagerComment));
}

function managerCheckinCard(member) {
  const goals = employeeGoals(member.id).filter(goal => goal.approvalStatus === "Approved");
  const period = activeQuarter();
  return `
    <article class="card">
      <div class="panel-head"><div><h4>${member.name}</h4><p>${member.department} · ${Math.round(averageProgress(goals))}% average progress</p></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Goal</th><th>Planned</th><th>Actual</th><th>Status</th><th>Score</th></tr></thead>
          <tbody>${goals.map(goal => `<tr><td>${escapeHtml(goal.title)}</td><td>${escapeHtml(goal.target)}</td><td>${escapeHtml(goal.actuals[period] || "-")}</td><td>${goal.status}</td><td>${Math.round(progressScore(goal, period))}%</td></tr>`).join("") || `<tr><td colspan="5">No approved goals.</td></tr>`}</tbody>
        </table>
      </div>
      <form data-employee="${member.id}" class="form-grid">
        <label class="field span-12"><span>Check-in comment</span><textarea name="comment" required placeholder="Document discussion, blockers, and next action."></textarea></label>
        <div class="actions span-12"><button type="submit">Log check-in</button></div>
      </form>
    </article>
  `;
}

function saveManagerComment(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  state.checkins.push({
    id: uid(),
    employeeId: event.currentTarget.dataset.employee,
    managerId: currentUserId,
    period: activeQuarter(),
    comment: data.comment,
    createdAt: new Date().toISOString()
  });
  notify(event.currentTarget.dataset.employee, "Teams", `${activeQuarter().toUpperCase()} check-in logged`, `${currentUser().name} logged a check-in comment.`, "history");
  audit("Logged manager check-in", event.currentTarget.dataset.employee);
  saveState();
  render();
}

function renderAdmin() {
  if (currentView === "cycles") return renderCycles();
  if (currentView === "reports") return renderReports();
  if (currentView === "integrations") return renderIntegrations();
  if (currentView === "audit") return renderAudit();
  if (currentView === "shared") return renderSharedGoals();
  if (currentView === "notifications") return renderNotifications();
  setTitle("Admin Dashboard");
  const employees = users.filter(user => user.role === "Employee");
  const approved = employees.filter(employee => sheetStatus(employeeGoals(employee.id)) === "Approved").length;
  const qComplete = employees.filter(employee => state.checkins.some(item => item.employeeId === employee.id && item.period === state.session.activeWindow)).length;
  viewEl.innerHTML = `
    <div class="grid">
      ${stat("Employees", employees.length, "In hierarchy")}
      ${stat("Approved sheets", approved, "Locked goal sheets")}
      ${stat("Check-ins done", qComplete, "For active period")}
      ${stat("Audit events", state.audits.length, "Governance log")}
    </div>
    <section class="panel">
      <div class="panel-head"><div><h3>Completion Dashboard</h3><p>Real-time view of goal and check-in completion.</p></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Manager</th><th>Department</th><th>Goal sheet</th><th>Check-in</th><th>Actions</th></tr></thead>
          <tbody>${employees.map(employee => {
            const goals = employeeGoals(employee.id);
            const locked = goals.some(goal => goal.locked);
            const checked = state.checkins.some(item => item.employeeId === employee.id && item.period === state.session.activeWindow);
            return `<tr><td>${employee.name}</td><td>${userName(employee.managerId)}</td><td>${employee.department}</td><td>${statusBadge(sheetStatus(goals))}</td><td>${checked ? statusBadge("Completed") : statusBadge("Pending")}</td><td><button class="ghost" data-unlock="${employee.id}" ${locked ? "" : "disabled"}>Unlock goals</button></td></tr>`;
          }).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
  viewEl.querySelectorAll("[data-unlock]").forEach(button => button.addEventListener("click", () => unlockGoals(button.dataset.unlock)));
}

function renderCycles() {
  setTitle("Cycles & Exceptions");
  viewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div><h3>Check-in Schedule</h3><p>Configure the active window and monitor rule-based escalations.</p></div>
        <label class="field compact"><span>Active window</span><select id="activeWindowAdmin">${windows.map(w => `<option value="${w.id}" ${state.session.activeWindow === w.id ? "selected" : ""}>${w.label}</option>`).join("")}</select></label>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Period</th><th>Window opens</th><th>Action</th></tr></thead>
          <tbody>${windows.map(item => `<tr><td>${item.label}</td><td>${item.opens}</td><td>${item.action}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h3>Escalation Module</h3><p>Rule-based reminders for missed submissions, approvals, and check-ins.</p></div><button id="runEscalations" type="button">Run rules</button></div>
      <div class="goal-list">${state.escalations.map(item => `<article class="card"><div class="meta"><span class="badge warn">${item.type}</span><span class="badge">${userName(item.userId)}</span></div><p>${escapeHtml(item.message)}</p></article>`).join("") || `<p class="empty">No escalations generated yet.</p>`}</div>
    </section>
  `;
  document.querySelector("#activeWindowAdmin").addEventListener("change", event => {
    state.session.activeWindow = event.target.value;
    audit("Changed active cycle", event.target.value);
    saveState();
    render();
  });
  document.querySelector("#runEscalations").addEventListener("click", runEscalations);
}

function runEscalations() {
  state.escalations = [];
  users.filter(user => user.role === "Employee").forEach(employee => {
    const goals = employeeGoals(employee.id);
    if (!goals.length || goals.some(goal => !goal.submitted && !goal.locked)) {
      state.escalations.push({ id: uid(), type: "Submission", userId: employee.id, message: "Goal sheet is not fully submitted.", createdAt: new Date().toISOString() });
      notify(employee.id, "Email", "Goal submission reminder", "Please complete and submit your goal sheet.", "dashboard");
    }
    if (goals.some(goal => goal.approvalStatus === "Submitted")) {
      state.escalations.push({ id: uid(), type: "Approval", userId: employee.managerId, message: `${employee.name}'s goals are awaiting manager approval.`, createdAt: new Date().toISOString() });
      notify(employee.managerId, "Teams", "Manager approval reminder", `${employee.name}'s submitted goals are awaiting approval.`, "approvals");
    }
    if (state.session.activeWindow !== "goal" && !state.checkins.some(item => item.employeeId === employee.id && item.period === state.session.activeWindow)) {
      state.escalations.push({ id: uid(), type: "Check-in", userId: employee.managerId, message: `${employee.name} is missing ${state.session.activeWindow.toUpperCase()} check-in completion.`, createdAt: new Date().toISOString() });
      notify(employee.managerId, "Email", "Check-in completion reminder", `${employee.name} is missing ${state.session.activeWindow.toUpperCase()} check-in completion.`, "checkins");
    }
  });
  audit("Ran escalation rules", state.session.activeWindow);
  saveState();
  render();
}

function renderReports() {
  setTitle("Reports & Analytics");
  const rows = reportRows();
  const quarterScores = ["q1", "q2", "q3", "q4"].map(period => ({ label: period.toUpperCase(), value: Math.round(averageProgress(state.goals, period)) }));
  const departments = [...new Set(users.filter(user => user.role === "Employee").map(user => user.department))].map(department => {
    const employees = users.filter(user => user.role === "Employee" && user.department === department);
    const complete = employees.filter(employee => state.checkins.some(item => item.employeeId === employee.id && item.period === activeQuarter())).length;
    return { label: department, value: employees.length ? Math.round((complete / employees.length) * 100) : 0 };
  });
  const thrustDistribution = thrustAreas.map(area => ({ label: area, value: state.goals.filter(goal => goal.thrustArea === area).length }));
  const managerEffectiveness = users.filter(user => user.role === "Manager").map(manager => {
    const members = teamMembers(manager.id);
    const done = members.filter(member => state.checkins.some(item => item.employeeId === member.id && item.period === activeQuarter())).length;
    return { label: manager.name, value: members.length ? Math.round((done / members.length) * 100) : 0 };
  });
  viewEl.innerHTML = `
    <div class="grid">
      ${stat("QoQ trend", `${Math.round(averageProgress(state.goals, "q1"))}%`, "Current Q1 average")}
      ${stat("Shared KPIs", state.goals.filter(goal => goal.sharedGroupId).length, "Linked goal items")}
      ${stat("Zero incidents", state.goals.filter(goal => goal.uom === "Zero" && progressScore(goal) === 100).length, "Successful zero goals")}
      ${stat("Export rows", rows.length, "CSV / Excel records")}
    </div>
    <section class="panel">
      <div class="panel-head"><div><h3>Analytics Module</h3><p>QoQ trends, completion heatmaps, goal distribution, and manager effectiveness.</p></div></div>
      <div class="analytics-grid">
        ${chartBlock("QoQ Achievement Trend", quarterScores, "%")}
        ${chartBlock("Department Check-in Completion", departments, "%")}
        ${chartBlock("Goal Distribution by Thrust Area", thrustDistribution, "")}
        ${chartBlock("Manager Effectiveness", managerEffectiveness, "%")}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div><h3>Achievement Report</h3><p>Planned Target vs. Actual Achievement for all employees.</p></div>
        <div class="actions"><button type="button" onclick="exportCsv()">Export CSV</button><button type="button" onclick="exportExcel()">Export Excel</button></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Department</th><th>Goal</th><th>UoM</th><th>Target</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Progress</th></tr></thead>
          <tbody>${rows.map(row => `<tr><td>${row.employee}</td><td>${row.department}</td><td>${escapeHtml(row.goal)}</td><td>${row.uom}</td><td>${escapeHtml(row.target)}</td><td>${escapeHtml(row.q1)}</td><td>${escapeHtml(row.q2)}</td><td>${escapeHtml(row.q3)}</td><td>${escapeHtml(row.q4)}</td><td>${row.progress}%</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderIntegrations() {
  setTitle("Integrations");
  const latestSync = state.entraSyncs.slice(-1)[0];
  const notifications = state.notifications.slice().reverse();
  viewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div><h3>Microsoft Entra ID Integration</h3><p>Demo sync maps users, departments, roles, reporting lines, and group-based role assignment.</p></div>
        <button id="runEntraSync" type="button">Sync directory</button>
      </div>
      <div class="grid">
        ${stat("Directory users", users.length, "Synced identities")}
        ${stat("Managers", users.filter(user => user.role === "Manager").length, "L1 approvers")}
        ${stat("Groups mapped", 3, "Employee / Manager / Admin")}
        ${stat("Last sync", latestSync ? latestSync.status : "Never", "Directory status")}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Manager</th><th>Mapped group</th></tr></thead>
          <tbody>${users.map(user => `<tr><td>${user.name}</td><td>${user.role}</td><td>${user.department}</td><td>${user.managerId ? userName(user.managerId) : "-"}</td><td>AtomQuest-${user.role}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div><h3>Email & Microsoft Teams Integration</h3><p>Simulated outbound notifications with deep-link targets for demo and auditability.</p></div>
        <button id="sendReminderBatch" type="button">Send reminder batch</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Time</th><th>Channel</th><th>Recipient</th><th>Subject</th><th>Deep link</th></tr></thead>
          <tbody>${notifications.map(item => `<tr><td>${new Date(item.createdAt).toLocaleString()}</td><td>${item.channel}</td><td>${userName(item.recipientId)}</td><td>${escapeHtml(item.subject)}</td><td>${escapeHtml(item.linkView)}</td></tr>`).join("") || `<tr><td colspan="5">No notifications sent yet.</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
  document.querySelector("#runEntraSync").addEventListener("click", runEntraSync);
  document.querySelector("#sendReminderBatch").addEventListener("click", sendReminderBatch);
}

function renderNotifications() {
  setTitle("Notifications");
  const mine = state.notifications.filter(item => currentUser().role === "Admin" || item.recipientId === currentUserId).slice().reverse();
  viewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div><h3>Notification Center</h3><p>Email, Teams, escalation, and workflow messages generated by the portal.</p></div>
        <button id="markAllRead" type="button">Mark all read</button>
      </div>
      <div class="goal-list">
        ${mine.map(item => `
          <article class="card">
            <div class="panel-head">
              <div><h4>${escapeHtml(item.subject)}</h4><p>${escapeHtml(item.message)}</p></div>
              <span class="badge ${item.read ? "" : "info"}">${item.read ? "Read" : "Unread"}</span>
            </div>
            <div class="meta">
              <span class="badge">${escapeHtml(item.channel)}</span>
              <span class="badge">${userName(item.recipientId)}</span>
              <span class="badge">${new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <div class="actions"><button class="ghost" data-open-view="${item.linkView}" data-recipient="${item.recipientId}" data-notification="${item.id}" type="button">Open deep link</button></div>
          </article>
        `).join("") || `<p class="empty">No notifications yet.</p>`}
      </div>
    </section>
  `;
  document.querySelector("#markAllRead").addEventListener("click", () => {
    state.notifications.forEach(item => {
      if (currentUser().role === "Admin" || item.recipientId === currentUserId) item.read = true;
    });
    saveState();
    render();
  });
  viewEl.querySelectorAll("[data-open-view]").forEach(button => {
    button.addEventListener("click", () => {
      const item = state.notifications.find(notification => notification.id === button.dataset.notification);
      if (item) item.read = true;
      if (currentUser().role !== "Admin") currentUserId = button.dataset.recipient;
      state.session.userId = currentUserId;
      currentView = button.dataset.openView;
      saveState();
      render();
    });
  });
}

function runEntraSync() {
  state.entraSyncs.push({
    id: uid(),
    status: "Completed",
    message: "Synced users, reporting lines, role groups, and departments from demo Entra directory.",
    createdAt: new Date().toISOString()
  });
  notify("admin", "System", "Entra sync completed", "Directory users, roles, and hierarchy were refreshed.", "integrations");
  audit("Synced Microsoft Entra directory", "entra");
  saveState();
  render();
}

function sendReminderBatch() {
  users.filter(user => user.role === "Employee").forEach(employee => {
    const goals = employeeGoals(employee.id);
    if (sheetStatus(goals) !== "Approved") notify(employee.id, "Email", "Goal sheet reminder", "Please complete goal submission and approval actions.", "dashboard");
    if (state.session.activeWindow !== "goal") notify(employee.managerId, "Teams", "Quarterly check-in reminder", `Complete ${activeQuarter().toUpperCase()} check-in for ${employee.name}.`, "checkins");
  });
  audit("Sent email and Teams reminder batch", activeQuarter());
  saveState();
  render();
}

function renderAudit() {
  setTitle("Audit Trail");
  viewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h3>Change Log</h3><p>Captures who changed what and when, including post-lock admin exceptions.</p></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead>
          <tbody>${state.audits.slice().reverse().map(item => `<tr><td>${new Date(item.at).toLocaleString()}</td><td>${userName(item.actorId)}</td><td>${escapeHtml(item.action)}</td><td>${escapeHtml(item.entityId)}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSharedGoals() {
  setTitle("Shared Goals");
  const employees = users.filter(user => user.role === "Employee");
  viewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head"><div><h3>Push Departmental KPI</h3><p>Admin or manager can push a shared goal. Recipients may adjust weightage only; title and target remain read-only.</p></div></div>
      <form id="sharedGoalForm" class="form-grid">
        <label class="field span-4"><span>Department</span><select name="department">${options([...new Set(employees.map(e => e.department))])}</select></label>
        <label class="field span-4"><span>Primary owner</span><select name="primaryOwnerId">${employees.map(e => `<option value="${e.id}">${e.name}</option>`).join("")}</select></label>
        <label class="field span-4"><span>UoM</span><select name="uom">${options(uomTypes)}</select></label>
        <label class="field span-6"><span>Goal title</span><input name="title" required placeholder="Departmental KPI"></label>
        <label class="field span-3"><span>Target</span><input name="target" required></label>
        <label class="field span-3"><span>Default weightage</span><input name="weightage" type="number" min="10" value="10" required></label>
        <label class="field span-12"><span>Description</span><textarea name="description"></textarea></label>
        <div class="actions span-12"><button type="submit">Push shared goal</button></div>
      </form>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h3>Linked Goals</h3><p>Achievement updates by the primary owner sync across linked goal sheets.</p></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Title</th><th>Target</th><th>Weightage</th><th>Primary owner</th><th>Status</th></tr></thead>
          <tbody>${state.goals.filter(goal => goal.sharedGroupId).map(goal => `<tr><td>${userName(goal.employeeId)}</td><td>${escapeHtml(goal.title)}</td><td>${escapeHtml(goal.target)}</td><td>${goal.weightage}%</td><td>${userName(goal.primaryOwnerId)}</td><td>${statusBadge(goal.approvalStatus)}</td></tr>`).join("") || `<tr><td colspan="6">No shared goals created yet.</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
  document.querySelector("#sharedGoalForm").addEventListener("submit", pushSharedGoal);
}

function pushSharedGoal(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const groupId = uid();
  const recipients = users.filter(user => user.role === "Employee" && user.department === data.department);
  recipients.forEach(employee => {
    state.goals.push({
      id: uid(),
      employeeId: employee.id,
      thrustArea: "Operational Excellence",
      title: data.title,
      description: data.description,
      uom: data.uom,
      target: data.target,
      deadline: "",
      weightage: Number(data.weightage),
      status: "Not Started",
      actuals: { q1: "", q2: "", q3: "", q4: "" },
      submitted: false,
      locked: false,
      approvalStatus: "Draft",
      managerComment: "",
      sharedGroupId: groupId,
      primaryOwnerId: data.primaryOwnerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    notify(employee.id, "Teams", "Shared KPI assigned", `"${data.title}" was added to your goal sheet. You can adjust weightage only.`, "dashboard");
  });
  audit(`Pushed shared KPI to ${data.department}`, groupId);
  saveState();
  render();
}

function unlockGoals(employeeId) {
  employeeGoals(employeeId).forEach(goal => {
    goal.locked = false;
    goal.approvalStatus = "Returned";
    goal.submitted = false;
    goal.updatedAt = new Date().toISOString();
  });
  audit("Admin unlocked locked goals", employeeId);
  saveState();
  render();
}

function validateGoalSheet(goals) {
  const messages = [];
  if (!goals.length) messages.push("At least one goal is required.");
  if (goals.length > 8) messages.push("Maximum number of goals per employee is 8.");
  if (goals.some(goal => Number(goal.weightage) < 10)) messages.push("Minimum weightage per individual goal is 10%.");
  if (sumWeight(goals) !== 100) messages.push("Total weightage across all goals must equal 100%.");
  return messages;
}

function sumWeight(goals) {
  return goals.reduce((total, goal) => total + Number(goal.weightage || 0), 0);
}

function sheetStatus(goals) {
  if (!goals.length) return "Not Started";
  if (goals.every(goal => goal.approvalStatus === "Approved")) return "Approved";
  if (goals.some(goal => goal.approvalStatus === "Submitted")) return "Submitted";
  if (goals.some(goal => goal.approvalStatus === "Returned")) return "Returned";
  return "Draft";
}

function progressScore(goal, quarter = state.session.activeWindow) {
  const actual = goal.actuals[quarter] || goal.actuals.q1 || goal.actuals.q2 || goal.actuals.q3 || goal.actuals.q4;
  if (!actual && actual !== 0) return 0;
  const target = Number(goal.target);
  const achieved = Number(actual);
  if (goal.uom.startsWith("Min")) return clamp((achieved / target) * 100);
  if (goal.uom.startsWith("Max")) return achieved === 0 ? 100 : clamp((target / achieved) * 100);
  if (goal.uom === "Zero") return Number(actual) === 0 ? 100 : 0;
  if (goal.uom === "Timeline") {
    const planned = new Date(goal.deadline || goal.target).getTime();
    const done = new Date(actual).getTime();
    if (!planned || !done) return 0;
    return done <= planned ? 100 : 60;
  }
  return 0;
}

function averageProgress(goals, quarter = state.session.activeWindow) {
  if (!goals.length) return 0;
  return goals.reduce((total, goal) => total + progressScore(goal, quarter), 0) / goals.length;
}

function clamp(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function latestCheckin(employeeId) {
  const item = state.checkins.filter(checkin => checkin.employeeId === employeeId).slice(-1)[0];
  return item ? `${item.period.toUpperCase()} - ${new Date(item.createdAt).toLocaleDateString()}` : "Not logged";
}

function reportRows() {
  return state.goals.map(goal => {
    const employee = users.find(user => user.id === goal.employeeId);
    return {
      employee: employee.name,
      department: employee.department,
      goal: goal.title,
      uom: goal.uom,
      target: goal.target,
      q1: goal.actuals.q1 || "",
      q2: goal.actuals.q2 || "",
      q3: goal.actuals.q3 || "",
      q4: goal.actuals.q4 || "",
      progress: Math.round(progressScore(goal))
    };
  });
}

function exportCsv() {
  const headers = ["Employee", "Department", "Goal", "UoM", "Target", "Q1 Actual", "Q2 Actual", "Q3 Actual", "Q4 Actual", "Progress"];
  const csv = [headers, ...reportRows().map(row => [row.employee, row.department, row.goal, row.uom, row.target, row.q1, row.q2, row.q3, row.q4, row.progress])]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "atomquest-achievement-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function exportExcel() {
  const headers = ["Employee", "Department", "Goal", "UoM", "Target", "Q1 Actual", "Q2 Actual", "Q3 Actual", "Q4 Actual", "Progress"];
  const rows = reportRows().map(row => [row.employee, row.department, row.goal, row.uom, row.target, row.q1, row.q2, row.q3, row.q4, `${row.progress}%`]);
  const html = `
    <html><head><meta charset="utf-8"></head><body>
      <table border="1">
        <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(value => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </body></html>
  `;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "atomquest-achievement-report.xls";
  link.click();
  URL.revokeObjectURL(url);
}

function notify(recipientId, channel, subject, message, linkView = "notifications") {
  state.notifications.push({
    id: uid(),
    channel,
    recipientId,
    subject,
    message,
    linkView,
    read: false,
    createdAt: new Date().toISOString()
  });
}

function audit(action, entityId) {
  state.audits.push({
    id: uid(),
    actorId: currentUserId,
    entity: "Portal",
    entityId: String(entityId),
    action,
    at: new Date().toISOString()
  });
}

function stat(label, value, hint) {
  return `<div class="stat span-3"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(hint)}</span></div>`;
}

function chartBlock(title, rows, suffix) {
  const max = Math.max(1, ...rows.map(row => Number(row.value) || 0));
  return `
    <article class="chart-card">
      <h4>${escapeHtml(title)}</h4>
      <div class="chart-list">
        ${rows.map(row => {
          const width = suffix === "%" ? clamp(row.value) : Math.round((row.value / max) * 100);
          return `
            <div class="chart-row">
              <span>${escapeHtml(row.label)}</span>
              <div class="chart-track"><i style="width:${width}%"></i></div>
              <strong>${escapeHtml(String(row.value))}${suffix}</strong>
            </div>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function statusBadge(status) {
  const map = {
    Approved: "ok",
    Completed: "ok",
    Submitted: "info",
    Draft: "warn",
    Returned: "danger",
    Pending: "warn",
    "Not Started": "warn"
  };
  return `<span class="badge ${map[status] || ""}">${escapeHtml(status)}</span>`;
}

function options(items, selected = items[0]) {
  return items.map(item => `<option value="${escapeAttr(item)}" ${item === selected ? "selected" : ""}>${escapeHtml(item)}</option>`).join("");
}

function openModal(title, body) {
  const template = document.querySelector("#modalTemplate").content.cloneNode(true);
  template.querySelector("h3").textContent = title;
  template.querySelector(".modal-body").innerHTML = body;
  template.querySelector(".icon-button").addEventListener("click", closeModal);
  document.body.append(template);
}

function closeModal() {
  document.querySelector(".modal-backdrop")?.remove();
}

function toast(message) {
  alertsEl.innerHTML = `<div class="alert">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

init();
