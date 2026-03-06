import React from 'react';
import { LANG_OPTIONS } from '../i18n.js';

export default function Header({ configOpen, onToggleConfig, onBack, activeCategory, lang, setLang, t }) {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {onBack && (
          <button style={styles.backBtn} onClick={onBack}>
            {t.backToCategories}
          </button>
        )}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>AI-Sec</span>
          <span style={styles.logoSub}>{t.logoSub}</span>
        </div>
        <div style={styles.tagline}>
          {activeCategory
            ? `${activeCategory.name} · ${activeCategory.attackCount} ${t.vectors}`
            : t.tagline}
        </div>
      </div>
      <div style={styles.right}>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          style={styles.langSelect}
        >
          {LANG_OPTIONS.map(l => (
            <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
          ))}
        </select>
        <div style={styles.statusDots}>
          <span style={styles.dot('#00e5ff')} title="MCP Raw Server :8787" />
          <span style={styles.dotLabel}>RAW</span>
          <span style={styles.dot('#00e5ff')} title="MCP Protected Server :8788" />
          <span style={styles.dotLabel}>SAFE</span>
          <span style={styles.dot('#0099cc')} title="Backend :3001" />
          <span style={styles.dotLabel}>API</span>
        </div>
        {activeCategory?.type !== 'ai-ops-copilot' && (
          <button style={styles.configBtn} onClick={onToggleConfig}>
            {configOpen ? t.configClose : t.configOpen}
          </button>
        )}
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
    background: 'linear-gradient(180deg, #000820 0%, #000011 100%)',
    borderBottom: '1px solid #001a40',
    boxShadow: '0 0 30px rgba(0, 229, 255, 0.06)',
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
    border: '1px solid #001a40',
    color: '#0099cc',
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
    fontSize: 26,
    color: '#00e5ff',
    filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.8))',
    lineHeight: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: '#00e5ff',
    letterSpacing: '-0.5px',
  },
  logoSub: {
    fontSize: 11,
    fontWeight: 500,
    color: '#0099cc',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginLeft: 4,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  tagline: {
    fontSize: 11,
    color: '#002855',
    borderLeft: '1px solid #001a40',
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
    color: '#002855',
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
  langSelect: {
    background: '#000820',
    border: '1px solid #001a40',
    color: '#0099cc',
    borderRadius: 2,
    padding: '4px 8px',
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
    cursor: 'pointer',
    outline: 'none',
  },
  configBtn: {
    background: 'transparent',
    border: '1px solid #001a40',
    color: '#0099cc',
    borderRadius: 2,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'JetBrains Mono, monospace',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
};
