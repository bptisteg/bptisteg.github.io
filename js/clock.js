const clockEl = document.getElementById("clock");
const timeEl = document.getElementById("clock-time");

function parisNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type)?.value || "00";
  return `${get("hour")}:${get("minute")}:${get("second")}`;
}

function tickClock() {
  if (!timeEl) return;
  const value = parisNow();
  timeEl.textContent = value;
  if (clockEl) {
    const label = window.currentLang === "fr" ? "Heure à Paris" : "Paris time";
    clockEl.setAttribute("aria-label", `${label} ${value}`);
  }
}

tickClock();
setInterval(tickClock, 1000);
