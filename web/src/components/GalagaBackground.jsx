import React, { useEffect, useRef } from 'react';

// Classic Galaga color palette
const COLORS = {
  bee:        '#00e5ff',
  butterfly:  '#cc44ff',
  boss:       '#ff4422',
  bossWing:   '#ffcc00',
  player:     '#00e5ff',
  engine:     '#ffeb00',
  laser:      '#ffffff',
  starDim:    '#aad4ff',
  starBright: '#ffffff',
};

// Draw a Galaga bee (row 2)
function drawBee(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - s, y - s, s * 2, s * 3);
  ctx.fillRect(x - s / 2, y - s * 2, s, s);
  ctx.fillRect(x - s * 3, y - s / 2, s * 2, s * 2);
  ctx.fillRect(x + s, y - s / 2, s * 2, s * 2);
  ctx.fillRect(x - s * 2, y - s * 2, s, s);
  ctx.fillRect(x + s, y - s * 2, s, s);
}

// Draw a Galaga butterfly (row 1)
function drawButterfly(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - s, y - s * 2, s * 2, s * 4);
  ctx.fillRect(x - s * 3, y - s * 2, s * 2, s * 2);
  ctx.fillRect(x + s, y - s * 2, s * 2, s * 2);
  ctx.fillRect(x - s * 4, y, s * 3, s * 2);
  ctx.fillRect(x + s, y, s * 3, s * 2);
  ctx.fillRect(x - s / 2, y - s * 3, s, s);
}

// Draw a Boss Galaga (row 0)
function drawBoss(ctx, x, y, s, color1, color2) {
  ctx.fillStyle = color1;
  ctx.fillRect(x - s * 2, y - s * 2, s * 4, s * 4);
  ctx.fillRect(x - s, y - s * 3, s * 2, s);
  ctx.fillStyle = color2;
  ctx.fillRect(x - s * 4, y - s, s * 2, s * 3);
  ctx.fillRect(x + s * 2, y - s, s * 2, s * 3);
  ctx.fillStyle = color1;
  ctx.fillRect(x - s * 3, y, s, s);
  ctx.fillRect(x + s * 2, y, s, s);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - s, y - s, s, s);
  ctx.fillRect(x, y - s, s, s);
}

// Draw player ship — classic Galaga fighter silhouette
function drawPlayer(ctx, x, y, s, engineFlicker) {
  ctx.fillStyle = COLORS.player;
  // fuselage
  ctx.fillRect(x - s, y - s * 4, s * 2, s * 6);
  // left wing sweep
  ctx.fillRect(x - s * 4, y - s, s * 3, s * 2);
  ctx.fillRect(x - s * 5, y + s, s * 2, s);
  // right wing sweep
  ctx.fillRect(x + s, y - s, s * 3, s * 2);
  ctx.fillRect(x + s * 3, y + s, s * 2, s);
  // nose tip
  ctx.fillRect(x - s / 2, y - s * 5, s, s);
  // cockpit highlight
  ctx.fillStyle = '#aaeeff';
  ctx.fillRect(x - s / 2, y - s * 3, s, s * 2);
  // engine glow (flickers)
  ctx.fillStyle = engineFlicker > 0.5 ? '#ffeb00' : '#ff8800';
  ctx.fillRect(x - s, y + s * 2, s * 2, s);
  ctx.globalAlpha *= 0.6;
  ctx.fillRect(x - s / 2, y + s * 3, s, s);
  ctx.globalAlpha /= 0.6;
}

