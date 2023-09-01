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
import { chainIdsToNamesForGitTokenList } from "../utils/chains";
import { coverPoolABI } from "../abis/evm/coverPool";
import {
  getCoverPoolFromFactory,
  getRangePoolFromFactory,
} from "../utils/queries";
import SwapRangeApproveButton from "../components/Buttons/SwapRangeApproveButton";
import SwapRangeButton from "../components/Buttons/SwapRangeButton";
import SwapCoverApproveButton from "../components/Buttons/SwapCoverApproveButton";
import SwapCoverButton from "../components/Buttons/SwapCoverButton";
import { rangePoolABI } from "../abis/evm/rangePool";
import {
  TickMath,
  invertPrice,
  maxPriceBn,
  minPriceBn,
} from "../utils/math/tickMath";
import { BN_ONE, BN_ZERO } from "../utils/math/constants";
import { gasEstimateSwap, gasEstimateMintLimit } from "../utils/gas";
import inputFilter from "../utils/inputFilter";
import LimitSwapButton from "../components/Buttons/LimitSwapButton";
import {
  fetchCoverTokenUSDPrice,
  fetchRangeTokenUSDPrice,
} from "../utils/tokens";
import { getSwapPools } from "../utils/pools";
import { poolsharkRouterABI } from "../abis/evm/poolsharkRouter";
import { QuoteParams, SwapParams } from "../utils/types";
import { useTradeStore } from "../hooks/useTradeStore";

