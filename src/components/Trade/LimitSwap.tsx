import { useEffect, useState } from "react";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useTradeStore } from "../../hooks/useTradeStore";
import useInputBox from "../../hooks/useInputBox";
import { useAccount, useSigner } from "wagmi";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import SwapRouterApproveButton from "../Buttons/SwapRouterApproveButton";
import LimitSwapButton from "../Buttons/LimitSwapButton";
import SelectToken from "../SelectToken";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { BigNumber, ethers } from "ethers";
import {
  inputHandler,
  numFormat,
  parseUnits,
} from "../../utils/math/valueMath";
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
  getExpectedAmountInFromOutput,
  getExpectedAmountOutFromInput,
  getMarketPriceAboveBelowString,
} from "../../utils/math/priceMath";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { chainProperties } from "../../utils/chains";
import LimitCreateAndMintButton from "../Buttons/LimitCreateAndMintButton";
import inputFilter from "../../utils/inputFilter";
import {
  gasEstimateLimitCreateAndMint,
  gasEstimateMintLimit,
  gasEstimateWethCall,
} from "../../utils/gas";
import SwapWrapNativeButton from "../Buttons/SwapWrapNativeButton";
import SwapUnwrapNativeButton from "../Buttons/SwapUnwrapNativeButton";
import JSBI from "jsbi";

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
    limitTabSelected,
    wethCall,
    startPrice,
    limitPriceOrder,
    tradeSlippage,
    tokenIn,
    setTokenIn,
    setTokenInTradeUSDPrice,
    tokenOut,
    setTokenOut,
    setTokenOutTradeUSDPrice,
    amountIn,
    setAmountIn,
    amountOut,
    setAmountOut,
    exactIn,
    setExactIn,
    needsAllowanceIn,
    needsPairUpdate,
    needsSetAmounts,
    setNeedsAllowanceIn,
    limitPriceString,
    setLimitPriceString,
    switchDirection,
    setTradeButtonState,
    setStartPrice,
    setLimitPriceOrder,
    setNeedsPairUpdate,
    setNeedsSetAmounts,
  ] = useTradeStore((s) => [
    s.tradePoolData,
    s.setTradePoolData,
    s.setTradePoolPrice,
    s.setTradePoolLiquidity,
    s.tradeButton,
    s.pairSelected,
    s.setPairSelected,
    s.limitTabSelected,
    s.wethCall,
    s.startPrice,
    s.limitPriceOrder,
    s.tradeSlippage,
    s.tokenIn,
    s.setTokenIn,
    s.setTokenInTradeUSDPrice,
    s.tokenOut,
    s.setTokenOut,
    s.setTokenOutTradeUSDPrice,
    s.amountIn,
    s.setAmountIn,
    s.amountOut,
    s.setAmountOut,
    s.exactIn,
    s.setExactIn,
    s.needsAllowanceIn,
    s.needsPairUpdate,
    s.needsSetAmounts,
    s.setNeedsAllowanceIn,
    s.limitPriceString,
    s.setLimitPriceString,
    s.switchDirection,
    s.setTradeButtonState,
    s.setStartPrice,
    s.setLimitPriceOrder,
    s.setNeedsPairUpdate,
    s.setNeedsSetAmounts,
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

  const [swapParams, setSwapParams] = useState<any[]>([]);

  /////////////////////////////Fetch Pools
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);
  const [availableFeeTiers, setAvailableFeeTiers] = useState([]);
  const [selectedFeeTier, setSelectedFeeTier] = useState(undefined);

  useEffect(() => {
    if (!limitTabSelected) return;
    if (exactIn) {
      setDisplayIn("");
      setAmountIn(BN_ZERO);
    } else {
      setDisplayOut("");
      setAmountOut(BN_ZERO);
    }
  }, [limitTabSelected]);

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

  useEffect(() => {
    if (!needsPairUpdate) return
    if (tokenIn.address && tokenOut.address !== ZERO_ADDRESS) {
      // adjust decimals when switching directions
      if (!wethCall)
        // only update pools if !wethCall
        updatePools(exactIn ? amountIn : amountOut, exactIn);
    }
    setNeedsPairUpdate(false);
    setNeedsSetAmounts(true);
  }, [needsPairUpdate]);

  useEffect(() => {
    if (!needsSetAmounts) return
    if (tokenIn.address && tokenOut.address !== ZERO_ADDRESS) {
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
    setNeedsSetAmounts(false);
  }, [needsSetAmounts, tradePoolData?.id]);

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
        availableFeeTiers[i] = pools[i].feeTier.id;
      }
    }
    if (pools.length == 1) {
      setSelectedFeeTier(pools[0].feeTier.id);
    }
    setAvailablePools(poolAdresses);
    setQuoteParams(quoteList);
  }

  /////////////////////Double Input Boxes

  const handleInputBox = (e) => {
    if (e.target.name === "tokenIn") {
      const [value, bnValue] = inputHandler(e, tokenIn);
      if (!pairSelected) {
        setDisplayIn(value);
        setDisplayOut("");
        setAmountIn(bnValue);
      } else if (!bnValue.eq(amountIn)) {
        setDisplayIn(value);
        setAmountIn(bnValue);
        setAmounts(bnValue, true);
      } else {
        setDisplayIn(value);
        if (bnValue.eq(BN_ZERO)) {
          setDisplayOut("");
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
          setDisplayIn("");
        }
      }
      setExactIn(false);
    }
  };

  ///////////////////////////////Limit Params
  const [lowerPriceString, setLowerPriceString] = useState("0");
  const [upperPriceString, setUpperPriceString] = useState("0");

  useEffect(() => {
    if (needsPairUpdate) return
    if (tradePoolData.poolPrice != undefined) {
      var newPrice = numFormat(parseFloat(
        invertPrice(
          TickMath.getPriceStringAtSqrtPrice(
            JSBI.BigInt(tradePoolData.poolPrice),
            tokenIn, tokenOut
          ),
          limitPriceOrder
        )
      ), 6);
      setLimitPriceString(newPrice);
    } else {
      setLimitPriceString('0.00')
    }
  }, [tradePoolData?.id, needsPairUpdate]);

  useEffect(() => {
    if (priceRangeSelected) {
      const tickSpacing = tradePoolData?.feeTier?.tickSpacing;
      if (!isNaN(parseFloat(lowerPriceString))) {
        const priceLower = invertPrice(
          limitPriceOrder ? lowerPriceString : upperPriceString,
          limitPriceOrder
        );
        setLowerTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(
              priceLower,
              tokenIn,
              tokenOut,
              tickSpacing
            )
          )
        );
      }
      if (!isNaN(parseFloat(upperPriceString))) {
        const priceUpper = invertPrice(
          limitPriceOrder ? upperPriceString : lowerPriceString,
          limitPriceOrder
        );
        setUpperTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(
              priceUpper,
              tokenIn,
              tokenOut,
              tickSpacing
            )
          )
        );
      }
    }
  }, [
    lowerPriceString,
    upperPriceString,
    priceRangeSelected,
    tokenIn,
    tokenOut,
  ]);

  const handlePriceSwitch = () => {
    setLimitPriceOrder(!limitPriceOrder);
    setLimitPriceString(invertPrice(limitPriceString, false));
    setLowerPriceString(invertPrice(upperPriceString, false));
    setUpperPriceString(invertPrice(lowerPriceString, false));
    if (tradePoolData.id == ZERO_ADDRESS) {
      setStartPrice(invertPrice(startPrice, false));
    }
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
  }, [
    limitPriceString,
    tradeSlippage,
    priceRangeSelected,
    tradePoolData.feeTier?.tickSpacing,
  ]);

  function updateLimitTicks() {
    const tickSpacing = tradePoolData.feeTier?.tickSpacing ?? 30;
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

  useEffect(() => {
    if (exactIn) {
      if (!isNaN(parseFloat(limitPriceString))) {
        if (wethCall) {
          setDisplayOut(displayIn);
          setAmountOut(amountIn);
        } else {
          const tokenOutAmount = getExpectedAmountOutFromInput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            amountIn
          );
          const tokenOutAmountDisplay = numFormat(parseFloat(
            ethers.utils.formatUnits(
              tokenOutAmount.toString(),
              tokenOut.decimals
            )
          ), 6);
          if (tokenOutAmount.gt(BN_ZERO)) {
            setDisplayOut(tokenOutAmountDisplay);
            setAmountOut(tokenOutAmount);
          } else {
            setDisplayOut('')
            setAmountOut(BN_ZERO)
          }

        }
      } else {
        setDisplayOut("");
        setAmountOut(BN_ZERO);
      }
    } else {
      if (!isNaN(parseFloat(limitPriceString))) {
        if (wethCall) {
          setDisplayIn(displayOut);
          setAmountIn(amountOut);
        } else {
          const tokenInAmount = getExpectedAmountInFromOutput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            amountOut
          );
          const tokenInAmountDisplay = numFormat(parseFloat(
            ethers.utils.formatUnits(tokenInAmount.toString(), tokenIn.decimals)
          ), 6);
          setDisplayIn(tokenInAmountDisplay);
          setAmountIn(tokenInAmount);
        }
      } else {
        setDisplayIn("");
        setAmountIn(BN_ZERO);
      }
    }
  }, [lowerTick, upperTick]);

  const setAmounts = (bnValue: BigNumber, isAmountIn: boolean) => {
    if (isAmountIn) {
      if (bnValue.gt(BN_ZERO)) {
        if (wethCall) {
          setDisplayOut(ethers.utils.formatUnits(bnValue, tokenIn.decimals));
          setAmountOut(bnValue);
        } else {
          const tokenOutAmount = getExpectedAmountOutFromInput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            bnValue
          );
          const tokenOutAmountDisplay = numFormat(parseFloat(
            ethers.utils.formatUnits(
              tokenOutAmount.toString(),
              tokenOut.decimals
            )
          ), 6);
          setDisplayOut(tokenOutAmountDisplay);
          setAmountOut(tokenOutAmount);
        }
      } else {
        setDisplayOut("");
        setAmountOut(BN_ZERO);
      }
    } else {
      if (bnValue.gt(BN_ZERO)) {
        if (wethCall) {
          setDisplayIn(ethers.utils.formatUnits(bnValue, tokenOut.decimals));
          setAmountIn(bnValue);
        } else {
          const tokenInAmount = getExpectedAmountInFromOutput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            bnValue
          );
          const tokenInAmountDisplay = numFormat(parseFloat(
            ethers.utils.formatUnits(tokenInAmount.toString(), tokenIn.decimals)
          ), 6);
          setDisplayIn(tokenInAmountDisplay);
          setAmountIn(tokenInAmount);
        }
      } else {
        setDisplayIn("");
        setAmountIn(BN_ZERO);
      }
    }
  };

  ////////////////////////////////FeeTiers & Slippage
  const [priceImpact, setPriceImpact] = useState("0.00");

  useEffect(() => {
    if (
      tradePoolData?.id == ZERO_ADDRESS &&
      startPrice &&
      !isNaN(parseFloat(startPrice))
    ) {
      setTradePoolData({
        id: ZERO_ADDRESS,
        poolPrice: String(
          TickMath.getSqrtPriceAtPriceString(
            invertPrice(startPrice, limitPriceOrder),
            tokenIn,
            tokenOut
          )
        ),
        tickAtPrice: TickMath.getTickAtPriceString(
          invertPrice(startPrice, limitPriceOrder),
          tokenIn,
          tokenOut
        ),
        // hard set at 0.3% tier
        feeTier: {
          feeAmount: 3000,
          tickSpacing: 30,
        },
      });
    }
  }, [tradePoolData?.id, startPrice]);

  ////////////////////////////////Gas
  const [mintFee, setMintFee] = useState("$0.00");
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);
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
      updateMintFee();
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
    lowerTick,
    upperTick,
    needsAllowanceIn,
    wethCall,
    amountIn,
  ]);

  async function updateMintFee() {
    if (
      (tokenIn.native || tokenIn.userRouterAllowance?.gte(amountIn)) &&
      lowerTick?.lt(upperTick)
    )
      if (tradePoolData?.id != ZERO_ADDRESS) {
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
      } else {
        await gasEstimateLimitCreateAndMint(
          limitPoolTypeIds["constant-product"],
          tradePoolData?.feeTier?.feeAmount ?? 3000,
          address,
          lowerTick,
          upperTick,
          tokenIn,
          tokenOut,
          amountIn,
          tradePoolData?.feeTier?.tickSpacing ?? 30,
          startPrice,
          signer,
          setMintFee,
          setMintGasLimit,
          networkName
        );
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

  ////////////////////////////////Button State

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

  ////////////////////////////////Expanded
  const [expanded, setExpanded] = useState(false);

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div className="ml-auto text-xs">
              {pairSelected
                ? numFormat(parseFloat(
                    ethers.utils.formatUnits(
                      amountOut ?? BN_ZERO,
                      tokenOut.decimals
                    )
                  ), 6)
                : "Select Token"}
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
                6
              )}
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
            ~$
            {!isNaN(parseInt(amountIn.toString())) &&
            !isNaN(tokenIn.decimals) &&
            !isNaN(tokenIn.USDPrice)
              ? (
                  (!isNaN(parseFloat(displayIn)) ? parseFloat(displayIn) : 0) *
                  (tokenIn.USDPrice ?? 0)
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
            {!isNaN(tokenOut.decimals) &&
            !isNaN(tokenOut.USDPrice) ? (
              (
                (!isNaN(parseFloat(displayOut)) ? parseFloat(displayOut) : 0) *
                (tokenOut.USDPrice ?? 0)
              ).toFixed(2)
            ) : (
              <>{(0).toFixed(2)}</>
            )}
          </span>
          <span>
            {pairSelected ? (
              "Balance: " +
              (!isNaN(tokenOut?.userBalance) ? tokenOut.userBalance : "0")
            ) : (
              <></>
            )}
          </span>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
          {
            <div>
              <div>
                {inputBoxOut("0", tokenOut, "tokenOut", handleInputBox)}
              </div>
            </div>
          }
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
      <div className="flex gap-y-4 w-full items-center mt-5 justify-between bg-dark border-grey/80 p-2 border rounded-[4px]">
        <div className="bg-dark text-sm uppercase pl-2 rounded-[4px] flex items-center gap-x-2">
          <span className="md:block hidden">SELECT A</span> Fee tier:
        </div>
        <div className="grid grid-cols-3 gap-x-3">
          <div
            className={
              selectedFeeTier == "1000"
                ? "py-1.5 text-sm border-grey1 bg-grey/40 transition-all cursor-pointer border border-grey md:px-5 px-3 rounded-[4px]"
                : "py-1.5 text-sm bg-dark hover:border-grey1 hover:bg-grey/40 transition-all cursor-pointer border border-grey md:px-5 px-3 rounded-[4px]"
            }
            onClick={() => {
              setSelectedFeeTier(1000);
            }}
          >
            0.01%
          </div>
          <div
            className={
              selectedFeeTier == "3000"
                ? "py-1.5 text-sm border-grey1 bg-grey/40 transition-all cursor-pointer border border-grey md:px-5 px-3 rounded-[4px]"
                : "py-1.5 text-sm bg-dark hover:border-grey1 hover:bg-grey/40 transition-all cursor-pointer border border-grey md:px-5 px-3 rounded-[4px]"
            }
            onClick={() => {
              setSelectedFeeTier(3000);
            }}
          >
            0.03%
          </div>
          <div
            className={
              selectedFeeTier == "10000"
                ? "py-1.5 text-sm border-grey1 bg-grey/40 transition-all cursor-pointer border border-grey md:px-5 px-3 rounded-[4px]"
                : "py-1.5 text-sm bg-dark hover:border-grey1 hover:bg-grey/40 transition-all cursor-pointer border border-grey md:px-5 px-3 rounded-[4px]"
            }
            onClick={() => {
              setSelectedFeeTier(10000);
            }}
          >
            0.1%
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
                  tradePoolData,
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
              disabled={wethCall}
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
      tradePoolData?.id == ZERO_ADDRESS &&
      !wethCall ? (
        <div className="bg-dark border rounded-[4px] border-grey/50 p-5 mt-5">
          <p className="text-xs text-grey1 flex items-center gap-x-4 mb-5">
            This pool does not exist so a start price must be set.
          </p>
          <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
            <span className="text-grey1 text-xs">STARTING PRICE</span>
            <span className="text-white text-3xl">
              <input
                autoComplete="off"
                className="bg-black py-2 outline-none text-center w-full"
                placeholder="0"
                id="startPrice"
                value={startPrice}
                type="text"
                onChange={(e) => {
                  setStartPrice(inputFilter(e.target.value));
                }}
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

      {isDisconnected ? (
        <ConnectWalletButton xl={true} />
      ) : (
        <>
          {tokenIn.userRouterAllowance?.lt(amountIn) &&
          !tokenIn.native &&
          pairSelected ? (
            <SwapRouterApproveButton
              routerAddress={chainProperties[networkName]["routerAddress"]}
              approveToken={tokenIn.address}
              tokenSymbol={tokenIn.symbol}
              amount={amountIn}
            />
          ) : !wethCall ? (
            tokenOut.address == ZERO_ADDRESS ||
            tradePoolData?.id != ZERO_ADDRESS ? (
              <LimitSwapButton
                routerAddress={chainProperties[networkName]["routerAddress"]}
                disabled={mintGasLimit.lt(BigNumber.from('100000')) || tradeButton.disabled}
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
                disabled={mintGasLimit.eq(BN_ZERO) || tradeButton.disabled}
                routerAddress={
                  
                  chainProperties[networkName]["routerAddress"]
                }
                poolTypeId={limitPoolTypeIds["constant-product"]}
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                feeTier={tradePoolData?.feeTier?.feeAmount}
                to={address}
                amount={amountIn}
                mintPercent={parseUnits("1", 24)}
                lower={lowerTick}
                upper={upperTick}
                closeModal={() => {}}
                zeroForOne={tokenIn.callId == 0}
                gasLimit={mintGasLimit}
              />
            )
          ) : tokenIn.native ? (
            <SwapWrapNativeButton
              disabled={swapGasLimit.eq(BN_ZERO) || tradeButton.disabled}
              routerAddress={chainProperties[networkName]["routerAddress"]}
              wethAddress={chainProperties[networkName]["wethAddress"]}
              tokenInSymbol={tokenIn.symbol}
              amountIn={amountIn}
              gasLimit={swapGasLimit}
              resetAfterSwap={resetAfterSwap}
            />
          ) : (
            <SwapUnwrapNativeButton
              disabled={swapGasLimit.eq(BN_ZERO) || tradeButton.disabled}
              routerAddress={chainProperties[networkName]["routerAddress"]}
              wethAddress={chainProperties[networkName]["wethAddress"]}
              tokenInSymbol={tokenIn.symbol}
              amountIn={amountIn}
              gasLimit={swapGasLimit}
              resetAfterSwap={resetAfterSwap}
            />
          )}
        </>
      )}
    </div>
  );
}
