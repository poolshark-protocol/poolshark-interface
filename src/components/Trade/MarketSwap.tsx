import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useAccount, useContractRead, useSigner } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useTradeStore } from "../../hooks/useTradeStore";
import useInputBox from "../../hooks/useInputBox";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import SelectToken from "../SelectToken";
import { inputHandler, parseUnits } from "../../utils/math/valueMath";
import { getSwapPools } from "../../utils/pools";
import { QuoteParams, SwapParams } from "../../utils/types";
import { TickMath, maxPriceBn, minPriceBn } from "../../utils/math/tickMath";
import { displayPoolPrice } from "../../utils/math/priceMath";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Range from "../Icons/RangeIcon";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import SwapRouterApproveButton from "../Buttons/SwapRouterApproveButton";
import SwapRouterButton from "../Buttons/SwapRouterButton";
import { chainProperties } from "../../utils/chains";
import { getLimitTokenUsdPrice } from "../../utils/tokens";
import { gasEstimateSwap, gasEstimateWethCall } from "../../utils/gas";
import JSBI from "jsbi";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import SwapUnwrapNativeButton from "../Buttons/SwapUnwrapNativeButton";
import SwapWrapNativeButton from "../Buttons/SwapWrapNativeButton";
import { useRouter } from "next/router";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";

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

  const [
    tradePoolData,
    setTradePoolData,
    tradeButton,
    pairSelected,
    setPairSelected,
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
    s.tradeButton,
    s.pairSelected,
    s.setPairSelected,
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

  const router = useRouter();

  /////////////////////////////Fetch Pools
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);

  //can go to utils
  async function updatePools(amount: BigNumber, isAmountIn: boolean) {
    const pools = await getSwapPools(
      limitSubgraph,
      tokenIn,
      tokenOut,
      tradePoolData,
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
    console.log("pools", pools);
    /* setTimeout(() => {
      updatePools(amount, isAmountIn);
    }, 5000); */
  }

  /////////////////////Tokens info settinxg

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
        setDisplayIn("");
        setAmountIn(BN_ZERO);
      }
    }
  };

  /////////////////////Double Input Boxes
  const [exactIn, setExactIn] = useState(true);

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

  ///////////////////////////////Swap Params
  const [swapPoolAddresses, setSwapPoolAddresses] = useState<string[]>([]);
  const [swapParams, setSwapParams] = useState<any[]>([]);

  const { data: poolQuotes } = useContractRead({
    address: chainProperties[networkName]["routerAddress"], //contract address,
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
    if (poolQuotes && poolQuotes[0]) {
      if (exactIn) {
        setAmountOut(poolQuotes[0].amountOut);
        setDisplayOut(
          parseFloat(
            ethers.utils.formatUnits(
              poolQuotes[0].amountOut.toString(),
              tokenOut.decimals
            )
          ).toPrecision(6)
        );
      } else {
        setAmountIn(poolQuotes[0].amountIn);
        setDisplayIn(
          parseFloat(
            ethers.utils.formatUnits(
              poolQuotes[0].amountIn.toString(),
              tokenIn.decimals
            )
          ).toPrecision(6)
        );
      }
      updateSwapParams(poolQuotes);
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
            poolQuotes[i].priceAfter,
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
          setPriceImpact(
            ((Math.abs(basePrice - currentPrice) * 100) / currentPrice).toFixed(
              2
            )
          );
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
      updatePools(BigNumber.from("1"), true);
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
        chainProperties[networkName]["routerAddress"],
        swapPoolAddresses,
        swapParams,
        tokenIn,
        tokenOut,
        amountIn,
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
            !isNaN(tokenOut.USDPrice) &&
            displayIn != "" ? (
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
              {displayIn
                ? inputBoxOut("0", tokenOut, "tokenOut", handleInputBox)
                : 0}
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
      {tokenIn.address != ZERO_ADDRESS &&
      tokenOut.address != ZERO_ADDRESS &&
      tradePoolData?.id == ZERO_ADDRESS &&
      tradePoolData?.feeTier != undefined &&
      !wethCall ? (
        <div className="flex gap-x-5 rounded-[4px] items-center text-xs p-2 border bg-dark border-grey mb-5">
          <Range className="text-main2" />{" "}
          <span className="text-grey3 flex flex-col gap-y-[-2px]">
            No pools exist for this token pair.{" "}
            <a
              className=" hover:underline text-main2 cursor-pointer"
              onClick={() => {
                setRangeTokenIn(tokenOut, tokenIn, "0", true);
                setRangeTokenOut(tokenIn, tokenOut, "0", false);
                router.push("/range/add-liquidity");
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
                router.push("/range/add-liquidity");
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
            pairSelected ? (
              <div>
                <SwapRouterApproveButton
                  routerAddress={chainProperties[networkName]["routerAddress"]}
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
                  swapGasLimit.eq(BN_ZERO)
                }
                routerAddress={chainProperties[networkName]["routerAddress"]}
                amountIn={amountIn}
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
            )
          }
        </>
      )}
    </div>
  );
}
