import React, { useState, useEffect } from 'react';
import AppContext from './AppContext';
import PaliTest from './PaliTest';
import './App.css';

function App() {
  // State to track if Pali wallet is detected. Initialize by checking window.pali.
  const [paliDetected, setPaliDetected] = useState(typeof window.pali !== 'undefined');

  // This useEffect hook replicates the polling logic from SysethereumDApp.js
  // It checks for window.pali periodically if it wasn't found initially.
  useEffect(() => {
    if (paliDetected) return; // If already detected, do nothing.

    const paliCheckIntervalId = setInterval(() => {
      if (window.pali) {
        console.log('Pali wallet detected after polling.');
        setPaliDetected(true);
        clearInterval(paliCheckIntervalId);
      }
    }, 500); // Check every 500ms

    // Cleanup: clear the interval when the component unmounts.
    return () => clearInterval(paliCheckIntervalId);
  }, [paliDetected]); // This effect re-runs only if paliDetected changes.


  return (
    // Provide the necessary context values to the PaliTest component.
    // paliTestDisplay is hardcoded to `true` as the component is always visible.
    <AppContext.Provider value={{ paliDetected, paliTestDisplay: true }}>
      <div className="App">
        <header className="App-header">
          <h1>Pali Test DApp</h1>
        </header>
        <main>
          <PaliTest />
        </main>
      </div>
    </AppContext.Provider>
  );
}

export default App;