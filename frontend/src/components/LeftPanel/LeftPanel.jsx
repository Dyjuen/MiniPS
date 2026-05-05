import React from 'react';
import { useAppState } from '../../hooks/useAppState';
import EnhanceTab from './tabs/EnhanceTab';
import RestoreTab from './tabs/RestoreTab';
import EdgeTab from './tabs/EdgeTab';
import MoreTab from './tabs/MoreTab';

export default function LeftPanel() {
  const { activeTab, setActiveTab } = useAppState();

  const tabs = ['Enhance', 'Restore', 'Edge', 'More'];

  const handleTabChange = (newTab) => {
    if (activeTab === newTab) return;
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
