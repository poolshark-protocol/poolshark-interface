import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import router from "next/router";
import { useAccount, useContractRead, useSigner } from "wagmi";
import CoverCollectButton from "../../components/Buttons/CoverCollectButton";
import { BigNumber, ethers } from "ethers";
import { TickMath } from "../../utils/math/tickMath";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { getClaimTick, mapUserCoverPositions } from "../../utils/maps";
import RemoveLiquidity from "../../components/Modals/Cover/RemoveLiquidity";
import AddLiquidity from "../../components/Modals/Cover/AddLiquidity";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { useCoverStore } from "../../hooks/useCoverStore";
import { fetchCoverTokenUSDPrice, getLogoURI } from "../../utils/tokens";
import { fetchCoverPositions } from "../../utils/queries";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import ExternalLinkIcon from "../../components/Icons/ExternalLinkIcon";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";

export default function ViewCover() {
  const [chainId, networkName, coverSubgraph, setCoverSubgraph, logoMap] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.coverSubgraph,
      state.setCoverSubgraph,
      state.logoMap,
    ]);

  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    coverMintParams,
    tokenIn,
    tokenOut,
    needsRefetch,
    needsPosRefetch,
    latestTick,
    claimTick,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setCoverPositionData,
    setTokenInCoverUSDPrice,
    setTokenOutCoverUSDPrice,
    setLatestTick,
    setClaimTick,
    setCoverPoolFromVolatility,
    setCoverAddLiqDisabled,
  ] = useCoverStore((state) => [
    state.coverPoolAddress,
    state.coverPoolData,
    state.coverPositionData,
    state.coverMintParams,
    state.tokenIn,
    state.tokenOut,
    state.needsRefetch,
    state.needsPosRefetch,
    state.latestTick,
    state.claimTick,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setCoverPositionData,
    state.setTokenInCoverUSDPrice,
    state.setTokenOutCoverUSDPrice,
    state.setLatestTick,
    state.setClaimTick,
    state.setCoverPoolFromVolatility,
    state.setCoverAddLiqDisabled,
  ]);

  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const { data: signer } = useSigner();

  //cover aux
  const [priceDirection, setPriceDirection] = useState(false);
  const [coverFilledAmount, setCoverFilledAmount] = useState("");
  const [allCoverPositions, setAllCoverPositions] = useState([]);

  const volTierMap = new Map<string, any>([
    ["1000", { id: 0, volatility: "1" }],
    ["3000", { id: 1, volatility: "3" }],
    ["10000", { id: 2, volatility: "24" }],
  ]);

  //Display and copy flags
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [is0Copied, setIs0Copied] = useState(false);
  const [is1Copied, setIs1Copied] = useState(false);
  const [isPoolCopied, setIsPoolCopied] = useState(false);

  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    tokenIn.address
      ? tokenIn.address.toString().substring(0, 6) +
          "..." +
          tokenIn.address
            .toString()
            .substring(
              tokenIn.address.toString().length - 4,
              tokenIn.address.toString().length
            )
      : undefined
  );
  const [tokenOneDisplay, setTokenOneDisplay] = useState(
    tokenOut.address
      ? tokenOut.address.toString().substring(0, 6) +
          "..." +
          tokenOut.address
            .toString()
            .substring(
              tokenOut.address.toString().length - 4,
              tokenOut.address.toString().length
            )
      : undefined
  );

  const [poolDisplay, setPoolDisplay] = useState(
    coverPoolAddress
      ? coverPoolAddress.toString().substring(0, 6) +
          "..." +
          coverPoolAddress
            .toString()
            .substring(
              coverPoolAddress.toString().length - 4,
              coverPoolAddress.toString().length
            )
      : undefined
  );

  useEffect(() => {
    setPoolDisplay(
      coverPoolAddress
        ? coverPoolAddress.toString().substring(0, 6) +
            "..." +
            coverPoolAddress
              .toString()
              .substring(
                coverPoolAddress.toString().length - 4,
                coverPoolAddress.toString().length
              )
        : undefined
    );
  }, [coverPoolAddress]);

  const [lowerInverse, setLowerInverse] = useState(0);
  const [upperInverse, setUpperInverse] = useState(0);
  const [priceInverse, setPriceInverse] = useState(0);

  ////////////////////////////////Addresses

  useEffect(() => {
    if (copyPoolAddress) {
      const timer = setTimeout(() => {
        setIsPoolCopied(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  });

  function copyPoolAddress() {
    navigator.clipboard.writeText(coverPoolAddress.toString());
    setIsPoolCopied(true);
  }

  ////////////////////////////////Token Order
  const [tokenOrder, setTokenOrder] = useState(true);
  const [priceOrder, setPriceOrder] = useState(true);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setTokenOrder(tokenIn.callId == 0);
      setPriceOrder(tokenIn.callId == 0);
    }
  }, [tokenIn, tokenOut]);

  //////////////////////////////// Pool Data

  useEffect(() => {
    if (coverPoolData.token0 && coverPoolData.token1) {
      if (tokenIn.address) {
        fetchCoverTokenUSDPrice(
          coverPoolData,
          tokenIn,
          setTokenInCoverUSDPrice
        );
      }
      if (tokenOut.address) {
        fetchCoverTokenUSDPrice(
          coverPoolData,
          tokenOut,
          setTokenOutCoverUSDPrice
        );
      }
    }
  }, [coverPoolData?.token0, coverPoolData?.token1]);

  useEffect(() => {
    getCoverPoolRatios();
  }, [tokenIn.coverUSDPrice, tokenOut.coverUSDPrice]);

  const getCoverPoolRatios = () => {
    try {
      if (coverPoolData != undefined) {
        setLowerInverse(
          parseFloat(
            (
              tokenOut.coverUSDPrice /
              Number(
                TickMath.getPriceStringAtTick(
                  Number(coverPositionData.max),
                  tokenIn,
                  tokenOut
                )
              )
            ).toPrecision(6)
          )
        );
        setUpperInverse(
          parseFloat(
            (
              tokenOut.coverUSDPrice /
              Number(
                TickMath.getPriceStringAtTick(
                  Number(coverPositionData.min),
                  tokenIn,
                  tokenOut
                )
              )
            ).toPrecision(6)
          )
        );
        setPriceInverse(
          parseFloat(
            (
              tokenOut.coverUSDPrice /
              Number(
                TickMath.getPriceStringAtTick(
                  Number(coverPositionData.latestTick),
                  tokenIn,
                  tokenOut
                )
              )
            ).toPrecision(6)
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  ////////////////////////////////Position Data

  useEffect(() => {
    const chainConstants = chainProperties[networkName]
      ? chainProperties[networkName]
      : chainProperties["arbitrumGoerli"]; //TODO: arbitrumOne values
    setCoverSubgraph(chainConstants["coverSubgraphUrl"]);
    setTimeout(() => {
      if (
        needsRefetch == true ||
        needsPosRefetch == true ||
        coverPositionData.positionId == undefined
      ) {
        getUserCoverPositionData();
        setNeedsRefetch(false);
        setNeedsPosRefetch(false);
      }
    }, 1000);
    if (
      needsRefetch == true ||
      needsPosRefetch == true ||
      coverPositionData.positionId == undefined
    ) {
    } else {
      setIsLoading(false);
    }
  }, [needsRefetch, needsPosRefetch, coverPositionData.positionId]);

  async function getUserCoverPositionData() {
    setIsLoading(true);
    try {
      const data = await fetchCoverPositions(coverSubgraph, address);
      if (data["data"]) {
        const positions = data["data"].positions;
        const positionData = mapUserCoverPositions(positions, coverSubgraph);
        setAllCoverPositions(positionData);
        const positionId = coverPositionData.id ?? router.query.id;
        const position = positionData.find(
          (position) => position.id == positionId
        );
        setCoverPoolFromVolatility(
          tokenIn,
          tokenOut,
          position.volatilityTier.feeAmount.toString(),
          coverSubgraph
        );
        if (position != undefined) {
          setCoverPositionData({
            ...position,
            addLiqDisabled: coverPositionData.addLiqDisabled,
          });
        } else {
          //setNeedsCoverSnapshot(true);
          setNeedsPosRefetch(true);
          router.push("/cover");
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////Filled Amount

  const { data: filledAmount } = useContractRead({
    address: coverPoolAddress,
    abi: coverPoolABI,
    functionName: "snapshot",
    args: [
      {
        owner: address,
        positionId: Number(coverPositionData.positionId),
        burnPercent: BigNumber.from("0"),
        claim: BigNumber.from(claimTick),
        zeroForOne: Boolean(coverPositionData.zeroForOne),
      },
    ],
    chainId: chainId,
    watch: true,
    enabled:
      claimTick &&
      BigNumber.from(claimTick).gte(coverPositionData.lowerTick) &&
      BigNumber.from(claimTick).lte(coverPositionData.upperTick) &&
      isConnected &&
      coverPoolAddress != undefined &&
      address != undefined &&
      coverPositionData?.positionId != undefined,
    onError(error) {
      console.log("Error snapshot Cover", error);
    },
  });

  useEffect(() => {
    if (filledAmount) {
      setCoverFilledAmount(
        ethers.utils.formatUnits(filledAmount[3], tokenIn.decimals)
      );
    }
  }, [filledAmount]);

  ////////////////////////////////Latest Tick

  const { data: newLatestTick } = useContractRead({
    address: coverPoolAddress,
    abi: coverPoolABI,
    functionName: "syncLatestTick",
    chainId: chainId,
    enabled: coverPoolAddress != undefined && coverPoolAddress != ZERO_ADDRESS,
    onSuccess(data) {
      // setNeedsAllowance(false);
    },
    onError(error) {
      console.log("Error syncLatestTick", error);
    },
    onSettled(data, error) {},
  });

  ////////////////////////////////Claim Tick

  useEffect(() => {
    if (newLatestTick) {
      const latest = parseInt(newLatestTick.toString());
      updateClaimTick(latest);
      setLatestTick(latest);
    }
  }, [newLatestTick]);

  ////////////////////////////////Claim Tick

  async function updateClaimTick(latestTick: number) {
    const aux = await getClaimTick(
      coverPoolAddress.toString(),
      Number(coverPositionData.min),
      Number(coverPositionData.max),
      Boolean(coverPositionData.zeroForOne),
      Number(coverPositionData.epochLast),
      true,
      coverSubgraph,
      setCoverAddLiqDisabled,
      latestTick
    );
    setClaimTick(aux);
  }

  ////////////////////////////////

  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="flex flex-col pt-10 pb-32 md:pb-0 text-white relative min-h-[calc(100vh-76px)] container mx-auto md:px-0 px-3">
        <div className="flex md:flex-row flex-col justify-between w-full items-start md:items-center gap-y-5">
          <div className="flex items-center gap-x-3">
            <div className="flex items-center">
              {isLoading ? (
                <div className="w-[50px] h-[50px] rounded-full bg-grey/60" />
              ) : (
                <img height="50" width="50" src={getLogoURI(logoMap, tokenIn)} />
              )}
              {isLoading ? (
                <div className="w-[50px] h-[50px] rounded-full ml-[-12px] bg-grey/60" />
              ) : (
                <img
                  height="50"
                  width="50"
                  className="ml-[-12px]"
                  src={getLogoURI(logoMap, tokenOut)}
                />
              )}
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center text-white">
                <h1>
                  {isLoading ? (
                    <div className="h-5 w-20 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    <div>
                      {tokenIn.symbol}-{tokenOut.symbol}
                    </div>
                  )}
                </h1>
                <a
                  href={
                    `${chainProperties[networkName]["explorerUrl"]}` + coverPoolAddress
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-x-3 text-grey1 group cursor-pointer"
                >
                  <span className="-mb-1 text-light text-xs ml-8 group-hover:underline">
                    {poolDisplay}
                  </span>{" "}
                  <ExternalLinkIcon />
                </a>
              </div>
              <div className="flex items-center gap-x-5">
                {isLoading ? (
                  <div className="h-5 w-14 bg-grey/60 animate-pulse rounded-[4px]" />
                ) : (
                  <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                    {
                      volTierMap.get(
                        coverPoolData.volatilityTier?.feeAmount?.toString()
                      )?.volatility
                    }
                    %
                  </span>
                )}
                <div className="flex items-center gap-x-2 text-grey1 text-xs">
                  {isLoading ? (
                    <div className="h-4 w-14 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : coverPositionData.min === undefined ? (
                    ""
                  ) : priceDirection ? (
                    lowerInverse
                  ) : (
                    TickMath.getPriceStringAtTick(
                      Number(coverPositionData.min),
                      tokenIn,
                      tokenOut
                    )
                  )}
                  <DoubleArrowIcon />
                  {isLoading ? (
                    <div className="h-4 w-14 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : coverPositionData.max === undefined ? (
                    ""
                  ) : priceDirection ? (
                    upperInverse
                  ) : (
                    TickMath.getPriceStringAtTick(
                      Number(coverPositionData.max),
                      tokenIn,
                      tokenOut
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-4 w-full md:w-auto">
            {!coverPositionData.addLiqDisabled ? (
              <>
                <button
                  className="bg-main1 w-full border border-main text-main2 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
                  onClick={() => setIsAddOpen(true)}
                >
                  Add Liquidity
                </button>
              </>
            ) : (
              <></>
            )}
            <button
              className={
                !coverPositionData.addLiqDisabled
                  ? "bg-black whitespace-nowrap w-full border border-grey transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px] text-grey1"
                  : "bg-main1 whitespace-nowrap w-full border border-main transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px] text-main2"
              }
              onClick={() => setIsRemoveOpen(true)}
            >
              Remove Liquidity
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row justify-between w-full mt-8  gap-10">
          <div className="border border-grey rounded-[4px] lg:w-1/2 w-full p-5">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Remaining Liquidity</h1>
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  {isLoading ? (
                    <div className="h-4 w-14 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    <span>
                      ~$
                      {(
                        Number(
                          ethers.utils.formatUnits(
                            coverPositionData.userFillOut ?? 0,
                            tokenOrder ? tokenIn.decimals : tokenOut.decimals
                          )
                        ) * tokenIn.coverUSDPrice
                      ).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {isLoading ? (
                    <div className="h-8 w-40 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    Number(
                      ethers.utils.formatUnits(
                        coverPositionData.userFillOut ?? 0,
                        tokenOrder ? tokenIn.decimals : tokenOut.decimals
                      )
                    ).toFixed(2)
                  )}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      {isLoading ? (
                        <div className="w-[25px] h-[25px] aspect-square rounded-full bg-grey/60" />
                      ) : (
                        <img
                          height="25"
                          width="25"
                          src={getLogoURI(logoMap, tokenIn)}
                        />
                      )}
                      {isLoading ? (
                        <div className="h-4 w-full bg-grey/60 animate-pulse rounded-[4px]" />
                      ) : (
                        tokenIn.symbol
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-x-4">
                  <h1 className="uppercase text-white md:block hidden">
                    Price Range
                  </h1>
                  {isLoading ? (
                    <div className="h-6 w-28 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : coverPositionData.min &&
                    coverPositionData.max &&
                    coverPositionData.latestTick ? (
                    parseFloat(
                      TickMath.getPriceStringAtTick(
                        Number(coverPositionData.latestTick),
                        tokenIn,
                        tokenOut
                      )
                    ) <
                      parseFloat(
                        TickMath.getPriceStringAtTick(
                          Number(coverPositionData.min),
                          tokenIn,
                          tokenOut
                        )
                      ) ||
                    parseFloat(
                      TickMath.getPriceStringAtTick(
                        Number(coverPositionData.latestTick),
                        tokenIn,
                        tokenOut
                      )
                    ) >=
                      parseFloat(
                        TickMath.getPriceStringAtTick(
                          Number(coverPositionData.max),
                          tokenIn,
                          tokenOut
                        )
                      ) ? (
                      <span className="text-yellow-600 text-xs bg-yellow-900/30 px-4 py-1 rounded-[4px]">
                        OUT OF RANGE
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs bg-green-900/30 px-4 py-1 rounded-[4px]">
                        IN RANGE
                      </span>
                    )
                  ) : null}
                </div>
                <div
                  onClick={() => setPriceDirection(!priceDirection)}
                  className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
                >
                  {Boolean(coverPositionData.zeroForOne) == priceDirection
                    ? tokenIn.symbol
                    : tokenOut.symbol}{" "}
                  per{" "}
                  {Boolean(coverPositionData.zeroForOne) == priceDirection
                    ? tokenOut.symbol
                    : tokenIn.symbol}
                  <DoubleArrowIcon />
                </div>
              </div>
              <div className="flex flex-col gap-y-4">
                <div className="flex items-center gap-x-5 mt-3">
                  <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs">MIN. PRICE</span>
                    <span className="text-white text-2xl md:text-3xl">
                      {isLoading ? (
                        <div className="h-9 w-36 bg-grey/60 animate-pulse rounded-[4px]" />
                      ) : coverPositionData.min === undefined ? (
                        ""
                      ) : priceDirection ? (
                        lowerInverse
                      ) : (
                        TickMath.getPriceStringAtTick(
                          Number(coverPositionData.min),
                          tokenIn,
                          tokenOut
                        )
                      )}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {Boolean(coverPositionData.zeroForOne)
                        ? priceDirection
                          ? tokenIn.symbol
                          : tokenOut.symbol
                        : priceDirection
                        ? tokenOut.symbol
                        : tokenIn.symbol}{" "}
                      at this price.
                    </span>
                  </div>
                  <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs">MAX. PRICE</span>
                    <span className="text-white text-2xl md:text-3xl">
                      {isLoading ? (
                        <div className="h-9 w-36 bg-grey/60 animate-pulse rounded-[4px]" />
                      ) : coverPositionData.max === undefined ? (
                        ""
                      ) : priceDirection ? (
                        upperInverse
                      ) : (
                        TickMath.getPriceStringAtTick(
                          Number(coverPositionData.max),
                          tokenIn,
                          tokenOut
                        )
                      )}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {Boolean(coverPositionData.zeroForOne)
                        ? priceDirection
                          ? tokenOut.symbol
                          : tokenIn.symbol
                        : priceDirection
                        ? tokenIn.symbol
                        : tokenOut.symbol}{" "}
                      at this price.
                    </span>
                  </div>
                </div>
                <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                  <span className="text-grey1 text-xs">CURRENT. PRICE</span>
                  <span className="text-white text-3xl text-grey1">
                    {isLoading ? (
                      <div className="h-9 w-36 bg-grey/60 animate-pulse rounded-[4px]" />
                    ) : coverPositionData.latestTick ? (
                      priceDirection ? (
                        priceInverse
                      ) : (
                        TickMath.getPriceStringAtTick(
                          Number(coverPositionData?.latestTick),
                          tokenIn,
                          tokenOut
                        )
                      )
                    ) : (
                      ""
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-dark border-grey rounded-[4px] lg:w-1/2 w-full p-5 h-min">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Filled Liquidity</h1>
              {isLoading ? (
                <div className="h-6 w-36 bg-grey/60 animate-pulse rounded-[4px]" />
              ) : coverPositionData.userFillIn ? (
                <span className="text-grey1">
                  ${Number(coverFilledAmount).toFixed(2)}
                  <span className="text-grey">
                    /
                    {Number(
                      ethers.utils.formatUnits(
                        coverPositionData.userFillIn.toString(),
                        tokenOrder ? tokenOut.decimals : tokenIn.decimals
                      )
                    ).toFixed(2)}
                  </span>
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  {isLoading ? (
                    <div className="h-4 w-14 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    <span>
                      ~$
                      {(
                        Number(coverFilledAmount) * tokenOut.coverUSDPrice
                      ).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {isLoading ? (
                    <div className="h-8 w-40 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    Number(coverFilledAmount).toFixed(2)
                  )}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      {isLoading ? (
                        <div className="w-[25px] h-[25px] aspect-square rounded-full bg-grey/60" />
                      ) : (
                        <img
                          height="25"
                          width="25"
                          src={getLogoURI(logoMap, tokenOut)}
                        />
                      )}
                      {isLoading ? (
                        <div className="h-4 w-full bg-grey/60 animate-pulse rounded-[4px]" />
                      ) : (
                        tokenOut.symbol
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/**TO-DO: PASS PROPS */}
              <CoverCollectButton
                poolAddress={coverPoolAddress}
                address={address}
                positionId={coverPositionData.positionId}
                claim={claimTick}
                zeroForOne={Boolean(coverPositionData.zeroForOne)}
                gasFee={coverMintParams.gasFee}
                signer={signer}
                snapshotAmount={
                  filledAmount ? filledAmount[2].add(filledAmount[3]) : BN_ZERO
                }
              />
              {/*TO-DO: add positionOwner ternary again*/}
            </div>
          </div>
        </div>
      </div>
      {coverPositionData.userFillIn ? (
        <>
          <RemoveLiquidity
            isOpen={isRemoveOpen}
            setIsOpen={setIsRemoveOpen}
            address={address}
            signer={signer}
          />
          <AddLiquidity
            isOpen={isAddOpen}
            setIsOpen={setIsAddOpen}
            address={address}
          />
        </>
      ) : null}
    </div>
  );
}
