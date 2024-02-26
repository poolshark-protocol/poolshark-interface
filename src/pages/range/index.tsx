import Navbar from "../../components/Navbar";
import {
  fetchFinTokenData,
  fetchRangePools,
  fetchRangePositions,
} from "../../utils/queries";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { mapRangePools, mapUserRangePositions } from "../../utils/maps";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import InfoIcon from "../../components/Icons/InfoIcon";
import SearchIcon from "../../components/Icons/SearchIcon";
import UserIcon from "../../components/Icons/UserIcon";
import UserRangePool from "../../components/Range/UserRangePool";
import PoolIcon from "../../components/Icons/PoolIcon";
import RangePool from "../../components/Range/RangePool";
import { useRouter } from "next/router";
import { tokenRangeLimit } from "../../utils/types";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import { Checkbox } from "../../components/ui/checkbox";
import { isWhitelistedPool } from "../../utils/config";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { limitPoolTypeIds } from "../../utils/pools";

export default function Range() {
  const { address, isDisconnected } = useAccount();

  const [searchTerm, setSearchTerm] = useState("");
  const [allRangePositions, setAllRangePositions] = useState([]);
  const [allRangePools, setAllRangePools] = useState([]);
  const [isPositionsLoading, setIsPositionsLoading] = useState(false);
  const [isPoolsLoading, setIsPoolsLoading] = useState(false);
  const [lowTVLHidden, setLowTVLHidden] = useState(true);
  const [sort, setSort] = useState("TVL");
  const [poolType, setPoolType] = useState("Current");

  const [
    chainId,
    networkName,
    finSubgraph,
    limitSubgraph,
    setLimitSubgraph,
    setFinToken,
    listedtokenList,
    logoMap,
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.finSubgraph,
    state.limitSubgraph,
    state.setLimitSubgraph,
    state.setFinToken,
    state.listedtokenList,
    state.logoMap,
  ]);

  const [
    setTokenIn,
    setTokenOut,
    setRangePoolFromFeeTier,
    needsRefetch,
    setNeedsRefetch,
    resetRangeLimitParams,
    numLegacyPositions,
    numCurrentPositions,
    whitelistedFeesData,
    setNumLegacyPositions,
    resetNumLegacyPositions,
    setNumCurrentPositions,
    resetNumCurrentPositions,
    setWhitelistedFeesData,
    resetWhitelistedFeesData,
    poolApys,
  ] = useRangeLimitStore((state) => [
    state.setTokenIn,
    state.setTokenOut,
    state.setRangePoolFromFeeTier,
    state.needsRefetch,
    state.setNeedsRefetch,
    state.resetRangeLimitParams,
    state.numLegacyPositions,
    state.numCurrentPositions,
    state.whitelistedFeesData,
    state.setNumLegacyPositions,
    state.resetNumLegacyPositions,
    state.setNumCurrentPositions,
    state.resetNumCurrentPositions,
    state.setWhitelistedFeesData,
    state.resetWhitelistedFeesData,
    state.poolApys,
  ]);

  const router = useRouter();

  //////////////////////Get Pools Data
  useEffect(() => {
    getRangePoolData();
  }, [chainId]);

  useEffect(() => {
    for (let i = 0; i < allRangePools.length; i++) {
      if (poolApys[allRangePools[i].poolId]) {
        allRangePools[i].poolApy = poolApys[allRangePools[i].poolId];
        setAllRangePools(allRangePools);
      }
    }
  }, [poolApys]);

  async function getRangePoolData() {
    setIsPoolsLoading(true);
    const finData = await fetchFinTokenData(finSubgraph);
    if (finData["data"]) {
      if (finData["data"].tokens.length == 1) {
        const finTokenData = finData["data"].tokens[0];
        setFinToken(finTokenData);
      }
    }
    const data = await fetchRangePools(limitSubgraph);
    if (data["data"]) {
      const pools = data["data"].limitPools;
      setAllRangePools(
        mapRangePools(
          pools,
          networkName,
          whitelistedFeesData,
          setWhitelistedFeesData
        )
      );
      setIsPoolsLoading(false);
    }
  }

  useEffect(() => {
    if (address) {
      const chainConstants =
        chainProperties[networkName] ?? chainProperties["arbitrum-one"];
      if (chainConstants["limitSubgraphUrl"]) {
        setLimitSubgraph(chainConstants["limitSubgraphUrl"]);
        getUserRangePositionData();
      }
    }
  }, []);

  useEffect(() => {
    if (address) {
      getUserRangePositionData();
      setNeedsRefetch(false);
    }
  }, [address, needsRefetch, chainId]);

  async function getUserRangePositionData() {
    try {
      setIsPositionsLoading(true);
      resetNumLegacyPositions();
      const data = await fetchRangePositions(limitSubgraph, address);
      if (data["data"].rangePositions) {
        setAllRangePositions(
          mapUserRangePositions(
            data["data"].rangePositions,
            setNumLegacyPositions,
            resetNumLegacyPositions,
            setNumCurrentPositions,
            resetNumCurrentPositions
          )
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
        <div className="flex lg:flex-row items-start flex-col gap-x-8 gap-y-5 justify-between">
          <div className="p-7 xl:h-[300px] lg:h-[400px] w-full lg:w-[60%] flex flex-col justify-between bg-cover bg-[url('/static/images/bg/shark1.png')]">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">
                BECOME A LIQUIDITY PROVIDER AND EARN FEES
              </h1>
              <p className="text-sm text-white/40 font-light">
                Range LPs bootstrap token swaps in return for a share of trading
                fees.
                <br />
                <br />
                The main advantage of range-bound liquidity is earning more fees
                with less capital.
                <br />
                Wider price ranges are recommended to reduce losses when
                removing liquidity.
                <br />
                <br />
                Provide liquidity and start earning FIN rewards now.
              </p>
            </div>
            <button
              disabled={allRangePools.length == 0}
              onClick={() => {
                resetRangeLimitParams(chainId);
                if (allRangePools?.length > 0) {
                  const tokenIn = {
                    name: allRangePools[0].tokenZero.symbol,
                    address: allRangePools[0].tokenZero.id,
                    logoURI: logoMap[allRangePools[0].tokenZero.id],
                    symbol: allRangePools[0].tokenZero.symbol,
                    decimals: allRangePools[0].tokenZero.decimals,
                  } as tokenRangeLimit;
                  const tokenOut = {
                    name: allRangePools[0].tokenOne.symbol,
                    address: allRangePools[0].tokenOne.id,
                    logoURI: logoMap[allRangePools[0].tokenOne.id],
                    symbol: allRangePools[0].tokenOne.symbol,
                    decimals: allRangePools[0].tokenOne.decimals,
                  } as tokenRangeLimit;
                  setTokenIn(tokenOut, tokenIn, "0", true);
                  setTokenOut(tokenIn, tokenOut, "0", false);
                  setRangePoolFromFeeTier(
                    tokenIn,
                    tokenOut,
                    allRangePools[0].feeTier.toString(),
                    limitSubgraph,
                    undefined,
                    undefined,
                    limitPoolTypeIds["constant-product-1.1"]
                  );
                  router.push({
                    pathname: "/range/add-liquidity",
                    query: {
                      feeTier: allRangePools[0].feeTier ?? 3000,
                      poolId: allRangePools[0].poolId,
                      chainId: chainId,
                    },
                  });
                }
              }}
              className="px-12 mt-5 py-3 text-white w-min whitespace-nowrap cursor-pointer text-center transition border border-main bg-main1 uppercase text-sm
                hover:opacity-80"
            >
              CREATE RANGE POSITION
            </button>
          </div>
          <div className="xl:h-[300px] lg:h-[400px] h-full w-full lg:w-[40%] xl:w-[40%] border border-grey p-7 flex flex-col justify-between">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">How it works</h1>
              <p className="text-sm text-grey3 font-light">
                Range Pools use a dynamic fee system to increase fee revenue.
                <br />
                LPs earn more fees on large price swings to reduce loss to
                arbitrageurs.
                <br />
                <br />
                <span className="text-xs">
                  Tighter ranges increase fee revenue.
                </span>
                <br />
                <span className="text-xs">Wider ranges decrease LVR risk.</span>
              </p>
            </div>
            <a
              href="https://docs.poolshark.fi/concepts/protocol/Range"
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
            <div className="flex md:flex-row flex-col md:items-center gap-y-2 justify-between">
              <div className="text-white flex items-center text-sm gap-x-3">
                <UserIcon />
                <h1>YOUR POSITIONS</h1>
              </div>
              <div className="bg-black flex items-center p-1 text-sm rounded-[2px]">
                <button
                  onClick={() => setPoolType("Current")}
                  className={`w-full justify-center rounded-[2px] py-1.5 px-7 border ${
                    poolType === "Current"
                      ? "bg-main1 text-white border-main "
                      : "border-black text-grey1"
                  }`}
                >
                  CURRENT
                </button>
                <button
                  onClick={() => setPoolType("Legacy")}
                  className={`w-full items-center gap-x-2 flex justify-center rounded-[2px] py-1.5 px-5 border ${
                    poolType === "Legacy"
                      ? "bg-main1 text-white border-main "
                      : "border-black text-grey1"
                  }`}
                >
                  LEGACY{" "}
                  <span className="text-xs bg-main1 rounded-full flex items-center justify-center w-6 h-6 text-main2">
                    {numLegacyPositions}
                  </span>
                </button>
              </div>
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
              ) : isDisconnected ||
                (poolType === "Legacy" &&
                  !allRangePositions.some(
                    (position) =>
                      position.poolType !=
                      String(limitPoolTypeIds["constant-product-1.1"])
                  )) ||
                (poolType === "Current" &&
                  !allRangePositions.some(
                    (position) =>
                      position.poolType ==
                      String(limitPoolTypeIds["constant-product-1.1"])
                  )) ? (
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
                            listedtokenList.find(
                              (element) =>
                                element.address.toLowerCase() ===
                                searchTerm.toLowerCase()
                            ) != undefined ||
                            searchTerm === "")
                        ) {
                          if (poolType === "Current") {
                            if (
                              allRangePosition.poolType ==
                              String(limitPoolTypeIds["constant-product-1.1"])
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
                          } else if (poolType === "Legacy") {
                            if (
                              allRangePosition.poolType !=
                              String(limitPoolTypeIds["constant-product-1.1"])
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
                          }
                        }
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 bg-black border border-grey/50 rounded-[4px] ">
            <div className="flex items-center justify-between">
              <div className="flex md:justify-start justify-between items-center gap-x-10 w-full">
                <div className="text-white flex items-center text-sm gap-x-3 w-auto whitespace-nowrap">
                  <PoolIcon />
                  <h1>ALL POOLS</h1>
                </div>
                <div className="flex bg-dark items-center space-x-2 text-xs">
                  <span className="text-grey1">
                    <Checkbox
                      checked={lowTVLHidden}
                      onCheckedChange={() => setLowTVLHidden(!lowTVLHidden)}
                      id="tvl"
                    />
                  </span>
                  <label
                    htmlFor="tvl"
                    className="text-xs text-white/80 -mt-[2.5px] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    HIDE LOW TVL POOLS
                  </label>
                </div>
              </div>
              <span className="text-grey1 md:block hidden text-xs md:w-full w-32 md:w-auto text-right">
                Click on a pool to Add Liquidity
              </span>
            </div>
            <div className="pb-3 lg:pb-0">
              <div className="w-auto">
                <div className="space-y-3 w-full">
                  <div className="grid grid-cols-2 w-full text-xs text-grey1/60 w-full mt-5 mb-2 uppercase">
                    <div className="text-left">Pool Name</div>
                    <div className="grid md:grid-cols-4 grid-cols-1 mr-4">
                      <button
                        className="text-right md:table-cell  hidden"
                        onClick={() => setSort("Volume")}
                      >
                        <span
                          className={`flex justify-end gap-x-2 ${
                            sort === "Volume" && "text-white"
                          }`}
                        >
                          {sort === "Volume" && (
                            <ChevronDownIcon className="w-4" />
                          )}
                          Volume (24h)
                        </span>
                      </button>
                      <button
                        className="text-right md:table-cell hidden"
                        onClick={() => setSort("TVL")}
                      >
                        <span
                          className={`flex justify-end gap-x-2 ${
                            sort === "TVL" && "text-white"
                          }`}
                        >
                          {sort === "TVL" && (
                            <ChevronDownIcon className="w-4" />
                          )}
                          TVL
                        </span>
                      </button>
                      <button
                        className="text-right md:table-cell hidden"
                        onClick={() => setSort("Fees")}
                      >
                        <span
                          className={`flex justify-end gap-x-2 ${
                            sort === "Fees" && "text-white"
                          }`}
                        >
                          {sort === "Fees" && (
                            <ChevronDownIcon className="w-4" />
                          )}
                          Fees (24h)
                        </span>
                      </button>
                      <button
                        className="text-right md:table-cell hidden"
                        onClick={() => setSort("APY")}
                      >
                        <span
                          className={`flex justify-end gap-x-2 ${
                            sort === "APY" && "text-white"
                          }`}
                        >
                          {sort === "APY" && (
                            <ChevronDownIcon className="w-4" />
                          )}
                          APY
                        </span>
                      </button>
                    </div>
                  </div>
                  {isPoolsLoading
                    ? [...Array(3)].map((_, i: number) => (
                        <div
                          key={i}
                          className="h-[50px] w-full bg-grey/30 animate-pulse rounded-[4px]"
                        ></div>
                      ))
                    : allRangePools
                        .filter((allRangePool) =>
                          lowTVLHidden
                            ? parseFloat(allRangePool.tvlUsd) > 1.0
                            : true
                        )
                        .sort((a, b) => {
                          if (sort === "Volume") {
                            return (
                              parseFloat(b.volumeUsd) - parseFloat(a.volumeUsd)
                            );
                          } else if (sort === "Fees") {
                            return (
                              parseFloat(b.feesUsd) - parseFloat(a.feesUsd)
                            );
                          } else if (sort === "TVL") {
                            return parseFloat(b.tvlUsd) - parseFloat(a.tvlUsd);
                          } else if (sort === "APY") {
                            return (
                              parseFloat(b.poolApy) - parseFloat(a.poolApy)
                            );
                          }
                          return 0;
                        })
                        .map((allRangePool) => {
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
