import { NFTMarketplace, NFTMarketplace__factory } from "@/typechain-types";
import { ethers } from "ethers";

export const createNFTMarketPlaceContract = async (): Promise<
  NFTMarketplace | undefined
> => {
  try {
    // Check if MetaMask is available in the browser
    if (window.ethereum) {
      // Create a provider using MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Get the signer associated with the connected wallet
      const signer = await provider.getSigner();

      // Check if the contract address is defined in environment variables
      if (process.env.NFTMARKETPLACE_CONTRACT_ADDRESS) {
        // Create an instance of the NFTMarketplace contract using ethers.js
        const NFTMarketPlaceContract = NFTMarketplace__factory.connect(
          process.env.NFTMARKETPLACE_CONTRACT_ADDRESS,
          signer
        );

        // Return the instantiated contract
        return NFTMarketPlaceContract;
      } else {
        // If contract address is not defined, show an alert and return undefined
        alert(
          "Contract address not defined. Please check your environment variables."
        );
        return;
      }
    } else {
      // If MetaMask is not detected, show an alert and return undefined
      alert("MetaMask not detected. Please install the MetaMask extension.");
      return;
    }
  } catch (error: any) {
    // Log error to the console
    console.error(
      "Error connecting to NFTMarketplace contract:",
      error.message
    );
  }
};
