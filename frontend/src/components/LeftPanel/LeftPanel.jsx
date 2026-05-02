import React, { useState } from 'react';
import EnhanceTab from './tabs/EnhanceTab';
import RestoreTab from './tabs/RestoreTab';
import EdgeTab from './tabs/EdgeTab';
import MoreTab from './tabs/MoreTab';

export default function LeftPanel() {
  const [activeTab, setActiveTab] = useState('Enhance');

  const tabs = ['Enhance', 'Restore', 'Edge', 'More'];

  return (
    <div className="left-panel">
      <div className="tabs-header">
        {tabs.map(tab => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
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
