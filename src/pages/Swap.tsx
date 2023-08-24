import {
  AdjustmentsHorizontalIcon,
  ArrowSmallDownIcon,
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
import { gasEstimateSwap } from "../utils/gas";
import { getCoverPool, getRangePool, getSwapPool } from "../utils/pools";
import inputFilter from "../utils/inputFilter";
import { useSwapStore } from "../hooks/useSwapStore";
import {
  fetchCoverTokenUSDPrice,
  fetchRangeTokenUSDPrice,
} from "../utils/tokens";
import LimitSwapButton from "../components/Buttons/LimitSwapButton";

export default function Swap() {
  const { address, isDisconnected, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const {
    network: { chainId },
  } = useProvider();
  const { bnInput, display, inputBox, maxBalance, setBnInput, setDisplay } =
    useInputBox();

  const [
    swapPoolAddress,
    swapPoolData,
    swapSlippage,
    setSwapPoolAddress,
    setSwapPoolData,
    setSwapSlippage,
    //tokenIN
    tokenIn,
    setTokenIn,
    setTokenInUSDPrice,
    setTokenInBalance,
    setTokenInAllowance,
    //tokenOut
    tokenOut,
    setTokenOut,
    setTokenOutUSDPrice,
    setTokenOutBalance,
    //tokenOrder
    switchDirection,
    pairSelected,
    setPairSelected,
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
    //swapPool
    state.swapPoolAddress,
    state.swapPoolData,
    state.slippage,
    state.setSwapPoolAddress,
    state.setSwapPoolData,
    state.setSlippage,
    //tokenIN
    state.tokenIn,
    state.setTokenIn,
    state.setTokenInUSDPrice,
    state.setTokenInBalance,
    state.setTokenInAllowance,
    //tokenOut
    state.tokenOut,
    state.setTokenOut,
    state.setTokenOutUSDPrice,
    state.setTokenOutBalance,
    //tokenOrder
    state.switchDirection,
    state.pairSelected,
    state.setPairSelected,
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

  ////////////////////////////////ChainId
  const [stateChainName, setStateChainName] = useState();

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId]);
  }, [chainId]);

  ////////////////////////////////Pools
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      updatePools();
    }
  }, [tokenOut, tokenIn]);

  async function updatePools() {
    const pools = await getSwapPool(
      tokenIn,
      tokenOut,
      setSwapPoolAddress,
      setSwapPoolData
    );
    for (let i = 0; i < pools.length; i++) {
      const params = {
        priceLimit: pools[i].priceLimit,
        amount: bnInput,
        exactIn: true,
        zeroForOne: tokenOrder,
      };
      setQuoteParams(quoteParams ? [...quoteParams, params] : [params]);
    }
    setAvailablePools(pools);
  }

  const { data: pools } = useContractRead({
    address: undefined, //contract address,
    abi: undefined, // contract abi,
    functionName: "multiQuote",
    args: [availablePools, quoteParams, true],
    chainId: 421613,
    //enabled: needsRangeAllowanceIn,
    onError(error) {
      console.log("Error allowance", error);
    },
    onSuccess(data) {
      //setNeedsRangeAllowanceIn(false);
      //set ordered list to state
      console.log("Success multiquote", data);
    },
  });

  ////////////////////////////////TokenOrder
  const [tokenOrder, setTokenOrder] = useState(true);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setTokenOrder(tokenIn.callId == 0);
    }
  }, [tokenIn, tokenOut]);

  ////////////////////////////////TokenUSDPrices

  useEffect(() => {
    if (swapPoolData) {
      if (tokenIn.address) {
        if (swapPoolData.token0 && swapPoolData.token1) {
          fetchRangeTokenUSDPrice(swapPoolData, tokenIn, setTokenInUSDPrice);
        }
      }
      if (tokenOut.address) {
        if (swapPoolData.token0 && swapPoolData.token1) {
          fetchRangeTokenUSDPrice(swapPoolData, tokenOut, setTokenOutUSDPrice);
        }
      }
    }
  }, [swapPoolData, tokenIn, tokenOut]);

  ////////////////////////////////Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.address,
    enabled:
      (tokenIn.address && needsCoverBalance) ||
      (tokenIn.address && needsRangeBalanceIn),
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

  const { data: allowance } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, swapPoolAddress],
    chainId: 421613,
    watch: needsRangeAllowanceIn,
    enabled: pairSelected && swapPoolAddress && needsRangeAllowanceIn,
    onError(error) {
      console.log("Error allowance", error);
    },
    onSuccess(data) {
      setNeedsRangeAllowanceIn(false);
      //console.log("Success allowance", data);
    },
  });

  useEffect(() => {
    setTokenInAllowance(ethers.utils.formatUnits(allowance, tokenIn.decimals));
  }, [allowance]);

  ////////////////////////////////Quotes
  const [coverQuote, setCoverQuote] = useState(0);
  const [rangeQuote, setRangeQuote] = useState(0);
  const [coverPriceAfter, setCoverPriceAfter] = useState(undefined);
  const [rangePriceAfter, setRangePriceAfter] = useState(undefined);
  const [rangeBnPriceLimit, setRangeBnPriceLimit] = useState(BN_ZERO);
  const [coverBnPriceLimit, setCoverBnPriceLimit] = useState(BN_ZERO);

  const { data: quoteRange } = useContractRead({
    address: swapPoolAddress,
    abi: rangePoolABI,
    functionName: "quote",
    args: [[tokenOrder ? minPriceBn : maxPriceBn, bnInput, tokenOrder]],
    chainId: 421613,
    watch: true,
    enabled: swapPoolAddress,
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
      //chooseSlippage();
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
    setSlippage((parseFloat(feeTierCover) / 10000).toString());
  };

  ////////////////////////////////Prices
  const [coverPrice, setCoverPrice] = useState(0);
  const [rangePrice, setRangePrice] = useState(0);

  const [coverBnPrice, setCoverBnPrice] = useState(BigNumber.from(0));
  const [rangeBnPrice, setRangeBnPrice] = useState(BigNumber.from(0));

  const [coverBnBaseLimit, setCoverBnBaseLimit] = useState(BigNumber.from(0));
  const [rangeBnBaseLimit, setRangeBnBaseLimit] = useState(BigNumber.from(0));

  const { data: priceRange } = useContractRead({
    address: swapPoolAddress,
    abi: rangePoolABI,
    functionName: "poolState",
    args: [],
    chainId: 421613,
    watch: true,
    enabled: swapPoolAddress,
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
  }, [coverPrice, rangePrice]);

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
  }, [slippage, rangeBnPrice, coverBnPrice]);

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
      swapPoolData?.feeTier?.tickSpacing
    ) {
      updateLimitTicks();
    }
  }, [limitStringPriceQuote, slippage]);

  function updateLimitTicks() {
    const tickSpacing = swapPoolData.feeTier.tickSpacing;
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
      ethers.utils.parseUnits(tokenInRangeAllowance, tokenIn.decimals),
      ethers.utils.parseUnits(tokenInCoverAllowance, tokenIn.decimals),
      address,
      signer,
      isConnected,
      setGasFee,
      setGasLimit
    ); */
  }

  async function updateMintFee() {
    /* await gasEstimateSwapLimit(
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
    if (
      Number(tokenIn.userBalance) < Number(ethers.utils.formatUnits(bnInput))
    ) {
      setButtonState("balance");
    }
  }, [bnInput, pairSelected, tokenIn.userBalance, bnInput]);

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
    <div className="pt-[10vh] mb-[10vh] px-3 md:px-0 w-full">
      <div className="flex flex-col w-full md:max-w-md px-6 pt-5 pb-7 mx-auto bg-black border border-grey2 rounded-xl">
        <div className="flex items-center">
          <div className="flex gap-4 mb-1.5 text-sm">
            <div
              onClick={() => setLimitTabSelected(false)}
              className={`${
                limitTabSelected
                  ? "text-grey cursor-pointer"
                  : "text-white cursor-pointer"
              }`}
            >
              Market
            </div>

            <div
              onClick={() => setLimitTabSelected(true)}
              className={`${
                limitTabSelected
                  ? "text-white cursor-pointer"
                  : "text-grey cursor-pointer"
              }`}
            >
              Limit
            </div>
          </div>
          <div className="ml-auto">
            <Popover className="relative">
              <Popover.Button className="outline-none">
                <AdjustmentsHorizontalIcon className="w-5 h-5 outline-none" />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Popover.Panel className="absolute z-10 md:ml-14 -ml-48 z-50 mt-[5px] md:-mt-[48px] bg-black border border-grey2 rounded-xl p-5">
                  {({ close }) => (
                    <div className="w-full">
                      <h1 className="">
                        {limitTabSelected ? (
                          <>Range Tolerance</>
                        ) : (
                          <>Slippage Tolerance</>
                        )}
                      </h1>
                      <div className="flex xl:flex-row flex-col gap-y-2 mt-3 gap-x-3">
                        <input
                          autoComplete="off"
                          placeholder="0%"
                          className="bg-dark rounded-xl outline-none border border-grey1 pl-3 py-3 placeholder:text-grey1"
                          value={auxSlippage + "%"}
                          onChange={(e) =>
                            setAuxSlippage(
                              parseFloat(
                                e.target.value.replace(/[^\d.-]/g, "")
                              ) < 100
                                ? e.target.value.replace(/[^\d.-]/g, "")
                                : ""
                            )
                          }
                        />
                        <button
                          className=" w-full py-2.5 px-12 mx-auto text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
                          onClick={async () => {
                            setSlippage(parseFloat(auxSlippage).toFixed(2));
                            close();
                          }}
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  )}
                </Popover.Panel>
              </Transition>
            </Popover>
          </div>
        </div>
        {/* tokenIn box */}
        <div className="w-full mt-4 align-middle items-center flex bg-dark border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center md:w-1/2 p-2 ">
            {/* input box for user inserting input value */}
            {inputBox("0")}
            {/* USD value of inputed amount */}
            {tokenIn.address ? (
              <div className="flex">
                <div className="flex text-xs text-[#4C4C4C]">
                  ~$
                  {(
                    Number(
                      ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                    ) * tokenIn.USDPrice
                  ).toFixed(2)}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="flex md:w-1/2">
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
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
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div
                    className="flex whitespace-nowrap md:text-xs text-[10px] text-[#4C4C4C]"
                    key={tokenIn.userBalance}
                  >
                    Balance: {tokenIn.userBalance}
                  </div>
                  {isConnected && stateChainName === "arbitrumGoerli" ? (
                    <button
                      className="flex md:text-xs text-[10px] uppercase text-[#C9C9C9]"
                      onClick={() => {
                        maxBalance(tokenIn.userBalance, "0");
                      }}
                    >
                      Max
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="items-center -mb-2 -mt-2 p-2 m-auto border border-[#1E1E1E] z-30 bg-black rounded-lg cursor-pointer">
          {
            <ArrowSmallDownIcon
              className="w-4 h-4"
              onClick={() => {
                switchDirection();
              }}
            />
          }
        </div>
        {/* tokenOut box */}
        <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            <div className=" bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none">
              {/*display the expected amount of tokenOut*/}
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
                          parseFloat(
                            ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                          ) *
                          parseFloat(invertPrice(limitStringPriceQuote, false))
                        ).toPrecision(6)
                      : (
                          parseFloat(
                            ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                          ) * parseFloat(limitStringPriceQuote)
                        ).toPrecision(6)}
                  </div>
                )
              ) : (
                <div>0</div>
              )}
            </div>
            {/*for displaying the USD value for the out amount */}
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C]">
                ~$
                {pairSelected ||
                parseFloat(
                  ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                ) !== 0 ? (
                  tokenOut.USDPrice || tokenOut.USDPrice ? (
                    !limitTabSelected ? (
                      //swap page
                      rangeQuote >= coverQuote ? (
                        (rangeQuote * tokenOut.USDPrice).toFixed(2)
                      ) : (
                        (coverQuote * tokenOut.USDPrice).toFixed(2)
                      )
                    ) : //limit page
                    limitPriceOrder ? (
                      (
                        parseFloat(
                          ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                        ) *
                        parseFloat(limitStringPriceQuote) *
                        tokenOut.USDPrice
                      ).toFixed(2)
                    ) : (
                      (
                        parseFloat(
                          ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                        ) *
                        parseFloat(invertPrice(limitStringPriceQuote, false)) *
                        tokenOut.USDPrice
                      ).toFixed(2)
                    )
                  ) : (
                    (0).toFixed(2)
                  )
                ) : (
                  <>{(0).toFixed(2)}</>
                )}
              </div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
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

                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="flex whitespace-nowrap md:text-xs text-[10px] text-[#4C4C4C]">
                    {pairSelected ? "Balance: " + tokenOut.userBalance : <></>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {limitTabSelected ? (
          <div>
            <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl mt-4">
              <div className="flex-col justify-center w-1/2 p-2 ">
                <input
                  autoComplete="off"
                  className="bg-[#0C0C0C] outline-none"
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
                <></>
                <div className="flex">
                  <div className="flex text-[10px] md:text-xs text-[#4C4C4C]">
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
                        (parseFloat(invertPrice(limitStringPriceQuote, false)) /
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
                  </div>
                </div>
              </div>
              <div className="flex w-1/2">
                <div className="flex justify-center ml-auto">
                  <div className="flex-col">
                    <div className="flex justify-end">
                      {tokenOrder && pairSelected === false ? (
                        <button className="flex md:text-sm text-xs items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl">
                          {tokenIn.symbol} per ?
                          <ArrowPathIcon className="w-5" />
                        </button>
                      ) : (
                        <button
                          className="flex md:text-sm text-xs items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                          onClick={() => setLimitPriceOrder(!limitPriceOrder)}
                        >
                          {limitPriceOrder
                            ? tokenOut.symbol + " per " + tokenIn.symbol
                            : tokenIn.symbol + " per " + tokenOut.symbol}

                          <ArrowPathIcon className="w-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 px-1 mt-2">
                      {/* <div className="text-xs text-white">
                        Set to Market Price //@dev doesn't look like it's needed as its redundant
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="py-4">
          <div
            className="flex px-2 cursor-pointer"
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
            {Number(tokenIn.userBalance) <
              Number(ethers.utils.formatUnits(bnInput)) ||
            bnInput.lte(BN_ONE) ? (
              <button
                disabled
                className="w-full py-4 text-sm md:text-base mx-auto cursor-not-allowed font-medium opacity-20 text-center transition rounded-xl bg-gradient-to-r from-[#344DBF] to-[#3098FF]"
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
              Number(tokenIn.userAllowance) <
              Number(ethers.utils.formatUnits(bnInput, tokenIn.decimals)) ? (
                <div>
                  <SwapRangeApproveButton
                    poolAddress={swapPoolAddress}
                    approveToken={tokenIn.address}
                    tokenSymbol={tokenIn.symbol}
                    amount={bnInput}
                  />
                </div>
              ) : (
                <SwapRangeButton
                  disabled={false}
                  poolAddress={swapPoolAddress}
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
            Number(tokenIn.userAllowance) <
              Number(ethers.utils.formatUnits(bnInput, tokenIn.decimals)) ? (
              <div>
                <SwapCoverApproveButton
                  disabled={false}
                  poolAddress={swapPoolAddress}
                  approveToken={tokenIn.address}
                  tokenSymbol={tokenIn.symbol}
                  amount={bnInput}
                />
              </div>
            ) : (
              <SwapCoverButton
                disabled={gasLimit.gt(BN_ZERO)}
                poolAddress={swapPoolAddress}
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
            Number(tokenIn.userBalance) <
              Number(ethers.utils.formatUnits(bnInput)) ||
            bnInput._hex == "0x00" ? (
              <button
                disabled
                className="w-full text-sm md:text-base py-4 mx-auto cursor-not-allowed font-medium opacity-20 text-center transition rounded-xl bg-gradient-to-r from-[#344DBF] to-[#3098FF]"
              >
                {buttonState === "amount" ? <>Input Amount</> : <></>}
                {buttonState === "token" ? <>Select Token</> : <></>}
                {buttonState === "balance" ? (
                  <>Insufficient {tokenIn.symbol} Balance</>
                ) : (
                  <></>
                )}
              </button>
            ) : Number(tokenIn.userAllowance) <
              Number(ethers.utils.formatUnits(bnInput, tokenIn.decimals)) ? (
              <SwapRangeApproveButton
                poolAddress={swapPoolAddress}
                approveToken={tokenIn.address}
                tokenSymbol={tokenIn.symbol}
                amount={bnInput}
              />
            ) : (
              <LimitSwapButton
                disabled={mintGasLimit.eq(BN_ZERO)}
                poolAddress={swapPoolAddress}
                to={address}
                amount={bnInput}
                mintPercent={ethers.utils.parseUnits("1", 26)} /// @dev - skip mint is less than 1% left after swap
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
  );
}
