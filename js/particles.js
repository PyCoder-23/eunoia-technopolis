/**
 * TECHNOPOLIS PROTOCOL — Particle System
 * Lightweight canvas-based floating particles for ambient effect.
 */

(function () {
  window.addEventListener('load', () => {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    const CONFIG = {
      count: 60,
      maxRadius: 1.8,
      speedMax: 0.35,
      colors: [
        'rgba(0, 212, 255, VAL)',
        'rgba(168, 85, 247, VAL)',
        'rgba(6, 182, 212, VAL)',
      ]
    };

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function randomColor(alpha) {
      const c = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      return c.replace('VAL', alpha.toFixed(2));
    }

    function createParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * CONFIG.maxRadius + 0.4,
        vx: (Math.random() - 0.5) * CONFIG.speedMax,
        vy: (Math.random() - 0.5) * CONFIG.speedMax,
        alpha: Math.random() * 0.5 + 0.1,
        color: randomColor(Math.random() * 0.5 + 0.1),
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: CONFIG.count }, createParticle);
      loop();
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, alpha.toFixed(2) + ')');
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5;
        if (p.y > H + 5) p.y = -5;
      }

      // Subtle connection lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${(0.06 * (1 - dist / 120)).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => { resize(); });
    init();
  });
})();
