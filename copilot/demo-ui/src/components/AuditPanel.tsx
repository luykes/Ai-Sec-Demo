import { useState } from 'react'
import { Message, AuditEntry, DemoMode } from '../types'
import { T } from '../i18n'
import './AuditPanel.css'

interface Props {
  messages: Message[]
  selectedTrace: string | null
  selectedMessage: Message | undefined
  mode: DemoMode
  onSelectTrace: (id: string) => void
  t: T
}

const EVENT_ICONS: Record<string, string> = {
  user_prompt: '💬',
  tool_attempt: '🔧',
  security_decision: '🛡',
  tool_response: '📦',
  agent_response: '🤖',
  agent_plan: '📋',
}

function DecisionBadge({ decision }: { decision: string }) {
  const cls = decision === 'ALLOW' ? 'allow' : decision === 'BLOCK' ? 'block' : 'approval'
  return <span className={`decision-badge ${cls}`}>{decision}</span>
}

function EventRow({ entry, mode }: { entry: AuditEntry; mode: DemoMode }) {
  const [expanded, setExpanded] = useState(false)
  const icon = EVENT_ICONS[entry.event_type] || '•'
  const isDecision = entry.event_type === 'security_decision'
  const decision = entry.payload.decision as string | undefined

  return (
    <div className={`event-row ${isDecision ? `event-${(decision || '').toLowerCase()}` : ''}`}>
      <div className="event-main" onClick={() => mode === 'tutorial' && setExpanded((v) => !v)}>
        <span className="event-icon">{icon}</span>
        <div className="event-content">
          <span className="event-type">{entry.event_type.replace(/_/g, ' ')}</span>
          {isDecision && decision && <DecisionBadge decision={decision} />}
          {isDecision && (
            <span className="event-summary">{entry.payload.reason_summary as string}</span>
          )}
          {entry.event_type === 'tool_attempt' && (
            <span className="event-tool">{entry.payload.tool_name as string}</span>
          )}
          {entry.event_type === 'user_prompt' && (
            <span className="event-summary">{String(entry.payload.message).slice(0, 60)}...</span>
          )}
        </div>
        {mode === 'tutorial' && (
          <span className="expand-btn">{expanded ? '▲' : '▼'}</span>
        )}
      </div>

      {mode === 'tutorial' && expanded && (
        <pre className="event-raw">{JSON.stringify(entry.payload, null, 2)}</pre>
      )}
    </div>
  )
}

export default function AuditPanel({ messages, selectedTrace, selectedMessage, mode, onSelectTrace, t }: Props) {
  const assistantMessages = messages.filter((m) => m.role === 'assistant' && m.trace_id)

  return (
    <div className="audit-panel">
      <div className="audit-header">
        <span>{t.auditHeader}</span>
        {mode === 'tutorial' && (
          <span className="audit-hint">{t.auditExpand}</span>
        )}
      </div>

      {selectedMessage?.audit_trail ? (
        <div className="audit-trace">
          <div className="trace-meta">
            <span className="trace-label">{t.auditTrace}</span>
            <span className="trace-id-full">{selectedMessage.trace_id}</span>
          </div>
          <div className="event-list">
            {selectedMessage.audit_trail.map((entry, i) => (
              <EventRow key={i} entry={entry} mode={mode} />
            ))}
          </div>
        </div>
      ) : (
        <div className="audit-empty">
          <div className="audit-sessions">
            {assistantMessages.length === 0 ? (
              <p className="no-traces">{t.auditNoTraces}</p>
            ) : (
              <>
                <p className="select-hint">{t.auditSelectHint}</p>
                {assistantMessages.map((m, i) => (
                  <button
                    key={i}
                    className={`session-row ${m.trace_id === selectedTrace ? 'active' : ''}`}
                    onClick={() => m.trace_id && onSelectTrace(m.trace_id)}
                  >
                    <span className="session-icon">{m.blocked ? '⛔' : '✓'}</span>
                    <span className="session-preview">{m.content.slice(0, 50)}...</span>
                    <span className="session-trace">{m.trace_id?.slice(0, 8)}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
