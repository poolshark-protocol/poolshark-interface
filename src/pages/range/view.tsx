import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import RangeCompoundButton from "../../components/Buttons/RangeCompoundButton";
import { useAccount, useProvider, useSigner } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { TickMath, invertPrice } from "../../utils/math/tickMath";
import JSBI from "jsbi";
import { useCopyElementUseEffect } from "../../utils/misc";
import { DyDxMath } from "../../utils/math/dydxMath";
import { rangePoolABI } from "../../abis/evm/rangePool";
import { useContractRead } from "wagmi";
import RemoveLiquidity from "../../components/Modals/Range/RemoveLiquidity";
import AddLiquidity from "../../components/Modals/Range/AddLiquidity";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { fetchRangeTokenUSDPrice } from "../../utils/tokens";
import { fetchRangePositions } from "../../utils/queries";
import { mapUserRangePositions } from "../../utils/maps";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import ExternalLinkIcon from "../../components/Icons/ExternalLinkIcon";
import RangeCollectButton from "../../components/Buttons/RangeCollectButton";
import router from "next/router";
import { useConfigStore } from "../../hooks/useConfigStore";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import { chainProperties } from "../../utils/chains";
import { tokenRangeLimit } from "../../utils/types";
import RangeStakeButton from "../../components/Buttons/RangeStakeButton";
import RangeUnstakeButton from "../../components/Buttons/RangeUnstakeButton";
import { positionERC1155ABI } from "../../abis/evm/positionerc1155";

