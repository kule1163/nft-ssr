import { atom } from "jotai";

export const CurrentWalletAtomic = atom<string | null>(null);
export const IsConnectedAtomic = atom<boolean>(false);
export const NFTsAtomic = atom<NFT[]>([]);

export interface NFT {
  price: string;
  tokenId: number;
  seller: string;
  owner: string;
  image: string;
  name: string;
  description: string;
}
