/**
 * TECHNOPOLIS PROTOCOL — Sound Manager
 * Uses Howler.js for all audio. Falls back gracefully if audio is unavailable.
 */

const SoundManager = (() => {
  let bgMusic = null;
  let isMuted = localStorage.getItem('tp_muted') === 'true';
  let initialized = false;

  const sounds = {};

  // ── Initialize ──────────────────────────────────────────────
  function init(customMusicSrc) {
    if (initialized) return;
    initialized = true;

    // Use customized music if provided, otherwise check body data attribute, finally fallback to ambient.mp3
    const musicSrc = customMusicSrc || document.body.dataset.music || 'assets/music/ambient.mp3';

    try {
      bgMusic = new Howl({
        src: [musicSrc],
        loop: true,
        volume: 0.18, // Reduced from 0.35 (~50% lower)
        autoplay: false,
        html5: true,
        onloaderror: () => { bgMusic = null; }
      });
    } catch (e) { bgMusic = null; }

    // One-shot SFX
    const sfxDefs = {
      click:      'assets/sounds/click.mp3',
      transition: 'assets/sounds/transition.mp3',
      select:     'assets/sounds/select.mp3',
      reveal:     'assets/sounds/reveal.mp3',
      typing:     'assets/sounds/typing.mp3',
    };

    for (const [key, src] of Object.entries(sfxDefs)) {
      try {
        sounds[key] = new Howl({
          src: [src],
          volume: 0.6, // Increased SFX volume for better punch
          onloaderror: () => { sounds[key] = null; }
        });
      } catch (e) { sounds[key] = null; }
    }

    _bindToggleButton();
    
    // Auto-play if not muted and if this isn't the landing page (which requires manual start)
    if (!isMuted && !document.getElementById('start-screen')) {
      playMusic();
    }
  }

  // ── Play music ───────────────────────────────────────────────
  function playMusic() {
    if (bgMusic && !isMuted) {
      if (bgMusic.playing()) return;

      const result = bgMusic.play();
      
      const applySeek = () => {
        const savedPos = parseFloat(localStorage.getItem('tp_music_pos') || '0');
        if (savedPos > 0) {
          bgMusic.seek(savedPos);
        }
      };

      if (bgMusic.state() === 'loaded') {
        applySeek();
      } else {
        bgMusic.once('load', applySeek);
      }
      
      // Handle browser autoplay restriction if result is a promise
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          const startOnInteraction = () => {
            if (!isMuted && bgMusic && !bgMusic.playing()) {
               bgMusic.play();
               applySeek();
            }
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('keydown', startOnInteraction);
          };
          document.addEventListener('click', startOnInteraction);
          document.addEventListener('keydown', startOnInteraction);
        });
      }
    }
  }

  // ── Pause music ──────────────────────────────────────────────
  function pauseMusic() {
    if (bgMusic) {
      localStorage.setItem('tp_music_pos', bgMusic.seek());
      bgMusic.pause();
    }
  }

  // ── Save position before leaving page ────────────────────────
  window.addEventListener('beforeunload', () => {
    if (bgMusic && bgMusic.playing()) {
      localStorage.setItem('tp_music_pos', bgMusic.seek());
    }
  });

  // ── Play SFX ─────────────────────────────────────────────────
  function playSfx(name) {
    if (isMuted) return;
    if (sounds[name]) {
      sounds[name].play();
    } else {
      // Synthesize a simple beep via Web Audio API as fallback
      _syntheticBeep(name);
    }
  }

  let sharedCtx = null;

  // ── Synthetic beep fallback ──────────────────────────────────
  function _syntheticBeep(type) {
    try {
      if (!sharedCtx) {
        sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Ensure context is active (browsers often suspend until interaction)
      if (sharedCtx.state === 'suspended') {
        sharedCtx.resume();
      }

      const osc = sharedCtx.createOscillator();
      const gain = sharedCtx.createGain();
      osc.connect(gain);
      gain.connect(sharedCtx.destination);

      const freqMap = { 
        click: 880, 
        transition: 440, 
        select: 660, 
        reveal: 220,
        typing: 1200 
      };
      
      const duration = type === 'typing' ? 0.05 : 0.15;
      osc.frequency.setValueAtTime(freqMap[type] || 660, sharedCtx.currentTime);
      osc.type = 'sine';
      gain.gain.setValueAtTime(type === 'typing' ? 0.03 : 0.06, sharedCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, sharedCtx.currentTime + duration);
      osc.start(sharedCtx.currentTime);
      osc.stop(sharedCtx.currentTime + duration);
    } catch (e) { /* silently fail */ }
  }

  // ── Toggle mute ──────────────────────────────────────────────
  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('tp_muted', isMuted);
    
    if (bgMusic) {
      if (isMuted) { bgMusic.pause(); }
      else          { bgMusic.play(); }
    }
    _updateToggleUI();
    return isMuted;
  }

  function _updateToggleUI() {
    const btn = document.getElementById('music-toggle');
    if (!btn) return;
    btn.classList.toggle('muted', isMuted);
    btn.innerHTML = isMuted
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  }

  function _bindToggleButton() {
    const btn = document.getElementById('music-toggle');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent advancing slides/etc
      playSfx('click');
      toggleMute();
    });
    _updateToggleUI();
  }

  return { init, playMusic, pauseMusic, playSfx, toggleMute };
})();

// Auto-init after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we need to auto-initialize or if the page will handle it
  if (!document.body.dataset.manualInit) {
    SoundManager.init();
  }
});