export default function ViewRange() {
  const [chainId, networkName, limitSubgraph, setLimitSubgraph, logoMap] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
      state.setLimitSubgraph,
      state.logoMap,
    ]);

  const [
    rangePoolAddress,
    rangePoolData,
    rangePositionData,
    rangeMintParams,
    tokenIn,
    setTokenIn,
    tokenOut,
    setTokenOut,
    priceOrder,
    setPriceOrder,
    setTokenInRangeUSDPrice,
    setTokenOutRangeUSDPrice,
    needsRefetch,
    needsPosRefetch,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setRangePoolFromFeeTier,
    setRangePositionData,
    setMintButtonState,
  ] = useRangeLimitStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangePositionData,
    state.rangeMintParams,
    state.tokenIn,
    state.setTokenIn,
    state.tokenOut,
    state.setTokenOut,
    state.priceOrder,
    state.setPriceOrder,
    state.setTokenInRangeUSDPrice,
    state.setTokenOutRangeUSDPrice,
    state.needsRefetch,
    state.needsPosRefetch,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setRangePoolFromFeeTier,
    state.setRangePositionData,
    state.setMintButtonState,
  ]);

  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [allRangePositions, setAllRangePositions] = useState([]);
  const [userLiquidityUsd, setUserLiquidityUsd] = useState(0);
  const [lowerPrice, setLowerPrice] = useState("");
  const [upperPrice, setUpperPrice] = useState("");
  const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0);
  const [amount0Usd, setAmount0Usd] = useState(0);
  const [amount1Usd, setAmount1Usd] = useState(0);
  const [amount0Fees, setAmount0Fees] = useState(0.0);
  const [amount1Fees, setAmount1Fees] = useState(0.0);
  const [amount0FeesUsd, setAmount0FeesUsd] = useState(0.0);
  const [amount1FeesUsd, setAmount1FeesUsd] = useState(0.0);
  const [isPoolCopied, setIsPoolCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stakeApproved, setStakeApproved] = useState(false);

  const [poolDisplay, setPoolDisplay] = useState(
    rangePoolAddress != ("" as string)
      ? rangePoolAddress.substring(0, 6) +
          "..." +
          rangePoolAddress.substring(
            rangePoolAddress.length - 4,
            rangePoolAddress.length
          )
      : undefined
  );

  ////////////////////////Addresses

  useEffect(() => {
    setPoolDisplay(
      rangePoolAddress != ("" as string)
        ? rangePoolAddress.substring(0, 6) +
            "..." +
            rangePoolAddress.substring(
              rangePoolAddress.length - 4,
              rangePoolAddress.length
            )
        : undefined
    );
    if (tokenIn.address && tokenOut.address) {
      setPriceOrder(tokenIn.callId == 0);
    }
  }, [rangePoolAddress, tokenIn.address, tokenOut.address]);

  useEffect(() => {
    if (copyRangePoolAddress) {
      const timer = setTimeout(() => {
        setIsPoolCopied(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function copyRangePoolAddress() {
    navigator.clipboard.writeText(rangePoolAddress.toString());
    setIsPoolCopied(true);
  }

  ////////////////////////Pool Data

  useEffect(() => {
    setRangePoolFromFeeTier(
      tokenIn,
      tokenOut,
      router.query.feeTier,
      limitSubgraph
    );
  }, [router.query.feeTier]);

  useEffect(() => {
    setUsdValues();
  }, [
    amount0,
    amount1,
    amount0Fees,
    amount1Fees,
    tokenIn,
    tokenOut,
    rangePositionData,
  ]);

  const setUsdValues = () => {
    try {
      if (rangePoolData != undefined) {
        if (!isNaN(tokenIn.USDPrice)) {
          setAmount0Usd(
            parseFloat((amount0 * tokenIn.USDPrice).toPrecision(6))
          );
          setAmount0FeesUsd(
            parseFloat((amount0Fees * tokenIn.USDPrice).toFixed(2))
          );
        }
        if (!isNaN(tokenOut.USDPrice)) {
          setAmount1Usd(
            parseFloat((amount1 * tokenOut.USDPrice).toPrecision(6))
          );
          setAmount1FeesUsd(
            parseFloat((amount1Fees * tokenOut.USDPrice).toFixed(2))
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  ////////////////////////////////Position Data

  useEffect(() => {
    const chainConstants = chainProperties[networkName]
      ? chainProperties[networkName]
      : chainProperties["arbitrumGoerli"];
    setLimitSubgraph(chainConstants["limitSubgraphUrl"]);
    if (
      rangePositionData.positionId == undefined ||
      needsPosRefetch ||
      needsRefetch
    ) {
      getUserRangePositionData();
      setNeedsRefetch(false);
      setNeedsPosRefetch(false);
    }
    if (
      rangePositionData.positionId == undefined ||
      needsPosRefetch ||
      needsRefetch
    ) {
    } else {
      setIsLoading(false);
    }
  }, [needsRefetch, needsPosRefetch, rangePositionData.positionId]);

  async function getUserRangePositionData() {
    setIsLoading(true);
    try {
      const data = await fetchRangePositions(limitSubgraph, address);
      if (data["data"].rangePositions) {
        const mappedPositions = mapUserRangePositions(
          data["data"].rangePositions
        );
        setAllRangePositions(mappedPositions);
        const positionId = rangePositionData.id ?? router.query.id;
        const position = mappedPositions.find(
          (position) => position.id == positionId
        );
        if (position != undefined) {
          const tokenInNew = {
            name: position.tokenZero.name,
            symbol: position.tokenZero.symbol,
            logoURI: logoMap[position.tokenZero.symbol],
            address: position.tokenZero.id,
            decimals: position.tokenZero.decimals,
          } as tokenRangeLimit;
          const tokenOutNew = {
            name: position.tokenOne.name,
            symbol: position.tokenOne.symbol,
            logoURI: logoMap[position.tokenOne.symbol],
            address: position.tokenOne.id,
            decimals: position.tokenOne.decimals,
          } as tokenRangeLimit;
          setTokenIn(tokenOutNew, tokenInNew, "0", true);
          setTokenOut(tokenInNew, tokenOutNew, "0", false);
          setRangePositionData(position);
          console.log('staked flag', position.staked)
          setRangePoolFromFeeTier(
            tokenInNew,
            tokenOutNew,
            position.pool.feeTier.feeAmount,
            limitSubgraph
          );
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////Prices

  useEffect(() => {
    if (rangePoolData.token0 && rangePoolData.token1) {
      if (tokenIn.address) {
        fetchRangeTokenUSDPrice(
          rangePoolData,
          tokenIn,
          setTokenInRangeUSDPrice
        );
      }
      if (tokenOut.address) {
        fetchRangeTokenUSDPrice(
          rangePoolData,
          tokenOut,
          setTokenOutRangeUSDPrice
        );
      }
    }
  }, [rangePoolData?.token0, rangePoolData?.token1]);

  useEffect(() => {
    if (rangePositionData.min && rangePositionData.max) {
      setLowerPrice(
        TickMath.getPriceStringAtTick(
          Number(rangePositionData.min),
          tokenIn,
          tokenOut
        )
      );
      setUpperPrice(
        TickMath.getPriceStringAtTick(
          Number(rangePositionData.max),
          tokenIn,
          tokenOut
        )
      );
    }
  }, [tokenIn, tokenOut, rangePositionData.min, rangePositionData.max]);

  ////////////////////////////////Amounts

  useEffect(() => {
    setAmounts();
  }, [lowerPrice, upperPrice, rangePositionData, rangePoolData]);

  function setAmounts() {
    try {
      if (
        !isNaN(parseFloat(lowerPrice)) &&
        !isNaN(parseFloat(upperPrice)) &&
        !isNaN(parseFloat(String(rangePoolData.poolPrice))) &&
        Number(rangePositionData.userLiquidity) > 0 &&
        parseFloat(lowerPrice) < parseFloat(upperPrice)
      ) {
        const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(
          Number(rangePositionData.min)
        );
        const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
          Number(rangePositionData.max)
        );
        const rangeSqrtPrice = JSBI.BigInt(rangePoolData.poolPrice);
        const liquidity = JSBI.BigInt(rangePositionData.userLiquidity);
        const amounts = DyDxMath.getAmountsForLiquidity(
          lowerSqrtPrice,
          upperSqrtPrice,
          rangeSqrtPrice,
          liquidity,
          true
        );
        // set amount based on bnInput
        const amount0Bn = BigNumber.from(String(amounts.token0Amount));
        const amount1Bn = BigNumber.from(String(amounts.token1Amount));
        setAmount0(
          parseFloat(ethers.utils.formatUnits(amount0Bn, tokenIn.decimals))
        );
        setAmount1(
          parseFloat(ethers.utils.formatUnits(amount1Bn, tokenOut.decimals))
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setUserLiquidityUsd(amount0Usd + amount1Usd);
  }, [amount0Usd, amount1Usd]);

  ////////////////////////////////Snapshot

  const { refetch: refetchSnapshot, data: feesOwed } = useContractRead({
    address: rangePoolAddress,
    abi: rangePoolABI,
    functionName: "snapshotRange",
    args: [rangePositionData.positionId],
    chainId: chainId,
    watch: true,
    enabled:
      isConnected &&
      rangePositionData.positionId != undefined &&
      rangePoolAddress != ZERO_ADDRESS,
    onError(error) {
      console.log("Error snapshot Range", error);
    },
  });

  useEffect(() => {
    setFeesOwed();
  }, [feesOwed]);

  function setFeesOwed() {
    try {
      if (feesOwed) {
        const fees0 = parseFloat(
          ethers.utils.formatUnits(feesOwed[2] ?? "0", tokenIn.decimals)
        );
        const fees1 = parseFloat(
          ethers.utils.formatUnits(feesOwed[3] ?? "0", tokenOut.decimals)
        );
        setAmount0Fees(fees0);
        setAmount1Fees(fees1);
      }
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////Range Staking

  const { data: stakeApproveStatus } = useContractRead({
    address: rangePoolData.poolToken,
    abi: positionERC1155ABI,
    functionName: "isApprovedForAll",
    args: [address, chainProperties[networkName]["rangeStakerAddress"]],
    chainId: chainId,
    watch: true,
    enabled:
      isConnected,
    onSuccess() {
      console.log('approval erc1155 fetched')
    },
    onError(error) {
      console.log("Error isApprovedForAll", rangePoolData.poolToken, error);
    },
  });

  useEffect(() => {
    console.log('type:', typeof(stakeApproveStatus))
    // setStakeApproved(stakeApproveStatus)
  }, [stakeApproveStatus]);

  // store approval status
  // estimate gas based on staked status for add/remove


  ////////////////////////////////Mint Button Handler

  useEffect(() => {
    setMintButtonState();
  }, [tokenIn, rangeMintParams?.tokenInAmount]);

  ////////////////////////////////Return

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
                <img height="50" width="50" src={tokenIn.logoURI} />
              )}
              {isLoading ? (
                <div className="w-[50px] h-[50px] rounded-full ml-[-12px] bg-grey/60" />
              ) : (
                <img
                  height="50"
                  width="50"
                  className="ml-[-12px]"
                  src={tokenOut.logoURI}
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
                    "https://goerli.arbiscan.io/address/" + rangePoolAddress
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
                    {(Number(rangePositionData.feeTier) / 10000).toFixed(2)}%
                  </span>
                )}
                <div className="flex items-center gap-x-2 text-grey1 text-xs">
                  {isLoading ? (
                    <div className="h-4 w-24 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    `Position ID: ${rangePositionData.positionId}`
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-4 w-full md:w-auto">
            {rangePositionData?.staked ? <RangeUnstakeButton address={address} rangePoolAddress={rangePoolData?.id} positionId={rangePositionData.positionId} signer={signer}/> 
                                       : <RangeStakeButton/>} 
            <button
              className="bg-main1 border w-full border-main text-main2 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
              onClick={() => setIsAddOpen(true)}
            >
              Add Liquidity
            </button>
            <button
              className="bg-black border whitespace-nowrap w-full border-grey transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px] text-grey1"
              onClick={() => setIsRemoveOpen(true)}
            >
              Remove Liquidity
            </button>
          </div>
        </div>
        <div className="flex lg:flex-row flex-col justify-between w-full mt-8 gap-10">
          <div className="border border-grey rounded-[4px] lg:w-1/2 w-full p-5">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Liquidity</h1>
              {isLoading ? (
                <div className="h-6 w-36 bg-grey/60 animate-pulse rounded-[4px]" />
              ) : (
                <span className="text-grey1">
                  ${userLiquidityUsd.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  {isLoading ? (
                    <div className="h-4 w-14 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    <span>~${amount0Usd.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {isLoading ? (
                    <div className="h-8 w-40 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    amount0.toFixed(2)
                  )}

                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      {isLoading ? (
                        <div className="w-[25px] h-[25px] aspect-square rounded-full bg-grey/60" />
                      ) : (
                        <img height="25" width="25" src={tokenIn.logoURI} />
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
              <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  {isLoading ? (
                    <div className="h-4 w-14 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    <span>~${amount1Usd.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {isLoading ? (
                    <div className="h-8 w-40 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    amount1.toFixed(2)
                  )}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      {isLoading ? (
                        <div className="w-[25px] h-[25px] aspect-square rounded-full bg-grey/60" />
                      ) : (
                        <img height="25" width="25" src={tokenOut.logoURI} />
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
              <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-x-4">
                  <h1 className="uppercase text-white md:block hidden">
                    Price Range
                  </h1>
                  {isLoading ? (
                    <div className="h-6 w-28 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : Number(rangePoolData.tickAtPrice) <
                      Number(rangePositionData.min) ||
                    Number(rangePoolData.tickAtPrice) >=
                      Number(rangePositionData.max) ? (
                    <span className="text-yellow-600 text-xs bg-yellow-900/30 px-4 py-1 rounded-[4px]">
                      OUT OF RANGE
                    </span>
                  ) : (
                    <span className="text-green-600 text-xs bg-green-900/30 px-4 py-1 rounded-[4px]">
                      IN RANGE
                    </span>
                  )}
                </div>
                <div
                  onClick={() => setPriceOrder(!priceOrder)}
                  className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
                >
                  {priceOrder ? <>{tokenOut.symbol}</> : <>{tokenIn.symbol}</>}{" "}
                  per{" "}
                  {priceOrder ? <>{tokenIn.symbol}</> : <>{tokenOut.symbol}</>}{" "}
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
                      ) : (
                        invertPrice(
                          priceOrder ? lowerPrice : upperPrice,
                          priceOrder
                        )
                      )}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {priceOrder ? tokenIn.symbol : tokenOut.symbol} at this
                      price.
                    </span>
                  </div>
                  <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs">MAX. PRICE</span>
                    <span className="text-white text-2xl md:text-3xl">
                      {isLoading ? (
                        <div className="h-9 w-36 bg-grey/60 animate-pulse rounded-[4px]" />
                      ) : (
                        invertPrice(
                          priceOrder ? upperPrice : lowerPrice,
                          priceOrder
                        )
                      )}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {priceOrder ? tokenOut.symbol : tokenIn.symbol} at this
                      price.
                    </span>
                  </div>
                </div>
                <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                  <span className="text-grey1 text-xs">CURRENT. PRICE</span>
                  <span className="text-white text-3xl text-grey1">
                    {isLoading ? (
                      <div className="h-9 w-36 bg-grey/60 animate-pulse rounded-[4px]" />
                    ) : rangePositionData.price ? (
                      invertPrice(
                        TickMath.getPriceStringAtSqrtPrice(
                          JSBI.BigInt(rangePositionData.price),
                          tokenIn,
                          tokenOut
                        ),
                        priceOrder
                      )
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-dark border-grey rounded-[4px] lg:w-1/2 w-full p-5 h-min">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Earned Fees</h1>
              {isLoading ? (
                <div className="h-6 w-36 bg-grey/60 animate-pulse rounded-[4px]" />
              ) : (
                <span className="text-grey1">
                  ${(amount0FeesUsd + amount1FeesUsd).toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  {isLoading ? (
                    <div className="h-4 w-14 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    <span>~${amount0FeesUsd.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {isLoading ? (
                    <div className="h-8 w-40 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    amount0Fees.toFixed(2)
                  )}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      {isLoading ? (
                        <div className="w-[25px] h-[25px] aspect-square rounded-full bg-grey/60" />
                      ) : (
                        <img height="25" width="25" src={tokenIn.logoURI} />
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
              <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2 mb-5">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  {isLoading ? (
                    <div className="h-4 w-14 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    <span>~${amount1FeesUsd.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {isLoading ? (
                    <div className="h-8 w-40 bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    amount1Fees.toFixed(2)
                  )}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      {isLoading ? (
                        <div className="w-[25px] h-[25px] aspect-square rounded-full bg-grey/60" />
                      ) : (
                        <img height="25" width="25" src={tokenOut.logoURI} />
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
              <RangeCompoundButton
                poolAddress={rangePoolAddress}
                address={address}
                positionId={rangePositionData.positionId}
                staked={rangePositionData.staked ?? true}
              />
              <RangeCollectButton
                poolAddress={rangePoolAddress}
                address={address}
                positionId={rangePositionData.positionId}
                staked={rangePositionData.staked ?? true}
              />
            </div>
          </div>
        </div>
      </div>
      {rangePositionData.price ? (
        <>
          <RemoveLiquidity
            isOpen={isRemoveOpen}
            setIsOpen={setIsRemoveOpen}
            signer={signer}
            staked={rangePositionData.staked ?? true}
          />
          <AddLiquidity isOpen={isAddOpen} setIsOpen={setIsAddOpen} />
        </>
      ) : null}
    </div>
  );
}
