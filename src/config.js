const sjs = require('syscoinjs-lib');

const MAINNET_CONFIG = {
  ChainId: 57,
  ChainName: "Syscoin Mainnet",
  SysNetwork: sjs.utils.syscoinNetworks.mainnet,
};

const TESTNET_CONFIG = {
  ChainId: 5700,
  ChainName: "Syscoin Testnet",
  SysNetwork: sjs.utils.syscoinNetworks.testnet,
};

/**
 * Returns the appropriate configuration object based on the network choice.
 * This function is called from PaliTest.js to get the settings dynamically.
 * @param {boolean} useTestnet - If true, returns the testnet config. Otherwise, returns the mainnet config.
 * @returns {object} The selected configuration object.
 */
export const getConfiguration = (useTestnet) => {
  return useTestnet ? TESTNET_CONFIG : MAINNET_CONFIG;
};
