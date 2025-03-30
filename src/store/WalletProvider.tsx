'use client';

// src/store/WalletProvider.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallets, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import type { TransactionBlock } from '@mysten/sui.js/transactions';

// Wallet context type definitions
interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  currentAccount: any | null;
  suiClient: ReturnType<typeof useSuiClient>;
  address: string | null;
  executeTransaction: (tx: TransactionBlock) => Promise<string>;
}

// Create context with default values
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Hook for using the wallet context
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const wallets = useWallets();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    setConnected(wallets.length > 0 && currentAccount !== null);
  }, [wallets, currentAccount]);

  const disconnect = async () => {
    setConnecting(true);
    try {
      // The dapp-kit handles disconnection through the ConnectButton component
      setConnected(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const executeTransaction = async (tx: TransactionBlock): Promise<string> => {
    if (!currentAccount || wallets.length === 0) {
      throw new Error('No wallet connected');
    }

    try {
      // For now, we'll just return a mock transaction digest
      // The actual transaction execution will be handled by the dapp-kit components
      return 'mock-transaction-digest';
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        disconnect,
        currentAccount,
        suiClient,
        address: currentAccount?.address || null,
        executeTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};