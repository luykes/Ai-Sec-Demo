import { useState } from 'react'
import { Settings } from '../types'
import { T } from '../i18n'
import './SettingsPanel.css'

interface Props {
  initial: Settings
  onSave: (s: Settings) => void
  onDismiss: () => void
  canDismiss: boolean
  t: T
}

export default function SettingsPanel({ initial, onSave, onDismiss, canDismiss, t }: Props) {
  const [provider, setProvider] = useState<'claude' | 'ollama' | 'openai'>(initial.provider ?? 'claude')
  const [anthropicKey, setAnthropicKey] = useState(initial.anthropicApiKey)
  const [showAnthropicKey, setShowAnthropicKey] = useState(false)
  const [ollamaModel, setOllamaModel] = useState(initial.ollamaModel || 'llama3.1')
  const [openaiKey, setOpenaiKey] = useState(initial.openaiApiKey || '')
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [openaiModel, setOpenaiModel] = useState(initial.openaiModel || 'gpt-4o')
  const [url, setUrl] = useState(initial.psApiUrl)
  const [key, setKey] = useState(initial.psApiKey)
  const [username, setUsername] = useState(initial.psUsername || '')
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    onSave({
      anthropicApiKey: anthropicKey.trim(),
      psApiUrl: url.trim(),
      psApiKey: key.trim(),
      psUsername: username.trim(),
      provider,
      ollamaModel: ollamaModel.trim() || 'llama3.1',
      openaiApiKey: openaiKey.trim(),
      openaiModel: openaiModel.trim() || 'gpt-4o',
    })
  }

  const ready =
    provider === 'ollama' ? !!ollamaModel.trim() :
    provider === 'openai' ? !!openaiKey.trim() :
    !!anthropicKey.trim()

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <span className="settings-title">⚡ {t.settingsTitle}</span>
          {canDismiss && (
            <button className="settings-close" onClick={onDismiss}>✕</button>
          )}
        </div>

        <p className="settings-desc">{t.settingsDesc}</p>

        <div className="settings-section-label">{t.settingsProvider}</div>
        <div className="provider-toggle">
          <button
            className={`provider-btn ${provider === 'claude' ? 'active' : ''}`}
            onClick={() => setProvider('claude')}
          >
            {t.settingsClaude}
          </button>
          <button
            className={`provider-btn ${provider === 'ollama' ? 'active' : ''}`}
            onClick={() => setProvider('ollama')}
          >
            {t.settingsOllama}
          </button>
          <button
            className={`provider-btn ${provider === 'openai' ? 'active' : ''}`}
            onClick={() => setProvider('openai')}
          >
            {t.settingsOpenai}
          </button>
        </div>

        {provider === 'claude' && (
          <>
            <div className="settings-section-label">Anthropic</div>
            <div className="settings-field">
              <label>{t.settingsAnthropicKey}</label>
              <div className="key-input-row">
                <input
                  type={showAnthropicKey ? 'text' : 'password'}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-••••••••••••••••"
                  spellCheck={false}
                />
                <button className="show-btn" onClick={() => setShowAnthropicKey((v) => !v)}>
                  {showAnthropicKey ? t.settingsHide : t.settingsShow}
                </button>
              </div>
            </div>
          </>
        )}

        {provider === 'ollama' && (
          <>
            <div className="settings-section-label">Ollama</div>
            <div className="settings-field">
              <label>{t.settingsModelName}</label>
              <input
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                placeholder="llama3.1"
                spellCheck={false}
              />
            </div>
            <p className="settings-desc" style={{ marginBottom: 12, marginTop: -4 }}>
              {t.settingsOllamaHint}
            </p>
          </>
        )}

        {provider === 'openai' && (
          <>
            <div className="settings-section-label">OpenAI</div>
            <div className="settings-field">
              <label>{t.settingsOpenaiKey}</label>
              <div className="key-input-row">
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-••••••••••••••••"
                  spellCheck={false}
                />
                <button className="show-btn" onClick={() => setShowOpenaiKey((v) => !v)}>
                  {showOpenaiKey ? t.settingsHide : t.settingsShow}
                </button>
              </div>
            </div>
            <div className="settings-field">
              <label>{t.settingsModel}</label>
              <input
                type="text"
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                placeholder="gpt-4o"
                spellCheck={false}
              />
            </div>
          </>
        )}

        <div className="settings-section-label">{t.settingsPsSection}</div>

        <div className="settings-field">
          <label>{t.settingsPsUrl}</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.prompt.security/..."
            spellCheck={false}
          />
        </div>

        <div className="settings-field">
          <label>{t.settingsPsKey}</label>
          <div className="key-input-row">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="ps-••••••••••••••••"
              spellCheck={false}
            />
            <button className="show-btn" onClick={() => setShowKey((v) => !v)}>
              {showKey ? t.settingsHide : t.settingsShow}
            </button>
          </div>
        </div>

        <div className="settings-field">
          <label>{t.settingsUsername}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="demo-agent"
            spellCheck={false}
          />
        </div>

        <div className="settings-note">
          {!ready ? (
            <span className="note-warn">
              ⚠ {provider === 'claude' ? t.settingsWarnClaude : provider === 'openai' ? t.settingsWarnOpenai : t.settingsWarnOllama}
            </span>
          ) : !url && !key ? (
            <span className="note-warn">⚠ {t.settingsWarnPs}</span>
          ) : (
            <span className="note-ok">✓ {t.settingsOk}</span>
          )}
        </div>

        <div className="settings-actions">
          {canDismiss && (
            <button className="btn-secondary" onClick={onDismiss}>
              {t.settingsCancel}
            </button>
          )}
          <button className="btn-primary" onClick={handleSave}>
            {t.settingsSave}
          </button>
        </div>
      </div>
    </div>
  )
}
