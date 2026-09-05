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
let lastPresence = "idle";
let lastSpotify = null;

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
  };
}

function updateSpotify(spotify) {
  lastSpotify = spotify;
  if (!spotifyBox) return;

  if (!spotify) {
    spotifyBox.classList.add("idle");
    spotifyBox.href = "https://open.spotify.com/";
    if (spotifyArt) {
      spotifyArt.removeAttribute("src");
    }
    if (spotifySong) spotifySong.textContent = "Spotify";
    if (spotifyArtist) spotifyArtist.textContent = "";
    if (spotifyLabel) {
      spotifyLabel.textContent = "Not listening";
    }
    return;
  }

  spotifyBox.classList.remove("idle");
  spotifyBox.href = `https://open.spotify.com/track/${spotify.track_id}`;

  if (spotifyArt) {
    spotifyArt.src = spotify.album_art_url;
    spotifyArt.alt = spotify.album || spotify.song || "";
  }
  if (spotifySong) spotifySong.textContent = spotify.song || "";
  if (spotifyArtist) spotifyArtist.textContent = spotify.artist || "";
  if (spotifyLabel) {
    spotifyLabel.textContent = "Listening";
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
