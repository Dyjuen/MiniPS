import React, { useRef } from 'react';
import { useAppState } from '../hooks/useAppState';

export default function MenuBar() {
  const { 
    handleLoadImage, 
    handleReset, 
    currentImage, 
    setActiveTab, 
    activeTab,
    history,
    historyIndex,
    setHistoryIndex,
    setCurrentImage,
    addToast
  } = useAppState();

  const fileInputRef = useRef(null);

  const menuData = [
    {
      label: 'File',
      items: [
        { label: 'Open', action: () => fileInputRef.current.click() },
        { label: 'Save', action: () => {
          if (!currentImage) return addToast('No image to save', 'error');
          const link = document.createElement('a');
          link.href = currentImage;
          link.download = 'image.png';
          link.click();
        }},
        { label: 'Reset', action: handleReset },
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', action: () => {
          if (historyIndex > 0) {
            const idx = historyIndex - 1;
            setHistoryIndex(idx);
            setCurrentImage(history[idx]);
          }
        }},
        { label: 'Redo', action: () => {
          if (historyIndex < history.length - 1) {
            const idx = historyIndex + 1;
            setHistoryIndex(idx);
            setCurrentImage(history[idx]);
          }
        }},
      ]
    },
    { label: 'Filter', action: () => setActiveTab('Enhance') },
    { label: 'Transform', action: () => setActiveTab('Enhance') }, // Shared for now
    { label: 'Color', action: () => setActiveTab('Restore') },
    { label: 'Segment', action: () => setActiveTab('Edge') },
    { label: 'Compress', action: () => setActiveTab('More') },
  ];

  return (
    <nav className="menu-bar">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={(e) => e.target.files[0] && handleLoadImage(e.target.files[0])}
      />
      <ul className="menu-list">
        {menuData.map((menu, i) => (
          <li 
            key={i} 
            className={`menu-item ${activeTab === menu.label ? 'active' : ''}`}
            onClick={menu.action}
          >
            {menu.label}
            {menu.items && (
              <ul className="dropdown-menu">
                {menu.items.map((item, j) => (
                  <li key={j} className="dropdown-item" onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                  }}>
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
