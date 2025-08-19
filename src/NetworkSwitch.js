import React from 'react';
import './NetworkSwitch.css';

const NetworkSwitch = ({ useTestnet, onToggle }) => {
  const containerClass = `network-switch-container ${useTestnet ? 'testnet-active' : 'mainnet-active'}`;

  return (
    <div className={containerClass}>
      <span className={`network-label ${!useTestnet ? 'active' : ''}`}>Mainnet</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={useTestnet}
          onChange={onToggle}
          aria-label="Toggle between Mainnet and Testnet"
        />
        <span className="slider round"></span>
      </label>
      <span className={`network-label ${useTestnet ? 'active' : ''}`}>Testnet</span>
    </div>
  );
};

export default NetworkSwitch;