const clockEl = document.getElementById("clock");
const yearEl = document.getElementById("year");
const timeZone = "Europe/Paris";

function formatTime(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function tick() {
  if (clockEl) {
    clockEl.textContent = formatTime(new Date());
  }
}

tick();
setInterval(tick, 1000);

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}
