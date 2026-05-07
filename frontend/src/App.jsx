import React from 'react';
import { AppProvider, useAppState } from './hooks/useAppState';
import MenuBar from './components/MenuBar';
import Toolbar from './components/Toolbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import Canvas from './components/Canvas';
import RightPanel from './components/RightPanel/RightPanel';
import StatusBar from './components/StatusBar';
import ExportModal from './components/ExportModal';

function AppContent() {
  const { toasts } = useAppState();

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
