import {
  AdjustmentsHorizontalIcon,
  ArrowSmallDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon, ArrowPathIcon } from "@heroicons/react/20/solid";
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
import { gasEstimateSwap, gasEstimateSwapLimit } from "../utils/gas";
import { getCoverPool, getRangePool } from "../utils/pools";
import inputFilter from "../utils/inputFilter";
import RangeLimitSwapButton from "../components/Buttons/RangeLimitSwapButton";
import { useSwapStore } from "../hooks/useSwapStore";
import {
  fetchCoverTokenUSDPrice,
  fetchRangeTokenUSDPrice,
} from "../utils/tokens";
import { coinRaw } from "../utils/types";

export default function Swap() {
  const { address, isDisconnected, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const {
    network: { chainId },
  } = useProvider();
  const { bnInput, display, inputBox, maxBalance, setBnInput, setDisplay } =
    useInputBox();

  const [
    //tokenIN
    tokenIn,
    setTokenIn,
    tokenInRangeUSDPrice,
    setTokenInRangeUSDPrice,
    tokenInCoverUSDPrice,
    setTokenInCoverUSDPrice,
    tokenInBalance,
    setTokenInBalance,
    tokenInRangeAllowance,
    setTokenInRangeAllowance,
    tokenInCoverAllowance,
    setTokenInCoverAllowance,
    //tokenOut
    tokenOut,
    setTokenOut,
    tokenOutRangeUSDPrice,
    setTokenOutRangeUSDPrice,
    tokenOutCoverUSDPrice,
    setTokenOutCoverUSDPrice,
    tokenOutBalance,
    setTokenOutBalance,
    //tokenOrder
    switchDirection,
    pairSelected,
    setPairSelected,
    //rangePool
    rangePoolAddress,
    rangePoolData,
    rangeSlippage,
    setRangePoolAddress,
    setRangePoolData,
    setRangeSlippage,
    //coverPool
    coverPoolAddress,
    coverPoolData,
    coverSlippage,
    setCoverPoolAddress,
    setCoverPoolData,
    setCoverSlippage,
    //gas
    gasFee,
    gasLimit,
    setGasFee,
    setGasLimit,
    mintGasFee,
    mintGasLimit,
    setMintGasFee,
    setMintGasLimit,
    //refresh
    needsCoverAllowance,
    setNeedsCoverAllowance,
    needsRangeAllowanceIn,
    setNeedsRangeAllowanceIn,
    needsRangeAllowanceOut,
    setNeedsRangeAllowanceOut,
    //balance
    needsCoverBalance,
    setNeedsCoverBalance,
    needsRangeBalanceIn,
    setNeedsRangeBalanceIn,
    needsRangeBalanceOut,
    setNeedsRangeBalanceOut,
  ] = useSwapStore((state: any) => [
    //tokenIN
    state.tokenIn,
    state.setTokenIn,
    state.tokenInRangeUSDPrice,
    state.setTokenInRangeUSDPrice,
    state.tokenInCoverUSDPrice,
    state.setTokenInCoverUSDPrice,
    state.tokenInBalance,
    state.setTokenInBalance,
    state.tokenInRangeAllowance,
    state.setTokenInRangeAllowance,
    state.tokenInCoverAllowance,
    state.setTokenInCoverAllowance,
    //tokenOut
    state.tokenOut,
    state.setTokenOut,
    state.tokenOutRangeUSDPrice,
    state.setTokenOutRangeUSDPrice,
    state.tokenOutCoverUSDPrice,
    state.setTokenOutCoverUSDPrice,
    state.tokenOutBalance,
    state.setTokenOutBalance,
    //tokenOrder
    state.switchDirection,
    state.pairSelected,
    state.setPairSelected,
    //rangePool
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangeSlippage,
    state.setRangePoolAddress,
    state.setRangePoolData,
    state.setRangeSlippage,
    //coverPool
    state.coverPoolAddress,
    state.coverPoolData,
    state.coverSlippage,
    state.setCoverPoolAddress,
    state.setCoverPoolData,
    state.setCoverSlippage,
    //gas
    state.gasFee,
    state.gasLimit,
    state.setGasFee,
    state.setGasLimit,
    state.mintGasFee,
    state.mintGasLimit,
    state.setMintGasFee,
    state.setMintGasLimit,
    //refresh
    state.needsCoverAllowance,
    state.setNeedsCoverAllowance,
    state.needsRangeAllowanceIn,
    state.setNeedsRangeAllowanceIn,
    state.needsRangeAllowanceOut,
    state.setNeedsRangeAllowanceOut,
    //balance
    state.needsCoverBalance,
    state.setNeedsCoverBalance,
    state.needsRangeBalanceIn,
    state.setNeedsRangeBalanceIn,
    state.needsRangeBalanceOut,
    state.setNeedsRangeBalanceOut,
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

  ////////////////////////////////Pools

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      updatePools();
    }
  }, [tokenOut, tokenIn]);

  async function updatePools() {
    await getRangePool(
      tokenIn,
      tokenOut,
      setRangePoolAddress,
      setRangePoolData
    );
    await getCoverPool(
      tokenIn,
      tokenOut,
      setCoverPoolAddress,
      setCoverPoolData
    );
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
    if (rangePoolData && coverPoolData) {
      if (tokenIn.address) {
        if (rangePoolData.token0 && rangePoolData.token1) {
          fetchRangeTokenUSDPrice(
            rangePoolData,
            tokenIn,
            setTokenInRangeUSDPrice
          );
        }
        if (coverPoolData.token0 && coverPoolData.token1) {
          fetchCoverTokenUSDPrice(
            coverPoolData,
            tokenIn,
            setTokenInCoverUSDPrice
          );
        }
      }
      if (tokenOut.address) {
        if (rangePoolData.token0 && rangePoolData.token1) {
          fetchRangeTokenUSDPrice(
            rangePoolData,
            tokenOut,
            setTokenOutRangeUSDPrice
          );
        }
        if (coverPoolData.token0 && coverPoolData.token1) {
          fetchCoverTokenUSDPrice(
            coverPoolData,
            tokenOut,
            setTokenOutCoverUSDPrice
          );
        }
      }
    }
  }, [rangePoolData, coverPoolData, tokenIn, tokenOut]);

  ////////////////////////////////Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.address,
    enabled:
      (tokenIn.address != undefined && needsCoverBalance) ||
      (tokenIn.address != undefined && needsRangeBalanceIn),
    watch: needsCoverBalance || needsRangeBalanceIn,
    onSuccess(data) {
      if (needsCoverBalance) {
        setNeedsCoverBalance(false);
      }
      if (needsRangeBalanceIn) {
        setNeedsRangeBalanceIn(false);
      }
    },
  });

  const { data: tokenOutBal } = useBalance({
    address: address,
    token: tokenOut.address,
    enabled: tokenOut.address != undefined && needsRangeBalanceOut,
    watch: needsRangeBalanceOut,
    onSuccess(data) {
      if (needsRangeBalanceOut) {
        setNeedsRangeBalanceOut(false);
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

  const { data: allowanceInRange } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, rangePoolAddress],
    chainId: 421613,
    watch: needsRangeAllowanceIn,
    enabled: pairSelected && rangePoolAddress && needsRangeAllowanceIn,
    onError(error) {
      console.log("Error allowance", error);
    },
    onSuccess(data) {
      setNeedsRangeAllowanceIn(false);
      //console.log("Success allowance", data);
    },
  });

  const { data: allowanceInCover } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, coverPoolAddress],
    chainId: 421613,
    watch: needsCoverAllowance,
    enabled: pairSelected && coverPoolAddress && needsCoverAllowance,
    onError(error) {
      console.log("Error allowance", error);
    },
    onSuccess(data) {
      setNeedsCoverAllowance(false);
      //console.log("Success allowance", data);
    },
  });

  useEffect(() => {
    if (allowanceInRange) {
      setTokenInRangeAllowance(ethers.utils.formatUnits(allowanceInRange, 18));
    }
    if (allowanceInCover) {
      setTokenInCoverAllowance(ethers.utils.formatUnits(allowanceInCover, 18));
    }
  }, [allowanceInRange, allowanceInCover]);

  ////////////////////////////////Quotes
  const [coverQuote, setCoverQuote] = useState(0);
  const [rangeQuote, setRangeQuote] = useState(0);
  const [coverPriceAfter, setCoverPriceAfter] = useState(undefined);
  const [rangePriceAfter, setRangePriceAfter] = useState(undefined);
  const [rangeBnPriceLimit, setRangeBnPriceLimit] = useState(BN_ZERO);
  const [coverBnPriceLimit, setCoverBnPriceLimit] = useState(BN_ZERO);

  const { data: quoteRange } = useContractRead({
    address: rangePoolAddress,
    abi: rangePoolABI,
    functionName: "quote",
    args: [[tokenOrder ? minPriceBn : maxPriceBn, bnInput, tokenOrder]],
    chainId: 421613,
    watch: true,
    enabled: rangePoolAddress,
    onError(error) {
      console.log("Error range wagmi", error);
    },
    onSettled(data, error) {
      //console.log("Settled range wagmi", { data, error });
    },
  });

  const { data: quoteCover } = useContractRead({
    address: coverPoolAddress,
    abi: coverPoolABI,
    functionName: "quote",
    args: [[tokenOrder ? minPriceBn : maxPriceBn, bnInput, tokenOrder]],
    chainId: 421613,
    watch: true,
    enabled: coverPoolAddress,
    onError(error) {
      console.log("Error cover wagmi", error);
    },
    onSettled(data, error) {
      //console.log("Settled", { data, error });
    },
  });

  useEffect(() => {
    if (quoteRange) {
      if (quoteRange[0].gt(BN_ZERO) && quoteRange[1].gt(BN_ZERO)) {
        setRangeQuote(parseFloat(ethers.utils.formatUnits(quoteRange[1], 18)));
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

    if (quoteCover) {
      if (quoteCover[0].gt(BN_ZERO) && quoteCover[1].gt(BN_ZERO)) {
        setCoverQuote(parseFloat(ethers.utils.formatUnits(quoteCover[1], 18)));
        const priceAfter = parseFloat(
          TickMath.getPriceStringAtSqrtPrice(quoteCover[2])
        );
        const priceSlippage = parseFloat(
          ((priceAfter * parseFloat(slippage) * 100) / 10000).toFixed(6)
        );
        const priceAfterSlippage = String(
          priceAfter - (tokenOrder ? priceSlippage : -priceSlippage)
        );
        setCoverPriceAfter(priceAfter);
        const coverPriceLimit =
          TickMath.getSqrtPriceAtPriceString(priceAfterSlippage);
        setCoverBnPriceLimit(BigNumber.from(String(coverPriceLimit)));
      }
    }
  }, [quoteCover, quoteRange]);

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
    const feeTierCover =
      poolCover["data"]["coverPools"][0]["volatilityTier"]["feeAmount"];
    setCoverSlippage((parseFloat(feeTierCover) / 10000).toString());
    const poolRange = await getRangePoolFromFactory(
      tokenIn.address,
      tokenOut.address
    );
    const feeTier = poolRange["data"]["rangePools"][0]["feeTier"]["feeAmount"];
    setRangeSlippage((parseFloat(feeTier) / 10000).toString());
  };

  const chooseSlippage = () => {
    if (rangeQuote >= coverQuote) {
      setSlippage(rangeSlippage);
      setAuxSlippage(rangeSlippage);
    } else {
      setSlippage(coverSlippage);
      setAuxSlippage(coverSlippage);
    }
  };

  ////////////////////////////////Prices
  const [coverPrice, setCoverPrice] = useState(0);
  const [rangePrice, setRangePrice] = useState(0);

  const [coverBnPrice, setCoverBnPrice] = useState(BigNumber.from(0));
  const [rangeBnPrice, setRangeBnPrice] = useState(BigNumber.from(0));

  const [coverBnBaseLimit, setCoverBnBaseLimit] = useState(BigNumber.from(0));
  const [rangeBnBaseLimit, setRangeBnBaseLimit] = useState(BigNumber.from(0));

  const { data: priceRange } = useContractRead({
    address: rangePoolAddress,
    abi: rangePoolABI,
    functionName: "poolState",
    args: [],
    chainId: 421613,
    watch: true,
    enabled: rangePoolAddress,
    onError(error) {
      console.log("Error price Range", error);
    },
    onSettled(data, error) {
      //console.log("Settled price Range", { data, error });
    },
  });

  const { data: priceCover } = useContractRead({
    address: coverPoolAddress,
    abi: coverPoolABI,
    functionName: tokenOrder ? "pool0" : "pool1",
    args: [],
    chainId: 421613,
    watch: true,
    enabled: coverPoolAddress,
    onError(error) {
      console.log("Error price Cover", error);
    },
    onSettled(data, error) {
      //console.log("Settled price Cover", { data, error });
    },
  });

  //when contract prices change updates price states
  useEffect(() => {
    if (priceCover) {
      if (priceCover[0].gt(BN_ZERO)) {
        setCoverPrice(
          parseFloat(TickMath.getPriceStringAtSqrtPrice(priceCover[0]))
        );
      }
    }
    if (priceRange) {
      if (priceRange[5].gt(BN_ZERO)) {
        setRangePrice(
          parseFloat(TickMath.getPriceStringAtSqrtPrice(priceRange[5]))
        );
      }
    }
  }, [priceCover, priceRange]);

  //when price states change updates price bn states
  useEffect(() => {
    if (coverPrice) {
      setCoverBnPrice(ethers.utils.parseEther(coverPrice.toString()));
    }
    if (rangePrice) {
      setRangeBnPrice(ethers.utils.parseEther(rangePrice.toString()));
    }
  }, [coverPrice, rangePrice]);

  //when price bn states change updates base limit states
  useEffect(() => {
    if (coverBnPrice) {
      if (!coverBnPrice.eq(BN_ZERO)) {
        const baseLimit = coverBnPrice
          .mul(parseFloat((parseFloat(slippage) * 100).toFixed(6)))
          .div(10000);
        setCoverBnBaseLimit(baseLimit);
      }
    }
    if (rangeBnPrice) {
      if (!rangeBnPrice.eq(BN_ZERO)) {
        const baseLimit = rangeBnPrice
          .mul(parseFloat((parseFloat(slippage) * 100).toFixed(6)))
          .div(10000);
        setRangeBnBaseLimit(baseLimit);
      }
    }
  }, [slippage, rangeBnPrice, coverBnPrice]);

  ////////////////////////////////Limit Price Switch
  const [limitPriceOrder, setLimitPriceOrder] = useState(true);
  const [limitStringPriceQuote, setLimitStringPriceQuote] = useState("0");

  useEffect(() => {
    setLimitStringPriceQuote(
      (tokenInRangeUSDPrice / tokenOutRangeUSDPrice).toPrecision(6).toString()
    );
  }, [tokenOutRangeUSDPrice, tokenInRangeUSDPrice]);

  useEffect(() => {
    var newPrice = (tokenInRangeUSDPrice / tokenOutRangeUSDPrice)
      .toPrecision(6)
      .toString();
    setLimitStringPriceQuote(newPrice);
  }, [tokenOrder]);

  useEffect(() => {
    if (!limitPriceOrder) {
      setLimitStringPriceQuote(
        (tokenOutRangeUSDPrice / tokenInRangeUSDPrice).toPrecision(6).toString()
      );
    } else {
      setLimitStringPriceQuote(
        (tokenInRangeUSDPrice / tokenOutRangeUSDPrice).toPrecision(6).toString()
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
      rangePoolData?.feeTier?.tickSpacing
    ) {
      updateLimitTicks();
    }
  }, [limitStringPriceQuote, slippage]);

  function updateLimitTicks() {
    const tickSpacing = rangePoolData.feeTier.tickSpacing;
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
  //const [swapGasFee, setSwapGasFee] = useState("$0.00");
  //const [swapGasLimit, setSwapGasLimit] = useState(BN_ZERO);
  //const [mintFee, setMintFee] = useState("$0.00");
  //const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

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
    await gasEstimateSwap(
      rangePoolAddress,
      coverPoolAddress,
      rangeQuote,
      coverQuote,
      rangeBnPrice,
      rangeBnBaseLimit,
      tokenIn,
      tokenOut,
      bnInput,
      ethers.utils.parseUnits(tokenInRangeAllowance, 18),
      ethers.utils.parseUnits(tokenInCoverAllowance, 18),
      address,
      signer,
      isConnected,
      setGasFee,
      setGasLimit
    );
  }

  async function updateMintFee() {
    await gasEstimateSwapLimit(
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
    );
  }

  ////////////////////////////////Button states for swap
  const [buttonState, setButtonState] = useState("");

  // disabled messages
  useEffect(() => {
    if (Number(ethers.utils.formatUnits(bnInput)) === 0) {
      setButtonState("amount");
    }
    if (pairSelected == false) {
      setButtonState("token");
    }
    if (Number(tokenInBalance) < Number(ethers.utils.formatUnits(bnInput))) {
      setButtonState("balance");
    }
  }, [bnInput, pairSelected, tokenInBalance, bnInput]);

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
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          rangeQuote
                        ).toFixed(2)
                    : coverQuote === 0
                    ? "0"
                    : (
                        parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                        coverQuote
                      ).toFixed(2)
                  : parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) == 0
                  ? "0"
                  : (
                      parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                      parseFloat(limitStringPriceQuote)
                    ).toPrecision(6)
                : "Select Token"}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            {!limitTabSelected ? (
              <div className="ml-auto text-xs">{gasFee}</div>
            ) : (
              <div className="ml-auto text-xs">{mintGasFee}</div>
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
                            parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                              rangeQuote -
                            parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                              rangeQuote *
                              (parseFloat(slippage) * 0.01)
                          ).toFixed(2)
                      : coverQuote === 0
                      ? "0"
                      : (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                            coverQuote -
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                            coverQuote *
                            (parseFloat(slippage) * 0.01)
                        ).toFixed(2)
                    : parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) ==
                      0
                    ? "0"
                    : (
                        parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          parseFloat(
                            ethers.utils.formatUnits(rangeBnPrice, 18)
                          ) -
                        parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          parseFloat(
                            ethers.utils.formatUnits(rangeBnPrice, 18)
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
                    ? rangeQuote >= coverQuote
                      ? (
                          Math.abs((rangePrice - rangePriceAfter) * 100) /
                          rangePrice
                        ).toFixed(2) + "%"
                      : (
                          Math.abs((coverPrice - coverPriceAfter) * 100) /
                          coverPrice
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
    <div className="min-h-[calc(100vh-160px)] w-[43rem]">
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
                    Number(ethers.utils.formatUnits(bnInput, 18)) *
                    tokenInRangeUSDPrice
                  ).toFixed(2)}
                </span>
                <span>BALANCE: {tokenInBalance}</span>
              </div>
              <div className="flex items-end justify-between mt-2 mb-3">
                {inputBox("0")}
                <div className="flex items-center gap-x-2">
                  {isConnected && stateChainName === "arbitrumGoerli" ? (
                    <button
                      onClick={() => {
                        maxBalance(tokenInBalance, "1");
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
                stroke-width="1.5"
                stroke="currentColor"
                className="w-5 cursor-pointer"
                onClick={() => {
                  switchDirection();
                }}
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
                    tokenOutRangeUSDPrice || tokenOutCoverUSDPrice ? (
                      !limitTabSelected ? (
                        //swap page
                        rangeQuote >= coverQuote ? (
                          (rangeQuote * tokenOutRangeUSDPrice).toFixed(2)
                        ) : (
                          (coverQuote * tokenOutCoverUSDPrice).toFixed(2)
                        )
                      ) : //limit page
                      limitPriceOrder ? (
                        (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          parseFloat(limitStringPriceQuote) *
                          tokenOutRangeUSDPrice
                        ).toFixed(2)
                      ) : (
                        (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          parseFloat(
                            invertPrice(limitStringPriceQuote, false)
                          ) *
                          tokenOutRangeUSDPrice
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
                  {pairSelected ? "Balance: " + tokenOutBalance : <></>}
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
                    PRICE:
                    <div className="text-xs">
                      <button
                        className={`px-5 py-2 ${
                          priceRangeSelected
                            ? "bg-black border-l border-t border-b border-grey"
                            : "bg-main1 border border-main"
                        }`}
                        onClick={() => setPriceRangeSelected(false)}
                      >
                        EXACT PRICE
                      </button>
                      <button
                        className={`px-5 py-2 ${
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
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="text-white w-3"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
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
                        <input className="outline-none bg-transparent text-3xl w-56 text-center mb-2" />
                      </div>
                      <div className="border border-grey w-full bg-dark flex flex-col items-center justify-center py-4">
                        <span className="text-center text-xs text-grey1 mb-2">
                          MAX. PRICE
                        </span>
                        <input className="outline-none bg-transparent text-3xl w-56 text-center mb-2" />
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
                                (tokenInRangeUSDPrice / tokenOutRangeUSDPrice) -
                                1) *
                                100 >
                              0
                              ? (
                                  (parseFloat(limitStringPriceQuote) /
                                    (tokenInRangeUSDPrice /
                                      tokenOutRangeUSDPrice) -
                                    1) *
                                  100
                                ).toFixed(2) + "% above Market Price"
                              : Math.abs(
                                  (parseFloat(limitStringPriceQuote) /
                                    (tokenInRangeUSDPrice /
                                      tokenOutRangeUSDPrice) -
                                    1) *
                                    100
                                ).toFixed(2) + "% below Market Price"
                            : //when inverted order tokenOut/tokenIn
                            (parseFloat(
                                invertPrice(limitStringPriceQuote, false)
                              ) /
                                (tokenInRangeUSDPrice / tokenOutRangeUSDPrice) -
                                1) *
                                100 >
                              0
                            ? (
                                (parseFloat(
                                  invertPrice(limitStringPriceQuote, false)
                                ) /
                                  (tokenInRangeUSDPrice /
                                    tokenOutRangeUSDPrice) -
                                  1) *
                                100
                              ).toFixed(2) + "% above Market Price"
                            : Math.abs(
                                (parseFloat(
                                  invertPrice(limitStringPriceQuote, false)
                                ) /
                                  (tokenInRangeUSDPrice /
                                    tokenOutRangeUSDPrice) -
                                  1) *
                                  100
                              ).toFixed(2) + "% below Market Price"
                          : "0.00% above Market Price"}
                      </span>
                    </div>
                    <input
                      autoComplete="off"
                      className="bg-dark outline-none text-3xl my-3"
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
                    : (rangeQuote >= coverQuote
                        ? //range price
                          tokenOrder
                          ? rangePrice.toPrecision(5)
                          : invertPrice(rangePrice.toPrecision(5), false)
                        : //cover price
                        tokenOrder
                        ? coverPrice.toPrecision(5)
                        : invertPrice(coverPrice.toPrecision(5), false)) +
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
                {Number(tokenInBalance) <
                  Number(ethers.utils.formatUnits(bnInput)) ||
                bnInput.lte(BN_ONE) ? (
                  <button
                    disabled
                    className="w-full py-4 mx-auto cursor-not-allowed text-center transition rounded-full  border border-main bg-main1 uppercase text-sm opacity-50"
                  >
                    {buttonState === "amount" ? <>Input Amount</> : <></>}
                    {buttonState === "token" ? <>Select Token</> : <></>}
                    {buttonState === "balance" ? (
                      <>Insufficient {tokenIn.symbol} Balance</>
                    ) : (
                      <></>
                    )}
                  </button>
                ) : rangeQuote >= coverQuote ? ( //range buttons
                  Number(tokenInRangeAllowance) <
                  Number(ethers.utils.formatUnits(bnInput, 18)) ? (
                    <div>
                      <SwapRangeApproveButton
                        poolAddress={rangePoolAddress}
                        approveToken={tokenIn.address}
                        tokenSymbol={tokenIn.symbol}
                        amount={bnInput}
                      />
                    </div>
                  ) : (
                    <SwapRangeButton
                      disabled={false}
                      poolAddress={rangePoolAddress}
                      zeroForOne={
                        tokenOut.address != "" &&
                        tokenIn.address.localeCompare(tokenOut.address) < 0
                      }
                      amount={bnInput}
                      priceLimit={rangeBnPriceLimit}
                      gasLimit={gasLimit}
                    />
                  )
                ) : //cover buttons
                Number(tokenInCoverAllowance) <
                  Number(ethers.utils.formatUnits(bnInput, 18)) ? (
                  <div>
                    <SwapCoverApproveButton
                      disabled={false}
                      poolAddress={coverPoolAddress}
                      approveToken={tokenIn.address}
                      tokenSymbol={tokenIn.symbol}
                      amount={bnInput}
                    />
                  </div>
                ) : (
                  <SwapCoverButton
                    disabled={gasLimit.gt(BN_ZERO)}
                    poolAddress={coverPoolAddress}
                    zeroForOne={
                      tokenOut.address != "" &&
                      tokenIn.address.localeCompare(tokenOut.address) < 0
                    }
                    amount={bnInput}
                    priceLimit={coverBnPriceLimit}
                    gasLimit={gasLimit}
                  />
                )}
              </>
            ) : (
              //limit tab
              <>
                {stateChainName !== "arbitrumGoerli" ||
                Number(tokenInBalance) <
                  Number(ethers.utils.formatUnits(bnInput)) ||
                bnInput._hex == "0x00" ? (
                  <button
                    disabled
                    className="w-full py-4 mx-auto cursor-not-allowed text-center transition rounded-full  border border-main bg-main1 uppercase text-sm opacity-50"
                  >
                    {buttonState === "amount" ? <>Input Amount</> : <></>}
                    {buttonState === "token" ? <>Select Token</> : <></>}
                    {buttonState === "balance" ? (
                      <>Insufficient {tokenIn.symbol} Balance</>
                    ) : (
                      <></>
                    )}
                  </button>
                ) : Number(tokenInRangeAllowance) <
                  Number(ethers.utils.formatUnits(bnInput, 18)) ? (
                  <SwapRangeApproveButton
                    poolAddress={rangePoolAddress}
                    approveToken={tokenIn.address}
                    tokenSymbol={tokenIn.symbol}
                    amount={bnInput}
                  />
                ) : (
                  <RangeLimitSwapButton
                    disabled={mintGasLimit.eq(BN_ZERO)}
                    poolAddress={rangePoolAddress}
                    to={address}
                    lower={lowerTick}
                    upper={upperTick}
                    amount0={tokenOrder ? bnInput : BN_ZERO}
                    amount1={tokenOrder ? BN_ZERO : bnInput}
                    gasLimit={mintGasLimit}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mb-20">
        <div className="flex item-end justify-between">
          <h1 className="mt-1.5">Limit Orders</h1>
          <div className="text-xs">
            <button
              className={`px-5 py-2 ${
                !activeOrdersSelected
                  ? "bg-black border-l border-t border-b border-grey"
                  : "bg-main1 border border-main"
              }`}
              onClick={() => setActiveOrdersSelected(true)}
            >
              ACTIVE ORDERS
            </button>
            <button
              className={`px-5 py-2 ${
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
        <div className="w-full h-[1px] bg-grey mt-3 mb-5" />
        <table className="w-full table-auto">
          <thead className="pb-4 border-b-10 border-black">
            <tr className="text-xs text-grey1/60 mb-3 leading-normal">
              <th className="text-left ">Sell</th>
              <th className="text-left ">Buy</th>
              <th className="text-left">Price</th>
              <th className="text-left">Status</th>
              <th className="text-right ">Age</th>
            </tr>
          </thead>
          <div className="mt-3" />
          {activeOrdersSelected ? (
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
