import React, { useState } from 'react';
import { ATTACK_CATEGORIES } from '../data/attackCategories.js';
import GalagaBackground from './GalagaBackground.jsx';

export default function CategoryPage({ onSelectCategory, onBack }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={styles.root}>
      <GalagaBackground style={{ position: 'fixed', inset: 0, opacity: 0.55, zIndex: 0 }} />
      <div style={styles.bgGrid} />

      <div style={styles.content}>
        <div style={styles.topBar}>
          <button style={styles.backBtn} onClick={onBack}>
            &lt; BACK
          </button>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbDim}>PLAYER1@AI-SEC</span>
            <span style={styles.breadcrumbSep}> / </span>
            <span style={styles.breadcrumbActive}>attack-categories</span>
            <span style={styles.blinkCursor}>_</span>
          </div>
        </div>

        <div style={styles.header}>
          <h2 style={styles.pageTitle}>SELECT ATTACK CATEGORY</h2>
          <p style={styles.pageSubtitle}>
            Choose an attack vector to explore. Each category runs in both Vulnerable
            and Protected modes simultaneously to demonstrate real-time AI defense.
          </p>
        </div>

        <div style={styles.categoryGrid}>
          {ATTACK_CATEGORIES.map((cat) => {
            const isAvailable = cat.status === 'available';
            const isHovered = hoveredId === cat.id;

            return (
              <div
                key={cat.id}
                style={{
                  ...styles.card,
                  ...(isAvailable ? styles.cardAvailable : styles.cardLocked),
                  ...(isHovered && isAvailable ? styles.cardHovered : {}),
                }}
                onMouseEnter={() => setHoveredId(cat.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => isAvailable && onSelectCategory(cat)}
              >
                {isAvailable ? (
                  <>
                    <div style={styles.cardTopRow}>
                      <span style={styles.cardIcon}>{cat.icon}</span>
                      <span style={{ ...styles.statusBadge, ...styles.statusAvailable }}>
                        READY
                      </span>
                    </div>
                    <h3 style={{ ...styles.cardTitle, color: '#00e5ff' }}>{cat.name}</h3>
                    <p style={styles.cardSubtitle}>{cat.subtitle}</p>
                    <p style={{ ...styles.cardDesc, color: '#004d77' }}>{cat.description}</p>
                    <div style={styles.cardFooter}>
                      <span style={styles.attackCount}>
                        {cat.attackCount} {cat.scenarioLabel || 'attack vectors'}
                      </span>
                      <span style={styles.launchHint}>
                        {isHovered ? '[ PRESS TO LAUNCH ]' : '[ SELECT ]'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={styles.comingSoonBody}>
                    <span style={styles.comingSoonText}>COMING SOON</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.footer}>
          <span style={styles.footerText}>
            SYSTEM: AI-Sec Security Lab v1.0 :: Powered by Ollama llama3.2 + Prompt Security
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    background: '#000011',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGrid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0, 229, 255, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 229, 255, 0.025) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1100,
    margin: '0 auto',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #001a40',
    color: '#0099cc',
    padding: '6px 14px',
    fontSize: 12,
    fontFamily: 'JetBrains Mono, monospace',
    borderRadius: 2,
    cursor: 'pointer',
    letterSpacing: '1px',
    transition: 'border-color 0.15s',
  },
  breadcrumb: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
  },
  breadcrumbDim: { color: '#001a40' },
  breadcrumbSep: { color: '#003366' },
  breadcrumbActive: { color: '#0099cc' },
  blinkCursor: {
    color: '#00e5ff',
    animation: 'pulse 1s infinite',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  pageTitle: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 28,
    fontWeight: 700,
    color: '#00e5ff',
    letterSpacing: '4px',
    textShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
    margin: 0,
  },
  pageSubtitle: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#003366',
    lineHeight: 1.7,
    maxWidth: 640,
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  card: {
    position: 'relative',
    borderRadius: 2,
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
    overflow: 'hidden',
    minHeight: 220,
  },
  cardAvailable: {
    background: '#000820',
    border: '1px solid #001a40',
    cursor: 'pointer',
  },
  cardLocked: {
    background: '#000820',
    border: '1px solid #001a40',
    cursor: 'not-allowed',
  },
  cardHovered: {
    border: '1px solid #00e5ff',
    boxShadow: '0 0 20px rgba(0, 229, 255, 0.15)',
    background: '#000d28',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 13,
    color: '#0099cc',
    letterSpacing: '-1px',
  },
  statusBadge: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '1px',
    padding: '2px 6px',
    borderRadius: 2,
    border: '1px solid',
  },
  statusAvailable: {
    color: '#00e5ff',
    borderColor: '#00e5ff',
    background: 'rgba(0, 229, 255, 0.08)',
  },
  comingSoonBody: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  comingSoonText: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 26,
    fontWeight: 800,
    color: '#002244',
    letterSpacing: '6px',
    textTransform: 'uppercase',
    transform: 'rotate(-35deg)',
    whiteSpace: 'nowrap',
    textShadow: '0 0 20px rgba(0, 229, 255, 0.1)',
    userSelect: 'none',
  },
  cardTitle: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '1px',
    margin: 0,
  },
  cardSubtitle: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10,
    color: '#003366',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  cardDesc: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11,
    lineHeight: 1.6,
    flex: 1,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTop: '1px solid #001038',
  },
  attackCount: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10,
    color: '#0099cc',
  },
  launchHint: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10,
    color: '#00e5ff',
    letterSpacing: '0.5px',
  },
  footer: {
    borderTop: '1px solid #000e28',
    paddingTop: 20,
  },
  footerText: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10,
    color: '#001a40',
    letterSpacing: '0.5px',
  },
};
