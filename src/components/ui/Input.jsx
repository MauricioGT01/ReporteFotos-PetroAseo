import React from 'react';
import './Input.css';

export const Input = ({ label, icon: Icon, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">
        {Icon && <Icon size={16} className="input-icon-label" />}
        {label}
      </label>}
      <div className="input-wrapper">
        <input className="input-field" {...props} />
      </div>
    </div>
  );
};
