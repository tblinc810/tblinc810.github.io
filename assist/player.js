/* ═══════════════════════════════════════════
   StreamBox – Video.js powered player
   + Lucide icons · Motion animations
   + HLS / DASH / MP4 / MKV … via Video.js
═══════════════════════════════════════════ */

/* ── DOM refs (our custom UI – not Video.js built-in controls) ── */
const urlInput   = document.getElementById('urlInput');
const xBtn       = document.getElementById('xBtn');
const playBtn    = document.getElementById('playBtn');
const errBox     = document.getElementById('errBox');
const errMsg     = document.getElementById('errMsg');

const playerWrap = document.getElementById('playerWrap');

const seekWrap   = document.getElementById('seekWrap');
const seekBuf    = document.getElementById('seekBuf');
const seekProg   = document.getElementById('seekProg');
const seekThumb  = document.getElementById('seekThumb');

const ppBtn      = document.getElementById('ppBtn');
const ppIcon     = document.getElementById('ppIcon');
const rewBtn     = document.getElementById('rewBtn');
const fwdBtn     = document.getElementById('fwdBtn');
const timeDisp   = document.getElementById('timeDisp');

const muteBtn    = document.getElementById('muteBtn');
const volIcon    = document.getElementById('volIcon');
const volSlider  = document.getElementById('volSlider');
const speedBtn   = document.getElementById('speedBtn');
const pipBtn     = document.getElementById('pipBtn');
const fsBtn      = document.getElementById('fsBtn');
const fsIcon     = document.getElementById('fsIcon');

const infoUrl    = document.getElementById('infoUrl');
const fmtBadge   = document.getElementById('fmtBadge');

/* ── Theme toggle ── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const themeLabel  = document.getElementById('themeLabel');

function setTheme(mode) {
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.setAttribute('data-lucide', 'sun');
    themeLabel.textContent = 'Light Mode';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.setAttribute('data-lucide', 'moon');
    themeLabel.textContent = 'Dark Mode';
    localStorage.setItem('theme', 'light');
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

if (localStorage.getItem('theme') === 'dark') setTheme('dark');
else setTheme('light');

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});

/* ══════════════════════════════════════════════
   Video.js initialisation
   – controls: false  → we drive everything with our own UI
   – fluid: true      → fills the wrapper width
   – HLS / DASH handled by videojs-http-streaming
     (ships bundled in video.min.js ≥ v7)
══════════════════════════════════════════════ */
const vjsPlayer = videojs('vid', {
  controls:       false,   // hide the default Video.js control bar
  autoplay:       false,
  preload:        'auto',
  fluid:          true,    // responsive 16:9
  playsinline:    true,
  html5: {
    vhs: {
      overrideNative:        !videojs.browser.IS_SAFARI,
      enableLowInitialPlaylist: true,
    },
    nativeVideoTracks:   false,
    nativeAudioTracks:   false,
    nativeTextTracks:    false,
  },
});

/* Convenience: underlying <video> element (for PiP / touch events) */
const vid = vjsPlayer.el().querySelector('video');

/* ── Helpers ── */
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
let speedIdx = 2;
let currentVideoUrl = '';

