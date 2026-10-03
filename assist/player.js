/* ═══════════════════════════════════════════
   StreamBox – native HTML5 video player
   + AC3/EAC3/Dual Audio detection & desktop player shortcuts
═══════════════════════════════════════════ */

const urlInput   = document.getElementById('urlInput');
const xBtn       = document.getElementById('xBtn');
const playBtn    = document.getElementById('playBtn');
const errBox     = document.getElementById('errBox');
const errMsg     = document.getElementById('errMsg');


const playerWrap = document.getElementById('playerWrap');
const vid        = document.getElementById('vid');

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

/* ── Theme toggle (Light / Dark) ── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const themeLabel  = document.getElementById('themeLabel');

function setTheme(mode) {
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/>';
    themeLabel.textContent = 'Light Mode';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.innerHTML = '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
    themeLabel.textContent = 'Dark Mode';
    localStorage.setItem('theme', 'light');
  }
}

// Default to light as requested
if (localStorage.getItem('theme') === 'dark') {
  setTheme('dark');
} else {
  setTheme('light');
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});

/* ── Helpers ── */
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
let speedIdx = 2; // default 1×
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



function showErr(msg) { errMsg.innerHTML = msg; errBox.classList.add('on'); }
function hideErr()    { errBox.classList.remove('on'); }

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
  // Stop & reset the player
  vid.pause();
  vid.removeAttribute('src');
  vid.load();
  currentVideoUrl = '';
  playerWrap.classList.remove('on');
});
urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') load(); });
playBtn.addEventListener('click', load);

/* ── Load function ── */
function load() {
  hideErr();
  const raw = urlInput.value.trim();
  if (!raw) { urlInput.focus(); flash(urlInput); return; }

  try { new URL(raw); } catch (_) {
    showErr('Invalid URL — must start with <b>http://</b> or <b>https://</b>');
    return;
  }

  currentVideoUrl = raw;
  const decodedName = decodeURIComponent(raw);
  infoUrl.textContent  = decodedName;
  fmtBadge.textContent = detectFmt(raw);

  /* Set src directly on native <video> */
  vid.src = raw;
  vid.load();

  playerWrap.classList.add('on');
  playerWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  vid.play().catch(() => {});
}

function flash(el) {
  el.style.borderColor = 'var(--accent2)';
  setTimeout(() => el.style.borderColor = '', 700);
}

/* ── Video events ── */
vid.addEventListener('timeupdate', () => {
  const pct = vid.duration ? (vid.currentTime / vid.duration) * 100 : 0;
  seekProg.style.width  = pct + '%';
  seekThumb.style.left  = pct + '%';
  timeDisp.textContent  = `${fmt(vid.currentTime)} / ${fmt(vid.duration)}`;
});

vid.addEventListener('progress', () => {
  if (vid.duration && vid.buffered.length) {
    seekBuf.style.width = (vid.buffered.end(vid.buffered.length - 1) / vid.duration * 100) + '%';
  }
});

vid.addEventListener('play',  updatePP);
vid.addEventListener('pause', updatePP);

vid.addEventListener('error', () => {
  const code = vid.error && vid.error.code;
  const msgs = {
    1: 'Playback aborted.',
    2: `<b>Network error</b> — cannot reach the server. Check if <code>${urlInput.value.trim().split('/')[2]}</code> is online.`,
    3: `<b>Codec not supported</b> — your browser cannot decode this video or audio stream.`,
  };
  showErr(msgs[code] || 'Unknown playback error (code ' + code + ').');
});

vid.addEventListener('click', togglePP);

/* ── Controls ── */
function updatePP() {
  ppIcon.innerHTML = vid.paused
    ? '<path d="M8 5v14l11-7z"/>'
    : '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
}
function togglePP() { vid.paused ? vid.play() : vid.pause(); }
ppBtn.addEventListener('click', togglePP);
rewBtn.addEventListener('click', () => { vid.currentTime = Math.max(0, vid.currentTime - 10); });
fwdBtn.addEventListener('click', () => { vid.currentTime = Math.min(vid.duration || 0, vid.currentTime + 10); });

/* Seek */
let seeking = false;
function seekTo(e) {
  const rect = seekWrap.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (vid.duration) vid.currentTime = pct * vid.duration;
}
seekWrap.addEventListener('mousedown', e => { seeking = true; seekTo(e); });
window.addEventListener('mousemove',   e => { if (seeking) seekTo(e); });
window.addEventListener('mouseup',     ()=> { seeking = false; });
seekWrap.addEventListener('touchstart', e => { seeking = true; seekTo(e.touches[0]); }, {passive:true});
window.addEventListener('touchmove',    e => { if (seeking) seekTo(e.touches[0]); }, {passive:true});
window.addEventListener('touchend',     ()=> { seeking = false; });

/* Volume */
volSlider.addEventListener('input', () => {
  vid.volume = volSlider.value;
  vid.muted  = vid.volume === 0;
  updateVol();
});
muteBtn.addEventListener('click', () => {
  vid.muted  = !vid.muted;
  volSlider.value = vid.muted ? 0 : vid.volume;
  updateVol();
});
function updateVol() {
  const muted = vid.muted || vid.volume === 0;
  volIcon.innerHTML = muted
    ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
    : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
}

/* Speed */
speedBtn.addEventListener('click', () => {
  speedIdx = (speedIdx + 1) % SPEEDS.length;
  vid.playbackRate = SPEEDS[speedIdx];
  speedBtn.textContent = SPEEDS[speedIdx] + '×';
});

/* PiP */
pipBtn.addEventListener('click', async () => {
  if (!document.pictureInPictureEnabled) return;
  if (document.pictureInPictureElement) await document.exitPictureInPicture();
  else await vid.requestPictureInPicture().catch(() => {});
});

/* Fullscreen */
fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    (playerWrap.requestFullscreen || playerWrap.webkitRequestFullscreen).call(playerWrap);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  }
});
document.addEventListener('fullscreenchange', () => {
  fsIcon.innerHTML = document.fullscreenElement
    ? '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>'
    : '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>';
});

/* Keyboard shortcuts */
document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
  if (e.key === ' ')           { e.preventDefault(); togglePP(); }
  if (e.key === 'ArrowLeft')   vid.currentTime -= 10;
  if (e.key === 'ArrowRight')  vid.currentTime += 10;
  if (e.key === 'ArrowUp')     { vid.volume = Math.min(1, vid.volume + .1); volSlider.value = vid.volume; updateVol(); }
  if (e.key === 'ArrowDown')   { vid.volume = Math.max(0, vid.volume - .1); volSlider.value = vid.volume; updateVol(); }
  if (e.key === 'm' || e.key === 'M') muteBtn.click();
  if (e.key === 'f' || e.key === 'F') fsBtn.click();
});

/* ── Query Param / Pathname Support ── */
function getInitialUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramUrl = urlParams.get('url');
  if (paramUrl) return paramUrl;

  // Support #http://... in hash
  if (window.location.hash && window.location.hash.startsWith('#http')) {
    return window.location.hash.substring(1);
  }

  // Support /url/http://... in pathname
  const pathMatch = window.location.pathname.match(/\/url\/(https?:\/\/.+)/i);
  if (pathMatch) return pathMatch[1];

  return null;
}

const initialUrl = getInitialUrl();
if (initialUrl) {
  urlInput.value = initialUrl;
  xBtn.classList.add('on');
  load();
}




