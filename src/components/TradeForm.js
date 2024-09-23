import React, { useState } from 'react';
import axios from 'axios';  // Ensure axios is imported
import { ethers } from 'ethers';  // Ensure ethers.js is imported
import { contractABI, contractAddress } from '../abi';  // Ensure ABI and contract address are imported

function TradeForm() {
  const [symbol, setSymbol] = useState('eth/usdt');  // Symbol input state
  const [quantity, setQuantity] = useState(0.1);  // Quantity input state
  const [status, setStatus] = useState('');  // Status message

  const handleTrade = async () => {
    try {
      // Detect MetaMask and prompt user to install if not available
      if (typeof window.ethereum === 'undefined') {
        return setStatus('Please install MetaMask!');
      }

      // Requesting accounts from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Set up ethers.js provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Execute the trade on the smart contract
      const tx = await contract.executeTrade(ethers.parseUnits(quantity.toString(), 'ether'));
      await tx.wait();

      setStatus(`Trade executed: ${tx.hash}`);

      // Send data to backend for logging
      const response = await axios.post('http://localhost:5000/trade', { symbol, quantity });
      setStatus(`Trade logged on backend: ${response.data.status}`);
    } catch (error) {
      // Handle MetaMask connection errors
      if (error.code === 4001) {
        setStatus('User rejected the connection request');
      } else {
        console.error(error);
        setStatus(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <h1>AI Trading Bot</h1>
      <form>
        <div>
          <label>Symbol: </label>
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        </div>
        <div>
          <label>Quantity: </label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <button type="button" onClick={handleTrade}>Execute Trade</button>
      </form>
      <p>{status}</p>
    </div>
  );
}

export default TradeForm;
