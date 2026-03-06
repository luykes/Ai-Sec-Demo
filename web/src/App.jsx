import React, { useState } from 'react';
import Header from './components/Header.jsx';
import AttackPanel from './components/AttackPanel.jsx';
import SplitScreen from './components/SplitScreen.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';
import LandingPage from './components/LandingPage.jsx';
import CategoryPage from './components/CategoryPage.jsx';
import EmployeeProtectionPanel from './components/EmployeeProtectionPanel.jsx';
import AiOpsCopilotPanel from './components/AiOpsCopilotPanel.jsx';
import { TRANSLATIONS } from './i18n.js';

function translateScenarios(scenarios, type, t) {
  const map = type === 'mcp' ? t.mcpScenarios : type === 'prompt-leak' ? t.leakScenarios : null;
  if (!map) return scenarios;
  return scenarios.map(s => {
    const tr = map[s.id];
    return tr ? { ...s, name: tr.name, desc: tr.desc } : s;
  });
}

export default function App() {
  // Navigation state
  const [view, setView] = useState('landing'); // 'landing' | 'categories' | 'demo'
  const [activeCategory, setActiveCategory] = useState(null);

  // Language state
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang];

  // Demo state
  const [configOpen, setConfigOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleLaunch = async () => {
    setIsRunning(true);
    try {
      const endpoint = activeCategory?.apiEndpoint || '/api/agent/run';
      const res = await fetch(endpoint, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        console.error('Failed to launch agent:', err);
      }
      setTimeout(() => setIsRunning(false), 300000);
    } catch (err) {
      console.error('Launch error:', err);
      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    try {
      await fetch('/api/agent/stop', { method: 'POST' });
    } catch {
      // ignore
    }
    setIsRunning(false);
  };

  // Navigation handlers
  const handleEnterFromLanding = () => setView('categories');

  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    setView('demo');
  };

  const handleBackToCategories = () => {
    setIsRunning(false);
    setView('categories');
    setActiveCategory(null);
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  // Routing
  if (view === 'landing') {
    return (
      <>
        <LandingPage onEnter={handleEnterFromLanding} lang={lang} setLang={setLang} t={t} />
        <style>{globalAnimations}</style>
      </>
    );
  }

  if (view === 'categories') {
    return (
      <>
        <CategoryPage
          onSelectCategory={handleSelectCategory}
          onBack={handleBackToLanding}
          lang={lang}
          setLang={setLang}
          t={t}
        />
        <style>{globalAnimations}</style>
      </>
    );
  }

  // view === 'demo'
  return (
    <div style={styles.root}>
      <div style={styles.ambientLeft} />
      <div style={styles.ambientRight} />

      <Header
        configOpen={configOpen}
        onToggleConfig={() => setConfigOpen(!configOpen)}
        onBack={handleBackToCategories}
        activeCategory={activeCategory}
        lang={lang}
        setLang={setLang}
        t={t}
      />

      <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />

      <main style={styles.main}>
        {activeCategory?.type === 'employee' ? (
          <EmployeeProtectionPanel
            scenarios={activeCategory?.scenarios || []}
            categoryName={activeCategory?.name || ''}
            t={t}
          />
        ) : activeCategory?.type === 'ai-ops-copilot' ? (
          <div style={styles.splitContainer}>
            <AiOpsCopilotPanel />
          </div>
        ) : (
          <>
            <div style={styles.controlBar}>
              <AttackPanel
                scenarios={translateScenarios(activeCategory?.scenarios || [], activeCategory?.type, t)}
                categoryName={activeCategory?.name || 'Attack Scenarios'}
                onLaunch={handleLaunch}
                isRunning={isRunning}
                onStop={handleStop}
                t={t}
              />
            </div>

            <div style={styles.splitContainer}>
              <SplitScreen isRunning={isRunning} />
            </div>
          </>
        )}
      </main>

      <style>{globalAnimations}</style>
    </div>
  );
}

const globalAnimations = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  button:hover {
    filter: brightness(1.15);
  }
`;

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    background: '#000011',
  },
  ambientLeft: {
    position: 'fixed',
    top: '10%',
    left: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 229, 255, 0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  ambientRight: {
    position: 'fixed',
    bottom: '10%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 153, 204, 0.03) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 20px',
    gap: 16,
    position: 'relative',
    zIndex: 1,
    minHeight: 0,
    height: 'calc(100vh - 57px)',
    overflowY: 'auto',
  },
  controlBar: {
    flexShrink: 0,
  },
  splitContainer: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
};
