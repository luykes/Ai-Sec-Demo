import React, { useState, useEffect } from 'react';

export default function ConfigPanel({ open, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('https://apsouth.prompt.security/api/protect');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const [existingKey, setExistingKey] = useState(null);

  useEffect(() => {
    if (open) {
      fetch('/api/config')
        .then(r => r.json())
        .then(data => {
          setExistingKey(data.maskedKey || null);
          setApiUrl(data.promptSecurityApiUrl || 'https://apsouth.prompt.security/api/protect');
          setUsername(data.username || '');
        })
        .catch(() => {});
    }
  }, [open]);

  const handleSave = async () => {
    setStatus('saving');
    try {
      const body = { promptSecurityApiUrl: apiUrl, username: username.trim() };
      if (apiKey.trim()) body.promptSecurityApiKey = apiKey.trim();

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setStatus('saved');
        setApiKey('');
        const data = await res.json();
        if (data.maskedKey) setExistingKey(data.maskedKey);
        fetch('/api/config').then(r => r.json()).then(d => {
          setExistingKey(d.maskedKey || null);
        });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus(null), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>⚙ Configuration</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          <div style={styles.section}>
            <label style={styles.label}>Attacker Identity (Username)</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. john.doe or your email"
              style={styles.input}
            />
            <p style={styles.hint}>
              Shown in attack logs and passed to Prompt Security as the <code style={styles.code}>user</code> field for dashboard attribution.
            </p>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Prompt Security API Key</label>
            {existingKey && (
              <div style={styles.existingKey}>
                Current: <code style={styles.maskedKey}>{existingKey}</code>
              </div>
            )}
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={existingKey ? 'Enter new key to replace...' : 'Enter your API key...'}
              style={styles.input}
            />
            <p style={styles.hint}>
              Enter your Prompt Security API key. Leave blank to keep the existing key.
              Keys are stored locally in <code style={styles.code}>.runtime-config.json</code> and never committed to Git.
            </p>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Prompt Security API URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              style={styles.input}
            />
            <p style={styles.hint}>
              Default: <code style={styles.code}>https://apsouth.prompt.security/api/protect</code>
            </p>
          </div>

          <div style={styles.noKeyNote}>
            <span style={styles.noteIcon}>ℹ</span>
            <span>Without an API key, the protected MCP server will allow all tool calls (no enforcement). The demo still works — both panes run — but there will be no Prompt Security blocking.</span>
          </div>

          <button
            style={{
              ...styles.saveBtn,
              ...(status === 'saved' ? styles.saveBtnSuccess : {}),
              ...(status === 'error' ? styles.saveBtnError : {}),
            }}
            onClick={handleSave}
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Saving...' : status === 'saved' ? '✓ Saved' : status === 'error' ? '✕ Error' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingTop: 56,
  },
  panel: {
    background: '#001100',
    border: '1px solid #003300',
    borderRadius: '4px 0 0 4px',
    width: 420,
    maxHeight: 'calc(100vh - 56px)',
    overflowY: 'auto',
    boxShadow: '-8px 0 40px rgba(0, 255, 65, 0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #003300',
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: '#00ff41',
    fontFamily: 'JetBrains Mono, monospace',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#004400',
    fontSize: 16,
    cursor: 'pointer',
    padding: '4px 8px',
    fontFamily: 'JetBrains Mono, monospace',
  },
  body: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#00b32c',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  existingKey: {
    fontSize: 12,
    color: '#004400',
  },
  maskedKey: {
    fontFamily: 'JetBrains Mono, monospace',
    color: '#00ff41',
    background: '#002200',
    padding: '2px 6px',
    borderRadius: 2,
    fontSize: 12,
  },
  input: {
    background: '#001a00',
    border: '1px solid #003300',
    borderRadius: 2,
    color: '#00ff41',
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: 'JetBrains Mono, monospace',
    outline: 'none',
    width: '100%',
  },
  hint: {
    fontSize: 11,
    color: '#004400',
    lineHeight: 1.6,
  },
  code: {
    fontFamily: 'JetBrains Mono, monospace',
    color: '#00b32c',
    fontSize: 11,
  },
  noKeyNote: {
    background: 'rgba(0, 255, 65, 0.04)',
    border: '1px solid #003300',
    borderRadius: 2,
    padding: '12px 14px',
    fontSize: 12,
    color: '#005500',
    lineHeight: 1.6,
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  noteIcon: {
    color: '#00b32c',
    fontSize: 14,
    flexShrink: 0,
    marginTop: 1,
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #003b00, #001a00)',
    border: '1px solid #00ff41',
    borderRadius: 2,
    color: '#00ff41',
    padding: '12px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '1px',
  },
  saveBtnSuccess: {
    background: 'linear-gradient(135deg, #15803d, #166534)',
    borderColor: '#00ff41',
  },
  saveBtnError: {
    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
    borderColor: '#ff4444',
  },
};
