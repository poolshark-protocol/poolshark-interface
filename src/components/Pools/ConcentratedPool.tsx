import { Fragment, useEffect, useState } from "react";
import {
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { Listbox, Transition } from "@headlessui/react";
import SelectToken from "../SelectToken";
import ConcentratedPoolPreview from "./ConcentratedPoolPreview";
import { useRangeStore } from "../../hooks/useRangeStore";
import { TickMath, invertPrice, roundTick } from "../../utils/math/tickMath";
import JSBI from "jsbi";
import { getRangePoolFromFactory } from "../../utils/queries";
import useInputBox from "../../hooks/useInputBox";
import { useAccount, useBalance } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO, ZERO } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import inputFilter from "../../utils/inputFilter";
import TickSpacing from "../Tooltips/TickSpacing";
import { fetchRangeTokenUSDPrice } from "../../utils/tokens";
import { feeTiers, getRangePool } from "../../utils/pools";

export default function ConcentratedPool({}) {
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
  }, [tokenIn, tokenOut]);

  ////////////////////////////////Pools
  //initial volatility Tier set to 1.7% when selected from list of range pools
  const [selectedFeeTier, setSelectedFeeTier] = useState(
    feeTiers[feeTierId ?? 0]
  );

  useEffect(() => {
    updatePoolsFromStore();
  }, [feeTierId, tokenIn.name, tokenOut.name]);

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
    console.log("use rangePoolData", rangePoolData);
    if (rangePoolData.price && rangePoolData.tickAtPrice) {
      const price = JSBI.BigInt(rangePoolData.price);
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
  }, [rangePoolData, tokenOrder]);

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
  }, [rangePoolData, tokenIn, tokenOut]);

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
  }, [
    bnInput,
    rangePositionData.lowerPrice,
    rangePositionData.upperPrice,
    tokenOrder,
  ]);

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

  ////////////////////////////////

  //select fee html
  function SelectFee() {
    return (
      <Listbox value={selectedFeeTier} onChange={handleManualVolatilityChange}>
        <div className="relative mt-1 w-full">
          <Listbox.Button className="relative cursor-default rounded-lg bg-black text-white cursor-pointer border border-grey1 py-2 pl-3 w-full text-left shadow-md focus:outline-none">
            <span className="block truncate">{selectedFeeTier.tier}</span>
            <span className="block truncate text-xs text-grey mt-1">
              {selectedFeeTier.text}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon className="w-7 text-grey" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-black border border-grey1 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {feeTiers.map((feeTierz, feeTierIdx) => (
                <Listbox.Option
                  key={feeTierIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-4 cursor-pointer ${
                      active ? "opacity-80 bg-dark" : "opacity-100"
                    }`
                  }
                  value={feeTierz}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate text-white ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {feeTierz.tier}
                      </span>
                      <span
                        className={`block truncate text-grey text-xs mt-1 ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {feeTierz.text}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    );
  }

  //main html
  return (
    <div className="bg-black flex md:flex-row flex-col gap-x-20 justify-between border border-grey2 w-full rounded-xl md:pt-10 pt-7 pb-20 md:px-7 px-4">
      <div className="md:w-1/2">
        <div>
          <div className="flex items-center gap-x-4 md:text-base text-sm justify-between">
            <h1>Select Pair</h1>
            {pairSelected && (
              <div
                onClick={() => {
                  if (hasSelected) {
                    switchDirection();
                  }
                }}
                className="flex items-center cursor-pointer bg-dark border-grey1 border text-xs px-1 py-1 rounded-lg"
              >
                <div
                  className={`px-2 py-0.5 ${
                    tokenOrder ? "" : "bg-grey2 rounded-md"
                  }`}
                >
                  {tokenOrder ? tokenOut.symbol : tokenIn.symbol}
                </div>
                <div
                  className={`px-2 py-0.5 ${
                    tokenOrder ? "bg-grey2 rounded-md" : ""
                  }`}
                >
                  {tokenOrder ? tokenIn.symbol : tokenOut.symbol}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row w-full items-center gap-y-3 gap-x-5 mt-3">
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
            <SelectToken
              index="1"
              key="out"
              type="out"
              tokenIn={tokenIn}
              setTokenIn={setTokenIn}
              tokenOut={tokenOut}
              setTokenOut={setTokenOut}
              displayToken={tokenOut}
            />
          </div>
        </div>
        <div>
          <div className="gap-x-4 mt-8">
            <h1>Fee tier</h1>
          </div>
          <div className="mt-3">
            <SelectFee />
          </div>
        </div>
        <div>
          <div className="gap-x-4 mt-8">
            <h1 className="md:text-base text-sm">Deposit amounts</h1>
          </div>
          <div className="mt-3 space-y-3">
            <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
              <div className=" p-2 w-20">
                {inputBox("0")}
                {
                  <div className="flex">
                    <div className="flex text-xs text-[#4C4C4C]">
                      ~$
                      {(
                        tokenIn.rangeUSDPrice *
                        Number(ethers.utils.formatUnits(bnInput, 18))
                      ).toFixed(2)}
                    </div>
                  </div>
                }
              </div>
              <div className="">
                <div className=" ml-auto">
                  <div>
                    <div className="flex justify-end">
                      <button className="flex md:text-base text-sm items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl">
                        <img className="md:w-7 w-6" src={tokenIn.logoURI} />
                        {tokenIn.symbol}
                      </button>
                    </div>
                    <div className="flex whitespace-nowrap items-center justify-end gap-2 px-1 mt-2">
                      <div className="flex md:text-xs text-[10px] text-[#4C4C4C]">
                        Balance: {tokenIn.userBalance ?? 0}
                      </div>
                      <button
                        className="flex md:text-xs text-[10px] uppercase text-[#C9C9C9]"
                        onClick={() => maxBalance(tokenIn.userBalance, "0")}
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
              <div className=" p-2 bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl  rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none">
                {Number(
                  ethers.utils.formatUnits(rangeMintParams.tokenOutAmount, 18)
                )}
                {
                  <div className="flex mt-2 text-xs text-[#4C4C4C]">
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
                  </div>
                }
              </div>
              <div className="">
                <div className=" ml-auto">
                  <div>
                    <div className="flex justify-end">
                      <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl ">
                        <div className="flex md:text-base text-sm items-center gap-x-2 w-full">
                          <img className="md:w-7 w-6" src={tokenOut.logoURI} />
                          {tokenOut.symbol}
                        </div>
                      </button>
                    </div>
                    <div className="flex whitespace-nowrap items-center justify-end gap-x-2 px-1 mt-2">
                      <div className="flex md:text-xs text-[10px] text-[#4C4C4C]">
                        Balance: {tokenOut.userBalance ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between w-full text-xs  text-[#C9C9C9]">
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
        </div>
      </div>
      <div className="md:w-1/2 mt-10 md:mt-0">
        <div>
          <div className="flex justify-between items-center">
            <div className="flex items-center w-full mb-3 mt-4 gap-x-2 relative">
              <h1 className="md:text-base text-sm">Set Price Range</h1>
              <InformationCircleIcon
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="w-5 h-5 mt-[1px] text-grey cursor-pointer"
              />
              <div
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="absolute mt-32 pt-8"
              >
                {showTooltip ? <TickSpacing /> : null}
              </div>
            </div>
            <button
              className="text-grey text-xs bg-dark border border-grey1 px-4 py-1 rounded-md whitespace-nowrap"
              onClick={() => {
                setLowerPrice(
                  TickMath.getPriceStringAtTick(
                    roundTick(
                      -887272,
                      parseInt(rangePoolData.feeTier.tickSpacing)
                    )
                  )
                );
                setUpperPrice(
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
          <div className="flex flex-col gap-y-3 w-full">
            <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
              <span className="md:text-xs text-[10px] text-grey">
                Min. Price
              </span>
              <div className="flex justify-center items-center">
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice("minus", "minInput")}>
                    <MinusIcon className="w-5 h-5" />
                  </button>
                </div>
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
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice("plus", "minInput")}>
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <span className="md:text-xs text-[10px] text-grey">
                {tokenOrder ? tokenOut.symbol : tokenIn.symbol} per{" "}
                {tokenOut.symbol === "SELECT TOKEN"
                  ? "?"
                  : tokenOrder
                  ? tokenIn.symbol
                  : tokenOut.symbol}
              </span>
            </div>
            <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
              <span className="md:text-xs text-[10px] text-grey">
                Max. Price
              </span>
              <div className="flex justify-center items-center">
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice("minus", "maxInput")}>
                    <MinusIcon className="w-5 h-5" />
                  </button>
                </div>
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
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice("plus", "maxInput")}>
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <span className="md:text-xs text-[10px] text-grey">
                {tokenOrder ? tokenOut.symbol : tokenIn.symbol} per{" "}
                {tokenOut.symbol === "SELECT TOKEN"
                  ? "?"
                  : tokenOrder
                  ? tokenIn.symbol
                  : tokenOut.symbol}
              </span>
            </div>
          </div>
        </div>
        <ConcentratedPoolPreview fee={selectedFeeTier} />
      </div>
    </div>
  );
}
