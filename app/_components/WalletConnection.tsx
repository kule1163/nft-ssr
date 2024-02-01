"use client";

import { IsConnectedAtomic, CurrentWalletAtomic } from "@/store/app";
import { ethers } from "ethers";
import { useAtom } from "jotai";
import React, { useEffect } from "react";

const WalletConnection = () => {
  const [isConnected, setIsConnected] = useAtom(IsConnectedAtomic);
  const [currentWallet, setCurrentWallet] = useAtom(CurrentWalletAtomic);

  // Function to connect the wallet
  const connectWallet = async () => {
    try {
      // Check if the MetaMask extension is available
      if (window.ethereum) {
        // Create a new ethers provider using the wallet provider
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Get the signer (user account) from the provider
        const signer = await provider.getSigner();

        // Set the current wallet address and update connection status
        setCurrentWallet(signer.address.toLowerCase());
        setIsConnected(true);
      } else {
        // If MetaMask is not installed, show an alert to the user
        alert("Install MetaMask");
      }
    } catch (error) {
      // Log any errors that occur during the connection process
      console.error("Error connecting wallet:", error);
    }
  };

  //when page refresh check account is connected
  // Function to check the connected wallet using MetaMask
  const checkWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        // Request the accounts from MetaMask
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        // Check if any account is available
        if (accounts.length > 0) {
          // Set the current wallet address and mark as connected
          setCurrentWallet(accounts[0].toLowerCase());
          setIsConnected(true);
        } else {
          // No account available, set current wallet to null and mark as not connected
          setCurrentWallet(null);
          setIsConnected(false);
        }
      } else {
        // MetaMask not detected, alert the user to install the extension
        alert("Install the MetaMask extension!");
      }
    } catch (error: any) {
      // Handle errors while checking the wallet
      console.error("Error checking wallet:", error.message);
    }
  };

  // useEffect hook to check the wallet when the component mounts
  useEffect(() => {
    // Call the checkWallet function
    checkWallet();
  }, []);

  // Function to handle changes in connected accounts
  const handleAccountsChanged = (accounts: string[]) => {
    // Time to reload your interface with accounts[0]!
    if (accounts[0]) {
      setCurrentWallet(accounts[0].toLowerCase());
      setIsConnected(true);
    } else {
      // No account is connected, set current wallet to null and mark as disconnected.
      setCurrentWallet(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      // Check if MetaMask (or a similar Ethereum wallet) is installed
      if (window.ethereum) {
        // Attach an event listener for changes in connected accounts
        window.ethereum.on("accountsChanged", handleAccountsChanged);

        // Cleanup the event listener when the component unmounts
        return () => {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
        };
      } else {
        // Display an alert if MetaMask extension is not installed
        alert("Install the MetaMask extension!!");
      }
    }
  }, []); // Empty dependency array to run the effect only once during component mount

  return (
    <div>
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="py-1 text-sm px-4 border-2 border-blue-500 rounded-3xl hover:text-white hover:bg-blue-500 transition"
        >
          Connect Wallet
        </button>
      ) : (
        <span className="text-wrap break-words">{currentWallet}</span>
      )}
    </div>
  );
};

export default WalletConnection;
