import CopilotApp from '../copilot/App'

export default function AiOpsCopilotPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <CopilotApp />
    </div>
  )
}
