import React, { useState, useEffect } from "react";
import { useAccount, useProvider } from "wagmi";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import { fetchCoverPositions } from "../../utils/queries";
import { mapUserCoverPositions } from "../../utils/maps";
import { TickMath } from "../../utils/math/tickMath";
import { useCoverStore } from "../../hooks/useCoverStore";
import Info from "../../components/Icons/InfoIcon";
import SearchIcon from "../../components/Icons/SearchIcon";
import UserIcon from "../../components/Icons/UserIcon";
import UserCoverPool from "../../components/Cover/UserCoverPool";
import PoolIcon from "../../components/Icons/PoolIcon";
import CoverPool from "../../components/Cover/CoverPool";
import { fetchCoverPools } from "../../utils/queries";
import { mapCoverPools } from "../../utils/maps";
import { logoMap } from "../../utils/tokens";
import { tokenCover } from "../../utils/types";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties, supportedNetworkNames } from "../../utils/chains";

export default function Cover() {
  const [networkName, coverSubgraph, setCoverSubgraph] = useConfigStore(
    (state) => [state.networkName, state.coverSubgraph, state.setCoverSubgraph]
  );

  const [
    setCoverTokenIn,
    setCoverTokenOut,
    setCoverPoolFromVolatility,
    needsRefetch,
    needsPosRefetch,
    setNeedsRefetch,
    setNeedsPosRefetch,
    tokenIn,
    tokenOut,
  ] = useCoverStore((state) => [
    state.setTokenIn,
    state.setTokenOut,
    state.setCoverPoolFromVolatility,
    state.needsRefetch,
    state.needsPosRefetch,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.tokenIn,
    state.tokenOut,
  ]);

  const router = useRouter();
  const { address, isDisconnected } = useAccount();

  const [selectedPool, setSelectedPool] = useState(router.query ?? undefined);
  const [state, setState] = useState(router.query.state ?? "initial");
  const [searchTerm, setSearchTerm] = useState("");
  const [allCoverPositions, setAllCoverPositions] = useState([]);
  const [create, setCreate] = useState(true);
  const [allCoverPools, setAllCoverPools] = useState([]);
  const [isPositionsLoading, setIsPositionsLoading] = useState(false);
  const [isPoolsLoading, setIsPoolsLoading] = useState(false);

  ///////////////////////////Positions

  useEffect(() => {
    if (address) {
      const chainConstants = chainProperties[networkName]
        ? chainProperties[networkName]
        : chainProperties["arbitrumGoerli"];
      setCoverSubgraph(chainConstants["coverSubgraphUrl"]);
      getUserCoverPositionData();
    }
  }, []);

  useEffect(() => {
    getUserCoverPositionData();
    setNeedsPosRefetch(false);
  }, [needsPosRefetch, router.isReady]);

  async function getUserCoverPositionData() {
    setIsPositionsLoading(true);
    const data = await fetchCoverPositions(coverSubgraph, address);
    if (data["data"]) {
      const positions = data["data"].positions;
      const positionData = mapUserCoverPositions(positions, coverSubgraph);
      setAllCoverPositions(positionData);
      setIsPositionsLoading(false);
    }
  }

  ///////////////////////////Pools

  useEffect(() => {
    getCoverPoolData();
    setNeedsRefetch(false);
  }, [needsRefetch, router.isReady]);

  async function getCoverPoolData() {
    setIsPoolsLoading(true);
    const data = await fetchCoverPools(coverSubgraph);
    if (data["data"]) {
      const pools = data["data"].coverPools;
      setAllCoverPools(mapCoverPools(pools));
      setIsPoolsLoading(false);
    }
  }

  ///////////////////////////Search

  useEffect(() => {
    if (state === "existing" && router.query.state === "nav") {
      setState("initial");
    }
  }, [router.query.state]);

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDiselectPool = (state) => {
    setState(state);
    setSelectedPool(undefined);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar create={create} setCreate={setCreate} />
      <div className="container mx-auto my-8 px-3 md:px-0  pb-32">
        <div className="flex lg:flex-row flex-col gap-x-8 gap-y-5 justify-between">
          <div className="p-7 lg:h-[300px] w-full lg:w-[60%] flex flex-col justify-between bg-cover bg-[url('/static/images/bg/shark.png')]">
            <div className="flex flex-col gap-y-3 mb-5">
              <h1 className="uppercase text-white">
                Cover your liquidity pools
              </h1>
              <p className="text-sm text-white/40 font-light">
                Create a Cover Position to protect your profits from downside
                similar to a stop-loss. Cover Pools auction off your liquidity
                once the price range you set is entered.
                <br />
              </p>
            </div>
            <button
              onClick={() => {
                const tokenIn = {
                  name: allCoverPools[0].tokenZero.symbol,
                  address: allCoverPools[0].tokenZero.id,
                  logoURI: logoMap[allCoverPools[0].tokenZero.symbol],
                  symbol: allCoverPools[0].tokenZero.symbol,
                } as tokenCover;
                const tokenOut = {
                  name: allCoverPools[0].tokenOne.symbol,
                  address: allCoverPools[0].tokenOne.id,
                  logoURI: logoMap[allCoverPools[0].tokenOne.symbol],
                  symbol: allCoverPools[0].tokenOne.symbol,
                } as tokenCover;
                setCoverTokenIn(tokenOut, tokenIn, "0", true);
                setCoverTokenOut(tokenIn, tokenOut, "0", false);
                setCoverPoolFromVolatility(
                  tokenIn,
                  tokenOut,
                  allCoverPools[0].volatilityTier.feeAmount.toString(),
                  coverSubgraph
                );
                router.push({
                  pathname: "/cover/create",
                  query: { state: "select" },
                });
              }}
              className="px-12 py-3 text-white w-min whitespace-nowrap cursor-pointer text-center transition border border-main bg-main1 uppercase text-sm
                hover:opacity-80"
            >
              CREATE COVER POSITION
            </button>
          </div>
          <div className="lg:h-[300px] h-full w-full lg:w-[80%] xl:w-[40%] border border-grey p-7 flex flex-col justify-between">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">How it works</h1>
              <p className="text-sm text-grey3 font-light">
                Cover Pools allow you to create positions to increase exposure
                to a specific token as the price moves.
                <br />
                <br />
                <span className="text-xs">
                  - If the ETH price <b>increases</b>, the pool <b>sells DAI</b>{" "}
                  to <b>buy ETH</b>.
                  <br />
                  <br />- If the ETH price <b>decreases</b>, the pool{" "}
                  <b>sells ETH</b> to <b>buy DAI</b>.
                </span>
              </p>
            </div>
            <a
              href="https://docs.poolsharks.io/overview/cover-pools/"
              target="_blank"
              rel="noreferrer"
              className="text-grey3 underline text-sm flex items-center gap-x-2 font-light"
            >
              <Info />
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
            <div className="text-white">
              {isPositionsLoading ? (
                <div>
                  <div className="pb-3 lg:pb-0">
                    <div className="lg:w-auto">
                      <div className="space-y-3">
                        <div className="lg:grid hidden grid-cols-4 text-xs text-grey1/60 w-full mt-5 mb-2 uppercase">
                          <span>Pool Name</span>
                          <span className="text-right">Price Range</span>
                          <span className="text-right">% Filled</span>
                          <span className="text-right mr-4">USD Value</span>
                        </div>
                        {[...Array(2)].map((_, i: number) => (
                          <div
                            key={i}
                            className="h-[58px] w-full bg-grey/20 animate-pulse rounded-[4px]"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : isDisconnected || allCoverPositions.length === 0 ? (
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
                  Your cover positions will appear here.
                </div>
              ) : (
                <>
                  <div className="pb-3 lg:pb-0">
                    <div className="lg:w-auto">
                      <div className="space-y-3">
                        <div className="lg:grid hidden grid-cols-4 text-xs text-grey1/60 w-full mt-5 mb-2 uppercase">
                          <span>Pool Name</span>
                          <span className="text-right">Price Range</span>
                          <span className="text-right">% Filled</span>
                          <span className="text-right mr-4">USD Value</span>
                        </div>
                        {allCoverPositions.map((allCoverPosition) => {
                          if (
                            allCoverPosition.id != undefined &&
                            allCoverPosition.userOwnerAddress ===
                              address?.toLowerCase() &&
                            (allCoverPosition.tokenZero.name.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                              allCoverPosition.tokenOne.name.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allCoverPosition.tokenZero.symbol.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allCoverPosition.tokenOne.symbol.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allCoverPosition.tokenZero.id.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allCoverPosition.tokenOne.id.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              searchTerm === "")
                          ) {
                            return (
                              <UserCoverPool
                                key={allCoverPosition.id + "coverPosition"}
                                coverPosition={allCoverPosition}
                                lowerPrice={parseFloat(
                                  TickMath.getPriceStringAtTick(
                                    allCoverPosition.lowerTick,
                                    tokenIn,
                                    tokenOut
                                  )
                                )}
                                upperPrice={parseFloat(
                                  TickMath.getPriceStringAtTick(
                                    allCoverPosition.upperTick,
                                    tokenIn,
                                    tokenOut
                                  )
                                )}
                                href={"/cover/view"}
                              />
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="p-6 bg-black border border-grey/50 rounded-[4px]">
            <div className="flex justify-between">
              <div className="text-white flex items-center text-sm gap-x-3">
                <PoolIcon />
                <h1>ALL POOLS</h1>
              </div>
              <span className="text-grey1 text-xs w-32 md:w-auto text-right">
                Click on a pool to Add Liquidity
              </span>
            </div>
            <div className="pb-3 lg:pb-0">
              <div className="w-auto">
                <div className="space-y-3 w-full">
                  <div className="grid grid-cols-2 w-full text-xs text-grey1/60 w-full mt-5 mb-2 uppercase">
                    <div className="text-left">Pool Name</div>
                    <div className="grid grid-cols-3">
                      <span className="text-right md:table-cell hidden"></span>
                      <span className="text-right md:table-cell hidden">
                        Volume (24h)
                      </span>
                      <span className="text-right mr-4 md:table-cell hidden">
                        TVL
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
                    : allCoverPools.map((allCoverPool) => {
                        if (
                          allCoverPool.tokenZero.name.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allCoverPool.tokenOne.name.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allCoverPool.tokenZero.symbol.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allCoverPool.tokenOne.symbol.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allCoverPool.tokenZero.id.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          allCoverPool.tokenOne.id.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                          searchTerm === ""
                        )
                          return (
                            <CoverPool
                              key={allCoverPool.poolId}
                              pool={allCoverPool}
                              href="/cover/create"
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
