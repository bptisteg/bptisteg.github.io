/**
 * MeowBot dashboard — login page
 */
(function () {
  "use strict";

  function prefersReducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  function smoothScrollTo(y, duration, easeFn) {
    return new Promise(function (resolve) {
      var ease = easeFn || easeInOutCubic;
      var startY = window.scrollY || window.pageYOffset || 0;
      var delta = y - startY;
      if (Math.abs(delta) < 2 || prefersReducedMotion()) {
        window.scrollTo(0, y);
        resolve();
        return;
      }
      var start = performance.now();
      function frame(now) {
        var p = Math.min(1, (now - start) / duration);
        window.scrollTo(0, startY + delta * ease(p));
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function initLoginHeroMotion() {
    var land = document.querySelector(".tt-login__hero-land");
    if (!land) return;

    requestAnimationFrame(function () {
      land.classList.add("is-hero-in");
    });
  }

  function revealFeatures(section, cinematic) {
    if (!section) return;
    if (cinematic) {
      section.classList.add("is-explore-in");
      section.classList.remove("is-visible", "is-explore-pulse");
      void section.offsetWidth;
      requestAnimationFrame(function () {
        section.classList.add("is-visible");
        section.classList.add("is-explore-pulse");
        window.setTimeout(function () {
          section.classList.remove("is-explore-pulse");
        }, 1100);
        window.setTimeout(function () {
          section.classList.remove("is-explore-in");
        }, 1400);
      });
      return;
    }
    section.classList.add("is-visible");
  }

  function initLoginFeatures() {
    var section = document.querySelector(".tt-login-features");
    if (!section) return;
    var observer = null;
    var played = false;

    function play() {
      if (played) return;
      if (document.body.classList.contains("is-exploring")) return;
      played = true;
      revealFeatures(section, !prefersReducedMotion());
      if (observer) observer.disconnect();
    }

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) play();
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
      observer.observe(section);
    } else {
      play();
    }

    window.MeowBotDashStopLoginFeaturesObserver = function () {
      if (observer) observer.disconnect();
    };

    window.MeowBotDashMarkLoginFeaturesPlayed = function () {
      played = true;
      if (observer) observer.disconnect();
    };
  }

  function spawnExploreSparks() {
    var host = document.querySelector(".tt-login__explore-sparks");
    if (!host || prefersReducedMotion()) return;
    host.innerHTML = "";
    var count = 14;
    for (var i = 0; i < count; i++) {
      var spark = document.createElement("span");
      spark.className = "tt-login__explore-spark";
      var angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      var dist = 48 + Math.random() * 90;
      spark.style.setProperty("--sx", Math.cos(angle) * dist + "px");
      spark.style.setProperty("--sy", Math.sin(angle) * dist - 20 + "px");
      spark.style.animationDelay = Math.random() * 0.12 + "s";
      host.appendChild(spark);
    }
    window.setTimeout(function () {
      host.innerHTML = "";
    }, 1000);
  }

  function initLoginExplore() {
    var link = document.querySelector("[data-login-explore]");
    var section = document.querySelector("#features") || document.querySelector(".tt-login-features");
    var land = document.querySelector(".tt-login__hero-land");
    if (!link || !section) return;

    var scrolling = false;

    link.addEventListener("click", function (e) {
      e.preventDefault();
      if (scrolling) return;
      scrolling = true;

      if (typeof window.MeowBotDashStopLoginFeaturesObserver === "function") {
        window.MeowBotDashStopLoginFeaturesObserver();
      }
      if (typeof window.MeowBotDashMarkLoginFeaturesPlayed === "function") {
        window.MeowBotDashMarkLoginFeaturesPlayed();
      }

      link.classList.add("is-press");
      section.classList.remove("is-visible", "is-explore-in", "is-explore-pulse");
      spawnExploreSparks();

      var top =
        section.getBoundingClientRect().top +
        (window.scrollY || window.pageYOffset || 0) -
        80;

      var startDelay = prefersReducedMotion() ? 0 : 160;

      wait(startDelay)
        .then(function () {
          document.body.classList.add("is-exploring");
          if (land) land.classList.add("is-exploring-hero");
          link.classList.remove("is-press");
          return smoothScrollTo(Math.max(0, top), prefersReducedMotion() ? 0 : 1280, easeOutQuint);
        })
        .then(function () {
          revealFeatures(section, !prefersReducedMotion());
          return wait(prefersReducedMotion() ? 0 : 260);
        })
        .then(function () {
          document.body.classList.remove("is-exploring");
          if (land) land.classList.remove("is-exploring-hero");
          scrolling = false;
        });
    });
  }

  function initLoginTopBtn() {
    var btn = document.querySelector("[data-login-top]");
    if (!btn) return;

    function sync() {
      btn.hidden = window.scrollY < 420;
    }

    window.addEventListener("scroll", sync, { passive: true });
    sync();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initLoginTypewriter() {
    var el = document.querySelector("[data-login-typewriter]");
    if (!el) return;


    function buildTracks() {
      return [
        { text: "she doesn't mind pitbull remix" },
        { text: "beautiful pain eminem" },
        { text: "function 6 senz" },
        { text: "self aware temper city" },
        { text: "bang my head david guetta" },
        { text: "https://open.spotify.com/track/…" },
      ];
    }

    var tracks = buildTracks();
    var trackIndex = 0;
    var charIndex = 0;
    var deleting = false;
    var holdMs = 0;

    function applyNoteStyle(on) {
      el.classList.toggle("is-note", !!on);
      el.style.fontStyle = on ? "italic" : "";
    }

    function current() {
      return tracks[trackIndex] || { text: "" };
    }

    if (prefersReducedMotion()) {
      applyNoteStyle(current().note);
      el.textContent = current().text || tracks[0].text;
      return;
    }

    function tick() {
      tracks = buildTracks();
      var item = current();
      var full = item.text || "";
      applyNoteStyle(item.note);

      if (!deleting) {
        charIndex += 1;
        el.textContent = full.slice(0, charIndex);
        if (charIndex >= full.length) {
          holdMs += 70;
          if (holdMs > (item.note ? 2200 : 1600)) {
            deleting = true;
            holdMs = 0;
          }
          window.setTimeout(tick, 70);
          return;
        }
        window.setTimeout(tick, item.note ? 52 + Math.random() * 28 : 42 + Math.random() * 36);
        return;
      }

      charIndex -= 1;
      el.textContent = full.slice(0, Math.max(0, charIndex));
      if (charIndex <= 0) {
        deleting = false;
        applyNoteStyle(false);
        trackIndex = (trackIndex + 1) % tracks.length;
        window.setTimeout(tick, 320);
        return;
      }
      window.setTimeout(tick, 22);
    }

    el.textContent = "";
    applyNoteStyle(false);
    window.setTimeout(tick, 500);
  }

  var site = {
    supportUrl: "https://discord.gg/tkvtbsd7gA",
    githubUrl: "https://github.com/bptisteg",
  };

  document.querySelectorAll("[data-site-support]").forEach(function (el) {
    el.setAttribute("href", site.supportUrl);
  });
  document.querySelectorAll("[data-site-github]").forEach(function (el) {
    el.setAttribute("href", site.githubUrl);
  });

  initLoginHeroMotion();
  initLoginFeatures();
  initLoginExplore();
  initLoginTopBtn();
  initLoginTypewriter();
})();
