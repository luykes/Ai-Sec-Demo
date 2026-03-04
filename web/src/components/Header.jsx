import React from 'react';

export default function Header({ configOpen, onToggleConfig, onBack, activeCategory }) {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {onBack && (
          <button style={styles.backBtn} onClick={onBack}>
            &lt; CATEGORIES
          </button>
        )}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>AI-Sec</span>
          <span style={styles.logoSub}>Security Demo</span>
        </div>
        <div style={styles.tagline}>
          {activeCategory
            ? `${activeCategory.name} · ${activeCategory.attackCount} vectors`
            : 'LLM Tool Abuse · MCP Attack Surface · Runtime AI Controls'}
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.statusDots}>
          <span style={styles.dot('#00ff41')} title="MCP Raw Server :8787" />
          <span style={styles.dotLabel}>RAW</span>
          <span style={styles.dot('#00ff41')} title="MCP Protected Server :8788" />
          <span style={styles.dotLabel}>SAFE</span>
          <span style={styles.dot('#00b32c')} title="Backend :3001" />
          <span style={styles.dotLabel}>API</span>
        </div>
        <button style={styles.configBtn} onClick={onToggleConfig}>
          {configOpen ? '✕ Close' : '⚙ Config'}
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'linear-gradient(180deg, #001100 0%, #000000 100%)',
    borderBottom: '1px solid #003300',
    boxShadow: '0 0 30px rgba(0, 255, 65, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #003300',
    color: '#00b32c',
    borderRadius: 2,
    padding: '4px 10px',
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 28,
    color: '#00ff41',
    filter: 'drop-shadow(0 0 8px rgba(0, 255, 65, 0.8))',
    lineHeight: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: '#00ff41',
    letterSpacing: '-0.5px',
  },
  logoSub: {
    fontSize: 11,
    fontWeight: 500,
    color: '#00b32c',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginLeft: 4,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  tagline: {
    fontSize: 11,
    color: '#004400',
    borderLeft: '1px solid #003300',
    paddingLeft: 16,
    letterSpacing: '0.5px',
    fontFamily: 'JetBrains Mono, monospace',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statusDots: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 10,
    color: '#004400',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.5px',
  },
  dot: (color) => ({
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 6px ${color}`,
    animation: 'pulse 2s infinite',
  }),
  dotLabel: {
    marginRight: 6,
  },
  configBtn: {
    background: 'transparent',
    border: '1px solid #003300',
    color: '#00b32c',
    borderRadius: 2,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'JetBrains Mono, monospace',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
};
