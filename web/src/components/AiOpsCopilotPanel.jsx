import React, { useState } from 'react';

const COPILOT_URL = 'http://localhost:3000';

// In production (HTTPS) the browser blocks http://localhost iframes as mixed content.
// The AI Ops Copilot also isn't deployed on the VPS — it's a local-only companion app.
const IS_PRODUCTION = window.location.protocol === 'https:';

export default function AiOpsCopilotPanel() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (IS_PRODUCTION) {
    return (
      <div style={styles.root}>
        <div style={styles.toolbar}>
          <span style={styles.label}>AI OPERATIONS COPILOT</span>
          <span style={styles.url}>{COPILOT_URL}</span>
        </div>
        <div style={styles.errorState}>
          <p style={styles.errorTitle}>[ LOCAL ONLY ]</p>
          <p style={styles.errorMsg}>
            AI Operations Copilot runs as a separate local app on your machine.
          </p>
          <p style={styles.errorHint}>
            To use it, start it locally and open the demo at http://localhost:5173
          </p>
          <pre style={styles.errorCode}>
            cd "AI Operations Copilot"{'\n'}
            make backend{'\n'}
            make ui
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.toolbar}>
        <span style={styles.label}>AI OPERATIONS COPILOT</span>
        <span style={styles.url}>{COPILOT_URL}</span>
        <a
          href={COPILOT_URL}
          target="_blank"
          rel="noreferrer"
          style={styles.openBtn}
        >
          [ OPEN IN TAB ]
        </a>
      </div>

      {!loaded && !error && (
        <div style={styles.loading}>
          <span style={styles.loadingText}>CONNECTING TO AI OPERATIONS COPILOT...</span>
        </div>
      )}

      {error && (
        <div style={styles.errorState}>
          <p style={styles.errorTitle}>[ CONNECTION FAILED ]</p>
          <p style={styles.errorMsg}>
            AI Operations Copilot is not running at {COPILOT_URL}
          </p>
          <p style={styles.errorHint}>
            Start the backend and UI first:
          </p>
          <pre style={styles.errorCode}>
            cd "AI Operations Copilot"{'\n'}
            make backend{'\n'}
            make ui
          </pre>
          <a href={COPILOT_URL} target="_blank" rel="noreferrer" style={styles.retryLink}>
            [ TRY OPENING DIRECTLY ]
          </a>
        </div>
      )}

      <iframe
        src={COPILOT_URL}
        style={{ ...styles.frame, display: loaded && !error ? 'block' : 'none' }}
        title="AI Operations Copilot"
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(false); }}
      />
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    background: '#000011',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '8px 16px',
    background: '#000820',
    borderBottom: '1px solid #001a40',
    flexShrink: 0,
  },
  label: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11,
    fontWeight: 700,
    color: '#00e5ff',
    letterSpacing: '2px',
  },
  url: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10,
    color: '#003366',
    flex: 1,
  },
  openBtn: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 10,
    color: '#0099cc',
    textDecoration: 'none',
    letterSpacing: '1px',
    border: '1px solid #001a40',
    padding: '3px 8px',
    borderRadius: 2,
  },
  frame: {
    flex: 1,
    border: 'none',
    width: '100%',
    minHeight: 0,
    background: '#000011',
  },
  loading: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 13,
    color: '#003366',
    letterSpacing: '2px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  errorState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  errorTitle: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 18,
    fontWeight: 700,
    color: '#ff4444',
    letterSpacing: '3px',
    margin: 0,
  },
  errorMsg: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#0099cc',
    margin: 0,
  },
  errorHint: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11,
    color: '#003366',
    margin: 0,
  },
  errorCode: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 12,
    color: '#00e5ff',
    background: '#000820',
    border: '1px solid #001a40',
    padding: '12px 20px',
    borderRadius: 2,
    margin: 0,
    lineHeight: 1.8,
  },
  retryLink: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11,
    color: '#0099cc',
    textDecoration: 'none',
    letterSpacing: '1px',
    marginTop: 8,
  },
};
