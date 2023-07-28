import {
  ChevronDownIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  MinusIcon,
  PlusIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useSigner,
  useProvider,
} from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import { Fragment, useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import JSBI from "jsbi";
import { Listbox, Transition } from "@headlessui/react";
import { TickMath, roundTick } from "../../utils/math/tickMath";
import { BN_ZERO, ZERO } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import CoverMintApproveButton from "../Buttons/CoverMintApproveButton";
import { getCoverPool } from "../../utils/pools";
import { fetchCoverTokenUSDPrice } from "../../utils/tokens";
import inputFilter from "../../utils/inputFilter";
import TickSpacing from "../Tooltips/TickSpacing";
import { getCoverPoolFromFactory } from "../../utils/queries";
import { gasEstimateCoverMint } from "../../utils/gas";
import { useCoverStore } from "../../hooks/useCoverStore";
import { chainIdsToNamesForGitTokenList } from "../../utils/chains";
import useInputBox from "../../hooks/useInputBox";
import { getBalances } from "../../utils/balances";
import { useRangeStore } from "../../hooks/useRangeStore";
import { invertPrice } from "../../utils/math/tickMath";

export default function CoverExistingPool({ goBack }) {
  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    setCoverPoolAddress,
    setCoverPoolData,
    setCoverPositionData,
    tokenIn,
    tokenInCoverUSDPrice,
    tokenInBalance,
    setTokenInCoverUSDPrice,
    setTokenInBalance,
    setTokenInAllowance,
    tokenOut,
    tokenOutCoverUSDPrice,
    setTokenOutCoverUSDPrice,
    setTokenOutAllowance,
    pairSelected,
    switchDirection,
  ] = useCoverStore((state) => [
    state.coverPoolAddress,
    state.coverPoolData,
    state.coverPositionData,
    state.setCoverPoolAddress,
    state.setCoverPoolData,
    state.setCoverPositionData,
    state.tokenIn,
    state.tokenInCoverUSDPrice,
    state.tokenInBalance,
    state.setTokenInCoverUSDPrice,
    state.setTokenInBalance,
    state.setTokenInCoverAllowance,
    state.tokenOut,
    state.tokenOutCoverUSDPrice,
    state.setTokenOutCoverUSDPrice,
    state.setTokenOutCoverAllowance,
    state.pairSelected,
    state.switchDirection,
  ]);

  const [rangePositionData] = useRangeStore((state) => [
    state.rangePositionData,
  ]);

  const { data: signer } = useSigner();
  const { address, isConnected, isDisconnected } = useAccount();
  const { bnInput, inputBox, maxBalance } = useInputBox();

  ////////////////////////////////Chain
  const [stateChainName, setStateChainName] = useState();

  const {
    network: { chainId },
  } = useProvider();

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId]);
  }, [chainId]);

  ////////////////////////////////TokenOrder
  const [tokenOrder, setTokenOrder] = useState(true);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setTokenOrder(tokenIn.callId == 0);
    }
  }, [tokenIn, tokenOut]);

  //////////////////////////////Pools

  useEffect(() => {
    updatePools();
  }, [coverPoolAddress]);

  async function updatePools() {
    await getCoverPool(
      tokenIn,
      tokenOut,
      setCoverPoolAddress,
      setCoverPoolData
    );
  }

  useEffect(() => {
    if (coverPoolData.latestTick) {
      updatePositionData();
    }
  }, [coverPoolData, coverPoolAddress, tokenOrder]);

  async function updatePositionData() {
    const tickAtPrice = Number(coverPoolData.latestTick);
    const tickSpread = Number(coverPoolData.volatilityTier.tickSpread);
    const lowerPrice = TickMath.getPriceStringAtTick(
      tokenOrder
        ? tickAtPrice + -tickSpread * 16
        : tickAtPrice + tickSpread * 8,
      tickSpread
    );
    const upperPrice = TickMath.getPriceStringAtTick(
      tokenOrder ? tickAtPrice - tickSpread * 6 : tickAtPrice + tickSpread * 18,
      tickSpread
    );
    setLowerPrice(lowerPrice);
    setUpperPrice(upperPrice);
    setCoverPositionData({
      ...coverPositionData,
      tickAtPrice: tickAtPrice,
      lowerPrice: lowerPrice,
      upperPrice: upperPrice,
    });
  }

  //////////////////////////////Pools Change Volatility Tiers

  const volatilityTiers = [
    {
      id: 0,
      tier: "1.7% per min",
      text: "Less Volatility",
      unavailable: false,
      tickSpread: 20,
    },
    {
      id: 1,
      tier: "2.4% per min",
      text: "Most Volatility",
      unavailable: false,
      tickSpread: 40,
    },
  ];

  const [volatility, setVolatility] = useState(0);
  const [selectedVolatility, setSelectedVolatility] = useState(
    volatilityTiers[0]
  );

  useEffect(() => {
    setSelectedVolatility(volatilityTiers[volatility]);
  }, [volatility]);

  //when volatility changes, we find the corresponding pool id and changed it trigerring the poolInfo refetching
  const handleManualVolatilityChange = async (volatility: any) => {
    try {
      const pool = await getCoverPoolFromFactory(
        tokenIn.address,
        tokenOut.address
      );
      const volatilityId = volatility.id;
      const dataLength = pool["data"]["coverPools"].length;
      for (let i = 0; i < dataLength; i++) {
        if (
          (volatilityId == 0 &&
            pool["data"]["coverPools"][i]["volatilityTier"]["tickSpread"] ==
              20) ||
          (volatilityId == 1 &&
            pool["data"]["coverPools"][i]["volatilityTier"]["tickSpread"] == 40)
        ) {
          setVolatility(volatilityId);
          //setting the address will trigger the poolInfo refetching
          setCoverPoolAddress(pool["data"]["coverPools"][i]["id"]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  ////////////////////////////////Token Allowances

  const { data: allowanceInCover } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, coverPoolAddress],
    chainId: 421613,
    watch: true,
    enabled: isConnected && coverPoolAddress && tokenIn.address != "0x00",
    onSuccess(data) {
      //console.log('Success')
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {},
  });

  const { data: allowanceOutCover } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, coverPoolAddress],
    chainId: 421613,
    watch: true,
    enabled: isConnected && coverPoolAddress && tokenIn.address != "0x00",
    onSuccess(data) {
      //console.log('Success')
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {},
  });

  useEffect(() => {
    if (allowanceInCover) {
      setTokenInAllowance(ethers.utils.formatUnits(allowanceInCover, 18));
      setTokenOutAllowance(ethers.utils.formatUnits(allowanceOutCover, 18));
    }
  }, [allowanceInCover]);

  ////////////////////////////////Token Balances

  async function updateBalances() {
    await getBalances(
      address,
      false,
      tokenIn,
      tokenOut,
      setTokenInBalance,
      () => {}
    );
  }

  useEffect(() => {
    updateBalances();
  }, [tokenIn.address, tokenOut.address]);

  ////////////////////////////////Token Prices

  useEffect(() => {
    if (coverPoolData.token0 && coverPoolData.token1) {
      if (tokenIn.address) {
        fetchCoverTokenUSDPrice(
          coverPoolData,
          tokenIn,
          setTokenInCoverUSDPrice
        );
      }
      if (tokenOut.address) {
        fetchCoverTokenUSDPrice(
          coverPoolData,
          tokenOut,
          setTokenOutCoverUSDPrice
        );
      }
    }
  }, [coverPoolData, tokenOrder]);

  ////////////////////////////////Position Price Delta
  const [lowerPrice, setLowerPrice] = useState("0");
  const [upperPrice, setUpperPrice] = useState("0");

  useEffect(() => {
    setCoverPositionData({
      ...coverPositionData,
      lowerPrice: lowerPrice,
      upperPrice: upperPrice,
    });
  }, [lowerPrice, upperPrice]);

  const changePrice = (direction: string, inputId: string) => {
    if (!coverPoolData.volatilityTier.tickSpread) return;
    const currentTick =
      inputId == "minInput"
        ? TickMath.getTickAtPriceString(coverPositionData.lowerPrice)
        : TickMath.getTickAtPriceString(coverPositionData.upperPrice);
    const increment = parseInt(coverPoolData.volatilityTier.tickSpread);
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

  ////////////////////////////////Position Amount Calculations
  const [coverAmountIn, setCoverAmountIn] = useState(ZERO);
  const [coverAmountOut, setCoverAmountOut] = useState(ZERO);
  const [sliderValue, setSliderValue] = useState(50);

  // set amount in
  useEffect(() => {
    if (!bnInput.eq(BN_ZERO)) {
      setCoverAmountIn(JSBI.BigInt(bnInput.toString()));
    }
  }, [
    bnInput,
    coverPositionData.lowerPrice,
    coverPositionData.upperPrice,
    tokenOrder,
  ]);

  useEffect(() => {
    changeCoverOutAmount();
  }, [sliderValue, lowerPrice, upperPrice, tokenOrder]);

  function changeCoverOutAmount() {
    if (
      coverPositionData.lowerPrice &&
      coverPositionData.upperPrice &&
      parseFloat(coverPositionData.lowerPrice) > 0 &&
      parseFloat(coverPositionData.upperPrice) > 0 &&
      parseFloat(coverPositionData.lowerPrice) <
        parseFloat(coverPositionData.upperPrice)
    ) {
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(
        TickMath.getTickAtPriceString(coverPositionData.lowerPrice)
      );
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
        TickMath.getTickAtPriceString(coverPositionData.upperPrice)
      );
      const liquidityAmount = JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(Math.round(rangePositionData.userLiquidity)),
          JSBI.BigInt(parseFloat(sliderValue.toString()))
        ),
        JSBI.BigInt(100)
      );
      setCoverAmountIn(
        tokenOrder
          ? DyDxMath.getDx(
              liquidityAmount,
              lowerSqrtPrice,
              upperSqrtPrice,
              true
            )
          : DyDxMath.getDy(
              liquidityAmount,
              lowerSqrtPrice,
              upperSqrtPrice,
              true
            )
      );
      setCoverAmountOut(
        tokenOrder
          ? DyDxMath.getDy(
              liquidityAmount,
              lowerSqrtPrice,
              upperSqrtPrice,
              true
            )
          : DyDxMath.getDx(
              liquidityAmount,
              lowerSqrtPrice,
              upperSqrtPrice,
              true
            )
      );
    }
  }

  ////////////////////////////////Valid Bounds Flag
  const [validBounds, setValidBounds] = useState(false);

  useEffect(() => {
    if (
      coverPositionData.lowerPrice &&
      coverPositionData.upperPrice &&
      coverPoolData.latestTick &&
      coverPoolData.volatilityTier.tickSpread
    )
      changeValidBounds();
  }, [coverPositionData.lowerPrice, coverPositionData.upperPrice]);

  const changeValidBounds = () => {
    if (coverPositionData.lowerPrice && coverPositionData.upperPrice) {
      setValidBounds(
        BigNumber.from(parseInt(coverPositionData.lowerPrice)).lt(
          BigNumber.from(parseInt(coverPoolData.latestTick)).sub(
            BigNumber.from(parseInt(coverPoolData.volatilityTier.tickSpread))
          )
        )
      );
    } else {
      setValidBounds(false);
    }
  };

  ////////////////////////////////Gas Fees Estimation
  const [mintGasFee, setMintGasFee] = useState("$0.00");
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (
      coverPositionData.lowerPrice &&
      coverPositionData.upperPrice &&
      coverPoolData.volatilityTier
    )
      updateGasFee();
  }, [
    coverPositionData.lowerPrice,
    coverPositionData.upperPrice,
    coverAmountIn,
    coverAmountOut,
    tokenIn,
    tokenOut,
  ]);

  async function updateGasFee() {
    const newMintGasFee = await gasEstimateCoverMint(
      coverPoolAddress,
      address,
      TickMath.getTickAtPriceString(
        coverPositionData.upperPrice,
        parseInt(coverPoolData.volatilityTier.tickSpread)
      ),
      TickMath.getTickAtPriceString(
        coverPositionData.lowerPrice,
        parseInt(coverPoolData.volatilityTier.tickSpread)
      ),
      tokenIn,
      tokenOut,
      coverAmountIn,
      signer
    );

    console.log("new mint gas fee", newMintGasFee);
    setMintGasFee(newMintGasFee.formattedPrice);
    setMintGasLimit(newMintGasFee.gasUnits.mul(120).div(100));
  }

  ////////////////////////////////Disabled Button Handler
  const [buttonState, setButtonState] = useState("");
  const [disabled, setDisabled] = useState(false);

  // disabled messages
  useEffect(() => {
    if (
      Number(ethers.utils.formatUnits(coverAmountIn.toString(), 18)) *
        tokenInCoverUSDPrice >
      Number(tokenInBalance)
    ) {
      setButtonState("balance");
    } else if (!validBounds) {
      setButtonState("bounds");
    } else if (
      parseInt(coverPositionData.lowerPrice) >
      parseInt(coverPositionData.upperPrice)
    ) {
      setButtonState("price");
    } else if (BigNumber.from(coverAmountIn.toString()).eq(BN_ZERO)) {
      setButtonState("amount");
    } else if (pairSelected == false) {
      setButtonState("token");
    } else if (mintGasLimit.eq(BN_ZERO)) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [
    coverAmountIn,
    coverAmountOut,
    pairSelected,
    validBounds,
    coverPositionData,
    tokenInBalance,
    mintGasLimit,
  ]);

  // set disabled
  useEffect(() => {
    const disabledFlag =
      bnInput.eq(BN_ZERO) &&
      coverPositionData.lowerPrice < coverPositionData.upperPrice &&
      validBounds &&
      parseFloat(ethers.utils.formatUnits(coverAmountIn.toString(), 18)) >
        parseFloat(tokenInBalance) &&
      pairSelected == true;
    setDisabled(disabledFlag);
  }, [
    coverPositionData.lowerPrice,
    coverPositionData.upperPrice,
    bnInput,
    validBounds,
    tokenInBalance,
    coverAmountIn,
  ]);

  ////////////////////////////////

  /* useEffect(() => {
    if (latestTick) {
      if (coverPoolRoute != undefined && tokenOut.address.toString() != "") {
        const price = TickMath.getPriceStringAtTick(latestTick);
        console.log("tick price", tokenOrder);
        setCoverTickPrice(invertPrice(price, tokenOrder));
      }
    }
  }, [latestTick, tokenIn.address]); */

  /* useEffect(() => {
    changeCoverAmounts();
    changeValidBounds();
  }, [sliderValue, lowerTick, upperTick, tokenOrder]); */

  //Number(ethers.utils.formatUnits(coverAmountIn.toString(), 18)).toPrecision(5);

  // disabled messages
  /* useEffect(() => {
    if (
      Number(ethers.utils.formatUnits(coverAmountIn.toString(), 18)) >
      parseFloat(tokenInBal?.formatted.toString())
    ) {
      setButtonState("balance");
    }
    if (!validBounds) {
      setButtonState("bounds");
    }
    if (parseFloat(lowerPrice) >= parseFloat(upperPrice)) {
      setButtonState("price");
    }
  }, [validBounds, lowerPrice, upperPrice, tokenInBal, coverAmountIn]); */

  // check for valid inputs
  /*  useEffect(() => {
    const disabledFlag =
      JSBI.equal(coverAmountIn, ZERO) ||
      isNaN(parseFloat(lowerPrice)) ||
      parseFloat(ethers.utils.formatUnits(coverAmountIn.toString(), 18)) >
        parseFloat(tokenInBal?.formatted.toString()) ||
      isNaN(parseFloat(upperPrice)) ||
      lowerTick >= upperTick ||
      !validBounds ||
      hasSelected == false;
    setDisabled(disabledFlag);
    if (!disabledFlag) {
      //updateGasFee()
    }
    console.log("latest price", latestTick);
  }, [lowerPrice, upperPrice, coverAmountIn, validBounds, tokenInBal]); */

  /* useEffect(() => {
    if (!isNaN(parseFloat(lowerPrice))) {
      console.log("setting lower tick");
      setLowerTick(TickMath.getTickAtPriceString(lowerPrice, tickSpread));
    }
    if (!isNaN(parseFloat(upperPrice))) {
      console.log("setting upper tick");
      setUpperTick(TickMath.getTickAtPriceString(upperPrice, tickSpread));
    }
  }, [lowerPrice, upperPrice]); */

  //useEffect(() => {}, [coverAmountOut]);

  ////////////////////////////////

  /* async function updateGasFee() {
    const newMintGasFee = await gasEstimateCoverMint(
      coverPoolRoute,
      address,
      upperPrice,
      lowerPrice,
      tokenIn,
      tokenOut,
      coverAmountIn,
      tickSpread,
      signer,
    )
    
    setMintGasFee(newMintGasFee.formattedPrice)
    setMintGasLimit(newMintGasFee.gasUnits.mul(130).div(100))
  } */

  const handleChange = (event: any) => {
    setSliderValue(event.target.value);
  };

  useEffect(() => {
    setSelectedVolatility(volatilityTiers[volatility]);
  }, [volatility]);

  function SelectVolatility() {
    return (
      <Listbox
        value={selectedVolatility}
        onChange={handleManualVolatilityChange}
      >
        <div className="relative mt-1 w-full">
          <Listbox.Button className="relative cursor-default rounded-lg bg-black text-white cursor-pointer border border-grey1 py-2 pl-3 w-full text-left shadow-md focus:outline-none">
            <span className="block truncate">{selectedVolatility.tier}</span>
            <span className="block truncate text-xs text-grey mt-1">
              {selectedVolatility.text}
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
            <Listbox.Options className="absolute mt-1 z-50 max-h-60 w-full overflow-auto rounded-md bg-black border border-grey1 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {volatilityTiers.map((volatilityTier, volatilityTierIdx) => (
                <Listbox.Option
                  key={volatilityTierIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-4 cursor-pointer ${
                      active ? "opacity-80 bg-dark" : "opacity-100"
                    }`
                  }
                  value={volatilityTier}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate text-white ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {volatilityTier.tier}
                      </span>
                      <span
                        className={`block truncate text-grey text-xs mt-1 ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {volatilityTier.text}
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

  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Min. filled amount</div>
            <div className="ml-auto text-xs">
              {(
                parseFloat(
                  ethers.utils.formatUnits(String(coverAmountOut), 18)
                ) *
                (1 - coverPoolData.volatilityTier.tickSpread / 10000)
              ).toPrecision(5) +
                " " +
                tokenOut.symbol}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            <div className="ml-auto text-xs">{mintGasFee}</div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-row justify-between">
          <h1 className="mb-3 md:text-base text-sm">Selected Pool</h1>
          <span
            className="flex gap-x-1 cursor-pointer"
            onClick={() => goBack("initial")}
          >
            <ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " />
            <h1 className="mb-3 opacity-50 md:text-base text-sm">Back</h1>
          </span>
        </div>
        <div className="flex justify-between md:justify-start gap-x-4 items-center">
          <button className="flex items-center gap-x-3 bg-black border border-grey1 md:px-4 px-2 py-1.5 rounded-xl">
            <div className="flex md:text-base text-sm items-center gap-x-2 w-full">
              <img className="md:w-7 w-6" src={tokenIn.logoURI} />
              {tokenIn.symbol}
            </div>
          </button>
          <ArrowLongRightIcon
            className="md:w-6 w-5 cursor-pointer"
            onClick={() => {
              switchDirection();
            }}
          />
          <button className="flex items-center gap-x-3 bg-black border border-grey1 md:px-4 px-2 py-1.5 rounded-xl">
            <div className="flex md:text-base text-sm items-center gap-x-2 w-full">
              <img className="md:w-7 w-6" src={tokenOut.logoURI} />
              {tokenOut.symbol}
            </div>
          </button>
        </div>
      </div>
      <h1 className="mb-3 md:text-base text-sm">
        How much do you want to Cover?
      </h1>
      <div className="w-full flex items-center justify-between text-xs text-[#646464]">
        <div>0</div>
        <div>Full</div>
      </div>
      <div className="w-full flex items-center mt-2">
        <input
          autoComplete="off"
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleChange}
          className="w-full styled-slider slider-progress bg-transparent"
        />
      </div>
      <div className="mt-3 ">
        <div className="flex justify-between items-center text-sm">
          <div className="text-[#646464] md:text-sm text-xs">
            Percentage Covered
          </div>
          <div className="flex gap-x-1 items-center ">
            <input
              autoComplete="off"
              type="text"
              id="input"
              onChange={(e) => {
                setSliderValue(Number(inputFilter(e.target.value)));
              }}
              value={sliderValue}
              className="text-right placeholder:text-grey1 text-white text-xl w-20 focus:ring-0 focus:ring-offset-0 focus:outline-none bg-black"
            />
            <div className="mt-1">%</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="text-[#646464] md:text-sm text-xs">
            Amount Covered
          </div>
          <div className="flex items-center justify-end gap-x-2">
            {/*
            <input
              autoComplete="off"
              type="text"
              id="input"
              onChange={(e) => {
                //const newTokenAmount = Math.round(parseFloat(e.target.value) * 10**18)
                //setCoverAmountOut(JSBI.BigInt(newTokenAmount))
              }}
              value={Number.parseFloat(
                ethers.utils.formatUnits(String(coverAmountOut), 18),
              ).toPrecision(5)}
              className="bg-black text-right w-32 py-1 placeholder:text-grey1 text-white text-lg mb-2 focus:ring-0 focus:ring-offset-0 focus:outline-none"
            />
              */}
            <div className="bg-black text-right w-32 py-1 placeholder:text-grey1 text-white text-lg">
              {Number.parseFloat(
                ethers.utils.formatUnits(String(coverAmountOut), 18)
              ).toPrecision(5)}
            </div>

            <div className="">{tokenOut.symbol}</div>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="text-[#646464] md:text-sm text-xs">Amount to pay</div>
          <div className="gap-x-2 flex items-center justify-end">
            <span className="text-lg">
              {Number(
                ethers.utils.formatUnits(coverAmountIn.toString(), 18)
              ).toPrecision(5)}
            </span>
            <span className="mt-1">{tokenIn.symbol}</span>
          </div>
        </div>
      </div>
      <div>
        <div className="gap-x-4 mt-5 md:text-base text-sm">
          <h1>Volatility tier</h1>
        </div>
        <div className="mt-3">
          <SelectVolatility />
        </div>
      </div>
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
      <div className="flex justify-between w-full gap-x-6">
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="md:text-xs text-[10px] text-grey">Min. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("minus", "minInput")}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
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
                    (document.getElementById("minInput") as HTMLInputElement)
                      ?.value
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
          <span className="text-xs text-grey">
            {tokenOrder ? tokenOut.symbol : tokenIn.symbol} per{" "}
            {tokenOut.symbol === "SELECT TOKEN"
              ? "?"
              : tokenOrder
              ? tokenIn.symbol
              : tokenOut.symbol}
          </span>
        </div>
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="md:text-xs text-[10px] text-grey">Max. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("minus", "maxInput")}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
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
                    (document.getElementById("maxInput") as HTMLInputElement)
                      ?.value
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
          <span className="text-xs text-grey">
            {tokenOrder ? tokenOut.symbol : tokenIn.symbol} per{" "}
            {tokenOut.symbol === "SELECT TOKEN"
              ? "?"
              : tokenOrder
              ? tokenIn.symbol
              : tokenOut.symbol}
          </span>
        </div>
      </div>
      <div className="py-4">
        <div
          className="flex px-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
            {1} {tokenIn.symbol} ={" "}
            {!tokenInCoverUSDPrice
              ? "?" + " " + tokenOut.symbol
              : (tokenInCoverUSDPrice / tokenOutCoverUSDPrice).toPrecision(6) +
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
      <div className="space-y-3">
        {isDisconnected ? <ConnectWalletButton /> : null}
        {Number(allowanceInCover) <
        Number(ethers.utils.formatUnits(String(bnInput), 18)) ? (
          <CoverMintApproveButton
            disabled={disabled}
            buttonState={buttonState}
            poolAddress={coverPoolAddress}
            approveToken={tokenIn.address}
            amount={String(coverAmountIn)}
            tokenSymbol={tokenIn.symbol}
            allowance={allowanceInCover}
          />
        ) : (
          <CoverMintButton
            poolAddress={coverPoolAddress}
            disabled={disabled}
            buttonState={buttonState}
            to={address}
            lower={
              coverPositionData.lowerPrice
                ? TickMath.getTickAtPriceString(coverPositionData.lowerPrice)
                : 0
            }
            upper={
              coverPositionData.upperPrice
                ? TickMath.getTickAtPriceString(coverPositionData.upperPrice)
                : 0
            }
            tokenSymbol={tokenIn.symbol}
            amount={String(coverAmountIn)}
            zeroForOne={tokenOrder}
            tickSpacing={
              coverPoolData.volatilityTier
                ? coverPoolData.volatilityTier.tickSpread
                : 20
            }
            gasLimit={mintGasLimit}
          />
        )}
      </div>
    </>
  );
}
