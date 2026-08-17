import React, { useState } from 'react';
import { Menu, X, Camera, CalendarDays, Settings } from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ isOpen, onClose, onNavigateHome, onNavigateHistory }) => {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-placeholder">
            <img src="/logo-petroaseo.png" alt="Petroaseo" style={{ height: '32px' }} />
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} color="var(--text-primary)" />
          </button>
        </div>
        
        <div className="sidebar-content">
          <button className="sidebar-action-btn" onClick={onNavigateHome}>
            <Camera size={20} /> Registrar Fotos
          </button>
          
          <ul className="sidebar-nav">
            <li className="sidebar-nav-item" onClick={onNavigateHistory} style={{ cursor: 'pointer' }}>
              <CalendarDays size={20} /> Historial de Días
            </li>
            <li className="sidebar-nav-item" style={{ cursor: 'pointer' }}>
              <Settings size={20} /> Configuración
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
