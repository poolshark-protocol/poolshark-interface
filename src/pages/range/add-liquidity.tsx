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

  const { bnInput, inputBox, maxBalance } = useInputBox();

  const [showTooltip, setShowTooltip] = useState(false);

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
    if (!rangePoolData.poolPrice) {
      setRangePoolFromFeeTier(tokenIn, tokenOut, router.query.feeTier);
    }
  }, [router.query.feeTier]);

  //this sets the default position price delta
  useEffect(() => {
    if (rangePoolData.poolPrice && rangePoolData.tickAtPrice) {
      const price = JSBI.BigInt(rangePoolData.poolPrice);
      const tickAtPrice = rangePoolData.tickAtPrice;
      setRangePrice(TickMath.getPriceStringAtSqrtPrice(price));
      setRangeSqrtPrice(price);
      const positionData = rangePositionData;
      if (isNaN(parseFloat(minInput)) || parseFloat(minInput) <= 0) {
        setMinInput(TickMath.getPriceStringAtTick(tickAtPrice - 7000));
      }
      if (isNaN(parseFloat(maxInput)) || parseFloat(maxInput) <= 0) {
        setMaxInput(TickMath.getPriceStringAtTick(tickAtPrice - -7000));
      }
      setRangePositionData(positionData);
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
  }, [lowerPrice, upperPrice]);

  useEffect(() => {
    if (
      rangePositionData.lowerPrice &&
      rangePositionData.upperPrice &&
      rangePoolData.feeTier
    ) {
      tokenOutAmountMath();
    }
  }, [bnInput, rangePoolAddress, tokenOrder]);

  function tokenOutAmountMath() {
    try {
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
      const liquidity =
        parseFloat(rangePrice) >= parseFloat(lowerPrice) &&
        parseFloat(rangePrice) <= parseFloat(upperPrice)
          ? DyDxMath.getLiquidityForAmounts(
              tokenOrder ? rangeSqrtPrice : lowerSqrtPrice,
              tokenOrder ? upperSqrtPrice : rangeSqrtPrice,
              rangeSqrtPrice,
              tokenOrder ? BN_ZERO : bnInput,
              tokenOrder ? bnInput : BN_ZERO
            )
          : DyDxMath.getLiquidityForAmounts(
              lowerSqrtPrice,
              upperSqrtPrice,
              rangeSqrtPrice,
              tokenOrder ? BN_ZERO : bnInput,
              tokenOrder ? bnInput : BN_ZERO
            );
      const tokenOutAmount = JSBI.greaterThan(liquidity, ZERO)
        ? tokenOrder
          ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
          : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
        : ZERO;
      setTokenInAmount(bnInput);
      setTokenOutAmount(BigNumber.from(String(tokenOutAmount)));
    } catch (error) {
      console.log(error);
      setTokenOutAmount(BigNumber.from("0"));
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
    if (!bnInput.eq(BN_ZERO)) {
      setTokenInAmount(bnInput);
    }
  }, [bnInput]);

  useEffect(() => {
    setMintButtonState();
  }, [
    tokenIn,
    tokenOut,
    rangeMintParams.tokenInAmount,
    rangeMintParams.tokenOutAmount,
  ]);

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
                  Number(ethers.utils.formatUnits(bnInput, tokenIn.decimals))
                ).toFixed(2)}
              </span>
              <span>BALANCE: {tokenIn.userBalance ?? 0}</span>
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              {inputBox("0")}
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
              {Number(rangeMintParams.tokenOutAmount) != 0
                ? Number(
                    ethers.utils.formatUnits(
                      rangeMintParams.tokenOutAmount,
                      tokenIn.decimals
                    )
                  ).toPrecision(5)
                : 0}
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
          <div className="flex justify-between items-center mb-4 mt-10">
            <div className="flex items-center gap-x-3">
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
              {tokenOrder ? <>{tokenIn.symbol}</> : <>{tokenOut.symbol}</>} per{" "}
              {tokenOrder ? <>{tokenOut.symbol}</> : <>{tokenIn.symbol}</>}{" "}
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
            <div className="flex items-center justify-between w-full text-xs  text-[#C9C9C9] mb-8">
              <div className="text-xs text-[#4C4C4C]">Market Price</div>
              <div className="uppercase">
                1 {tokenIn.symbol} ={" "}
                {!isNaN(parseFloat(rangePrice))
                  ? parseFloat(invertPrice(rangePrice, tokenOrder)).toPrecision(
                      5
                    ) +
                    " " +
                    tokenOut.symbol
                  : "?" + " " + tokenOut.symbol}
              </div>
            </div>
          </div>
          <RangePoolPreview />
        </div>
      </div>
    </div>
  );
}
