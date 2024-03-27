import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useAccount, useContractRead } from "wagmi";
import { useShallow } from "zustand/react/shallow";
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
import { useEthersSigner } from "../../utils/viemEthersAdapters";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";

export default function MarketSwap() {
  const [chainId, networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
    ]),
  );

  //CONFIG STORE
  const [stateChainName, setStateChainName] = useState();

  //PRICE AND LIQUIDITY FETCHED EVERY 5 SECONDS
  const quoteRefetchDelay = 5000;

  // @shax
  const tradeStore = useTradeStore();

  const [setRangeTokenIn, setRangeTokenOut] = useRangeLimitStore(
    useShallow((state) => [state.setTokenIn, state.setTokenOut]),
  );

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

  const signer = useEthersSigner();

  const router = useRouter();

  useEffect(() => {
    if (tradeStore.limitTabSelected) return;
    tradeStore.resetTradeLimitParams(chainId);
    setDisplayIn("");
    tradeStore.setAmountIn(BN_ZERO);
    setDisplayOut("");
    tradeStore.setAmountOut(BN_ZERO);
    setPriceImpact("0.00");
  }, [tradeStore.limitTabSelected]);

  /////////////////////////////Fetch Pools
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      // Code to run every 5 seconds
      if (
        tradeStore.exactIn
          ? tradeStore.amountIn.gt(BN_ZERO)
          : tradeStore.amountOut.gt(BN_ZERO)
      ) {
        getSwapPools(
          limitSubgraph,
          tradeStore.tokenIn,
          tradeStore.tokenOut,
          tradeStore.tradePoolData,
          tradeStore.setTradePoolData,
          tradeStore.setTokenInTradeUSDPrice,
          tradeStore.setTokenOutTradeUSDPrice,
          tradeStore.setTradePoolPrice,
          tradeStore.setTradePoolLiquidity,
        );
      }
    }, quoteRefetchDelay);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [
    tradeStore.exactIn ? tradeStore.amountIn : tradeStore.amountOut,
    tradeStore.tradePoolData?.id,
  ]);

  //can go to utils
  async function updatePools(amount: BigNumber, isAmountIn: boolean) {
    const pools = await getSwapPools(
      limitSubgraph,
      tradeStore.tokenIn,
      tradeStore.tokenOut,
      tradeStore.tradePoolData,
      tradeStore.setTradePoolData,
      tradeStore.setTokenInTradeUSDPrice,
      tradeStore.setTokenOutTradeUSDPrice,
    );
    const poolAdresses: string[] = [];
    const quoteList: QuoteParams[] = [];
    if (pools) {
      for (let i = 0; i < pools.length; i++) {
        const params: QuoteParams = {
          priceLimit: tradeStore.tokenIn.callId == 0 ? minPriceBn : maxPriceBn,
          amount: amount,
          exactIn: isAmountIn,
          zeroForOne: tradeStore.tokenIn.callId == 0,
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
    if (
      tradeStore.tokenIn.address &&
      tradeStore.tokenOut.address !== ZERO_ADDRESS
    ) {
      // adjust decimals when switching directions
      if (!tradeStore.wethCall)
        // only update pools if !wethCall
        updatePools(
          tradeStore.exactIn ? tradeStore.amountIn : tradeStore.amountOut,
          tradeStore.exactIn,
        );
      if (tradeStore.exactIn) {
        if (!isNaN(parseFloat(displayIn))) {
          const bnValue = parseUnits(displayIn, tradeStore.tokenIn.decimals);
          tradeStore.setAmountIn(bnValue);
          setAmounts(bnValue, true);
        }
      } else {
        if (!isNaN(parseFloat(displayOut))) {
          const bnValue = parseUnits(displayOut, tradeStore.tokenOut.decimals);
          tradeStore.setAmountOut(bnValue);
          setAmounts(bnValue, false);
        }
      }
      if (!tradeStore.tokenIn.native) tradeStore.setNeedsAllowanceIn(true);
    }
  }, [tradeStore.tokenIn.address, tradeStore.tokenOut.address]);

  // console.log('token in:', tokenIn)

  const setAmounts = (bnValue: BigNumber, isAmountIn: boolean) => {
    if (isAmountIn) {
      if (bnValue.gt(BN_ZERO)) {
        if (tradeStore.wethCall) {
          setDisplayOut(
            ethers.utils.formatUnits(bnValue, tradeStore.tokenIn.decimals),
          );
          tradeStore.setAmountOut(bnValue);
        } else {
          updatePools(bnValue, true);
        }
      } else {
        setPriceImpact("0.00");
        setDisplayOut("");
        tradeStore.setAmountOut(BN_ZERO);
      }
    } else {
      if (bnValue.gt(BN_ZERO)) {
        if (tradeStore.wethCall) {
          setDisplayIn(
            ethers.utils.formatUnits(bnValue, tradeStore.tokenOut.decimals),
          );
          tradeStore.setAmountIn(bnValue);
        } else {
          updatePools(bnValue, false);
        }
      } else {
        setPriceImpact("0.00");
        setDisplayIn("");
        tradeStore.setAmountIn(BN_ZERO);
      }
    }
  };

  /////////////////////Double Input Boxes

  const handleInputBox = (e) => {
    if (e.target.name.startsWith("tokenIn")) {
      const [value, bnValue] = inputHandler(
        e,
        tradeStore.tokenIn,
        e.target.name.endsWith("Max"),
      );
      if (!tradeStore.pairSelected) {
        setDisplayIn(value);
        setDisplayOut("");
        tradeStore.setAmountIn(bnValue);
        setPriceImpact("0.00");
      } else if (!bnValue.eq(tradeStore.amountIn)) {
        setDisplayIn(value);
        tradeStore.setAmountIn(bnValue);
        setAmounts(bnValue, true);
      } else {
        setDisplayIn(value);
        if (bnValue.eq(BN_ZERO)) {
          setDisplayOut("");
          setPriceImpact("0.00");
        }
      }
      tradeStore.setExactIn(true);
    } else if (e.target.name.startsWith("tokenOut")) {
      const [value, bnValue] = inputHandler(
        e,
        tradeStore.tokenOut,
        e.target.name.endsWith("Max"),
      );
      if (!tradeStore.pairSelected) {
        setDisplayOut(value);
        setDisplayIn("");
        tradeStore.setAmountOut(bnValue);
        setPriceImpact("0.00");
      } else if (!bnValue.eq(tradeStore.amountOut)) {
        setDisplayOut(value);
        tradeStore.setAmountOut(bnValue);
        setAmounts(bnValue, false);
      } else {
        setDisplayOut(value);
        if (bnValue.eq(BN_ZERO)) {
          setDisplayIn("");
          setPriceImpact("0.00");
        }
      }
      tradeStore.setExactIn(false);
    }
  };

  ///////////////////////////////Swap Params
  const [swapPoolAddresses, setSwapPoolAddresses] = useState<string[]>([]);
  const [swapParams, setSwapParams] = useState<any[]>([]);

  const { data } = useContractRead({
    address: getRouterAddress(networkName), //contract address,
    abi: poolsharkRouterABI, // contract abi,
    functionName: "multiQuote",
    args: [availablePools, deepConvertBigIntAndBigNumber(quoteParams), true],
    chainId: chainId,
    enabled:
      availablePools != undefined &&
      quoteParams != undefined &&
      !tradeStore.wethCall,
    onError(error) {
      console.log("Error multiquote", error);
    },
    onSuccess(data) {},
  });

  useEffect(() => {
    let poolQuotesSorted: QuoteResults[] = [];
    if (data && data[0]) {
      // format to use BigNumber
      const poolQuotes = deepConvertBigIntAndBigNumber(data);

      if (
        poolQuotes[0].amountIn?.gt(BN_ZERO) &&
        poolQuotes[0].amountOut?.gt(BN_ZERO)
      ) {
        if (tradeStore.exactIn) {
          tradeStore.setAmountOut(poolQuotes[0].amountOut);
          setDisplayOut(
            numFormat(
              parseFloat(
                ethers.utils.formatUnits(
                  poolQuotes[0].amountOut.toString(),
                  tradeStore.tokenOut.decimals,
                ),
              ),
              5,
            ),
          );
        } else {
          // add up amount outs
          // set amount out if less than current
          let amountOutTotal: BigNumber = BN_ZERO;
          for (let i = 0; poolQuotes[i] != undefined; i++) {
            // copy to sorted array
            poolQuotesSorted[i] = poolQuotes[i];
            amountOutTotal = amountOutTotal.add(poolQuotes[i]?.amountOut);
          }
          // sort by exchange rate
          poolQuotesSorted = poolQuotesSorted.sort((n1, n2) => {
            const exchangeRate1 = n1.amountOut.mul(Q96_BI).div(n1.amountIn);
            const exchangeRate2 = n2.amountOut.mul(Q96_BI).div(n2.amountIn);
            if (exchangeRate1.lt(exchangeRate2)) {
              return 1;
            }
            if (exchangeRate1.gte(exchangeRate2)) {
              return -1;
            }
            return 0;
          });
          // then filter for low amount out
          poolQuotesSorted = poolQuotesSorted.filter((n1) =>
            n1.amountOut.gte(tradeStore.amountOut),
          );
          // then sort by least amount in
          poolQuotesSorted = poolQuotesSorted.sort((n1, n2) => {
            if (n1.amountIn.gt(n2.amountIn)) {
              return 1;
            }
            if (n1.amountIn.lte(n2.amountIn)) {
              return -1;
            }
            return 0;
          });
          if (poolQuotesSorted.length > 0) {
            tradeStore.setAmountIn(poolQuotesSorted[0]?.amountIn ?? BN_ZERO);
            setDisplayIn(
              numFormat(
                parseFloat(
                  ethers.utils.formatUnits(
                    poolQuotesSorted[0]?.amountIn.toString(),
                    tradeStore.tokenIn.decimals,
                  ),
                ),
                5,
              ),
            );
          } else {
            tradeStore.setAmountIn(BN_ZERO);
            setDisplayIn("");
          }
          if (amountOutTotal.lt(tradeStore.amountOut)) {
            tradeStore.setAmountOut(amountOutTotal);
            setDisplayOut(
              numFormat(
                parseFloat(
                  ethers.utils.formatUnits(
                    amountOutTotal.toString(),
                    tradeStore.tokenOut.decimals,
                  ),
                ),
                5,
              ),
            );
          }
        }
        updateSwapParams(tradeStore.exactIn ? poolQuotes : poolQuotesSorted);
      } else {
        if (tradeStore.exactIn) {
          tradeStore.setAmountOut(BN_ZERO);
          setDisplayOut("");
        } else {
          tradeStore.setAmountIn(BN_ZERO);
          setDisplayIn("");
        }
      }
    } else if (data != undefined) {
      if (tradeStore.exactIn) {
        tradeStore.setAmountOut(BN_ZERO);
        setDisplayOut("");
      } else {
        tradeStore.setAmountIn(BN_ZERO);
        setDisplayIn("");
      }
    }
  }, [data, quoteParams, tradeStore.tradeSlippage]);

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
            tradeStore.tokenIn,
            tradeStore.tokenOut,
          ),
        );
        // set price impact
        if (
          poolQuotes[i].pool?.toLowerCase() ==
          tradeStore.tradePoolData.id?.toLowerCase()
        ) {
          const currentPrice: number = parseFloat(
            TickMath.getPriceStringAtSqrtPrice(
              tradeStore.tradePoolData.poolPrice,
              tradeStore.tokenIn,
              tradeStore.tokenOut,
            ),
          );
          let priceDiff =
            (Math.abs(basePrice - currentPrice) * 100) / currentPrice;
          if (priceDiff < 0 || priceDiff > 100) priceDiff = 100;
          setPriceImpact(priceDiff.toFixed(2));
        }
        const priceDiff =
          basePrice * (parseFloat(tradeStore.tradeSlippage) / 100);
        const limitPrice =
          tradeStore.tokenIn.callId == 0
            ? basePrice - priceDiff
            : basePrice + priceDiff;
        const limitPriceJsbi: JSBI = TickMath.getSqrtPriceAtPriceString(
          limitPrice.toString(),
          tradeStore.tokenIn,
          tradeStore.tokenOut,
        );
        const priceLimitBn = BigNumber.from(String(limitPriceJsbi));
        const params: SwapParams = {
          to: address,
          priceLimit: priceLimitBn,
          amount: tradeStore.exactIn
            ? tradeStore.amountIn
            : tradeStore.amountOut,
          exactIn: tradeStore.exactIn,
          zeroForOne: tradeStore.tokenIn.callId == 0,
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
    tradeStore.setAmountIn(BN_ZERO);
    tradeStore.setAmountOut(BN_ZERO);
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
      !tradeStore.amountIn.eq(BN_ZERO) &&
      (!tradeStore.needsAllowanceIn || tradeStore.tokenIn.native) &&
      tradeStore.tradePoolData != undefined &&
      !tradeStore.wethCall
    ) {
      updateGasFee();
    } else if (tradeStore.wethCall) {
      updateWethFee();
    }
  }, [
    swapParams,
    tradeStore.tokenIn.address,
    tradeStore.tokenOut.address,
    tradeStore.tokenIn.native,
    tradeStore.tokenIn.userBalance,
    tradeStore.tokenIn.userRouterAllowance,
    tradeStore.needsAllowanceIn,
    tradeStore.wethCall,
    tradeStore.amountIn,
  ]);

  async function updateGasFee() {
    if (
      (tradeStore.tokenIn.userRouterAllowance?.gte(tradeStore.amountIn) ||
        (tradeStore.tokenIn.native &&
          parseUnits(
            tradeStore.tokenIn.userBalance?.toString(),
            tradeStore.tokenIn.decimals,
          ).gte(tradeStore.amountIn))) &&
      !tradeStore.wethCall
    ) {
      await gasEstimateSwap(
        getRouterAddress(networkName),
        swapPoolAddresses,
        swapParams,
        tradeStore.tokenIn,
        tradeStore.tokenOut,
        tradeStore.amountIn,
        tradeStore.amountOut,
        signer,
        isConnected,
        setSwapGasFee,
        setSwapGasLimit,
        limitSubgraph,
      );
    } else {
      setSwapGasLimit(BN_ZERO);
    }
  }

  async function updateWethFee() {
    if (
      tradeStore.tokenIn.userRouterAllowance?.gte(tradeStore.amountIn) ||
      tradeStore.tokenIn.native
    ) {
      await gasEstimateWethCall(
        chainProperties[networkName]["wethAddress"],
        tradeStore.tokenIn,
        tradeStore.tokenOut,
        tradeStore.amountIn,
        signer,
        isConnected,
        setSwapGasFee,
        setSwapGasLimit,
        limitSubgraph,
      );
    }
  }

  /////////////////////////////Button States

  useEffect(() => {
    tradeStore.setTradeButtonState();
  }, [
    tradeStore.amountIn,
    tradeStore.amountOut,
    tradeStore.tokenIn.userBalance,
    tradeStore.tokenIn.address,
    tradeStore.tokenOut.address,
    tradeStore.tokenIn.userRouterAllowance,
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
                tradeStore.pairSelected ? "text-white" : "text-[#4C4C4C]"
              }`}
            >
              {tradeStore.pairSelected
                ? numFormat(
                    parseFloat(
                      ethers.utils.formatUnits(
                        tradeStore.amountOut ?? BN_ZERO,
                        tradeStore.tokenOut.decimals,
                      ),
                    ),
                    5,
                  )
                : "Select Token"}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            <div
              className={`ml-auto text-xs ${
                tradeStore.tokenIn.userRouterAllowance?.lt(tradeStore.amountIn)
                  ? "text-[#4C4C4C]"
                  : "text-white"
              }`}
            >
              {tradeStore.tokenIn.userRouterAllowance?.lt(tradeStore.amountIn)
                ? "Approve Token"
                : swapGasFee}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Minimum received after slippage ({tradeStore.tradeSlippage}%)
            </div>
            <div className="ml-auto text-xs">
              {numFormat(
                (parseFloat(
                  ethers.utils.formatUnits(
                    tradeStore.amountOut,
                    tradeStore.tokenOut.decimals,
                  ),
                ) *
                  (100 - parseFloat(tradeStore.tradeSlippage))) /
                  100,
                5,
              )}
            </div>
          </div>

          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Price Impact</div>
            <div className="ml-auto text-xs">
              {tradeStore.pairSelected
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
            {!isNaN(parseInt(tradeStore.amountIn.toString())) &&
            !isNaN(tradeStore.tokenIn.decimals) &&
            !isNaN(tradeStore.tokenIn.USDPrice)
              ? (
                  (!isNaN(parseFloat(displayIn)) ? parseFloat(displayIn) : 0) *
                  (tradeStore.tokenIn.USDPrice ?? 0)
                ).toFixed(2)
              : (0).toFixed(2)}
          </span>
          <BalanceDisplay token={tradeStore.tokenIn}></BalanceDisplay>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3">
          {inputBoxIn("0", tradeStore.tokenIn, "tokenIn", handleInputBox)}
          <div className="flex items-center gap-x-2">
            {isConnected && tradeStore.tokenIn.address != ZERO_ADDRESS ? (
              <button
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tradeStore.tokenIn.userBalance.toString(),
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
              tokenIn={tradeStore.tokenIn}
              setTokenIn={tradeStore.setTokenIn}
              tokenOut={tradeStore.tokenOut}
              setTokenOut={tradeStore.setTokenOut}
              displayToken={tradeStore.tokenIn}
              amount={tradeStore.exactIn ? displayIn : displayOut}
              isAmountIn={tradeStore.exactIn}
            />
          </div>
        </div>
      </div>
      <div
        onClick={() => {
          tradeStore.switchDirection(
            tradeStore.exactIn,
            tradeStore.exactIn ? displayIn : displayOut,
            tradeStore.exactIn
              ? tradeStore.setAmountIn
              : tradeStore.setAmountOut,
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
            {!isNaN(tradeStore.tokenOut.decimals) &&
            !isNaN(tradeStore.tokenOut.USDPrice) ? (
              (
                (!isNaN(parseFloat(displayOut)) ? parseFloat(displayOut) : 0) *
                (tradeStore.tokenOut.USDPrice ?? 0)
              ).toFixed(2)
            ) : (
              <>{(0).toFixed(2)}</>
            )}
          </span>
          <BalanceDisplay token={tradeStore.tokenOut}></BalanceDisplay>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
          {
            <div>
              {inputBoxOut(
                "0",
                tradeStore.tokenOut,
                "tokenOut",
                handleInputBox,
              )}
            </div>
          }
          <div className="flex items-center gap-x-2">
            {isConnected && tradeStore.tokenOut.address != ZERO_ADDRESS ? (
              <button
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tradeStore.tokenOut.userBalance.toString(),
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
              tokenIn={tradeStore.tokenIn}
              setTokenIn={tradeStore.setTokenIn}
              tokenOut={tradeStore.tokenOut}
              setTokenOut={tradeStore.setTokenOut}
              setPairSelected={tradeStore.setPairSelected}
              displayToken={tradeStore.tokenOut}
              amount={tradeStore.exactIn ? displayIn : displayOut}
              isAmountIn={tradeStore.exactIn}
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
            {"1 " + tradeStore.tokenIn.symbol} ={" "}
            {displayPoolPrice(
              tradeStore.wethCall,
              tradeStore.pairSelected,
              tradeStore.tradePoolData?.poolPrice,
              tradeStore.tokenIn,
              tradeStore.tokenOut,
            ) +
              " " +
              tradeStore.tokenOut.symbol}
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
      {tradeStore.tokenIn.address != ZERO_ADDRESS &&
      tradeStore.tokenOut.address != ZERO_ADDRESS &&
      tradeStore.tradePoolData?.id == ZERO_ADDRESS &&
      tradeStore.tradePoolData?.feeTier != undefined &&
      !tradeStore.wethCall ? (
        <div className="flex gap-x-5 rounded-[4px] items-center text-xs p-2 border bg-dark border-grey mb-5">
          <Range className="text-main2" />{" "}
          <span className="text-grey3 flex flex-col gap-y-[-2px]">
            No pools exist for this token pair.{" "}
            {/* set tokenIn and tokenOut in router.query */}
            <a
              className=" hover:underline text-main2 cursor-pointer"
              onClick={() => {
                setRangeTokenIn(
                  tradeStore.tokenOut,
                  tradeStore.tokenIn,
                  "0",
                  true,
                );
                setRangeTokenOut(
                  tradeStore.tokenIn,
                  tradeStore.tokenOut,
                  "0",
                  false,
                );
                router.push({
                  pathname: "/range/add-liquidity",
                  query: {
                    feeTier: "3000",
                    poolId: ZERO_ADDRESS,
                    tokenIn: tradeStore.tokenIn.address,
                    tokenInNative: tradeStore.tokenIn.native,
                    tokenOut: tradeStore.tokenOut.address,
                    tokenOutNative: tradeStore.tokenOut.native,
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
      {tradeStore.tradePoolData?.liquidity == "0" ? (
        <div className="flex gap-x-5 rounded-[4px] items-center text-xs p-2 border bg-dark border-grey mb-5">
          <Range className="text-main2" />{" "}
          <span className="text-grey3 flex flex-col gap-y-[-2px]">
            This pool has no liquidity.{" "}
            <a
              className=" hover:underline text-main2 cursor-pointer"
              onClick={() => {
                setRangeTokenIn(
                  tradeStore.tokenOut,
                  tradeStore.tokenIn,
                  "0",
                  true,
                );
                setRangeTokenOut(
                  tradeStore.tokenIn,
                  tradeStore.tokenOut,
                  "0",
                  false,
                );
                router.push({
                  pathname: "/range/add-liquidity",
                  query: {
                    feeTier: "3000",
                    poolId: ZERO_ADDRESS,
                    tokenIn: tradeStore.tokenIn.address,
                    tokenInNative: tradeStore.tokenIn.native,
                    tokenOut: tradeStore.tokenOut.address,
                    tokenOutNative: tradeStore.tokenOut.native,
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
            tradeStore.tokenIn.userRouterAllowance?.lt(tradeStore.amountIn) &&
            !tradeStore.tokenIn.native &&
            tradeStore.pairSelected &&
            tradeStore.amountOut.gt(BN_ZERO) ? (
              <div>
                <SwapRouterApproveButton
                  routerAddress={getRouterAddress(networkName)}
                  approveToken={tradeStore.tokenIn.address}
                  tokenSymbol={tradeStore.tokenIn.symbol}
                  amount={tradeStore.amountIn}
                />
              </div>
            ) : !tradeStore.wethCall ? (
              <SwapRouterButton
                disabled={
                  tradeStore.tradeButton.disabled ||
                  (tradeStore.needsAllowanceIn && !tradeStore.tokenIn.native) ||
                  swapGasLimit.lt(BigNumber.from("100000"))
                }
                routerAddress={getRouterAddress(networkName)}
                amountIn={tradeStore.amountIn}
                tokenInSymbol={tradeStore.tokenIn.symbol}
                tokenOutSymbol={tradeStore.tokenOut.symbol}
                tokenInNative={tradeStore.tokenIn.native ?? false}
                tokenOutNative={tradeStore.tokenOut.native ?? false}
                poolAddresses={swapPoolAddresses}
                swapParams={swapParams ?? {}}
                gasLimit={swapGasLimit}
                resetAfterSwap={resetAfterSwap}
              />
            ) : tradeStore.tokenIn.native ? (
              <SwapWrapNativeButton
                disabled={
                  swapGasLimit.eq(BN_ZERO) || tradeStore.tradeButton.disabled
                }
                routerAddress={getRouterAddress(networkName)}
                wethAddress={chainProperties[networkName]["wethAddress"]}
                tokenInSymbol={tradeStore.tokenIn.symbol}
                amountIn={tradeStore.amountIn}
                gasLimit={swapGasLimit}
                resetAfterSwap={resetAfterSwap}
              />
            ) : (
              <SwapUnwrapNativeButton
                disabled={
                  swapGasLimit.eq(BN_ZERO) || tradeStore.tradeButton.disabled
                }
                routerAddress={getRouterAddress(networkName)}
                wethAddress={chainProperties[networkName]["wethAddress"]}
                tokenInSymbol={tradeStore.tokenIn.symbol}
                amountIn={tradeStore.amountIn}
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
