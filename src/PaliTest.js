import React, { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import AppContext from './AppContext';
import { getConfiguration } from "./config";

const PaliTest = () => {
  const { paliTestDisplay, paliDetected, useTestnet } = useContext(AppContext);

  const CONFIGURATION = useMemo(() => getConfiguration(useTestnet), [useTestnet]);

  const [paliAccount, setPaliAccount] = useState(null);
  const [paliChainId, setPaliChainId] = useState(null);
  const [paliNetworkOk, setPaliNetworkOk] = useState(false);
  const [paliIsBitcoinBased, setPaliIsBitcoinBased] = useState(false);
  const [paliIsLoading, setPaliIsLoading] = useState(false); // Single loading state
  const [paliIsUnlocked, setPaliIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  const paliProviderRef = useRef(null);

  const handleChainChanged = useCallback(async (chainIdHex) => {
    const pali = paliProviderRef.current;
    if (!pali) return;

    setTimeout(() => { // <-- IMPORTANT! This delay ensures that the state gets fully updated
      if (chainIdHex) {
        const currentChainIdNum = parseInt(chainIdHex, 16);
        setPaliChainId(currentChainIdNum);

        try {
          const networkOk = (currentChainIdNum === CONFIGURATION.ChainId) && pali.isBitcoinBased();
          setPaliNetworkOk(networkOk);
          console.log(`[CHAIN CHANGED] Wallet Chain ID: ${currentChainIdNum}, Target Chain ID: ${CONFIGURATION.ChainId}. Network OK: ${networkOk}`);

          if (!networkOk) {
            setError(`Incorrect UTXO Network. Please switch to ${CONFIGURATION.ChainName}.`);
          } else {
            // If the network is now OK, clear a previous network error.
            setError(prev => prev.includes('Incorrect UTXO Network') ? '' : prev);
          }
        } catch (e) {
          setPaliNetworkOk(false);
          setError('Received invalid Chain ID format from Pali.');
        }
      } else {
        setPaliChainId(null);
        setPaliNetworkOk(false);
      }
    }, 100);
  }, [CONFIGURATION.ChainId, CONFIGURATION.ChainName]);

  const handleIsBitcoinBased = useCallback(async (isBitcoinBased) => {
    console.log("Pali 'handleIsBitcoinBased' event received:", isBitcoinBased);
    setPaliIsBitcoinBased(isBitcoinBased);
  }, []);

  const handleLockStateChanged = useCallback(async (data, isUnlocked) => {
    console.log("Pali 'handleLockStateChanged' event received:", [data, isUnlocked]);
    const pali = paliProviderRef.current;

    if (pali.isBitcoinBased()) {
      const xpub = data;
    } else {
      const accounts = data;
    }

    setPaliIsUnlocked(isUnlocked);
  }, []);

  const handleAccountsChanged = useCallback(async (accounts) => {
    console.log("Pali 'accountsChanged' event received:", accounts);

    const account = Array.isArray(accounts) ? accounts[0] : (accounts?.address || accounts);

    if (account) {
      setPaliAccount(account);
      setError(''); // Clear errors on successful account change
    }
  }, []);

  const checkState = useCallback(async (pali) => {
    if (!pali) return;
    try {
      const isBitcoin = pali.isBitcoinBased();
      handleIsBitcoinBased(isBitcoin);

      const method = isBitcoin ? "sys_requestAccounts" : "eth_requestAccounts";
      const currentAccounts = await pali.request({ method });
      handleAccountsChanged(currentAccounts);

      handleLockStateChanged(null, await pali.isUnlocked());

      handleIsBitcoinBased(pali.isBitcoinBased());

      const currentNetwork = await pali.request({ method: 'wallet_getNetwork' });
      setPaliChainId(currentNetwork.chainId);
      const chainId = '0x' + currentNetwork.chainId.toString(16);
      handleChainChanged(chainId);
    } catch (err) {
      console.error("Error during checkState, user may have disconnected or locked.", err);
      handleChainChanged(null);
      setPaliAccount(null);
      setPaliIsUnlocked(null);
    }
  }, [handleLockStateChanged, handleChainChanged, handleIsBitcoinBased, handleAccountsChanged]);

  useEffect(() => {
    if (!paliTestDisplay || !paliDetected) {
      setError('');
      setPaliAccount(null);
      setPaliChainId(null);
      setPaliNetworkOk(false);
      setPaliIsUnlocked(null);
      paliProviderRef.current = null;
      return;
    }

    const pali = window.pali;
    if (!pali) {
      setError('Pali detection inconsistency. Please refresh.');
      return;
    }

    console.log('PaliTest: Attaching listeners.');
    paliProviderRef.current = pali;
    checkState(pali);

    pali.on('chainChanged', handleChainChanged);
    // BUG: These events never get triggered
    pali.on('isBitcoinBased', handleIsBitcoinBased);
    pali.on('accountsChanged', handleAccountsChanged);
    pali.on('unlockStateChanged', handleLockStateChanged);

    return () => {
      if (pali?.removeListener) {
        console.log('PaliTest: Removing listeners.');
        pali.removeListener('unlockStateChanged', handleLockStateChanged);
        pali.removeListener('accountsChanged', handleAccountsChanged);
        pali.removeListener('isBitcoinBased', handleIsBitcoinBased);
        pali.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [paliTestDisplay, paliDetected, checkState, handleAccountsChanged, handleChainChanged, handleIsBitcoinBased, handleLockStateChanged, CONFIGURATION]);

  // --- USER ACTIONS ---

  const handleConnectAndSwitch = useCallback(async () => {
    const pali = paliProviderRef.current;
    if (!pali) return;

    setPaliIsLoading(true);
    setError('');

    try {
      if (pali.isBitcoinBased() !== true) {
        await pali.request({
          method: "sys_changeUTXOEVM",
          params: [{ chainId: CONFIGURATION.ChainId }],
        });
      } else {
        console.log(`The user should switch across UTXO networks manually`);
      }

    } catch (err) {
      console.warn("sys_changeUTXOEVM failed, falling back to sys_requestAccounts.", err);
      try {
        await pali.request({ method: 'sys_requestAccounts' });
      } catch (finalErr) {
        console.error("Connection request failed:", finalErr);
        setError(finalErr.message || "User rejected the connection request.");
      }
    } finally {
      // Re-check state after any action to ensure UI is up-to-date.
      checkState(pali);
      setPaliIsLoading(false);
    }
  }, [checkState, CONFIGURATION.ChainId]);

  const handleSwitchAccount = useCallback(async () => {
    const pali = paliProviderRef.current;
    if (!pali) return;

    setPaliIsLoading(true);
    setError('');

    try {
      await pali.request({
        method: "wallet_changeAccount", // Switch accounts
      });
      checkState(pali);
    } catch (err) {
      console.log(err);
    } finally {
      setPaliIsLoading(false);
    }
  }, [checkState]);

  // --- RENDER LOGIC ---
  return (
    <div className="pali-test-step">
      {/* Status Display Card */}
      <div className="status-card">

        <div className="pali-status-row">
          <span className="pali-status-label">Detected:</span>
          <span className="pali-status-value">
            {paliDetected ? <span className="text-success">Yes</span> : <span className="text-danger">No</span>}
          </span>
        </div>

        {paliDetected && (
          <>
            <div className="pali-status-row">
              <span className="pali-status-label">Locked:</span>
              <span className="pali-status-value pali-account-value">
                {paliIsUnlocked ? (
                  <span className="text-success">No</span>
                ) : (
                  <span className="text-danger">Yes</span>
                )}
              </span>
            </div>

            <div className="pali-status-row">
              <span className="pali-status-label">Type:</span>
              <span className="pali-status-value pali-account-value">
                {paliIsBitcoinBased ? (
                  <span className="text-success">UTXO</span>
                ) : (
                  <span className="text-danger">EVM</span>
                )}
              </span>
            </div>

            <div className="pali-status-row">
              <span className="pali-status-label">Account:</span>
              <span className="pali-status-value pali-account-value">
                {paliAccount || <span className="text-muted">Not Connected</span>}
              </span>
            </div>

            <div className="pali-status-row">
              <span className="pali-status-label">Chain ID:</span>
              <span className="pali-status-value">
                {paliChainId === null ? (
                  <span className="text-muted">Unknown</span>
                ) : (
                  paliChainId
                )}
              </span>
            </div>

            <div className="pali-status-row">
              <span className="pali-status-label">Network OK <small className="text-muted">(Target: {CONFIGURATION.ChainName})</small>:</span>
              <span className="pali-status-value">
                {!paliAccount ? (
                  <span className="text-muted">Unknown</span>
                ) : paliNetworkOk ? (
                  <span className="text-success">Yes</span>
                ) : (
                  <span className="text-danger">No</span>
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Action Buttons Area */}
      <div className="action-area">
          {paliDetected && !paliAccount && (
            <button onClick={handleConnectAndSwitch} disabled={paliIsLoading} type="button" className="action-button btn-primary">
              {paliIsLoading ? "Connecting..." : "Unlock & Connect Pali"}
            </button>
          )}

          {paliDetected && paliAccount && !paliIsBitcoinBased && !paliNetworkOk && (
            <button onClick={handleConnectAndSwitch} disabled={paliIsLoading} type="button" className="action-button btn-warning">
              {paliIsLoading ? "Switching..." : `Switch to ${CONFIGURATION.ChainName}`}
            </button>
          )}

          {paliDetected && paliAccount && (
            <button onClick={handleSwitchAccount} disabled={paliIsLoading} type="button" className="action-button btn-warning">
              {paliIsLoading ? "Switching..." : `Switch accounts`}
            </button>
          )}
      </div>
    </div>
  );
}

export default PaliTest;