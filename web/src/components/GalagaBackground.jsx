import React, { useEffect, useRef } from 'react';

// Classic Galaga color palette
const COLORS = {
  bee:       '#00e5ff', // cyan bee enemies (row 2)
  butterfly: '#cc44ff', // purple butterfly enemies (row 1)
  boss:      '#ff4422', // red boss Galaga (row 0)
  bossWing:  '#ffcc00', // yellow boss wings
  player:    '#00e5ff', // cyan player ship
  engine:    '#ffeb00', // yellow engine glow
  laser:     '#ffffff', // white laser
  starDim:   '#aad4ff', // blue-white dim stars
  starBright:'#ffffff', // bright stars
};

// Draw a Galaga bee (row 2) — compact insectoid
function drawBee(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  // body
  ctx.fillRect(x - s, y - s, s * 2, s * 3);
  // head nub
  ctx.fillRect(x - s / 2, y - s * 2, s, s);
  // left wing
  ctx.fillRect(x - s * 3, y - s / 2, s * 2, s * 2);
  // right wing
  ctx.fillRect(x + s, y - s / 2, s * 2, s * 2);
  // antennae
  ctx.fillRect(x - s * 2, y - s * 2, s, s);
  ctx.fillRect(x + s, y - s * 2, s, s);
}

// Draw a Galaga butterfly (row 1) — wider with 4 wings
function drawButterfly(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  // center body
  ctx.fillRect(x - s, y - s * 2, s * 2, s * 4);
  // upper wings
  ctx.fillRect(x - s * 3, y - s * 2, s * 2, s * 2);
  ctx.fillRect(x + s, y - s * 2, s * 2, s * 2);
  // lower wings
  ctx.fillRect(x - s * 4, y, s * 3, s * 2);
  ctx.fillRect(x + s, y, s * 3, s * 2);
  // head
  ctx.fillRect(x - s / 2, y - s * 3, s, s);
}

// Draw a Boss Galaga (row 0) — larger 2-color composite
function drawBoss(ctx, x, y, s, color1, color2) {
  // Main body color1
  ctx.fillStyle = color1;
  ctx.fillRect(x - s * 2, y - s * 2, s * 4, s * 4);
  // Head
  ctx.fillRect(x - s, y - s * 3, s * 2, s);
  // Wings color2
  ctx.fillStyle = color2;
  ctx.fillRect(x - s * 4, y - s, s * 2, s * 3);
  ctx.fillRect(x + s * 2, y - s, s * 2, s * 3);
  // Inner wing accents
  ctx.fillStyle = color1;
  ctx.fillRect(x - s * 3, y, s, s);
  ctx.fillRect(x + s * 2, y, s, s);
  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - s, y - s, s, s);
  ctx.fillRect(x, y - s, s, s);
}

// Draw player ship (upward-pointing arrow shape)
function drawPlayer(ctx, x, y, s) {
  ctx.fillStyle = COLORS.player;
  // fuselage
  ctx.fillRect(x - s / 2, y - s * 3, s, s * 5);
  // left wing
  ctx.fillRect(x - s * 3, y, s * 2, s * 2);
  // right wing
  ctx.fillRect(x + s, y, s * 2, s * 2);
  // gun tip
  ctx.fillRect(x - s / 2, y - s * 4, s, s);
  // engine
  ctx.fillStyle = COLORS.engine;
  ctx.fillRect(x - s, y + s * 2, s * 2, s);
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
    const S = 3; // pixel scale (sprite pixel size)

    let stars = [];
    let enemies = [];
    let divers = [];
    let bullets = [];
    let t = 0;
    let formationDir = 1;
    let formationOffset = 0;
    let nextDiveAt = 220;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
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
      const startY = 50;
      for (let row = 0; row < ENEMY_ROWS; row++) {
        for (let col = 0; col < ENEMY_COLS; col++) {
          enemies.push({
            id: row * ENEMY_COLS + col,
            baseX: startX + col * spacingX,
            y: startY + row * 44,
            row,
            diving: false,
          });
        }
      }
    };

    const draw = () => {
      t++;

      // Deep space background
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

      // ─ Enemies (formation)
      ctx.globalAlpha = 0.75;
      enemies.forEach((e) => {
        if (e.diving) return;
        const ex = e.baseX + formationOffset;
        if (e.row === 0) {
          drawBoss(ctx, ex, e.y, S, COLORS.boss, COLORS.bossWing);
        } else if (e.row === 1) {
          drawButterfly(ctx, ex, e.y, S, COLORS.butterfly);
        } else {
          drawBee(ctx, ex, e.y, S, COLORS.bee);
        }
      });

      // ─ Dive trigger
      if (t >= nextDiveAt) {
        const available = enemies.filter((e) => !e.diving);
        if (available.length > 0) {
          const target = available[Math.floor(Math.random() * available.length)];
          target.diving = true;
          divers.push({
            x: target.baseX + formationOffset,
            y: target.y,
            row: target.row,
            vy: 2.2 + Math.random() * 1.2,
            vx: (Math.random() - 0.5) * 2.5,
            spin: 0,
            enemyRef: target,
          });
        }
        nextDiveAt = t + 180 + Math.floor(Math.random() * 200);
      }

      // ─ Divers
      divers = divers.filter((d) => {
        d.y += d.vy;
        d.x += d.vx;
        d.spin += 0.05;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.spin * 0.3);
        if (d.row === 0) {
          drawBoss(ctx, 0, 0, S, COLORS.boss, COLORS.bossWing);
        } else if (d.row === 1) {
          drawButterfly(ctx, 0, 0, S, COLORS.butterfly);
        } else {
          drawBee(ctx, 0, 0, S, COLORS.bee);
        }
        ctx.restore();

        if (d.y > canvas.height + 40) {
          d.enemyRef.diving = false;
          return false;
        }
        return true;
      });

      ctx.globalAlpha = 1;

      // ─ Player bullets (fire every ~100 frames)
      if (t % 100 === 0) {
        bullets.push({ x: canvas.width / 2, y: canvas.height - 50, vy: -7 });
      }
      bullets = bullets.filter((b) => b.y > -10);
      bullets.forEach((b) => {
        b.y += b.vy;
        // Laser glow
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = COLORS.laser;
        ctx.fillRect(b.x - 1, b.y, 2, 10);
        // Tip glow
        ctx.fillStyle = '#aae8ff';
        ctx.fillRect(b.x - 2, b.y, 4, 3);
        ctx.globalAlpha = 1;
      });

      // ─ Player ship
      ctx.globalAlpha = 0.65;
      drawPlayer(ctx, canvas.width / 2, canvas.height - 38, S);
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
