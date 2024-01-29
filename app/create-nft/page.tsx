"use client";

import Image from "next/image";
import React, { useState } from "react";
import UploadIcon from "@/aseets/upload.svg";
import { uploadImage, uploadMetaData } from "@/helpers/pinata";
import { ethers } from "ethers";
import { NFTMarketplace__factory } from "@/typechain-types";
import { useRouter } from "next/navigation";
import { getEvent } from "@/helpers/getEvent";
import Loading from "../loading";

const CreateNFT = () => {
  // Access Next.js router for navigation
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  // State variables to handle image and its URL
  const [image, setImage] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);

  // State variable to manage form input values
  const [formState, setFormState] = useState<FormStates>({
    name: "",
    description: "",
    price: "",
  });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if files exist and if the first file is selected
    if (e.target.files && e.target.files[0]) {
      // Set the image state to the selected file
      setImage(e.target.files[0]);

      // Set the imageURL state to the URL of the selected file using Object URL
      setImageURL(URL.createObjectURL(e.target.files[0]));
    } else {
      // If no files are selected, reset both image and imageURL states to null
      setImage(null);
      setImageURL(null);
    }
  };

  const handleFormState = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the form state using the functional form of setFormState
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Destructure form state
    const { description, name, price } = formState;
    e.preventDefault();

    // Initialize Ethereum provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Check if an image is selected
    try {
      if (image) {
        setLoading(true);
        // Upload the image and obtain its CID
        const cid = await uploadImage(image);

        // Log the CID for debugging
        console.log({ cid });

        // Check if image upload was successful
        if (cid) {
          // Upload metadata with image CID, name, description, and price
          const metaCid = await uploadMetaData({
            cid,
            name,
            description,
            price,
          });

          // Log metadata CID for debugging
          console.log("metacid0", metaCid);

          // Check if metadata upload was successful
          if (metaCid) {
            // Check if NFT Marketplace contract address is defined
            if (process.env.NFTMARKETPLACE_CONTRACT_ADDRESS) {
              // Connect to the NFT Marketplace contract
              const NFTMarketplace = NFTMarketplace__factory.connect(
                process.env.NFTMARKETPLACE_CONTRACT_ADDRESS,
                signer
              );

              // Get the listing price from the contract
              const listingPrice = await NFTMarketplace.getListingPrice();

              // Convert the user-entered price to Wei
              const parsedPrice = ethers.parseEther(formState.price);

              // Create a new token on the NFT Marketplace
              const transaction = await NFTMarketplace.createToken(
                metaCid,
                parsedPrice,
                {
                  value: listingPrice,
                }
              );

              // Wait for the transaction to be mined
              const tx = await transaction.wait();

              // Get the "MarketItemCreated" event from the transaction
              const event = getEvent(tx, "MarketItemCreated");

              // Check if the event is present
              if (!event) {
                throw new Error("event error");
              }

              const { tokenId } = event.args;

              if (!tokenId) {
                throw new Error("event args error");
              }

              // Navigate to the success page
              router.push(`/?created=successfully-${tokenId}`);
            }
          } else {
            console.log("metacid error");
            return;
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="rounded-2xl flex gap-5 w-full">
        <div className="bg-white p-10 flex-1 rounded-2xl ">
          <label
            className="group relative overflow-hidden cursor-pointer border-2 border-black border-dashed rounded-2xl h-full flex flex-col items-center w-full text-center"
            htmlFor="image"
          >
            {imageURL && (
              <div className="w-full h-full absolute inset-0 flex z-20">
                <Image src={imageURL} alt="image" objectFit="cover" fill />
                <div className="absolute inset-0 w-full h-full bg-blue-100 bg-opacity-80"></div>
              </div>
            )}
            <div className="w-full h-full absolute inset-0 flex items-center justify-center z-30 flex-col">
              <Image src={UploadIcon} alt="upload" width={70} height={70} />
              <span className="font-bold mt-4">Click to upload</span>
              <span className="mt-4">PNG, WEBP or JPG</span>
              <div className="border mt-5 rounded-3xl border-black group-hover:bg-black group-hover:text-white transition shadow-sm px-6 py-2 w-fit">
                Browse file
              </div>
              <input
                type="file"
                id="image"
                name="image"
                required
                onChange={handleImage}
                className="h-0 w-0 opacity-0"
              />
            </div>
          </label>
        </div>
        <div className="flex-1 p-10 flex flex-col gap-3 bg-white rounded-2xl">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="cursor-pointer font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formState.name}
              onChange={handleFormState}
              placeholder="e. g. `raroin design art`"
              className="p-3  rounded-xl outline-none bg-blue-100 border-blue-100 border focus:bg-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="cursor-pointer font-medium">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              required
              value={formState.description}
              onChange={handleFormState}
              placeholder="e. g. `raroin design art`"
              className="p-3  rounded-xl outline-none bg-blue-100 border-blue-100 border focus:bg-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="price" className="cursor-pointer font-medium">
              Price
            </label>
            <input
              type="text"
              id="price"
              name="price"
              required
              value={formState.price}
              onChange={handleFormState}
              placeholder="e. g. `0.00001`"
              className="p-3  rounded-xl outline-none bg-blue-100 border-blue-100 border focus:bg-transparent"
            />
          </div>
          {loading ? (
            <div className="w-full mt-4">
              <Loading />
            </div>
          ) : (
            <button
              type="submit"
              className="ml-auto py-1 mt-5 text-sm px-4 border-2 border-blue-500 rounded-3xl hover:text-white hover:bg-blue-500 transition"
            >
              Create NFT
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateNFT;

export interface FormStates {
  name: string;
  description: string;
  price: string;
}
