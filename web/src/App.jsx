import React, { useState } from 'react';
import Header from './components/Header.jsx';
import AttackPanel from './components/AttackPanel.jsx';
import SplitScreen from './components/SplitScreen.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';
import LandingPage from './components/LandingPage.jsx';
import CategoryPage from './components/CategoryPage.jsx';
import EmployeeProtectionPanel from './components/EmployeeProtectionPanel.jsx';

export default function App() {
  // Navigation state
  const [view, setView] = useState('landing'); // 'landing' | 'categories' | 'demo'
  const [activeCategory, setActiveCategory] = useState(null);

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
        <LandingPage onEnter={handleEnterFromLanding} />
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
      />

      <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />

      <main style={styles.main}>
        {activeCategory?.type === 'employee' ? (
          <EmployeeProtectionPanel
            scenarios={activeCategory?.scenarios || []}
            categoryName={activeCategory?.name || ''}
          />
        ) : (
          <>
            <div style={styles.controlBar}>
              <AttackPanel
                scenarios={activeCategory?.scenarios || []}
                categoryName={activeCategory?.name || 'Attack Scenarios'}
                onLaunch={handleLaunch}
                isRunning={isRunning}
                onStop={handleStop}
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
    background: '#000000',
  },
  ambientLeft: {
    position: 'fixed',
    top: '10%',
    left: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 255, 65, 0.04) 0%, transparent 70%)',
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
    background: 'radial-gradient(circle, rgba(0, 179, 44, 0.03) 0%, transparent 70%)',
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
