"use client";

import { NFT, NFTsAtomic } from "@/store/app";
import React, { useEffect } from "react";
import SingleNFTCard from "./SingleNFTCard";
import { useAtom } from "jotai";

interface Props {
  data: NFT[];
}

const MarketClient = ({ data }: Props) => {
  const [nfts, setNFTs] = useAtom(NFTsAtomic);

  useEffect(() => {
    setNFTs(data);
  }, [data]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {nfts.map((item) => (
        <SingleNFTCard key={item.tokenId} singleNFT={item} />
      ))}
    </div>
  );
};

export default MarketClient;
