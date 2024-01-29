// Import specific modules and components
import { ethers } from "ethers";
import { NFTMarketplace__factory } from "@/typechain-types";
import MarketClient from "./_components/MarketClient";
import { createNFTsList } from "@/helpers/createNFTsList";

// Use async function for better error handling
const fetchMarketItems = async () => {
  try {
    // Use destructuring assignment for a cleaner look
    const { ALCHEMY_SECRET, NFTMARKETPLACE_CONTRACT_ADDRESS } = process.env;

    // Validate required environment variables
    if (!ALCHEMY_SECRET || !NFTMARKETPLACE_CONTRACT_ADDRESS) {
      console.error("Missing required environment variables");

      throw new Error("Missing required environment variables");
    }

    // Create an Alchemy provider
    const provider = new ethers.AlchemyProvider("sepolia", ALCHEMY_SECRET);

    // Create the NFTMarketplaceContract instance
    const NFTMarketplaceContract = NFTMarketplace__factory.connect(
      NFTMARKETPLACE_CONTRACT_ADDRESS,
      provider
    );

    // Fetch market items from the contract
    const transaction = await NFTMarketplaceContract.fetchMarketItems();

    // Create a list of NFTs using the transaction data
    const NFTsList = await createNFTsList(transaction, NFTMarketplaceContract);

    return NFTsList;
  } catch (error: any) {
    console.error("Error fetching market items:", error.message);
    // You might want to handle or log the error here
    throw new Error("Failed to fetch market items");
  }
};

const FetchMarketItems = async () => {
  const data = await fetchMarketItems();

  return <>{data && <MarketClient data={data} />}</>;
};

export default FetchMarketItems;
