"use client";

import { createNFTsList } from "@/helpers/createNFTsList";
import { CurrentWalletAtomic, NFT } from "@/store/app";
import { NFTMarketplace__factory } from "@/typechain-types";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import MarketClient from "../_components/MarketClient";
import Loading from "../loading";
import { useAtom } from "jotai";

const MyNFTs = () => {
  // State to hold NFTs, loading status, and current wallet
  const [NFTs, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentWallet] = useAtom(CurrentWalletAtomic);

  // Async function to fetch NFTs owned by the current wallet
  const fetchMyNFTs = async () => {
    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error(
          "MetaMask not detected. Please install the MetaMask extension."
        );
      }

      // Create Ethereum provider and signer using MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Validate contract address from environment variables
      if (!process.env.NFTMARKETPLACE_CONTRACT_ADDRESS) {
        throw new Error(
          "Contract address not defined. Please check your environment variables."
        );
      }

      // Create an instance of the NFTMarketplace contract
      const NFTMarketplaceContract = NFTMarketplace__factory.connect(
        process.env.NFTMARKETPLACE_CONTRACT_ADDRESS,
        signer
      );

      // Set loading state to true before fetching data
      setLoading(true);

      // Fetch the NFTs owned by the current wallet
      const transaction = await NFTMarketplaceContract.fetchMyNFTs();

      // Create a list of NFTs using the fetched transaction data
      const NFTsList = await createNFTsList(
        transaction,
        NFTMarketplaceContract
      );

      // Set the NFTs state with the fetched list (or an empty array if null)
      setNFTs(NFTsList || []);
    } catch (error: any) {
      console.error("Error fetching my NFTs:", error.message);
      // Handle or log the error as needed
    } finally {
      // Set loading state to false after fetching data
      setLoading(false);
    }
  };

  // useEffect hook to fetch NFTs when the current wallet changes
  useEffect(() => {
    fetchMyNFTs();
  }, [currentWallet]);

  return (
    <div className="w-full flex flex-col">
      <div>
        <h1 className="text-center mb-10 text-4xl font-bold">My NFTs</h1>
      </div>
      <div className="w-full">
        {loading ? <Loading /> : <MarketClient data={NFTs} />}
      </div>
    </div>
  );
};

export default MyNFTs;