export default function GalagaBackground({ style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    const ENEMY_COLS = 10;
    const ENEMY_ROWS = 3;
    const S = 3;
    const PLAYER_SPEED = 2.8;
    const PLAYER_MARGIN = 55;

    let stars = [];
    let enemies = [];
    let divers = [];
    let bullets = [];
    let t = 0;
    let formationDir = 1;
    let formationOffset = 0;
    let nextDiveAt = 200;

    // Player state
    let playerX = 0;
    let playerVx = PLAYER_SPEED;
    let playerTargeting = false; // tracking a diver?

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      playerX = canvas.width / 2;
      initStars();
      initEnemies();
    };

    const initStars = () => {
      stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() < 0.15 ? 2 : Math.random() < 0.4 ? 1.5 : 1,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.003,
      }));
    };

    const initEnemies = () => {
      enemies = [];
      const spacingX = Math.min(60, (canvas.width * 0.7) / ENEMY_COLS);
      const startX = canvas.width / 2 - (spacingX * (ENEMY_COLS - 1)) / 2;
      for (let row = 0; row < ENEMY_ROWS; row++) {
        for (let col = 0; col < ENEMY_COLS; col++) {
          enemies.push({
            id: row * ENEMY_COLS + col,
            baseX: startX + col * spacingX,
            y: 50 + row * 44,
            row,
            diving: false,
          });
        }
      }
    };

    const draw = () => {
      t++;

      // ─ Background
      ctx.fillStyle = '#000011';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ─ Stars
      stars.forEach((star) => {
        const b = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * star.speed + star.phase));
        ctx.globalAlpha = b;
        ctx.fillStyle = b > 0.85 ? COLORS.starBright : COLORS.starDim;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1;

      // ─ Formation oscillation
      formationOffset += 0.35 * formationDir;
      if (Math.abs(formationOffset) > 28) formationDir *= -1;

      // ─ Formation enemies
      ctx.globalAlpha = 0.75;
      enemies.forEach((e) => {
        if (e.diving) return;
        const ex = e.baseX + formationOffset;
        if (e.row === 0)      drawBoss(ctx, ex, e.y, S, COLORS.boss, COLORS.bossWing);
        else if (e.row === 1) drawButterfly(ctx, ex, e.y, S, COLORS.butterfly);
        else                  drawBee(ctx, ex, e.y, S, COLORS.bee);
      });

      // ─ Dive trigger
      if (t >= nextDiveAt) {
        const available = enemies.filter((e) => !e.diving);
        if (available.length > 0) {
          const target = available[Math.floor(Math.random() * available.length)];
          target.diving = true;

          // Divers arc toward player then sweep down
          const startX = target.baseX + formationOffset;
          divers.push({
            x: startX,
            y: target.y,
            row: target.row,
            // initial sideways arc toward player
            vx: (playerX - startX) * 0.012 + (Math.random() - 0.5) * 1.5,
            vy: 1.8 + Math.random() * 1.0,
            spin: 0,
            phase: 0,
            enemyRef: target,
          });
        }
        nextDiveAt = t + 160 + Math.floor(Math.random() * 180);
      }

      // ─ Divers movement & draw
      divers = divers.filter((d) => {
        d.phase += 0.04;
        // Slight sinusoidal weave as it dives
        d.x += d.vx + Math.sin(d.phase * 2) * 1.2;
        d.y += d.vy;
        d.vy = Math.min(d.vy + 0.04, 4.5); // accelerate
        d.spin += 0.04;

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.spin * 0.25);
        if (d.row === 0)      drawBoss(ctx, 0, 0, S, COLORS.boss, COLORS.bossWing);
        else if (d.row === 1) drawButterfly(ctx, 0, 0, S, COLORS.butterfly);
        else                  drawBee(ctx, 0, 0, S, COLORS.bee);
        ctx.restore();

        if (d.y > canvas.height + 40) {
          d.enemyRef.diving = false;
          return false;
        }
        return true;
      });
      ctx.globalAlpha = 1;

      // ─ Player movement (Galaga-style left/right)
      if (divers.length > 0) {
        // Track closest diver horizontally
        const closest = divers.reduce((a, b) =>
          Math.abs(a.x - playerX) < Math.abs(b.x - playerX) ? a : b
        );
        const dx = closest.x - playerX;
        if (Math.abs(dx) > 8) {
          playerVx = Math.sign(dx) * PLAYER_SPEED * 1.15;
        }
        playerTargeting = true;
      } else {
        playerTargeting = false;
        // Normal back-and-forth patrol
        if (playerX >= canvas.width - PLAYER_MARGIN) playerVx = -PLAYER_SPEED;
        if (playerX <= PLAYER_MARGIN) playerVx = PLAYER_SPEED;
      }
      playerX += playerVx;
      // Clamp to bounds
      playerX = Math.max(PLAYER_MARGIN, Math.min(canvas.width - PLAYER_MARGIN, playerX));

      // ─ Player bullets
      if (t % 75 === 0) {
        const playerY = canvas.height - 42;
        bullets.push({ x: playerX, y: playerY, vy: -8 });
      }
      bullets = bullets.filter((b) => b.y > -10);
      bullets.forEach((b) => {
        b.y += b.vy;
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = COLORS.laser;
        ctx.fillRect(b.x - 1, b.y, 2, 12);
        // Bright tip
        ctx.fillStyle = '#ccf4ff';
        ctx.fillRect(b.x - 2, b.y, 4, 3);
        ctx.globalAlpha = 1;
      });

      // ─ Player ship
      const playerY = canvas.height - 42;
      ctx.globalAlpha = 0.70;
      drawPlayer(ctx, playerX, playerY, S, (Math.sin(t * 0.25) + 1) / 2);
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
}
