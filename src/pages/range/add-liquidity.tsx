import { useEffect, useState } from "react";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import {
  TickMath,
  invertPrice,
  roundPrice,
  roundTick,
} from "../../utils/math/tickMath";
import JSBI from "jsbi";
import useInputBox from "../../hooks/useInputBox";
import { useAccount, useBalance } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO, ONE, ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import inputFilter from "../../utils/inputFilter";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import Navbar from "../../components/Navbar";
import RangePoolPreview from "../../components/Range/RangePoolPreview";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import { chainProperties } from "../../utils/chains";
import router from "next/router";
import { inputHandler, parseUnits } from "../../utils/math/valueMath";
import SelectToken from "../../components/SelectToken";
import { feeTierMap, feeTiers, limitPoolTypeIds } from "../../utils/pools";
import { useConfigStore } from "../../hooks/useConfigStore";
import { fetchRangePools } from "../../utils/queries";
import { ConnectWalletButton } from "../../components/Buttons/ConnectWalletButton";
import { isWhitelistedPair, setDefaultRange } from "../../utils/config";
import BalanceDisplay from "../../components/Display/BalanceDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { getLogo } from "../../utils/tokens";
import useAllowance from "../../hooks/contracts/useAllowance";
import { useShallow } from "zustand/react/shallow";
import useTokenUSDPrice from "../../hooks/useTokenUSDPrice";
import useAddress from "../../hooks/useAddress";

