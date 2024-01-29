"use client";

import Image from "next/image";
import { useState } from "react";
import { createNFTMarketPlaceContract } from "@/helpers/createContract";
import { CurrentWalletAtomic, NFT } from "@/store/app";
import { ethers } from "ethers";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import Loading from "../loading";

interface Props {
  data: NFT;
}

const NFTDetail = ({ data }: Props) => {
  // Access Next.js router for navigation
  const router = useRouter();

  // State variable 'price' and its update function 'setPrice' using the useState hook
  const [price, setPrice] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Use the useAtom hook to get the value of 'CurrentWalletAtomic' from Recoil state management
  const [currentWallet] = useAtom(CurrentWalletAtomic);

  // Event handler function for handling changes in the input field for the price
  const handlePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract the new value from the input field
    const newPrice = e.target.value;

    // Update the 'price' state with the new value
    setPrice(newPrice);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!price) {
        // Handle case when price is not provided
        return;
      }

      // Create an instance of the NFTMarketPlace contract
      const NFTMarketPlaceContract = await createNFTMarketPlaceContract();

      if (!NFTMarketPlaceContract) {
        // Handle case when NFTMarketPlaceContract is not available
        return;
      }

      setLoading(true);

      // Get the listing price from the contract
      const listingPrice = await NFTMarketPlaceContract.getListingPrice();

      // Convert the provided price to Ether
      const resellPrice = ethers.parseEther(price);

      // Call the resellToken function on the contract to resell the NFT
      const transaction = await NFTMarketPlaceContract.resellToken(
        data.tokenId,
        resellPrice,
        { value: listingPrice }
      );

      // Wait for the transaction to be mined
      const tx = await transaction.wait();

      // Redirect the user to a success page with a query parameter
      router.push("/?relist=successfully");
    } catch (error: any) {
      console.error("Error during resell:", error.message);
      // Handle or log the error as needed
    } finally {
      setLoading(false);
    }
  };

  const createMarketSell = async () => {
    try {
      // Get the NFTMarketPlaceContract instance
      const NFTMarketPlaceContract = await createNFTMarketPlaceContract();

      // Check if NFTMarketPlaceContract is successfully retrieved
      if (!NFTMarketPlaceContract) {
        throw new Error("Failed to get NFTMarketPlaceContract");
      }

      setLoading(true);

      // Parse the price of the singleNFT from ether to wei
      const price = ethers.parseEther(data.price);

      // Create a market sale transaction
      const transaction = await NFTMarketPlaceContract.createMarketSale(
        data.tokenId,
        { value: price }
      );

      // Wait for the transaction to be mined
      const tx = await transaction.wait();

      router.push(`/my-nfts?bought=successfully-${data.tokenId}`);
    } catch (error: any) {
      // Handle errors during the execution of the function
      console.error("Error creating market sale:", error.message);
      // You might want to handle or log the error here
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
      <div className="bg-white h-full flex items-center rounded-2xl p-5 overflow-hidden">
        <div className="pb-[100%] w-full relative rounded-2xl overflow-hidden">
          <Image
            src={`https://coffee-prickly-ferret-400.mypinata.cloud/ipfs/${data.image}?pinataGatewayToken=gqaIfAbazPFj1JZrzfGd0Kq8YG38PF4kJ-tjCNwSM7DXak6DaXLReGiNtk--l650&_gl=1*t4lzrq*_ga*NzYyNTI2NTI3LjE2OTM5NDc4NjM.*_ga_5RMPXG14TE*MTY5NDQ1MzU0My4xMy4xLjE2OTQ0NTM1NTMuNTAuMC4w`}
            alt="nft"
            fill
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-white p-5 h-full rounded-2xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <span>
            <span className="font-bold">Description: </span>
            {data.description}
          </span>
          <span className="text-wrap break-words">
            <span className="font-bold">Owner: </span>
            {data.owner}
          </span>
          {currentWallet !== data.owner.toLowerCase() && (
            <span>
              <span className="font-bold">Price: </span> {data.price}
            </span>
          )}
        </div>
        <div className="w-fit">
          {loading ? (
            <Loading />
          ) : (
            <>
              {data.owner.toLowerCase() === currentWallet ? (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="price"
                      className="cursor-pointer font-medium"
                    >
                      Price
                    </label>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      required
                      value={price}
                      onChange={handlePrice}
                      placeholder="e. g. `0.00001`"
                      className="p-3  rounded-xl outline-none bg-blue-100 border-blue-100 border focus:bg-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 py-1 text-sm px-4 border-2 border-blue-500 rounded-3xl hover:text-white hover:bg-blue-500 transition"
                  >
                    Resell
                  </button>
                </form>
              ) : currentWallet === data.seller.toLowerCase() ? (
                <div className="text-green-500 font-bold">
                  You are seller this NFT
                </div>
              ) : (
                <button
                  type="button"
                  onClick={createMarketSell}
                  className="py-1 text-sm px-4 border-2 border-blue-500 rounded-3xl hover:text-white hover:bg-blue-500 transition"
                >
                  Buy NFT
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;