function fmt(s) {
  s = Math.floor(s || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    : `${m}:${String(sec).padStart(2,'0')}`;
}

function detectFmt(url) {
  const u = url.split('?')[0].toLowerCase();
  if (u.endsWith('.m3u8')) return 'HLS';
  if (u.endsWith('.mpd'))  return 'DASH';
  if (u.endsWith('.mp4'))  return 'MP4';
  if (u.endsWith('.webm')) return 'WebM';
  if (u.endsWith('.mkv'))  return 'MKV';
  if (u.endsWith('.avi'))  return 'AVI';
  if (u.endsWith('.mov'))  return 'MOV';
  if (u.endsWith('.ts'))   return 'TS';
  if (u.endsWith('.flv'))  return 'FLV';
  if (u.endsWith('.wmv'))  return 'WMV';
  if (u.endsWith('.3gp'))  return '3GP';
  if (u.endsWith('.ogg') || u.endsWith('.ogv')) return 'OGG';
  if (u.endsWith('.mp3'))  return 'MP3';
  if (u.endsWith('.aac'))  return 'AAC';
  if (u.endsWith('.flac')) return 'FLAC';
  if (u.endsWith('.wav'))  return 'WAV';
  return 'VIDEO';
}

/* Resolve Video.js MIME type from URL */
function mimeFor(url) {
  const u = url.split('?')[0].toLowerCase();
  if (u.endsWith('.m3u8')) return 'application/x-mpegURL';
  if (u.endsWith('.mpd'))  return 'application/dash+xml';
  if (u.endsWith('.mp4'))  return 'video/mp4';
  if (u.endsWith('.webm')) return 'video/webm';
  if (u.endsWith('.ogg') || u.endsWith('.ogv')) return 'video/ogg';
  if (u.endsWith('.mp3'))  return 'audio/mpeg';
  if (u.endsWith('.aac'))  return 'audio/aac';
  return 'video/mp4'; // safe default
}

function showErr(msg) { errMsg.innerHTML = msg; errBox.classList.add('on'); }
function hideErr()    { errBox.classList.remove('on'); }
function flash(el) {
  el.style.borderColor = 'var(--accent2)';
  setTimeout(() => el.style.borderColor = '', 700);
}

/* ── URL input events ── */
urlInput.addEventListener('input', () => {
  xBtn.classList.toggle('on', urlInput.value.length > 0);
  hideErr();
});

xBtn.addEventListener('click', () => {
  urlInput.value = '';
  xBtn.classList.remove('on');
  urlInput.focus();
  hideErr();

  vjsPlayer.pause();
  vjsPlayer.reset();           // clears src + poster
  currentVideoUrl = '';
  playerWrap.classList.remove('on');
});

urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') load(); });
playBtn.addEventListener('click', load);

/* ── Load ── */
function load() {
  hideErr();
  const raw = urlInput.value.trim();
  if (!raw) { urlInput.focus(); flash(urlInput); return; }

  try { new URL(raw); } catch (_) {
    showErr('Invalid URL — must start with <b>http://</b> or <b>https://</b>');
    return;
  }

  currentVideoUrl = raw;
  infoUrl.textContent  = decodeURIComponent(raw);
  fmtBadge.textContent = detectFmt(raw);

  /* ── Tell Video.js about the new source ── */
  vjsPlayer.src({ src: raw, type: mimeFor(raw) });

  playerWrap.classList.add('on');
  playerWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  vjsPlayer.play().catch(() => {});
}

/* ── Video.js event → our custom UI ── */
vjsPlayer.on('timeupdate', () => {
  const cur = vjsPlayer.currentTime();
  const dur = vjsPlayer.duration();
  const pct = dur ? (cur / dur) * 100 : 0;
  seekProg.style.width = pct + '%';
  seekThumb.style.left = pct + '%';
  timeDisp.textContent = `${fmt(cur)} / ${fmt(dur)}`;
});

vjsPlayer.on('progress', () => {
  const dur      = vjsPlayer.duration();
  const buffered = vjsPlayer.bufferedEnd();
  if (dur && buffered) seekBuf.style.width = (buffered / dur * 100) + '%';
});

vjsPlayer.on('play',  updatePP);
vjsPlayer.on('pause', updatePP);

vjsPlayer.on('error', () => {
  const err  = vjsPlayer.error();
  const code = err && err.code;
  const msgs = {
    1: 'Playback aborted.',
    2: `<b>Network error</b> — cannot reach the server. Check if <code>${urlInput.value.trim().split('/')[2]}</code> is online.`,
    3: `<b>Codec not supported</b> — your browser cannot decode this video or audio stream.`,
    4: `<b>Source not supported</b> — Video.js could not load this format. Try a direct MP4 or HLS link.`,
  };
  showErr(msgs[code] || `Unknown playback error (code ${code}).`);
});

/* click on video → toggle play/pause */
vjsPlayer.on('click', togglePP);

/* ── Controls ── */
function updatePP() {
  ppIcon.setAttribute('data-lucide', vjsPlayer.paused() ? 'play' : 'pause');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
function togglePP() { vjsPlayer.paused() ? vjsPlayer.play() : vjsPlayer.pause(); }

ppBtn.addEventListener('click', togglePP);
rewBtn.addEventListener('click', () => vjsPlayer.currentTime(Math.max(0, vjsPlayer.currentTime() - 10)));
fwdBtn.addEventListener('click', () => vjsPlayer.currentTime(Math.min(vjsPlayer.duration() || 0, vjsPlayer.currentTime() + 10)));

/* ── Seek ── */
let seeking = false;
function seekTo(e) {
  const rect = seekWrap.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const dur  = vjsPlayer.duration();
  if (dur) vjsPlayer.currentTime(pct * dur);
}
seekWrap.addEventListener('mousedown', e => { seeking = true; seekTo(e); });
window.addEventListener('mousemove',   e => { if (seeking) seekTo(e); });
window.addEventListener('mouseup',     () => { seeking = false; });
seekWrap.addEventListener('touchstart', e => { seeking = true; seekTo(e.touches[0]); }, { passive: true });
window.addEventListener('touchmove',    e => { if (seeking) seekTo(e.touches[0]); },   { passive: true });
window.addEventListener('touchend',     () => { seeking = false; });

/* ── Volume ── */
volSlider.addEventListener('input', () => {
  vjsPlayer.volume(+volSlider.value);
  vjsPlayer.muted(+volSlider.value === 0);
  updateVol();
});
muteBtn.addEventListener('click', () => {
  const muted = !vjsPlayer.muted();
  vjsPlayer.muted(muted);
  volSlider.value = muted ? 0 : vjsPlayer.volume();
  updateVol();
});
function updateVol() {
  const muted = vjsPlayer.muted() || vjsPlayer.volume() === 0;
  volIcon.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ── Speed ── */
speedBtn.addEventListener('click', () => {
  speedIdx = (speedIdx + 1) % SPEEDS.length;
  vjsPlayer.playbackRate(SPEEDS[speedIdx]);
  speedBtn.textContent = SPEEDS[speedIdx] + '×';
});

/* ── PiP (native browser API on underlying <video>) ── */
pipBtn.addEventListener('click', async () => {
  if (!document.pictureInPictureEnabled) return;
  if (document.pictureInPictureElement) await document.exitPictureInPicture();
  else await vid.requestPictureInPicture().catch(() => {});
});

/* ── Fullscreen (wrap the playerWrap, not the VJS element) ── */
fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    (playerWrap.requestFullscreen || playerWrap.webkitRequestFullscreen).call(playerWrap);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  }
});
document.addEventListener('fullscreenchange', () => {
  fsIcon.setAttribute('data-lucide', document.fullscreenElement ? 'minimize' : 'maximize');
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ── Keyboard shortcuts ── */
document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
  if (e.key === ' ')           { e.preventDefault(); togglePP(); }
  if (e.key === 'ArrowLeft')   vjsPlayer.currentTime(vjsPlayer.currentTime() - 10);
  if (e.key === 'ArrowRight')  vjsPlayer.currentTime(vjsPlayer.currentTime() + 10);
  if (e.key === 'ArrowUp')     { vjsPlayer.volume(Math.min(1, vjsPlayer.volume() + .1)); volSlider.value = vjsPlayer.volume(); updateVol(); }
  if (e.key === 'ArrowDown')   { vjsPlayer.volume(Math.max(0, vjsPlayer.volume() - .1)); volSlider.value = vjsPlayer.volume(); updateVol(); }
  if (e.key === 'm' || e.key === 'M') muteBtn.click();
  if (e.key === 'f' || e.key === 'F') fsBtn.click();
});

