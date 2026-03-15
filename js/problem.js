/**
 * TECHNOPOLIS PROTOCOL — Problem Page Script
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Page entrance ────────────────────────────────────────────
  const overlay = document.getElementById('page-transition');
  if (overlay) {
    overlay.style.opacity = '1';
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 0.6s ease';
      overlay.style.opacity = '0';
    });
  }

  // Start music
  setTimeout(() => SoundManager.playMusic(), 600);

  // ── Tabs (Problem Statement / Examples / Constraints) ────────
  const tabs = document.querySelectorAll('.problem-tab');
  const contents = document.querySelectorAll('.problem-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      SoundManager.playSfx('click');
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // ── Submit button ────────────────────────────────────────────
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      SoundManager.playSfx('select');
    });
  }

  // ── Back button ──────────────────────────────────────────────
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      SoundManager.playSfx('click');
      if (overlay) {
        overlay.style.transition = 'opacity 0.4s ease';
        overlay.style.opacity = '1';
        setTimeout(() => { window.location.href = 'challenges.html'; }, 400);
      } else {
        window.location.href = 'challenges.html';
      }
    });
  }

  // ── Story text typewriter effect (first paragraph) ──────────
  const storyEl = document.querySelector('.story-text p');
  if (storyEl && storyEl.dataset.typewriter) {
    const fullText = storyEl.textContent;
    storyEl.textContent = '';
    storyEl.classList.add('typewriter');
    let i = 0;
    const interval = setInterval(() => {
      const char = fullText[i++];
      storyEl.textContent += char;
      if (char !== ' ') SoundManager.playSfx('typing');
      if (i >= fullText.length) {
        clearInterval(interval);
        storyEl.classList.remove('typewriter');
      }
    }, 20);
  }

  // ── GSAP entrance animations ─────────────────────────────────
  if (typeof gsap !== 'undefined') {
    gsap.from('.problem-hero', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.2 });
    gsap.from('.story-section',  { opacity: 0, x: -20, duration: 0.6, ease: 'power3.out', delay: 0.5 });
    gsap.from('.mission-section',{ opacity: 0, x:  20, duration: 0.6, ease: 'power3.out', delay: 0.7 });
    gsap.from('.problem-statement', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', delay: 0.9 });
    gsap.from('.submit-section', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', delay: 1.1 });
  }

});
