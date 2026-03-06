export interface AuditEntry {
  event_type: string
  payload: Record<string, unknown>
}

export interface ChatResponse {
  response: string
  session_id: string
  trace_id: string
  audit_trail: AuditEntry[]
  blocked: boolean
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  blocked?: boolean
  trace_id?: string
  audit_trail?: AuditEntry[]
}

export interface Settings {
  anthropicApiKey: string
  psApiUrl: string
  psApiKey: string
  psUsername: string
  provider: 'claude' | 'ollama' | 'openai'
  ollamaModel: string
  openaiApiKey: string
  openaiModel: string
}

export type DemoMode = 'presentation' | 'tutorial'
