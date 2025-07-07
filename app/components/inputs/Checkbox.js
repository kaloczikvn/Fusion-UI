import React, { useState } from 'react';

const CustomCheckbox = ({ label, checked, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        margin: '5px'
      }}
      onClick={() => onChange(!checked)}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          border: '1px solid rgba(255,255,255,0.4)',
          marginRight: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent'
        }}
      >
        {checked && (
          <svg width="20px" height="20px" viewBox="0 0 24 24" role="img"
               xmlns="http://www.w3.org/2000/svg"
               stroke="#e14d43"
               fill="none" color="#e14d43">
            <polyline points="4 13 9 18 20 7" />
          </svg>
        )}
      </div>
      <span>{label}</span>
    </div>
  );
};

// Export the component
export default CustomCheckbox;