import { useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import SelectToken from "../components/SelectToken";
import useInputBox from "../hooks/useInputBox";
import { ConnectWalletButton } from "../components/Buttons/ConnectWalletButton";
import {
  erc20ABI,
  useAccount,
  useSigner,
  useProvider,
  useContractRead,
  useBalance,
} from "wagmi";
import { BigNumber, ethers } from "ethers";
import { chainIdsToNamesForGitTokenList, chainProperties } from "../utils/chains";
import SwapRouterApproveButton from "../components/Buttons/SwapRouterApproveButton";
import {
  TickMath,
  invertPrice,
  maxPriceBn,
  minPriceBn,
} from "../utils/math/tickMath";
import { BN_ZERO, ZERO, ZERO_ADDRESS } from "../utils/math/constants";
import { gasEstimateMintLimit, gasEstimateSwap } from "../utils/gas";
import inputFilter from "../utils/inputFilter";
import LimitSwapButton from "../components/Buttons/LimitSwapButton";
import {
  fetchRangeTokenUSDPrice, getLimitTokenUsdPrice, logoMap,
} from "../utils/tokens";
import { getSwapPools } from "../utils/pools";
import { poolsharkRouterABI } from "../abis/evm/poolsharkRouter";
import { QuoteParams, SwapParams } from "../utils/types";
import { useTradeStore } from "../hooks/useTradeStore";
import SwapRouterButton from "../components/Buttons/SwapRouterButton";
import JSBI from "jsbi";
import LimitCreateAndMintButton from "../components/Buttons/LimitCreateAndMintButton";
import { fetchLimitPositions } from "../utils/queries";
import { mapUserLimitPositions } from "../utils/maps";
import { getAveragePrice, getExpectedAmountOut, getExpectedAmountOutFromInput } from "../utils/math/priceMath";
import LimitSwapBurnButton from "../components/Buttons/LimitSwapBurnButton";
import timeDifference from "../utils/time";
import { DyDxMath } from "../utils/math/dydxMath";

export default function Trade() {
  const { address, isDisconnected, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const {
    network: { chainId },
  } = useProvider();
  const { bnInput, display, inputBox, maxBalance, setBnInput, setDisplay } =
    useInputBox();

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
    needsAllowanceIn,
    setNeedsAllowanceIn,
    needsAllowanceOut,
    setNeedsAllowanceOut,
    needsBalanceIn,
    setNeedsBalanceIn,
    needsBalanceOut,
    setNeedsBalanceOut,
    switchDirection,
    setMintButtonState,
    needsRefetch,
    setNeedsRefetch,
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
    s.needsAllowanceIn,
    s.setNeedsAllowanceIn,
    s.needsAllowanceOut,
    s.setNeedsAllowanceOut,
    s.needsBalanceIn,
    s.setNeedsBalanceIn,
    s.needsBalanceOut,
    s.setNeedsBalanceOut,
    s.switchDirection,
    s.setMintButtonState,
    s.needsRefetch,
    s.setNeedsRefetch,
  ]);

  //false when user in normal swap, true when user in limit swap
  const [limitTabSelected, setLimitTabSelected] = useState(false);

  //false when user is in exact price, true when user is in price range
  const [priceRangeSelected, setPriceRangeSelected] = useState(false);

  //false order history is selected, true when active orders is selected
  const [activeOrdersSelected, setActiveOrdersSelected] = useState(true);

  ////////////////////////////////ChainId
  const [stateChainName, setStateChainName] = useState();

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId]);
  }, [chainId]);

  ////////////////////////////////TokenOrder
  //we should stop using tokenOrder and instead use tokenIn.callId==0
  const [tokenOrder, setTokenOrder] = useState(true);

  /* useEffect(() => {
    setTokenOrder(tokenIn.callId == 0);
  }, [tokenIn, tokenOut]); */

  ////////////////////////////////Pools
  //quoting variables
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);

  //swap call variables
  const [swapPoolAddresses, setSwapPoolAddresses] = useState<string[]>([]);
  const [swapParams, setSwapParams] = useState(undefined);

  //display variable
  const [amountOut, setAmountOut] = useState(undefined);

  useEffect(() => {
    if (tokenIn.address != "0x00" && tokenOut.address === ZERO_ADDRESS) {
      getLimitTokenUsdPrice(tokenIn.address, setTokenInTradeUSDPrice);
    }
  }, [tokenIn.address]);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address !== ZERO_ADDRESS) {
      updatePools();
    }
  }, [tokenIn.address, tokenOut.address]);

  async function updatePools() {
    const pools = await getSwapPools(tokenIn, tokenOut, setTradePoolData);
    const poolAdresses: string[] = [];
    const quoteList: QuoteParams[] = [];
    if (pools) {
      for (let i = 0; i < pools.length; i++) {
        const params: QuoteParams = {
          priceLimit: tokenIn.callId == 0 ? minPriceBn : maxPriceBn,
          amount: bnInput,
          exactIn: true,
          zeroForOne: tokenIn.callId == 0,
        };
        quoteList[i] = params;
        poolAdresses[i] = pools[i].id;
      }
    }
    setAvailablePools(poolAdresses);
    setQuoteParams(quoteList);
  }

  const { data: poolQuotes } = useContractRead({
    address: chainProperties['arbitrumGoerli']['routerAddress'], //contract address,
    abi: poolsharkRouterABI, // contract abi,
    functionName: "multiQuote",
    args: [availablePools, quoteParams, true],
    chainId: 421613,
    enabled: availablePools && quoteParams,
    onError(error) {
      console.log("Error multiquote", error);
    },
    onSuccess(data) {
      //console.log("Success multiquote", data);
    },
  });

  useEffect(() => {
    if (poolQuotes && poolQuotes[0]) {
      setAmountOut(
        ethers.utils.formatUnits(
          poolQuotes[0].amountOut.toString(),
          tokenOut.decimals
        )
      );
      updateSwapParams(poolQuotes);
    }
  }, [poolQuotes]);

  function updateSwapParams(poolQuotes: any) {
    const poolAddresses: string[] = [];
    const swapParams: SwapParams[] = [];
    for (let i = 0; i < poolQuotes.length; i++) {
      poolAddresses.push(poolQuotes[i].pool);
      const basePrice: Number = Number(
        TickMath.getPriceStringAtSqrtPrice(poolQuotes[i].priceAfter)
      );
      const limitPrice: Number =
        (Number(basePrice) * (1 + parseFloat(slippage) * 100)) / 10000;
      const limitPriceJsbi: JSBI = TickMath.getSqrtPriceAtPriceString(
        limitPrice.toString()
      );
      const priceLimitBn = BigNumber.from(String(limitPriceJsbi));
      const params: SwapParams = {
        to: address,
        priceLimit: priceLimitBn,
        amount: bnInput,
        exactIn: true,
        zeroForOne: tokenIn.callId == 0,
        callbackData: ethers.utils.formatBytes32String(""),
      };
      swapParams.push(params);
    }
    setSwapPoolAddresses(poolAddresses);
    setSwapParams(swapParams);
  }

  //////////////////////Get Pools Data

  const [allLimitPositions, setAllLimitPositions] = useState([]);

  useEffect(() => {
    if (address && needsRefetch) {
      console.log("user address", address.toLowerCase());
      getUserLimitPositionData();
      setNeedsRefetch(false)
    }
  }, [address, needsRefetch]);

  async function getUserLimitPositionData() {
    try {
      const data = await fetchLimitPositions(address.toLowerCase());
      console.log("data limit", data)
      if (data["data"]) {
        console.log("limitPositions", data["data"]?.limitPositions)
        setAllLimitPositions(
          mapUserLimitPositions(data["data"].limitPositions)
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////TokenUSDPrices

  useEffect(() => {
    if (tradePoolData) {
      if (tokenIn.address) {
        if (tradePoolData.token0 && tradePoolData.token1) {
          // if limit pool fetch limit price
          fetchRangeTokenUSDPrice(
            tradePoolData,
            tokenIn,
            setTokenInTradeUSDPrice
          );
        }
        //TODO: check if cover and/or range pools present
      }
      if (tokenOut.address) {
        if (tradePoolData.token0 && tradePoolData.token1) {
          // if limit pool fetch limit price
          fetchRangeTokenUSDPrice(
            tradePoolData,
            tokenOut,
            setTokenOutTradeUSDPrice
          );
        }
      }
    }
  }, [tradePoolData, tokenIn.address, tokenOut.address]);

  ////////////////////////////////Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.address,
    enabled: tokenIn.address != undefined && needsBalanceIn,
    watch: needsBalanceIn,
    onSuccess(data) {
      if (needsBalanceIn) {
        setNeedsBalanceIn(false);
      }
    },
  });

  const { data: tokenOutBal } = useBalance({
    address: address,
    token: tokenOut.address,
    enabled: tokenOut.address != undefined && needsBalanceOut,
    watch: needsBalanceOut,
    onSuccess(data) {
      if (needsBalanceOut) {
        setNeedsBalanceOut(false);
      }
    },
  });

  useEffect(() => {
    if (isConnected) {
      setTokenInBalance(
        parseFloat(tokenInBal?.formatted.toString()).toFixed(2)
      );
    }
    if (tokenOutBal) {
      setTokenOutBalance(
        parseFloat(tokenOutBal?.formatted.toString()).toFixed(2)
      );
    }
  }, [tokenInBal, tokenOutBal]);

  ////////////////////////////////Allowances

  const { data: allowanceInRouter } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      address,
      chainProperties['arbitrumGoerli']['routerAddress'],
    ],
    chainId: 421613,
    watch: needsAllowanceIn,
    //enabled: poolRouterAddress,
    onError(error) {
      console.log("Error allowance", error);
    },
    onSuccess(data) {
      setNeedsAllowanceIn(false);
      //console.log("Success allowance", data);
    },
  });

  useEffect(() => {
    if (allowanceInRouter) {
      setTokenInTradeAllowance(allowanceInRouter);
    }
  }, [allowanceInRouter]);

  ////////////////////////////////FeeTiers and Slippage
  const [slippage, setSlippage] = useState("0.5");

  //i receive the price afte from the multiquote and then i will add and subtract the slippage from it

  ////////////////////////////////Limit Price Switch
  const [limitPriceOrder, setLimitPriceOrder] = useState(true);
  const [limitStringPriceQuote, setLimitStringPriceQuote] = useState("0");
  const [lowerPriceString, setLowerPriceString] = useState("0");
  const [upperPriceString, setUpperPriceString] = useState("0");

  useEffect(() => {
    if (tokenIn.USDPrice != 0 && tokenOut.USDPrice != 0) {
      setLimitStringPriceQuote(
        (tokenIn.USDPrice / tokenOut.USDPrice).toPrecision(6).toString()
      );
    }
  }, [tokenOut.USDPrice, tokenIn.USDPrice]);

  useEffect(() => {
    if (tokenIn.USDPrice != 0 && tokenOut.USDPrice != 0) {
      var newPrice = (tokenIn.USDPrice / tokenOut.USDPrice)
        .toPrecision(6)
        .toString();
      setLimitStringPriceQuote(newPrice);
    }
  }, [tokenOrder]);

  useEffect(() => {
    if (tokenIn.USDPrice != 0 && tokenOut.USDPrice != 0) {
      if (!limitPriceOrder) {
        setLimitStringPriceQuote(
          (tokenOut.USDPrice / tokenIn.USDPrice).toPrecision(6).toString()
        );
      } else {
        setLimitStringPriceQuote(
          (tokenIn.USDPrice / tokenOut.USDPrice).toPrecision(6).toString()
        );
      }
    }
  }, [limitPriceOrder, tokenOrder]);

  useEffect(() => {
    const tickSpacing = tradePoolData?.feeTier?.tickSpacing;

    setLowerTick(
      BigNumber.from(
        TickMath.getTickAtPriceString(lowerPriceString, tickSpacing)
      )
    );
  }, [lowerPriceString]);

  useEffect(() => {
    const tickSpacing = tradePoolData?.feeTier?.tickSpacing;

    setUpperTick(
      BigNumber.from(
        TickMath.getTickAtPriceString(upperPriceString, tickSpacing)
      )
    );
  }, [upperPriceString]);

  ////////////////////////////////Limit Ticks
  const [lowerTick, setLowerTick] = useState(BN_ZERO);
  const [upperTick, setUpperTick] = useState(BN_ZERO);

  useEffect(() => {
    if (
      slippage &&
      limitStringPriceQuote &&
      tradePoolData?.feeTier?.tickSpacing
    ) {
      updateLimitTicks();
    }
  }, [limitStringPriceQuote, slippage]);

  function updateLimitTicks() {
    const tickSpacing = tradePoolData.feeTier.tickSpacing;
    if (
      isFinite(parseFloat(limitStringPriceQuote)) &&
      parseFloat(limitStringPriceQuote) > 0
    ) {
      if (
        parseFloat(slippage) * 100 > tickSpacing &&
        parseFloat(limitStringPriceQuote) > 0
      ) {
        const limitPriceTolerance =
          (parseFloat(limitStringPriceQuote) *
            parseFloat((parseFloat(slippage) * 100).toFixed(6))) /
          10000;
        if (tokenOrder) {
          const endPrice =
            parseFloat(limitStringPriceQuote) - -limitPriceTolerance;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(limitStringPriceQuote, tickSpacing)
            )
          );
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(String(endPrice), tickSpacing)
            )
          );
        } else {
          const endPrice =
            parseFloat(limitStringPriceQuote) - limitPriceTolerance;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(String(endPrice), tickSpacing)
            )
          );
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(limitStringPriceQuote, tickSpacing)
            )
          );
        }
      } else {
        if (tokenOrder) {
          const endTick =
            TickMath.getTickAtPriceString(limitStringPriceQuote, tickSpacing) -
            -tickSpacing;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(limitStringPriceQuote, tickSpacing)
            )
          );
          setUpperTick(BigNumber.from(String(endTick)));
        } else {
          const endTick =
            TickMath.getTickAtPriceString(limitStringPriceQuote, tickSpacing) -
            tickSpacing;
          setLowerTick(BigNumber.from(String(endTick)));
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(limitStringPriceQuote, tickSpacing)
            )
          );
        }
      }
    }
  }
  ////////////////////////////////Fee Estimations
  const [swapGasFee, setSwapGasFee] = useState("$0.00");
  const [swapGasLimit, setSwapGasLimit] = useState(BN_ZERO);
  const [mintFee, setMintFee] = useState("$0.00");
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (!bnInput.eq(BN_ZERO)) {
      if (!limitTabSelected) {
        updateGasFee();
      } else {
        updateMintFee();
      }
    }
  }, [swapParams, tokenIn, tokenOut, bnInput]);

  async function updateGasFee() {
    if (tokenIn.userRouterAllowance?.gte(bnInput))
      await gasEstimateSwap(
        chainProperties['arbitrumGoerli']['routerAddress'],
        swapPoolAddresses,
        swapParams,
        tokenIn,
        tokenOut,
        signer,
        isConnected,
        setSwapGasFee,
        setSwapGasLimit
      );
  }

  async function updateMintFee() {
    if (tokenIn.userRouterAllowance?.gte(bnInput))
      await gasEstimateMintLimit(
        tradePoolData.id,
        address,
        lowerTick,
        upperTick,
        tokenIn,
        tokenOut,
        bnInput,
        signer,
        setMintFee,
        setMintGasLimit
      );
  }

  ////////////////////////////////Mint Button State

  useEffect(() => {
    if (bnInput) {
      setTokenInAmount(bnInput);
    }
  }, [bnInput]);

  useEffect(() => {
    console.log(limitStringPriceQuote, "limit quote")
  }, [limitStringPriceQuote])

  useEffect(() => {
    setMintButtonState();
  }, [tradeParams.tokenInAmount, tradeParams.tokenOutAmount]);

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
                ? !limitTabSelected
                  ? amountOut
                  : !isNaN(parseFloat(
                    ethers.utils.formatUnits(bnInput, tokenIn.decimals))
                  ) && !isNaN(parseInt(ethers.utils.formatUnits(lowerTick, 0)))
                  && !isNaN(parseInt(ethers.utils.formatUnits(upperTick, 0)))  ? (
                      parseFloat(
                        ethers.utils.formatUnits(
                          getExpectedAmountOut(
                            parseInt(ethers.utils.formatUnits(lowerTick, 0)),
                            parseInt(ethers.utils.formatUnits(upperTick, 0)),
                            limitPriceOrder,
                            BigNumber.from(String(DyDxMath.getLiquidityForAmounts(
                              TickMath.getSqrtRatioAtTick(parseInt(ethers.utils.formatUnits(lowerTick, 0))),
                              TickMath.getSqrtRatioAtTick(parseInt(ethers.utils.formatUnits(upperTick, 0))),
                              limitPriceOrder ? TickMath.getSqrtRatioAtTick(parseInt(ethers.utils.formatUnits(lowerTick, 0))) 
                                              : TickMath.getSqrtRatioAtTick(parseInt(ethers.utils.formatUnits(upperTick, 0))),
                              limitPriceOrder ? BN_ZERO 
                                              : bnInput,
                              limitPriceOrder ? bnInput 
                                              : BN_ZERO,
                            ))
                          )), tokenIn.decimals
                    )).toFixed(2)) :
                    "$0.00"
                : "Select Token"}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            {!limitTabSelected ? (
              <div className="ml-auto text-xs">{swapGasFee}</div>
            ) : (
              <div className="ml-auto text-xs">{mintFee}</div>
            )}
          </div>
          {!limitTabSelected ? (
            <div className="flex p-1">
              <div className="text-xs text-[#4C4C4C]">
                Minimum received after slippage ({slippage}%)
              </div>
              <div className="ml-auto text-xs">
              </div>
            </div>
          ) : (
            <></>
          )}
          {!limitTabSelected ? (
            <div className="flex p-1">
              <div className="text-xs text-[#4C4C4C]">Price Impact</div>
              <div className="ml-auto text-xs">
                {/* {pairSelected
                  ? rangePriceAfter
                    ? (
                        Math.abs((rangePrice - rangePriceAfter) * 100) /
                        rangePrice
                      ).toFixed(2) + "%"
                    : "0.00%"
                  : "Select Token"} */}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      );
    }
  };
  return (
    <div className="min-h-[calc(100vh-160px)] w-[43rem] px-3 md:px-0">
      <div className="flex w-full mt-[10vh] justify-center mb-20 ">
        <div className="bg-black font-regular border border-grey rounded-[4px]">
          <div className="flex text-xs">
            <button
              onClick={() => setLimitTabSelected(false)}
              className={`w-full relative py-2.5 ${
                !limitTabSelected
                  ? "text-white"
                  : "text-white/50 border-b border-r border-grey"
              }`}
            >
              {!limitTabSelected && (
                <div className="h-0.5 w-full bg-main absolute top-[-1px]" />
              )}
              MARKET SWAP
            </button>
            <button
              onClick={() => setLimitTabSelected(true)}
              className={`w-full relative py-2.5 ${
                limitTabSelected
                  ? "text-white"
                  : "text-white/50 border-b border-l border-grey"
              }`}
            >
              {limitTabSelected && (
                <div className="h-0.5 w-full bg-main absolute top-[-1px]" />
              )}
              LIMIT SWAP
            </button>
          </div>
          <div className="p-4">
            <span className="text-[11px] text-grey1">FROM</span>
            <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
              <div className="flex items-end justify-between text-[11px] text-grey1">
                <span>
                  {" "}
                  ~$
                  {bnInput.gt(0) ? (
                    (
                      Number(
                        ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                      ) * tokenIn.USDPrice
                    ).toFixed(2)
                  ) : (
                    (1 * tokenIn.USDPrice).toFixed(2)
                  )}
                </span>
                <span>BALANCE: {tokenIn.userBalance}</span>
              </div>
              <div className="flex items-end justify-between mt-2 mb-3">
                {inputBox("0")}
                <div className="flex items-center gap-x-2">
                  {isConnected && stateChainName === "arbitrumGoerli" ? (
                    <button
                      onClick={() => {
                        maxBalance(tokenIn.userBalance, "1");
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
                  switchDirection();
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
                  !bnInput.eq(BN_ZERO) &&
                  tokenOut.address != ZERO_ADDRESS &&
                  !isNaN(parseFloat(
                    ethers.utils.formatUnits(bnInput, tokenIn.decimals))
                  ) && !isNaN(parseInt(ethers.utils.formatUnits(lowerTick, 0)))
                  && !isNaN(parseInt(ethers.utils.formatUnits(upperTick, 0)))  ? (
                    !limitTabSelected ? (
                      //swap page
                      (amountOut * tokenOut.USDPrice).toFixed(2)
                    ) : //limit page
                    (
                      parseFloat(
                        ethers.utils.formatUnits(
                          getExpectedAmountOutFromInput(
                            Number(lowerTick),
                            Number(upperTick),
                            limitPriceOrder,
                            bnInput
                          )
                          , tokenIn.decimals
                    )) * tokenOut.USDPrice).toFixed(2)
                  ) : (
                    <>{(0).toFixed(2)}</>
                  )}
                </span>
                <span>
                  {pairSelected ? "Balance: " + tokenOut.userBalance : <></>}
                </span>
              </div>
              <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                {pairSelected &&
                !bnInput.eq(BN_ZERO) &&
                tokenOut.address != ZERO_ADDRESS &&
                !isNaN(parseFloat(
                  ethers.utils.formatUnits(bnInput, tokenIn.decimals))
                ) && !isNaN(parseInt(ethers.utils.formatUnits(lowerTick, 0)))
                && !isNaN(parseInt(ethers.utils.formatUnits(upperTick, 0)))  ? (
                  !limitTabSelected ? (
                    <div>{Number(amountOut).toPrecision(5)}</div>
                  ) : (
                    <div>
                      {parseFloat(
                        ethers.utils.formatUnits(
                          getExpectedAmountOutFromInput(
                            Number(lowerTick),
                            Number(upperTick),
                            limitPriceOrder,
                            bnInput
                          ), tokenIn.decimals
                    )).toFixed(3)}
                    </div>
                  )
                ) : (
                  <div>0</div>
                )}
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
                  />
                </div>
              </div>
            </div>
            {limitTabSelected ? (
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
                    onClick={() => setLimitPriceOrder(!limitPriceOrder)}
                  >
                    <span className="text-grey1 group-hover:text-white transition-all">
                      {tokenOrder && pairSelected === false ? (
                        <div>{tokenIn.symbol} per ?</div>
                      ) : (
                        <div>
                          {" "}
                          {limitPriceOrder
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
                            !isNaN(parseFloat(lowerPriceString))
                              ? lowerPriceString
                              : 0
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
                            !isNaN(parseFloat(upperPriceString))
                              ? upperPriceString
                              : 0
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
                        {pairSelected && !isNaN(parseFloat(limitStringPriceQuote))
                          ? //switcher tokenOrder
                            limitPriceOrder
                            ? //when normal order tokenIn/tokenOut
                              (parseFloat(limitStringPriceQuote) /
                                (tokenIn.USDPrice / tokenOut.USDPrice) -
                                1) *
                                100 >
                              0
                              ? (
                                  (parseFloat(limitStringPriceQuote) /
                                    (tokenIn.USDPrice / tokenOut.USDPrice) -
                                    1) *
                                  100
                                ).toFixed(2) + "% above Market Price"
                              : Math.abs(
                                  (parseFloat(limitStringPriceQuote) /
                                    (tokenIn.USDPrice / tokenOut.USDPrice) -
                                    1) *
                                    100
                                ).toFixed(2) + "% below Market Price"
                            : //when inverted order tokenOut/tokenIn
                            (parseFloat(
                                invertPrice(limitStringPriceQuote, false)
                              ) /
                                (tokenIn.USDPrice / tokenOut.USDPrice) -
                                1) *
                                100 >
                              0
                            ? (
                                (parseFloat(
                                  invertPrice(limitStringPriceQuote, false)
                                ) /
                                  (tokenIn.USDPrice / tokenOut.USDPrice) -
                                  1) *
                                100
                              ).toFixed(2) + "% above Market Price"
                            : Math.abs(
                                (parseFloat(
                                  invertPrice(limitStringPriceQuote, false)
                                ) /
                                  (tokenIn.USDPrice / tokenOut.USDPrice) -
                                  1) *
                                  100
                              ).toFixed(2) + "% below Market Price"
                          : "0.00% above Market Price"}
                      </span>
                    </div>
                    <input
                      autoComplete="off"
                      className="bg-dark outline-none text-3xl my-3 w-60 md:w-auto"
                      placeholder="0"
                      value={
                        !isNaN(parseFloat(limitStringPriceQuote))
                          ? limitStringPriceQuote
                          : 0
                      }
                      type="text"
                      onChange={(e) => {
                        if (e.target.value !== "" && e.target.value !== "0") {
                          setLimitStringPriceQuote(inputFilter(e.target.value));
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <></>
            )}
            <div className="py-4">
              <div
                className="flex px-2 cursor-pointer py-2 rounded-[4px]"
                onClick={() => setExpanded(!expanded)}
              >
                {/* <div className="flex-none text-xs uppercase text-[#C9C9C9]">
                  1 {tokenIn.symbol} ={" "}
                  {!pairSelected
                    ? " ?"
                    : //range price
                      (tokenOrder
                        ? rangePrice.toPrecision(5)
                        : invertPrice(rangePrice.toPrecision(5), false)) +
                      " " +
                      tokenOut.symbol}
                </div> */}
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
            ) : !limitTabSelected ? (
              //swap tab
              <>
                {
                  //range buttons
                  tokenIn.userRouterAllowance?.lt(bnInput) ? (
                    <div>
                      <SwapRouterApproveButton
                        routerAddress={
                          chainProperties['arbitrumGoerli']['routerAddress']
                        }
                        approveToken={tokenIn.address}
                        tokenSymbol={tokenIn.symbol}
                        amount={bnInput}
                      />
                    </div>
                  ) : (
                    <SwapRouterButton
                      disabled={tradeParams.disabled || needsAllowanceIn}
                      routerAddress={
                        chainProperties['arbitrumGoerli']['routerAddress']
                      }
                      poolAddresses={swapPoolAddresses}
                      swapParams={swapParams ?? {}}
                      gasLimit={swapGasLimit}
                    />
                  )
                }
              </>
            ) : (
              //limit tab
              <>
                {tokenIn.userRouterAllowance?.lt(bnInput) ? (
                  <SwapRouterApproveButton
                    routerAddress={
                      chainProperties['arbitrumGoerli']['routerAddress']
                    }
                    approveToken={tokenIn.address}
                    tokenSymbol={tokenIn.symbol}
                    amount={bnInput}
                  />
                ) : ( tradePoolData.id != ZERO_ADDRESS ?
                  <LimitSwapButton
                    routerAddress={chainProperties['arbitrumGoerli']['routerAddress']}
                    disabled={mintGasLimit.eq(BN_ZERO)}
                    poolAddress={tradePoolData.id}
                    to={address}
                    amount={bnInput}
                    mintPercent={ethers.utils.parseUnits("1", 24)}
                    lower={lowerTick}
                    upper={upperTick}
                    closeModal={() => {}}
                    zeroForOne={tokenOrder}
                    gasLimit={mintGasLimit}
                  />
                :
                  <LimitCreateAndMintButton
                    disabled={mintGasLimit.eq(BN_ZERO)}
                    routerAddress={chainProperties['arbitrumGoerli']['routerAddress']}
                    poolType={'CONSTANT-PRODUCT'}
                    token0={tokenIn}
                    token1={tokenOut}
                    feeTier={500} //TODO: handle fee tier
                    to={address}
                    amount={bnInput}
                    mintPercent={ethers.utils.parseUnits("1", 24)}
                    lower={lowerTick}
                    upper={upperTick}
                    closeModal={() => {}}
                    zeroForOne={tokenOrder}
                    gasLimit={mintGasLimit}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mb-20">
        <div className="flex md:flex-row flex-col gap-y-3 item-end justify-between">
          <h1 className="mt-1.5">Limit Orders</h1>
          <div className="text-xs w-full md:w-auto flex">
            <button
              className={`px-5 py-2 w-full md:w-auto ${
                !activeOrdersSelected
                  ? "bg-black border-l border-t border-b border-grey"
                  : "bg-main1 border border-main"
              }`}
              onClick={() => setActiveOrdersSelected(true)}
            >
              ACTIVE ORDERS
            </button>
            <button
              className={`px-5 py-2 w-full md:w-auto ${
                !activeOrdersSelected
                  ? "bg-main1 border border-main"
                  : "bg-black border-r border-t border-b border-grey"
              }`}
              onClick={() => setActiveOrdersSelected(false)}
            >
              ORDER HISTORY
            </button>
          </div>
        </div>
        <div className="w-full h-[1px] bg-grey mt-3" />
        <table className="w-full table-auto">
          <thead className="pb-4 border-b-10 border-black h-12">
            <tr className="text-xs text-grey1/60 mb-3 leading-normal">
              <th className="text-left ">Sell</th>
              <th className="text-left ">Buy</th>
              <th className="text-left">Avg. Price</th>
              <th className="text-left md:grid-cell hidden">Status</th>
              <th className="text-right md:grid-cell hidden">Age</th>
            </tr>
          </thead>
          {activeOrdersSelected ? (
            <tbody className="">
              {allLimitPositions.map((allLimitPosition) => {
                if (allLimitPosition.positionId != undefined) {
                  return (
                    <tr className="text-right text-xs md:text-sm"
                        key={allLimitPosition.positionId}
                    >
                      <td className="">
                        <div className="flex items-center text-sm text-grey1 gap-x-2 text-left">
                          <img
                            className="w-[25px] h-[25px]"
                            src={logoMap[allLimitPosition.tokenIn.symbol]}
                          />
                          {ethers.utils.formatEther(allLimitPosition.amountIn) + " " + allLimitPosition.tokenIn.symbol}
                        </div>
                      </td>
                      <td className="">
                        <div className="flex items-center text-sm text-white gap-x-2 text-left">
                          <img
                            className="w-[25px] h-[25px]"
                            src={logoMap[allLimitPosition.tokenOut.symbol]}
                          />
                          {parseFloat(ethers.utils.formatEther(
                            getExpectedAmountOut(
                              parseInt(allLimitPosition.min), 
                              parseInt(allLimitPosition.max), 
                              allLimitPosition.tokenIn.id.localeCompare(allLimitPosition.tokenOut.id) < 0, 
                              BigNumber.from(allLimitPosition.liquidity))
                          )).toFixed(3) + " " + allLimitPosition.tokenOut.symbol}
                        </div>
                      </td>
                      <td className="text-left text-xs">
                        <div className="flex flex-col">
                          {/* FOR EXACT PRICE   */}
                          <span>
                            <span className="text-grey1">1 {allLimitPosition.tokenIn.symbol} = </span> 
                              {
                                getAveragePrice(
                                  parseInt(allLimitPosition.min), 
                                  parseInt(allLimitPosition.max), 
                                  allLimitPosition.tokenIn.id.localeCompare(allLimitPosition.tokenOut.id) < 0, 
                                  BigNumber.from(allLimitPosition.liquidity),
                                  BigNumber.from(allLimitPosition.amountIn))
                                .toFixed(3) + " " + allLimitPosition.tokenOut.symbol}
                          </span>          
                          {/* FOR PRICE RANGES
                        <span className="flex flex-col">
                          <div><span className="text-grey1">FROM  1 ETH =</span> 200 DAI</div>
                          <div><span className="text-grey1">TO 1 ETH =</span> 200 DAI</div>
                        </span>
                        */}
                        </div>
                      </td>
                      <td className="">
                        <div className="text-white bg-black border border-grey relative flex items-center justify-center h-7 rounded-[4px] text-center text-[10px]">
                          <span className="z-50">
                          {parseFloat(allLimitPosition.amountFilled) /
                            parseFloat(allLimitPosition.liquidity)}% Filled
                          </span>
                          <div className="h-full bg-grey/60 w-[0%] absolute left-0" />
                        </div>
                      </td>
                      <td className="text-sm text-grey1">{timeDifference(allLimitPosition.timestamp)}</td>
                      <td className="text-sm text-grey1 pl-5">
                        <LimitSwapBurnButton
                          poolAddress={allLimitPosition.poolId}
                          address={address}
                          positionId={BigNumber.from(allLimitPosition.positionId)}
                          epochLast={allLimitPosition.epochLast}
                          zeroForOne={allLimitPosition.tokenIn.id.localeCompare(allLimitPosition.tokenOut.id) < 0}
                          lower={BigNumber.from(allLimitPosition.min)}
                          upper={BigNumber.from(allLimitPosition.max)}
                          burnPercent={ethers.utils.parseUnits("1", 38)}
                        />
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          ) : (
            <tbody className="">
              {allLimitPositions.map((allLimitPosition) => {
                if (allLimitPosition.positionId != undefined) {
                  return (
                    <tr className="text-right text-xs md:text-sm"
                        key={allLimitPosition.positionId}
                    >
                      <td className="">
                        <div className="flex items-center text-sm text-grey1 gap-x-2 text-left">
                          <img
                            className="w-[25px] h-[25px]"
                            src={logoMap[allLimitPosition.tokenIn.symbol]}
                          />
                          {ethers.utils.formatEther(allLimitPosition.amountIn) + " " + allLimitPosition.tokenIn.symbol}
                        </div>
                      </td>
                      <td className="">
                        <div className="flex items-center text-sm text-white gap-x-2 text-left">
                          <img
                            className="w-[25px] h-[25px]"
                            src={logoMap[allLimitPosition.tokenOut.symbol]}
                          />
                          {parseFloat(ethers.utils.formatEther(
                            getExpectedAmountOut(
                              parseInt(allLimitPosition.min), 
                              parseInt(allLimitPosition.max), 
                              allLimitPosition.tokenIn.id.localeCompare(allLimitPosition.tokenOut.id) < 0, 
                              BigNumber.from(allLimitPosition.liquidity))
                          )).toFixed(3) + " " + allLimitPosition.tokenOut.symbol}
                        </div>
                      </td>
                      <td className="text-left text-xs">
                        <div className="flex flex-col">
                          {/* FOR EXACT PRICE   */}
                          <span>
                          <span className="text-grey1">1 {allLimitPosition.tokenIn.symbol} = </span> 
                            {
                              getAveragePrice(
                                parseInt(allLimitPosition.min), 
                                parseInt(allLimitPosition.max), 
                                allLimitPosition.tokenIn.id.localeCompare(allLimitPosition.tokenOut.id) < 0, 
                                BigNumber.from(allLimitPosition.liquidity),
                                BigNumber.from(allLimitPosition.amountIn))
                              .toFixed(3) + " " + allLimitPosition.tokenOut.symbol}
                          </span>          
                          {/* FOR PRICE RANGES
                        <span className="flex flex-col">
                          <div><span className="text-grey1">FROM  1 ETH =</span> 200 DAI</div>
                          <div><span className="text-grey1">TO 1 ETH =</span> 200 DAI</div>
                        </span>
                        */}
                        </div>
                      </td>
                      <td className="">
                        <div className="text-white bg-black border border-grey relative flex items-center justify-center h-7 rounded-[4px] text-center text-[10px]">
                          <span className="z-50">
                            {parseFloat(allLimitPosition.amountFilled) /
                            parseFloat(allLimitPosition.liquidity)}% Filled
                          </span>
                          <div className="h-full bg-grey/60 w-[0%] absolute left-0" />
                        </div>
                      </td>
                      <td className="text-sm text-grey1">{timeDifference(allLimitPosition.timestamp)}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          )}
        </table>
        {/*{activeOrdersSelected && (
          <div className="flex items-center justify-center w-full mt-9">
            <button className="bg-red-900/20 py-2 px-5 text-xs text-red-600 mx-auto">
              Cancell All Orders
            </button>
          </div>
        )}*/}
      </div>
    </div>
  );
}
