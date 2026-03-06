import { useEffect, useRef, useState } from 'react'
import { Message } from '../types'
import { T } from '../i18n'
import './ChatPanel.css'

interface Props {
  messages: Message[]
  loading: boolean
  onSend: (prompt: string) => void
  onSelectTrace: (id: string) => void
  selectedTrace: string | null
  t: T
}

export default function ChatPanel({ messages, loading, onSend, onSelectTrace, selectedTrace, t }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    onSend(input.trim())
    setInput('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span>{t.chatHeader}</span>
        {loading && <span className="typing-indicator">{t.chatThinking}</span>}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>{t.chatEmpty}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role} ${msg.trace_id === selectedTrace ? 'selected' : ''}`}
            onClick={() => msg.trace_id && onSelectTrace(msg.trace_id)}
          >
            <span className="msg-role">{msg.role === 'user' ? t.chatYou : t.chatAgent}</span>
            <p className="msg-content">{msg.content}</p>
            {msg.role === 'assistant' && (
              <div className="msg-meta">
                {msg.blocked ? (
                  <span className="badge-blocked">⛔ {t.chatBlocked}</span>
                ) : (
                  <span className="badge-allowed">✓ {t.chatAllowed}</span>
                )}
                {msg.trace_id && (
                  <span className="trace-id">trace: {msg.trace_id.slice(0, 8)}</span>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message assistant loading">
            <span className="msg-role">{t.chatAgent}</span>
            <div className="dots"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t.chatPlaceholder}
          rows={2}
          disabled={loading}
        />
        <button className="send-btn" type="submit" disabled={loading || !input.trim()}>
          ↑
        </button>
      </form>
    </div>
  )
}
