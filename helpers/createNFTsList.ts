import { NFTMarketplace } from "@/typechain-types";
import axios from "axios";
import { pinataGetURL } from "./pinata";
import { ethers } from "ethers";
import { NFT } from "@/store/app";

// Async function to create a list of NFTs
export const createNFTsList = async (
  transaction: NFTMarketplace.MarketItemStructOutput[], // List of MarketItemStructOutput objects
  contract: NFTMarketplace // The NFTMarketplace contract
): Promise<NFT[] | undefined> => {
  try {
    // Use Promise.all to asynchronously process each market item
    const items: (NFT | null)[] = await Promise.all(
      transaction.map(async (item: any) => {
        // Check if the market item has a tokenId
        if (item.tokenId) {
          // Get the token URI for the tokenId from the contract
          const tokenURI = await contract.tokenURI(item.tokenId);

          // Fetch additional data from Pinata using the token URI
          const { data } = await axios.get(pinataGetURL(tokenURI));

          // Format the price from the market item's data
          const price = ethers.formatUnits(item.price.toString(), "ether");

          // Create a new NFT object with the gathered information
          const currentItem: NFT = {
            price,
            tokenId: Number(item.tokenId),
            seller: item.seller,
            owner: item.owner,
            image: data.image,
            name: data.name,
            description: data.description,
          };

          // Return the created NFT object
          return currentItem;
        } else {
          // If the market item doesn't have a tokenId, return null
          return null;
        }
      })
    );

    // Filter out null values from the items array
    const filteredItems = items.filter((item): item is NFT => item !== null);

    // Return the list of filtered NFTs
    return filteredItems;
  } catch (error) {
    // Add more specific error handling if needed
    console.error("Error creating NFTs list:", error);
    return undefined;
  }
};
