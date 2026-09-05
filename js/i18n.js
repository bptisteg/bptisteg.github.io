const translations = {
  en: {
    role: "A cool french guy who is a jet shooter at French Navy! <img class=\"flag\" src=\"assets/flag-fr.svg\" alt=\"Drapeau français\" />",
    about: "In my free time, I'm staff for various Discord communities <img class=\"emoji\" src=\"assets/1500212724829917365.gif\" alt=\"Emoji Kirby\" />",
    projects: "Projects",
    spotifyLabel: "Listening to Spotify",
    spotifyPaused: "Paused on Spotify",
    notListening: "Not listening"
  },
  fr: {
    role: "Un type cool français qui est OPS manutention d'aéronerf dans la Marine Nationale! <img class=\"flag\" src=\"assets/flag-fr.svg\" alt=\"Drapeau français\" />",
    about: "Pendant mon temps libre, je suis staff pour diverses communautés Discord <img class=\"emoji\" src=\"assets/1500212724829917365.gif\" alt=\"Emoji Kirby\" />",
    projects: "Projets",
    spotifyLabel: "Écoute Spotify",
    spotifyPaused: "En pause sur Spotify",
    notListening: "N'écoute pas"
  }
};

window.translations = translations;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function setLanguage(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);

  // Update all translatable elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Update buttons state
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Show toast notification
  showToast(lang === 'fr' ? 'Langue changée en français' : 'Language changed to English');

  // Handle URL for language switching (only in production, not file:// or localhost)
  if (window.location.protocol !== 'file:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1') {
    const currentPath = window.location.pathname;
    try {
      if (lang === 'fr' && !currentPath.startsWith('/fr')) {
        window.history.replaceState({}, '', '/fr' + currentPath);
      } else if (lang === 'en' && currentPath.startsWith('/fr')) {
        window.history.replaceState({}, '', currentPath.replace('/fr', ''));
      }
    } catch (e) {
      console.warn('URL manipulation failed:', e);
    }
  }
}

// Initialize language after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('lang') || 'en';
  setLanguage(savedLang);

  // Event listeners for language buttons
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // Handle project skeleton loading - improved version
  function handleImageLoad(img) {
    const parent = img.parentElement;
    if (parent) {
      parent.classList.add('loaded');
      parent.classList.remove('loading');
    }
  }

  // Check all project images
  document.querySelectorAll('.project img').forEach(img => {
    // If already loaded, handle immediately
    if (img.complete && img.naturalHeight !== 0) {
      handleImageLoad(img);
    } else {
      // Otherwise wait for load event
      img.addEventListener('load', () => handleImageLoad(img));
      img.addEventListener('error', () => handleImageLoad(img));
    }
  });

  // Fallback: remove skeletons after 3 seconds even if images don't load
  setTimeout(() => {
    document.querySelectorAll('.project.loading').forEach(project => {
      project.classList.add('loaded');
      project.classList.remove('loading');
    });
  }, 3000);
});
