const DISCORD_ID = "225349654974431232";
const SOCKET_URL = "wss://api.lanyard.rest/socket";
const REST_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;
const LOCAL_DECORATION_ASSET = "a_89cd445201a0c6c64d46876503d0e90e";
const statusEl = document.querySelector(".status");
const statusIcon = document.querySelector(".status-icon");
const avatarDecoration = document.querySelector(".avatar-decoration");
const spotifyBox = document.getElementById("spotify");
const spotifyArt = document.getElementById("spotify-art");
const spotifySong = document.getElementById("spotify-song");
const spotifyArtist = document.getElementById("spotify-artist");
const spotifyLabel = document.querySelector(".spotify-label");
const spotifyCurrent = document.getElementById("spotify-current");
const spotifyDuration = document.getElementById("spotify-duration");
const spotifyProgress = document.getElementById("spotify-progress");
let lastPresence = "idle";
let lastSpotify = null;
let progressTimer = null;

function statusIconPath(presence, data) {
  if (presence === "online") {
    const isMobile =
      data?.client_status?.mobile ||
      data?.active_on_discord_mobile ||
      (location.hostname === "localhost" && !data?.active_on_discord_mobile);
    return {
      path: isMobile ? "assets/icons/online-mobile.png" : "assets/icons/online.png",
      mobile: isMobile,
    };
  }
  if (presence === "idle") return { path: "assets/icons/idle.png", mobile: false };
  if (presence === "dnd") return { path: "assets/icons/DND.png", mobile: false };
  return { path: "", mobile: false };
}

function updateAvatarDecoration(data) {
  const asset =
    data?.discord_user?.avatar_decoration_data?.asset ||
    (location.hostname === "localhost" ? LOCAL_DECORATION_ASSET : "");
  if (!avatarDecoration) return;

  if (asset) {
    avatarDecoration.src = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=240`;
    avatarDecoration.hidden = false;
  } else {
    avatarDecoration.removeAttribute("src");
    avatarDecoration.hidden = true;
  }
}

if (location.hostname === "localhost") {
  updateAvatarDecoration({});
}

function normalizePresence(data) {
  if (!data || typeof data !== "object") return null;
  if (data.discord_status || data.spotify || data.activities || data.listening_to_spotify) {
    return data;
  }
  if (data[DISCORD_ID]) return data[DISCORD_ID];
  const nested = Object.values(data).find((value) => value && value.discord_user);
  return nested || data;
}

function applyPresence(raw) {
  const data = normalizePresence(raw);
  if (!statusEl || !data) return;
  updateAvatarDecoration(data);

  const presence = ["online", "idle", "dnd", "offline"].includes(data.discord_status)
    ? data.discord_status
    : "offline";
  lastPresence = presence;

  statusEl.classList.remove("online", "idle", "dnd", "offline");
  statusEl.classList.add(presence);
  const icon = statusIconPath(presence, data);
  statusEl.classList.toggle("has-icon", Boolean(icon.path));
  statusEl.classList.toggle("mobile-status", icon.mobile);
  if (statusIcon) {
    if (icon.path) {
      statusIcon.src = icon.path;
    } else {
      statusIcon.removeAttribute("src");
    }
  }
  statusEl.title = presence;
  statusEl.setAttribute("aria-label", presence);

  updateSpotify(extractSpotify(data));
}

function extractSpotify(data) {
  if (data?.listening_to_spotify && data.spotify) return data.spotify;
  if (data?.spotify?.song) return data.spotify;

  const listening = (data?.activities || []).find(
    (activity) =>
      activity.type === 2 ||
      /spotify/i.test(activity.name || "") ||
      String(activity.id || "").startsWith("spotify") ||
      String(activity.party?.id || "").startsWith("spotify")
  );
  if (!listening) return null;

  const image = String(listening.assets?.large_image || "");
  let albumArt = "";
  if (image.startsWith("spotify:")) {
    albumArt = `https://i.scdn.co/image/${image.slice("spotify:".length)}`;
  }

  return {
    track_id: listening.sync_id || "",
    song: listening.details || "",
    artist: listening.state || "",
    album: listening.assets?.large_text || "",
    album_art_url: albumArt,
    timestamps: listening.timestamps || {},
    is_paused: listening.paused || false,
  };
}

