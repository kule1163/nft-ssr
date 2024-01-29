const hre = require("hardhat");

// Define an async function named 'main' to deploy the contract
async function main() {
  // Retrieve the deployer's signer account from the Hardhat environment
  const [deployer] = await hre.ethers.getSigners();

  // Log the deployer's address to the console
  console.log("Deploying contract with the account:", deployer?.address);

  // Deploy the NFTMarketplace contract using Hardhat's deployContract function
  const NFTMarketplace = await hre.ethers.deployContract("NFTMarketplace");

  // Retrieve the deployed contract's address
  const NFTMarketplaceAddress = await NFTMarketplace.getAddress();

  // Log the deployed contract's address to the console
  console.log({ NFTMarketplaceAddress });
}

// Use the main function to deploy the contract and handle errors
main().catch((error) => {
  // Log any errors that occur during deployment
  console.error(error);
  // Set the process exit code to 1 in case of an error
  process.exitCode = 1;
});
