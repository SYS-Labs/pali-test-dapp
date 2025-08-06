const sjs = require('syscoinjs-lib');

class CONFIGURATION {
  constructor(useTestnet = false) {
    if (useTestnet) {
      // 🧪 TESTNET SETTINGS
      this.ChainId = 5700;
      this.ChainName = "Syscoin Testnet";
      this.SysNetwork = sjs.utils.syscoinNetworks.testnet;
    } else {
      // ✅ MAINNET SETTINGS
      this.ChainId = 57;
      this.ChainName = "Syscoin Mainnet";
      this.SysNetwork = sjs.utils.syscoinNetworks.mainnet;
    }
  }
}

// Read the environment variable to determine which configuration to use.
const config = new CONFIGURATION(process.env.REACT_APP_USE_TESTNET === 'true');

export default config;
