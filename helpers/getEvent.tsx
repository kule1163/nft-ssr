import { ethers } from "ethers";
import NFTMarketPlaceJson from "@/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

// Function to get a specific event from transaction logs
export const getEvent = (
  tx: ethers.ContractTransactionReceipt | null, // Transaction receipt from a contract call
  currentEvent: Events // Specific event type to retrieve
) => {
  // Create an ethers interface using the ABI of the NFTMarketplace contract
  const iface = new ethers.Interface(NFTMarketPlaceJson.abi);

  // Check if the transaction receipt is not null
  if (tx) {
    // Parse logs from the transaction receipt
    let events = tx.logs.map((log) =>
      iface.parseLog({ data: log.data, topics: log.topics })
    );

    // Find the specific event by name
    const event = events.find((event) => event?.name === currentEvent);

    // Return the found event (or null if not found)
    return event;
  } else {
    // Log an error and show an alert if the transaction receipt is null
    console.log("tx: something went wrong");
    alert("tx: something went wrong");

    // Return null to indicate a failure
    return null;
  }
};

// Define the possible events as a string literal type
export type Events = "MarketItemCreated";
