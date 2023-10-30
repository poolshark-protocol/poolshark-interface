import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount, useContractRead, useSigner } from "wagmi";
import LimitCollectButton from "../../components/Buttons/LimitCollectButton";
import { BigNumber, ethers } from "ethers";
import { TickMath, invertPrice } from "../../utils/math/tickMath";
import { limitPoolABI } from "../../abis/evm/limitPool";
import { getClaimTick, mapUserLimitPositions } from "../../utils/maps";
import RemoveLiquidity from "../../components/Modals/Limit/RemoveLiquidity";
import AddLiquidity from "../../components/Modals/Limit/AddLiquidity";
import { fetchLimitTokenUSDPrice } from "../../utils/tokens";
import { fetchLimitPositions } from "../../utils/queries";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import ExternalLinkIcon from "../../components/Icons/ExternalLinkIcon";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import JSBI from "jsbi";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { gasEstimateBurnLimit } from "../../utils/gas";
import { getExpectedAmountOut, getExpectedAmountOutFromInput } from "../../utils/math/priceMath";
import { useConfigStore } from "../../hooks/useConfigStore";
import { parseUnits } from "../../utils/math/valueMath";
import { formatUnits } from "ethers/lib/utils.js";
import { chainProperties } from "../../utils/chains";

export default function ViewLimit() {
  const [chainId, networkName, limitSubgraph, setLimitSubgraph] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.limitSubgraph,
    state.setLimitSubgraph
  ]);

  const [
    limitPoolAddress,
    limitPositionData,
    limitPoolData,
    limitMintParams,
    tokenIn,
    tokenOut,
    needsRefetch,
    needsPosRefetch,
    claimTick,
    needsSnapshot,
    currentAmountOut,
    setTokenIn,
    setTokenOut,
    setLimitPoolAddress,
    setNeedsSnapshot,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setLimitPositionData,
    setLimitPoolFromVolatility,
    setTokenInLimitUSDPrice,
    setTokenOutLimitUSDPrice,
    setClaimTick,
    setCurrentAmountOut,
  ] = useRangeLimitStore((state) => [
    state.limitPoolAddress,
    state.limitPositionData,
    state.limitPoolData,
    state.limitMintParams,
    state.tokenIn,
    state.tokenOut,
    state.needsRefetch,
    state.needsPosRefetch,
    state.claimTick,
    state.needsSnapshot,
    state.currentAmountOut,
    state.setTokenIn,
    state.setTokenOut,
    state.setLimitPoolAddress,
    state.setNeedsSnapshot,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setLimitPositionData,
    state.setLimitPoolFromVolatility,
    state.setTokenInRangeUSDPrice,
    state.setTokenOutRangeUSDPrice,
    state.setClaimTick,
    state.setCurrentAmountOut,
  ]);

  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  //limit aux
  const [priceDirection, setPriceDirection] = useState(tokenIn.callId == 0);
  const [limitFilledAmount, setLimitFilledAmount] = useState("");
  const [allLimitPositions, setAllLimitPositions] = useState([]);

  //Display and copy flags
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const [poolDisplay, setPoolDisplay] = useState(
    limitPoolAddress
      ? limitPoolAddress.toString().substring(0, 6) +
          "..." +
          limitPoolAddress
            .toString()
            .substring(
              limitPoolAddress.toString().length - 4,
              limitPoolAddress.toString().length
            )
      : undefined
  );

  const [collectGasLimit, setCollectGasLimit] = useState(BN_ZERO);
  const [collectGasFee, setCollectGasFee] = useState("$0.00");

  ////////////////////////////////Fetch Pool Data
  useEffect(() => {
    if (limitPoolData.token0 && limitPoolData.token1) {
      if (tokenIn.address) {
        fetchLimitTokenUSDPrice(
          limitPoolData,
          tokenIn,
          setTokenInLimitUSDPrice
        );
      }
      if (tokenOut.address) {
        fetchLimitTokenUSDPrice(
          limitPoolData,
          tokenOut,
          setTokenOutLimitUSDPrice
        );
      }
    }
  }, [limitFilledAmount, tokenIn.address, tokenOut.address]);

  useEffect(() => {
    if (limitPoolAddress != undefined && limitPositionData.tokenIn != undefined) {
      setPoolDisplay(
        limitPoolAddress.toString().substring(0, 6) +
            "..." +
            limitPoolAddress
              .toString()
              .substring(
                limitPoolAddress.toString().length - 4,
                limitPoolAddress.toString().length
              )
      )
      setNeedsSnapshot(true)
      setLimitPoolFromVolatility(
        limitPositionData.tokenIn,
        limitPositionData.tokenOut,
        limitPositionData.feeTier,
        limitSubgraph
      );

    }
  }, [limitPositionData.tokenIn]);

  ////////////////////////////////Filled Amount
  const { data: filledAmount } = useContractRead({
    address: limitPoolAddress,
    abi: limitPoolABI,
    functionName: "snapshotLimit",
    args: [
      [
        address,
        parseUnits("1", 38),
        Number(limitPositionData.positionId),
        BigNumber.from(claimTick),
        tokenIn.callId == 0,
      ],
    ],
    chainId: chainId,
    watch: true,
    enabled:
      isConnected &&
      limitPositionData.positionId != undefined &&
      claimTick >= Number(limitPositionData.min) &&
      claimTick <= Number(limitPositionData.max),
    onSuccess(data) {
      console.log("Success price filled amount", data);
      setNeedsSnapshot(false);
    },
    onError(error) {
      console.log("Error price Limit", error);
      console.log(
        "claim tick snapshot args",
        address,
        BigNumber.from("0").toString(),
        limitPositionData?.min?.toString(),
        limitPositionData?.max?.toString(),
        claimTick.toString(),
        tokenIn.callId == 0,
        router.isReady
      );
    },
    onSettled(data, error) {
      //console.log('Settled price Limit', { data, error })
    },
  });

  useEffect(() => {
    if (filledAmount) {
      setLimitFilledAmount(
        ethers.utils.formatUnits(filledAmount[0], tokenOut.decimals)
      );
      setCurrentAmountOut(
        ethers.utils.formatUnits(filledAmount[1], tokenIn.decimals)
      );
    }
  }, [filledAmount]);

  ////////////////////////////////Claim Tick
  useEffect(() => {
    if (limitPositionData != undefined) {
      updateClaimTick();
    }
  }, []);

  useEffect(() => {
    if (limitPoolAddress != undefined) {
      setNeedsSnapshot(true)
      setTimeout(() => {
        updateClaimTick();
      }, 3000);
      updateCollectFee();
    }
  }, [claimTick, limitPoolAddress, limitPositionData]);

  async function updateClaimTick() {
    if (limitPositionData.min != undefined &&
        limitPositionData.max != undefined &&
        limitPositionData.epochLast != undefined &&
        limitPoolAddress != undefined)
    {
      const aux = await getClaimTick(
        limitPoolAddress.toString(),
        Number(limitPositionData.min),
        Number(limitPositionData.max),
        tokenIn.callId == 0,
        Number(limitPositionData.epochLast),
        false,
        limitSubgraph
      );
        
      setClaimTick(aux);
      console.log("claim tick", aux);
    }  
  }

  async function getUserLimitPositionData() {
    try {
      const data = await fetchLimitPositions(limitSubgraph, address.toLowerCase());
      if (data["data"].limitPositions) {
        const mappedPositions = mapUserLimitPositions(
          data["data"].limitPositions
        )
        setAllLimitPositions(mappedPositions);
        const positionId = limitPositionData.id ?? router.query.id;
        if (positionId == undefined) return
        const position = mappedPositions.find(
          (position) => position.id == positionId
        );
        if (position != undefined) {
          setLimitPoolAddress(position.poolId)
          setNeedsSnapshot(true);
          setLimitPositionData(position);
          setTokenIn(position.tokenOut, position.tokenIn, '0', true)
          setTokenOut(position.tokenIn, position.tokenOut, '0', false)
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.log("limit error", error);
    }
  }

  useEffect(() => {
    const chainConstants = chainProperties[networkName]
    ? chainProperties[networkName]
    : chainProperties["arbitrumGoerli"];
    setLimitSubgraph(chainConstants["limitSubgraphUrl"]);
    if ( limitPositionData.positionId == undefined ||
         needsRefetch ||
         needsPosRefetch
    ) {
      getUserLimitPositionData();
      setNeedsRefetch(false);
      setNeedsPosRefetch(false);
    } else {
      setIsLoading(false);
    }
  }, [needsRefetch, needsPosRefetch, limitPositionData.positionId, router.query.id]);

  ////////////////////////////////Collect Gas
  async function updateCollectFee() {
    if (
      signer != undefined &&
      claimTick >= Number(limitPositionData.min) &&
      claimTick <= Number(limitPositionData.max)
    ) {

      await gasEstimateBurnLimit(
        limitPoolAddress,
        address,
        BigNumber.from(0),
        limitPositionData.positionId,
        BigNumber.from(claimTick),
        tokenIn.callId == 0,
        signer,
        setCollectGasFee,
        setCollectGasLimit
      );
    }
  }

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="flex flex-col pt-10 pb-32 md:pb-0 text-white relative min-h-[calc(100vh-76px)] container mx-auto md:px-0 px-3">
        <div className="flex md:flex-row flex-col justify-between w-full items-start md:items-center gap-y-5">
          <div className="flex items-center gap-x-3">
            <div className="flex items-center">
              <img height="50" width="50" src={tokenIn.logoURI} />
              <img
                height="50"
                width="50"
                className="ml-[-12px]"
                src={tokenOut.logoURI}
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center text-white">
                <h1>
                  {tokenIn.symbol}-{tokenOut.symbol}
                </h1>
                <a
                  href={
                    "https://goerli.arbiscan.io/address/" + limitPoolAddress
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
                <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                  {Number(limitPositionData.feeTier) / 10000}%
                </span>
                <div className="flex items-center gap-x-2 text-grey1 text-xs">
                  {TickMath.getPriceStringAtTick(
                    Number(limitPositionData.min),
                    tokenIn,
                    tokenOut
                  )}{" "}
                  {tokenOut.symbol}
                  <DoubleArrowIcon />
                  {TickMath.getPriceStringAtTick(
                    Number(limitPositionData.max),
                    tokenIn,
                    tokenOut
                  )}{" "}
                  {tokenOut.symbol}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-4 w-full md:w-auto">
            <button
              className="bg-main1 w-full border border-main text-main2 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
              onClick={() => setIsAddOpen(true)}
            >
              Add Liquidity
            </button>
            <button
              className="bg-black whitespace-nowrap w-full border border-grey transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px] text-grey1"
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
                  <span>
                    ~$
                    {!isNaN(Number(currentAmountOut)) &&
                    !isNaN(tokenIn.USDPrice)
                      ? (Number(currentAmountOut) * tokenIn.USDPrice).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {Number(currentAmountOut).toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      <img height="28" width="25" src={tokenIn.logoURI} />
                      {tokenIn.symbol}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-x-4">
                  <h1 className="uppercase text-white md:block hidden">
                    Price Range
                  </h1>
                  {limitPositionData.min &&
                  limitPositionData.max &&
                  limitPoolData.poolPrice ? (
                    parseFloat(
                      TickMath.getPriceStringAtSqrtPrice(
                        JSBI.BigInt(Number(limitPoolData.poolPrice)),
                        tokenIn,
                        tokenOut
                      )
                    ) <
                      parseFloat(
                        TickMath.getPriceStringAtTick(
                          Number(limitPositionData.min),
                          tokenIn,
                          tokenOut
                        )
                      ) ||
                    parseFloat(
                      TickMath.getPriceStringAtSqrtPrice(
                        JSBI.BigInt(Number(limitPoolData.poolPrice)),
                        tokenIn,
                        tokenOut
                      )
                    ) >=
                      parseFloat(
                        TickMath.getPriceStringAtTick(
                          Number(limitPositionData.max),
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
                  {(tokenIn.callId == 0) == priceDirection
                    ? tokenOut.symbol
                    : tokenIn.symbol}{" "}
                  per{" "}
                  {(tokenIn.callId == 0) == priceDirection
                    ? tokenIn.symbol
                    : tokenOut.symbol}
                  <DoubleArrowIcon />
                </div>
              </div>
              <div className="flex flex-col gap-y-4">
                <div className="flex items-center gap-x-5 mt-3">
                  <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs">MIN. PRICE</span>
                    <span className="text-white text-2xl md:text-3xl">
                      {limitPositionData.min === undefined
                        ? ""
                        : invertPrice(
                            TickMath.getPriceStringAtTick(
                              Number(
                                priceDirection
                                  ? limitPositionData.min
                                  : limitPositionData.max
                              ),
                              tokenIn,
                              tokenOut
                            ),
                            priceDirection
                          )}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {tokenIn.callId == 0
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
                      {limitPositionData.max === undefined
                        ? ""
                        : invertPrice(
                            TickMath.getPriceStringAtTick(
                              Number(
                                priceDirection
                                  ? limitPositionData.max
                                  : limitPositionData.min
                              ),
                              tokenIn,
                              tokenOut
                            ),
                            priceDirection
                          )}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {(tokenIn.callId == 0) == priceDirection
                        ? tokenOut.symbol
                        : tokenIn.symbol}{" "}
                      at this price.
                    </span>
                  </div>
                </div>
                <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                  <span className="text-grey1 text-xs">CURRENT PRICE</span>
                  <span className="text-white text-3xl text-grey1">
                    {limitPoolData?.poolPrice
                      ? invertPrice(
                          TickMath.getPriceStringAtSqrtPrice(
                            JSBI.BigInt(Number(limitPoolData.poolPrice)),
                            tokenIn,
                            tokenOut
                          ),
                          priceDirection
                        )
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-dark border-grey rounded-[4px] lg:w-1/2 w-full p-5 h-min">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Filled Liquidity</h1>
              {!isNaN(Number(limitPositionData?.amountIn)) &&
              !isNaN(Number(limitFilledAmount)) ? (
                <span className="text-grey1">
                  {Number(limitFilledAmount).toFixed(2)}
                  <span className="text-grey">
                    /
                    {(
                      parseFloat(
                        ethers.utils.formatUnits(
                          getExpectedAmountOut(
                            limitPositionData.min,
                            limitPositionData.max,
                            limitPositionData.tokenIn.id.localeCompare(limitPositionData.tokenOut.id) < 0,
                            BigNumber.from(limitPositionData.liquidity)
                          ),
                          limitPositionData.tokenOut.decimals
                        )
                      )
                    ).toFixed(2)}
                  </span>
                </span>) : (
                  <span className="text-grey1">{limitFilledAmount}
                    <span className="text-grey">
                      /{0.00}
                    </span>
                  </span>)
              }
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  {!isNaN(Number(limitFilledAmount)) &&
                  !isNaN(tokenOut.USDPrice) ? (
                    <span>
                      ~$
                      {(Number(limitFilledAmount) * tokenOut.USDPrice).toFixed(
                        2
                      )}
                    </span>
                  ) : (
                    <span>~$0.00</span>
                  )}
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {Number(limitFilledAmount).toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      <img height="28" width="25" src={tokenOut.logoURI} />
                      {tokenOut.symbol}
                    </div>
                  </div>
                </div>
              </div>
              {/**TO-DO: PASS PROPS */}
              <LimitCollectButton
                poolAddress={limitPoolAddress}
                address={address}
                positionId={limitPositionData.positionId}
                claim={BigNumber.from(claimTick)}
                zeroForOne={tokenIn.callId == 0}
                gasLimit={collectGasLimit}
                gasFee={collectGasFee}
              />
              {/*TO-DO: add positionOwner ternary again*/}
            </div>
          </div>
        </div>
      </div>
      {limitPositionData.amountIn ? (
        <>
          <RemoveLiquidity
            isOpen={isRemoveOpen}
            setIsOpen={setIsRemoveOpen}
            address={address}
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
