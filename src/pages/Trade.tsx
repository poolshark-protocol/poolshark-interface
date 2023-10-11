import { useState, useEffect, Fragment } from "react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import SelectToken from "../components/SelectToken";
import useInputBox from "../hooks/useInputBox";
import { Transition, Dialog } from "@headlessui/react";
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
import {
  chainIdsToNamesForGitTokenList,
  chainProperties,
} from "../utils/chains";
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
  fetchRangeTokenUSDPrice,
  getLimitTokenUsdPrice,
  logoMap,
} from "../utils/tokens";
import { getSwapPools, limitPoolTypeIds } from "../utils/pools";
import { poolsharkRouterABI } from "../abis/evm/poolsharkRouter";
import { QuoteParams, SwapParams } from "../utils/types";
import { useTradeStore } from "../hooks/useTradeStore";
import SwapRouterButton from "../components/Buttons/SwapRouterButton";
import JSBI from "jsbi";
import LimitCreateAndMintButton from "../components/Buttons/LimitCreateAndMintButton";
import { fetchLimitPositions } from "../utils/queries";
import { mapUserLimitPositions } from "../utils/maps";
import { displayPoolPrice, getAveragePrice, getExpectedAmountOut, getExpectedAmountOutFromInput, getMarketPriceAboveBelowString } from "../utils/math/priceMath";
import LimitSwapBurnButton from "../components/Buttons/LimitSwapBurnButton";
import timeDifference from "../utils/time";
import UserLimitPool from "../components/Limit/UserLimitPool";

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
    limitPriceString,
    setLimitPriceString,
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
    s.limitPriceString,
    s.setLimitPriceString,
    s.switchDirection,
    s.setMintButtonState,
    s.needsRefetch,
    s.setNeedsRefetch,
  ]);

  //set Limit Fee tier Modal
  const [isOpen, setIsOpen] = useState(false);

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

  ////////////////////////////////Pools
  //quoting variables
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);

  //swap call variables
  const [swapPoolAddresses, setSwapPoolAddresses] = useState<string[]>([]);
  const [swapParams, setSwapParams] = useState<any[]>([]);

  //display variable
  const [amountOut, setAmountOut] = useState(undefined);

  useEffect(() => {
    if (tokenIn.address != ZERO_ADDRESS && tokenOut.address === ZERO_ADDRESS) {
      getLimitTokenUsdPrice(tokenIn.address, setTokenInTradeUSDPrice);
    }
  }, [tokenIn.address]);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address !== ZERO_ADDRESS) {
      updatePools();
    }
  }, [tokenIn.address, tokenOut.address, bnInput]);

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
    address: chainProperties["arbitrumGoerli"]["routerAddress"], //contract address,
    abi: poolsharkRouterABI, // contract abi,
    functionName: "multiQuote",
    args: [availablePools, quoteParams, true],
    chainId: 421613,
    enabled: availablePools != undefined && quoteParams != undefined,
    onError(error) {
      console.log("Error multiquote", error);
    },
    onSuccess(data) {
      // console.log("Success multiquote", data);
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
  }, [poolQuotes, tradeSlippage]);

  function updateSwapParams(poolQuotes: any) {
    const poolAddresses: string[] = [];
    const paramsList: SwapParams[] = [];
    for (let i = 0; i < poolQuotes.length; i++) {
      if(poolQuotes[i].pool != ZERO_ADDRESS) {
        // push pool address for swap
        poolAddresses.push(poolQuotes[i].pool);

        // set base price from quote
        const basePrice: number = parseFloat(
          TickMath.getPriceStringAtSqrtPrice(poolQuotes[i].priceAfter)
        );
        
        // set price impact
        if(poolQuotes[i].pool.toLowerCase() == tradePoolData.id) {
          const currentPrice: number = parseFloat(
            TickMath.getPriceStringAtSqrtPrice(tradePoolData.poolPrice)
          )
          setPriceImpact((Math.abs(basePrice - currentPrice) * 100 / currentPrice).toFixed(2))
        }

        const priceDiff = basePrice * (parseFloat(tradeSlippage) / 100);
        const limitPrice = tokenIn.callId == 0 ? basePrice - priceDiff
                                               : basePrice + priceDiff;
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
        paramsList.push(params);
      }
    }
    setSwapPoolAddresses(poolAddresses);
    setSwapParams(paramsList);
  }

  console.log("swapParams", swapParams);

  //////////////////////Get Pools Data

  const [allLimitPositions, setAllLimitPositions] = useState([]);

  useEffect(() => {
    if (address) {
      getUserLimitPositionData();
      setNeedsRefetch(false);
    }
  }, []);

  useEffect(() => {
    if (address && needsRefetch === true) {
      getUserLimitPositionData();
      setNeedsRefetch(false);
    }
  }, [needsRefetch]);

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
        !isNaN(parseFloat(tokenInBal?.formatted.toString())) ?
          parseFloat(tokenInBal?.formatted.toString()).toFixed(2)
        : '0'
      );
    }
    if (tokenOutBal) {
      setTokenOutBalance(
        !isNaN(parseFloat(tokenOutBal?.formatted.toString())) ?
          parseFloat(tokenOutBal?.formatted.toString()).toFixed(2)
        : '0'
      );
    }
  }, [tokenInBal, tokenOutBal]);

  ////////////////////////////////Allowances

  const { data: allowanceInRouter } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties["arbitrumGoerli"]["routerAddress"]],
    chainId: 421613,
    watch: needsAllowanceIn,
    enabled: tokenIn.address != ZERO_ADDRESS,
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
  const [priceImpact, setPriceImpact] = useState("0.00")

  //i receive the price afte from the multiquote and then i will add and subtract the slippage from it

  ////////////////////////////////Limit Price Switch
  const [limitPriceOrder, setLimitPriceOrder] = useState(true);
  const [lowerPriceString, setLowerPriceString] = useState("0");
  const [upperPriceString, setUpperPriceString] = useState("0");

  const handlePriceSwitch = () => {
    setLimitPriceOrder(!limitPriceOrder);
    setLimitPriceString(invertPrice(limitPriceString, false));
    setLowerPriceString(invertPrice(upperPriceString, false));
    setUpperPriceString(invertPrice(lowerPriceString, false));
  };

  useEffect(() => {
    if (tokenIn.USDPrice != 0 && tokenOut.USDPrice != 0) {

      var newPrice = (limitPriceOrder == (tokenIn.callId == 0)
                                      ? (tokenIn.USDPrice / tokenOut.USDPrice)
                                      : (tokenOut.USDPrice / tokenIn.USDPrice))
        .toPrecision(6)
        .toString();
      setLimitPriceString(newPrice);
    }
  }, [tokenIn.USDPrice, tokenOut.USDPrice]);

  useEffect(() => {
    if (priceRangeSelected) {
      const tickSpacing = tradePoolData?.feeTier?.tickSpacing;
      if (!isNaN(parseFloat(lowerPriceString))) {
        if (limitPriceOrder) {}
        const priceLower = invertPrice(limitPriceOrder ? lowerPriceString 
                                                      : upperPriceString,
                                      limitPriceOrder)
        setLowerTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(priceLower, tickSpacing)
          )
        );
      }
      if (!isNaN(parseFloat(upperPriceString))) {
        const priceUpper = invertPrice(limitPriceOrder ? upperPriceString 
                                                      : lowerPriceString,
                                      limitPriceOrder)
        setUpperTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(priceUpper, tickSpacing)
          )
        );
      }
    }
  }, [lowerPriceString, upperPriceString, priceRangeSelected]);

  ////////////////////////////////Limit Ticks
  const [lowerTick, setLowerTick] = useState(BN_ZERO);
  const [upperTick, setUpperTick] = useState(BN_ZERO);

  useEffect(() => {
    if (
      limitTabSelected &&
      !priceRangeSelected &&
      tradeSlippage &&
      limitPriceString &&
      tradePoolData?.feeTier?.tickSpacing
    ) {
      updateLimitTicks();
    }
  }, [limitPriceString, tradeSlippage, priceRangeSelected]);

  function updateLimitTicks() {
    const tickSpacing = tradePoolData.feeTier.tickSpacing;
    const priceString = invertPrice(limitPriceString, limitPriceOrder)
    if (
      isFinite(parseFloat(limitPriceString)) &&
      parseFloat(priceString) > 0
    ) {
      if (
        parseFloat(tradeSlippage) * 100 > tickSpacing &&
        parseFloat(priceString) > 0
      ) {
        const limitPriceTolerance =
          (parseFloat(priceString) *
            parseFloat((parseFloat(tradeSlippage) * 100).toFixed(6))) /
          10000;
        if (tokenIn.callId == 0) {
          const endPrice =
            parseFloat(priceString) - -limitPriceTolerance;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(priceString, tickSpacing)
            )
          );
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(String(endPrice), tickSpacing)
            )
          );
        } else {
          const endPrice =
            parseFloat(priceString) - limitPriceTolerance;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(String(endPrice), tickSpacing)
            )
          );
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(priceString, tickSpacing)
            )
          );
        }
      } else {
        if (tokenIn.callId == 0) {
          const endTick =
            TickMath.getTickAtPriceString(priceString, tickSpacing) -
            -tickSpacing;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(priceString, tickSpacing)
            )
          );
          setUpperTick(BigNumber.from(String(endTick)));
        } else {
          const endTick =
            TickMath.getTickAtPriceString(priceString, tickSpacing) -
            tickSpacing;
          setLowerTick(BigNumber.from(String(endTick)));
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(priceString, tickSpacing)
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
    if (!bnInput.eq(BN_ZERO) && !needsAllowanceIn) {
      if (!limitTabSelected) {
        updateGasFee();
      } else {
        updateMintFee();
      }
    }
  }, [swapParams, tokenIn, tokenOut, bnInput, lowerTick, upperTick, needsAllowanceIn]);

  async function updateGasFee() {
    if (tokenIn.userRouterAllowance?.gte(bnInput))
      await gasEstimateSwap(
        chainProperties["arbitrumGoerli"]["routerAddress"],
        swapPoolAddresses,
        swapParams,
        tokenIn,
        tokenOut,
        signer,
        isConnected,
        setSwapGasFee,
        setSwapGasLimit
      );
    else {
      setSwapGasLimit(BN_ZERO)
    }
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
                  ? parseFloat(amountOut).toPrecision(6)
                  : !isNaN(parseFloat(
                    ethers.utils.formatUnits(bnInput, tokenIn.decimals))
                  ) && !isNaN(parseInt(ethers.utils.formatUnits(lowerTick, 0)))
                  && !isNaN(parseInt(ethers.utils.formatUnits(upperTick, 0)))  ? (
                      parseFloat(
                        ethers.utils.formatUnits(
                          getExpectedAmountOutFromInput(
                            Number(lowerTick),
                            Number(upperTick),
                            tokenIn.callId == 0,
                            bnInput
                          ), tokenIn.decimals
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
                Minimum received after slippage ({tradeSlippage}%)
              </div>
              <div className="ml-auto text-xs">{(parseFloat(amountOut) * (100 - parseFloat(tradeSlippage)) / 100).toPrecision(6)}</div>
            </div>
          ) : (
            <></>
          )}
          {!limitTabSelected ? (
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
          ) : (
            <></>
          )}
        </div>
      );
    }
  };

  ///////////////////////
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-160px)] w-[48rem] px-3 md:px-0">
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
                  {" "}
                  ~$
                  {bnInput.gt(0)
                    ? (
                        Number(
                          ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                        ) * tokenIn.USDPrice
                      ).toFixed(2)
                    : (1 * tokenIn.USDPrice).toFixed(2)}
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
                  !isNaN(
                    parseFloat(
                      ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                    )
                  ) &&
                  !isNaN(parseInt(ethers.utils.formatUnits(lowerTick, 0))) &&
                  !isNaN(parseInt(ethers.utils.formatUnits(upperTick, 0))) ? (
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
                            tokenIn.callId == 0,
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
                !isNaN(
                  parseFloat(
                    ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                  )
                ) &&
                !isNaN(parseInt(ethers.utils.formatUnits(lowerTick, 0))) &&
                !isNaN(parseInt(ethers.utils.formatUnits(upperTick, 0))) ? (
                  !limitTabSelected ? (
                    <div>{Number(amountOut).toPrecision(6)}</div>
                  ) : (
                    <div>
                      {parseFloat(
                        ethers.utils.formatUnits(
                          getExpectedAmountOutFromInput(
                            Number(lowerTick),
                            Number(upperTick),
                            tokenIn.callId == 0,
                            bnInput
                          ), tokenIn.decimals
                    )).toPrecision(6)}
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
                        {getMarketPriceAboveBelowString(limitPriceString, pairSelected, limitPriceOrder, tokenIn, tokenOut)}
                      </span>
                    </div>
                    <input
                      autoComplete="off"
                      className="bg-dark outline-none text-3xl my-3 w-60 md:w-auto"
                      placeholder="0"
                      value={
                        limitPriceString
                      }
                      type="text"
                      onChange={(e) => {
                        if (e.target.value !== "" && e.target.value !== "0") {
                          setLimitPriceString(inputFilter(e.target.value));
                        }
                        else {
                          setLimitPriceString("0");
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
                <div className="flex-none text-xs uppercase text-[#C9C9C9]">
                  {'1 ' + tokenIn.symbol} ={" "}
                  {displayPoolPrice(pairSelected, tradePoolData.poolPrice, tokenIn.callId == 0) +
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
            ) : !limitTabSelected ? (
              //swap tab
              <>
                {
                  //range buttons
                  tokenIn.userRouterAllowance?.lt(bnInput) ? (
                    <div>
                      <SwapRouterApproveButton
                        routerAddress={
                          chainProperties["arbitrumGoerli"]["routerAddress"]
                        }
                        approveToken={tokenIn.address}
                        tokenSymbol={tokenIn.symbol}
                        amount={bnInput}
                      />
                    </div>
                  ) : (
                    <SwapRouterButton
                      disabled={tradeParams.disabled || needsAllowanceIn || swapGasLimit.eq(BN_ZERO)}
                      routerAddress={
                        chainProperties["arbitrumGoerli"]["routerAddress"]
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
                      chainProperties["arbitrumGoerli"]["routerAddress"]
                    }
                    approveToken={tokenIn.address}
                    tokenSymbol={tokenIn.symbol}
                    amount={bnInput}
                  />
                ) : tradePoolData.id != ZERO_ADDRESS ? (
                  <LimitSwapButton
                    routerAddress={
                      chainProperties["arbitrumGoerli"]["routerAddress"]
                    }
                    disabled={mintGasLimit.eq(BN_ZERO)}
                    poolAddress={tradePoolData.id}
                    to={address}
                    amount={bnInput}
                    mintPercent={ethers.utils.parseUnits("1", 24)}
                    lower={lowerTick}
                    upper={upperTick}
                    closeModal={() => {}}
                    zeroForOne={tokenIn.callId == 0}
                    gasLimit={mintGasLimit}
                  />
                ) : (
                  <LimitCreateAndMintButton
                    disabled={mintGasLimit.eq(BN_ZERO)}
                    routerAddress={chainProperties['arbitrumGoerli']['routerAddress']}
                    poolTypeId={limitPoolTypeIds['constant-product']}
                    token0={tokenIn}
                    token1={tokenOut}
                    feeTier={3000} // default 0.3% fee
                    to={address}
                    amount={bnInput}
                    mintPercent={ethers.utils.parseUnits("1", 24)}
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
        </div>
      </div>
      <div className="md:mb-20 mb-32 w-full">
        <div className="flex md:flex-row flex-col gap-y-3 item-end justify-between w-full">
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
        <div className="overflow-hidden rounded-[4px] mt-3 bg-dark  border border-grey">
        <table className="w-full table-auto rounded-[4px]">
          <thead className={`h-10 ${allLimitPositions.length === 0 && "hidden"}`}>
            <tr className="text-[11px] text-grey1/90 mb-3 leading-normal">
              <th className="text-left pl-3 uppercase">Sell</th>
              <th className="text-left uppercase">Buy</th>
              <th className="text-left uppercase">Avg. Price</th>
              <th className="text-left md:table-cell hidden uppercase">Status</th>
              <th className="text-left md:table-cell hidden pl-2 uppercase">Age</th>
            </tr>
          </thead>
          {allLimitPositions.length === 0  ? (<td className="text-grey1 text-xs w-full  py-10 text-center col-span-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-10 py-4 mx-auto"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h9.454a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73zm3.068-5.852A1.25 1.25 0 015.273 4.5h9.454a1.25 1.25 0 011.205.918l1.523 5.52c.006.02.01.041.015.062H14a1 1 0 00-.86.49l-.606 1.02a1 1 0 01-.86.49H8.236a1 1 0 01-.894-.553l-.448-.894A1 1 0 006 11H2.53l.015-.062 1.523-5.52z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Your limit orders will appear here.
                </td>) : (
          activeOrdersSelected ? (
            <tbody className="divide-y divide-grey/70">
              {allLimitPositions.map((allLimitPosition) => {
                if (allLimitPosition.positionId != undefined) {
                  return (
                    <UserLimitPool
                      limitPosition={allLimitPosition}
                      address={address}
                      href={"/limit/view"}
                      key={allLimitPosition.positionId}
                    />
                  );
                }
              })}
            </tbody>
          ) : (
            <tbody className="divide-y divide-grey/70">
              {allLimitPositions.map((allLimitPosition) => {
                if (allLimitPosition.positionId != undefined) {
                  return (
                    <tr className="text-right text-xs md:text-sm bg-black hover:bg-dark cursor-pointer"
                        key={allLimitPosition.positionId}
                    >
                      <td className="py-3 pl-3">
                        <div className="flex items-center text-xs text-grey1 gap-x-2 text-left">
                          <img
                            className="w-[23px] h-[23px]"
                            src={logoMap[allLimitPosition.tokenIn.symbol]}
                          />
                          {parseFloat(ethers.utils.formatEther(allLimitPosition.amountIn)).toFixed(3) + " " + allLimitPosition.tokenIn.symbol}
                        </div>
                      </td>
                      <td className="">
                        <div className="flex items-center text-xs text-white gap-x-2 text-left">
                          <img
                            className="w-[23px] h-[23px]"
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
                        </div>
                      </td>
                      <td className="md:table-cell hidden">
                        <div className="text-white bg-black border border-grey relative flex items-center justify-center h-7 rounded-[4px] text-center text-[10px]">
                          <span className="z-50 px-3">
                            {(parseFloat(allLimitPosition.amountFilled) /
                            parseFloat(allLimitPosition.liquidity)).toFixed(2)}% Filled
                          </span>
                          <div className="h-full bg-grey/60 w-[0%] absolute left-0" />
                        </div>
                      </td>
                      <td className="text-grey1 text-left pl-3 text-xs md:table-cell hidden">{timeDifference(allLimitPosition.timestamp)}</td>
                      <td className="w-[39px] h-1 md:table-cell hidden"></td>
                    </tr>
                  );
                }
              })}
            </tbody>
          )
          )}
        </table>
        </div>
      </div>
      <Transition appear show={isSettingsOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsSettingsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>
  
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[4px] bg-black text-white border border-grey text-left align-middle shadow-xl px-5 py-5 transition-all">
                  <div className="flex items-center justify-between px-2 mb-5">
                    <h1 className="text-lg">Change Slippage</h1>
                    <XMarkIcon
                      onClick={() => setIsSettingsOpen(false)}
                      className="w-7 cursor-pointer"
                    />
                  </div>
                  <div className="flex md:flex-row flex-col items-center gap-3">
                    <div className="relative">
                  <input value={tradeSlippage} onChange={(e) => setTradeSlippage(inputFilter(e.target.value))} className="bg-dark md:w-auto w-full border-grey border h-10 outline-none px-2 text-sm" placeholder="0.1"/>
                  <span className="absolute mt-2 -ml-8">%</span>
                  </div>
                  <div className="flex flex-row items-center gap-x-3 w-full">
                  <div onClick={() => {setTradeSlippage("0.1"); setIsSettingsOpen(false)}} className="text-sm bg-dark border-grey/50 border h-10 flex items-center justify-center w-full cursor-pointer">
                    0.1%
                  </div>
                  <div onClick={() => {setTradeSlippage("0.5"); setIsSettingsOpen(false)}} className="text-sm bg-dark border-grey/50 border h-10 flex items-center justify-center w-full cursor-pointer">
                    0.5%
                  </div>
                  <div onClick={() => {setTradeSlippage("1"); setIsSettingsOpen(false)}} className="text-sm bg-dark border-grey/50 border h-10 flex items-center justify-center w-full cursor-pointer">
                    1%
                  </div>
                  </div>
                  </div>
                  <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-8 py-2 disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80">{!limitTabSelected ? "Confirm Slippage" : "Confirm Position Width"}</button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
