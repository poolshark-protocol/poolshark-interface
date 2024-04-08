import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import { useShallow } from "zustand/react/shallow";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useTradeStore } from "../../hooks/useTradeStore";
import useInputBox from "../../hooks/useInputBox";
import { BN_ZERO, Q96_BI, ZERO_ADDRESS } from "../../utils/math/constants";
import SelectToken from "../SelectToken";
import { numFormat, parseUnits } from "../../utils/math/valueMath";
import { getSwapPools } from "../../utils/pools";
import { QuoteParams, SwapParams, QuoteResults } from "../../utils/types";
import { TickMath, maxPriceBn, minPriceBn } from "../../utils/math/tickMath";
import Range from "../Icons/RangeIcon";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import SwapRouterApproveButton from "../Buttons/SwapRouterApproveButton";
import SwapRouterButton from "../Buttons/SwapRouterButton";
import { chainProperties } from "../../utils/chains";
import { gasEstimateSwap } from "../../utils/gas";
import JSBI from "jsbi";
import { useRouter } from "next/router";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { getRouterAddress } from "../../utils/config";
import BalanceDisplay from "../Display/BalanceDisplay";
import { useEthersSigner } from "../../utils/viemEthersAdapters";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import SwitchDirection from "./common/SwitchDirection";
import AmountInDisplay from "./common/AmountInDisplay";
import MaxButton from "./common/MaxButton";
import AmountOutDisplay from "./common/AmountOutDisplay";
import InputBoxContainer from "./common/InputBoxContainer";
import Option from "./common/Option";
import useMultiQuote from "../../hooks/contracts/useMultiQuote";
import useUpdateWethFee from "../../hooks/useUpdateWethFee";
import SwapNativeButtons from "./common/SwapNativeButtons";
import { hasAllowance, hasBalance } from "../../utils/tokens";
import { tradeInputBoxes } from "../../utils/tradeInputBoxes";

export default function MarketSwap({
  quoteRefetchDelay,
}: {
  quoteRefetchDelay: number;
}) {
  const [chainId, networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
    ]),
  );
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

  //* signer wrapper
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
  const handleInputBox = (e) =>
    tradeInputBoxes(e, {
      tradeStore,
      setDisplayIn,
      setDisplayOut,
      setPriceImpact,
      setAmounts,
    });

  ///////////////////////////////Swap Params
  const [swapPoolAddresses, setSwapPoolAddresses] = useState<string[]>([]);
  const [swapParams, setSwapParams] = useState<any[]>([]);

  const { data: quoteData } = useMultiQuote({ availablePools, quoteParams });

  useEffect(() => {
    let poolQuotesSorted: QuoteResults[] = [];
    if (quoteData && quoteData[0]) {
      // format to use BigNumber
      const poolQuotes = deepConvertBigIntAndBigNumber(quoteData);

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
    } else if (quoteData != undefined) {
      if (tradeStore.exactIn) {
        tradeStore.setAmountOut(BN_ZERO);
        setDisplayOut("");
      } else {
        tradeStore.setAmountIn(BN_ZERO);
        setDisplayIn("");
      }
    }
  }, [quoteData, quoteParams, tradeStore.tradeSlippage]);

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

  const updateWethFee = useUpdateWethFee({
    setSwapGasFee,
    setSwapGasLimit,
  });

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
      hasAllowance(tradeStore.tokenIn, tradeStore.amountIn) &&
      hasBalance(tradeStore.tokenIn, tradeStore.amountIn) &&
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

  return (
    <div>
      <InputBoxContainer>
        <div className="flex items-end justify-between text-[11px] text-grey1">
          <AmountInDisplay
            amountIn={tradeStore.amountIn}
            tokenIn={tradeStore.tokenIn}
            displayIn={displayIn}
          />
          <BalanceDisplay token={tradeStore.tokenIn}></BalanceDisplay>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3">
          {inputBoxIn("0", tradeStore.tokenIn, "tokenIn", handleInputBox)}
          <div className="flex items-center gap-x-2">
            {isConnected && tradeStore.tokenIn.address != ZERO_ADDRESS ? (
              <MaxButton
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tradeStore.tokenIn.userBalance.toString(),
                      name: "tokenInMax",
                    },
                  });
                }}
              />
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
      </InputBoxContainer>

      <SwitchDirection
        displayIn={displayIn}
        displayOut={displayOut}
        switchDirection={tradeStore.switchDirection}
        exactIn={tradeStore.exactIn}
        setAmountIn={tradeStore.setAmountIn}
        setAmountOut={tradeStore.setAmountOut}
      />

      <span className="text-[11px] text-grey1">TO</span>
      <InputBoxContainer>
        <div className="flex items-end justify-between text-[11px] text-grey1">
          <AmountOutDisplay
            displayOut={displayOut}
            tokenOut={tradeStore.tokenOut}
          />
          <BalanceDisplay token={tradeStore.tokenOut}></BalanceDisplay>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
          <div>
            {inputBoxOut("0", tradeStore.tokenOut, "tokenOut", handleInputBox)}
          </div>

          <div className="flex items-center gap-x-2">
            {isConnected && tradeStore.tokenOut.address != ZERO_ADDRESS ? (
              <MaxButton
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tradeStore.tokenOut.userBalance.toString(),
                      name: "tokenOutMax",
                    },
                  });
                }}
              />
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
      </InputBoxContainer>

      <Option>
        <div className="flex p-1">
          <div className="text-xs text-[#4C4C4C]">Network Fee</div>
          <div
            className={`ml-auto text-xs ${
              !hasAllowance(tradeStore.tokenIn, tradeStore.amountIn)
                ? "text-[#4C4C4C]"
                : "text-white"
            }`}
          >
            {!hasAllowance(tradeStore.tokenIn, tradeStore.amountIn)
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
      </Option>

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
            !hasAllowance(tradeStore.tokenIn, tradeStore.amountIn) &&
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
            ) : (
              <SwapNativeButtons
                native={tradeStore.tokenIn.native}
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
