"use server";

import { Suspense } from "react";
import FetchMarketItems from "./action";
import Loading from "./loading";

interface Props {
  searchParams: string;
}

const page = async ({ searchParams }: Props) => {
  return (
    <div className="w-full flex flex-col">
      <div>
        <h1 className="text-center mb-10 text-4xl font-bold">Market Place</h1>
      </div>
      <div className="w-full">
        <Suspense key={searchParams} fallback={<Loading />}>
          <FetchMarketItems />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
