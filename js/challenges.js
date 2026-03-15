/**
 * TECHNOPOLIS PROTOCOL — Challenges Page Script
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Page entrance animation ─────────────────────────────────
  const overlay = document.getElementById('page-transition');
  if (overlay) {
    overlay.style.opacity = '1';
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 0.6s ease';
      overlay.style.opacity = '0';
    });
  }

  // Start ambient music
  setTimeout(() => SoundManager.playMusic(), 600);

  // ── Mission timer (purely cosmetic countdown) ───────────────
  const timerEl = document.getElementById('stat-timer');
  if (timerEl) {
    let totalSeconds = 2 * 60 * 60; // 2 hours
    const stored = sessionStorage.getItem('missionStart');
    if (stored) {
      const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000);
      totalSeconds = Math.max(0, totalSeconds - elapsed);
    } else {
      sessionStorage.setItem('missionStart', Date.now().toString());
    }

    function formatTime(s) {
      const h = Math.floor(s / 3600).toString().padStart(2, '0');
      const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
      const sec = (s % 60).toString().padStart(2, '0');
      return `${h}:${m}:${sec}`;
    }

    timerEl.textContent = formatTime(totalSeconds);

    const ticker = setInterval(() => {
      totalSeconds--;
      if (totalSeconds < 0) { totalSeconds = 0; clearInterval(ticker); }
      timerEl.textContent = formatTime(totalSeconds);
      if (totalSeconds < 300) timerEl.style.color = 'var(--neon-pink)';
    }, 1000);
  }

  // ── Card click sounds ───────────────────────────────────────
  document.querySelectorAll('.challenge-card').forEach(card => {
    card.addEventListener('click', (e) => {
      SoundManager.playSfx('select');
      const href = card.getAttribute('href');
      if (href) {
        e.preventDefault();
        const overlay = document.getElementById('page-transition');
        if (overlay) {
          overlay.style.transition = 'opacity 0.4s ease';
          overlay.style.opacity = '1';
          setTimeout(() => { window.location.href = href; }, 400);
        } else {
          window.location.href = href;
        }
      }
    });

    card.addEventListener('mouseenter', () => SoundManager.playSfx('click'));
  });

  // ── Map deco sounds ─────────────────────────────────────────
  document.querySelectorAll('.map-deco').forEach(deco => {
    deco.addEventListener('mouseenter', () => SoundManager.playSfx('click'));
  });

  // ── Leaderboard button ──────────────────────────────────────
  const lbBtn = document.getElementById('leaderboard-btn');
  if (lbBtn) {
    lbBtn.addEventListener('click', () => SoundManager.playSfx('select'));
  }

  // ── Intersection Observer for card reveal ──────────────────
  const cards = document.querySelectorAll('.challenge-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.animationPlayState = 'paused';
    observer.observe(c);
  });

});
