import { useState, useEffect } from 'react'
import { Scenario } from '../scenarios'
import { T } from '../i18n'
import './ScenarioBar.css'

const CUSTOM_POLICY_KEY = 'customGuardrailPolicy'
const CUSTOM_PLACEHOLDER = 'Block [topic] questions about [restricted subject]. Allow [topic] questions about [permitted subject].'

interface Props {
  scenarios: Scenario[]
  onSelect: (prompt: string) => void
  disabled: boolean
  t: T
}

export default function ScenarioBar({ scenarios, onSelect, disabled, t }: Props) {
  const [active, setActive] = useState<string | null>(null)
  const [customPolicy, setCustomPolicy] = useState(
    () => localStorage.getItem(CUSTOM_POLICY_KEY) || ''
  )

  useEffect(() => {
    setActive(null)
  }, [scenarios])

  const saveCustomPolicy = () => {
    localStorage.setItem(CUSTOM_POLICY_KEY, customPolicy)
  }

  return (
    <div className="scenario-bar">
      <span className="scenario-label">{t.scenariosLabel}</span>
      {scenarios.map((s) => (
        <div key={s.id} className="scenario-group">
          <button
            className={`scenario-tab ${active === s.id ? 'open' : ''}`}
            onClick={() => setActive(active === s.id ? null : s.id)}
          >
            <span>{s.icon}</span>
            <span>{s.name}</span>
            <span className="caret">{active === s.id ? '▲' : '▼'}</span>
          </button>

          {active === s.id && (
            <div className="scenario-prompts">
              {s.id === 'nl-custom' ? (
                <>
                  <div className="custom-guardrail-editor">
                    <label className="custom-guardrail-label">Define your PS guardrail policy:</label>
                    <textarea
                      className="custom-guardrail-input"
                      value={customPolicy}
                      onChange={(e) => setCustomPolicy(e.target.value)}
                      placeholder={CUSTOM_PLACEHOLDER}
                      rows={3}
                    />
                    <button className="custom-guardrail-save" onClick={saveCustomPolicy}>
                      Save Policy
                    </button>
                  </div>
                  {(customPolicy || CUSTOM_PLACEHOLDER) && (
                    <div className="scenario-config-note">
                      ⚙️ PS Guardrail configured: {customPolicy || CUSTOM_PLACEHOLDER}
                    </div>
                  )}
                  {s.prompts.map((p, i) => (
                    <button
                      key={i}
                      className={`prompt-btn ${p.isAttack ? 'attack' : 'normal'}`}
                      onClick={() => { if (!disabled) { onSelect(p.prompt); setActive(null) } }}
                      disabled={disabled}
                      title={p.description}
                    >
                      <span className={`prompt-badge ${p.isAttack ? 'badge-attack' : 'badge-normal'}`}>
                        {p.isAttack ? t.badgeAttack : t.badgeNormal}
                      </span>
                      <span className="prompt-label-wrap">
                        {p.label}
                        {p.description && <span className="prompt-description">{p.description}</span>}
                      </span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {s.configNote && (
                    <div className="scenario-config-note">{s.configNote}</div>
                  )}
                  {s.prompts.map((p, i) => (
                    <button
                      key={i}
                      className={`prompt-btn ${p.isAttack ? 'attack' : 'normal'}`}
                      onClick={() => {
                        if (!disabled) {
                          onSelect(p.prompt)
                          setActive(null)
                        }
                      }}
                      disabled={disabled}
                      title={p.description}
                    >
                      <span className={`prompt-badge ${p.isAttack ? 'badge-attack' : 'badge-normal'}`}>
                        {p.isAttack ? t.badgeAttack : t.badgeNormal}
                      </span>
                      <span className="prompt-label-wrap">
                        {p.label}
                        {p.description && <span className="prompt-description">{p.description}</span>}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
