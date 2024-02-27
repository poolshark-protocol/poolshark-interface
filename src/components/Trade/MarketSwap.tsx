import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useAccount, useContractRead, useProvider, useSigner } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useTradeStore } from "../../hooks/useTradeStore";
import useInputBox from "../../hooks/useInputBox";
import { BN_ZERO, Q96_BI, ZERO_ADDRESS } from "../../utils/math/constants";
import SelectToken from "../SelectToken";
import {
  inputHandler,
  numFormat,
  parseUnits,
} from "../../utils/math/valueMath";
import { getSwapPools } from "../../utils/pools";
import { QuoteParams, SwapParams, QuoteResults } from "../../utils/types";
import { TickMath, maxPriceBn, minPriceBn } from "../../utils/math/tickMath";
import { displayPoolPrice } from "../../utils/math/priceMath";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Range from "../Icons/RangeIcon";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import SwapRouterApproveButton from "../Buttons/SwapRouterApproveButton";
import SwapRouterButton from "../Buttons/SwapRouterButton";
import { chainProperties, defaultNetwork } from "../../utils/chains";
import { gasEstimateSwap, gasEstimateWethCall } from "../../utils/gas";
import JSBI from "jsbi";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import SwapUnwrapNativeButton from "../Buttons/SwapUnwrapNativeButton";
import SwapWrapNativeButton from "../Buttons/SwapWrapNativeButton";
import { useRouter } from "next/router";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { getRouterAddress } from "../../utils/config";
import BalanceDisplay from "../Display/BalanceDisplay";

