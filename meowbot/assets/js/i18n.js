/**
 * i18n compacte pour l’aperçu public (EN / FR).
 */
(function () {
  "use strict";

  window.MeowBotI18nDict = {
    en: {
      backToTop: "Back to top",
      dashboard: "Dashboard",
      devBy: "Dev by",
      documentation: "Documentation",
      featAutoplayDesc: "Related tracks keep playing when the queue ends.",
      featAutoplayTitle: "AutoPlay",
      featFiltersDesc: "Adjust the sound to your liking with a variety of filters.",
      featFiltersTitle: "Filters",
      featMusicDesc:
        "Song names, Spotify, SoundCloud, Apple Music, Deezer, Tidal & radio. YouTube when available.",
      featMusicTitle: "Built for Spotify & SoundCloud",
      featPlayerDesc: "Play music from the web with a live player.",
      featPlayerTitle: "Web Player",
      featPlaylistsDesc: "Create and manage playlists for your server with ease.",
      featPlaylistsTitle: "Playlists",
      featPremiumDesc: "Premium features include custom avatars, banners, bios, and more.",
      featPremiumTitle: "Customize Bot",
      features: "Features",
      featuresMore: "And more coming..",
      footerHome: "Home Page",
      footerLegal: "Legal",
      footerPages: "Pages",
      footerTagline:
        "A new kind of music bot - Spotify, SoundCloud, Apple Music, Deezer, Tidal, world radio & direct links.",
      inviteBot: "Invite Bot",
      joinSupport: "Join Support",
      language: "Language",
      legalPrivacy: "Privacy",
      legalPrivacyTitle: "Privacy Policy",
      legalTerms: "Terms",
      legalTermsTitle: "Terms of Service",
      legalUpdated: "Last updated : 26 July 2026",
      loginLead: "The new bot discord to play music",
      previewTag: "Preview",
      previewBanner: "Not the final version. Design and features may still change.",
      scrollFeatures: "Explore features",
      slashQueryHint: "Search by song name OR paste url from supported sources",
      supportServer: "Support",
      supportedPlatforms: "Supported platforms",
    },
    fr: {
      backToTop: "Retour en haut",
      dashboard: "Dashboard",
      devBy: "Dev par",
      documentation: "Documentation",
      featAutoplayDesc: "Des titres liés continuent quand la file se vide.",
      featAutoplayTitle: "AutoPlay",
      featFiltersDesc: "Nightcore, vaporwave, 8D, bassboost, karaoke et plus — en direct.",
      featFiltersTitle: "Filtres",
      featMusicDesc:
        "Noms de titres, Spotify, SoundCloud, Apple Music, Deezer, Tidal & radio. YouTube quand disponible.",
      featMusicTitle: "Pensé pour Spotify & SoundCloud",
      featPlayerDesc: "Pause, skip, filtres, autoplay et file depuis le dashboard.",
      featPlayerTitle: "Web Player",
      featPlaylistsDesc: "Sauvegarde des playlists serveur et lance-les en une commande.",
      featPlaylistsTitle: "Playlists",
      featPremiumDesc: "Reste connecté avec Premium, rôles DJ et files plus grandes.",
      featPremiumTitle: "24/7 & DJ",
      features: "Fonctionnalités",
      featuresMore: "Et plus à venir..",
      footerHome: "Accueil",
      footerLegal: "Légal",
      footerPages: "Pages",
      footerTagline:
        "Bot musical de haute qualité — noms de titres, Spotify, SoundCloud, Apple Music, Deezer, Tidal, radio mondiale & liens directs. YouTube quand disponible.",
      inviteBot: "Inviter le bot",
      joinSupport: "Rejoindre le support",
      language: "Langue",
      legalPrivacy: "Confidentialité",
      legalPrivacyTitle: "Politique de confidentialité",
      legalTerms: "CGU",
      legalTermsTitle: "Conditions d’utilisation",
      legalUpdated: "Dernière mise à jour : 26 juillet 2026",
      loginLead: "Le nouveau bot discord pour jouer de la musique",
      previewTag: "Aperçu",
      previewBanner: "Ceci n’est pas la version finale — un aperçu temporaire. Le design et les fonctionnalités peuvent encore changer.",
      scrollFeatures: "Explorer les fonctionnalités",
      slashQueryHint: "Cherche un titre OU colle une URL d’une source supportée",
      supportServer: "Support",
      supportedPlatforms: "Plateformes supportées",
    },
  };

  var LANG_KEY = "meowbot-lang";
  var dict = window.MeowBotI18nDict;

  function lang() {
    return localStorage.getItem(LANG_KEY) === "fr" ? "fr" : "en";
  }

  function t(key) {
    var pack = dict[lang()] || dict.en;
    return pack[key] || dict.en[key] || key;
  }

  function applyI18n() {
    var current = lang();
    document.documentElement.setAttribute("lang", current === "fr" ? "fr" : "en-GB");
    document.documentElement.setAttribute("data-lang", current);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (key && t(key)) el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (key && t(key)) el.setAttribute("title", t(key));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria-label");
      if (key && t(key)) el.setAttribute("aria-label", t(key));
    });

    syncLangDropdowns(current);
  }

  var LANG_META = {
    en: { code: "EN", flag: "assets/img/flags/gb.svg" },
    fr: { code: "FR", flag: "assets/img/flags/fr.svg" },
  };

  function flagSrc(meta) {
    var base = document.documentElement.getAttribute("data-asset-base") || "";
    return base + meta.flag;
  }

  function syncLangDropdowns(current) {
    var meta = LANG_META[current] || LANG_META.en;
    document.querySelectorAll("[data-lang-dropdown]").forEach(function (dd) {
      var flag = dd.querySelector("[data-lang-flag]");
      var code = dd.querySelector("[data-lang-code]");
      if (flag && flag.tagName === "IMG") flag.setAttribute("src", flagSrc(meta));
      if (code) code.textContent = meta.code;
      dd.querySelectorAll("[data-set-lang]").forEach(function (opt) {
        var active = opt.getAttribute("data-set-lang") === current;
        opt.classList.toggle("is-active", active);
        opt.setAttribute("aria-selected", active ? "true" : "false");
      });
    });
  }

  function setLanguage(next) {
    if (next !== "en" && next !== "fr") return;
    if (next === lang()) return;
    localStorage.setItem(LANG_KEY, next);
    applyI18n();
  }

  function initLangDropdowns() {
    document.querySelectorAll("[data-lang-dropdown]").forEach(function (dd) {
      var btn = dd.querySelector(".tt-lang-dd__btn");
      var menu = dd.querySelector(".tt-lang-dd__menu");
      if (!btn || !menu) return;

      function close() {
        menu.hidden = true;
        btn.setAttribute("aria-expanded", "false");
        dd.classList.remove("is-open");
      }

      function open() {
        menu.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        dd.classList.add("is-open");
      }

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (menu.hidden) open();
        else close();
      });

      menu.querySelectorAll("[data-set-lang]").forEach(function (opt) {
        opt.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          setLanguage(opt.getAttribute("data-set-lang"));
          close();
        });
      });
    });

    document.addEventListener("click", function () {
      document.querySelectorAll("[data-lang-dropdown].is-open").forEach(function (dd) {
        dd.classList.remove("is-open");
        var menu = dd.querySelector(".tt-lang-dd__menu");
        var btn = dd.querySelector(".tt-lang-dd__btn");
        if (menu) menu.hidden = true;
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  window.MeowBotLang = {
    t: t,
    lang: lang,
    apply: applyI18n,
    set: setLanguage,
    initDropdowns: initLangDropdowns,
  };
})();
