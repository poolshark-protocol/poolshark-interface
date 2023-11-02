import Navbar from "../../components/Navbar";
import { fetchRangePools, fetchRangePositions } from "../../utils/queries";
import { useState, useEffect } from "react";
import { useAccount, useProvider } from "wagmi";
import { mapRangePools, mapUserRangePositions } from "../../utils/maps";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useCoverStore } from "../../hooks/useCoverStore";
import InfoIcon from "../../components/Icons/InfoIcon";
import SearchIcon from "../../components/Icons/SearchIcon";
import UserIcon from "../../components/Icons/UserIcon";
import UserRangePool from "../../components/Range/UserRangePool";
import PoolIcon from "../../components/Icons/PoolIcon";
import RangePool from "../../components/Range/RangePool";
import Link from "next/link";
import { useRouter } from "next/router";
import { logoMap } from "../../utils/tokens";
import { tokenRangeLimit } from "../../utils/types";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties, supportedNetworkNames } from "../../utils/chains";

export default function Range() {
  const { address, isDisconnected } = useAccount();

  const [searchTerm, setSearchTerm] = useState("");
  const [allRangePositions, setAllRangePositions] = useState([]);
  const [allRangePools, setAllRangePools] = useState([]);
  const [isPositionsLoading, setIsPositionsLoading] = useState(false);
  const [isPoolsLoading, setIsPoolsLoading] = useState(false);

  const [chainId, networkName, limitSubgraph, setLimitSubgraph] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
      state.setLimitSubgraph,
    ]);

  const [
    setTokenIn,
    setTokenOut,
    setRangePoolFromFeeTier,
    needsRefetch,
    setNeedsRefetch,
    resetRangeLimitParams,
  ] = useRangeLimitStore((state) => [
    state.setTokenIn,
    state.setTokenOut,
    state.setRangePoolFromFeeTier,
    state.needsRefetch,
    state.setNeedsRefetch,
    state.resetRangeLimitParams,
  ]);

  const router = useRouter();

  //////////////////////Get Pools Data
  useEffect(() => {
    getRangePoolData();
  }, []);

  async function getRangePoolData() {
    setIsPoolsLoading(true);
    const data = await fetchRangePools(limitSubgraph);
    if (data["data"]) {
      const pools = data["data"].limitPools;
      setAllRangePools(mapRangePools(pools));
      setIsPoolsLoading(false);
    }
  }

  useEffect(() => {
    if (address) {
      const chainConstants = chainProperties[networkName]
        ? chainProperties[networkName]
        : chainProperties["arbitrumGoerli"];
      setLimitSubgraph(chainConstants["limitSubgraphUrl"]);
      getUserRangePositionData();
    }
  }, []);

  useEffect(() => {
    if (address && needsRefetch) {
      getUserRangePositionData();
      setNeedsRefetch(false);
    }
  }, [address, needsRefetch]);

  async function getUserRangePositionData() {
    try {
      setIsPositionsLoading(true);
      const data = await fetchRangePositions(limitSubgraph, address);
      if (data["data"].rangePositions) {
        setAllRangePositions(
          mapUserRangePositions(data["data"].rangePositions)
        );
        setIsPositionsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsPositionsLoading(false);
    }
  }

  ///////////////////////////

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto my-8 px-3 md:px-0 pb-32">
        <div className="flex lg:flex-row flex-col gap-x-8 gap-y-5 justify-between">
          <div className="p-7 lg:h-[300px] w-full lg:w-[60%] flex flex-col justify-between bg-cover bg-[url('/static/images/bg/shark1.png')]">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">
                BECOME A LIQUIDITY PROVIDER AND EARN FEES
              </h1>
              <p className="text-sm text-white/40 font-light">
                Provide liquidity and support the leading directional liquidity
                platform. One of the main advantages of providing liquidity to
                an AMM is the capital efficiency it offers. Preventing idle
                money allows LPs bootstrapping liquidity for a token pair to be
                able to earn fees.
              </p>
            </div>
            <button
              onClick={() => {
                resetRangeLimitParams();
                const tokenIn = {
                  name: allRangePools[0].tokenZero.symbol,
                  address: allRangePools[0].tokenZero.id,
                  logoURI: logoMap[allRangePools[0].tokenZero.symbol],
                  symbol: allRangePools[0].tokenZero.symbol,
                  decimals: allRangePools[0].tokenZero.decimals,
                } as tokenRangeLimit;
                const tokenOut = {
                  name: allRangePools[0].tokenOne.symbol,
                  address: allRangePools[0].tokenOne.id,
                  logoURI: logoMap[allRangePools[0].tokenOne.symbol],
                  symbol: allRangePools[0].tokenOne.symbol,
                } as tokenRangeLimit;
                setTokenIn(tokenOut, tokenIn, "0", true);
                setTokenOut(tokenIn, tokenOut, "0", false);
                setRangePoolFromFeeTier(
                  tokenIn,
                  tokenOut,
                  allRangePools[0].feeTier.toString(),
                  limitSubgraph
                );
                router.push({
                  pathname: "/range/add-liquidity",
                  query: { state: "select" },
                });
              }}
              className="px-12 py-3 text-white w-min whitespace-nowrap cursor-pointer text-center transition border border-main bg-main1 uppercase text-sm
                hover:opacity-80"
            >
              CREATE RANGE POSITION
            </button>
          </div>
          <div className="lg:h-[300px] h-full w-full lg:w-[80%] xl:w-[40%] border border-grey p-7 flex flex-col justify-between">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">How it works</h1>
              <p className="text-sm text-grey3 font-light">
                Range Pools are a custom implementation of range-bound
                liquidity. Range includes a dynamic fee system to increase fee
                revenue.
                <br />
                LPs earn more fees on large price swings to reduce loss to
                arbitrageurs.
                <br />
                <br />
                <span className="text-xs">
                  Tighter ranges increase fee revenue.
                </span>
                <br />
                <br />
                <span className="text-xs">Wider ranges decrease LVR risk.</span>
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
              {isPositionsLoading ? (
                <div className="mt-6">
                  <div className="lg:w-auto">
                    <div className="space-y-3">
                      <div className="lg:grid hidden grid-cols-4 text-xs text-grey1/60 w-full mt-5 mb-2 uppercase">
                        <span>Pool Name</span>
                        <span className="text-right">Price Range</span>
                        <span className="text-right">Pool balance</span>
                        <span className="text-right mr-4">USD Value</span>
                      </div>
                      {[...Array(2)].map((_, i: number) => (
                        <div
                          key={i}
                          className="h-[51px] w-full bg-grey/20 animate-pulse rounded-[4px]"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isDisconnected || allRangePositions.length === 0 ? (
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
                <div className="mt-6">
                  <div className="lg:w-auto">
                    <div className="space-y-3">
                      <div className="lg:grid hidden grid-cols-4 text-xs text-grey1/60 w-full mt-5 mb-2 uppercase">
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
                            allRangePosition.tokenZero.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            allRangePosition.tokenOne.name.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allRangePosition.tokenOne.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            allRangePosition.tokenZero.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allRangePosition.tokenZero.symbol
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            allRangePosition.tokenOne.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allRangePosition.tokenOne.symbol
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            allRangePosition.tokenZero.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allRangePosition.tokenOne.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            searchTerm === "")
                        ) {
                          return (
                            <UserRangePool
                              key={allRangePosition.id}
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
            <div className="pb-3 lg:pb-0">
              <div className="w-auto">
                <div className="space-y-3 w-full">
                  <div className="grid grid-cols-2 w-full text-xs text-grey1/60 w-full mt-5 mb-2 uppercase">
                    <div className="text-left">Pool Name</div>
                    <div className="grid md:grid-cols-3 grid-cols-1 mr-4">
                      <span className="text-right md:table-cell hidden">
                        Volume (24h)
                      </span>
                      <span className="text-right md:table-cell hidden">
                        TVL
                      </span>
                      <span className="text-right md:table-cell hidden">
                        Fees (24h)
                      </span>
                    </div>
                  </div>
                  {isPoolsLoading
                    ? [...Array(3)].map((_, i: number) => (
                        <div
                          key={i}
                          className="h-[50px] w-full bg-grey/30 animate-pulse rounded-[4px]"
                        ></div>
                      ))
                    : allRangePools.map((allRangePool) => {
                        if (
                          allRangePool.tokenZero.name.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allRangePool.tokenZero.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          allRangePool.tokenOne.name.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allRangePool.tokenOne.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          allRangePool.tokenZero.symbol.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allRangePool.tokenZero.symbol
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          allRangePool.tokenOne.symbol.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allRangePool.tokenOne.symbol
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          allRangePool.tokenZero.id.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allRangePool.tokenOne.id.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          searchTerm === ""
                        )
                          return (
                            <RangePool
                              key={allRangePool.poolId + "rangePool"}
                              rangePool={allRangePool}
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
