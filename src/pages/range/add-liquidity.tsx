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
import { erc20ABI, useAccount, useBalance, useContractRead } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO, ONE, ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import inputFilter from "../../utils/inputFilter";
import { fetchRangeTokenUSDPrice, getLogoURI } from "../../utils/tokens";
import Navbar from "../../components/Navbar";
import RangePoolPreview from "../../components/Range/RangePoolPreview";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import { chainProperties } from "../../utils/chains";
import router from "next/router";
import { inputHandler, parseUnits } from "../../utils/math/valueMath";
import SelectToken from "../../components/SelectToken";
import { feeTierMap, feeTiers } from "../../utils/pools";
import { useConfigStore } from "../../hooks/useConfigStore";
import { fetchRangePools } from "../../utils/queries";
import { ConnectWalletButton } from "../../components/Buttons/ConnectWalletButton";
import { getRouterAddress } from "../../utils/config";
import BalanceDisplay from "../../components/Display/BalanceDisplay";

export default function AddLiquidity({}) {
  const [chainId, networkName, limitSubgraph, coverSubgraph, logoMap] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
      state.coverSubgraph,
      state.logoMap,
    ]);

  const [
    rangePoolAddress,
    rangePoolData,
    rangePositionData,
    rangeMintParams,
    setRangePositionData,
    tokenIn,
    setTokenIn,
    setTokenInAmount,
    setTokenInAllowance,
    setTokenInRangeUSDPrice,
    setTokenInBalance,
    tokenOut,
    setTokenOut,
    setTokenOutAllowance,
    setTokenOutAmount,
    setTokenOutRangeUSDPrice,
    setTokenOutBalance,
    setLiquidityAmount,
    startPrice,
    pairSelected,
    setPairSelected,
    setMintButtonState,
    setRangePoolFromFeeTier,
    priceOrder,
    setPriceOrder,
    needsAllowanceIn,
    needsBalanceIn,
    needsAllowanceOut,
    needsBalanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setRangePoolData,
    setStartPrice,
    setStakeFlag,
  ] = useRangeLimitStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangePositionData,
    state.rangeMintParams,
    state.setRangePositionData,
    state.tokenIn,
    state.setTokenIn,
    state.setTokenInAmount,
    state.setTokenInRangeAllowance,
    state.setTokenInRangeUSDPrice,
    state.setTokenInBalance,
    state.tokenOut,
    state.setTokenOut,
    state.setTokenOutRangeAllowance,
    state.setTokenOutAmount,
    state.setTokenOutRangeUSDPrice,
    state.setTokenOutBalance,
    state.setLiquidityAmount,
    state.startPrice,
    state.pairSelected,
    state.setPairSelected,
    state.setMintButtonState,
    state.setRangePoolFromFeeTier,
    state.priceOrder,
    state.setPriceOrder,
    state.needsAllowanceIn,
    state.needsBalanceIn,
    state.needsAllowanceOut,
    state.needsBalanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
    state.setRangePoolData,
    state.setStartPrice,
    state.setStakeFlag,
  ]);

  const { address, isConnected } = useAccount();
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [amountInSetLast, setAmountInSetLast] = useState(true);
  const [amountInDisabled, setAmountInDisabled] = useState(false);
  const [amountOutDisabled, setAmountOutDisabled] = useState(false);

  ////////////////////////////////Pools

  useEffect(() => {
    if (tokenIn.address != ZERO_ADDRESS && tokenOut.address != ZERO_ADDRESS) {
      refetchAllowanceIn();
      refetchAllowanceOut();
      setPairSelected(true);
      if (rangePoolData.feeTier != undefined) {
        updatePools(parseInt(rangePoolData.feeTier.feeAmount));
      }
    } else {
      setPairSelected(false);
    }
  }, [tokenIn.address, tokenOut.address]);

  useEffect(() => {
    if (
      router.query.feeTier &&
      !isNaN(parseInt(router.query.feeTier.toString())) &&
      rangePoolData.feeTier == undefined
    ) {
      updatePools(parseInt(router.query.feeTier.toString()));
    }
  }, [router.query.feeTier]);

  useEffect(() => {
    const originalTokenIn = {
      ...tokenIn,
      logoURI: logoMap[tokenIn.address.toLowerCase()],
    };
    const originalTokenOut = {
      ...tokenOut,
      logoURI: logoMap[tokenOut.address.toLowerCase()],
    };
    setTokenIn(originalTokenOut, originalTokenIn, "0", true);
    setTokenOut(originalTokenIn, originalTokenOut, "0", false);
  }, [logoMap]);

  useEffect(() => {
    const fetchPool = async () => {
      const data = await fetchRangePools(limitSubgraph);
      if (data["data"]) {
        const pool = data["data"].limitPools[0];
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
        if (
          originalTokenIn.symbol == tokenIn.symbol &&
          originalTokenOut.symbol == tokenOut.symbol
        ) {
          setTokenIn(originalTokenOut, originalTokenIn, "0", true);
          setTokenOut(originalTokenIn, originalTokenOut, "0", false);
          setRangePoolFromFeeTier(
            originalTokenIn,
            originalTokenOut,
            parseInt(pool.feeTier.feeAmount),
            limitSubgraph
          );
        } else {
          setRangePoolFromFeeTier(tokenIn, tokenOut, "3000", limitSubgraph);
        }
      }
    };
    fetchPool();
  }, [chainId]);

  async function updatePools(feeAmount: number) {
    /// @notice - this should filter by the poolId in the actual query
    const data = await fetchRangePools(limitSubgraph);
    if (data["data"]) {
      const pools = data["data"].limitPools;
      //try to get the pool from routing params
      var pool = pools.find(
        (pool) =>
          pool.id.toLowerCase() == String(router.query.poolId).toLowerCase()
      );

      if (
        (pool != undefined &&
          tokenIn.address == pool.token0.id &&
          tokenOut.address == pool.token1.id) ||
        (tokenIn.address == pool.token1.id &&
          tokenOut.address == pool.token0.id)
      ) {
        const originalTokenIn = {
          name: pool.token0.symbol,
          address: pool.token0.id,
          logoURI: logoMap[pool.token0.id.toLowerCase()],
          symbol: pool.token0.symbol,
          decimals: pool.token0.decimals,
          userBalance: pool.token0.balance,
          callId: 0,
        };
        const originalTokenOut = {
          name: pool.token1.symbol,
          address: pool.token1.id,
          logoURI: logoMap[pool.token1.id.toLowerCase()],
          symbol: pool.token1.symbol,
          decimals: pool.token1.decimals,
          userBalance: pool.token1.balance,
          callId: 1,
        };
        setTokenIn(originalTokenOut, originalTokenIn, "0", true);
        setTokenOut(originalTokenIn, originalTokenOut, "0", false);
        setRangePoolFromFeeTier(
          originalTokenIn,
          originalTokenOut,
          feeAmount,
          limitSubgraph
        );
      } else {
        const pool = data["data"].limitPools[0];
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
        if (
          originalTokenIn.symbol == tokenIn.symbol &&
          originalTokenOut.symbol == tokenOut.symbol
        ) {
          setTokenIn(originalTokenOut, originalTokenIn, "0", true);
          setTokenOut(originalTokenIn, originalTokenOut, "0", false);
          setRangePoolFromFeeTier(
            originalTokenIn,
            originalTokenOut,
            parseInt(pool.feeTier.feeAmount),
            limitSubgraph
          );
        } else {
          setRangePoolFromFeeTier(tokenIn, tokenOut, "3000", limitSubgraph);
        }
      }
    }
  }

  //sames as updatePools but triggered from the html
  const handleManualFeeTierChange = async (feeAmount: number) => {
    updatePools(feeAmount);
    setRangePoolData({
      ...rangePoolData,
      feeTier: {
        ...rangePoolData.feeTier,
        feeAmount: feeAmount,
        tickSpacing: feeTierMap[feeAmount].tickSpacing,
      },
    });
  };

  //this sets the default position price range
  useEffect(() => {
    if (rangePoolData.poolPrice && rangePoolData.tickAtPrice) {
      const sqrtPrice = JSBI.BigInt(rangePoolData.poolPrice);
      const tickAtPrice = rangePoolData.tickAtPrice;
      if (rangePoolAddress != ZERO_ADDRESS && rangePrice == undefined) {
        setMinInput(
          invertPrice(
            TickMath.getPriceStringAtTick(
              priceOrder == (tokenIn.callId == 0)
                ? tickAtPrice - 7000
                : tickAtPrice - -7000,
              tokenIn,
              tokenOut
            ),
            priceOrder == (tokenIn.callId == 0)
          )
        );
        setMaxInput(
          invertPrice(
            TickMath.getPriceStringAtTick(
              priceOrder == (tokenIn.callId == 0)
                ? tickAtPrice - -7000
                : tickAtPrice - 7000,
              tokenIn,
              tokenOut
            ),
            priceOrder == (tokenIn.callId == 0)
          )
        );
      }
      setRangePrice(
        TickMath.getPriceStringAtSqrtPrice(sqrtPrice, tokenIn, tokenOut)
      );
      setRangeSqrtPrice(sqrtPrice);
    }
  }, [
    rangePoolData.feeTier,
    rangePoolData.poolPrice,
    rangePoolData.tickAtPrice,
  ]);

  ////////////////////////////////Allowances
  const { data: allowanceInRange, refetch: refetchAllowanceIn } =
    useContractRead({
      address: tokenIn.address,
      abi: erc20ABI,
      functionName: "allowance",
      args: [address, getRouterAddress(networkName)],
      chainId: chainId,
      watch: true,
      enabled: tokenIn.address != undefined,
      onSuccess(data) {
        //console.log("allowance in fetched", allowanceInRange?.toString());
        //setNeedsAllowanceIn(false);
      },
      onError(error) {
        console.log("Error allowance", error);
      },
    });

  const { data: allowanceOutRange, refetch: refetchAllowanceOut } =
    useContractRead({
      address: tokenOut.address,
      abi: erc20ABI,
      functionName: "allowance",
      args: [address, getRouterAddress(networkName)],
      chainId: chainId,
      watch: true,
      onSuccess(data) {
        //console.log("allowance out fetched", allowanceOutRange?.toString());
        //setNeedsAllowanceOut(false);
      },
      onError(error) {
        console.log("Error allowance", error);
      },
    });

  useEffect(() => {
    setTokenInAllowance(allowanceInRange);
    setTokenOutAllowance(allowanceOutRange);
  }, [allowanceInRange, allowanceOutRange]);

  ////////////////////////////////Token Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.native ? undefined : tokenIn.address,
    enabled: tokenIn.address != ZERO_ADDRESS,
    watch: true,
    chainId: chainId,
    onSuccess(data) {
      setNeedsBalanceIn(false);
      setTimeout(() => {
        setNeedsBalanceIn(true);
      }, 5000);
    },
  });

  const { data: tokenOutBal } = useBalance({
    address: address,
    token: tokenOut.native ? undefined : tokenOut.address,
    enabled: tokenOut.address != ZERO_ADDRESS,
    watch: true,
    chainId: chainId,
    onSuccess(data) {
      setNeedsBalanceOut(false);
      setTimeout(() => {
        setNeedsBalanceOut(true);
      }, 5000);
    },
    onError(err) {
      console.log("token out error", err);
    },
  });

  useEffect(() => {
    if (isConnected && tokenInBal) {
      setTokenInBalance(tokenInBal?.formatted.toString());
      if (pairSelected && tokenOutBal) {
        setTokenOutBalance(tokenOutBal?.formatted.toString());
      }
    }
  }, [tokenInBal, tokenOutBal]);

  ////////////////////////////////TokenUSDPrices

  useEffect(() => {
    if (rangePoolData.token0 && rangePoolData.token1) {
      if (tokenIn.address) {
        fetchRangeTokenUSDPrice(
          rangePoolData,
          tokenIn,
          setTokenInRangeUSDPrice
        );
      }
      if (tokenOut.address) {
        fetchRangeTokenUSDPrice(
          rangePoolData,
          tokenOut,
          setTokenOutRangeUSDPrice
        );
      }
    }
  }, [
    rangePoolData.token0,
    rangePoolData.token1,
    tokenIn.native,
    tokenOut.native,
  ]);

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
      tokenIn.callId == 0 ? token0Disabled : token1Disabled;
    const tokenOutDisabled =
      tokenOut.callId == 0 ? token0Disabled : token1Disabled;
    setAmountInDisabled(tokenInDisabled);
    setAmountOutDisabled(tokenOutDisabled);
    if (tokenInDisabled && rangeMintParams.tokenInAmount.gt(BN_ZERO)) {
      setDisplayIn("");
      setAmounts(true, BN_ZERO);
      setAmountInSetLast(true);
    } else if (tokenOutDisabled && rangeMintParams.tokenOutAmount.gt(BN_ZERO)) {
      setDisplayOut("");
      setAmounts(false, BN_ZERO);
      setAmountInSetLast(false);
    } else {
      setAmounts(
        amountInSetLast,
        amountInSetLast
          ? rangeMintParams.tokenInAmount
          : rangeMintParams.tokenOutAmount
      );
    }
  }, [lowerPrice, upperPrice, rangePrice]);

  const handleInputBox = (e) => {
    if (e.target.name === "tokenIn") {
      const [value, bnValue] = inputHandler(e, tokenIn);
      setDisplayIn(value);
      setAmounts(true, bnValue);
      setAmountInSetLast(true);
    } else if (e.target.name === "tokenOut") {
      const [value, bnValue] = inputHandler(e, tokenOut);
      setDisplayOut(value);
      setAmounts(false, bnValue);
      setAmountInSetLast(false);
    }
  };

  useEffect(() => {
    setAmounts(amountInSetLast, rangeMintParams.tokenInAmount);
  }, [tokenIn.callId]);

  const handleBalanceMax = (isTokenIn: boolean) => {
    const token = isTokenIn ? tokenIn : tokenOut;
    const value = token.userBalance.toString();
    const bnValue = parseUnits(value, token.decimals);
    isTokenIn ? setDisplayIn(value) : setDisplayOut(value);
    setAmounts(isTokenIn, bnValue);
    setAmountInSetLast(isTokenIn);
  };

  function setAmounts(amountInSet: boolean, amountSet: BigNumber) {
    try {
      const isToken0 = amountInSet ? tokenIn.callId == 0 : tokenOut.callId == 0;
      const inputBn = amountSet;
      const lower = TickMath.getTickAtPriceString(
        lowerPrice,
        tokenIn,
        tokenOut,
        parseInt(rangePoolData.feeTier?.tickSpacing ?? "100")
      );
      const upper = TickMath.getTickAtPriceString(
        upperPrice,
        tokenIn,
        tokenOut,
        parseInt(rangePoolData.feeTier?.tickSpacing ?? "100")
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
            isToken0 ? inputBn : BN_ZERO
          );
        } else if (JSBI.lessThan(rangeSqrtPrice, lowerSqrtPrice)) {
          // only token0 input allowed
          if (isToken0) {
            liquidity = DyDxMath.getLiquidityForAmounts(
              lowerSqrtPrice,
              upperSqrtPrice,
              rangeSqrtPrice,
              BN_ZERO,
              inputBn
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
              BN_ZERO
            );
          } else {
            // warn the user the input is invalid
          }
        }
        setLiquidityAmount(liquidity);
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
          setTokenInAmount(inputBn);
          setTokenOutAmount(outputBn);
          const displayValue = parseFloat(
            ethers.utils.formatUnits(outputBn, tokenOut.decimals)
          ).toPrecision(6);
          setDisplayOut(parseFloat(displayValue) > 0 ? displayValue : "");
        } else {
          setTokenInAmount(outputBn);
          setTokenOutAmount(inputBn);
          const displayValue = parseFloat(
            ethers.utils.formatUnits(outputBn, tokenIn.decimals)
          ).toPrecision(6);
          setDisplayIn(parseFloat(displayValue) > 0 ? displayValue : "");
        }
      } else {
        setTokenInAmount(BN_ZERO);
        setTokenOutAmount(BN_ZERO);
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
    setPriceOrder(!priceOrder);
    setMaxInput(invertPrice(minInput, false));
    setMinInput(invertPrice(maxInput, false));
    if (rangePoolAddress == ZERO_ADDRESS) {
      setStartPrice(invertPrice(startPrice, false));
    }
  };

  useEffect(() => {
    if (
      !isNaN(parseFloat(minInput)) &&
      !isNaN(parseFloat(maxInput)) &&
      !isNaN(parseFloat(rangePoolData.feeTier?.tickSpacing))
    ) {
      const priceLower = invertPrice(
        roundPrice(
          priceOrder ? minInput : maxInput,
          tokenIn,
          tokenOut,
          rangePoolData.feeTier?.tickSpacing ?? 30
        ),
        priceOrder
      );
      const priceUpper = invertPrice(
        roundPrice(
          priceOrder ? maxInput : minInput,
          tokenIn,
          tokenOut,
          rangePoolData.feeTier?.tickSpacing ?? 30
        ),
        priceOrder
      );
      setLowerPrice(priceLower);
      setUpperPrice(priceUpper);
      setRangePositionData({
        ...rangePositionData,
        lowerPrice: priceLower,
        upperPrice: priceUpper,
      });
    }
  }, [maxInput, minInput, rangePoolData.feeTier?.tickSpacing]);

  useEffect(() => {
    if (
      rangePoolAddress == ZERO_ADDRESS &&
      startPrice &&
      !isNaN(parseFloat(startPrice))
    ) {
      setRangePoolData({
        poolPrice: String(
          TickMath.getSqrtPriceAtPriceString(
            invertPrice(startPrice, priceOrder),
            tokenIn,
            tokenOut
          )
        ),
        tickAtPrice: TickMath.getTickAtPriceString(
          invertPrice(startPrice, priceOrder),
          tokenIn,
          tokenOut
        ),
        feeTier: rangePoolData.feeTier,
      });
    }
  }, [rangePoolAddress, startPrice]);

  ////////////////////////////////Mint Button State

  // set amount in

  useEffect(() => {
    setMintButtonState();
  }, [
    tokenIn,
    tokenOut,
    rangeMintParams.tokenInAmount,
    rangeMintParams.tokenOutAmount,
  ]);

  ////////////////////////////////

  const [rangeWarning, setRangeWarning] = useState(false);

  useEffect(() => {
    const priceLower = parseFloat(lowerPrice);
    const priceUpper = parseFloat(upperPrice);
    const priceRange = parseFloat(rangePrice);
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
            <div className="flex  items-center gap-x-2 bg-dark border border-grey py-2 px-5 rounded-[4px]">
              <div className="flex items-center">
                <img
                  className="md:w-6 w-6"
                  src={logoMap[tokenIn.address.toLowerCase()]}
                />
                <img
                  className="md:w-6 w-6 -ml-2"
                  src={logoMap[tokenOut.address.toLowerCase()]}
                />
              </div>
              <span className="text-white text-xs">
                {tokenIn.callId == 0 ? tokenIn.symbol : tokenOut.symbol} -{" "}
                {tokenIn.callId == 0 ? tokenOut.symbol : tokenIn.symbol}
              </span>
              <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                {(
                  (!isNaN(rangePoolData.feeTier?.feeAmount)
                    ? rangePoolData.feeTier?.feeAmount
                    : 0) / 10000
                ).toFixed(2)}
                %
              </span>
            </div>
          </div>
        </div>
        <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
          <h1 className="mb-4">ADD LIQUIDITY</h1>
          <div className="border border-grey bg-black rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>
                ~$
                {!isNaN(tokenIn.USDPrice)
                  ? (
                      tokenIn.USDPrice *
                      Number(
                        ethers.utils.formatUnits(
                          rangeMintParams.tokenInAmount,
                          tokenIn.decimals
                        )
                      )
                    ).toFixed(2)
                  : "?.??"}
              </span>
              <BalanceDisplay token={tokenIn}></BalanceDisplay>
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              {inputBoxIn(
                "0",
                tokenIn,
                "tokenIn",
                handleInputBox,
                amountInDisabled
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
                  <SelectToken
                    index="0"
                    key="in"
                    type="in"
                    tokenIn={tokenIn}
                    setTokenIn={setTokenIn}
                    tokenOut={tokenOut}
                    setTokenOut={setTokenOut}
                    displayToken={tokenIn}
                    amount={amountInSetLast ? displayIn : displayOut}
                    isAmountIn={amountInSetLast}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-grey bg-black rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>
                ~$
                {!isNaN(tokenOut.USDPrice)
                  ? (
                      Number(tokenOut.USDPrice) *
                      Number(
                        ethers.utils.formatUnits(
                          rangeMintParams.tokenOutAmount,
                          tokenOut.decimals
                        )
                      )
                    ).toFixed(2)
                  : "?.??"}
              </span>
              <BalanceDisplay token={tokenOut}></BalanceDisplay>
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              {inputBoxOut(
                "0",
                tokenOut,
                "tokenOut",
                handleInputBox,
                amountOutDisabled
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
                  <SelectToken
                    key={"out"}
                    type="out"
                    tokenIn={tokenIn}
                    setTokenIn={setTokenIn}
                    tokenOut={tokenOut}
                    setTokenOut={setTokenOut}
                    setPairSelected={setPairSelected}
                    displayToken={tokenOut}
                    amount={amountInSetLast ? displayIn : displayOut}
                    isAmountIn={amountInSetLast}
                  />
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
                        parseInt(rangePoolData.feeTier?.tickSpacing ?? 30)
                      ),
                      tokenIn,
                      tokenOut
                    )
                  );
                  setMaxInput(
                    TickMath.getPriceStringAtTick(
                      roundTick(
                        887272,
                        parseInt(rangePoolData.feeTier?.tickSpacing ?? 30)
                      ),
                      tokenIn,
                      tokenOut
                    )
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
                {priceOrder == (tokenIn.callId == 0) ? (
                  <>{tokenOut.symbol}</>
                ) : (
                  <>{tokenIn.symbol}</>
                )}{" "}
                per{" "}
                {priceOrder == (tokenIn.callId == 0) ? (
                  <>{tokenIn.symbol}</>
                ) : (
                  <>{tokenOut.symbol}</>
                )}
              </span>{" "}
              <DoubleArrowIcon />
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="flex md:flex-row flex-col items-center gap-5 mt-3">
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
                      onChange={(e) => setMinInput(inputFilter(e.target.value))}
                    />
                  }
                </span>
              </div>
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
                      onChange={(e) => setMaxInput(inputFilter(e.target.value))}
                    />
                  }
                </span>
              </div>
            </div>
            {rangePoolAddress == ZERO_ADDRESS &&
              rangePoolData.feeTier != undefined && (
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
                          setStartPrice(inputFilter(e.target.value));
                        }}
                      />
                    </span>
                  </div>
                </div>
              )}
            <div className="mb-2 mt-3 flex-col flex gap-y-8">
              <div className="flex items-center justify-between w-full text-xs  text-[#C9C9C9]">
                <div className="text-xs text-[#4C4C4C]">Market Price</div>
                <div className="uppercase">
                  1{" "}
                  {
                    (priceOrder == (tokenIn.callId == 0) ? tokenIn : tokenOut)
                      .symbol
                  }{" "}
                  ={" "}
                  {!isNaN(parseFloat(rangePrice))
                    ? parseFloat(
                        invertPrice(rangePrice, priceOrder)
                      ).toPrecision(5) +
                      " " +
                      (priceOrder == (tokenIn.callId == 0) ? tokenOut : tokenIn)
                        .symbol
                    : "?" + " " + tokenOut.symbol}
                </div>
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

              {(rangeMintParams.tokenInAmount?.gt(BN_ZERO) ||
                rangeMintParams.tokenOutAmount?.gt(BN_ZERO)) &&
              JSBI.lessThanOrEqual(rangeMintParams.liquidityAmount, ONE) ? (
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
                  rangePoolData.feeTier?.feeAmount.toString() ===
                  feeTier.tierId.toString()
                    ? "border-grey1 border bg-grey/20"
                    : "border border-grey"
                }`}
              >
                <h1>{feeTier.tier} FEE</h1>
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
                checked={rangeMintParams.stakeFlag}
                onChange={() => {
                  setStakeFlag(!rangeMintParams.stakeFlag);
                }}
                className="cursor-pointer"
              />{" "}
              STAKE RANGE POSITION
            </label>
            <span className="text-green-500/40 underline text-sm hidden">
              How does it work?
            </span>
          </div>
        </div>
        <div className="bg-dark mt-8"></div>
        {isConnected ? <RangePoolPreview /> : <ConnectWalletButton xl={true} />}
      </div>
    </div>
  );
}
