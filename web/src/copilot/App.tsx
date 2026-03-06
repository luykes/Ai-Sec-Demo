import { useState } from 'react'
import { Settings, Message, DemoMode } from './types'
import { Lang, TRANSLATIONS, LANG_OPTIONS } from './i18n'
import { SCENARIO_TRANSLATIONS } from './scenarioTranslations'
import SettingsPanel from './components/SettingsPanel'
import ScenarioBar from './components/ScenarioBar'
import ChatPanel from './components/ChatPanel'
import AuditPanel from './components/AuditPanel'
import './App.css'

const SETTINGS_KEY = 'ps_demo_settings'

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Clear legacy hardcoded default username
      if (parsed.psUsername === 'demo-agent') parsed.psUsername = ''
      return parsed
    }
  } catch {}
  return { anthropicApiKey: '', psApiUrl: '', psApiKey: '', psUsername: '', provider: 'claude', ollamaModel: 'llama3.1', openaiApiKey: '', openaiModel: 'gpt-4o' }
}

function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [showSettings, setShowSettings] = useState(() => {
    const s = loadSettings()
    return !s.anthropicApiKey && s.provider !== 'ollama' && !(s.provider === 'openai' && s.openaiApiKey)
  })
  const [mode, setMode] = useState<DemoMode>('presentation')
  const [psEnabled, setPsEnabled] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const t = TRANSLATIONS[lang]

  // Reset conversation when language changes so the LLM gets a clean context
  // in the new language without old-language history polluting the request.
  useEffect(() => {
    setMessages([])
    setSessionId(null)
    setSelectedTrace(null)
  }, [lang])

  const handleSaveSettings = (s: Settings) => {
    setSettings(s)
    saveSettings(s)
    setShowSettings(false)
  }

  const handleSend = async (prompt: string) => {
    if (!prompt.trim() || loading) return
    const userMsg: Message = { role: 'user', content: prompt }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (settings.anthropicApiKey) headers['x-anthropic-api-key'] = settings.anthropicApiKey
      if (settings.openaiApiKey) headers['x-openai-api-key'] = settings.openaiApiKey
      if (psEnabled) {
        if (settings.psApiUrl) headers['x-ps-api-url'] = settings.psApiUrl
        if (settings.psApiKey) headers['x-ps-api-key'] = settings.psApiKey
        if (settings.psUsername) headers['x-ps-username'] = settings.psUsername
      } else {
        headers['x-ps-bypass'] = '1'
      }

      const body = {
        message: prompt,
        session_id: sessionId,
        provider: settings.provider,
        ollama_model: settings.ollamaModel,
        openai_model: settings.openaiModel,
        language: lang,
        history: messages
          .map((m) => ({ role: m.role, content: m.content })),
      }

      // Always use /copilot/api — Vite proxy rewrites this to http://localhost:8000 in dev,
      // nginx proxies it to copilot-agent:8000 in production.
      const res = await fetch('/copilot/api/chat', { method: 'POST', headers, body: JSON.stringify(body) })
      const text = await res.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(text || `HTTP ${res.status}`)
      }
      if (!res.ok) {
        throw new Error(data?.detail || `HTTP ${res.status}`)
      }

      if (!sessionId) setSessionId(data.session_id)

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response,
        blocked: data.blocked,
        trace_id: data.trace_id,
        audit_trail: data.audit_trail,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setSelectedTrace(data.trace_id)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err}`, blocked: false },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([])
    setSessionId(null)
    setSelectedTrace(null)
  }

  const selectedMessage = messages.find((m) => m.trace_id === selectedTrace)

  return (
    <div className="copilot-app">
      {showSettings && (
        <SettingsPanel
          initial={settings}
          onSave={handleSaveSettings}
          onDismiss={() => setShowSettings(false)}
          canDismiss={settings.provider === 'ollama' || !!settings.anthropicApiKey || (settings.provider === 'openai' && !!settings.openaiApiKey)}
          t={t}
        />
      )}

      <header className="app-header">
        <div className="header-left">
          <span className="logo">⚡ AI Ops Copilot</span>
          <span className="header-sub">
            {t.headerSub} — Prompt Security + {settings.provider === 'ollama' ? settings.ollamaModel : settings.provider === 'openai' ? (settings.openaiModel || 'OpenAI') : 'Claude'}
          </span>
        </div>
        <div className="header-right">
          <select
            className="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            title="Language"
          >
            {LANG_OPTIONS.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
          <button
            className={`mode-btn ${mode === 'presentation' ? 'active' : ''}`}
            onClick={() => setMode('presentation')}
          >
            {t.presentation}
          </button>
          <button
            className={`mode-btn ${mode === 'tutorial' ? 'active' : ''}`}
            onClick={() => setMode('tutorial')}
          >
            {t.tutorial}
          </button>
          <button
            className={`ps-toggle-btn ${psEnabled ? 'ps-on' : 'ps-off'}`}
            onClick={() => setPsEnabled((v) => !v)}
            title={psEnabled ? 'Prompt Security ON — click to disable' : 'Prompt Security OFF — click to enable'}
          >
            {psEnabled ? `🛡 ${t.psOn}` : `⚠ ${t.psOff}`}
          </button>
          <button className="icon-btn settings-btn" onClick={() => setShowSettings(true)} title={t.config}>
            ⚙
          </button>
          <button className="icon-btn" onClick={handleReset} title="Reset session">
            ↺
          </button>
        </div>
      </header>

      <ScenarioBar scenarios={SCENARIO_TRANSLATIONS[lang]} onSelect={handleSend} disabled={loading} t={t} />

      <main className="app-main">
        <ChatPanel
          messages={messages}
          loading={loading}
          onSend={handleSend}
          onSelectTrace={setSelectedTrace}
          selectedTrace={selectedTrace}
          t={t}
        />
        <AuditPanel
          messages={messages}
          selectedTrace={selectedTrace}
          selectedMessage={selectedMessage}
          mode={mode}
          onSelectTrace={setSelectedTrace}
          t={t}
        />
      </main>
    </div>
  )
}
