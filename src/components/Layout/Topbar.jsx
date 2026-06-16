import React from 'react';
import { TAB_TITLES, YOUR_DOMAIN } from '../../config/constants';

const Topbar = ({ activeTab }) => {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="topbar-title">{TAB_TITLES[activeTab]}</div>
      <div className="topbar-meta">
        <div className="topbar-badge">
          <span className="dot" />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{YOUR_DOMAIN}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{today}</div>
      </div>
    </header>
  );
};

export default Topbar;
