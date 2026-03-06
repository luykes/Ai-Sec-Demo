import React, { useState, useEffect } from 'react';
import GalagaBackground from './GalagaBackground.jsx';
import { LANG_OPTIONS } from '../i18n.js';

const TITLE = 'AI-SEC';

export default function LandingPage({ onEnter, lang, setLang, t }) {
  const [typedTitle, setTypedTitle] = useState('');
  const [glitchActive, setGlitchActive] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedTitle(TITLE.slice(0, i + 1));
      i++;
      if (i >= TITLE.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Random glitch pulse
  useEffect(() => {
    const triggerGlitch = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
      setTimeout(triggerGlitch, 4000 + Math.random() * 4000);
    };
    const t = setTimeout(triggerGlitch, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={styles.root}>
      <div style={styles.bgContainer}>
        <GalagaBackground style={{ opacity: 0.75 }} />
      </div>

      <div style={styles.hero}>
        <div style={styles.glowPanel}>
          <div style={styles.topRow}>
            <div style={styles.terminalLine}>
              <span style={styles.prompt}>{t.terminalPrompt}</span>
              <span style={styles.blinkCursor}>_</span>
            </div>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              style={styles.langSelect}
            >
              {LANG_OPTIONS.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>

          <h1
            style={{
              ...styles.title,
              ...(glitchActive ? styles.titleGlitch : {}),
            }}
          >
            {typedTitle}
            {typedTitle.length < TITLE.length && (
              <span style={styles.blinkCursor}>|</span>
            )}
          </h1>

          <p style={styles.subtitle}>{t.subtitle}</p>

          <div style={styles.divider}>{'━'.repeat(44)}</div>

          <p style={styles.bodyText}>{t.bodyText}</p>

          <div style={styles.statRow}>
            <StatBadge label={t.attackVectorsLabel} value="6" />
            <StatBadge label={t.defenseLayerLabel} value={t.defenseLayerValue} highlight />
            <StatBadge label={t.realtimeSseLabel} value={t.realtimeSseValue} />
          </div>

          <button
            style={{
              ...styles.enterBtn,
              ...(btnHovered ? styles.enterBtnHovered : {}),
            }}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            onClick={onEnter}
          >
            <span style={styles.enterBtnPrefix}>&gt;&gt;&nbsp;</span>
            {t.enterBtn}
            <span style={styles.enterBtnSuffix}>&nbsp;[ENTER]</span>
          </button>

          <p style={styles.warningText}>[ {t.warning} ]</p>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, highlight }) {
  return (
    <div
      style={{
        ...statStyles.badge,
        ...(highlight ? statStyles.badgeHighlight : {}),
      }}
    >
      <span style={statStyles.value}>{value}</span>
      <span style={statStyles.label}>{label}</span>
    </div>
  );
}

const statStyles = {
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 18px',
    border: '1px solid #001a40',
    borderRadius: 2,
    background: 'rgba(0, 229, 255, 0.03)',
  },
  badgeHighlight: {
    border: '1px solid #00e5ff',
    background: 'rgba(0, 229, 255, 0.08)',
  },
  value: {
    fontSize: 20,
    fontWeight: 700,
    color: '#00e5ff',
    fontFamily: 'JetBrains Mono, monospace',
  },
  label: {
    fontSize: 10,
    color: '#003366',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'JetBrains Mono, monospace',
    marginTop: 2,
  },
};

const styles = {
  root: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    background: '#000011',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgContainer: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  hero: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  glowPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    padding: '48px 56px',
    background: 'rgba(0, 8, 24, 0.90)',
    border: '1px solid #00e5ff',
    borderRadius: 2,
    boxShadow:
      '0 0 60px rgba(0, 229, 255, 0.15), inset 0 0 40px rgba(0, 229, 255, 0.03)',
    maxWidth: 680,
    width: '90%',
    backdropFilter: 'blur(6px)',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  terminalLine: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#ffeb00',
    display: 'flex',
    gap: 6,
    letterSpacing: '2px',
  },
  langSelect: {
    background: '#000820',
    border: '1px solid #001a40',
    color: '#0099cc',
    borderRadius: 2,
    padding: '3px 6px',
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
    cursor: 'pointer',
    outline: 'none',
  },
  prompt: {
    color: '#ffeb00',
  },
  blinkCursor: {
    color: '#00e5ff',
    animation: 'pulse 1s infinite',
  },
  title: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 64,
    fontWeight: 700,
    color: '#00e5ff',
    letterSpacing: '8px',
    textShadow:
      '0 0 20px rgba(0, 229, 255, 0.9), 0 0 50px rgba(0, 229, 255, 0.4)',
    margin: 0,
    textAlign: 'center',
    minHeight: 80,
  },
  titleGlitch: {
    transform: 'translateX(2px)',
    textShadow:
      '2px 0 #ff1a44, -2px 0 #ffeb00, 0 0 20px rgba(0, 229, 255, 0.9)',
    transition: 'none',
  },
  subtitle: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#0099cc',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  divider: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#001a40',
    letterSpacing: 0,
    userSelect: 'none',
  },
  bodyText: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#006699',
    lineHeight: 1.8,
    textAlign: 'center',
    maxWidth: 520,
  },
  statRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  enterBtn: {
    background: 'transparent',
    border: '2px solid #00e5ff',
    borderRadius: 2,
    color: '#00e5ff',
    padding: '14px 40px',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '3px',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)',
    transition: 'all 0.15s',
    marginTop: 8,
  },
  enterBtnHovered: {
    background: 'rgba(0, 229, 255, 0.08)',
    boxShadow: '0 0 40px rgba(0, 229, 255, 0.5)',
  },
  enterBtnPrefix: {
    color: '#0099cc',
  },
  enterBtnSuffix: {
    color: '#003366',
    fontSize: 12,
  },
  warningText: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10,
    color: '#002244',
    letterSpacing: '1px',
    textAlign: 'center',
  },
};
