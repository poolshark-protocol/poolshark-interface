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
import { fetchRangeTokenUSDPrice, switchDirection } from "../../utils/tokens";
import { feeTiers, getRangePool } from "../../utils/pools";

export default function ConcentratedPool({}) {
  const [
    rangePoolAddress,
    rangePoolData,
    rangePositionData,
    setRangePoolAddress,
    setRangePoolData,
    setRangePositionData,
    tokenIn,
    tokenInAmount,
    tokenInRangeUSDPrice,
    tokenInBalance,
    setTokenIn,
    setTokenInAmount,
    setTokenInRangeUSDPrice,
    setTokenInBalance,
    tokenOut,
    tokenOutAmount,
    tokenOutRangeUSDPrice,
    tokenOutBalance,
    setTokenOut,
    setTokenOutAmount,
    setTokenOutRangeUSDPrice,
    setTokenOutBalance,
    pairSelected,
    switchDirection,
    setDisabled,
    setButtonMessage,
  ] = useRangeStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangePositionData,
    state.setRangePoolAddress,
    state.setRangePoolData,
    state.setRangePositionData,
    state.tokenIn,
    state.tokenInAmount,
    state.tokenInRangeUSDPrice,
    state.tokenInBalance,
    state.setTokenIn,
    state.setTokenInAmount,
    state.setTokenInRangeUSDPrice,
    state.setTokenInBalance,
    state.tokenOut,
    state.tokenOutAmount,
    state.tokenOutRangeUSDPrice,
    state.tokenOutBalance,
    state.setTokenOut,
    state.setTokenOutAmount,
    state.setTokenOutRangeUSDPrice,
    state.setTokenOutBalance,
    state.pairSelected,
    state.switchDirection,
    state.setDisabled,
    state.setButtonMessage,
  ]);

  const { address, isConnected } = useAccount();

  const {
    bnInput,
    setBnInput,
    setDisplay,
    inputBox,
    maxBalance,
  } = useInputBox();

  const [hasSelected, setHasSelected] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  ////////////////////////////////Pools

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      updatePools();
    }
  }, [tokenIn, tokenOut]);

  async function updatePools() {
    await getRangePool(
      tokenIn,
      tokenOut,
      setRangePoolAddress,
      setRangePoolData
    );
  }

  //this sets the default position price delta
  useEffect(() => {
    console.log("rangePoolData", rangePoolData);
    if (rangePoolData.price) {
      console.log("rangePoolData.price", rangePoolData.price);
      console.log("rangePoolData.tickAtPrice", rangePoolData.tickAtPrice);
      const price = JSBI.BigInt(rangePoolData.price);
      const tickAtPrice = rangePoolData.tickAtPrice;
      setRangePrice(TickMath.getPriceStringAtSqrtPrice(price));
      setRangeSqrtPrice(price);
      const positionData = rangePositionData;
      console.log("set lower e upper price", lowerPrice, upperPrice);
      if (isNaN(parseFloat(lowerPrice)) || parseFloat(lowerPrice) <= 0) {
        console.log("set lower price");
        setLowerPrice(TickMath.getPriceStringAtTick(tickAtPrice - 7000));
        positionData.lowerPrice = BigNumber.from(tickAtPrice - 7000);
        //setMinTick(rangePositionData, BigNumber.from(tickAtPrice - 7000));
      }
      if (isNaN(parseFloat(upperPrice)) || parseFloat(upperPrice) <= 0) {
        console.log("set upper price");
        setUpperPrice(TickMath.getPriceStringAtTick(tickAtPrice - -7000));
        positionData.upperPrice = BigNumber.from(tickAtPrice - -7000);
        //setMaxTick(rangePositionData, BigNumber.from(tickAtPrice - -7000));
      }
      setRangeTickPrice(tickAtPrice);
      setRangePositionData(positionData);
    }
  }, [rangePoolData]);

  ////////////////////////////////Pools Fee Tiers
  const [fee, setFee] = useState(updateSelectedFeeTier);

  function updateSelectedFeeTier(): any {
    if (rangePoolData.feeTier == 0.01) {
      return feeTiers[0];
    } else if (rangePoolData.feeTier == 0.05) {
      return feeTiers[1];
    } else if (rangePoolData.feeTier == 0.3) {
      return feeTiers[2];
    } else if (rangePoolData.feeTier == 1) {
      return feeTiers[3];
    } else return feeTiers[0];
  }

  const handleManualFeeChange = async (auxfee: any) => {
    const pool = tokenOrder
      ? await getRangePoolFromFactory(tokenIn.address, tokenOut.address)
      : await getRangePoolFromFactory(tokenOut.address, tokenIn.address);
    const data = pool["data"]["rangePools"];
    for (var i = 0; i < data.length; i++) {
      if (data[i]["feeTier"]["id"] == 3000 && auxfee.tierId == 3000) {
        setFee(feeTiers[2]);
        setRangePoolAddress(pool["data"]["rangePools"][i]["id"]);
      } else if (data[i]["feeTier"]["id"] == 500 && auxfee.tierId == 500) {
        setFee(feeTiers[1]);
        setRangePoolAddress(pool["data"]["rangePools"][i]["id"]);
      } else if (data[i]["feeTier"]["id"] == 100 && auxfee.tierId == 100) {
        setFee(feeTiers[0]);
        setRangePoolAddress(pool["data"]["rangePools"][i]["id"]);
      } else if (data[i]["feeTier"]["id"] == 10000 && auxfee.tierId == 10000) {
        setFee(feeTiers[3]);
        setRangePoolAddress(pool["data"]["rangePools"][i]["id"]);
      }
    }
  };

  ////////////////////////////////TokenOrder
  const [tokenOrder, setTokenOrder] = useState(true);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setTokenOrder(tokenIn.callId == 0);
    }
  }, [tokenIn, tokenOut]);

  ////////////////////////////////Token Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.address,
    enabled: tokenIn.address != undefined,
    watch: true,
  });

  const { data: tokenOutBal } = useBalance({
    address: address,
    token: tokenOut.address,
    enabled: tokenOut.address != undefined,
    watch: true,
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
    if (rangePositionData.lowerPrice && rangePositionData.upperPrice) {
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
        rangePositionData.lowerPrice,
        parseInt(rangePoolData.feeTier.tickSpacing)
      );
      const upper = TickMath.getTickAtPriceString(
        rangePositionData.upperPrice,
        parseInt(rangePoolData.feeTier.tickSpacing)
      );
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(lower);
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(upper);
      const liquidity =
        parseFloat(rangePrice) >= parseFloat(rangePositionData.lowerPrice) &&
        parseFloat(rangePrice) <= parseFloat(rangePositionData.upperPrice)
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
      console.log("liquidity", liquidity.toString());
      const tokenOutAmount = JSBI.greaterThan(liquidity, ZERO)
        ? tokenOrder
          ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
          : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
        : ZERO;
        
      setTokenInAmount(bnInput);
      setTokenOutAmount(BigNumber.from(tokenOutAmount.toString()));
    } catch (error) {
      console.log(error);
    }
  }
  
  ////////////////////////////////Change Price Buttons
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

  // disabled messages
  useEffect(() => {
    if (parseFloat(lowerPrice) >= parseFloat(upperPrice)) {
      setButtonMessage("price");
    }
    if (bnInput.eq(BN_ZERO)) {
      setButtonMessage("amount");
    }
    if (
      Number(ethers.utils.formatUnits(tokenInAmount)) > Number(tokenInBalance)
    ) {
      setButtonMessage("tokenInBalance");
    }
    if (
      Number(ethers.utils.formatUnits(tokenOutAmount)) > Number(tokenOutBalance)
    ) {
      setButtonMessage("tokenOutBalance");
    }
    if (
      Number(ethers.utils.formatUnits(bnInput)) === 0 ||
      parseFloat(lowerPrice) >= parseFloat(upperPrice) ||
      Number(ethers.utils.formatUnits(tokenInAmount)) >
        Number(tokenInBalance) ||
      Number(ethers.utils.formatUnits(tokenOutAmount)) > Number(tokenOutBalance)
    ) {
      //console.log('disabled true')
      setDisabled(true);
    } else {
      //console.log('disabled false')
      setDisabled(false);
    }
  }, [
    bnInput,
    lowerPrice,
    upperPrice,
    tokenInAmount,
    tokenOutAmount,
    tokenInBalance,
    tokenOutBalance,
  ]);

  ////////////////////////////////

  //select fee html
  function SelectFee() {
    return (
      <Listbox value={fee} onChange={handleManualFeeChange}>
        <div className="relative mt-1 w-full">
          <Listbox.Button className="relative cursor-default rounded-lg bg-black text-white cursor-pointer border border-grey1 py-2 pl-3 w-full text-left shadow-md focus:outline-none">
            <span className="block truncate">{fee.tier}</span>
            <span className="block truncate text-xs text-grey mt-1">
              {fee.text}
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
                    const newInput = tokenInAmount;
                    //switch direction
                    switchDirection();
                    /* setBnInput(newInput);
                    setDisplay(
                      parseFloat(
                        ethers.utils.formatUnits(newInput, 18).toString()
                      )
                        .toPrecision(5)
                        .replace(/0+$/, "")
                        .replace(/(\.)(?!\d)/g, "")
                    ); */
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
                        tokenInRangeUSDPrice *
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
                        Balance: {tokenInBalance ?? 0}
                      </div>
                      <button
                        className="flex md:text-xs text-[10px] uppercase text-[#C9C9C9]"
                        onClick={() => maxBalance(tokenInBalance, "0")}
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
                {Number(ethers.utils.formatUnits(tokenOutAmount, 18))}
                {
                  <div className="flex mt-2 text-xs text-[#4C4C4C]">
                    ~$
                    {(
                      Number(tokenOutRangeUSDPrice) *
                      Number(ethers.utils.formatUnits(tokenOutAmount, 18))
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
                        Balance: {tokenOutBalance ?? 0}
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
                {tokenOut.symbol} per {tokenIn.symbol}
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
                {tokenOut.symbol} per {tokenIn.symbol}
              </span>
            </div>
          </div>
        </div>
         <ConcentratedPoolPreview fee={fee} />
      </div>
    </div>
  );
}
