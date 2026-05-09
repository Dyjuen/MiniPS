import React, { useEffect } from 'react';
import { AppProvider, useAppState } from './hooks/useAppState';
import MenuBar from './components/MenuBar';
import Toolbar from './components/Toolbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import Canvas from './components/Canvas';
import RightPanel from './components/RightPanel/RightPanel';
import StatusBar from './components/StatusBar';
import ExportModal from './components/ExportModal';

function AppContent() {
  const { toasts, undo, redo } = useAppState();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isZ = e.key.toLowerCase() === 'z';
      const isY = e.key.toLowerCase() === 'y';

      if (e.ctrlKey || e.metaKey) {
        if (isZ) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (isY) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="app-container">
      <ExportModal />
      <MenuBar />
      <Toolbar />
      <div className="main-content">
        <LeftPanel />
        <Canvas />
        <RightPanel />
      </div>
      <StatusBar />
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
