"use client";

import Image from "next/image";
import {
  CurrentWalletAtomic,
  IsConnectedAtomic,
  NFT,
  NFTsAtomic,
} from "@/store/app";
import { useAtom } from "jotai";
import { createNFTMarketPlaceContract } from "@/helpers/createContract";
import Link from "next/link";
import { pinataGetURL } from "@/helpers/pinata";
import { ethers } from "ethers";
import { getEvent } from "@/helpers/getEvent";
import Loading from "../loading";
import { useState } from "react";

interface Props {
  singleNFT: NFT;
}

const SingleNFTCard = ({ singleNFT }: Props) => {
  const [currentWallet] = useAtom(CurrentWalletAtomic);
  const [, setNFTs] = useAtom(NFTsAtomic);
  const [isConnected] = useAtom(IsConnectedAtomic);
  const [loading, setLoading] = useState<boolean>(false);

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
      const price = ethers.parseEther(singleNFT.price);

      // Create a market sale transaction
      const transaction = await NFTMarketPlaceContract.createMarketSale(
        singleNFT.tokenId,
        { value: price }
      );

      // Wait for the transaction to be mined
      const tx = await transaction.wait();

      // Extract the MarketItemCreated event from the transaction
      const event = getEvent(tx, "MarketItemCreated");

      // Check if the event is present
      if (event) {
        // Extract tokenId from the event arguments
        const { tokenId } = event.args;

        // Update the NFTs state by filtering out the sold item
        setNFTs((prev) => prev.filter((item) => item.tokenId != tokenId));
      }
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
    <div className="p-3 flex flex-col gap-2 bg-white rounded-xl w-full relative">
      <div className="flex gap-2 flex-col">
        <span className="text-center flex justify-between">
          <span className="leading-none">
            {singleNFT.seller.substring(0, 4)}
          </span>

          <span className="w-full border-b-2 relative bottom-[3px] mx-1 border-dotted border-black"></span>
          <span className="leading-none">
            {singleNFT.seller.substring(
              singleNFT.seller.length - 4,
              singleNFT.seller.length
            )}
          </span>
        </span>
        <Link href={`/nft-detail/${singleNFT.tokenId}`}>
          <div className="overflow-hidden rounded-xl relative pb-[100%]">
            <Image
              src={pinataGetURL(singleNFT.image)}
              alt="nft"
              objectFit="cover"
              fill
              className="hover:scale-110 transition-[transform] ease-linear !duration-300"
            />
          </div>
        </Link>
        <div className="flex flex-col gap-1 text-sm">
          <Link href={`/nft-detail/${singleNFT.tokenId}`}>
            <span>
              <span className="font-semibold">Name: </span>
              {singleNFT.name}
            </span>
          </Link>
          <span>
            <span className="font-semibold">Description: </span>
            {singleNFT.description}
          </span>
          <span>
            <span className="font-semibold">Price: </span>
            <span className="text-green-500">{singleNFT.price} ETH</span>
          </span>
        </div>
      </div>
      {isConnected && (
        <div className="mt-auto w-full">
          {currentWallet === singleNFT.owner.toLowerCase() ? (
            <Link
              href={`/nft-detail/${singleNFT.tokenId}`}
              className="text-center w-full py-1 text-sm px-4 border-2 border-blue-500 rounded-3xl hover:text-white hover:bg-blue-500 transition"
            >
              Resell
            </Link>
          ) : currentWallet === singleNFT.seller.toLowerCase() ? (
            <div className="text-green-500 w-full font-bold">
              You are seller this NFT
            </div>
          ) : (
            <button
              type="button"
              className="py-1 w-full text-sm px-4 border-2 border-blue-500 rounded-3xl hover:text-white hover:bg-blue-500 transition"
              onClick={createMarketSell}
            >
              Buy NFT
            </button>
          )}
        </div>
      )}
      {loading && (
        <div className="fixed z-20 flex items-center justify-center inset-0 w-100 h-100 bg-black bg-opacity-30">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default SingleNFTCard;
