import React from 'react';
import { NAV_ITEMS } from '../../config/constants';
import { Icon } from '../Common/Icons';
import { getInitials } from '../Common/Utils';

const Sidebar = ({ activeTab, onTabChange, onLogout, username, userRole, userFullname, onShowChangePw }) => {
  const displayName = userFullname || username || 'Người dùng';
  const initials = getInitials(displayName);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/icon.png" alt="" onError={(e) => (e.target.style.display = 'none')} />
        <div className="sidebar-logo-text">
          <h1>URL Shortener</h1>
          <p>Enactus FTU Hanoi</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Sidebar</div>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => onTabChange(item.key)}
            href="#"
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </a>
        ))}
        <div className="nav-spacer" />
        <div className="nav-section-label">Account</div>
        <a
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onTabChange('profile')}
          href="#"
        >
          <Icon name="user" size={17} /> Profile
        </a>
        {(userRole === 'Admin' || userRole === 'SuperAdmin') && (
          <a className="nav-item" onClick={() => onTabChange('analytics')} href="#">
            <Icon name="analytics" size={17} /> Analytics & Logs
          </a>
        )}
        {userRole === 'SuperAdmin' && (
          <a className="nav-item" onClick={() => onTabChange('admin')} href="#">
            <Icon name="settings" size={17} /> Administration
          </a>
        )}
        <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); onShowChangePw(); }}>
          <Icon name="key" size={17} /> Change Password
        </a>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={onLogout}>
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <p>{displayName}</p>
            <span>{userRole} · Click to logout</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
