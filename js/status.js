const DISCORD_ID = "225349654974431232";
const SOCKET_URL = "wss://api.lanyard.rest/socket";
const REST_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;
const EMAIL = "bptisteg@gmail.com";

const statusEl = document.querySelector(".status");
const bubbleEl = document.querySelector(".status-bubble");
const spotifyBox = document.getElementById("spotify");
const spotifyArt = document.getElementById("spotify-art");
const spotifySong = document.getElementById("spotify-song");
const spotifyArtist = document.getElementById("spotify-artist");
const spotifyProgress = document.getElementById("spotify-progress");
const spotifyBar = document.querySelector(".spotify-bar");
const spotifyLabel = document.querySelector(".spotify-label");
const spotifyCurrent = document.getElementById("spotify-current");
const spotifyDuration = document.getElementById("spotify-duration");
const mailBtn = document.getElementById("copy-email");

let lastPresence = "idle";
let lastSpotify = null;
let progressTimer = null;

function statusLabel(presence) {
  return translations[window.currentLang]?.status?.[presence] || presence;
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

  const presence = ["online", "idle", "dnd", "offline"].includes(data.discord_status)
    ? data.discord_status
    : "offline";
  lastPresence = presence;

  statusEl.classList.remove("online", "idle", "dnd", "offline");
  statusEl.classList.add(presence);
  statusEl.title = statusLabel(presence);
  statusEl.setAttribute("aria-label", statusLabel(presence));

  const custom = (data.activities || []).find((activity) => activity.type === 4);
  const text = String(custom?.state || "").trim();

  if (bubbleEl) {
    if (presence === "offline" || !text) {
      bubbleEl.classList.add("hidden");
      bubbleEl.textContent = "";
    } else {
      bubbleEl.textContent = text;
      bubbleEl.classList.remove("hidden");
    }
  }

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
  };
}

window.refreshPresenceLabels = function refreshPresenceLabels() {
  if (statusEl) {
    statusEl.title = statusLabel(lastPresence);
    statusEl.setAttribute("aria-label", statusLabel(lastPresence));
  }
  updateSpotify(lastSpotify);
};

function updateSpotify(spotify) {
  lastSpotify = spotify;
  if (!spotifyBox) return;

  clearInterval(progressTimer);

  if (!spotify) {
    spotifyBox.classList.add("idle");
    spotifyBox.href = "https://open.spotify.com/";
    if (spotifyArt) {
      spotifyArt.removeAttribute("src");
      spotifyArt.hidden = true;
    }
    if (spotifySong) spotifySong.textContent = "Spotify";
    if (spotifyArtist) spotifyArtist.textContent = "";
    if (spotifyCurrent) spotifyCurrent.textContent = "0:00";
    if (spotifyDuration) spotifyDuration.textContent = "0:00";
    if (spotifyLabel) {
      spotifyLabel.dataset.i18n = "notListening";
      spotifyLabel.textContent = t("notListening");
    }
    return;
  }

  spotifyBox.classList.remove("idle");
  spotifyBox.href = `https://open.spotify.com/track/${spotify.track_id}`;

  if (spotifyArt) {
    spotifyArt.src = spotify.album_art_url;
    spotifyArt.alt = spotify.album || spotify.song || "";
    spotifyArt.hidden = false;
  }
  if (spotifySong) spotifySong.textContent = spotify.song || "";
  if (spotifyArtist) spotifyArtist.textContent = spotify.artist || "";
  if (spotifyLabel) {
    spotifyLabel.dataset.i18n = "listening";
    spotifyLabel.textContent = t("listening");
  }
  const start = Number(spotify.timestamps?.start) || 0;
  const end = Number(spotify.timestamps?.end) || 0;

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(total / 60);
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
  progressTimer = setInterval(tick, 1000);
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

mailBtn?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
  } catch {
    const field = document.createElement("textarea");
    field.value = EMAIL;
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }

  mailBtn.setAttribute("tooltip", t("copied"));
  mailBtn.classList.add("copied");
  setTimeout(() => {
    mailBtn.setAttribute("tooltip", t("copyEmail"));
    mailBtn.classList.remove("copied");
  }, 1600);
});

loadOnce();
connectSocket();
setInterval(loadOnce, 12000);
