import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function MainButton({ label, onClick, disabled = false }) {
  const tooltips = [
    '⛏️ En construction par un castor motivé...',
    '🐿️ Ça ronge doucement, mais sûrement.',
    '🏛️ Rome ne s’est pas construite en un jour (et le barrage non plus).',
    '🌐 Le castor a son réseau... que le réseau n’a pas encore ! (C.NOLAN)',
  ];

  const [tooltip, setTooltip] = useState('');

  const handleMouseEnter = () => {
    if (disabled) {
      const newTooltip = tooltips[Math.floor(Math.random() * tooltips.length)];
      setTooltip(newTooltip);
    }
  };

  return (
    <div
      className="button-wrapper"
      title={disabled ? tooltip : undefined}
      onMouseEnter={handleMouseEnter}
    >
      <button
        className={`button ${disabled ? 'disabled' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
    </div>
  );
}

// Validation conditionnelle du prop onClick
MainButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: (props, propName, componentName) => {
    if (!props.disabled && typeof props[propName] !== 'function') {
      return new Error(
        `The prop \`${propName}\` is required in \`${componentName}\` when the button is not disabled.`
      );
    }
    // Pas d’erreur si disabled = true même si onClick absent
    return null;
  },
  disabled: PropTypes.bool,
};
