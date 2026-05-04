import React from 'react';
import { useAppState } from '../../hooks/useAppState';
import EnhanceTab from './tabs/EnhanceTab';
import RestoreTab from './tabs/RestoreTab';
import EdgeTab from './tabs/EdgeTab';
import MoreTab from './tabs/MoreTab';

export default function LeftPanel() {
  const { activeTab, setActiveTab, currentImage, sessionBase, setSessionBase, setCurrentImage } = useAppState();

  const tabs = ['Enhance', 'Restore', 'Edge', 'More'];

  const handleTabChange = (newTab) => {
    if (activeTab === newTab) return;

    // Check if dirty (currentImage different from sessionBase)
    if (sessionBase && currentImage !== sessionBase) {
      const confirmDiscard = window.confirm(
        'You have unapplied changes in the current tab. Do you want to discard them and switch?'
      );
      if (!confirmDiscard) return; // Block transition

      // If switching, revert to sessionBase first
      setCurrentImage(sessionBase);
    }

    // Reset sessionBase for the new tab
    setSessionBase(null); 
    setActiveTab(newTab);
  };

  return (
    <div className="left-panel">
      <div className="tabs-header">
        {tabs.map(tab => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {activeTab === 'Enhance' && <EnhanceTab />}
        {activeTab === 'Restore' && <RestoreTab />}
        {activeTab === 'Edge' && <EdgeTab />}
        {activeTab === 'More' && <MoreTab />}
      </div>
    </div>
  );
}
