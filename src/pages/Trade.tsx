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
  useContractRead,
  useBalance,
} from "wagmi";
import { BigNumber, ethers } from "ethers";
import {
  chainIdsToNamesForGitTokenList,
  chainProperties,
  supportedNetworkNames,
} from "../utils/chains";
import SwapRouterApproveButton from "../components/Buttons/SwapRouterApproveButton";
import {
  TickMath,
  invertPrice,
  maxPriceBn,
  minPriceBn,
} from "../utils/math/tickMath";
import { BN_ZERO, ZERO_ADDRESS } from "../utils/math/constants";
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
import { getClaimTick, mapUserLimitPositions } from "../utils/maps";
import {
  displayPoolPrice,
  getAveragePrice,
  getExpectedAmountInFromOutput,
  getExpectedAmountOut,
  getExpectedAmountOutFromInput,
  getMarketPriceAboveBelowString,
} from "../utils/math/priceMath";
import timeDifference from "../utils/time";
import { inputHandler, parseUnits } from "../utils/math/valueMath";
import UserLimitPool from "../components/Limit/UserLimitPool";
import { useConfigStore } from "../hooks/useConfigStore";

export default function Trade() {
  const { address, isDisconnected, isConnected } = useAccount();
  const { data: signer } = useSigner();
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

  const [chainId, networkName, limitSubgraph, setLimitSubgraph] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
      state.setLimitSubgraph,
    ]);

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

  //market display variables
  const [exactIn, setExactIn] = useState(true);

  const resetAfterSwap = () => {
    setDisplayIn("");
    setDisplayOut("");
    setAmountIn(BN_ZERO);
    setAmountOut(BN_ZERO);
  };

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
        if (!limitTabSelected) updatePools(bnValue, true);
        else {
          const tokenOutAmount = getExpectedAmountOutFromInput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            bnValue
          );
          const tokenOutAmountDisplay = parseFloat(
            ethers.utils.formatUnits(
              tokenOutAmount.toString(),
              tokenOut.decimals
            )
          ).toPrecision(6);
          setDisplayOut(tokenOutAmountDisplay);
          setAmountOut(tokenOutAmount);
        }
      } else {
        setDisplayOut("");
        setAmountOut(BN_ZERO);
      }
    } else {
      if (bnValue.gt(BN_ZERO)) {
        if (!limitTabSelected) updatePools(bnValue, false);
        else {
          const tokenInAmount = getExpectedAmountInFromOutput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            bnValue
          );
          const tokenInAmountDisplay = parseFloat(
            ethers.utils.formatUnits(tokenInAmount.toString(), tokenIn.decimals)
          ).toPrecision(6);
          setDisplayIn(tokenInAmountDisplay);
          setAmountIn(tokenInAmount);
        }
      } else {
        setDisplayIn("");
        setAmountIn(BN_ZERO);
      }
    }
  };

  //log addresses and ids
  const [limitPoolAddressList, setLimitPoolAddressList] = useState([]);
  const [limitPositionSnapshotList, setLimitPositionSnapshotList] = useState<
    any[]
  >([]);

  //log amount in and out
  const [limitFilledAmountList, setLimitFilledAmountList] = useState([]);
  const [currentAmountOutList, setCurrentAmountOutList] = useState([]);

  useEffect(() => {
    if (tokenIn.address != ZERO_ADDRESS && tokenOut.address === ZERO_ADDRESS) {
      getLimitTokenUsdPrice(
        tokenIn.address,
        setTokenInTradeUSDPrice,
        limitSubgraph
      );
    }
  }, [tokenIn.address]);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address !== ZERO_ADDRESS) {
      // adjust decimals when switching directions
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
      setNeedsAllowanceIn(true);
    }
  }, [tokenIn.address, tokenOut.address]);

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

  const { data: poolQuotes } = useContractRead({
    address: chainProperties[networkName]["routerAddress"], //contract address,
    abi: poolsharkRouterABI, // contract abi,
    functionName: "multiQuote",
    args: [availablePools, quoteParams, true],
    chainId: chainId,
    enabled: availablePools != undefined && quoteParams != undefined,
    onError(error) {
      console.log("Error multiquote", error);
    },
    onSuccess(data) {
      // if (quoteParams[0])
      // console.log("Success multiquote", quoteParams[0]?.exactIn, formatUnits(quoteParams[0]?.amount.toString(), exactIn ? tokenIn.decimals : tokenOut.decimals));
      // console.log("multiquote results:", data)
    },
  });

  useEffect(() => {
    if (!limitTabSelected) {
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
    }
  }, [poolQuotes, quoteParams, tradeSlippage, limitTabSelected]);

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
        if (poolQuotes[i].pool.toLowerCase() == tradePoolData.id) {
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

  ////////////////////////////////Filled Amount
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

  useEffect(() => {
    if (filledAmountList) {
      setLimitFilledAmountList(filledAmountList[0]);

      setCurrentAmountOutList(filledAmountList[1]);
    }
  }, [filledAmountList]);

  //////////////////////Get Pools Data

  const [allLimitPositions, setAllLimitPositions] = useState([]);

  useEffect(() => {
    if (address) {
      const chainConstants = chainProperties[networkName]
        ? chainProperties[networkName]
        : chainProperties["arbitrumGoerli"];
      setLimitSubgraph(chainConstants["limitSubgraphUrl"]);
      getUserLimitPositionData();
      setNeedsRefetch(false);
    }
  }, [needsRefetch, needsPosRefetch, address, networkName]);

  useEffect(() => {
    if (allLimitPositions.length > 0) {
      mapUserLimitSnapshotList();
    }
  }, [allLimitPositions]);

  async function getUserLimitPositionData() {
    try {
      const data = await fetchLimitPositions(
        limitSubgraph,
        address?.toLowerCase()
      );
      if (data["data"]) {
        setAllLimitPositions(
          mapUserLimitPositions(data["data"].limitPositions)
        );
      }
    } catch (error) {
      console.log("limit error", error);
    }
  }

  async function mapUserLimitSnapshotList() {
    try {
      let mappedLimitPoolAddresses = [];
      let mappedLimitSnapshotParams = [];
      if (allLimitPositions.length > 0) {
        for (let i = 0; i < allLimitPositions.length; i++) {
          mappedLimitPoolAddresses[i] = allLimitPositions[i].poolId;
          mappedLimitSnapshotParams[i] = [];
          mappedLimitSnapshotParams[i][0] = address;
          mappedLimitSnapshotParams[i][1] = parseUnits("1", 38);
          mappedLimitSnapshotParams[i][2] = BigNumber.from(
            allLimitPositions[i].positionId
          );
          mappedLimitSnapshotParams[i][3] = BigNumber.from(
            await getClaimTick(
              allLimitPositions[i].poolId.toString(),
              Number(allLimitPositions[i].min),
              Number(allLimitPositions[i].max),
              allLimitPositions[i].tokenIn.id.localeCompare(
                allLimitPositions[i].tokenOut.id
              ) < 0,
              Number(allLimitPositions[i].epochLast),
              false,
              limitSubgraph
            )
          );
          mappedLimitSnapshotParams[i][4] =
            allLimitPositions[i].tokenIn.id.localeCompare(
              allLimitPositions[i].tokenOut.id
            ) < 0;
        }
        setLimitPoolAddressList(mappedLimitPoolAddresses);
        setLimitPositionSnapshotList(mappedLimitSnapshotParams);
      }
    } catch (error) {
      console.log("limit error", error);
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
        !isNaN(parseFloat(tokenInBal?.formatted.toString()))
          ? parseFloat(tokenInBal?.formatted.toString()).toFixed(2)
          : "0"
      );
    }
    if (tokenOutBal) {
      setTokenOutBalance(
        !isNaN(parseFloat(tokenOutBal?.formatted.toString()))
          ? parseFloat(tokenOutBal?.formatted.toString()).toFixed(2)
          : "0"
      );
    }
  }, [tokenInBal, tokenOutBal]);

  ////////////////////////////////Allowances

  const { data: allowanceInRouter } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties[networkName]["routerAddress"]],
    chainId: chainId,
    watch: needsAllowanceIn,
    enabled: tokenIn.address != ZERO_ADDRESS,
    onError(error) {
      console.log("Error allowance", error);
    },
    onSuccess(data) {
      setNeedsAllowanceIn(false);
      // console.log("Success allowance", tokenIn.symbol, tokenIn.address, data.toString());
    },
  });

  useEffect(() => {
    if (allowanceInRouter) {
      setTokenInTradeAllowance(allowanceInRouter);
    }
  }, [allowanceInRouter]);

  ////////////////////////////////FeeTiers and Slippage
  const [priceImpact, setPriceImpact] = useState("0.00");

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
      var newPrice = (
        limitPriceOrder == (tokenIn.callId == 0)
          ? tokenIn.USDPrice / tokenOut.USDPrice
          : tokenOut.USDPrice / tokenIn.USDPrice
      )
        .toPrecision(6)
        .toString();
      setLimitPriceString(newPrice);
    }
  }, [tokenIn.USDPrice, tokenOut.USDPrice]);

  useEffect(() => {
    if (priceRangeSelected) {
      const tickSpacing = tradePoolData?.feeTier?.tickSpacing;
      if (!isNaN(parseFloat(lowerPriceString))) {
        if (limitPriceOrder) {
        }
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
    limitTabSelected,
  ]);

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
  }, [limitPriceString, tradeSlippage, priceRangeSelected, limitTabSelected]);

  useEffect(() => {
    if (limitTabSelected && tradeSlippage) {
      if (exactIn) {
        if (!isNaN(parseFloat(limitPriceString))) {
          const tokenOutAmount = getExpectedAmountOutFromInput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            amountIn
          );
          const tokenOutAmountDisplay = parseFloat(
            ethers.utils.formatUnits(
              tokenOutAmount.toString(),
              tokenOut.decimals
            )
          ).toPrecision(6);
          setDisplayOut(tokenOutAmountDisplay);
          setAmountOut(tokenOutAmount);
        } else {
          setDisplayOut("");
          setAmountOut(BN_ZERO);
        }
      } else {
        if (!isNaN(parseFloat(limitPriceString))) {
          const tokenInAmount = getExpectedAmountInFromOutput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            amountOut
          );
          const tokenInAmountDisplay = parseFloat(
            ethers.utils.formatUnits(tokenInAmount.toString(), tokenIn.decimals)
          ).toPrecision(6);
          setDisplayIn(tokenInAmountDisplay);
          setAmountIn(tokenInAmount);
        } else {
          setDisplayIn("");
          setAmountIn(BN_ZERO);
        }
      }
    }
  }, [lowerTick, upperTick, tokenIn.address, tokenOut.address]);

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
  ////////////////////////////////Fee Estimations
  const [swapGasFee, setSwapGasFee] = useState("$0.00");
  const [swapGasLimit, setSwapGasLimit] = useState(BN_ZERO);
  const [mintFee, setMintFee] = useState("$0.00");
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (!amountIn.eq(BN_ZERO) && !needsAllowanceIn) {
      if (!limitTabSelected) {
        updateGasFee();
      } else {
        updateMintFee();
      }
    }
  }, [swapParams, tokenIn, tokenOut, lowerTick, upperTick, needsAllowanceIn]);

  async function updateGasFee() {
    if (tokenIn.userRouterAllowance?.gte(amountIn)) {
      await gasEstimateSwap(
        chainProperties[networkName]["routerAddress"],
        swapPoolAddresses,
        swapParams,
        tokenIn,
        tokenOut,
        signer,
        isConnected,
        setSwapGasFee,
        setSwapGasLimit
      );
    } else {
      setSwapGasLimit(BN_ZERO);
    }
  }

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

  ////////////////////////////////Mint Button State

  useEffect(() => {
    if (amountIn) {
      setTokenInAmount(amountIn);
    }
  }, [amountIn]);

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
              <div
                className="cursor-pointer"
                onClick={() => setIsSettingsOpen(true)}
              >
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
                  {!isNaN(parseInt(amountIn.toString())) &&
                  !isNaN(tokenIn.decimals) &&
                  !isNaN(tokenOut.USDPrice)
                    ? (
                        parseFloat(
                          ethers.utils.formatUnits(
                            amountIn ?? BN_ZERO,
                            tokenIn.decimals
                          )
                        ) * tokenIn.USDPrice
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
                      ) * tokenOut.USDPrice
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
                {
                  <div>
                    {inputBoxOut("0", tokenOut, "tokenOut", handleInputBox)}
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
            ) : !limitTabSelected ? (
              //swap tab
              <>
                {
                  //range buttons
                  tokenIn.userRouterAllowance?.lt(amountIn) ? (
                    <div>
                      <SwapRouterApproveButton
                        routerAddress={
                          chainProperties[networkName]["routerAddress"]
                        }
                        approveToken={tokenIn.address}
                        tokenSymbol={tokenIn.symbol}
                        amount={amountIn}
                      />
                    </div>
                  ) : (
                    <SwapRouterButton
                      disabled={
                        tradeParams.disabled ||
                        needsAllowanceIn ||
                        swapGasLimit.eq(BN_ZERO)
                      }
                      routerAddress={
                        chainProperties[networkName]["routerAddress"]
                      }
                      poolAddresses={swapPoolAddresses}
                      swapParams={swapParams ?? {}}
                      gasLimit={swapGasLimit}
                      resetAfterSwap={resetAfterSwap}
                    />
                  )
                }
              </>
            ) : (
              //limit tab
              <>
                {tokenIn.userRouterAllowance?.lt(amountIn) ? (
                  <SwapRouterApproveButton
                    routerAddress={
                      chainProperties[networkName]["routerAddress"]
                    }
                    approveToken={tokenIn.address}
                    tokenSymbol={tokenIn.symbol}
                    amount={amountIn}
                  />
                ) : tradePoolData?.id != ZERO_ADDRESS ? (
                  <LimitSwapButton
                    routerAddress={
                      chainProperties[networkName]["routerAddress"]
                    }
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
                    routerAddress={
                      chainProperties["arbitrumGoerli"]["routerAddress"]
                    }
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
            {/*<button
              className={`px-5 py-2 w-full md:w-auto ${
                !activeOrdersSelected
                  ? "bg-main1 border border-main"
                  : "bg-black border-r border-t border-b border-grey"
              }`}
              onClick={() => setActiveOrdersSelected(false)}
            >
              ORDER HISTORY
            </button>*/}
          </div>
        </div>
        <div className="overflow-hidden rounded-[4px] mt-3 bg-dark  border border-grey">
          <table className="w-full table-auto rounded-[4px]">
            <thead
              className={`h-10 ${allLimitPositions.length === 0 && "hidden"}`}
            >
              <tr className="text-[11px] text-grey1/90 mb-3 leading-normal">
                <th className="text-left pl-3 uppercase">Sell</th>
                <th className="text-left uppercase">Buy</th>
                <th className="text-left uppercase">Avg. Price</th>
                <th className="text-left md:table-cell hidden uppercase">
                  Status
                </th>
                <th className="text-left md:table-cell hidden pl-2 uppercase">
                  Age
                </th>
              </tr>
            </thead>
            {allLimitPositions.length === 0 ? (
              <tbody>
                <tr>
                  <td className="text-grey1 text-xs w-full  py-10 text-center col-span-5">
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
                  </td>
                </tr>
              </tbody>
            ) : activeOrdersSelected ? (
              <tbody className="divide-y divide-grey/70">
                {allLimitPositions.map((allLimitPosition, index) => {
                  if (allLimitPosition.id != undefined) {
                    return (
                      <UserLimitPool
                        limitPosition={allLimitPosition}
                        limitFilledAmount={
                          limitFilledAmountList.length > 0
                            ? parseFloat(
                                ethers.utils.formatUnits(
                                  limitFilledAmountList[index] ?? "0",
                                  allLimitPosition.tokenOut.decimals
                                )
                              )
                            : parseFloat("0.00")
                        }
                        address={address}
                        href={"/limit/view"}
                        key={allLimitPosition.id}
                      />
                    );
                  }
                })}
              </tbody>
            ) : (
              <tbody className="divide-y divide-grey/70">
                {allLimitPositions.map((allLimitPosition, index) => {
                  if (allLimitPosition.positionId != undefined) {
                    return (
                      <tr
                        className="text-right text-xs md:text-sm bg-black hover:bg-dark cursor-pointer"
                        key={allLimitPosition.id}
                      >
                        <td className="py-3 pl-3">
                          <div className="flex items-center text-xs text-grey1 gap-x-2 text-left">
                            <img
                              className="w-[23px] h-[23px]"
                              src={logoMap[allLimitPosition.tokenIn.symbol]}
                            />
                            {parseFloat(
                              ethers.utils.formatEther(
                                allLimitPosition.amountIn
                              )
                            ).toFixed(3) +
                              " " +
                              allLimitPosition.tokenIn.symbol}
                          </div>
                        </td>
                        <td className="">
                          <div className="flex items-center text-xs text-white gap-x-2 text-left">
                            <img
                              className="w-[23px] h-[23px]"
                              src={logoMap[allLimitPosition.tokenOut.symbol]}
                            />
                            {parseFloat(
                              ethers.utils.formatEther(
                                getExpectedAmountOut(
                                  parseInt(allLimitPosition.min),
                                  parseInt(allLimitPosition.max),
                                  allLimitPosition.tokenIn.id.localeCompare(
                                    allLimitPosition.tokenOut.id
                                  ) < 0,
                                  BigNumber.from(allLimitPosition.liquidity)
                                )
                              )
                            ).toFixed(3) +
                              " " +
                              allLimitPosition.tokenOut.symbol}
                          </div>
                        </td>
                        <td className="text-left text-xs">
                          <div className="flex flex-col">
                            <span>
                              <span className="text-grey1">
                                1 {allLimitPosition.tokenIn.symbol} ={" "}
                              </span>
                              {getAveragePrice(
                                allLimitPosition.tokenOut,
                                allLimitPosition.tokenIn,
                                parseInt(allLimitPosition.min),
                                parseInt(allLimitPosition.max),
                                allLimitPosition.tokenIn.id.localeCompare(
                                  allLimitPosition.tokenOut.id
                                ) < 0,
                                BigNumber.from(allLimitPosition.liquidity),
                                BigNumber.from(allLimitPosition.amountIn)
                              ).toFixed(3) +
                                " " +
                                allLimitPosition.tokenOut.symbol}
                            </span>
                          </div>
                        </td>
                        <td className="md:table-cell hidden">
                          <div className="text-white bg-black border border-grey relative flex items-center justify-center h-7 rounded-[4px] text-center text-[10px]">
                            <span className="z-50 px-3">
                              {(
                                parseFloat(
                                  ethers.utils.formatEther(
                                    limitFilledAmountList[index]
                                  )
                                ) /
                                parseFloat(
                                  ethers.utils.formatUnits(
                                    getExpectedAmountOutFromInput(
                                      parseInt(allLimitPosition.min),
                                      parseInt(allLimitPosition.max),
                                      allLimitPosition.tokenIn.id.localeCompare(
                                        allLimitPosition.tokenOut.id
                                      ) < 0,
                                      BigNumber.from(allLimitPosition.amountIn)
                                    ),
                                    allLimitPosition.tokenOut.decimals
                                  )
                                )
                              ).toFixed(2)}
                              % Filled
                            </span>
                            <div className="h-full bg-grey/60 w-[0%] absolute left-0" />
                          </div>
                        </td>
                        <td className="text-grey1 text-left pl-3 text-xs md:table-cell hidden">
                          {timeDifference(allLimitPosition.timestamp)}
                        </td>
                        <td className="w-[39px] h-1 md:table-cell hidden"></td>
                      </tr>
                    );
                  }
                })}
              </tbody>
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
                      <input
                        value={tradeSlippage}
                        onChange={(e) =>
                          setTradeSlippage(inputFilter(e.target.value))
                        }
                        className="bg-dark md:w-auto w-full border-grey border h-10 outline-none px-2 text-sm"
                        placeholder="0.1"
                      />
                      <span className="absolute mt-2 -ml-8">%</span>
                    </div>
                    <div className="flex flex-row items-center gap-x-3 w-full">
                      <div
                        onClick={() => {
                          setTradeSlippage("0.1");
                          setIsSettingsOpen(false);
                        }}
                        className="text-sm bg-dark border-grey/50 border h-10 flex items-center justify-center w-full cursor-pointer"
                      >
                        0.1%
                      </div>
                      <div
                        onClick={() => {
                          setTradeSlippage("0.5");
                          setIsSettingsOpen(false);
                        }}
                        className="text-sm bg-dark border-grey/50 border h-10 flex items-center justify-center w-full cursor-pointer"
                      >
                        0.5%
                      </div>
                      <div
                        onClick={() => {
                          setTradeSlippage("1");
                          setIsSettingsOpen(false);
                        }}
                        className="text-sm bg-dark border-grey/50 border h-10 flex items-center justify-center w-full cursor-pointer"
                      >
                        1%
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full mt-8 py-2 disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
                  >
                    {"Confirm"}
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