function updateSpotify(spotify) {
  lastSpotify = spotify;
  if (!spotifyBox) return;

  clearInterval(progressTimer);

  if (!spotify) {
    spotifyBox.classList.add("hidden");
    spotifyBox.classList.remove("playing", "paused");
    return;
  }

  spotifyBox.classList.remove("hidden");
  spotifyBox.classList.toggle("paused", spotify.is_paused || false);
  spotifyBox.classList.toggle("playing", !spotify.is_paused);
  spotifyBox.href = `https://open.spotify.com/track/${spotify.track_id}`;

  // Update label based on pause state
  if (spotifyLabel) {
    const lang = document.documentElement.lang || 'en';
    const translations = window.translations || { en: { spotifyLabel: "Listening to Spotify", spotifyPaused: "Paused on Spotify" }, fr: { spotifyLabel: "Écoute Spotify", spotifyPaused: "En pause sur Spotify" } };
    const labelKey = spotify.is_paused ? 'spotifyPaused' : 'spotifyLabel';
    spotifyLabel.textContent = translations[lang]?.[labelKey] || translations.en[labelKey];
  }

  if (spotifyArt) {
    // Show skeleton while loading
    spotifyArt.style.display = 'none';
    const skeleton = spotifyArt.previousElementSibling;
    if (skeleton && skeleton.classList.contains('spotify-skeleton')) {
      skeleton.style.display = 'block';
    }

    // Load image with error handling
    const img = new Image();
    img.onload = () => {
      spotifyArt.src = spotify.album_art_url;
      spotifyArt.alt = spotify.album || spotify.song || "";
      spotifyArt.style.display = 'block';
      if (skeleton) skeleton.style.display = 'none';
    };
    img.onerror = () => {
      // Fallback to skeleton if image fails
      if (skeleton) skeleton.style.display = 'block';
      spotifyArt.style.display = 'none';
    };
    img.src = spotify.album_art_url;
  }

  if (spotifySong) spotifySong.textContent = spotify.song || "";
  if (spotifyArtist) spotifyArtist.textContent = spotify.artist || "";

  const start = Number(spotify.timestamps?.start) || 0;
  const end = Number(spotify.timestamps?.end) || 0;

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const minutes = String(Math.floor(total / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function tick() {
    if (!end || end <= start) return;
    const elapsed = Math.min(end - start, Math.max(0, Date.now() - start));
    const ratio = elapsed / (end - start);
    if (spotifyProgress) spotifyProgress.style.width = `${ratio * 100}%`;
    if (spotifyCurrent) spotifyCurrent.textContent = formatTime(elapsed);
    if (spotifyDuration) spotifyDuration.textContent = formatTime(end - start);
  }

  tick();
  if (!spotify.is_paused) {
    progressTimer = setInterval(tick, 1000);
  }
}

function connectSocket() {
  const socket = new WebSocket(SOCKET_URL);
  let heartbeat;

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);

    if (payload.op === 1) {
      const interval = payload.d?.heartbeat_interval || 30000;
      socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
      clearInterval(heartbeat);
      heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ op: 3 }));
        }
      }, interval);
    }

    if (payload.t === "INIT_STATE" || payload.t === "PRESENCE_UPDATE") {
      applyPresence(payload.d);
    }
  });

  socket.addEventListener("close", () => {
    clearInterval(heartbeat);
    setTimeout(connectSocket, 4000);
  });

  socket.addEventListener("error", () => {
    socket.close();
  });
}

async function loadOnce() {
  try {
    const response = await fetch(REST_URL);
    const json = await response.json();
    if (json.success) {
      applyPresence(json.data);
    }
  } catch {
    /* Lanyard indisponible */
  }
}

loadOnce();
connectSocket();
setInterval(loadOnce, 12000);