/* ── Query param / pathname auto-load ── */
function getInitialUrl() {
  const p = new URLSearchParams(window.location.search).get('url');
  if (p) return p;
  if (window.location.hash && window.location.hash.startsWith('#http'))
    return window.location.hash.substring(1);
  const m = window.location.pathname.match(/\/url\/(https?:\/\/.+)/i);
  if (m) return m[1];
  return null;
}
const initialUrl = getInitialUrl();
if (initialUrl) {
  urlInput.value = initialUrl;
  xBtn.classList.add('on');
  load();
}

/* ══════════════════════════════════════════════
   Mobile Touch Gestures
   ─ Double-tap left/right  : seek ±10 s
   ─ Swipe up/down on video : volume ±
   ─ Pinch out              : fullscreen
══════════════════════════════════════════════ */
playerWrap.style.position = 'relative';

const flashLeft    = document.getElementById('flashLeft');
const flashRight   = document.getElementById('flashRight');
const volIndicator = document.getElementById('volIndicator');
const volPct       = document.getElementById('volPct');

function showFlash(el) {
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 600);
}
let volIndicatorTimer;
function showVolIndicator() {
  volPct.textContent = Math.round(vjsPlayer.volume() * 100) + '%';
  volIndicator.classList.add('show');
  clearTimeout(volIndicatorTimer);
  volIndicatorTimer = setTimeout(() => volIndicator.classList.remove('show'), 1200);
}

