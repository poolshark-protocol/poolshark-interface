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
    limitMintParams,
    tokenIn,
    tokenOut,
    needsRefetch,
    needsPosRefetch,
    claimTick,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setLimitPositionData,
    setTokenInLimitUSDPrice,
    setTokenOutLimitUSDPrice,
    setClaimTick,
  ] = useRangeLimitStore((state) => [
    state.limitPoolAddress,
    state.limitPositionData,
    state.limitMintParams,
    state.tokenIn,
    state.tokenOut,
    state.needsRefetch,
    state.needsPosRefetch,
    state.claimTick,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setLimitPositionData,
    state.setTokenInRangeUSDPrice,
    state.setTokenOutRangeUSDPrice,
    state.setClaimTick,
  ]);

  const [limitPoolData] = useTradeStore((state) => [state.tradePoolData]);

  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  const router = useRouter();

  //limit aux
  const [priceDirection, setPriceDirection] = useState(false);
  const [fillPercent, setFillPercent] = useState(0);
  const [limitFilledAmount, setLimitFilledAmount] = useState("");
  const [currentAmountOut, setCurrentAmountOut] = useState("");
  const [allLimitPositions, setAllLimitPositions] = useState([]);

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
    address: limitPoolAddress.toString(),
    abi: limitPoolABI,
    functionName: "snapshotLimit",
    args: [
      [
        address,
        BigNumber.from("0"),
        Number(limitPositionData.positionId),
        BigNumber.from(claimTick),
        Boolean(limitPositionData.zeroForOne),
      ],
    ],
    chainId: 421613,
    watch: true,
    enabled:
      BigNumber.from(claimTick).lt(BigNumber.from("887272")) &&
      isConnected &&
      limitPoolAddress.toString() != "",
    onSuccess(data) {
      console.log("Success price filled amount", data);
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
        Boolean(limitPositionData.zeroForOne),
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

  useEffect(() => {
    if (limitFilledAmount && limitPositionData.amountIn) {
      setFillPercent(
        Number(limitFilledAmount) /
          Number(
            ethers.utils.formatUnits(
              limitPositionData.amountIn.toString(),
              18
            )
          )
      );
    }
  }, [limitFilledAmount]);

  ////////////////////////////////Claim Tick

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
      Boolean(limitPositionData.zeroForOne),
      Number(limitPositionData.epochLast),
      true
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
                    {(
                      Number(
                          currentAmountOut
                      ) * tokenIn.USDPrice
                    ).toFixed(2)}
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
                  {parseFloat(
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
                  )}
                </div>
                <div
                  onClick={() => setPriceDirection(!priceDirection)}
                  className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
                >
                  {Boolean(limitPositionData.zeroForOne)
                    ? priceDirection
                      ? tokenOut.symbol
                      : tokenIn.symbol
                    : priceDirection
                    ? tokenIn.symbol
                    : tokenOut.symbol}{" "}
                  per{" "}
                  {Boolean(limitPositionData.zeroForOne)
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
                      {Boolean(limitPositionData.zeroForOne)
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
                      {Boolean(limitPositionData.zeroForOne)
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
                    {limitPoolData?.poolPrice ?
                      priceDirection
                        ? priceInverse
                        : TickMath.getPriceStringAtSqrtPrice(
                            JSBI.BigInt(Number(limitPoolData.poolPrice))
                          )
                        : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-dark border-grey rounded-[4px] w-1/2 p-5 h-min">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Filled Liquidity</h1>
              {limitPositionData.amountIn ? (
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
                </span>) : null
              }
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  <span>
                    ~$
                    {(
                      Number(limitFilledAmount) * tokenOut.USDPrice
                    ).toFixed(2)}
                  </span>
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
                zeroForOne={Boolean(limitPositionData.zeroForOne)}
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
