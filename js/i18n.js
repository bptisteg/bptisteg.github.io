const translations = {
  en: {
    role: 'Jet shooter in the French Navy <img class="flag-inline" src="assets/flag-fr.svg" alt="" />',
    about2:
      'In my free time, I\'m staff for <a href="https://tickettool.xyz" target="_blank" rel="noopener noreferrer"><img class="company-logo" src="assets/icons/tickettool.png" alt="" /> Ticket Tool</a> and <a href="https://beammp.com" target="_blank" rel="noopener noreferrer"><img class="company-logo" src="assets/icons/beammp.png" alt="" /> BeamMP</a>',
    about3:
      'I like to code <img class="discord-emoji" src="assets/1500212724829917365.gif" alt="" /> I\'m currently working on some Discord bot projects, which are still in the early stages.',
    projectsTitle: "Projects & Communities",
    ticketDescription: "Staff member for a Discord ticket management service.",
    beamDescription: "Staff member for the BeamNG.drive multiplayer community.",
    meowDescription: "My personal music bot project for Discord.",
      communityStatus: "Community staff",
      developmentStatus: "In development",
      lastUpdated: "Last updated",
      visits: "Visits",
    listening: "Listening on Spotify",
    notListening: "Not listening right now",
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
      'Sur mon temps libre, je suis staff sur <a href="https://tickettool.xyz" target="_blank" rel="noopener noreferrer"><img class="company-logo" src="assets/icons/tickettool.png" alt="" /> Ticket Tool</a> et <a href="https://beammp.com" target="_blank" rel="noopener noreferrer"><img class="company-logo" src="assets/icons/beammp.png" alt="" /> BeamMP</a>',
    about3:
      "J'aime coder <img class=\"discord-emoji\" src=\"assets/1500212724829917365.gif\" alt=\"\" /> Je travaille actuellement sur des projets de bots Discord, qui en sont encore à leurs débuts.",
    projectsTitle: "Projets et communautés",
    ticketDescription: "Staff pour un service de gestion de tickets Discord.",
    beamDescription: "Staff pour la communauté multijoueur de BeamNG.drive.",
    meowDescription: "Mon projet personnel de bot musique pour Discord.",
      communityStatus: "Staff communauté",
      developmentStatus: "En développement",
      lastUpdated: "Dernière mise à jour",
      visits: "Visites",
    listening: "Écoute sur Spotify",
    notListening: "Rien en ce moment",
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
