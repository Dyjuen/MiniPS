import React from 'react';
import { useAppState } from '../../hooks/useAppState';
import EnhanceTab from './tabs/EnhanceTab';
import RestoreTab from './tabs/RestoreTab';
import EdgeTab from './tabs/EdgeTab';
import { SlidersHorizontal, Wand2, Scan } from 'lucide-react';

export default function LeftPanel() {
  const { activeTab, setActiveTab } = useAppState();

  const tabs = [
    { label: 'Enhance', icon: <SlidersHorizontal size={13} /> },
    { label: 'Restore', icon: <Wand2 size={13} /> },
    { label: 'Edge', icon: <Scan size={13} /> }
  ];

  const handleTabChange = (newTab) => {
    if (activeTab === newTab) return;
    setActiveTab(newTab);
  };

  return (
    <div className="left-panel">
      <div className="tabs-header" style={{ 
        display: 'flex', 
        width: '100%', 
        borderBottom: '1px solid rgba(255,255,255,0.1)' 
      }}>
        {tabs.map(tab => (
          <button 
            key={tab.label}
            className={`tab-btn ${activeTab === tab.label ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.label)}
            style={{ 
              flex: 1,
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '5px',
              padding: '8px 0',
              fontSize: '12px',
              textAlign: 'center',
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab.label ? '2px solid #378ADD' : '2px solid transparent',
              transition: 'border-color 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {activeTab === 'Enhance' && <EnhanceTab />}
        {activeTab === 'Restore' && <RestoreTab />}
        {activeTab === 'Edge' && <EdgeTab />}
      </div>
    </div>
  );
}