export default function MarketSwap() {
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

  //PRICE AND LIQUIDITY FETCHED EVERY 5 SECONDS
  const quoteRefetchDelay = 5000;

  const [
    tradePoolData,
    setTradePoolData,
    setTradePoolPrice,
    setTradePoolLiquidity,
    tradeButton,
    pairSelected,
    setPairSelected,
    exactIn,
    setExactIn,
    limitTabSelected,
    wethCall,
    tradeSlippage,
    setTradeSlippage,
    tokenIn,
    setTokenIn,
    setTokenInTradeUSDPrice,
    setTokenOutTradeUSDPrice,
    tokenOut,
    setTokenOut,
    amountIn,
    setAmountIn,
    amountOut,
    setAmountOut,
    needsAllowanceIn,
    setNeedsAllowanceIn,
    switchDirection,
    setTradeButtonState,
  ] = useTradeStore((s) => [
    s.tradePoolData,
    s.setTradePoolData,
    s.setTradePoolPrice,
    s.setTradePoolLiquidity,
    s.tradeButton,
    s.pairSelected,
    s.setPairSelected,
    s.exactIn,
    s.setExactIn,
    s.limitTabSelected,
    s.wethCall,
    s.tradeSlippage,
    s.setTradeSlippage,
    s.tokenIn,
    s.setTokenIn,
    s.setTokenInTradeUSDPrice,
    s.setTokenOutTradeUSDPrice,
    s.tokenOut,
    s.setTokenOut,
    s.amountIn,
    s.setAmountIn,
    s.amountOut,
    s.setAmountOut,
    s.needsAllowanceIn,
    s.setNeedsAllowanceIn,
    s.switchDirection,
    s.setTradeButtonState,
  ]);

  const [setRangeTokenIn, setRangeTokenOut] = useRangeLimitStore((state) => [
    state.setTokenIn,
    state.setTokenOut,
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
  const provider = useProvider();

  const router = useRouter();

  useEffect(() => {
    if (limitTabSelected) return;
    setDisplayIn("");
    setAmountIn(BN_ZERO);
    setDisplayOut("");
    setAmountOut(BN_ZERO);
    setPriceImpact("0.00");
  }, [limitTabSelected]);

  /////////////////////////////Fetch Pools
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      // Code to run every 5 seconds
      if (exactIn ? amountIn.gt(BN_ZERO) : amountOut.gt(BN_ZERO)) {
        getSwapPools(
          limitSubgraph,
          tokenIn,
          tokenOut,
          tradePoolData,
          setTradePoolData,
          setTokenInTradeUSDPrice,
          setTokenOutTradeUSDPrice,
          setTradePoolPrice,
          setTradePoolLiquidity
        );
      }
    }, quoteRefetchDelay);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [exactIn ? amountIn : amountOut, tradePoolData?.id]);

  //can go to utils
  async function updatePools(amount: BigNumber, isAmountIn: boolean) {
    const pools = await getSwapPools(
      limitSubgraph,
      tokenIn,
      tokenOut,
      tradePoolData,
      setTradePoolData,
      setTokenInTradeUSDPrice,
      setTokenOutTradeUSDPrice
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

  /////////////////////Tokens info setting

  useEffect(() => {
    if (tokenIn.address && tokenOut.address !== ZERO_ADDRESS) {
      // adjust decimals when switching directions
      if (!wethCall)
        // only update pools if !wethCall
        updatePools(exactIn ? amountIn : amountOut, exactIn);
      if (exactIn) {
        if (!isNaN(parseFloat(displayIn))) {
          const bnValue = parseUnits(displayIn, tokenIn.decimals);
          setAmountIn(bnValue);
          setAmounts(bnValue, true);
        }
      } else {
        if (!isNaN(parseFloat(displayOut))) {
          const bnValue = parseUnits(displayOut, tokenOut.decimals);
          setAmountOut(bnValue);
          setAmounts(bnValue, false);
        }
      }
      if (!tokenIn.native) setNeedsAllowanceIn(true);
    }
  }, [tokenIn.address, tokenOut.address]);

  const setAmounts = (bnValue: BigNumber, isAmountIn: boolean) => {
    if (isAmountIn) {
      if (bnValue.gt(BN_ZERO)) {
        if (wethCall) {
          setDisplayOut(ethers.utils.formatUnits(bnValue, tokenIn.decimals));
          setAmountOut(bnValue);
        } else {
          updatePools(bnValue, true);
        }
      } else {
        setPriceImpact("0.00");
        setDisplayOut("");
        setAmountOut(BN_ZERO);
      }
    } else {
      if (bnValue.gt(BN_ZERO)) {
        if (wethCall) {
          setDisplayIn(ethers.utils.formatUnits(bnValue, tokenOut.decimals));
          setAmountIn(bnValue);
        } else {
          updatePools(bnValue, false);
        }
      } else {
        setPriceImpact("0.00");
        setDisplayIn("");
        setAmountIn(BN_ZERO);
      }
    }
  };

  /////////////////////Double Input Boxes

  const handleInputBox = (e) => {
    if (e.target.name.startsWith("tokenIn")) {
      const [value, bnValue] = inputHandler(e, tokenIn, e.target.name.endsWith("Max"));
      if (!pairSelected) {
        setDisplayIn(value);
        setDisplayOut("");
        setAmountIn(bnValue);
        setPriceImpact("0.00");
      } else if (!bnValue.eq(amountIn)) {
        setDisplayIn(value);
        setAmountIn(bnValue);
        setAmounts(bnValue, true);
      } else {
        setDisplayIn(value);
        if (bnValue.eq(BN_ZERO)) {
          setDisplayOut("");
          setPriceImpact("0.00");
        }
      }
      setExactIn(true);
    } else if (e.target.name.startsWith("tokenOut")) {
      const [value, bnValue] = inputHandler(e, tokenOut, e.target.name.endsWith("Max"));
      if (!pairSelected) {
        setDisplayOut(value);
        setDisplayIn("");
        setAmountOut(bnValue);
        setPriceImpact("0.00");
      } else if (!bnValue.eq(amountOut)) {
        setDisplayOut(value);
        setAmountOut(bnValue);
        setAmounts(bnValue, false);
      } else {
        setDisplayOut(value);
        if (bnValue.eq(BN_ZERO)) {
          setDisplayIn("");
          setPriceImpact("0.00");
        }
      }
      setExactIn(false);
    }
  };

  ///////////////////////////////Swap Params
  const [swapPoolAddresses, setSwapPoolAddresses] = useState<string[]>([]);
  const [swapParams, setSwapParams] = useState<any[]>([]);

  const { data: poolQuotes } = useContractRead({
    address: getRouterAddress(networkName), //contract address,
    abi: poolsharkRouterABI, // contract abi,
    functionName: "multiQuote",
    args: [availablePools, quoteParams, true],
    chainId: chainId,
    enabled:
      availablePools != undefined && quoteParams != undefined && !wethCall,
    onError(error) {
      console.log("Error multiquote", error);
    },
    onSuccess(data) {},
  });

  useEffect(() => {
    let poolQuotesSorted: QuoteResults[] = [];
    if (poolQuotes && poolQuotes[0]) {
      if (
        poolQuotes[0].amountIn?.gt(BN_ZERO) &&
        poolQuotes[0].amountOut?.gt(BN_ZERO)
      ) {
        if (exactIn) {
          setAmountOut(poolQuotes[0].amountOut);
          setDisplayOut(
            numFormat(
              parseFloat(
                ethers.utils.formatUnits(
                  poolQuotes[0].amountOut.toString(),
                  tokenOut.decimals
                )
              ),
              5
            )
          );
        } else {
          // add up amount outs
          // set amount out if less than current
          let amountOutTotal: BigNumber = BN_ZERO;
          for (let i = 0; poolQuotes[i] != undefined; i++) {
            // copy to sorted array
            poolQuotesSorted[i] = poolQuotes[i]
            amountOutTotal = amountOutTotal.add(poolQuotes[i]?.amountOut);
          }
          // sort by exchange rate
          poolQuotesSorted = poolQuotesSorted.sort((n1, n2) => {
            const exchangeRate1 = n1.amountOut.mul(Q96_BI).div(n1.amountIn)
            const exchangeRate2 = n2.amountOut.mul(Q96_BI).div(n2.amountIn)
            if (exchangeRate1.lt(exchangeRate2)) {
                return  1;
            }
            if (exchangeRate1.gte(exchangeRate2)) {
                return -1;
            }
            return  0;
          });
          // then filter for low amount out
          poolQuotesSorted = poolQuotesSorted.filter((n1) => n1.amountOut.gte(amountOut));
          // then sort by least amount in
          poolQuotesSorted = poolQuotesSorted.sort((n1, n2) => {
            if (n1.amountIn.gt(n2.amountIn)) {
                return  1;
            }
            if (n1.amountIn.lte(n2.amountIn)) {
                return -1;
            }
            return  0;
          });
          if (poolQuotesSorted.length > 0) {
            setAmountIn(poolQuotesSorted[0]?.amountIn ?? BN_ZERO);
            setDisplayIn(
              numFormat(
                parseFloat(
                  ethers.utils.formatUnits(
                    poolQuotesSorted[0]?.amountIn.toString(),
                    tokenIn.decimals
                  )
                ),
                5
              )
            );
          } else {
            setAmountIn(BN_ZERO)
            setDisplayIn('')
          }
          if (amountOutTotal.lt(amountOut)) {
            setAmountOut(amountOutTotal);
            setDisplayOut(
              numFormat(
                parseFloat(
                  ethers.utils.formatUnits(
                    amountOutTotal.toString(),
                    tokenOut.decimals
                  )
                ),
                5
              )
            );
          }
        }
        updateSwapParams(exactIn ? poolQuotes : poolQuotesSorted);
      } else {
        if (exactIn) {
          setAmountOut(BN_ZERO);
          setDisplayOut("");
        } else {
          setAmountIn(BN_ZERO);
          setDisplayIn("");
        }
      }
    } else if (poolQuotes != undefined) {
      if (exactIn) {
        setAmountOut(BN_ZERO);
        setDisplayOut("");
      } else {
        setAmountIn(BN_ZERO);
        setDisplayIn("");
      }
    }
  }, [poolQuotes, quoteParams, tradeSlippage]);

  function updateSwapParams(poolQuotes: any) {
    const poolAddresses: string[] = [];
    const paramsList: SwapParams[] = [];
    for (let i = 0; i < poolQuotes.length; i++) {
      if (poolQuotes[i].pool != ZERO_ADDRESS) {
        // push pool address for swap
        poolAddresses.push(poolQuotes[i].pool);
        // set base price from quote
        const basePrice: number = parseFloat(
          TickMath.getPriceStringAtSqrtPrice(
            poolQuotes[0].priceAfter,
            tokenIn,
            tokenOut
          )
        );
        // set price impact
        if (
          poolQuotes[i].pool?.toLowerCase() == tradePoolData.id?.toLowerCase()
        ) {
          const currentPrice: number = parseFloat(
            TickMath.getPriceStringAtSqrtPrice(
              tradePoolData.poolPrice,
              tokenIn,
              tokenOut
            )
          );
          let priceDiff =
            (Math.abs(basePrice - currentPrice) * 100) / currentPrice;
          if (priceDiff < 0 || priceDiff > 100) priceDiff = 100;
          setPriceImpact(priceDiff.toFixed(2));
        }
        const priceDiff = basePrice * (parseFloat(tradeSlippage) / 100);
        const limitPrice =
          tokenIn.callId == 0 ? basePrice - priceDiff : basePrice + priceDiff;
        const limitPriceJsbi: JSBI = TickMath.getSqrtPriceAtPriceString(
          limitPrice.toString(),
          tokenIn,
          tokenOut
        );
        const priceLimitBn = BigNumber.from(String(limitPriceJsbi));
        const params: SwapParams = {
          to: address,
          priceLimit: priceLimitBn,
          amount: exactIn ? amountIn : amountOut,
          exactIn: exactIn,
          zeroForOne: tokenIn.callId == 0,
          callbackData: ethers.utils.formatBytes32String(""),
        };
        paramsList.push(params);
      }
    }
    setSwapPoolAddresses(poolAddresses);
    setSwapParams(paramsList);
  }

  const resetAfterSwap = () => {
    setDisplayIn("");
    setDisplayOut("");
    setAmountIn(BN_ZERO);
    setAmountOut(BN_ZERO);
    setTimeout(() => {
      updatePools(BigNumber.from("0"), true);
    }, 2000);
  };

  ////////////////////////////////FeeTiers & Slippage
  const [priceImpact, setPriceImpact] = useState("0.00");

  ////////////////////////////////Gas
  const [swapGasFee, setSwapGasFee] = useState("$0.00");
  const [swapGasLimit, setSwapGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (
      !amountIn.eq(BN_ZERO) &&
      (!needsAllowanceIn || tokenIn.native) &&
      tradePoolData != undefined &&
      !wethCall
    ) {
      updateGasFee();
    } else if (wethCall) {
      updateWethFee();
    }
  }, [
    swapParams,
    tokenIn.address,
    tokenOut.address,
    tokenIn.native,
    tokenIn.userBalance,
    tokenIn.userRouterAllowance,
    needsAllowanceIn,
    wethCall,
    amountIn,
  ]);

  async function updateGasFee() {
    if (
      (tokenIn.userRouterAllowance?.gte(amountIn) ||
        (tokenIn.native &&
          parseUnits(tokenIn.userBalance?.toString(), tokenIn.decimals).gte(
            amountIn
          ))) &&
      !wethCall
    ) {
      await gasEstimateSwap(
        getRouterAddress(networkName),
        swapPoolAddresses,
        swapParams,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        signer,
        isConnected,
        setSwapGasFee,
        setSwapGasLimit
      );
    } else {
      setSwapGasLimit(BN_ZERO);
    }
  }

  async function updateWethFee() {
    if (tokenIn.userRouterAllowance?.gte(amountIn) || tokenIn.native) {
      await gasEstimateWethCall(
        chainProperties[networkName]["wethAddress"],
        tokenIn,
        tokenOut,
        amountIn,
        signer,
        isConnected,
        setSwapGasFee,
        setSwapGasLimit
      );
    }
  }

  /////////////////////////////Button States

  useEffect(() => {
    setTradeButtonState();
  }, [
    amountIn,
    amountOut,
    tokenIn.userBalance,
    tokenIn.address,
    tokenOut.address,
    tokenIn.userRouterAllowance,
  ]);

  ////////////////////////////////
  const [expanded, setExpanded] = useState(false);

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div
              className={`ml-auto text-xs ${
                pairSelected ? "text-white" : "text-[#4C4C4C]"
              }`}
            >
              {pairSelected
                ? numFormat(
                    parseFloat(
                      ethers.utils.formatUnits(
                        amountOut ?? BN_ZERO,
                        tokenOut.decimals
                      )
                    ),
                    5
                  )
                : "Select Token"}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            <div
              className={`ml-auto text-xs ${
                tokenIn.userRouterAllowance?.lt(amountIn)
                  ? "text-[#4C4C4C]"
                  : "text-white"
              }`}
            >
              {tokenIn.userRouterAllowance?.lt(amountIn)
                ? "Approve Token"
                : swapGasFee}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Minimum received after slippage ({tradeSlippage}%)
            </div>
            <div className="ml-auto text-xs">
              {numFormat(
                (parseFloat(
                  ethers.utils.formatUnits(amountOut, tokenOut.decimals)
                ) *
                  (100 - parseFloat(tradeSlippage))) /
                  100,
                5
              )}
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

  return (
    <div>
      <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
        <div className="flex items-end justify-between text-[11px] text-grey1">
          <span>
            {" "}
            $
            {!isNaN(parseInt(amountIn.toString())) &&
            !isNaN(tokenIn.decimals) &&
            !isNaN(tokenIn.USDPrice)
              ? (
                  (!isNaN(parseFloat(displayIn)) ? parseFloat(displayIn) : 0) *
                  (tokenIn.USDPrice ?? 0)
                ).toFixed(2)
              : (0).toFixed(2)}
          </span>
          <BalanceDisplay token={tokenIn}></BalanceDisplay>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3">
          {inputBoxIn("0", tokenIn, "tokenIn", handleInputBox)}
          <div className="flex items-center gap-x-2">
            {isConnected && tokenIn.address != ZERO_ADDRESS ? (
              <button
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tokenIn.userBalance.toString(),
                      name: "tokenInMax",
                    },
                  });
                }}
                className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
              >
                MAX
              </button>
            ) : null}
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
      <div
        onClick={() => {
          switchDirection(
            exactIn,
            exactIn ? displayIn : displayOut,
            exactIn ? setAmountIn : setAmountOut
          );
        }}
        className="flex items-center justify-center w-full pt-10 pb-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 cursor-pointer"
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
            $
            {!isNaN(tokenOut.decimals) && !isNaN(tokenOut.USDPrice) ? (
              (
                (!isNaN(parseFloat(displayOut)) ? parseFloat(displayOut) : 0) *
                (tokenOut.USDPrice ?? 0)
              ).toFixed(2)
            ) : (
              <>{(0).toFixed(2)}</>
            )}
          </span>
          <span>
            {tokenOut?.address != ZERO_ADDRESS ? (
              "Balance: " +
              (!isNaN(tokenOut?.userBalance) && tokenOut.userBalance > 0
                ? numFormat(tokenOut.userBalance, 5)
                : "0.00")
            ) : (
              <></>
            )}
          </span>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
          {<div>{inputBoxOut("0", tokenOut, "tokenOut", handleInputBox)}</div>}
          <div className="flex items-center gap-x-2">
            {isConnected && tokenOut.address != ZERO_ADDRESS ? (
              <button
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tokenOut.userBalance.toString(),
                      name: "tokenOutMax",
                    },
                  });
                }}
                className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
              >
                MAX
              </button>
            ) : null}
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
      <div className="py-2">
        <div
          className="flex px-2 cursor-pointer py-2 rounded-[4px]"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
            {"1 " + tokenIn.symbol} ={" "}
            {displayPoolPrice(
              wethCall,
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
      {parseFloat(priceImpact) > 5 && (
        <div
          className={`flex justify-between px-5 rounded-[4px] w-full border items-center text-xs py-2  mb-4 ${
            parseFloat(priceImpact) < 10
              ? " border-yellow-500/20 bg-yellow-500/10"
              : "border-red-500/20 bg-red-500/10 "
          }`}
        >
          Price Impact Warning
          <span
            className={`${
              parseFloat(priceImpact) < 10 ? "text-yellow-500" : "text-red-500"
            }`}
          >
            {priceImpact} %
          </span>
        </div>
      )}
      {tokenIn.address != ZERO_ADDRESS &&
      tokenOut.address != ZERO_ADDRESS &&
      tradePoolData?.id == ZERO_ADDRESS &&
      tradePoolData?.feeTier != undefined &&
      !wethCall ? (
        <div className="flex gap-x-5 rounded-[4px] items-center text-xs p-2 border bg-dark border-grey mb-5">
          <Range className="text-main2" />{" "}
          <span className="text-grey3 flex flex-col gap-y-[-2px]">
            No pools exist for this token pair.{" "}
            {/* set tokenIn and tokenOut in router.query */}
            <a
              className=" hover:underline text-main2 cursor-pointer"
              onClick={() => {
                setRangeTokenIn(tokenOut, tokenIn, "0", true);
                setRangeTokenOut(tokenIn, tokenOut, "0", false);
                router.push({
                  pathname: "/range/add-liquidity",
                  query: {
                    feeTier: "3000",
                    poolId: ZERO_ADDRESS,
                    tokenIn: tokenIn.address,
                    tokenInNative: tokenIn.native,
                    tokenOut: tokenOut.address,
                    tokenOutNative: tokenOut.native,
                    chainId: chainId,
                  },
                });
              }}
            >
              Click here to create a range pool
            </a>
          </span>
        </div>
      ) : (
        <></>
      )}
      {tradePoolData?.liquidity == "0" ? (
        <div className="flex gap-x-5 rounded-[4px] items-center text-xs p-2 border bg-dark border-grey mb-5">
          <Range className="text-main2" />{" "}
          <span className="text-grey3 flex flex-col gap-y-[-2px]">
            This pool has no liquidity.{" "}
            <a
              className=" hover:underline text-main2 cursor-pointer"
              onClick={() => {
                setRangeTokenIn(tokenOut, tokenIn, "0", true);
                setRangeTokenOut(tokenIn, tokenOut, "0", false);
                router.push({
                  pathname: "/range/add-liquidity",
                  query: {
                    feeTier: "3000",
                    poolId: ZERO_ADDRESS,
                    tokenIn: tokenIn.address,
                    tokenInNative: tokenIn.native,
                    tokenOut: tokenOut.address,
                    tokenOutNative: tokenOut.native,
                    chainId: chainId,
                  },
                });
              }}
            >
              Click here to add liquidity.
            </a>
          </span>
        </div>
      ) : (
        <></>
      )}
      {isDisconnected ? (
        <ConnectWalletButton xl={true} />
      ) : (
        <>
          {
            //range buttons
            tokenIn.userRouterAllowance?.lt(amountIn) &&
            !tokenIn.native &&
            pairSelected &&
            amountOut.gt(BN_ZERO) ? (
              <div>
                <SwapRouterApproveButton
                  routerAddress={getRouterAddress(networkName)}
                  approveToken={tokenIn.address}
                  tokenSymbol={tokenIn.symbol}
                  amount={amountIn}
                />
              </div>
            ) : !wethCall ? (
              <SwapRouterButton
                disabled={
                  tradeButton.disabled ||
                  (needsAllowanceIn && !tokenIn.native) ||
                  swapGasLimit.lt(BigNumber.from("100000"))
                }
                routerAddress={getRouterAddress(networkName)}
                amountIn={amountIn}
                tokenInSymbol={tokenIn.symbol}
                tokenOutSymbol={tokenOut.symbol}
                tokenInNative={tokenIn.native ?? false}
                tokenOutNative={tokenOut.native ?? false}
                poolAddresses={swapPoolAddresses}
                swapParams={swapParams ?? {}}
                gasLimit={swapGasLimit}
                resetAfterSwap={resetAfterSwap}
              />
            ) : tokenIn.native ? (
              <SwapWrapNativeButton
                disabled={swapGasLimit.eq(BN_ZERO) || tradeButton.disabled}
                routerAddress={getRouterAddress(networkName)}
                wethAddress={chainProperties[networkName]["wethAddress"]}
                tokenInSymbol={tokenIn.symbol}
                amountIn={amountIn}
                gasLimit={swapGasLimit}
                resetAfterSwap={resetAfterSwap}
              />
            ) : (
              <SwapUnwrapNativeButton
                disabled={swapGasLimit.eq(BN_ZERO) || tradeButton.disabled}
                routerAddress={getRouterAddress(networkName)}
                wethAddress={chainProperties[networkName]["wethAddress"]}
                tokenInSymbol={tokenIn.symbol}
                amountIn={amountIn}
                gasLimit={swapGasLimit}
                resetAfterSwap={resetAfterSwap}
              />
            )
          }
        </>
      )}
    </div>
  );
}