/* Double-tap to seek */
let lastTap = 0, lastTapX = 0;
vid.addEventListener('touchend', e => {
  if (e.changedTouches.length !== 1) return;
  const now = Date.now(), tapX = e.changedTouches[0].clientX;
  if (now - lastTap < 300 && Math.abs(tapX - lastTapX) < 60) {
    e.preventDefault();
    const isLeft = tapX < vid.getBoundingClientRect().left + vid.getBoundingClientRect().width / 2;
    if (isLeft) { vjsPlayer.currentTime(Math.max(0, vjsPlayer.currentTime() - 10)); showFlash(flashLeft); }
    else        { vjsPlayer.currentTime(Math.min(vjsPlayer.duration() || 0, vjsPlayer.currentTime() + 10)); showFlash(flashRight); }
    lastTap = 0;
  } else { lastTap = now; lastTapX = tapX; }
}, { passive: false });

/* Swipe up/down → volume */
let swipeStartY = null, swipeStartVol = 1, isSwiping = false;
vid.addEventListener('touchstart', e => {
  if (e.touches.length !== 1) return;
  swipeStartY = e.touches[0].clientY; swipeStartVol = vjsPlayer.volume(); isSwiping = false;
}, { passive: true });
vid.addEventListener('touchmove', e => {
  if (swipeStartY === null || e.touches.length !== 1) return;
  const dy = swipeStartY - e.touches[0].clientY;
  if (!isSwiping && Math.abs(dy) > 12) isSwiping = true;
  if (!isSwiping) return;
  const newVol = Math.max(0, Math.min(1, swipeStartVol + dy / 120));
  vjsPlayer.volume(newVol); vjsPlayer.muted(newVol === 0);
  volSlider.value = newVol; updateVol(); showVolIndicator();
}, { passive: true });
vid.addEventListener('touchend',    () => { swipeStartY = null; isSwiping = false; }, { passive: true });
vid.addEventListener('touchcancel', () => { swipeStartY = null; isSwiping = false; }, { passive: true });

/* Pinch out → fullscreen */
let pinchStartDist = null;
vid.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    pinchStartDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
}, { passive: true });
vid.addEventListener('touchmove', e => {
  if (e.touches.length !== 2 || pinchStartDist === null) return;
  const dist = Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY
  );
  if (dist - pinchStartDist > 60 && !document.fullscreenElement) { fsBtn.click(); pinchStartDist = null; }
}, { passive: true });
vid.addEventListener('touchend', () => { pinchStartDist = null; }, { passive: true });
