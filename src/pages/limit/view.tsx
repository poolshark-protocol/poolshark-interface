import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount, useContractRead, useSigner } from "wagmi";
import LimitCollectButton from "../../components/Buttons/LimitCollectButton";
import { BigNumber, ethers } from "ethers";
import { TickMath } from "../../utils/math/tickMath";
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
import { useTradeStore } from "../../hooks/useTradeStore";

export default function ViewLimit() {
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
    setNeedsSnapshot,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setLimitPositionData,
    setTokenInLimitUSDPrice,
    setTokenOutLimitUSDPrice,
    setClaimTick,
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
    state.setNeedsSnapshot,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setLimitPositionData,
    state.setTokenInRangeUSDPrice,
    state.setTokenOutRangeUSDPrice,
    state.setClaimTick,
  ]);

  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  const router = useRouter();

  //limit aux
  const [priceDirection, setPriceDirection] = useState(false);
  const [limitFilledAmount, setLimitFilledAmount] = useState("");
  const [currentAmountOut, setCurrentAmountOut] = useState("");
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

  const [lowerInverse, setLowerInverse] = useState(0);
  const [upperInverse, setUpperInverse] = useState(0);
  const [priceInverse, setPriceInverse] = useState(0);

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
  }, []);

  useEffect(() => {
    getLimitPoolRatios();
  }, [tokenIn.USDPrice, tokenOut.USDPrice]);

  //TODO need to be set to utils
  const getLimitPoolRatios = () => {
    console.log("limit pool data", limitPoolData);
    try {
      if (limitPoolData != undefined) {
        setLowerInverse(
          parseFloat(
            (
              tokenOut.USDPrice /
              Number(
                TickMath.getPriceStringAtTick(Number(limitPositionData.max))
              )
            ).toPrecision(6)
          )
        );
        setUpperInverse(
          parseFloat(
            (
              tokenOut.USDPrice /
              Number(
                TickMath.getPriceStringAtTick(Number(limitPositionData.min))
              )
            ).toPrecision(6)
          )
        );
        setPriceInverse(
          parseFloat(
            (
              tokenOut.USDPrice /
              Number(
                TickMath.getPriceStringAtSqrtPrice(
                  JSBI.BigInt(Number(limitPoolData.poolPrice))
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

  ////////////////////////////////Filled Amount
  const { data: filledAmount } = useContractRead({
    address: limitPoolAddress,
    abi: limitPoolABI,
    functionName: "snapshotLimit",
    args: [
      [
        address,
        ethers.utils.parseUnits("1", 38),
        Number(limitPositionData.positionId),
        BigNumber.from(claimTick),
        tokenIn.callId == 0,
      ],
    ],
    chainId: 421613,
    watch: needsSnapshot,
    enabled:
      BigNumber.from(claimTick).lt(BigNumber.from("887272")) &&
      isConnected &&
      limitPoolAddress.toString() != "" &&
      needsSnapshot == true,
    onSuccess(data) {
      console.log("Success price filled amount", data);
      setNeedsSnapshot(false)
    },
    onError(error) {
      console.log("Error price Limit", error);
      console.log(
        "claim tick snapshot args",
        address,
        BigNumber.from("0").toString(),
        limitPositionData.min.toString(),
        limitPositionData.max.toString(),
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
        ethers.utils.formatUnits(filledAmount[0], tokenIn.decimals)
      );

      setCurrentAmountOut(
        ethers.utils.formatUnits(filledAmount[1], tokenOut.decimals)
      )
    }
  }, [filledAmount]);

  ////////////////////////////////Claim Tick
  useEffect(() => {
    if (limitPositionData != undefined) {
      updateClaimTick();
    }
  }, []);
  
  useEffect(() => {
    setTimeout(() => {
      updateClaimTick();
    }, 3000);
  }, [claimTick]);

  async function updateClaimTick() {
    const aux = await getClaimTick(
      limitPoolAddress.toString(),
      Number(limitPositionData.min),
      Number(limitPositionData.max),
      tokenIn.callId == 0,
      Number(limitPositionData.epochLast),
      false
    );

    setClaimTick(aux);
  }

  async function getUserLimitPositionData() {
    try {
      const data = await fetchLimitPositions(address.toLowerCase());
      if (data["data"]) {
        setAllLimitPositions(
          mapUserLimitPositions(data["data"].limitPositions)
        );
      }
    } catch (error) {
      console.log('limit error', error);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (needsRefetch == true || needsPosRefetch == true) {
        getUserLimitPositionData();

        const positionId = limitPositionData.positionId;
        const position = allLimitPositions.find(
          (position) => position.positionId == positionId
        );
        console.log("new position", position);

        if (position != undefined) {
          setLimitPositionData(position);
        }

        setNeedsRefetch(false);
        setNeedsPosRefetch(false);
      }
    }, 2000);
  }, [needsRefetch, needsPosRefetch]);

  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="flex flex-col pt-10 text-white relative min-h-[calc(100vh-76px)] container mx-auto">
        <div className="flex justify-between w-full items-center">
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
                  0.9 USDC
                  <DoubleArrowIcon />
                  1.2 USDC
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-4">
            <button
              className="bg-main1 border border-main text-main2 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
              onClick={() => setIsAddOpen(true)}
            >
              Add Liquidity
            </button>
            <button
              className="bg-black border border-grey transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px] text-grey1"
              onClick={() => setIsRemoveOpen(true)}
            >
              Remove Liquidity
            </button>
          </div>
        </div>
        <div className="flex justify-between w-full mt-8  gap-x-10">
          <div className="border border-grey rounded-[4px] w-1/2 p-5">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Remaining Liquidity</h1>
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  <span>
                  ~$
                    {!isNaN(Number(currentAmountOut)) && !isNaN(tokenOut.USDPrice) ? (
                      (
                        Number(
                            currentAmountOut
                        ) * tokenIn.USDPrice
                      ).toFixed(2)
                    ) : ("0.00")}
                  </span>
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {Number(
                      currentAmountOut
                  ).toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                      <img height="28" width="25" src={tokenIn.logoURI} />
                      {tokenIn.symbol}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-x-4">
                  <h1 className="uppercase text-white">Price Range</h1>
                  {limitPositionData.min &&
                  limitPositionData.max &&
                  limitPoolData.poolPrice ? (
                    parseFloat(
                    TickMath.getPriceStringAtSqrtPrice(
                      JSBI.BigInt(Number(limitPoolData.poolPrice))
                    )
                  ) <
                    parseFloat(
                      TickMath.getPriceStringAtTick(
                        Number(limitPositionData.min)
                      )
                    ) ||
                  parseFloat(
                    TickMath.getPriceStringAtSqrtPrice(
                      JSBI.BigInt(Number(limitPoolData.poolPrice))
                    )
                  ) >=
                    parseFloat(
                      TickMath.getPriceStringAtTick(
                        Number(limitPositionData.max)
                      )
                    ) ? (
                    <span className="text-yellow-600 text-xs bg-yellow-900/30 px-4 py-1 rounded-[4px]">
                      OUT OF RANGE
                    </span>
                  ) : (
                    <span className="text-green-600 text-xs bg-green-900/30 px-4 py-1 rounded-[4px]">
                      IN RANGE
                    </span>
                  )) : null}
                </div>
                <div
                  onClick={() => setPriceDirection(!priceDirection)}
                  className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
                >
                  {tokenIn.callId == 0
                    ? priceDirection
                      ? tokenOut.symbol
                      : tokenIn.symbol
                    : priceDirection
                    ? tokenIn.symbol
                    : tokenOut.symbol}{" "}
                  per{" "}
                  {tokenIn.callId == 0
                    ? priceDirection
                      ? tokenIn.symbol
                      : tokenOut.symbol
                    : priceDirection
                    ? tokenOut.symbol
                    : tokenIn.symbol}
                  <DoubleArrowIcon />
                </div>
              </div>
              <div className="flex flex-col gap-y-4">
                <div className="flex items-center gap-x-5 mt-3">
                  <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs">MIN. PRICE</span>
                    <span className="text-white text-3xl">
                      {limitPositionData.min === undefined
                        ? ""
                        : priceDirection
                        ? lowerInverse
                        : TickMath.getPriceStringAtTick(
                            Number(limitPositionData.min)
                          )}
                    </span>
                    <span className="text-grey1 text-[9px]">
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
                    <span className="text-white text-3xl">
                      {limitPositionData.max === undefined
                        ? ""
                        : priceDirection
                        ? upperInverse
                        : TickMath.getPriceStringAtTick(
                            Number(limitPositionData.max)
                          )}
                    </span>
                    <span className="text-grey1 text-[9px]">
                      Your position will be 100%{" "}
                      {tokenIn.callId == 0
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
                  <span className="text-grey1 text-xs">CURRENT PRICE</span>
                  <span className="text-white text-3xl text-grey1">
                    {limitPoolData?.poolPrice ?
                      priceDirection
                        ? priceInverse
                        : TickMath.getPriceStringAtSqrtPrice(
                            JSBI.BigInt(Number(limitPoolData.poolPrice))
                          )
                        : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-dark border-grey rounded-[4px] w-1/2 p-5 h-min">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Filled Liquidity</h1>
              {!isNaN(limitPositionData.amountIn) && !isNaN(Number(limitFilledAmount)) ? (
                <span className="text-grey1">${Number(limitFilledAmount).toFixed(2)}
                  <span className="text-grey">
                    /
                    {Number(
                      ethers.utils.formatUnits(
                        limitPositionData.amountIn.toString(),
                        18
                      )
                    ).toFixed(2)}
                  </span>
                </span>) : (
                  <span className="text-grey1">$0.00
                    <span className="text-grey">
                      /0.00
                    </span>
                  </span>)
              }
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  {!isNaN(Number(limitFilledAmount)) && !isNaN(tokenOut.USDPrice) ? (
                    <span>
                      ~$
                      {(
                        Number(limitFilledAmount) * tokenOut.USDPrice
                      ).toFixed(2)}
                    </span>) :
                    <span>
                      ~$0.00
                    </span>
                  }
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {Number(limitFilledAmount).toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
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
                gasLimit={limitMintParams.gasLimit.mul(150).div(100)}
                gasFee={limitMintParams.gasFee}
              />
              {/*TO-DO: add positionOwner ternary again*/}
            </div>
          </div>
        </div>
      </div>
      {limitPositionData.amountIn ?
        <>
        <RemoveLiquidity
          isOpen={isRemoveOpen}
          setIsOpen={setIsRemoveOpen}
          address={address}
          currentAmountOut={currentAmountOut}
        />
        <AddLiquidity
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          address={address}
        />
        </> : null}
    </div>
  );
}
