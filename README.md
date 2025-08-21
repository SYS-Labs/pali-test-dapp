# Pali Wallet Test DApp

This repository presents a concise yet complete React example that shows **how to integrate a Decentralized Application with Pali Wallet on the Syscoin network**. Within a few well-commented files you can learn to detect the wallet provider, establish a reliable connection, track network state, and respond to user-initiated changes—all without excess boiler-plate code.

---

## Core Features Demonstrated

* **Wallet detection** – A polling routine looks for `window.pali`, guaranteeing the DApp never accesses the provider before the extension is ready.
* **State tracking** – Real-time indicators include lock status, wallet mode (UTXO / EVM), active account, current chain ID, and whether the user is already on the intended Syscoin network.
* **Connection and network switching** – The sample invokes `sys_requestAccounts` to request access and uses Syscoin-specific RPC methods (`sys_changeUTXOEVM`, `sys_switchChain`) to guide the user onto the correct UTXO chain.
* **Account switching** – A dedicated button calls `wallet_changeAccount`, allowing users to easily switch between their available accounts within Pali.
* **Event handling** – Listeners for `chainChanged`, `accountsChanged`, `isBitcoinBased`, and `unlockStateChanged` are registered and cleaned up in a carefully ordered `useEffect` to avoid race conditions.
* **Dynamic network configuration** – A UI toggle allows switching between Mainnet and Testnet. The user's choice is persisted in `localStorage`, while the `.env` file sets the initial default.
* **Modern React tooling** – Create React App is extended with **CRACO** to restore Node-style polyfills (`buffer`, `stream`) expected by many web3 libraries.

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v20 or newer)
* [npm](https://www.npmjs.com/)
* The **[Pali Wallet](https://paliwallet.com/)** browser extension (Chrome, Brave)

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/SYS-Labs/pali-test-dapp.git
   cd pali-test-dapp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure your environment**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and set

   ```text
   # Syscoin Testnet
   REACT_APP_USE_TESTNET=true
   # — or —
   # Syscoin Mainnet
   REACT_APP_USE_TESTNET=false
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

   The console will display a URL—usually `http://localhost:3000`—which you can open manually in your browser.

---

## Key Implementation Concepts

### 1 · Wallet Detection

`App.js` polls for `window.pali` every 500 ms until found, preventing “provider undefined” errors on slow extension loads.

### 2 · State Management

React hooks coordinate state:

* `useState` tracks account, chain ID, and loading flags.
* `useContext` (via `AppContext`) shares high-level detection status without prop drilling.
* `useRef` preserves a stable provider reference across renders.

### 3 · Event Handling

`PaliTest.js` attaches listeners for wallet events. Because certain events may not fire consistently, the helper `checkState` refreshes the UI after critical actions, ensuring accuracy even when the extension is silent.

### 4 · Network & Account Switching

The `handleConnectAndSwitch` function contains logic to intelligently guide the user. It checks if the wallet is already on a UTXO-based chain and calls the appropriate RPC method (`sys_switchChain` or `sys_changeUTXOEVM`) to switch to the target network. A separate `handleSwitchAccount` function calls `wallet_changeAccount` to open Pali's account selection dialog.

---

## Troubleshooting

* **“Buffer is not defined” or similar errors** – Confirm you are starting the app with CRACO (`npm start`), not plain `react-scripts`. Re-install dependencies if polyfills appear to be missing.

---

With this template as a guide, you can adapt the same patterns to your own Syscoin DApp while retaining clear, maintainable code and an approachable developer experience.