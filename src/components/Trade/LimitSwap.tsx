import { useEffect, useState } from "react";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useTradeStore } from "../../hooks/useTradeStore";
import useInputBox from "../../hooks/useInputBox";
import { useAccount, useContractRead, useSigner } from "wagmi";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import SwapRouterApproveButton from "../Buttons/SwapRouterApproveButton";
import LimitSwapButton from "../Buttons/LimitSwapButton";
import SelectToken from "../SelectToken";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { BigNumber, ethers } from "ethers";
import { inputHandler, parseUnits } from "../../utils/math/valueMath";
import { getSwapPools, limitPoolTypeIds } from "../../utils/pools";
import { QuoteParams } from "../../utils/types";
import {
  TickMath,
  invertPrice,
  maxPriceBn,
  minPriceBn,
} from "../../utils/math/tickMath";
import {
  displayPoolPrice,
  getMarketPriceAboveBelowString,
} from "../../utils/math/priceMath";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { chainProperties } from "../../utils/chains";
import LimitCreateAndMintButton from "../Buttons/LimitCreateAndMintButton";
import inputFilter from "../../utils/inputFilter";
import { getLimitTokenUsdPrice } from "../../utils/tokens";
import { gasEstimateMintLimit } from "../../utils/gas";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";

export default function LimitSwap() {
  const [chainId, networkName, limitSubgraph, setLimitSubgraph, logoMap] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
      state.setLimitSubgraph,
      state.logoMap,
    ]);

  //CONFIG STORE
  const [stateChainName, setStateChainName] = useState();

  const [
    tradePoolAddress,
    setTradePoolAddress,
    tradePoolData,
    setTradePoolData,
    tradeParams,
    pairSelected,
    setPairSelected,
    tradeSlippage,
    setTradeSlippage,
    tokenIn,
    setTokenIn,
    setTokenInAmount,
    setTokenInBalance,
    setTokenInTradeAllowance,
    setTokenInTradeUSDPrice,
    tokenOut,
    setTokenOut,
    setTokenOutBalance,
    setTokenOutTradeUSDPrice,
    amountIn,
    setAmountIn,
    amountOut,
    setAmountOut,
    needsAllowanceIn,
    setNeedsAllowanceIn,
    needsAllowanceOut,
    setNeedsAllowanceOut,
    needsBalanceIn,
    setNeedsBalanceIn,
    needsBalanceOut,
    setNeedsBalanceOut,
    limitPriceString,
    setLimitPriceString,
    switchDirection,
    setMintButtonState,
    needsRefetch,
    setNeedsRefetch,
    needsPosRefetch,
    setNeedsPosRefetch,
    needsSnapshot,
    setNeedsSnapshot,
  ] = useTradeStore((s) => [
    s.tradePoolAddress,
    s.setTradePoolAddress,
    s.tradePoolData,
    s.setTradePoolData,
    s.tradeParams,
    s.pairSelected,
    s.setPairSelected,
    s.tradeSlippage,
    s.setTradeSlippage,
    s.tokenIn,
    s.setTokenIn,
    s.setTokenInAmount,
    s.setTokenInBalance,
    s.setTokenInTradeAllowance,
    s.setTokenInTradeUSDPrice,
    s.tokenOut,
    s.setTokenOut,
    s.setTokenOutBalance,
    s.setTokenOutTradeUSDPrice,
    s.amountIn,
    s.setAmountIn,
    s.amountOut,
    s.setAmountOut,
    s.needsAllowanceIn,
    s.setNeedsAllowanceIn,
    s.needsAllowanceOut,
    s.setNeedsAllowanceOut,
    s.needsBalanceIn,
    s.setNeedsBalanceIn,
    s.needsBalanceOut,
    s.setNeedsBalanceOut,
    s.limitPriceString,
    s.setLimitPriceString,
    s.switchDirection,
    s.setMintButtonState,
    s.needsRefetch,
    s.setNeedsRefetch,
    s.needsPosRefetch,
    s.setNeedsPosRefetch,
    s.needsSnapshot,
    s.setNeedsSnapshot,
  ]);

  const {
    inputBox: inputBoxIn,
    display: displayIn,
    setDisplay: setDisplayIn,
  } = useInputBox();
  const {
    inputBox: inputBoxOut,
    display: displayOut,
    setDisplay: setDisplayOut,
  } = useInputBox();

  const { address, isDisconnected, isConnected } = useAccount();

  const { data: signer } = useSigner();

  const [priceRangeSelected, setPriceRangeSelected] = useState(false);

  /////////////////////////////Fetch Pools
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);

  async function updatePools(amount: BigNumber, isAmountIn: boolean) {
    const pools = await getSwapPools(
      limitSubgraph,
      tokenIn,
      tokenOut,
      setTradePoolData
    );
    const poolAdresses: string[] = [];
    const quoteList: QuoteParams[] = [];
    if (pools) {
      for (let i = 0; i < pools.length; i++) {
        const params: QuoteParams = {
          priceLimit: tokenIn.callId == 0 ? minPriceBn : maxPriceBn,
          amount: amount,
          exactIn: isAmountIn,
          zeroForOne: tokenIn.callId == 0,
        };
        quoteList[i] = params;
        poolAdresses[i] = pools[i].id;
      }
    }
    setAvailablePools(poolAdresses);
    setQuoteParams(quoteList);
  }

  /////////////////////////tokens and amounts

  //BOTH
  useEffect(() => {
    if (
      tokenIn.address != ZERO_ADDRESS &&
      (tradePoolData?.id == ZERO_ADDRESS || tradePoolData?.id == undefined)
    ) {
      getLimitTokenUsdPrice(
        tokenIn.address,
        setTokenInTradeUSDPrice,
        limitSubgraph
      );
    }
  }, [tokenIn.address]);

  //BOTH
  useEffect(() => {
    if (
      tokenOut.address != ZERO_ADDRESS &&
      (tradePoolData?.id == ZERO_ADDRESS || tradePoolData?.id == undefined)
    ) {
      getLimitTokenUsdPrice(
        tokenOut.address,
        setTokenInTradeUSDPrice,
        limitSubgraph
      );
    }
  }, [tokenOut.address]);

  const [limitPoolAddressList, setLimitPoolAddressList] = useState([]);
  const [limitPositionSnapshotList, setLimitPositionSnapshotList] = useState<
    any[]
  >([]);

  ///////////////////////////////Filled Amount
  const [limitFilledAmountList, setLimitFilledAmountList] = useState([]);
  const [currentAmountOutList, setCurrentAmountOutList] = useState([]);

  //BOTH
  const { data: filledAmountList } = useContractRead({
    address: chainProperties[networkName]["routerAddress"],
    abi: poolsharkRouterABI,
    functionName: "multiSnapshotLimit",
    args: [limitPoolAddressList, limitPositionSnapshotList],
    chainId: chainId,
    watch: needsSnapshot,
    enabled: isConnected && limitPoolAddressList.length > 0 && needsSnapshot,
    onSuccess(data) {
      // console.log("Success price filled amount", data);
      // console.log("snapshot address list", limitPoolAddressList);
      // console.log("snapshot params list", limitPositionSnapshotList);
      setNeedsSnapshot(false);
    },
    onError(error) {
      console.log("Error price Limit", error);
    },
  });

  //BOTH
  useEffect(() => {
    if (filledAmountList) {
      setLimitFilledAmountList(filledAmountList[0]);

      setCurrentAmountOutList(filledAmountList[1]);
    }
  }, [filledAmountList]);

  /////////////////////Double Input Boxes
  const [exactIn, setExactIn] = useState(true);

  const handleInputBox = (e) => {
    if (e.target.name === "tokenIn") {
      const [value, bnValue] = inputHandler(e, tokenIn);
      if (!pairSelected) {
        setDisplayIn(value);
        setDisplayOut("");
        setAmountIn(bnValue);
      }
      if (!bnValue.eq(amountIn)) {
        setDisplayIn(value);
        setAmountIn(bnValue);
        setAmounts(bnValue, true);
      } else {
        setDisplayIn(value);
        if (bnValue.eq(BN_ZERO)) {
          setDisplayOut(value);
        }
      }
      setExactIn(true);
    } else if (e.target.name === "tokenOut") {
      const [value, bnValue] = inputHandler(e, tokenOut);
      if (!pairSelected) {
        setDisplayOut(value);
        setDisplayIn("");
        setAmountOut(bnValue);
      } else if (!bnValue.eq(amountOut)) {
        setDisplayOut(value);
        setAmountOut(bnValue);
        setAmounts(bnValue, false);
      } else {
        setDisplayOut(value);
        if (bnValue.eq(BN_ZERO)) {
          setDisplayIn(value);
        }
      }
      setExactIn(false);
    }
  };

  const setAmounts = (bnValue: BigNumber, isAmountIn: boolean) => {
    if (isAmountIn) {
      if (bnValue.gt(BN_ZERO)) {
        updatePools(bnValue, true);
      } else {
        setDisplayOut("");
        setAmountOut(BN_ZERO);
      }
    } else {
      if (bnValue.gt(BN_ZERO)) {
        updatePools(bnValue, false);
      } else {
        setDisplayIn("");
        setAmountIn(BN_ZERO);
      }
    }
  };

  ///////////////////////////////Limit Params
  const [limitPriceOrder, setLimitPriceOrder] = useState(true);
  const [lowerPriceString, setLowerPriceString] = useState("0");
  const [upperPriceString, setUpperPriceString] = useState("0");

  const handlePriceSwitch = () => {
    setLimitPriceOrder(!limitPriceOrder);
    setLimitPriceString(invertPrice(limitPriceString, false));
    setLowerPriceString(invertPrice(upperPriceString, false));
    setUpperPriceString(invertPrice(lowerPriceString, false));
  };

  const resetAfterSwap = () => {
    setDisplayIn("");
    setDisplayOut("");
    setAmountIn(BN_ZERO);
    setAmountOut(BN_ZERO);
  };

  /////////////////////////////Ticks
  const [lowerTick, setLowerTick] = useState(BN_ZERO);
  const [upperTick, setUpperTick] = useState(BN_ZERO);

  useEffect(() => {
    if (
      !priceRangeSelected &&
      tradeSlippage &&
      limitPriceString &&
      tradePoolData?.feeTier?.tickSpacing
    ) {
      updateLimitTicks();
    }
  }, [limitPriceString, tradeSlippage, priceRangeSelected]);

  //LIMIT
  function updateLimitTicks() {
    const tickSpacing = tradePoolData.feeTier.tickSpacing;
    const priceString = invertPrice(limitPriceString, limitPriceOrder);
    if (isFinite(parseFloat(limitPriceString)) && parseFloat(priceString) > 0) {
      if (
        parseFloat(tradeSlippage) * 100 > tickSpacing &&
        parseFloat(priceString) > 0
      ) {
        const limitPriceTolerance =
          (parseFloat(priceString) *
            parseFloat((parseFloat(tradeSlippage) * 100).toFixed(6))) /
          10000;
        if (tokenIn.callId == 0) {
          const endPrice = parseFloat(priceString) - -limitPriceTolerance;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                priceString,
                tokenIn,
                tokenOut,
                tickSpacing
              )
            )
          );
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                String(endPrice),
                tokenIn,
                tokenOut,
                tickSpacing
              )
            )
          );
        } else {
          const endPrice = parseFloat(priceString) - limitPriceTolerance;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                String(endPrice),
                tokenIn,
                tokenOut,
                tickSpacing
              )
            )
          );
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                priceString,
                tokenIn,
                tokenOut,
                tickSpacing
              )
            )
          );
        }
      } else {
        if (tokenIn.callId == 0) {
          const endTick =
            TickMath.getTickAtPriceString(
              priceString,
              tokenIn,
              tokenOut,
              tickSpacing
            ) - -tickSpacing;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                priceString,
                tokenIn,
                tokenOut,
                tickSpacing
              )
            )
          );
          setUpperTick(BigNumber.from(String(endTick)));
        } else {
          const endTick =
            TickMath.getTickAtPriceString(
              priceString,
              tokenIn,
              tokenOut,
              tickSpacing
            ) - tickSpacing;
          setLowerTick(BigNumber.from(String(endTick)));
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                priceString,
                tokenIn,
                tokenOut,
                tickSpacing
              )
            )
          );
        }
      }
    }
  }

  ////////////////////////////////FeeTiers & Slippage
  const [priceImpact, setPriceImpact] = useState("0.00");

  ////////////////////////////////Gas
  //LIMIT
  const [mintFee, setMintFee] = useState("$0.00");
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

  //CAN BE SPLIT
  useEffect(() => {
    if (
      !amountIn.eq(BN_ZERO) &&
      !needsAllowanceIn &&
      tradePoolData != undefined
    ) {
      updateMintFee();
    }
  }, [tokenIn, tokenOut, lowerTick, upperTick, needsAllowanceIn]);

  async function updateMintFee() {
    if (tokenIn.userRouterAllowance?.gte(amountIn) && lowerTick?.lt(upperTick))
      await gasEstimateMintLimit(
        tradePoolData.id,
        address,
        lowerTick,
        upperTick,
        tokenIn,
        tokenOut,
        amountIn,
        signer,
        setMintFee,
        setMintGasLimit,
        networkName
      );
  }

  ////////////////////////////////
  const [expanded, setExpanded] = useState(false);

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div className="ml-auto text-xs">
              {pairSelected
                ? parseFloat(
                    ethers.utils.formatUnits(
                      amountOut ?? BN_ZERO,
                      tokenOut.decimals
                    )
                  ).toPrecision(6)
                : "Select Token"}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Minimum received after slippage ({tradeSlippage}%)
            </div>
            <div className="ml-auto text-xs">
              {(
                (parseFloat(
                  ethers.utils.formatUnits(amountOut, tokenOut.decimals)
                ) *
                  (100 - parseFloat(tradeSlippage))) /
                100
              ).toPrecision(6)}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Price Impact</div>
            <div className="ml-auto text-xs">
              {pairSelected
                ? priceImpact
                  ? priceImpact + "%"
                  : "0.00%"
                : "Select Token"}
            </div>
          </div>
        </div>
      );
    }
  };

  /////////////////////////////Rendering Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between w-full">
        <span className="text-[11px] text-grey1">FROM</span>
        <div className="cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 hover:opacity-60"
          >
            <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z" />
          </svg>
        </div>
      </div>
      <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
        <div className="flex items-end justify-between text-[11px] text-grey1">
          <span>
            ~$
            {!isNaN(parseInt(amountIn.toString())) &&
            !isNaN(tokenIn.decimals) &&
            !isNaN(tokenOut.USDPrice)
              ? (
                  parseFloat(
                    ethers.utils.formatUnits(
                      amountIn ?? BN_ZERO,
                      tokenIn.decimals
                    )
                  ) * (tokenIn.USDPrice ?? 0)
                ).toFixed(2)
              : (0).toFixed(2)}
          </span>
          <span>BALANCE: {tokenIn.userBalance}</span>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3">
          {inputBoxIn("0", tokenIn, "tokenIn", handleInputBox)}
          <div className="flex items-center gap-x-2">
            {isConnected && stateChainName === networkName ? (
              <button
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tokenIn.userBalance.toString(),
                      name: "tokenIn",
                    },
                  });
                }}
                className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
              >
                MAX
              </button>
            ) : (
              <></>
            )}
            <SelectToken
              index="0"
              key="in"
              type="in"
              tokenIn={tokenIn}
              setTokenIn={setTokenIn}
              tokenOut={tokenOut}
              setTokenOut={setTokenOut}
              displayToken={tokenIn}
              amount={exactIn ? displayIn : displayOut}
              isAmountIn={exactIn}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-full pt-7 pb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 cursor-pointer"
          onClick={() => {
            switchDirection(
              exactIn,
              exactIn ? displayIn : displayOut,
              exactIn ? setAmountIn : setAmountOut
            );
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
          />
        </svg>
      </div>
      <span className="text-[11px] text-grey1">TO</span>
      <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
        <div className="flex items-end justify-between text-[11px] text-grey1">
          <span>
            ~$
            {pairSelected &&
            !amountIn.eq(BN_ZERO) &&
            amountIn != undefined &&
            lowerTick != undefined &&
            upperTick != undefined &&
            tokenOut.address != ZERO_ADDRESS &&
            !isNaN(tokenOut.decimals) &&
            !isNaN(parseInt(amountOut.toString())) &&
            !isNaN(tokenOut.USDPrice) ? (
              (
                parseFloat(
                  ethers.utils.formatUnits(
                    amountOut ?? BN_ZERO,
                    tokenOut.decimals
                  )
                ) * (tokenOut.USDPrice ?? 0)
              ).toFixed(2)
            ) : (
              <>{(0).toFixed(2)}</>
            )}
          </span>
          <span>
            {pairSelected ? "Balance: " + tokenOut.userBalance : <></>}
          </span>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
          {<div>{inputBoxOut("0", tokenOut, "tokenOut", handleInputBox)}</div>}
          <div className="flex items-center gap-x-2">
            <SelectToken
              key={"out"}
              type="out"
              tokenIn={tokenIn}
              setTokenIn={setTokenIn}
              tokenOut={tokenOut}
              setTokenOut={setTokenOut}
              setPairSelected={setPairSelected}
              displayToken={tokenOut}
              amount={exactIn ? displayIn : displayOut}
              isAmountIn={exactIn}
            />
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-3 text-sm">
            <span className="md:block hidden">PRICE:</span>
            <div className="md:text-xs text-[10px]">
              <button
                className={`md:px-5 px-3 py-2 ${
                  priceRangeSelected
                    ? "bg-black border-l border-t border-b border-grey"
                    : "bg-main1 border border-main"
                }`}
                onClick={() => setPriceRangeSelected(false)}
              >
                EXACT PRICE
              </button>
              <button
                className={`md:px-5 px-3 py-2 ${
                  priceRangeSelected
                    ? "bg-main1 border border-main"
                    : "bg-black border-r border-t border-b border-grey"
                }`}
                onClick={() => setPriceRangeSelected(true)}
              >
                PRICE RANGE
              </button>
            </div>
          </div>
          <span
            className=" text-xs flex items-center gap-x-2 group cursor-pointer"
            onClick={handlePriceSwitch}
          >
            <span className="text-grey1 group-hover:text-white transition-all">
              {tokenIn.callId == 0 && pairSelected === false ? (
                <div>{tokenIn.symbol} per ?</div>
              ) : (
                <div>
                  {" "}
                  {limitPriceOrder == (tokenIn.callId == 0)
                    ? tokenOut.symbol + " per " + tokenIn.symbol
                    : tokenIn.symbol + " per " + tokenOut.symbol}
                </div>
              )}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="text-white w-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          </span>
        </div>
        {priceRangeSelected ? (
          <div>
            <div className="flex items-center justify-between gap-x-10 mt-4">
              <div className="border border-grey w-full bg-dark flex flex-col items-center justify-center py-4">
                <span className="text-center text-xs text-grey1 mb-2">
                  MIN. PRICE
                </span>
                <input
                  autoComplete="off"
                  className="outline-none bg-transparent text-3xl w-1/2 md:w-56 text-center mb-2"
                  value={
                    !isNaN(parseFloat(lowerPriceString)) ? lowerPriceString : 0
                  }
                  type="text"
                  onChange={(e) => {
                    setLowerPriceString(inputFilter(e.target.value));
                  }}
                />
              </div>
              <div className="border border-grey w-full bg-dark flex flex-col items-center justify-center py-4">
                <span className="text-center text-xs text-grey1 mb-2">
                  MAX. PRICE
                </span>
                <input
                  autoComplete="off"
                  className="outline-none bg-transparent text-3xl w-1/2 md:w-56 text-center mb-2"
                  value={
                    !isNaN(parseFloat(upperPriceString)) ? upperPriceString : 0
                  }
                  type="text"
                  onChange={(e) => {
                    setUpperPriceString(inputFilter(e.target.value));
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-dark py-3 px-5 border border-grey rounded-[4px] mt-4">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>
                {getMarketPriceAboveBelowString(
                  limitPriceString,
                  pairSelected,
                  limitPriceOrder,
                  tokenIn,
                  tokenOut
                )}
              </span>
            </div>
            <input
              autoComplete="off"
              className="bg-dark outline-none text-3xl my-3 w-60 md:w-auto"
              placeholder="0"
              value={limitPriceString}
              type="text"
              onChange={(e) => {
                if (e.target.value !== "" && e.target.value !== "0") {
                  setLimitPriceString(inputFilter(e.target.value));
                } else {
                  setLimitPriceString("0");
                }
              }}
            />
          </div>
        )}
      </div>
      {tokenIn.address != ZERO_ADDRESS &&
      tokenOut.address != ZERO_ADDRESS &&
      tradePoolData?.id == ZERO_ADDRESS ? (
        <div className="bg-dark border rounded-[4px] border-grey/50 p-5 mt-5">
          <p className="text-xs text-grey1 flex items-center gap-x-4 mb-5">
            This pool does not exist so a starting price must be set in order to
            add liquidity.
          </p>
          <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
            <span className="text-grey1 text-xs">STARTING PRICE</span>
            <span className="text-white text-3xl">
              <input
                autoComplete="off"
                className="bg-black py-2 outline-none text-center w-full"
                placeholder="0"
                id="startPrice"
                type="text"
              />
            </span>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="py-4">
        <div
          className="flex px-2 cursor-pointer py-2 rounded-[4px]"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
            {"1 " + tokenIn.symbol} ={" "}
            {displayPoolPrice(
              pairSelected,
              tradePoolData?.poolPrice,
              tokenIn,
              tokenOut
            ) +
              " " +
              tokenOut.symbol}
          </div>
          <div className="ml-auto text-xs uppercase text-[#C9C9C9]">
            <button>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-wrap w-full break-normal transition ">
          <Option />
        </div>
      </div>

      {isDisconnected ? (
        <ConnectWalletButton xl={true} />
      ) : (
        <>
          {tokenIn.userRouterAllowance?.lt(amountIn) ? (
            <SwapRouterApproveButton
              routerAddress={chainProperties[networkName]["routerAddress"]}
              approveToken={tokenIn.address}
              tokenSymbol={tokenIn.symbol}
              amount={amountIn}
            />
          ) : tradePoolData?.id != ZERO_ADDRESS ? (
            <LimitSwapButton
              routerAddress={chainProperties[networkName]["routerAddress"]}
              disabled={mintGasLimit.eq(BN_ZERO)}
              poolAddress={tradePoolData?.id}
              to={address}
              amount={amountIn}
              mintPercent={parseUnits("1", 24)}
              lower={lowerTick}
              upper={upperTick}
              closeModal={() => {}}
              zeroForOne={tokenIn.callId == 0}
              gasLimit={mintGasLimit}
              resetAfterSwap={resetAfterSwap}
            />
          ) : (
            <LimitCreateAndMintButton
              disabled={mintGasLimit.eq(BN_ZERO)}
              routerAddress={chainProperties["arbitrumGoerli"]["routerAddress"]}
              poolTypeId={limitPoolTypeIds["constant-product"]}
              token0={tokenIn}
              token1={tokenOut}
              feeTier={3000} // default 0.3% fee
              to={address}
              amount={amountIn}
              mintPercent={parseUnits("1", 24)}
              lower={lowerTick}
              upper={upperTick}
              closeModal={() => {}}
              zeroForOne={tokenIn.callId == 0}
              gasLimit={mintGasLimit}
            />
          )}
        </>
      )}
    </div>
  );
}
