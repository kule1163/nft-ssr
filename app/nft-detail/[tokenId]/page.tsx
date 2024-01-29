"use server";

import { Suspense } from "react";
import GetSingleNFT from "./action";
import Loading from "@/app/loading";

interface Params {
  tokenId: string;
}

const page = ({ params }: { params: Params }) => {
  const { tokenId } = params;

  return (
    <div className="w-full">
      {tokenId && (
        <Suspense key={tokenId} fallback={<Loading />}>
          <GetSingleNFT tokenId={Number(tokenId)} />
        </Suspense>
      )}
    </div>
  );
};

export default page;
