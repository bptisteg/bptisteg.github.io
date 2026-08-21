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

  fetch("https://baptisteg.goatcounter.com/counter/TOTAL.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Visit counter returned ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const totalVisits = Number(data.count);
      if (!Number.isFinite(totalVisits)) throw new Error("Visit counter returned an invalid count");
      visitCount.textContent = totalVisits.toLocaleString();
    })
    .catch((error) => {
      console.warn("Unable to load the shared visit counter.", error);
      visitCount.textContent = "-";
    });
}

updateVisitCount();
