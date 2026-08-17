import React from 'react';
import './Input.css'; // Reusing some input styles

export const Select = ({ label, icon: Icon, options, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">
        {Icon && <Icon size={16} className="input-icon-label" />}
        {label}
      </label>}
      <div className="input-wrapper">
        <select className="input-field select-field" {...props}>
          <option value="" disabled>Selecciona un contrato...</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
