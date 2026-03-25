import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled = false, icon: Icon }) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${disabled ? 'disabled' : ''}`}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 20} />}
      {children}
    </button>
  );
};

export default Button;