export default function Trade() {
  const { address, isDisconnected, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const {
    network: { chainId },
  } = useProvider();
  const { bnInput, display, inputBox, maxBalance, setBnInput, setDisplay } =
    useInputBox();

  const [
    poolRouterAddress,
    tradePoolAddress,
    setTradePoolAddress,
    tradePoolData,
    setTradePoolData,
    pairSelected,
    setPairSelected,
    tradeSlippage,
    setTradeSlippage,
    tokenIn,
    setTokenIn,
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
    tradeMintParams,
    switchDirection,
    setMintButtonState,
  ] = useTradeStore((s) => [
    s.poolRouterAddresses,
    s.tradePoolAddress,
    s.setTradePoolAddress,
    s.tradePoolData,
    s.setTradePoolData,
    s.pairSelected,
    s.setPairSelected,
    s.tradeSlippage,
    s.setTradeSlippage,
    s.tokenIn,
    s.setTokenIn,
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
    s.tradeMintParams,
    s.switchDirection,
    s.setMintButtonState,
  ]);

  console.log(
    "poolRouterAddress",
    poolRouterAddress[chainIdsToNamesForGitTokenList[chainId]]
  );

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
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);
  const [swapParams, setSwapParams] = useState(undefined);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address && bnInput) {
      updatePools();
    }
  }, [tokenOut.address, tokenIn.address, bnInput]);

  async function updatePools() {
    const pools = await getSwapPools(tokenIn, tokenOut);
    const poolAdresses: string[] = [];
    const quoteList: QuoteParams[] = [];
    for (let i = 0; i < pools.length; i++) {
      const params: QuoteParams = {
        priceLimit: tokenOrder ? minPriceBn : maxPriceBn,
        amount: bnInput,
        exactIn: true,
        zeroForOne: tokenOrder,
      };
      quoteList[i] = params;
      poolAdresses[i] = pools[i].id;
    }
    setAvailablePools(poolAdresses);
    setQuoteParams(quoteList);
    console.log("multiquote availablePools", availablePools);
    console.log("multiquote quoteParams", quoteParams);
  }

  //TODO: loop through poolQuotes and set
  //       - state.swapSlippage
  //       - state.swapParams
  const { data: poolQuotes } = useContractRead({
    address: poolRouterAddress[chainIdsToNamesForGitTokenList[chainId]], //contract address,
    abi: poolsharkRouterABI, // contract abi,
    functionName: "multiQuote",
    args: [availablePools, quoteParams, true],
    chainId: 421613,
    enabled: availablePools && quoteParams,
    onError(error) {
      console.log("Error multiquote", error);
    },
    onSuccess(data) {
      //set ordered list to state
      console.log("Success multiquote", data);
    },
  });

  useEffect(() => {
    if (poolQuotes) {
      updateSwapParams();
    }
  }, [poolQuotes]);

  async function updateSwapParams() {
    let sortedPools: string[];
    for (let i = 0; i < availablePools.length; i++) {
      const params: SwapParams = {
        to: address,
        priceLimit: poolQuotes[i].priceAfter, // factor in slippage as well
        amount: bnInput,
        exactIn: true,
        zeroForOne: tokenOrder,
        callbackData: ethers.utils.formatBytes32String(""),
      };
      setSwapParams(swapParams ? [...swapParams, params] : [params]);
      //TODO: list is sorted so we can set the pool addresses array for the swap() call
      sortedPools[i] = poolQuotes[i].pool;
    }
    console.log("sortedPools", sortedPools);
    setTradePoolAddress(sortedPools[0]);
  }

  ////////////////////////////////TokenOrder
  const [tokenOrder, setTokenOrder] = useState(true);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setTokenOrder(tokenIn.callId == 0);
    }
  }, [tokenIn, tokenOut]);

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
          // if cover pool fetch cover price
          // fetchCoverTokenUSDPrice(
          //   tradePoolData,
          //   tokenInd,
          //   setTokenInCoverUSDPrice
          // );
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
          // if cover pool fetch cover price
          // fetchCoverTokenUSDPrice(
          //   tradePoolData,
          //   tokenOut,
          //   setTokenOutCoverUSDPrice
          // );
        }
      }
    }
  }, [tradePoolData, tokenIn, tokenOut]);

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
  //TODO: allowance is applied to the PoolRouter
  // there are no token approvals on the pool anymore
  const { data: allowanceInRouter } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      address,
      poolRouterAddress[
        chainIdsToNamesForGitTokenList[chainId]
      ] as `0x${string}`,
    ],
    chainId: 421613,
    watch: needsAllowanceIn,
    enabled: poolRouterAddress && needsAllowanceIn,
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

  ////////////////////////////////Quotes
  const [coverQuote, setCoverQuote] = useState(0);
  const [rangeQuote, setRangeQuote] = useState(0);
  const [coverPriceAfter, setCoverPriceAfter] = useState(undefined);
  const [rangePriceAfter, setRangePriceAfter] = useState(undefined);
  const [rangeBnPriceLimit, setRangeBnPriceLimit] = useState(BN_ZERO);
  const [coverBnPriceLimit, setCoverBnPriceLimit] = useState(BN_ZERO);

  const { data: quoteRange } = useContractRead({
    address: tradePoolAddress,
    abi: rangePoolABI,
    functionName: "quote",
    args: [[tokenOrder ? minPriceBn : maxPriceBn, bnInput, tokenOrder]],
    chainId: 421613,
    watch: true,
    onError(error) {
      console.log("Error range wagmi", error);
    },
    onSettled(data, error) {
      //console.log("Settled range wagmi", { data, error });
    },
  });

  useEffect(() => {
    if (quoteRange) {
      if (quoteRange[0].gt(BN_ZERO) && quoteRange[1].gt(BN_ZERO)) {
        setRangeQuote(
          parseFloat(ethers.utils.formatUnits(quoteRange[1], tokenIn.decimals))
        );
        const priceAfter = parseFloat(
          TickMath.getPriceStringAtSqrtPrice(quoteRange[2])
        );
        const priceSlippage = parseFloat(
          ((priceAfter * parseFloat(slippage) * 100) / 10000).toFixed(6)
        );
        const priceAfterSlippage = String(
          priceAfter - (tokenOrder ? priceSlippage : -priceSlippage)
        );
        setRangePriceAfter(priceAfter);
        const rangePriceLimit =
          TickMath.getSqrtPriceAtPriceString(priceAfterSlippage);
        setRangeBnPriceLimit(BigNumber.from(String(rangePriceLimit)));
      }
    }
  }, [quoteRange]);

  ////////////////////////////////FeeTiers and Slippage
  const [slippage, setSlippage] = useState("0.5");
  const [auxSlippage, setAuxSlippage] = useState("0.5");

  useEffect(() => {
    if (pairSelected) {
      updateTierFees();
      chooseSlippage();
    }
  }, [tokenIn, tokenOut]);

  async function updateTierFees() {
    await getFeeTiers();
  }

  const getFeeTiers = async () => {
    const poolCover = await getCoverPoolFromFactory(
      tokenIn.address,
      tokenOut.address
    );
    const poolRange = await getRangePoolFromFactory(
      tokenIn.address,
      tokenOut.address
    );
    const feeTier = poolRange["data"]["limitPools"][0]["feeTier"]["feeAmount"];
    setTradeSlippage((parseFloat(feeTier) / 10000).toString());
  };

  const chooseSlippage = () => {
    setSlippage(tradeSlippage);
    setAuxSlippage(tradeSlippage);
  };

  ////////////////////////////////Prices
  const [rangePrice, setRangePrice] = useState(0);
  const [rangeBnPrice, setRangeBnPrice] = useState(BigNumber.from(0));
  const [rangeBnBaseLimit, setRangeBnBaseLimit] = useState(BigNumber.from(0));

  const { data: priceRange } = useContractRead({
    address: tradePoolAddress,
    abi: rangePoolABI,
    functionName: "poolState",
    args: [],
    chainId: 421613,
    watch: true,
    onError(error) {
      console.log("Error price Range", error);
    },
    onSettled(data, error) {
      //console.log("Settled price Range", { data, error });
    },
  });

  //when contract prices change updates price states
  useEffect(() => {
    if (priceRange) {
      if (priceRange[5].gt(BN_ZERO)) {
        setRangePrice(
          parseFloat(TickMath.getPriceStringAtSqrtPrice(priceRange[5]))
        );
      }
    }
  }, [priceRange]);

  //when price states change updates price bn states
  useEffect(() => {
    if (rangePrice) {
      setRangeBnPrice(ethers.utils.parseEther(rangePrice.toString()));
    }
  }, [rangePrice]);

  //when price bn states change updates base limit states
  useEffect(() => {
    if (rangeBnPrice) {
      if (!rangeBnPrice.eq(BN_ZERO)) {
        const baseLimit = rangeBnPrice
          .mul(parseFloat((parseFloat(slippage) * 100).toFixed(6)))
          .div(10000);
        setRangeBnBaseLimit(baseLimit);
      }
    }
  }, [slippage, rangeBnPrice]);

  ////////////////////////////////Limit Price Switch
  const [limitPriceOrder, setLimitPriceOrder] = useState(true);
  const [limitStringPriceQuote, setLimitStringPriceQuote] = useState("0");

  useEffect(() => {
    setLimitStringPriceQuote(
      (tokenIn.USDPrice / tokenOut.USDPrice).toPrecision(6).toString()
    );
  }, [tokenOut.USDPrice, tokenIn.USDPrice]);

  useEffect(() => {
    var newPrice = (tokenIn.USDPrice / tokenOut.USDPrice)
      .toPrecision(6)
      .toString();
    setLimitStringPriceQuote(newPrice);
  }, [tokenOrder]);

  useEffect(() => {
    if (!limitPriceOrder) {
      setLimitStringPriceQuote(
        (tokenOut.USDPrice / tokenIn.USDPrice).toPrecision(6).toString()
      );
    } else {
      setLimitStringPriceQuote(
        (tokenIn.USDPrice / tokenOut.USDPrice).toPrecision(6).toString()
      );
    }
  }, [limitPriceOrder, tokenOrder]);

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
  }, [bnInput]);

  async function updateGasFee() {
    /* await gasEstimateSwap(
      rangePoolAddress,
      coverPoolAddress,
      rangeQuote,
      coverQuote,
      rangeBnPrice,
      rangeBnBaseLimit,
      tokenIn,
      tokenOut,
      bnInput,
      ethers.utils.parseUnits(tokenIn.userPoolAllowance, tokenIn.decimals),
      ethers.utils.parseUnits(tokenInCoverAllowance, tokenIn.decimals),
      address,
      signer,
      isConnected,
      setGasFee,
      setGasLimit
    ); */
  }

  async function updateMintFee() {
    /* await gasEstimateMintLimit(
      rangePoolAddress,
      address,
      lowerTick,
      upperTick,
      tokenIn,
      tokenOut,
      bnInput,
      signer,
      setMintGasFee,
      setMintGasLimit
    ); */
  }

  ////////////////////////////////Mint Button State

  useEffect(() => {
    setMintButtonState();
  }, [tradeMintParams.tokenInAmount, tradeMintParams.tokenOutAmount]);

  ////////////////////////////////
  const [expanded, setExpanded] = useState(false);

  /* function balancesHelper(coin: coinRaw) {
    const balance = useBalance({
      address: address,
      token: coin.id,
      chainId: 421613,
      watch: true,
    }).data?.formatted;
    return balance;
  } */

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div className="ml-auto text-xs">
              {pairSelected
                ? !limitTabSelected
                  ? rangeQuote >= coverQuote
                    ? rangeQuote === 0
                      ? "0"
                      : (
                          parseFloat(
                            ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                          ) * rangeQuote
                        ).toFixed(2)
                    : coverQuote === 0
                    ? "0"
                    : (
                        parseFloat(
                          ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                        ) * coverQuote
                      ).toFixed(2)
                  : parseFloat(
                      ethers.utils.formatUnits(rangeBnPrice, tokenIn.decimals)
                    ) == 0
                  ? "0"
                  : (
                      parseFloat(
                        ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                      ) * parseFloat(limitStringPriceQuote)
                    ).toPrecision(6)
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
                {pairSelected
                  ? !limitTabSelected
                    ? rangeQuote >= coverQuote
                      ? rangeQuote === 0
                        ? "0"
                        : (
                            parseFloat(
                              ethers.utils.formatUnits(
                                bnInput,
                                tokenIn.decimals
                              )
                            ) *
                              rangeQuote -
                            parseFloat(
                              ethers.utils.formatUnits(
                                bnInput,
                                tokenIn.decimals
                              )
                            ) *
                              rangeQuote *
                              (parseFloat(slippage) * 0.01)
                          ).toFixed(2)
                      : coverQuote === 0
                      ? "0"
                      : (
                          parseFloat(
                            ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                          ) *
                            coverQuote -
                          parseFloat(
                            ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                          ) *
                            coverQuote *
                            (parseFloat(slippage) * 0.01)
                        ).toFixed(2)
                    : parseFloat(
                        ethers.utils.formatUnits(rangeBnPrice, tokenIn.decimals)
                      ) == 0
                    ? "0"
                    : (
                        parseFloat(
                          ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                        ) *
                          parseFloat(
                            ethers.utils.formatUnits(
                              rangeBnPrice,
                              tokenIn.decimals
                            )
                          ) -
                        parseFloat(
                          ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                        ) *
                          parseFloat(
                            ethers.utils.formatUnits(
                              rangeBnPrice,
                              tokenIn.decimals
                            )
                          ) *
                          (parseFloat(slippage) * 0.01)
                      ).toFixed(2)
                  : "Select Token"}
              </div>
            </div>
          ) : (
            <></>
          )}
          {!limitTabSelected ? (
            <div className="flex p-1">
              <div className="text-xs text-[#4C4C4C]">Price Impact</div>
              <div className="ml-auto text-xs">
                {pairSelected
                  ? rangePriceAfter || coverPriceAfter
                    ? (
                        Math.abs((rangePrice - rangePriceAfter) * 100) /
                        rangePrice
                      ).toFixed(2) + "%"
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
                  {(
                    Number(
                      ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                    ) * tokenIn.USDPrice
                  ).toFixed(2)}
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
                  {pairSelected ||
                  parseFloat(ethers.utils.formatUnits(bnInput, 18)) !== 0 ? (
                    tokenOut.USDPrice ? (
                      !limitTabSelected ? (
                        //swap page
                        (rangeQuote * tokenOut.USDPrice).toFixed(2)
                      ) : //limit page
                      limitPriceOrder ? (
                        (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          parseFloat(limitStringPriceQuote) *
                          tokenOut.USDPrice
                        ).toFixed(2)
                      ) : (
                        (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          parseFloat(
                            invertPrice(limitStringPriceQuote, false)
                          ) *
                          tokenOut.USDPrice
                        ).toFixed(2)
                      )
                    ) : (
                      (0).toFixed(2)
                    )
                  ) : (
                    <>{(0).toFixed(2)}</>
                  )}
                </span>
                <span>
                  {pairSelected ? "Balance: " + tokenOut.userBalance : <></>}
                </span>
              </div>
              <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                {pairSelected && !bnInput.eq(BN_ZERO) ? (
                  !limitTabSelected ? (
                    <div>
                      {rangeQuote >= coverQuote
                        ? rangeQuote.toPrecision(6)
                        : coverQuote.toPrecision(6)}
                    </div>
                  ) : (
                    <div>
                      {!limitPriceOrder
                        ? (
                            parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                            parseFloat(
                              invertPrice(limitStringPriceQuote, false)
                            )
                          ).toPrecision(6)
                        : (
                            parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                            parseFloat(limitStringPriceQuote)
                          ).toPrecision(6)}
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
                        <input className="outline-none bg-transparent text-3xl w-1/2 md:w-56 text-center mb-2" />
                      </div>
                      <div className="border border-grey w-full bg-dark flex flex-col items-center justify-center py-4">
                        <span className="text-center text-xs text-grey1 mb-2">
                          MAX. PRICE
                        </span>
                        <input className="outline-none bg-transparent text-3xl w-1/2 md:w-56 text-center mb-2" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-dark py-3 px-5 border border-grey rounded-[4px] mt-4">
                    <div className="flex items-end justify-between text-[11px] text-grey1">
                      <span>
                        {pairSelected && rangePrice > 0
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
                        setLimitStringPriceQuote(inputFilter(e.target.value));
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
                  1 {tokenIn.symbol} ={" "}
                  {!pairSelected
                    ? " ?"
                    : //range price
                      (tokenOrder
                        ? rangePrice.toPrecision(5)
                        : invertPrice(rangePrice.toPrecision(5), false)) +
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
            ) : !limitTabSelected ? ( //swap tab
              <>
                {
                  //range buttons
                  Number(tokenIn.userPoolAllowance) <
                  Number(ethers.utils.formatUnits(bnInput, 18)) ? (
                    <div>
                      <SwapRangeApproveButton
                        poolAddress={tradePoolAddress}
                        approveToken={tokenIn.address}
                        tokenSymbol={tokenIn.symbol}
                        amount={bnInput}
                      />
                    </div>
                  ) : (
                    <SwapRangeButton
                      disabled={false}
                      poolAddress={tradePoolAddress}
                      zeroForOne={
                        tokenOut.address &&
                        tokenIn.address.localeCompare(tokenOut.address) < 0
                      }
                      amount={bnInput}
                      priceLimit={rangeBnPriceLimit}
                      gasLimit={swapGasLimit}
                    />
                  )
                }
              </>
            ) : (
              //limit tab
              <>
                {Number(tokenIn.userPoolAllowance) <
                Number(ethers.utils.formatUnits(bnInput, 18)) ? (
                  <SwapRangeApproveButton
                    poolAddress={tradePoolAddress}
                    approveToken={tokenIn.address}
                    tokenSymbol={tokenIn.symbol}
                    amount={bnInput}
                  />
                ) : (
                  <LimitSwapButton
                    disabled={mintGasLimit.eq(BN_ZERO)}
                    poolAddress={tradePoolAddress}
                    to={address}
                    amount={bnInput}
                    mintPercent={ethers.utils.parseUnits("1", 26)}
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
              <th className="text-left">Price</th>
              <th className="text-left md:grid-cell hidden">Status</th>
              <th className="text-right md:grid-cell hidden">Age</th>
            </tr>
          </thead>
          {activeOrdersSelected ? (
            <tbody className="">
              <tr className="text-right text-xs md:text-sm">
                <td className="">
                  <div className="flex items-center text-sm text-grey1 gap-x-2 text-left">
                    <img
                      className="w-[25px] h-[25px]"
                      src="/static/images/dai_icon.png"
                    />
                    200 DAI
                  </div>
                </td>
                <td className="">
                  <div className="flex items-center text-sm text-white gap-x-2 text-left">
                    <img
                      className="w-[25px] h-[25px]"
                      src="/static/images/dai_icon.png"
                    />
                    200 DAI
                  </div>
                </td>
                <td className="text-left text-xs">
                  <div className="flex flex-col">
                    {/* FOR EXACT PRICE   */}
                    <span>
                      <span className="text-grey1">1 ETH =</span> 200 DAI
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
                    <span className="z-50">Not Filled</span>
                    <div className="h-full bg-grey/60 w-[0%] absolute left-0" />
                  </div>
                </td>
                <td className="text-sm text-grey1">5d</td>
                <td className="text-sm text-grey1 pl-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-7 text-red-600 bg-red-900/30 p-1 rounded-full cursor-pointer -mr-5"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="">
              <tr className="text-right text-xs md:text-sm">
                <td className="">
                  <div className="flex items-center text-sm text-grey1 gap-x-2">
                    <img
                      className="w-[25px] h-[25px]"
                      src="/static/images/dai_icon.png"
                    />
                    200 DAI
                  </div>
                </td>
                <td className="">
                  <div className="flex items-center text-sm text-white gap-x-2">
                    <img
                      className="w-[25px] h-[25px]"
                      src="/static/images/dai_icon.png"
                    />
                    200 DAI
                  </div>
                </td>
                <td className="text-left text-xs">
                  <div className="flex flex-col">
                    {/* FOR EXACT PRICE   */}
                    <span>
                      <span className="text-grey1">1 ETH =</span> 200 DAI
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
                    <span className="z-50">Not Filled</span>
                    <div className="h-full bg-grey/60 w-[0%] absolute left-0" />
                  </div>
                </td>
                <td className="text-sm text-grey1">5d</td>
              </tr>
            </tbody>
          )}
        </table>
        {activeOrdersSelected && (
          <div className="flex items-center justify-center w-full mt-9">
            <button className="bg-red-900/20 py-2 px-5 text-xs text-red-600 mx-auto">
              Cancell All Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
