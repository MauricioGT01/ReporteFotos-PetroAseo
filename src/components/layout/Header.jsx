import React from 'react';
import { Menu } from 'lucide-react';
import './Header.css';

export const Header = ({ onMenuClick }) => {
  return (
    <header className="main-header">
      <button className="menu-btn" onClick={onMenuClick}>
        <Menu size={24} color="var(--text-primary)" />
      </button>
      <div className="logo-container">
        <div className="logo-placeholder">
          <img src="/logo-petroaseo.png" alt="Petroaseo" style={{ height: '32px' }} />
        </div>
      </div>
    </header>
  );
};
