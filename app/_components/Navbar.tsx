"use client";

import Link from "next/link";
import React from "react";
import WalletConnection from "./WalletConnection";

export const Navbar = () => {
  return (
    <div className="w-full flex justify-center h-[auto] sm:h-[60px] items-center sticky top-0 bg-white z-50 shadow-md py-[15px]">
      <div className="flex max-w-[1170px] w-full px-[10px] sm:px-[30px] justify-between gap-2 flex-wrap items-center">
        <nav className="w-fit">
          <ul className="flex items-center gap-5">
            <li>
              <Link className="hover:text-blue-500 transition" href="/">
                Marketplace
              </Link>
            </li>
            <li>
              <Link className="hover:text-blue-500 transition" href="/my-nfts">
                My NFTs
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-blue-500 transition"
                href="/create-nft"
              >
                Create NFT
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <WalletConnection />
        </div>
      </div>
    </div>
  );
};
