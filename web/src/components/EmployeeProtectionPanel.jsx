import React, { useState } from 'react';

const SEVERITY_COLORS = {
  critical: '#ff4444',
  high:     '#ffaa44',
  medium:   '#44aaff',
  safe:     '#00ff41',
};

const PLATFORMS = [
  { id: 'chatgpt', label: 'ChatGPT', glyph: '[GPT]' },
  { id: 'gemini',  label: 'Gemini',  glyph: '[GEM]' },
  { id: 'copilot', label: 'Copilot', glyph: '[COP]' },
  { id: 'claude',  label: 'Claude',  glyph: '[CLO]' },
];

function getPlatformUrl(platformId, prompt) {
  switch (platformId) {
    case 'chatgpt': return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    case 'gemini':  return 'https://gemini.google.com/app';
    case 'copilot': return 'https://copilot.microsoft.com/';
    case 'claude':  return 'https://claude.ai/new';
    default:        return '#';
  }
}

function launchPlatform(platformId, prompt) {
  navigator.clipboard.writeText(prompt).catch(() => {});
  window.open(getPlatformUrl(platformId, prompt), '_blank', 'noopener,noreferrer');
}

export default function EmployeeProtectionPanel({ scenarios, categoryName }) {
  // { scenarioId, type: 'platform'|'copy', platformId? }
  const [toast, setToast] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customToast, setCustomToast] = useState(null); // 'copy' | platformId | null

  function showToast(setter, value, delay = 2000) {
    setter(value);
    setTimeout(() => setter(null), delay);
  }

  function handlePlatformClick(scenario, platformId) {
    launchPlatform(platformId, scenario.prompt);
    showToast(setToast, { scenarioId: scenario.id, type: 'platform', platformId });
  }

  function handleCopy(scenario) {
    navigator.clipboard.writeText(scenario.prompt).catch(() => {});
    showToast(setToast, { scenarioId: scenario.id, type: 'copy' }, 1500);
  }

  function handleCustomPlatform(platformId) {
    if (!customPrompt.trim()) return;
    launchPlatform(platformId, customPrompt.trim());
    showToast(setCustomToast, platformId);
  }

  function handleCustomCopy() {
    if (!customPrompt.trim()) return;
    navigator.clipboard.writeText(customPrompt.trim()).catch(() => {});
    showToast(setCustomToast, 'copy', 1500);
  }

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.headerLeft}>
          <span style={styles.panelTitle}>{categoryName}</span>
          <span style={styles.scenarioCount}>
            {scenarios.length} scenarios — click a platform to test
          </span>
        </div>
        <span style={styles.hint}>
          Powered by Prompt Security browser extension — intercepts at the browser layer
        </span>
      </div>

      <div style={styles.scenarioGrid}>
        {scenarios.map((scenario) => {
          const isSafe = scenario.severity === 'safe';
          const activePlatformToast =
            toast?.type === 'platform' && toast?.scenarioId === scenario.id
              ? toast.platformId
              : null;
          const activeCopyToast =
            toast?.type === 'copy' && toast?.scenarioId === scenario.id;

          return (
            <div
              key={scenario.id}
              style={{
                ...styles.scenarioCard,
                ...(isSafe ? styles.scenarioCardSafe : {}),
              }}
            >
              <div style={styles.cardTop}>
                <span
                  style={{
                    ...styles.protectionBadge,
                    color: scenario.protectionColor,
                    borderColor: scenario.protectionColor,
                    background: `${scenario.protectionColor}18`,
                  }}
                >
                  {scenario.protection.toUpperCase()}
                </span>
                {scenario.severity && (
                  <span
                    style={{
                      ...styles.severityBadge,
                      color: SEVERITY_COLORS[scenario.severity],
                      borderColor: SEVERITY_COLORS[scenario.severity],
                      background: `${SEVERITY_COLORS[scenario.severity]}15`,
                    }}
                  >
                    {isSafe ? 'ALLOWED' : scenario.severity}
                  </span>
                )}
              </div>

              <div style={styles.cardNameRow}>
                <span style={styles.cardIcon}>{scenario.icon}</span>
                <span style={{ ...styles.cardName, color: isSafe ? '#00b32c' : '#00ff41' }}>
                  {scenario.name}
                </span>
              </div>

              <div style={styles.cardDesc}>{scenario.desc}</div>

              <div style={styles.promptPreview}>
                &ldquo;{scenario.prompt}&rdquo;
              </div>

              {/* Copy prompt button */}
              <button
                style={{
                  ...styles.copyBtn,
                  ...(activeCopyToast ? styles.copyBtnActive : {}),
                }}
                onClick={() => handleCopy(scenario)}
              >
                {activeCopyToast ? '✓ COPIED' : '⧉  COPY PROMPT'}
              </button>

              {/* Platform launch buttons */}
              <div style={styles.platformRow}>
                {PLATFORMS.map((platform) => {
                  const isActive = activePlatformToast === platform.id;
                  return (
                    <button
                      key={platform.id}
                      style={{
                        ...styles.platformBtn,
                        ...(isActive ? styles.platformBtnActive : {}),
                      }}
                      onClick={() => handlePlatformClick(scenario, platform.id)}
                      title={`Open in ${platform.label} — prompt copied to clipboard`}
                    >
                      <span style={styles.platformGlyph}>{platform.glyph}</span>
                      <span style={styles.platformLabel}>{platform.label}</span>
                    </button>
                  );
                })}
              </div>

              {activePlatformToast && (
                <div style={styles.toastInCard}>
                  ✓ Copied — opening {PLATFORMS.find((p) => p.id === activePlatformToast)?.label}...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom prompt tester */}
      <div style={styles.customSection}>
        <div style={styles.customHeader}>
          <span style={styles.customTitle}>[TEST] Custom Prompt</span>
          <span style={styles.customHint}>
            Test your own Natural Language Guardrail or any custom scenario
          </span>
        </div>
        <textarea
          style={styles.customTextarea}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Type or paste your own prompt to test against any platform..."
          rows={3}
          spellCheck={false}
        />
        <div style={styles.customActions}>
          {PLATFORMS.map((platform) => {
            const isActive = customToast === platform.id;
            return (
              <button
                key={platform.id}
                style={{
                  ...styles.customPlatformBtn,
                  ...(isActive ? styles.platformBtnActive : {}),
                  ...(!customPrompt.trim() ? styles.btnDisabled : {}),
                }}
                onClick={() => handleCustomPlatform(platform.id)}
                disabled={!customPrompt.trim()}
                title={`Open in ${platform.label}`}
              >
                {platform.label}
              </button>
            );
          })}
          <button
            style={{
              ...styles.customCopyBtn,
              ...(customToast === 'copy' ? styles.copyBtnActive : {}),
              ...(!customPrompt.trim() ? styles.btnDisabled : {}),
            }}
            onClick={handleCustomCopy}
            disabled={!customPrompt.trim()}
          >
            {customToast === 'copy' ? '✓ COPIED' : '⧉  COPY'}
          </button>
        </div>
      </div>

      <div style={styles.footer}>
        <span style={styles.footerText}>
          [EXT] Requires Prompt Security browser extension&nbsp;·&nbsp;
          Prompt is copied to clipboard and pre-filled where supported (ChatGPT)&nbsp;·&nbsp;
          Extension intercepts submission in real time
        </span>
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
    fontFamily: 'JetBrains Mono, monospace',
  },
  scenarioCount: {
    fontSize: 11,
    color: '#00b32c',
    background: 'rgba(0, 255, 65, 0.08)',
    border: '1px solid rgba(0, 255, 65, 0.2)',
    borderRadius: 4,
    padding: '2px 8px',
    fontFamily: 'JetBrains Mono, monospace',
  },
  hint: {
    fontSize: 11,
    color: '#004400',
    fontFamily: 'JetBrains Mono, monospace',
  },
  scenarioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    padding: 16,
  },
  scenarioCard: {
    background: '#001a00',
    border: '1px solid #002500',
    borderRadius: 4,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    position: 'relative',
  },
  scenarioCardSafe: {
    background: '#001600',
    border: '1px solid #003300',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  protectionBadge: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.8px',
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid',
    fontFamily: 'JetBrains Mono, monospace',
  },
  severityBadge: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 5px',
    borderRadius: 4,
    border: '1px solid',
    fontFamily: 'JetBrains Mono, monospace',
  },
  cardNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  cardIcon: {
    fontSize: 12,
    fontFamily: 'JetBrains Mono, monospace',
    color: '#00b32c',
    letterSpacing: '-1px',
    flexShrink: 0,
  },
  cardName: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.3,
    fontFamily: 'JetBrains Mono, monospace',
  },
  cardDesc: {
    fontSize: 10,
    color: '#006600',
    lineHeight: 1.5,
    fontFamily: 'JetBrains Mono, monospace',
  },
  promptPreview: {
    fontSize: 10,
    color: '#005500',
    fontStyle: 'italic',
    lineHeight: 1.4,
    fontFamily: 'JetBrains Mono, monospace',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    borderLeft: '2px solid #002500',
    paddingLeft: 8,
    flexGrow: 1,
  },
  copyBtn: {
    background: 'rgba(0, 179, 44, 0.1)',
    border: '1px solid #00b32c',
    borderRadius: 3,
    color: '#00b32c',
    padding: '6px 10px',
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    cursor: 'pointer',
    letterSpacing: '0.8px',
    width: '100%',
    textAlign: 'center',
    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
  },
  copyBtnActive: {
    borderColor: '#00ff41',
    color: '#00ff41',
    background: 'rgba(0, 255, 65, 0.12)',
  },
  platformRow: {
    display: 'flex',
    gap: 5,
  },
  platformBtn: {
    flex: 1,
    background: '#001100',
    border: '1px solid #003300',
    borderRadius: 3,
    color: '#00b32c',
    padding: '5px 4px',
    fontSize: 9,
    fontWeight: 600,
    fontFamily: 'JetBrains Mono, monospace',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    transition: 'border-color 0.15s, background 0.15s',
    letterSpacing: '0.3px',
  },
  platformBtnActive: {
    borderColor: '#00ff41',
    background: 'rgba(0, 255, 65, 0.08)',
    color: '#00ff41',
  },
  platformGlyph: {
    fontSize: 9,
    color: '#005500',
    fontFamily: 'JetBrains Mono, monospace',
  },
  platformLabel: {
    fontSize: 8,
    letterSpacing: '0.5px',
  },
  toastInCard: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    background: 'rgba(0, 17, 0, 0.97)',
    border: '1px solid #00ff41',
    borderRadius: 3,
    color: '#00ff41',
    fontSize: 10,
    fontFamily: 'JetBrains Mono, monospace',
    padding: '5px 10px',
    textAlign: 'center',
    animation: 'fadeIn 0.15s ease',
    zIndex: 10,
  },
  // Custom prompt section
  customSection: {
    margin: '0 16px 16px',
    background: '#001600',
    border: '1px solid #003300',
    borderRadius: 4,
    overflow: 'hidden',
  },
  customHeader: {
    padding: '10px 14px',
    borderBottom: '1px solid #002500',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  customTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#00b32c',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  customHint: {
    fontSize: 10,
    color: '#004400',
    fontFamily: 'JetBrains Mono, monospace',
  },
  customTextarea: {
    width: '100%',
    background: '#001100',
    border: 'none',
    borderBottom: '1px solid #002500',
    color: '#00ff41',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11,
    lineHeight: 1.6,
    padding: '10px 14px',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  },
  customActions: {
    display: 'flex',
    gap: 8,
    padding: '10px 14px',
    alignItems: 'center',
  },
  customPlatformBtn: {
    background: '#001100',
    border: '1px solid #003300',
    borderRadius: 3,
    color: '#00b32c',
    padding: '6px 12px',
    fontSize: 10,
    fontWeight: 600,
    fontFamily: 'JetBrains Mono, monospace',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    letterSpacing: '0.3px',
  },
  customCopyBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: '1px solid #003300',
    borderRadius: 3,
    color: '#004400',
    padding: '6px 12px',
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'border-color 0.15s, color 0.15s',
  },
  btnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  footer: {
    padding: '10px 18px',
    borderTop: '1px solid #002200',
  },
  footerText: {
    fontSize: 10,
    color: '#003300',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.3px',
  },
};
