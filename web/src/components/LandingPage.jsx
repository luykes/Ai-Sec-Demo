import React, { useState, useEffect } from 'react';
import MatrixRain from './MatrixRain.jsx';

const TITLE = 'AI-SEC';

export default function LandingPage({ onEnter }) {
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
      <div style={styles.rainContainer}>
        <MatrixRain style={{ opacity: 0.35 }} />
      </div>

      <div style={styles.hero}>
        <div style={styles.glowPanel}>
          <div style={styles.terminalLine}>
            <span style={styles.prompt}>root@mcp-lab:~$</span>
            <span style={styles.blinkCursor}>_</span>
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

          <p style={styles.subtitle}>
            MCP Attack Surface &nbsp;·&nbsp; LLM Tool Abuse &nbsp;·&nbsp; Runtime AI Controls
          </p>

          <div style={styles.divider}>{'━'.repeat(44)}</div>

          <p style={styles.bodyText}>
            A live demonstration of how Model Context Protocol servers can be weaponized
            to exfiltrate secrets, execute shell commands, and bypass AI guardrails —
            and how Prompt Security stops them in real time.
          </p>

          <div style={styles.statRow}>
            <StatBadge label="Attack Vectors" value="6" />
            <StatBadge label="Defense Layer" value="Active" highlight />
            <StatBadge label="Real-time SSE" value="Live" />
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
            INITIALIZE DEMO
            <span style={styles.enterBtnSuffix}>&nbsp;[ENTER]</span>
          </button>

          <p style={styles.warningText}>
            [ WARNING: ATTACKS ARE SIMULATED — FOR EDUCATIONAL USE ONLY ]
          </p>
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
    border: '1px solid #003300',
    borderRadius: 2,
    background: 'rgba(0, 255, 65, 0.03)',
  },
  badgeHighlight: {
    border: '1px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.08)',
  },
  value: {
    fontSize: 20,
    fontWeight: 700,
    color: '#00ff41',
    fontFamily: 'JetBrains Mono, monospace',
  },
  label: {
    fontSize: 10,
    color: '#005500',
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
    background: '#000000',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainContainer: {
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
    background: 'rgba(0, 17, 0, 0.88)',
    border: '1px solid #00ff41',
    borderRadius: 2,
    boxShadow:
      '0 0 60px rgba(0, 255, 65, 0.15), inset 0 0 40px rgba(0, 255, 65, 0.03)',
    maxWidth: 680,
    width: '90%',
    backdropFilter: 'blur(4px)',
  },
  terminalLine: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#00b32c',
    alignSelf: 'flex-start',
    display: 'flex',
    gap: 6,
  },
  prompt: {
    color: '#00b32c',
  },
  blinkCursor: {
    color: '#00ff41',
    animation: 'pulse 1s infinite',
  },
  title: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 64,
    fontWeight: 700,
    color: '#00ff41',
    letterSpacing: '8px',
    textShadow:
      '0 0 20px rgba(0, 255, 65, 0.8), 0 0 40px rgba(0, 255, 65, 0.4)',
    margin: 0,
    textAlign: 'center',
    minHeight: 80,
  },
  titleGlitch: {
    transform: 'translateX(2px)',
    textShadow:
      '2px 0 #ff0000, -2px 0 #00ffff, 0 0 20px rgba(0, 255, 65, 0.8)',
    transition: 'none',
  },
  subtitle: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#00b32c',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  divider: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#003300',
    letterSpacing: 0,
    userSelect: 'none',
  },
  bodyText: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#008800',
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
    border: '2px solid #00ff41',
    borderRadius: 2,
    color: '#00ff41',
    padding: '14px 40px',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '3px',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.25)',
    transition: 'all 0.15s',
    marginTop: 8,
  },
  enterBtnHovered: {
    background: 'rgba(0, 255, 65, 0.08)',
    boxShadow: '0 0 40px rgba(0, 255, 65, 0.5)',
  },
  enterBtnPrefix: {
    color: '#00b32c',
  },
  enterBtnSuffix: {
    color: '#005500',
    fontSize: 12,
  },
  warningText: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10,
    color: '#003300',
    letterSpacing: '1px',
    textAlign: 'center',
  },
};
