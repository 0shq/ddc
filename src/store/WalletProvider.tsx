"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useWallets, useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Storage } from "@/src/lib/storage";

// Wallet context type definitions
interface WalletContextType {
  connected: boolean;
  address: string | null;
  connecting: boolean;
  error: string | null;
  disconnect: () => Promise<void>;
  executeTransaction: (tx: Transaction) => Promise<string>;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  address: null,
  connecting: false,
  error: null,
  disconnect: async () => {},
  executeTransaction: async () => "",
});

export const useWalletContext = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const wallets = useWallets();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize connection state from localStorage on mount
  useEffect(() => {
    const connectionInfo = localStorage.getItem(
      "sui-dapp-kit:wallet-connection-info"
    );
    if (connectionInfo) {
      try {
        const { lastConnectedWalletName } = JSON.parse(connectionInfo);
        if (lastConnectedWalletName) {
          setConnected(true);
        }
      } catch (error) {
        console.error("Error parsing wallet connection info:", error);
      }
    }
  }, []);

  // Handle connection state changes
  useEffect(() => {
    const isConnected = Boolean(currentAccount);
    setConnected(isConnected);

    if (isConnected && currentAccount?.address) {
      // Save our app's data when connected
      Storage.saveWalletAddress(currentAccount.address);

      // Load saved NFT and game state if available
      const savedNFT = Storage.getSelectedNFT();
      if (savedNFT) {
        // NFTProvider will handle this through its own useEffect
      }

      const savedBattleHistory = Storage.getBattleHistory();
      if (savedBattleHistory) {
        // GameProvider will handle this through its own useEffect
      }
    }
  }, [currentAccount]);

  const disconnect = async () => {
    setConnecting(true);
    try {
      // Clear our app's data
      Storage.clearSelectedNFT();
      Storage.saveBattleHistory([]);
      Storage.saveUserStats({ wins: 0, losses: 0, totalBattles: 0 });
      Storage.saveWalletAddress("");

      // Let dapp-kit handle the actual wallet disconnection
      setConnected(false);

      // Clear dapp-kit's connection info
      localStorage.removeItem("sui-dapp-kit:wallet-connection-info");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    } finally {
      setConnecting(false);
    }
  };

  const executeTransaction = async (tx: Transaction): Promise<string> => {
    if (!currentAccount) {
      throw new Error("No wallet connected");
    }

    try {
      // Find the currently active wallet
      const currentWallet = wallets.find((wallet) =>
        wallet.accounts.some((acc) => acc.address === currentAccount.address)
      );

      if (!currentWallet) {
        throw new Error("Active wallet not found");
      }

      // Ensure the wallet supports the latest transaction execution method
      if (!currentWallet.features["sui:signAndExecuteTransaction"]) {
        throw new Error(
          "Wallet does not support sui:signAndExecuteTransaction"
        );
      }

      // Execute transaction using the latest method
      const response = await currentWallet.features[
        "sui:signAndExecuteTransaction"
      ].signAndExecuteTransaction({
        transaction: tx,
        chain: "sui:testnet", 
        account: currentAccount,
      });

      return response.digest;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  const value = {
    connected,
    address: currentAccount?.address || null,
    connecting,
    error,
    disconnect,
    executeTransaction,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
