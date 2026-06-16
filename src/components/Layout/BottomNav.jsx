import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../../config/constants';
import { Icon } from '../Common/Icons';

const BottomNav = ({ activeTab, onTabChange, userRole }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) return null;

  const mobileItems = [
    ...NAV_ITEMS,
    ...(userRole === 'Admin' || userRole === 'SuperAdmin'
      ? [{ key: 'analytics', label: 'Analytics', icon: 'analytics' }]
      : []),
    ...(userRole === 'SuperAdmin' ? [{ key: 'admin', label: 'Admin', icon: 'settings' }] : []),
    { key: 'profile', label: 'Profile', icon: 'user' },
  ];

  return (
    <div className="bottom-nav">
      {mobileItems.map((item) => (
        <div
          key={item.key}
          className={`bottom-nav-item ${activeTab === item.key ? 'active' : ''}`}
          onClick={() => onTabChange(item.key)}
          style={{ cursor: 'pointer' }}
        >
          <Icon name={item.icon} size={18} />
          <span style={{ fontSize: '10px' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BottomNav;
