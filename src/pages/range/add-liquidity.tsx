import { Fragment, useEffect, useState } from "react";
import {
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { Listbox, Transition } from "@headlessui/react";
import { useRangeStore } from "../../hooks/useRangeStore";
import { TickMath, invertPrice, roundTick } from "../../utils/math/tickMath";
import JSBI from "jsbi";
import useInputBox from "../../hooks/useInputBox";
import { useAccount, useBalance } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO, ZERO } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import inputFilter from "../../utils/inputFilter";
import { fetchRangeTokenUSDPrice } from "../../utils/tokens";
import { feeTiers, getRangePool } from "../../utils/pools";
import Navbar from "../../components/Navbar";
import RangePoolPreview from "../../components/Range/RangePoolPreview";
import { logoMap } from "../../utils/tokens";

export default function AddLiquidity({}) {
  const [
    rangePoolAddress,
    rangePoolData,
    rangePositionData,
    rangeMintParams,
    feeTierId,
    setRangePositionData,
    tokenIn,
    setTokenIn,
    setTokenInAmount,
    setTokenInRangeUSDPrice,
    setTokenInBalance,
    tokenOut,
    setTokenOut,
    setTokenOutAmount,
    setTokenOutRangeUSDPrice,
    setTokenOutBalance,
    pairSelected,
    switchDirection,
    setMintButtonState,
    setRangePoolFromVolatility,
    needsBalanceIn,
    needsBalanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
  ] = useRangeStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangePositionData,
    state.rangeMintParams,
    state.feeTierId,
    state.setRangePositionData,
    state.tokenIn,
    state.setTokenIn,
    state.setTokenInAmount,
    state.setTokenInRangeUSDPrice,
    state.setTokenInBalance,
    state.tokenOut,
    state.setTokenOut,
    state.setTokenOutAmount,
    state.setTokenOutRangeUSDPrice,
    state.setTokenOutBalance,
    state.pairSelected,
    state.switchDirection,
    state.setMintButtonState,
    state.setRangePoolFromVolatility,
    state.needsBalanceIn,
    state.needsBalanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
  ]);

  const { address, isConnected } = useAccount();

  const { bnInput, inputBox, maxBalance } = useInputBox();

  const [hasSelected, setHasSelected] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  ////////////////////////////////TokenOrder
  const [tokenOrder, setTokenOrder] = useState(true);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setTokenOrder(tokenIn.callId == 0);
    }
  }, [tokenIn]);

  ////////////////////////////////Pools
  //initial volatility Tier set to 1.7% when selected from list of range pools
  const [selectedFeeTier, setSelectedFeeTier] = useState(
    feeTiers[feeTierId ?? 0]
  );

  useEffect(() => {
    updatePoolsFromStore();
    setTokenInAmount(BN_ZERO);
    setTokenOutAmount(BN_ZERO);
  }, [tokenIn, tokenOut, feeTierId]);

  async function updatePoolsFromStore() {
    setRangePoolFromVolatility(tokenIn, tokenOut, feeTierId);
    setSelectedFeeTier(feeTiers[feeTierId]);
  }

  //sames as updatePools but triggered from the html
  const handleManualVolatilityChange = async (volatility: any) => {
    setRangePoolFromVolatility(tokenIn, tokenOut, volatility);
    setSelectedFeeTier(volatility);
  };

  //this sets the default position price delta
  useEffect(() => {
    if (rangePoolData.poolPrice && rangePoolData.tickAtPrice) {
      const price = JSBI.BigInt(rangePoolData.poolPrice);
      const tickAtPrice = rangePoolData.tickAtPrice;
      setRangePrice(TickMath.getPriceStringAtSqrtPrice(price));
      setRangeSqrtPrice(price);
      const positionData = rangePositionData;
      if (isNaN(parseFloat(lowerPrice)) || parseFloat(lowerPrice) <= 0) {
        setLowerPrice(TickMath.getPriceStringAtTick(tickAtPrice - 7000));
      }
      if (isNaN(parseFloat(upperPrice)) || parseFloat(upperPrice) <= 0) {
        setUpperPrice(TickMath.getPriceStringAtTick(tickAtPrice - -7000));
      }
      setRangeTickPrice(tickAtPrice);
      setRangePositionData(positionData);
    }
  }, [rangePoolData]);

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
  const [rangeTickPrice, setRangeTickPrice] = useState(undefined);
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
    }
  }

  ////////////////////////////////Gas Fee

  //set lower and upper price
  const changePrice = (direction: string, inputId: string) => {
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
  };

  useEffect(() => {
    setMintButtonState();
  }, [rangeMintParams.tokenInAmount, rangeMintParams.tokenOutAmount]);

  
  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="text-white flex flex-col mx-auto max-w-2xl  justify-center pt-10 px-3 md:px-0 pb-32 md:pb-0">
        <div className="flex md:flex-row flex-col md:items-center items-start gap-y-4 justify-between">
          <h1 className="uppercase">RANGE POOL</h1>
          <div>
            <div className="flex  items-center gap-x-2 bg-dark border border-grey py-2 px-5 rounded-[4px]">
                <div className="flex items-center">
                <img className="md:w-6 w-6" src={tokenIn?.logoURI}/>
            <img className="md:w-6 w-6 -ml-2" src={tokenOut?.logoURI}/>
                </div>
            
            <span className="text-white text-xs">
            {tokenOrder ? tokenOut.symbol : tokenIn.symbol} - {tokenOrder ? tokenIn.symbol : tokenOut.symbol}
            </span>
            <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
            {selectedFeeTier.tier}
            </span>
            </div>
          </div>
        </div>
        <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
        <h1 className="mb-4">ADD LIQUIDITY</h1>
        <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
          <div className="flex items-end justify-between text-[11px] text-grey1">
            <span>
            ~$
                      {(
                        tokenIn.rangeUSDPrice *
                        Number(
                          ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                        )
                      ).toFixed(2)}
            </span>
            <span>BALANCE: {tokenIn.userBalance ?? 0}</span>
          </div>
          <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
            {inputBox("0")}
            <div className="flex items-center gap-x-2 w-full">
            <button
                      onClick={() => maxBalance(tokenIn.userBalance, "0")}
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
                        ethers.utils.formatUnits(
                          rangeMintParams.tokenOutAmount,
                          18
                        )
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
        <h1 className="mb-4 mt-10">SET A PRICE RANGE</h1>
        <div className="flex flex-col gap-y-4">
          <div className="flex md:flex-row flex-col items-center gap-5 mt-3">
            <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
              <span className="text-grey1 text-xs">MIN. PRICE</span>
              <span className="text-white text-3xl">
                <input
                  autoComplete="off"
                  className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                  placeholder="0"
                  id="minInput"
                  type="text"
                  value={lowerPrice}
                  onChange={() =>
                    setLowerPrice(
                      inputFilter(
                        (
                          document.getElementById(
                            "minInput"
                          ) as HTMLInputElement
                        )?.value
                      )
                    )
                  }
                />
              </span>
            </div>
            <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
              <span className="text-grey1 text-xs">MAX. PRICE</span>
              <span className="text-white text-3xl">
                <input
                  autoComplete="off"
                  className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                  placeholder="0"
                  id="maxInput"
                  type="text"
                  value={upperPrice}
                  onChange={() =>
                    setUpperPrice(
                      inputFilter(
                        (
                          document.getElementById(
                            "maxInput"
                          ) as HTMLInputElement
                        )?.value
                      )
                    )
                  }
                />
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
        <RangePoolPreview fee={selectedFeeTier} />
      </div>
      </div>
    </div>
  );
}