export default function AddLiquidity({}) {
  const [chainId, networkName, limitSubgraph, logoMap, searchtokenList] =
    useConfigStore(
      useShallow((state) => [
        state.chainId,
        state.networkName,
        state.limitSubgraph,
        state.logoMap,
        state.searchtokenList,
      ]),
    );

  const rangeLimitStore = useRangeLimitStore();

  const { isConnected } = useAccount();
  const address = useAddress();

  const {
    inputBox: inputBoxIn,
    setDisplay: setDisplayIn,
    display: displayIn,
  } = useInputBox();
  const {
    inputBox: inputBoxOut,
    setDisplay: setDisplayOut,
    display: displayOut,
  } = useInputBox();
  const [amountInSetLast, setAmountInSetLast] = useState(true);
  const [amountInDisabled, setAmountInDisabled] = useState(false);
  const [amountOutDisabled, setAmountOutDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  ////////////////////////////////Pools

  useEffect(() => {
    rangeLimitStore.setManualRange(false);
    //setRangePoolData({});
    if (
      rangeLimitStore.tokenIn.address != ZERO_ADDRESS &&
      rangeLimitStore.tokenOut.address != ZERO_ADDRESS
    ) {
      rangeLimitStore.setPairSelected(true);
      if (rangeLimitStore.rangePoolData.feeTier != undefined) {
        fetchNewPoolFromTokens();
      }
    } else {
      rangeLimitStore.setPairSelected(false);
    }

    rangeLimitStore.setPriceOrder(rangeLimitStore.tokenIn.callId == 0);
  }, [rangeLimitStore.tokenIn.address, rangeLimitStore.tokenOut.address]);

  useEffect(() => {
    if (
      router.query.feeTier &&
      !isNaN(parseInt(router.query.feeTier.toString())) &&
      rangeLimitStore.rangePoolData.feeTier == undefined
    ) {
      fetchPoolFromRouter(parseInt(router.query.feeTier.toString()));
    }
  }, [router.query.feeTier]);

  useEffect(() => {
    rangeLimitStore.setManualRange(false);
    const fetchPool = async () => {
      const data = await fetchRangePools(limitSubgraph);
      if (
        data["data"] &&
        rangeLimitStore.rangePoolData.feeTier == undefined &&
        !isNaN(parseInt(router.query.chainId?.toString())) &&
        (parseInt(router.query.chainId?.toString()) != chainId ||
          rangeLimitStore.chainSwitched)
      ) {
        if (!rangeLimitStore.chainSwitched)
          rangeLimitStore.setChainSwitched(true);
        const pool = data["data"].limitPools[0];
        if (pool) {
          const originalTokenIn = {
            name: pool.token0.symbol,
            address: pool.token0.id,
            symbol: pool.token0.symbol,
            decimals: pool.token0.decimals,
            userBalance: pool.token0.balance,
            callId: 0,
          };
          const originalTokenOut = {
            name: pool.token1.symbol,
            address: pool.token1.id,
            symbol: pool.token1.symbol,
            decimals: pool.token1.decimals,
            userBalance: pool.token1.balance,
            callId: 1,
          };
          rangeLimitStore.setTokenIn(
            originalTokenOut,
            originalTokenIn,
            "0",
            true,
          );
          rangeLimitStore.setTokenOut(
            originalTokenIn,
            originalTokenOut,
            "0",
            false,
          );
          rangeLimitStore.setRangePoolFromFeeTier(
            originalTokenIn,
            originalTokenOut,
            parseInt(pool.feeTier.feeAmount),
            limitSubgraph,
            undefined,
            undefined,
            limitPoolTypeIds["constant-product-1.1"],
          );
        } else {
          router.push("/range");
        }
      }
      setIsLoading(false);
    };
    fetchPool();
  }, [chainId]);

  async function fetchPoolFromRouter(feeAmount) {
    const data = await fetchRangePools(limitSubgraph);
    if (data["data"]) {
      const pools = data["data"].limitPools;
      var pool = pools.find(
        (pool) =>
          pool.id.toLowerCase() == String(router.query.poolId).toLowerCase(),
      );
      //if pool exists
      if (pool) {
        const originalTokenIn = {
          name: pool.token0.symbol,
          address: pool.token0.id,
          symbol: pool.token0.symbol,
          decimals: pool.token0.decimals,
          userBalance: pool.token0.balance,
          callId: 0,
        };
        const originalTokenOut = {
          name: pool.token1.symbol,
          address: pool.token1.id,
          symbol: pool.token1.symbol,
          decimals: pool.token1.decimals,
          userBalance: pool.token1.balance,
          callId: 1,
        };
        rangeLimitStore.setTokenIn(
          originalTokenOut,
          originalTokenIn,
          "0",
          true,
        );
        rangeLimitStore.setTokenOut(
          originalTokenIn,
          originalTokenOut,
          "0",
          false,
        );
        rangeLimitStore.setRangePoolFromFeeTier(
          originalTokenIn,
          originalTokenOut,
          feeAmount,
          limitSubgraph,
          undefined,
          undefined,
          limitPoolTypeIds["constant-product-1.1"],
        );
      } else {
        const tokenInAddress = router.query.tokenIn?.toString();
        const tokenOutAddress = router.query.tokenOut?.toString();
        const routerTokenIn = searchtokenList.find(
          (token) =>
            token.address?.toLowerCase() == tokenInAddress?.toLowerCase() &&
            (token.native?.toString() == router.query.tokenInNative ||
              token.native == undefined),
        );
        const routerTokenOut = searchtokenList.find(
          (token) =>
            token.address?.toLowerCase() == tokenOutAddress?.toLowerCase() &&
            (token.native?.toString() == router.query.tokenOutNative ||
              token.native == undefined),
        );
        rangeLimitStore.setTokenIn(routerTokenOut, routerTokenIn, "0", true);
        rangeLimitStore.setTokenOut(routerTokenIn, routerTokenOut, "0", false);
        rangeLimitStore.setRangePoolFromFeeTier(
          rangeLimitStore.tokenIn,
          rangeLimitStore.tokenOut,
          feeAmount,
          limitSubgraph,
          undefined,
          undefined,
          limitPoolTypeIds["constant-product-1.1"],
        );
        rangeLimitStore.setRangePoolData({
          ...rangeLimitStore.rangePoolData,
          liquitidy: undefined,
          poolPrice: undefined,
          tickAtPrice: undefined,
        });
      }
    }
  }

  async function fetchNewPoolFromTokens() {
    //after changing to different tokens with existing pools -> should land on the existing pool with the new price ranges
    //after changing to different tokens with no existing pools -> price range resets to 0
    const currentFeeTier = rangeLimitStore.rangePoolData.feeTier?.feeAmount;
    rangeLimitStore.setRangePoolData({
      ...rangeLimitStore.rangePoolData,
      liquitidy: undefined,
      poolPrice: undefined,
      tickAtPrice: undefined,
    });
    rangeLimitStore.setRangePoolFromFeeTier(
      rangeLimitStore.tokenIn,
      rangeLimitStore.tokenOut,
      currentFeeTier ?? 3000,
      limitSubgraph,
      undefined,
      undefined,
      limitPoolTypeIds["constant-product-1.1"],
    );
  }

  function fetchPoolSameTokensDifferentFeeTier(feeAmount: number) {
    //after changing to a non existing pool with the same tokens -> price range keeps there
    rangeLimitStore.setRangePoolFromFeeTier(
      rangeLimitStore.tokenIn,
      rangeLimitStore.tokenOut,
      feeAmount,
      limitSubgraph,
      undefined,
      undefined,
      limitPoolTypeIds["constant-product-1.1"],
    );
  }

  //this sets the default position price range
  useEffect(() => {
    if (rangeLimitStore.manualRange) return;
    if (rangeLimitStore.rangePoolData.poolPrice) {
      const sqrtPrice = JSBI.BigInt(rangeLimitStore.rangePoolData.poolPrice);
      const tickAtPrice = rangeLimitStore.rangePoolData.tickAtPrice;
      setDefaultRange(
        rangeLimitStore.tokenIn,
        rangeLimitStore.tokenOut,
        networkName,
        rangeLimitStore.priceOrder == (rangeLimitStore.tokenIn.callId == 0),
        tickAtPrice,
        setMinInput,
        setMaxInput,
        rangeLimitStore.rangePoolData?.id,
      );
      setRangePrice(
        TickMath.getPriceStringAtSqrtPrice(
          sqrtPrice,
          rangeLimitStore.tokenIn,
          rangeLimitStore.tokenOut,
        ),
      );
      setRangeSqrtPrice(sqrtPrice);
    } else {
      setMinInput("");
      setMaxInput("");
    }
  }, [rangeLimitStore.manualRange, rangeLimitStore.rangePoolData]);

  //sames as updatePools but triggered from the html
  const handleManualFeeTierChange = async (feeAmount: number) => {
    rangeLimitStore.setManualRange(false);
    fetchPoolSameTokensDifferentFeeTier(feeAmount);
    rangeLimitStore.setRangePoolData({
      ...rangeLimitStore.rangePoolData,
      feeTier: {
        ...rangeLimitStore.rangePoolData.feeTier,
        feeAmount: feeAmount,
        tickSpacing: feeTierMap[feeAmount].tickSpacing,
      },
    });
  };

  ////////////////////////////////Token Prices
  useTokenUSDPrice({
    poolData: rangeLimitStore.rangePoolData,
    tokenIn: rangeLimitStore.tokenIn,
    tokenOut: rangeLimitStore.tokenOut,
    setTokenInUSDPrice: rangeLimitStore.setTokenInRangeUSDPrice,
    setTokenOutUSDPrice: rangeLimitStore.setTokenOutRangeUSDPrice,
  });

  ////////////////////////////////Allowances
  const { allowance: allowanceInRange } = useAllowance({
    token: rangeLimitStore.tokenIn,
  });
  const { allowance: allowanceOutRange } = useAllowance({
    token: rangeLimitStore.tokenOut,
  });

  useEffect(() => {
    rangeLimitStore.setTokenInRangeAllowance(
      deepConvertBigIntAndBigNumber(allowanceInRange),
    );
    rangeLimitStore.setTokenOutRangeAllowance(
      deepConvertBigIntAndBigNumber(allowanceOutRange),
    );
  }, [allowanceInRange, allowanceOutRange]);

  ////////////////////////////////Token Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: rangeLimitStore.tokenIn.native
      ? undefined
      : rangeLimitStore.tokenIn.address,
    enabled: rangeLimitStore.tokenIn.address != ZERO_ADDRESS,
    watch: true,
    chainId: chainId,
    onSuccess(data) {
      rangeLimitStore.setNeedsBalanceIn(false);
      setTimeout(() => {
        rangeLimitStore.setNeedsBalanceIn(true);
      }, 5000);
    },
  });

  const { data: tokenOutBal } = useBalance({
    address: address,
    token: rangeLimitStore.tokenOut.native
      ? undefined
      : rangeLimitStore.tokenOut.address,
    enabled: rangeLimitStore.tokenOut.address != ZERO_ADDRESS,
    watch: true,
    chainId: chainId,
    onSuccess(data) {
      rangeLimitStore.setNeedsBalanceOut(false);
      setTimeout(() => {
        rangeLimitStore.setNeedsBalanceOut(true);
      }, 5000);
    },
    onError(err) {
      console.log(
        "token out error",
        address,
        rangeLimitStore.tokenOut.address,
        err,
      );
    },
  });

  useEffect(() => {
    if (isConnected && tokenInBal) {
      rangeLimitStore.setTokenInBalance(tokenInBal?.formatted.toString());
      if (rangeLimitStore.pairSelected && tokenOutBal) {
        rangeLimitStore.setTokenOutBalance(tokenOutBal?.formatted.toString());
      }
    }
  }, [tokenInBal, tokenOutBal]);

  ////////////////////////////////Prices and Ticks
  const [rangePrice, setRangePrice] = useState(undefined);
  const [rangeSqrtPrice, setRangeSqrtPrice] = useState(undefined);

  //Prices for calculations
  const [lowerPrice, setLowerPrice] = useState("0");
  const [upperPrice, setUpperPrice] = useState("0");

  useEffect(() => {
    if (upperPrice == lowerPrice || rangePrice == undefined) return;
    const token0Disabled = parseFloat(upperPrice) <= parseFloat(rangePrice);
    const token1Disabled = parseFloat(lowerPrice) >= parseFloat(rangePrice);
    const tokenInDisabled =
      rangeLimitStore.tokenIn.callId == 0 ? token0Disabled : token1Disabled;
    const tokenOutDisabled =
      rangeLimitStore.tokenOut.callId == 0 ? token0Disabled : token1Disabled;
    setAmountInDisabled(tokenInDisabled);
    setAmountOutDisabled(tokenOutDisabled);
    if (
      tokenInDisabled &&
      rangeLimitStore.rangeMintParams.tokenInAmount.gt(BN_ZERO)
    ) {
      setDisplayIn("");
      setAmounts(true, BN_ZERO);
      setAmountInSetLast(true);
    } else if (
      tokenOutDisabled &&
      rangeLimitStore.rangeMintParams.tokenOutAmount.gt(BN_ZERO)
    ) {
      setDisplayOut("");
      setAmounts(false, BN_ZERO);
      setAmountInSetLast(false);
    } else {
      setAmounts(
        amountInSetLast,
        amountInSetLast
          ? rangeLimitStore.rangeMintParams.tokenInAmount
          : rangeLimitStore.rangeMintParams.tokenOutAmount,
      );
    }
  }, [lowerPrice, upperPrice, rangePrice]);

  const handleInputBox = (e) => {
    if (e.target.name === "tokenIn") {
      const [value, bnValue] = inputHandler(e, rangeLimitStore.tokenIn);
      setDisplayIn(value);
      setAmounts(true, bnValue);
      setAmountInSetLast(true);
    } else if (e.target.name === "tokenOut") {
      const [value, bnValue] = inputHandler(e, rangeLimitStore.tokenOut);
      setDisplayOut(value);
      setAmounts(false, bnValue);
      setAmountInSetLast(false);
    }
  };

  useEffect(() => {
    setAmounts(amountInSetLast, rangeLimitStore.rangeMintParams.tokenInAmount);
  }, [rangeLimitStore.tokenIn.callId]);

  const handleBalanceMax = (isTokenIn: boolean) => {
    const token = isTokenIn
      ? rangeLimitStore.tokenIn
      : rangeLimitStore.tokenOut;
    const value = token.userBalance.toString();
    const bnValue = parseUnits(value, token.decimals);
    isTokenIn ? setDisplayIn(value) : setDisplayOut(value);
    setAmounts(isTokenIn, bnValue);
    setAmountInSetLast(isTokenIn);
  };

  function setAmounts(amountInSet: boolean, amountSet: BigNumber) {
    try {
      const isToken0 = amountInSet
        ? rangeLimitStore.tokenIn.callId == 0
        : rangeLimitStore.tokenOut.callId == 0;
      const inputBn = amountSet;
      const lower = TickMath.getTickAtPriceString(
        lowerPrice,
        rangeLimitStore.tokenIn,
        rangeLimitStore.tokenOut,
        parseInt(rangeLimitStore.rangePoolData.feeTier?.tickSpacing ?? "100"),
      );
      const upper = TickMath.getTickAtPriceString(
        upperPrice,
        rangeLimitStore.tokenIn,
        rangeLimitStore.tokenOut,
        parseInt(rangeLimitStore.rangePoolData.feeTier?.tickSpacing ?? "100"),
      );
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(lower);
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(upper);
      if (amountSet.gt(BN_ZERO)) {
        let liquidity = ZERO;
        if (
          JSBI.greaterThanOrEqual(rangeSqrtPrice, lowerSqrtPrice) &&
          JSBI.lessThan(rangeSqrtPrice, upperSqrtPrice)
        ) {
          liquidity = DyDxMath.getLiquidityForAmounts(
            isToken0 ? rangeSqrtPrice : lowerSqrtPrice,
            isToken0 ? upperSqrtPrice : rangeSqrtPrice,
            rangeSqrtPrice,
            isToken0 ? BN_ZERO : inputBn,
            isToken0 ? inputBn : BN_ZERO,
          );
        } else if (JSBI.lessThan(rangeSqrtPrice, lowerSqrtPrice)) {
          // only token0 input allowed
          if (isToken0) {
            liquidity = DyDxMath.getLiquidityForAmounts(
              lowerSqrtPrice,
              upperSqrtPrice,
              rangeSqrtPrice,
              BN_ZERO,
              inputBn,
            );
          } else {
            // warn the user the input is invalid
          }
        } else if (JSBI.greaterThanOrEqual(rangeSqrtPrice, upperSqrtPrice)) {
          if (!isToken0) {
            liquidity = DyDxMath.getLiquidityForAmounts(
              lowerSqrtPrice,
              upperSqrtPrice,
              rangeSqrtPrice,
              inputBn,
              BN_ZERO,
            );
          } else {
            // warn the user the input is invalid
          }
        }
        rangeLimitStore.setLiquidityAmount(liquidity);
        let outputJsbi;
        // if current price in-range calculate other token amount
        if (
          JSBI.lessThan(rangeSqrtPrice, upperSqrtPrice) &&
          JSBI.greaterThan(rangeSqrtPrice, lowerSqrtPrice)
        ) {
          outputJsbi = JSBI.greaterThan(liquidity, ZERO)
            ? isToken0
              ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
              : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
            : ZERO;
        } else {
          outputJsbi = ZERO;
        }
        const outputBn = BigNumber.from(String(outputJsbi));
        // set amount based on inputBn
        if (amountInSet) {
          rangeLimitStore.setTokenInAmount(inputBn);
          rangeLimitStore.setTokenOutAmount(outputBn);
          const displayValue = parseFloat(
            ethers.utils.formatUnits(
              outputBn,
              rangeLimitStore.tokenOut.decimals,
            ),
          ).toPrecision(6);
          setDisplayOut(parseFloat(displayValue) > 0 ? displayValue : "");
        } else {
          rangeLimitStore.setTokenInAmount(outputBn);
          rangeLimitStore.setTokenOutAmount(inputBn);
          const displayValue = parseFloat(
            ethers.utils.formatUnits(
              outputBn,
              rangeLimitStore.tokenIn.decimals,
            ),
          ).toPrecision(6);
          setDisplayIn(parseFloat(displayValue) > 0 ? displayValue : "");
        }
      } else {
        rangeLimitStore.setTokenInAmount(BN_ZERO);
        rangeLimitStore.setTokenOutAmount(BN_ZERO);
        if (amountInSet) {
          setDisplayOut("");
        } else {
          setDisplayIn("");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////Position Price Range

  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  const handlePriceSwitch = () => {
    rangeLimitStore.setPriceOrder(!rangeLimitStore.priceOrder);
    setMaxInput(invertPrice(minInput, false));
    setMinInput(invertPrice(maxInput, false));
    if (rangeLimitStore.rangePoolAddress == ZERO_ADDRESS) {
      rangeLimitStore.setStartPrice(
        invertPrice(rangeLimitStore.startPrice, false),
      );
    }
  };

  useEffect(() => {
    if (
      !isNaN(parseFloat(minInput)) &&
      !isNaN(parseFloat(maxInput)) &&
      !isNaN(parseFloat(rangeLimitStore.rangePoolData.feeTier?.tickSpacing))
    ) {
      const priceLower = invertPrice(
        roundPrice(
          rangeLimitStore.priceOrder ? minInput : maxInput,
          rangeLimitStore.tokenIn,
          rangeLimitStore.tokenOut,
          rangeLimitStore.rangePoolData.feeTier?.tickSpacing ?? 30,
        ),
        rangeLimitStore.priceOrder,
      );
      const priceUpper = invertPrice(
        roundPrice(
          rangeLimitStore.priceOrder ? maxInput : minInput,
          rangeLimitStore.tokenIn,
          rangeLimitStore.tokenOut,
          rangeLimitStore.rangePoolData.feeTier?.tickSpacing ?? 30,
        ),
        rangeLimitStore.priceOrder,
      );
      setLowerPrice(priceLower);
      setUpperPrice(priceUpper);
      rangeLimitStore.setRangePositionData({
        ...rangeLimitStore.rangePositionData,
        lowerPrice: priceLower,
        upperPrice: priceUpper,
      });
    }
  }, [maxInput, minInput, rangeLimitStore.rangePoolData.feeTier?.tickSpacing]);

  useEffect(() => {
    if (
      rangeLimitStore.rangePoolAddress == ZERO_ADDRESS &&
      rangeLimitStore.startPrice &&
      !isNaN(parseFloat(rangeLimitStore.startPrice))
    ) {
      rangeLimitStore.setRangePoolData({
        poolPrice: String(
          TickMath.getSqrtPriceAtPriceString(
            invertPrice(rangeLimitStore.startPrice, rangeLimitStore.priceOrder),
            rangeLimitStore.tokenIn,
            rangeLimitStore.tokenOut,
          ),
        ),
        tickAtPrice: TickMath.getTickAtPriceString(
          invertPrice(rangeLimitStore.startPrice, rangeLimitStore.priceOrder),
          rangeLimitStore.tokenIn,
          rangeLimitStore.tokenOut,
        ),
        feeTier: rangeLimitStore.rangePoolData.feeTier,
      });
    }
  }, [rangeLimitStore.rangePoolAddress, rangeLimitStore.startPrice]);

  ////////////////////////////////Mint Button State

  // set amount in

  useEffect(() => {
    rangeLimitStore.setMintButtonState();
  }, [
    rangeLimitStore.tokenIn,
    rangeLimitStore.tokenOut,
    rangeLimitStore.rangeMintParams.tokenInAmount,
    rangeLimitStore.rangeMintParams.tokenOutAmount,
  ]);

  ////////////////////////////////

  const [rangeWarning, setRangeWarning] = useState(false);

  useEffect(() => {
    const priceLower = parseFloat(
      rangeLimitStore.priceOrder
        ? lowerPrice
        : invertPrice(lowerPrice, rangeLimitStore.priceOrder),
    );
    const priceUpper = parseFloat(
      rangeLimitStore.priceOrder
        ? upperPrice
        : invertPrice(upperPrice, rangeLimitStore.priceOrder),
    );
    const priceRange = parseFloat(
      rangeLimitStore.priceOrder
        ? rangePrice
        : invertPrice(rangePrice, rangeLimitStore.priceOrder),
    );
    if (!isNaN(priceLower) && !isNaN(priceUpper) && !isNaN(priceRange)) {
      if (priceLower > 0 && priceUpper > 0) {
        if (
          (priceLower <= priceRange && priceUpper <= priceRange) ||
          (priceLower >= priceRange && priceUpper >= priceRange)
        ) {
          setRangeWarning(true);
        } else {
          setRangeWarning(false);
        }
      }
    }
  }, [lowerPrice, rangePrice, upperPrice]);

  ////////////////////////////////

  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="text-white flex flex-col mx-auto max-w-2xl  justify-center pt-10 px-3 md:px-0 pb-32">
        <div className="flex md:flex-row flex-col md:items-center items-start gap-y-4 justify-between">
          <h1 className="uppercase">RANGE POOL</h1>
          <div>
            {isLoading ? (
              <div className="h-[42.02px] w-[230px] bg-grey/60 animate-pulse rounded-[4px]" />
            ) : (
              <a
                href={`${chainProperties[networkName]?.explorerUrl}/address/${rangeLimitStore.rangePoolAddress}`}
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex  items-center gap-x-2 hover:bg-grey/50 cursor-pointer transition-all bg-dark border border-grey hover:border-grey2 py-2 px-5 rounded-[4px]">
                  <div className="flex items-center">
                    <img
                      className="md:w-6 w-6"
                      src={getLogo(rangeLimitStore.tokenIn, logoMap)}
                    />
                    <img
                      className="md:w-6 w-6 -ml-2"
                      src={getLogo(rangeLimitStore.tokenOut, logoMap)}
                    />
                  </div>
                  <span className="text-white text-xs">
                    {rangeLimitStore.tokenIn.symbol} -{" "}
                    {rangeLimitStore.tokenOut.symbol}
                  </span>
                  <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                    {(
                      (!isNaN(rangeLimitStore.rangePoolData.feeTier?.feeAmount)
                        ? rangeLimitStore.rangePoolData.feeTier?.feeAmount
                        : 0) / 10000
                    ).toFixed(2)}
                    %
                  </span>
                  <ArrowTopRightOnSquareIcon className="w-4 ml-2" />
                </div>
              </a>
            )}
          </div>
        </div>
        <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
          <h1 className="mb-4">ADD LIQUIDITY</h1>
          <div className="border border-grey bg-black rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>
                ~$
                {!isNaN(rangeLimitStore.tokenIn.USDPrice)
                  ? (
                      rangeLimitStore.tokenIn.USDPrice *
                      Number(
                        ethers.utils.formatUnits(
                          rangeLimitStore.rangeMintParams.tokenInAmount,
                          rangeLimitStore.tokenIn.decimals,
                        ),
                      )
                    ).toFixed(2)
                  : "?.??"}
              </span>
              {isLoading ? (
                <div className="h-[16.5px] w-[100px] bg-grey/60 animate-pulse rounded-[4px]" />
              ) : (
                <BalanceDisplay
                  token={rangeLimitStore.tokenIn}
                ></BalanceDisplay>
              )}
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              {inputBoxIn(
                "0",
                rangeLimitStore.tokenIn,
                "tokenIn",
                handleInputBox,
                amountInDisabled,
              )}
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() => handleBalanceMax(true)}
                  disabled={amountInDisabled}
                  className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border md:block hidden"
                >
                  MAX
                </button>
                <div className="flex items-center gap-x-2">
                  {isLoading ? (
                    <div className="h-[40px] w-[160px] bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    <SelectToken
                      index="0"
                      key="in"
                      type="in"
                      tokenIn={rangeLimitStore.tokenIn}
                      setTokenIn={rangeLimitStore.setTokenIn}
                      tokenOut={rangeLimitStore.tokenOut}
                      setTokenOut={rangeLimitStore.setTokenOut}
                      displayToken={rangeLimitStore.tokenIn}
                      amount={amountInSetLast ? displayIn : displayOut}
                      isAmountIn={amountInSetLast}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-grey bg-black rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>
                ~$
                {!isNaN(rangeLimitStore.tokenOut.USDPrice)
                  ? (
                      Number(rangeLimitStore.tokenOut.USDPrice) *
                      Number(
                        ethers.utils.formatUnits(
                          rangeLimitStore.rangeMintParams.tokenOutAmount,
                          rangeLimitStore.tokenOut.decimals,
                        ),
                      )
                    ).toFixed(2)
                  : "?.??"}
              </span>
              {isLoading ? (
                <div className="h-[16.5px] w-[100px] bg-grey/60 animate-pulse rounded-[4px]" />
              ) : (
                <BalanceDisplay
                  token={rangeLimitStore.tokenOut}
                ></BalanceDisplay>
              )}
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              {inputBoxOut(
                "0",
                rangeLimitStore.tokenOut,
                "tokenOut",
                handleInputBox,
                amountOutDisabled,
              )}
              <div className="flex items-center gap-x-2 ">
                <button
                  onClick={() => handleBalanceMax(false)}
                  disabled={amountOutDisabled}
                  className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border md:block hidden"
                >
                  MAX
                </button>
                <div className="flex items-center gap-x-2">
                  {isLoading ? (
                    <div className="h-[40px] w-[160px] bg-grey/60 animate-pulse rounded-[4px]" />
                  ) : (
                    <SelectToken
                      key={"out"}
                      type="out"
                      tokenIn={rangeLimitStore.tokenIn}
                      setTokenIn={rangeLimitStore.setTokenIn}
                      tokenOut={rangeLimitStore.tokenOut}
                      setTokenOut={rangeLimitStore.setTokenOut}
                      setPairSelected={rangeLimitStore.setPairSelected}
                      displayToken={rangeLimitStore.tokenOut}
                      amount={amountInSetLast ? displayIn : displayOut}
                      isAmountIn={amountInSetLast}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between md:items-center items-start mb-4 mt-10">
            <div className="flex  md:flex-row flex-col md:items-center  gap-3">
              <h1>SET A PRICE RANGE</h1>
              <button
                className="text-grey1 text-xs bg-black border border-grey px-4 py-0.5 rounded-[4px] whitespace-nowrap"
                onClick={() => {
                  setMinInput(
                    TickMath.getPriceStringAtTick(
                      roundTick(
                        -887272,
                        parseInt(
                          rangeLimitStore.rangePoolData.feeTier?.tickSpacing ??
                            30,
                        ),
                      ),
                      rangeLimitStore.tokenIn,
                      rangeLimitStore.tokenOut,
                    ),
                  );
                  setMaxInput(
                    TickMath.getPriceStringAtTick(
                      roundTick(
                        887272,
                        parseInt(
                          rangeLimitStore.rangePoolData.feeTier?.tickSpacing ??
                            30,
                        ),
                      ),
                      rangeLimitStore.tokenIn,
                      rangeLimitStore.tokenOut,
                    ),
                  );
                }}
              >
                Full Range
              </button>
            </div>
            <div
              onClick={handlePriceSwitch}
              className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
            >
              <span className="whitespace-nowrap">
                {rangeLimitStore.priceOrder ==
                (rangeLimitStore.tokenIn.callId == 0) ? (
                  <>{rangeLimitStore.tokenOut.symbol}</>
                ) : (
                  <>{rangeLimitStore.tokenIn.symbol}</>
                )}{" "}
                per{" "}
                {rangeLimitStore.priceOrder ==
                (rangeLimitStore.tokenIn.callId == 0) ? (
                  <>{rangeLimitStore.tokenIn.symbol}</>
                ) : (
                  <>{rangeLimitStore.tokenOut.symbol}</>
                )}
              </span>{" "}
              <DoubleArrowIcon />
            </div>
          </div>
          {Number(minInput) > 0 && (
            <div className="flex justify-between items-center w-full md:gap-x-4 gap-x-2">
              <button
                onClick={() => {
                  rangeLimitStore.setManualRange(true);
                  setMinInput(
                    invertPrice(
                      TickMath.getPriceStringAtTick(
                        rangeLimitStore.priceOrder
                          ? rangeLimitStore.rangePoolData.tickAtPrice - 2232
                          : rangeLimitStore.rangePoolData.tickAtPrice - -2232,
                        rangeLimitStore.tokenIn,
                        rangeLimitStore.tokenOut,
                      ),
                      rangeLimitStore.priceOrder,
                    ),
                  );
                  setMaxInput(
                    invertPrice(
                      TickMath.getPriceStringAtTick(
                        rangeLimitStore.priceOrder
                          ? rangeLimitStore.rangePoolData.tickAtPrice - -2232
                          : rangeLimitStore.rangePoolData.tickAtPrice - 2232,
                        rangeLimitStore.tokenIn,
                        rangeLimitStore.tokenOut,
                      ),
                      rangeLimitStore.priceOrder,
                    ),
                  );
                }}
                className="bg-grey/20 rounded-[4px] border border-grey uppercase text-xs py-3 w-full hover:bg-grey/50 border border-transparent hover:border-grey2 transition-all"
              >
                Narrow
              </button>
              <button
                onClick={() => {
                  rangeLimitStore.setManualRange(true);
                  setMinInput(
                    invertPrice(
                      TickMath.getPriceStringAtTick(
                        rangeLimitStore.priceOrder
                          ? rangeLimitStore.rangePoolData.tickAtPrice - 4055
                          : rangeLimitStore.rangePoolData.tickAtPrice - -4055,
                        rangeLimitStore.tokenIn,
                        rangeLimitStore.tokenOut,
                      ),
                      rangeLimitStore.priceOrder,
                    ),
                  );
                  setMaxInput(
                    invertPrice(
                      TickMath.getPriceStringAtTick(
                        rangeLimitStore.priceOrder
                          ? rangeLimitStore.rangePoolData.tickAtPrice - -4055
                          : rangeLimitStore.rangePoolData.tickAtPrice - 4055,
                        rangeLimitStore.tokenIn,
                        rangeLimitStore.tokenOut,
                      ),
                      rangeLimitStore.priceOrder,
                    ),
                  );
                }}
                className="bg-grey/20 rounded-[4px] border border-grey uppercase text-xs py-3 w-full hover:bg-grey/50 border border-transparent hover:border-grey2 transition-all"
              >
                MEDIUM
              </button>
              <button
                onClick={() => {
                  rangeLimitStore.setManualRange(true);
                  setMinInput(
                    invertPrice(
                      TickMath.getPriceStringAtTick(
                        rangeLimitStore.priceOrder
                          ? rangeLimitStore.rangePoolData.tickAtPrice - 5596
                          : rangeLimitStore.rangePoolData.tickAtPrice - -5596,
                        rangeLimitStore.tokenIn,
                        rangeLimitStore.tokenOut,
                      ),
                      rangeLimitStore.priceOrder,
                    ),
                  );
                  setMaxInput(
                    invertPrice(
                      TickMath.getPriceStringAtTick(
                        rangeLimitStore.priceOrder
                          ? rangeLimitStore.rangePoolData.tickAtPrice - -5596
                          : rangeLimitStore.rangePoolData.tickAtPrice - 5596,
                        rangeLimitStore.tokenIn,
                        rangeLimitStore.tokenOut,
                      ),
                      rangeLimitStore.priceOrder,
                    ),
                  );
                }}
                className="bg-grey/20 rounded-[4px] border border-grey uppercase text-xs py-3 w-full hover:bg-grey/50 border border-transparent hover:border-grey2 transition-all"
              >
                WIDE
              </button>
            </div>
          )}
          <div className="flex flex-col gap-y-4">
            <div className="flex md:flex-row flex-col items-center gap-5 mt-3">
              {isLoading ? (
                <div className="h-[128px] w-full bg-grey/60 animate-pulse rounded-[4px]" />
              ) : (
                <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                  <span className="text-grey1 text-xs">MIN. PRICE</span>
                  <span className="text-white text-3xl">
                    {
                      <input
                        autoComplete="off"
                        className="bg-black py-2 outline-none text-center w-full"
                        placeholder="0"
                        id="minInput"
                        type="text"
                        value={minInput}
                        onChange={(e) =>
                          setMinInput(inputFilter(e.target.value))
                        }
                      />
                    }
                  </span>
                </div>
              )}
              {isLoading ? (
                <div className="h-[128px] w-full bg-grey/60 animate-pulse rounded-[4px]" />
              ) : (
                <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                  <span className="text-grey1 text-xs">MAX. PRICE</span>
                  <span className="text-white text-3xl">
                    {
                      <input
                        autoComplete="off"
                        className="bg-black py-2 outline-none text-center w-full"
                        placeholder="0"
                        id="minInput"
                        type="text"
                        value={maxInput}
                        onChange={(e) =>
                          setMaxInput(inputFilter(e.target.value))
                        }
                      />
                    }
                  </span>
                </div>
              )}
            </div>
            {rangeLimitStore.rangePoolAddress == ZERO_ADDRESS &&
              rangeLimitStore.rangePoolData.feeTier != undefined && (
                <div className="bg-black border rounded-[4px] border-grey/50 p-5">
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
                        type="text"
                        onChange={(e) => {
                          rangeLimitStore.setStartPrice(
                            inputFilter(e.target.value),
                          );
                        }}
                      />
                    </span>
                  </div>
                </div>
              )}

            <div className="mb-2 mt-3 flex-col flex gap-y-8">
              <div className="flex items-center justify-between w-full text-xs  text-[#C9C9C9]">
                <div className="text-xs text-[#4C4C4C]">Market Price</div>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger>
                      <div className="uppercase flex items-center gap-x-2">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          className="text-grey1"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9H12.01C12.5623 9 13.01 8.55228 13.01 8C13.01 7.44772 12.5623 7 12.01 7H12ZM13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V12Z"
                            fill="currentColor"
                          />
                        </svg>
                        1{" "}
                        {
                          (rangeLimitStore.priceOrder ==
                          (rangeLimitStore.tokenIn.callId == 0)
                            ? rangeLimitStore.tokenIn
                            : rangeLimitStore.tokenOut
                          ).symbol
                        }{" "}
                        ={" "}
                        {!isNaN(parseFloat(rangePrice)) &&
                        // pool exists
                        (rangeLimitStore.rangePoolAddress != ZERO_ADDRESS ||
                          // pool doesn't exist and start price is valid
                          (rangeLimitStore.rangePoolAddress == ZERO_ADDRESS &&
                            !isNaN(parseFloat(rangeLimitStore.startPrice)) &&
                            parseFloat(rangeLimitStore.startPrice) > 0))
                          ? parseFloat(
                              invertPrice(
                                rangePrice,
                                rangeLimitStore.priceOrder,
                              ),
                            ).toPrecision(5) +
                            " " +
                            (rangeLimitStore.priceOrder ==
                            (rangeLimitStore.tokenIn.callId == 0)
                              ? rangeLimitStore.tokenOut
                              : rangeLimitStore.tokenIn
                            ).symbol
                          : "?" +
                            " " +
                            (rangeLimitStore.priceOrder ==
                            (rangeLimitStore.tokenIn.callId == 0)
                              ? rangeLimitStore.tokenOut
                              : rangeLimitStore.tokenIn
                            ).symbol}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-dark text-xs rounded-[4px] border border-grey w-40 py-3">
                      {/* <div className="flex items-center flex-col gap-y-1 w-full"> */}
                      <div className="flex justify-between items-center w-full">
                        <span className="text-grey2 flex items-center gap-x-1">
                          <img
                            className="md:w-4"
                            src={getLogo(rangeLimitStore.tokenIn, logoMap)}
                          />
                          {rangeLimitStore.tokenIn.symbol}
                        </span>
                        <span className="text-right">
                          $
                          {!isNaN(rangeLimitStore.tokenIn.USDPrice)
                            ? (rangeLimitStore.tokenIn.USDPrice * 1).toFixed(2)
                            : "?.??"}
                        </span>
                      </div>
                      <div className="bg-grey w-full h-[1px]" />
                      <div className="flex justify-between items-center w-full">
                        <span className="text-grey2 flex items-center gap-x-1">
                          <img
                            className=" w-4"
                            src={getLogo(rangeLimitStore.tokenOut, logoMap)}
                          />
                          {rangeLimitStore.tokenOut.symbol}
                        </span>
                        <span className="text-right">
                          $
                          {!isNaN(rangeLimitStore.tokenOut.USDPrice)
                            ? (rangeLimitStore.tokenOut.USDPrice * 1).toFixed(2)
                            : "?.??"}
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {rangeWarning && (
                <div className=" text-yellow-600 bg-yellow-900/30 text-[10px] md:text-[11px] flex items-center md:gap-x-5 gap-x-3 p-2 rounded-[8px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="md:w-9 w-12"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Your position will not earn fees or be used in trades until
                  the market price moves into your range.
                </div>
              )}

              {(rangeLimitStore.rangeMintParams.tokenInAmount?.gt(BN_ZERO) ||
                rangeLimitStore.rangeMintParams.tokenOutAmount?.gt(BN_ZERO)) &&
              JSBI.lessThanOrEqual(
                rangeLimitStore.rangeMintParams.liquidityAmount,
                ONE,
              ) ? (
                <div className=" text-red-600 bg-red-900/30 text-[10px] md:text-[11px] flex items-center md:gap-x-5 gap-x-3 p-2 rounded-[8px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="md:w-9 w-12"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Liquidity size too small: please add more tokens or decrease
                  the price range.
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
          <h1 className="mb-4">SELECT A FEE TIER</h1>
          <div className="flex md:flex-row flex-col justify-between mt-8 gap-x-16 gap-y-4">
            {feeTiers.map((feeTier, feeTierIdx) => (
              <div
                onClick={() => {
                  handleManualFeeTierChange(feeTier.tierId);
                }}
                key={feeTierIdx}
                className={`bg-black p-4 w-full rounded-[4px] cursor-pointer transition-all ${
                  rangeLimitStore.rangePoolData.feeTier?.feeAmount.toString() ===
                  feeTier.tierId.toString()
                    ? "border-grey1 border bg-grey/20"
                    : "border border-grey"
                }`}
              >
                <h1 className="flex items-center gap-x-2 ">
                  {feeTier.tier} FEE
                  {isWhitelistedPair(
                    rangeLimitStore.tokenIn,
                    rangeLimitStore.tokenOut,
                    feeTier.tier,
                    networkName,
                  ) && <SparklesIcon className="text-main2 w-[16px]" />}
                </h1>

                <h2 className="text-[11px] uppercase text-grey1 mt-2">
                  {feeTier.text}
                </h2>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-green-500/10 w-full p-6 border border-green-500/30 mt-8 rounded-[4px]">
          <div className="flex items-center justify-between">
            <label className="text-green-500 cursor-pointer">
              <input
                type="checkbox"
                checked={rangeLimitStore.rangeMintParams.stakeFlag}
                onChange={() => {
                  rangeLimitStore.setStakeFlag(
                    !rangeLimitStore.rangeMintParams.stakeFlag,
                  );
                }}
                className="cursor-pointer"
              />{" "}
              STAKE RANGE POSITION
            </label>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger>
                  <div>
                    <span className="text-main2 flex items-center justify-end gap-x-3">
                      <div className="flex items-center gap-x-1.5  text-green-600 text-xs">
                        <InformationCircleIcon className="w-4" />
                        Info
                      </div>
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-dark text-xs rounded-[4px] border border-grey w-44 py-3">
                  <div className="flex items-center flex-col gap-y-1 w-full">
                    <div className="flex justify-between items-center w-full text-left">
                      <div className="flex items-center gap-x-1">
                        <span className="text-grey3 ">
                          {" "}
                          Staking this position will allow you to earn oFIN
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="bg-dark mt-8"></div>
        {isConnected ? <RangePoolPreview /> : <ConnectWalletButton xl={true} />}
      </div>
    </div>
  );
}
