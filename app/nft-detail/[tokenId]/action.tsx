"use server";

import { NFTMarketplace__factory } from "@/typechain-types";
import { ethers } from "ethers";
import NFTDetail from "../../_components/NFTDetail";
import axios from "axios";
import { NFT } from "@/store/app";
import { pinataGetURL } from "@/helpers/pinata";

// Import necessary modules and components
const getSingleNFT = async (tokenId: number): Promise<NFT | null> => {
  try {
    // Destructure environment variables for cleaner code
    const { ALCHEMY_SECRET, NFTMARKETPLACE_CONTRACT_ADDRESS } = process.env;

    // Validate required environment variables
    if (!ALCHEMY_SECRET || !NFTMARKETPLACE_CONTRACT_ADDRESS) {
      console.error("Missing required environment variables");
      throw new Error("Missing required environment variables");
    }

    // Create an Alchemy provider using the specified network and secret
    const provider = new ethers.AlchemyProvider("sepolia", ALCHEMY_SECRET);

    // Create the NFTMarketplaceContract instance using ethers.js
    const NFTMarketplaceContract = NFTMarketplace__factory.connect(
      NFTMARKETPLACE_CONTRACT_ADDRESS,
      provider
    );

    // Fetch the single NFT information using the tokenId
    const transaction = await NFTMarketplaceContract.fetchSingleNFT(tokenId);

    // Check if the transaction contains tokenId (existence check)
    if (transaction.tokenId) {
      // Get the tokenURI of the NFT using the fetched tokenId
      const tokenURI = await NFTMarketplaceContract.tokenURI(
        transaction.tokenId
      );

      // Fetch additional data from the external API (e.g., Pinata)
      const { data } = await axios.get(pinataGetURL(tokenURI));

      // Use ethers formatUnits to format the price from BigNumber to a readable string
      const price = ethers.formatUnits(transaction.price.toString(), "ether");

      // Create a NFT object with the fetched information
      const currentItem: NFT = {
        price,
        tokenId: Number(transaction.tokenId),
        seller: transaction.seller,
        owner: transaction.owner,
        image: data.image,
        name: data.name,
        description: data.description,
      };

      // Return the created NFT object
      return currentItem;
    } else {
      // If tokenId is not present in the transaction, return null
      return null;
    }
  } catch (error: any) {
    // Handle and log errors, and throw a new error for higher-level error handling
    console.error("Error fetching single NFT:", error.message);
    throw new Error("Failed to fetch single NFT");
  }
};

interface Props {
  tokenId: number;
}

const GetSingleNFT = async ({ tokenId }: Props) => {
  const data = await getSingleNFT(tokenId);

  return <>{data && <NFTDetail data={data} />}</>;
};

export default GetSingleNFT;
