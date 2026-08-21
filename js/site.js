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

function updateVisitCount() {
  if (!visitCount) return;

  const renderVisitCount = () => {
    if (!window.goatcounter?.visit_count) return false;

    window.goatcounter.visit_count({
      append: "#visit-count",
      path: "TOTAL",
      no_branding: true,
      attr: { "aria-label": "Total visits" },
    });
    return true;
  };

  if (renderVisitCount()) return;

  const waitForGoatCounter = window.setInterval(() => {
    if (!renderVisitCount()) return;
    window.clearInterval(waitForGoatCounter);
  }, 100);
  window.setTimeout(() => window.clearInterval(waitForGoatCounter), 5000);
}

updateVisitCount();
