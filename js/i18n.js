const translations = {
  en: {
    role: 'Jet shooter in the French Navy <img class="flag-inline" src="assets/flag-fr.svg" alt="" />',
    about2:
      'In my free time I’m staff on <a href="https://tickettool.xyz" target="_blank" rel="noopener noreferrer">Ticket Tool</a> and <a href="https://beammp.com" target="_blank" rel="noopener noreferrer">BeamMP</a>!',
    about3:
      'I like to code. I’m currently working on two bot projects: a music bot called <a href="https://discord.gg/tkvtbsd7gA" target="_blank" rel="noopener noreferrer">MeowBot</a> and a translator bot. They’re both still in the early stages.',
    listening: "Listening on Spotify",
    notListening: "Not listening right now",
    copyEmail: "Copy email",
    copied: "Copied!",
    status: {
      online: "Online",
      idle: "Idle",
      dnd: "Do not disturb",
      offline: "Offline",
    },
  },
  fr: {
    role: 'Opérateur manutention d\'aéronerf dans la Marine nationale <img class="flag-inline" src="assets/flag-fr.svg" alt="" />',
    about2:
      'Sur mon temps libre, je suis staff sur <a href="https://tickettool.xyz" target="_blank" rel="noopener noreferrer">Ticket Tool</a> et <a href="https://beammp.com" target="_blank" rel="noopener noreferrer">BeamMP</a> !',
    about3:
      "J’aime coder. Je travaille actuellement sur deux projets de bots : un bot musique appelé <a href=\"https://discord.gg/tkvtbsd7gA\" target=\"_blank\" rel=\"noopener noreferrer\">MeowBot</a> et un bot traducteur. Ils en sont encore tous les deux à leurs débuts.",
    listening: "Écoute sur Spotify",
    notListening: "Rien en ce moment",
    copyEmail: "Copier l’e-mail",
    copied: "Copié !",
    status: {
      online: "En ligne",
      idle: "Inactif",
      dnd: "Ne pas déranger",
      offline: "Hors ligne",
    },
  },
};

function detectLang() {
  const saved = localStorage.getItem("lang");
  if (saved === "fr" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

window.currentLang = detectLang();

function t(key) {
  return translations[window.currentLang][key];
}

function applyLang() {
  const lang = window.currentLang;
  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = translations[lang][el.dataset.i18n];
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = translations[lang][el.dataset.i18nHtml];
  });

  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  const mailBtn = document.getElementById("copy-email");
  if (mailBtn && mailBtn.getAttribute("tooltip") !== translations[lang].copied) {
    mailBtn.setAttribute("tooltip", translations[lang].copyEmail);
    mailBtn.setAttribute("aria-label", translations[lang].copyEmail);
  }

  if (typeof window.refreshPresenceLabels === "function") {
    window.refreshPresenceLabels();
  }
}

document.querySelectorAll(".lang-switch button").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.currentLang = btn.dataset.lang;
    applyLang();
  });
});

applyLang();
