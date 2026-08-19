const themeToggle = document.getElementById("theme-toggle");
const visitCount = document.getElementById("visit-count");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);
  localStorage.setItem("theme", isLight ? "light" : "dark");

  if (themeMeta) themeMeta.setAttribute("content", isLight ? "#f2f3f5" : "#36393f");
  if (themeToggle) {
    const label = isLight ? "Switch to dark theme" : "Switch to light theme";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("title", label);
    themeToggle.classList.toggle("is-light", isLight);
  }
}

const savedTheme = localStorage.getItem("theme");
const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
applyTheme(initialTheme);

themeToggle?.addEventListener("click", () => {
  applyTheme(document.body.classList.contains("light-theme") ? "dark" : "light");
});

const visitorKey = "baptisteg-visitor-id";
const visitCountKey = "baptisteg-visit-count";

function getVisitorId() {
  let visitorId = localStorage.getItem(visitorKey);
  if (!visitorId) {
    visitorId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(visitorKey, visitorId);
    return { visitorId, isNew: true };
  }
  return { visitorId, isNew: false };
}

function updateVisitCount() {
  const storedVisits = Number.parseInt(localStorage.getItem(visitCountKey) || "0", 10);
  const visits = Number.isFinite(storedVisits) ? storedVisits : 0;
  const visitor = getVisitorId();
  const totalVisits = visitor.isNew ? visits + 1 : visits;

  localStorage.setItem(visitCountKey, String(totalVisits));
  if (visitCount) visitCount.textContent = totalVisits.toLocaleString();
}

updateVisitCount();
