import Navbar from "../../components/Navbar";
import { fetchRangePools, fetchRangePositions } from "../../utils/queries";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { mapRangePools, mapUserRangePositions } from "../../utils/maps";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useCoverStore } from "../../hooks/useCoverStore";
import InfoIcon from "../../components/Icons/InfoIcon";
import SearchIcon from "../../components/Icons/SearchIcon";
import UserIcon from "../../components/Icons/UserIcon";
import UserRangePool from "../../components/Range/UserRangePool";
import PoolIcon from "../../components/Icons/PoolIcon";
import RangePool from "../../components/Range/RangePool";

export default function Range() {
  const { address, isDisconnected } = useAccount();

  const [searchTerm, setSearchTerm] = useState("");
  const [allRangePositions, setAllRangePositions] = useState([]);
  const [allRangePools, setAllRangePools] = useState([]);

  const [needsRefetch, setNeedsRefetch] = useRangeLimitStore((state) => [
    state.needsRefetch,
    state.setNeedsRefetch,
  ]);

  const [needsCoverRefetch, setNeedsCoverRefetch] = useCoverStore((state) => [
    state.needsRefetch,
    state.setNeedsRefetch,
  ]);

  //////////////////////Get Pools Data
  useEffect(() => {
    getRangePoolData();
  }, []);

  async function getRangePoolData() {
    const data = await fetchRangePools();
    if (data["data"]) {
      const pools = data["data"].limitPools;
      setAllRangePools(mapRangePools(pools));
    }
  }

  useEffect(() => {
    if (address) {
      getUserRangePositionData();
    }
  }, [address]);

  async function getUserRangePositionData() {
    try {
      const data = await fetchRangePositions(address);
      if (data["data"].rangePositions) {
        setAllRangePositions(
          mapUserRangePositions(data["data"].rangePositions)
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  //////////////////////

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto my-8 px-3 md:px-0 pb-32">
        <div className="flex lg:flex-row flex-col gap-x-8 gap-y-5 justify-between">
          <div className="p-7 lg:h-[300px] w-full lg:w-[60%] flex flex-col justify-between bg-[url('/static/images/bg/shark1.png')]">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">
                BECOME A LIQUIDITY PROVIDER AND EARN FEES
              </h1>
              <p className="text-sm text-white/40 font-light">
                Lorem ipsum dolor sit amet consectetur adipiscing elit nascetur
                purus, habitant mattis cum eros senectus fusce suscipit tempor
              </p>
            </div>
            {/*
            <button
              className="px-12 py-3 text-white w-min whitespace-nowrap cursor-pointer text-center transition border border-main bg-main1 uppercase text-sm
                hover:opacity-80"
            >
              CREATE RANGE POOL
            </button>
  */}
          </div>
          <div className="lg:h-[300px] h-full w-full lg:w-[80%] xl:w-[40%] border border-grey p-7 flex flex-col justify-between">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">How it works</h1>
              <p className="text-sm text-grey3 font-light">
                Range Pools are similar to what users have come to expect from
                AMMs while bounding liquidity between a price range.
                <br />
                <br />
                <span className="text-xs">
                  LPs can provide their liquidity to a specific price range,
                  resulting in a higher concentration of liquidity and less
                  slippage for swappers in comparison to AMM without price
                  bounds. This is due to being able to have more liquidity
                  within a specific range by not providing to the Full Range of
                  a constant product curve.
                </span>
              </p>
            </div>
            <a
              href="https://docs.poolsharks.io/overview/range-pools/"
              target="_blank"
              rel="noreferrer"
              className="text-grey3 underline text-sm flex items-center gap-x-2 font-light"
            >
              <InfoIcon />
              Read More
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-y-4 mt-9">
          <div className="text-grey1 relative">
            <div className="absolute ml-6 mt-2.5">
              <SearchIcon />
            </div>
            <input
              className="w-full bg-dark border-grey border rounded-[4px] uppercase placeholder:text-grey1 text-white text-[13px] py-2 pr-5 pl-12 outline-none"
              placeholder="Search by name, symbol or address"
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
          </div>
          <div className="p-6 bg-dark border border-grey rounded-[4px]">
            <div className="text-white flex items-center text-sm gap-x-3">
              <UserIcon />
              <h1>YOUR POSITIONS</h1>
            </div>
            <div>
              {isDisconnected ? (
                <div className="text-grey1 text-xs  py-10 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-10 py-4 mx-auto"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h9.454a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73zm3.068-5.852A1.25 1.25 0 015.273 4.5h9.454a1.25 1.25 0 011.205.918l1.523 5.52c.006.02.01.041.015.062H14a1 1 0 00-.86.49l-.606 1.02a1 1 0 01-.86.49H8.236a1 1 0 01-.894-.553l-.448-.894A1 1 0 006 11H2.53l.015-.062 1.523-5.52z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Your range positions will appear here.
                </div>
              ) : (
                <>
                  {allRangePositions.length === 0 ? (
                    <div className="text-grey1 text-xs  py-10 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-10 py-4 mx-auto"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h9.454a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73zm3.068-5.852A1.25 1.25 0 015.273 4.5h9.454a1.25 1.25 0 011.205.918l1.523 5.52c.006.02.01.041.015.062H14a1 1 0 00-.86.49l-.606 1.02a1 1 0 01-.86.49H8.236a1 1 0 01-.894-.553l-.448-.894A1 1 0 006 11H2.53l.015-.062 1.523-5.52z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Your range positions will appear here.
                    </div>
                  ) : (
                    <div className="overflow-scroll">
                      <div className="w-[1400px] lg:w-auto">
                        <div className="space-y-3">
                          <div className="grid grid-cols-4 text-xs text-grey1/60 w-full mt-5 mb-2 uppercase">
                            <span>Pool Name</span>
                            <span className="text-right">Price Range</span>
                            <span className="text-right">Pool balance</span>
                            <span className="text-right mr-4">USD Value</span>
                          </div>
                          {allRangePositions.map((allRangePosition) => {
                            if (
                              allRangePosition.id != undefined &&
                              (allRangePosition.tokenZero.name.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                                allRangePosition.tokenOne.name.toLowerCase() ===
                                  searchTerm.toLowerCase() ||
                                allRangePosition.tokenZero.symbol.toLowerCase() ===
                                  searchTerm.toLowerCase() ||
                                allRangePosition.tokenOne.symbol.toLowerCase() ===
                                  searchTerm.toLowerCase() ||
                                allRangePosition.tokenZero.id.toLowerCase() ===
                                  searchTerm.toLowerCase() ||
                                allRangePosition.tokenOne.id.toLowerCase() ===
                                  searchTerm.toLowerCase() ||
                                searchTerm === "")
                            ) {
                              return (
                                <UserRangePool
                                  key={allRangePosition.id + "rangePosition"}
                                  rangePosition={allRangePosition}
                                  href={"/range/view"}
                                  isModal={false}
                                />
                              );
                            }
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="p-6 bg-black border border-grey/50 rounded-[4px] ">
            <div className="flex justify-between">
              <div className="text-white flex items-center text-sm gap-x-3 w-full">
                <PoolIcon />
                <h1>ALL POOLS</h1>
              </div>
              <span className="text-grey1 text-xs md:w-full w-32 md:w-auto text-right">
                Click on a pool to Add Liquidity
              </span>
            </div>
            <div className="overflow-scroll">
              <div className="w-[700px] lg:w-auto">
                <div className="space-y-3 w-full">
                  <div className="grid grid-cols-2 w-full text-xs text-grey1/60 w-full mt-5 mb-2 uppercase">
                    <div className="text-left">Pool Name</div>
                    <div className="grid grid-cols-3">
                      <span className="text-right">Volume (24h)</span>
                      <span className="text-right">TVL</span>
                      <span className="text-right mr-4">Fees (24h)</span>
                    </div>
                  </div>
                  {allRangePools.map((allRangePool) => {
                    if (
                      allRangePool.tokenZero.name.toLowerCase() ===
                        searchTerm.toLowerCase() ||
                      allRangePool.tokenOne.name.toLowerCase() ===
                        searchTerm.toLowerCase() ||
                      allRangePool.tokenZero.symbol.toLowerCase() ===
                        searchTerm.toLowerCase() ||
                      allRangePool.tokenOne.symbol.toLowerCase() ===
                        searchTerm.toLowerCase() ||
                      allRangePool.tokenZero.id.toLowerCase() ===
                        searchTerm.toLowerCase() ||
                      allRangePool.tokenOne.id.toLowerCase() ===
                        searchTerm.toLowerCase() ||
                      searchTerm === ""
                    )
                      return (
                        <RangePool
                          account={address}
                          key={allRangePool.poolId}
                          poolId={allRangePool.poolId}
                          tokenZero={allRangePool.tokenZero}
                          tokenOne={allRangePool.tokenOne}
                          liquidity={allRangePool.liquidity}
                          auctionLenght={undefined}
                          feeTier={allRangePool.feeTier}
                          tickSpacing={allRangePool.tickSpacing}
                          tvlUsd={allRangePool.tvlUsd}
                          volumeUsd={allRangePool.volumeUsd}
                          volumeEth={allRangePool.volumeEth}
                          href="/range/add-liquidity"
                        />
                      );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
