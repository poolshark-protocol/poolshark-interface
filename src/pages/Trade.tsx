import { useState, useEffect, Fragment } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/20/solid";
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
import Range from "../components/Icons/RangeIcon";
import MarketSwap from "../components/Trade/MarketSwap";
import LimitSwap from "../components/Trade/LimitSwap";

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

  const [chainId, networkName, limitSubgraph, setLimitSubgraph, logoMap] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
      state.setLimitSubgraph,
      state.logoMap,
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
  //NOT USED
  const [isOpen, setIsOpen] = useState(false);

  //false when user in normal swap, true when user in limit swap
  const [limitTabSelected, setLimitTabSelected] = useState(false);

  //false when user is in exact price, true when user is in price range
  //LIMIT
  const [priceRangeSelected, setPriceRangeSelected] = useState(false);

  //false order history is selected, true when active orders is selected
  //BOTH
  const [activeOrdersSelected, setActiveOrdersSelected] = useState(true);

  ////////////////////////////////ChainId
  //CONFIG STORE
  const [stateChainName, setStateChainName] = useState();

  // BOTH
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

  // BOTH
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

  //BOTH
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

  ////////////////////////////////Filled Amount
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

  //////////////////////Position Data

  //BOTH
  const [allLimitPositions, setAllLimitPositions] = useState([]);

  //BOTH
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

  //BOTH
  useEffect(() => {
    if (allLimitPositions.length > 0) {
      mapUserLimitSnapshotList();
    }
  }, [allLimitPositions]);

  //BOTH
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

  //BOTH
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
              limitSubgraph,
              undefined
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

  //BOTH
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

  //BOTH
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

  //BOTH
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

  //BOTH
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

  //BOTH
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

  //BOTH
  useEffect(() => {
    if (allowanceInRouter) {
      setTokenInTradeAllowance(allowanceInRouter);
    }
  }, [allowanceInRouter]);

  ////////////////////////////////Limit Price Switch
  //LIMIT
  const [limitPriceOrder, setLimitPriceOrder] = useState(true);
  const [lowerPriceString, setLowerPriceString] = useState("0");
  const [upperPriceString, setUpperPriceString] = useState("0");

  //LIMIT
  const handlePriceSwitch = () => {
    setLimitPriceOrder(!limitPriceOrder);
    setLimitPriceString(invertPrice(limitPriceString, false));
    setLowerPriceString(invertPrice(upperPriceString, false));
    setUpperPriceString(invertPrice(lowerPriceString, false));
  };

  //LIMIT
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

  //LIMIT
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

  //LIMIT
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
  ////////////////////////////////Fee Estimations
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
  }, [swapParams, tokenIn, tokenOut, lowerTick, upperTick, needsAllowanceIn]);

  //LIMIT
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
  //BOTH
  useEffect(() => {
    if (amountIn) {
      setTokenInAmount(amountIn);
    }
  }, [amountIn]);

  //LIMIT
  useEffect(() => {
    setMintButtonState();
  }, [tradeParams.tokenInAmount, tradeParams.tokenOutAmount]);

  ////////////////////////////////
  const [expanded, setExpanded] = useState(false);

  ///////////////////////
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-160px)] w-[48rem] px-3 md:px-0">
      <div className="flex w-full mt-[10vh] justify-center mb-20 ">
        <div className="bg-black font-regular border border-grey rounded-[4px] w-full max-w-2xl">
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
          {!limitTabSelected ? <MarketSwap /> : <LimitSwap />}
        </div>
      </div>
      {/* from here is to stay on trade */}
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
