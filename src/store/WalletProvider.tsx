'use client';

// src/store/WalletProvider.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SuiClient, getFullnodeUrl, SuiHTTPTransport
} from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Wallet context type definitions
interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: bigint | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  executeTransaction: (txb: TransactionBlock) => Promise<string>;
  isConnecting: boolean;
  error: string | null;
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  connected: false,
  address: null,
  balance: null,
  connect: async () => {},
  disconnect: () => {},
  executeTransaction: async () => { return ''; },
  isConnecting: false,
  error: null
});

// Hook for using the wallet context
export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [suiClient, setSuiClient] = useState<SuiClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keypair, setKeypair] = useState<Ed25519Keypair | null>(null);

  // Initialize SUI client
  useEffect(() => {
    const transport = new SuiHTTPTransport({
      url: getFullnodeUrl('testnet'),
    });
    
    const client = new SuiClient({ transport });
    setSuiClient(client);
    
    // Check for saved wallet in localStorage
    const savedWallet = localStorage.getItem('degenDClashWallet');
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        const restoredKeypair = Ed25519Keypair.fromSecretKey(
          new Uint8Array(walletData.secretKey)
        );
        setKeypair(restoredKeypair);
        setAddress(walletData.address);
        setConnected(true);
      } catch (e) {
        console.error('Failed to restore wallet:', e);
        localStorage.removeItem('degenDClashWallet');
      }
    }
  }, []);

  // Update balance when address changes
  useEffect(() => {
    if (suiClient && address) {
      fetchBalance();
    }
  }, [suiClient, address]);

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!suiClient || !address) return;
    
    try {
      const balanceResponse = await suiClient.getBalance({
        owner: address,
      });
      
      setBalance(BigInt(balanceResponse.totalBalance));
    } catch (e) {
      console.error('Failed to fetch balance:', e);
      setError('Failed to fetch balance');
    }
  };

  // Connect wallet
  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // For demo purposes, generate a new keypair
      // In production, this would integrate with wallet extensions
      const newKeypair = new Ed25519Keypair();
      const newAddress = newKeypair.getPublicKey().toSuiAddress();
      
      // Save wallet to localStorage
      localStorage.setItem('degenDClashWallet', JSON.stringify({
        address: newAddress,
        secretKey: Array.from(newKeypair.export().privateKey)
      }));
      
      setKeypair(newKeypair);
      setAddress(newAddress);
      setConnected(true);
    } catch (e) {
      console.error('Wallet connection failed:', e);
      setError('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    localStorage.removeItem('degenDClashWallet');
    setKeypair(null);
    setAddress(null);
    setConnected(false);
    setBalance(null);
  };

  // Execute a transaction
  const executeTransaction = async (txb: TransactionBlock): Promise<string> => {
    if (!suiClient || !keypair || !address) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Sign and execute transaction
      txb.setSender(address);
      
      const signedTx = await txb.sign({
        client: suiClient,
        signer: keypair
      });
      
      const response = await suiClient.executeTransactionBlock({
        transactionBlock: signedTx.bytes,
        signature: signedTx.signature,
        options: {
          showEffects: true,
          showEvents: true
        }
      });
      
      return response.digest;
    } catch (e) {
      console.error('Transaction failed:', e);
      throw e;
    }
  };

  const value = {
    connected,
    address,
    balance,
    connect,
    disconnect,
    executeTransaction,
    isConnecting,
    error
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};