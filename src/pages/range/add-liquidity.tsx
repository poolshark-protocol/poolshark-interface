import { useEffect, useState } from "react";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { TickMath, invertPrice, roundTick } from "../../utils/math/tickMath";
import JSBI from "jsbi";
import useInputBox from "../../hooks/useInputBox";
import {
  erc20ABI,
  useAccount,
  useBalance,
  useContractRead,
  useProvider,
} from "wagmi";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO, ZERO } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import inputFilter from "../../utils/inputFilter";
import { fetchRangeTokenUSDPrice } from "../../utils/tokens";
import { feeTiers } from "../../utils/pools";
import Navbar from "../../components/Navbar";
import RangePoolPreview from "../../components/Range/RangePoolPreview";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import { chainProperties } from "../../utils/chains";
import router from "next/router";
import { inputHandler } from "../../utils/math/valueMath";

export default function AddLiquidity({}) {
  const [
    rangePoolAddress,
    rangePoolData,
    rangePositionData,
    rangeMintParams,
    setRangePositionData,
    tokenIn,
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
    pairSelected,
    setMintButtonState,
    setRangePoolFromFeeTier,
    needsAllowanceIn,
    needsBalanceIn,
    needsAllowanceOut,
    needsBalanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
  ] = useRangeLimitStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangePositionData,
    state.rangeMintParams,
    state.setRangePositionData,
    state.tokenIn,
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
    state.pairSelected,
    state.setMintButtonState,
    state.setRangePoolFromFeeTier,
    state.needsAllowanceIn,
    state.needsBalanceIn,
    state.needsAllowanceOut,
    state.needsBalanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
  ]);

  const { address, isConnected } = useAccount();

  const {
    network: { chainId },
  } = useProvider();

  const { inputBox, maxBalance, setDisplay } = useInputBox();
  const { maxBalance: maxBalance2, inputBox: inputBox2, setDisplay: setDisplay2 } = useInputBox();
  const [showTooltip, setShowTooltip] = useState(false);
  const [amountInSetLast, setAmountInSetLast] = useState(true)

  ////////////////////////////////TokenOrder
  const [tokenOrder, setTokenOrder] = useState(true);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setTokenOrder(tokenIn.callId == 0);
    }
  }, [tokenIn]);

  ////////////////////////////////Pools

  /* useEffect(() => {
    updatePoolsFromStore();
  }, [tokenIn, tokenOut]);

  async function updatePoolsFromStore() {
    setRangePoolFromFeeTier(tokenIn, tokenOut, feeTierId);
  } */

  //sames as updatePools but triggered from the html
  /* const handleManualVolatilityChange = async (volatility: any) => {
    setRangePoolFromFeeTier(tokenIn, tokenOut, volatility);
    setSelectedFeeTier(volatility);
  }; */

  useEffect(() => {
    if (
      !rangePoolData.poolPrice ||
      Number(rangePoolData.feeTier.feeAmount) != Number(router.query.feeTier)
    ) {
      setRangePoolFromFeeTier(tokenIn, tokenOut, router.query.feeTier);
    }
  }, [router.query.feeTier, rangePoolData]);

  //this sets the default position price delta
  useEffect(() => {
    if (!rangeSqrtPrice && rangePoolData.poolPrice && rangePoolData.tickAtPrice) {
      const price = JSBI.BigInt(rangePoolData.poolPrice);
      const tickAtPrice = rangePoolData.tickAtPrice;
      setRangePrice(TickMath.getPriceStringAtSqrtPrice(price));
      setRangeSqrtPrice(price);
      setMinInput(TickMath.getPriceStringAtTick(tickAtPrice - 7000));
      setMaxInput(TickMath.getPriceStringAtTick(tickAtPrice - -7000));
    }
  }, [rangePoolData]);

  ////////////////////////////////Allowances
  const { data: allowanceInRange } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties["arbitrumGoerli"]["routerAddress"]],
    chainId: 421613,
    watch: needsAllowanceIn,
    enabled: tokenIn.address != undefined,
    onSuccess(data) {
      //setNeedsAllowanceIn(false);
    },
    onError(error) {
      console.log("Error allowance", error);
    },
  });

  const { data: allowanceOutRange } = useContractRead({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties["arbitrumGoerli"]["routerAddress"]],
    chainId: 421613,
    watch: needsAllowanceOut,
    enabled: tokenOut.address != undefined,
    onSuccess(data) {
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
    token: tokenIn.address,
    enabled: tokenIn.address != undefined && needsBalanceIn,
    watch: needsBalanceIn,
    onSuccess(data) {
      setNeedsBalanceIn(false);
    },
  });

  const { data: tokenOutBal } = useBalance({
    address: address,
    token: tokenOut.address,
    enabled: tokenOut.address != undefined && needsBalanceOut,
    watch: needsBalanceOut,
    onSuccess(data) {
      setNeedsBalanceOut(false);
    },
  });

  useEffect(() => {
    if (isConnected) {
      setTokenInBalance(
        parseFloat(tokenInBal?.formatted.toString()).toFixed(2)
      );
      if (pairSelected) {
        setTokenOutBalance(
          parseFloat(tokenOutBal?.formatted.toString()).toFixed(2)
        );
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
  }, [rangePoolData]);

  ////////////////////////////////Prices and Ticks
  const [rangePrice, setRangePrice] = useState(undefined);
  const [rangeSqrtPrice, setRangeSqrtPrice] = useState(undefined);

  //Prices for calculations
  const [lowerPrice, setLowerPrice] = useState("0");
  const [upperPrice, setUpperPrice] = useState("0");

  useEffect(() => {
    setRangePositionData({
      ...rangePositionData,
      lowerPrice: lowerPrice,
      upperPrice: upperPrice,
    });
    setAmounts(
      amountInSetLast,
      amountInSetLast ? rangeMintParams.tokenInAmount
                      : rangeMintParams.tokenOutAmount
    )
  }, [lowerPrice, upperPrice]);

  const handleInput1 = (e) => {
    const [name, value, bnValue] = inputHandler(e)
    if (name === "tokenIn") {
      setDisplay(value)
      setAmounts(true, bnValue)
      setAmountInSetLast(true)
    } else if (name === "tokenOut") {
      setDisplay2(value)
      setAmounts(false, bnValue)
      setAmountInSetLast(false)
    }
  };

  function setAmounts(amountInSet: boolean, amountSet: BigNumber) {
    try {
        const isToken0 = amountInSet ? tokenIn.callId == 0
                                     : tokenOut.callId == 0
        console.log('token 0 bool', isToken0)
        const inputBn = amountSet
        const lower = TickMath.getTickAtPriceString(
          lowerPrice,
          parseInt(rangePoolData.feeTier.tickSpacing)
        );
        const upper = TickMath.getTickAtPriceString(
          upperPrice,
          parseInt(rangePoolData.feeTier.tickSpacing)
        );
        const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(lower);
        const upperSqrtPrice = TickMath.getSqrtRatioAtTick(upper);
        if (amountSet.gt(BN_ZERO)) {
          let liquidity = ZERO;
          if(JSBI.greaterThanOrEqual(rangeSqrtPrice, lowerSqrtPrice) &&
             JSBI.lessThan(rangeSqrtPrice, upperSqrtPrice)) {
              liquidity = DyDxMath.getLiquidityForAmounts(
                isToken0 ? rangeSqrtPrice : lowerSqrtPrice,
                isToken0 ? upperSqrtPrice : rangeSqrtPrice,
                rangeSqrtPrice,
                isToken0 ? BN_ZERO : inputBn,
                isToken0 ? inputBn : BN_ZERO
              )
          } else if (JSBI.lessThan(rangeSqrtPrice, lowerSqrtPrice)) {
              // only token0 input allowed
              if (isToken0) {
                liquidity = DyDxMath.getLiquidityForAmounts(
                  lowerSqrtPrice,
                  upperSqrtPrice,
                  rangeSqrtPrice,
                  BN_ZERO,
                  inputBn
                )
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
                )
              } else {
                // warn the user the input is invalid
              }
          }
          const outputJsbi = JSBI.greaterThan(liquidity, ZERO)
            ? isToken0
              ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
              : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
            : ZERO;
          const outputBn = BigNumber.from(String(outputJsbi))
          // set amount based on bnInput
          if (amountInSet) {
            setTokenInAmount(inputBn);
            setTokenOutAmount(outputBn);
            const displayValue = parseFloat(ethers.utils.formatUnits(outputBn, tokenOut.decimals)).toPrecision(6)
            setDisplay2(parseFloat(displayValue) > 0 ? displayValue : '')
          } else {
            setTokenInAmount(BigNumber.from(String(outputJsbi)));
            setTokenOutAmount(inputBn);
            setDisplay(parseFloat(ethers.utils.formatUnits(outputBn, tokenIn.decimals)).toPrecision(6))
          }
        } else {
          setTokenInAmount(BN_ZERO);
          setTokenOutAmount(BN_ZERO);
          if (amountInSet) {
            setDisplay2('')
          } else {
            setDisplay('')
          }
        }
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////Gas Fee

  //set lower and upper price
  /* const changePrice = (direction: string, inputId: string) => {
    if (!rangePoolData.feeTier.tickSpacing) return;
    const currentTick =
      inputId == "minInput"
        ? TickMath.getTickAtPriceString(rangePositionData.lowerPrice)
        : TickMath.getTickAtPriceString(rangePositionData.upperPrice);
    const increment = parseInt(rangePoolData.feeTier.tickSpacing);
    const adjustment =
      direction == "plus" || direction == "minus"
        ? direction == "plus"
          ? -increment
          : increment
        : 0;
    const newTick = roundTick(currentTick - adjustment, increment);
    const newPriceString = TickMath.getPriceStringAtTick(
      parseFloat(newTick.toString())
    );
    (document.getElementById(inputId) as HTMLInputElement).value =
      parseFloat(newPriceString).toFixed(6);
    if (inputId === "minInput") {
      setLowerPrice(newPriceString);
    }
    if (inputId === "maxInput") {
      setUpperPrice(newPriceString);
    }
  }; */

  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  const handlePriceSwitch = () => {
    setTokenOrder(!tokenOrder);
    setMaxInput(invertPrice(maxInput, false));
    setMinInput(invertPrice(minInput, false));
  };

  useEffect(() => {
    setUpperPrice(invertPrice(maxInput, tokenOrder));
    setLowerPrice(invertPrice(minInput, tokenOrder));
  }, [maxInput, minInput]);

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
    if ( tokenOrder ?
      (Number(minInput) > Number(rangePrice) ||
      Number(maxInput) < Number(rangePrice)) : (
        Number(minInput) < Number(invertPrice(rangePrice, tokenOrder)) ||
      Number(maxInput) > Number(invertPrice(rangePrice, tokenOrder)))
      )
     {
      setRangeWarning(true);
    } else {
      setRangeWarning(false)
    }
  }, [minInput, rangePrice, maxInput]);
  

  ////////////////////////////////

  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="text-white flex flex-col mx-auto max-w-2xl  justify-center pt-10 px-3 md:px-0 pb-32 md:pb-0">
        <div className="flex md:flex-row flex-col md:items-center items-start gap-y-4 justify-between">
          <h1 className="uppercase">RANGE POOL</h1>
          <div>
            <div className="flex  items-center gap-x-2 bg-dark border border-grey py-2 px-5 rounded-[4px]">
              <div className="flex items-center">
                <img className="md:w-6 w-6" src={tokenIn?.logoURI} />
                <img className="md:w-6 w-6 -ml-2" src={tokenOut?.logoURI} />
              </div>
              <span className="text-white text-xs">
                {tokenOrder ? tokenOut.symbol : tokenIn.symbol} -{" "}
                {tokenOrder ? tokenIn.symbol : tokenOut.symbol}
              </span>
              <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                {(rangePoolData?.feeTier?.feeAmount / 10000).toFixed(2)}%
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
                {(
                  tokenIn.rangeUSDPrice *
                  Number(ethers.utils.formatUnits(rangeMintParams.tokenInAmount, tokenIn.decimals))
                ).toFixed(2)}
              </span>
              <span>BALANCE: {tokenIn.userBalance ?? 0}</span>
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              {inputBox("0", "tokenIn", handleInput1)}
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() =>
                    maxBalance(tokenIn.userBalance.toString(), "0")
                  }
                  className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border md:block hidden"
                >
                  MAX
                </button>
                <button className="flex w-full items-center gap-x-3 bg-black border border-grey md:px-4 px-2 py-1.5 rounded-[4px]">
                  <div className="flex md:text-base text-sm items-center gap-x-2 w-full">
                    <img className="md:w-7 w-6" src={tokenIn.logoURI} />
                    {tokenIn.symbol}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="border border-grey bg-black rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>
                ~$
                {(
                  Number(tokenOut.rangeUSDPrice) *
                  Number(
                    ethers.utils.formatUnits(rangeMintParams.tokenOutAmount, 18)
                  )
                ).toFixed(2)}
              </span>
              <span>BALANCE: {tokenOut.userBalance ?? 0}</span>
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              {inputBox2("0", "tokenOut", handleInput1)}
              <div className="flex items-center gap-x-2 ">
                <button className="flex w-full items-center gap-x-3 bg-black border border-grey md:px-4 px-2 py-1.5 rounded-[4px]">
                  <div className="flex md:text-base text-sm items-center gap-x-2 w-full">
                    <img className="md:w-7 w-6" src={tokenOut.logoURI} />
                    {tokenOut.symbol}
                  </div>
                </button>
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
                        parseInt(rangePoolData.feeTier.tickSpacing)
                      )
                    )
                  );
                  setMaxInput(
                    TickMath.getPriceStringAtTick(
                      roundTick(
                        887272,
                        parseInt(rangePoolData.feeTier.tickSpacing)
                      )
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
              <span className="whitespace-nowrap">{tokenOrder ? <>{tokenIn.symbol}</> : <>{tokenOut.symbol}</>} per{" "}
              {tokenOrder ? <>{tokenOut.symbol}</> : <>{tokenIn.symbol}</>}</span>{" "}
              <DoubleArrowIcon />
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="flex md:flex-row flex-col items-center gap-5 mt-3">
              <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                <span className="text-grey1 text-xs">MIN. PRICE</span>
                <span className="text-white text-3xl">
                  {tokenOrder ? (
                    <input
                      autoComplete="off"
                      className="bg-black py-2 outline-none text-center w-full"
                      placeholder="0"
                      id="minInput"
                      type="text"
                      value={minInput}
                      onChange={(e) => setMinInput(inputFilter(e.target.value))}
                    />
                  ) : (
                    <input
                      autoComplete="off"
                      className="bg-black py-2 outline-none text-center w-full"
                      placeholder="0"
                      id="minInput"
                      type="text"
                      value={maxInput}
                      onChange={(e) => setMaxInput(inputFilter(e.target.value))}
                    />
                  )}
                </span>
              </div>
              <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                <span className="text-grey1 text-xs">MAX. PRICE</span>
                <span className="text-white text-3xl">
                  {tokenOrder ? (
                    <input
                      autoComplete="off"
                      className="bg-black py-2 outline-none text-center w-full"
                      placeholder="0"
                      id="minInput"
                      type="text"
                      value={maxInput}
                      onChange={(e) => setMaxInput(inputFilter(e.target.value))}
                    />
                  ) : (
                    <input
                      autoComplete="off"
                      className="bg-black py-2 outline-none text-center w-full"
                      placeholder="0"
                      id="minInput"
                      type="text"
                      value={minInput}
                      onChange={(e) => setMinInput(inputFilter(e.target.value))}
                    />
                  )}
                </span>
              </div>
            </div>
            <div className="mb-8 flex-col flex gap-y-8">
              <div className="flex items-center justify-between w-full text-xs  text-[#C9C9C9]">
                <div className="text-xs text-[#4C4C4C]">Market Price</div>
                <div className="uppercase">
                  1 {tokenIn.symbol} ={" "}
                  {!isNaN(parseFloat(rangePrice))
                    ? parseFloat(
                        invertPrice(rangePrice, tokenOrder)
                      ).toPrecision(5) +
                      " " +
                      tokenOut.symbol
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
                      fill-rule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Your position will not earn fees or be used in trades until the
                  market price moves into your range.
                </div>
              )}
            </div>
          </div>
          <RangePoolPreview />
        </div>
      </div>
    </div>
  );
}
