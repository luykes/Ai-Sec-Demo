import React from 'react';

const SEVERITY_COLORS = {
  critical: '#ff4444',
  high: '#ffaa44',
  medium: '#44aaff',
};

export default function AttackPanel({ scenarios, categoryName, onLaunch, isRunning, onStop }) {
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.headerLeft}>
          <span style={styles.panelTitle}>{categoryName}</span>
          <span style={styles.scenarioCount}>
            {scenarios.length} scenarios — all run in sequence
          </span>
        </div>
        <span style={styles.hint}>
          Powered by Ollama llama3.2 — scripted tool execution, LLM commentary
        </span>
      </div>

      <div style={styles.scenarioGrid}>
        {scenarios.map((scenario, i) => (
          <div key={scenario.id} style={styles.scenarioCard}>
            <div style={styles.cardTop}>
              <div style={styles.cardLeft}>
                <span style={styles.stepNum}>{i + 1}</span>
                <span style={styles.cardIcon}>{scenario.icon}</span>
              </div>
              <span
                style={{
                  ...styles.severityBadge,
                  color: SEVERITY_COLORS[scenario.severity],
                  borderColor: SEVERITY_COLORS[scenario.severity],
                  background: `${SEVERITY_COLORS[scenario.severity]}15`,
                }}
              >
                {scenario.severity}
              </span>
            </div>
            <div style={styles.cardName}>{scenario.name}</div>
            <div style={styles.cardDesc}>{scenario.desc}</div>
            <div style={styles.cardTools}>
              <code style={styles.toolCode}>{scenario.tools}</code>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button
          style={{
            ...styles.launchBtn,
            ...(isRunning ? styles.launchBtnRunning : {}),
          }}
          onClick={() => !isRunning && onLaunch()}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <span style={styles.spinner} />
              Running {scenarios.length} Attacks...
            </>
          ) : (
            <>
              <span style={styles.launchBtnGlyph}>&gt;_</span>
              Execute All {scenarios.length} Attacks
            </>
          )}
        </button>

        {isRunning && (
          <button style={styles.stopBtn} onClick={onStop}>
            ⬛ Stop
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: '#001100',
    border: '1px solid #003300',
    borderRadius: 4,
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #003300',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#00ff41',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  scenarioCount: {
    fontSize: 11,
    color: '#00b32c',
    background: 'rgba(0, 255, 65, 0.08)',
    border: '1px solid rgba(0, 255, 65, 0.2)',
    borderRadius: 4,
    padding: '2px 8px',
  },
  hint: {
    fontSize: 11,
    color: '#004400',
  },
  scenarioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 8,
    padding: 16,
  },
  scenarioCard: {
    background: '#001a00',
    border: '1px solid #002500',
    borderRadius: 4,
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: 700,
    color: '#00b32c',
    background: 'rgba(0, 255, 65, 0.1)',
    borderRadius: '50%',
    width: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontFamily: 'JetBrains Mono, monospace',
  },
  cardIcon: {
    fontSize: 13,
    fontFamily: 'JetBrains Mono, monospace',
    color: '#00b32c',
    letterSpacing: '-1px',
  },
  severityBadge: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 5px',
    borderRadius: 4,
    border: '1px solid',
  },
  cardName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#00ff41',
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: 10,
    color: '#004400',
    lineHeight: 1.4,
  },
  cardTools: {
    marginTop: 2,
  },
  toolCode: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 9,
    color: '#00b32c',
  },
  actions: {
    padding: '0 16px 16px',
    display: 'flex',
    gap: 10,
  },
  launchBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #003b00, #001a00)',
    border: '1px solid #00ff41',
    borderRadius: 4,
    color: '#00ff41',
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 20px rgba(0, 255, 65, 0.25)',
    transition: 'all 0.2s',
    letterSpacing: '1px',
  },
  launchBtnRunning: {
    background: 'rgba(0, 59, 0, 0.4)',
    boxShadow: 'none',
    cursor: 'not-allowed',
    border: '1px solid #003300',
    color: '#00b32c',
  },
  launchBtnGlyph: {
    color: '#00b32c',
    fontFamily: 'JetBrains Mono, monospace',
  },
  stopBtn: {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #ff4444',
    borderRadius: 4,
    color: '#ff4444',
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  spinner: {
    width: 14,
    height: 14,
    border: '2px solid rgba(0, 255, 65, 0.3)',
    borderTop: '2px solid #00ff41',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
};
