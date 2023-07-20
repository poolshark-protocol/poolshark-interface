import {
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import SelectToken from "../SelectToken";
import {
  erc20ABI,
  useAccount,
  useProvider,
  useContractRead,
  useSigner,
} from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import { chainIdsToNamesForGitTokenList } from "../../utils/chains";
import { Listbox, Transition } from "@headlessui/react";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import { Fragment, useEffect, useState } from "react";
import useInputBox from "../../hooks/useInputBox";
import { tokenOneAddress } from "../../constants/contractAddresses";
import { TickMath, invertPrice, roundTick } from "../../utils/math/tickMath";
import { BigNumber, ethers } from "ethers";
import { useCoverStore } from "../../hooks/useCoverStore";
import { getCoverPoolFromFactory } from "../../utils/queries";
import JSBI from "jsbi";
import { BN_ZERO, ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import { getBalances } from "../../utils/balances";
import { fetchCoverTokenUSDPrice } from "../../utils/tokens";
import inputFilter from "../../utils/inputFilter";
import CoverMintApproveButton from "../Buttons/CoverMintApproveButton";
import TickSpacing from "../Tooltips/TickSpacing";
import { gasEstimateCoverMint } from "../../utils/gas";
import { getCoverPool } from "../../utils/pools";

export default function CreateCover(props: any) {
  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    setCoverPoolAddress,
    setCoverPoolData,
    setCoverPositionData,
    tokenIn,
    tokenInAmount,
    tokenInCoverUSDPrice,
    tokenInBalance,
    tokenInAllowance,
    setTokenIn,
    setTokenInAmount,
    setTokenInCoverUSDPrice,
    setTokenInBalance,
    setTokenInAllowance,
    tokenOut,
    tokenOutCoverUSDPrice,
    tokenOutBalance,
    setTokenOut,
    setTokenOutCoverUSDPrice,
    setTokenOutBalance,
    pairSelected,
    setMinTick,
    setMaxTick,
    /* 
    buttonMessage,
    setButtonMessage,
    minInput,
    maxInput,
    setMinInput,
    setMaxInput, */
  ] = useCoverStore((state) => [
    state.coverPoolAddress,
    state.coverPoolData,
    state.coverPositionData,
    state.setCoverPoolAddress,
    state.setCoverPoolData,
    state.setCoverPositionData,
    state.tokenIn,
    state.tokenInAmount,
    state.tokenInCoverUSDPrice,
    state.tokenInBalance,
    state.tokenInCoverAllowance,
    state.setTokenIn,
    state.setTokenInAmount,
    state.setTokenInCoverUSDPrice,
    state.setTokenInBalance,
    state.setTokenInCoverAllowance,
    state.tokenOut,
    state.tokenOutCoverUSDPrice,
    state.tokenOutBalance,
    state.setTokenOut,
    state.setTokenOutCoverUSDPrice,
    state.setTokenOutBalance,
    state.pairSelected,
    state.setMinTick,
    state.setMaxTick,
    /*state.buttonMessage,
    state.setButtonMessage,
    state.minInput,
    state.maxInput,
    state.setMinInput,
    state.setMaxInput, */
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
    if (coverPoolData.price) {
      const price = JSBI.BigInt(coverPoolData.price);
      const tickAtPrice = coverPoolData.tickAtPrice;
      const lowerPrice = TickMath.getPriceStringAtTick(tickAtPrice - 7000);
      const upperPrice = TickMath.getPriceStringAtTick(tickAtPrice - -7000);
      setCoverPositionData({
        ...coverPositionData,
        price: price,
        tickAtPrice: tickAtPrice,
        lowerPrice: lowerPrice,
        upperPrice: upperPrice,
      });
    }
  }, [coverPoolData]);

  console.log("coverPoolData", coverPoolData);
  console.log("coverPositionData", coverPositionData);
  console.log("//////////////////////////////");

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
          //setTickSpread(volatilityTiers[volatilityId].tickSpread);
          //setting the address will trigger the poolInfo refetching
          setCoverPoolAddress(pool["data"]["coverPools"][i]["id"]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  ////////////////////////////////TokenOrder
  const [tokenOrder, setTokenOrder] = useState(true);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setTokenOrder(tokenIn.callId == 0);
    }
  }, [tokenIn, tokenOut]);

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

  useEffect(() => {
    if (allowanceInCover) {
      setTokenInAllowance(ethers.utils.formatUnits(allowanceInCover, 18));
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
  }, [coverPoolData]);

  ////////////////////////////////Position Price Delta
  const [lowerPrice, setLowerPrice] = useState("0");
  const [upperPrice, setUpperPrice] = useState("0");

  /* useEffect(() => {
    setCoverPositionData({
      ...coverPositionData,
      lowerPrice: lowerPrice,
      upperPrice: upperPrice,
    });
  }, [lowerPrice, upperPrice]); */

  useEffect(() => {
    if (!isNaN(parseFloat(coverPositionData.lowerPrice))) {
      setMinTick(
        coverPositionData,
        BigNumber.from(
          TickMath.getTickAtPriceString(
            coverPositionData.lowerPrice,
            coverPoolData.volatilityTier.tickSpread
          )
        )
      );
    }
    if (!isNaN(parseFloat(coverPositionData.upperPrice))) {
      setMaxTick(
        coverPositionData,
        BigNumber.from(
          TickMath.getTickAtPriceString(
            coverPositionData.upperPrice,
            coverPoolData.volatilityTier.tickSpread
          )
        )
      );
    }
  }, [coverPositionData.lowerPrice, coverPositionData.upperPrice]);

  const changePrice = (direction: string, inputId: string) => {
    if (!coverPoolData.volatilityTier.tickSpread) return;
    const currentTick =
      inputId == "minInput" || inputId == "maxInput"
        ? inputId == "minInput"
          ? Number(coverPositionData.lowerPrice)
          : Number(coverPositionData.upperPrice)
        : coverPoolData.latesTick;
    const increment = coverPoolData.volatilityTier.tickSpread;
    const adjustment =
      direction == "plus" || direction == "minus"
        ? direction == "plus"
          ? -increment
          : increment
        : 0;
    const newTick = roundTick(currentTick - adjustment, increment);
    const newPriceString = TickMath.getPriceStringAtTick(newTick);
    (document.getElementById(inputId) as HTMLInputElement).value =
      Number(newPriceString).toFixed(6);
    if (inputId === "maxInput") {
      setMaxTick(coverPositionData, BigNumber.from(newTick));
      const newPositionData = {
        ...coverPositionData,
        upperPrice: newPriceString,
      };
      setCoverPositionData(newPositionData);
    }
    if (inputId === "minInput") {
      setMinTick(coverPositionData, BigNumber.from(newTick));
      const newPositionData = {
        ...coverPositionData,
        lowerPrice: newPriceString,
      };
      setCoverPositionData(newPositionData);
      //setLowerPrice(newPriceString);
    }
  };

  ////////////////////////////////Position Amount Calculations
  const [coverAmountIn, setCoverAmountIn] = useState(ZERO);
  const [coverAmountOut, setCoverAmountOut] = useState(ZERO);

  // set amount in
  useEffect(() => {
    if (!bnInput.eq(BN_ZERO)) {
      setCoverAmountIn(JSBI.BigInt(bnInput.toString()));
    }
    changeValidBounds();
  }, [
    bnInput,
    coverPositionData.lowerPrice,
    coverPositionData.upperPrice,
    tokenOrder,
  ]);

  useEffect(() => {
    changeCoverAmounts(true);
  }, [coverAmountIn]);

  function changeCoverAmounts(amountInChanged: boolean) {
    if (
      coverPositionData.lowerPrice &&
      coverPositionData.upperPrice &&
      parseFloat(coverPositionData.lowerPrice) > 0 &&
      parseFloat(coverPositionData.upperPrice) > 0 &&
      parseFloat(coverPositionData.lowerPrice) <
        parseFloat(coverPositionData.upperPrice)
    ) {
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(
        Number(coverPositionData.lowerPrice)
      );
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
        Number(coverPositionData.upperPrice)
      );
      if (amountInChanged) {
        // amountIn changed
        const liquidityAmount = DyDxMath.getLiquidityForAmounts(
          lowerSqrtPrice,
          upperSqrtPrice,
          tokenOrder ? lowerSqrtPrice : upperSqrtPrice,
          tokenOrder ? BN_ZERO : BigNumber.from(String(coverAmountIn)),
          tokenOrder ? BigNumber.from(String(coverAmountIn)) : BN_ZERO
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
      } else {
        // amountOut changed
        const liquidityAmount = DyDxMath.getLiquidityForAmounts(
          lowerSqrtPrice,
          upperSqrtPrice,
          tokenOrder ? upperSqrtPrice : lowerSqrtPrice,
          tokenOrder ? BigNumber.from(String(coverAmountOut)) : BN_ZERO,
          tokenOrder ? BN_ZERO : BigNumber.from(String(coverAmountOut))
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
      }
    }
  }

  ////////////////////////////////Valid Bounds Flag
  const [validBounds, setValidBounds] = useState(false);

  const changeValidBounds = () => {
    if (coverPositionData.lowerPrice && coverPositionData.upperPrice) {
      setValidBounds(
        BigNumber.from(parseInt(coverPositionData.lowerPrice)).lt(
          BigNumber.from(coverPoolData.latesTick).sub(
            BigNumber.from(coverPoolData.volatilityTier.tickSpread)
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
    if (coverPositionData.lowerPrice && coverPositionData.upperPrice)
      updateGasFee();
  }, [tokenIn]);

  async function updateGasFee() {
    const newMintGasFee = await gasEstimateCoverMint(
      coverPoolAddress,
      address,
      Number(coverPositionData.upperPrice.toString()),
      Number(coverPositionData.lowerPrice.toString()),
      tokenIn,
      tokenOut,
      coverAmountIn,
      signer
    );
    setMintGasFee(newMintGasFee.formattedPrice);
    setMintGasLimit(newMintGasFee.gasUnits.mul(120).div(100));
  }

  ////////////////////////////////Disabled Button Handler
  const [buttonState, setButtonState] = useState("");
  const [disabled, setDisabled] = useState(false);

  // disabled messages
  useEffect(() => {
    if (Number(ethers.utils.formatUnits(bnInput)) > Number(tokenInBalance)) {
      setButtonState("balance");
    } else if (!validBounds) {
      setButtonState("bounds");
    } else if (
      parseFloat(coverPositionData.lowerPrice) >=
      parseFloat(coverPositionData.upperPrice)
    ) {
      setButtonState("price");
    } else if (parseFloat(ethers.utils.formatEther(bnInput)) == 0) {
      console.log("bn button amount");
      setButtonState("amount");
    } else if (pairSelected == false) {
      setButtonState("token");
    } else if (mintGasLimit.gt(BN_ZERO)) {
      setDisabled(false);
    }
  }, [
    bnInput,
    pairSelected,
    validBounds,
    coverPositionData.lowerPrice,
    coverPositionData.upperPrice,
    tokenInBalance,
    mintGasLimit,
  ]);

  // set disabled
  useEffect(() => {
    const disabledFlag =
      Number(ethers.utils.formatUnits(bnInput)) > Number(tokenInBalance) ||
      isNaN(parseFloat(coverPositionData.lowerPrice)) ||
      isNaN(parseFloat(coverPositionData.upperPrice)) ||
      parseInt(coverPositionData.lowerPrice) <
        parseInt(coverPositionData.upperPrice) ||
      Number(ethers.utils.formatUnits(bnInput)) === 0 ||
      tokenOut.symbol === "Select Token" ||
      !validBounds;
    setDisabled(disabledFlag || mintGasLimit.eq(BN_ZERO));
  }, [
    coverPositionData.lowerPrice,
    coverPositionData.upperPrice,
    bnInput,
    tokenOut,
    validBounds,
    tokenInBalance,
    mintGasLimit,
  ]);

  ////////////////////// Expanded Option
  const [expanded, setExpanded] = useState(false);

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

  ////////////////////////Select Volatility Dropdown
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

  const [showTooltip, setShowTooltip] = useState(false);

  //main return
  return isDisconnected ? (
    <>
      <h1 className="mb-5">Connect a Wallet</h1>
      <ConnectWalletButton />
    </>
  ) : (
    <>
      <div className="mb-6">
        <div className="flex flex-row justify-between">
          <h1 className="mb-3 md:text-base text-sm">Select Pair</h1>
          {/*  {pool != undefined ? (
            <Link href="/cover">
              <span className="flex gap-x-1 cursor-pointer">
                <ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " />{' '}
                <h1 className="mb-3 opacity-50">Back</h1>{' '}
              </span>
            </Link>
          ) : ( */}
          <span
            className="flex gap-x-1 cursor-pointer"
            onClick={() => props.goBack("initial")}
          >
            <ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " />
            <h1 className="mb-3 opacity-50 md:text-base text-sm">Back</h1>
          </span>
          {/* )} */}
        </div>

        <div className="flex md:flex-row flex-col gap-y-3 gap-x-2 md:gap-x-4 items-center">
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
          <div className="items-center px-2 py-2 m-auto border border-[#1E1E1E] z-30 bg-black rounded-lg cursor-pointer">
            <ArrowLongRightIcon
              className="md:w-6 w-4 cursor-pointer md:rotate-0 rotate-90"
              onClick={() => {
                /* if (hasSelected) {
                  console.log("getting cover order set");
                  switchDirection(
                    tokenOrder,
                    null,
                    tokenIn,
                    setTokenIn,
                    tokenOut,
                    setTokenOut,
                    queryTokenIn,
                    setQueryTokenIn,
                    queryTokenOut,
                    setQueryTokenOut
                  );
                } */
              }}
            />
          </div>
          <SelectToken
            key={"out"}
            type="out"
            tokenIn={tokenIn}
            setTokenIn={setTokenIn}
            tokenOut={tokenOut}
            setTokenOut={setTokenOut}
            displayToken={tokenOut}
          />
        </div>
      </div>
      <h1 className="mb-3 md:text-base text-sm">
        How much do you want to Cover?
      </h1>
      <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
        <div className="flex flex-col justify-between gap-y-1 w-1/2 px-2">
          {inputBox("0")}
          <div className="flex md:text-xs text-[10px] -mb-1 text-[#4C4C4C]">
            $
            {(
              parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
              tokenInCoverUSDPrice
            ).toFixed(2)}
          </div>
        </div>
        <div className="flex w-1/2">
          <div className="flex justify-center ml-auto">
            <div className="flex-col">
              <div className="flex justify-end">
                <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                  <div className="flex md:text-base text-sm items-center gap-x-2 w-full">
                    <img className="md:w-7 w-6" src={tokenIn.logoURI} />
                    {tokenIn.symbol}
                  </div>
                </button>
              </div>
              <div className="flex items-center justify-end gap-2 px-1 mt-2">
                <div className="flex whitespace-nowrap md:text-xs text-[10px] text-[#4C4C4C]">
                  Balance: {tokenInBalance === "NaN" ? 0 : tokenInBalance}
                </div>
                {isConnected ? (
                  <button
                    className="flex md:text-xs text-[10px] uppercase text-[#C9C9C9]"
                    onClick={() => maxBalance(tokenInBalance, "0")}
                  >
                    Max
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {/* <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Balance</div>
          <div>
            {usdcBalance} {tokenIn.symbol}
          </div>
        </div> */}
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Amount to receive</div>
          <div>
            {/* {amountToPay} {tokenIn.symbol} */}
            {parseFloat(coverPositionData.lowerPrice) <
            parseFloat(coverPositionData.upperPrice) ? (
              parseFloat(
                parseFloat(ethers.utils.formatUnits(String(coverAmountOut), 18))
                  .toPrecision(6)
                  .replace(/0+$/, "")
                  .replace(/(\.)(?!\d)/g, "")
              )
            ) : (
              <>?</>
            )}{" "}
            {tokenOut.symbol}
          </div>
        </div>
      </div>
      <div className="gap-x-4 mt-5 md:text-base text-sm">
        <div>
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
              value={coverPositionData.lowerPrice}
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
              value={coverPositionData.upperPrice}
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
          <span className="md:text-xs text-[10px] text-grey">
            {tokenIn.symbol} per{" "}
            {tokenOut.symbol === "SELECT TOKEN" ? "?" : tokenOut.symbol}
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
            {tokenOutCoverUSDPrice
              ? "?" + " " + tokenOut.symbol
              : parseFloat(
                  parseFloat(
                    invertPrice(tokenOutCoverUSDPrice.toString(), tokenOrder)
                  ).toPrecision(6)
                ) +
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
      <div className="mb-3">
        {isConnected &&
        allowanceInCover < bnInput &&
        stateChainName === "arbitrumGoerli" ? (
          <CoverMintApproveButton
            disabled={disabled}
            poolAddress={coverPoolAddress}
            approveToken={tokenIn.address}
            amount={bnInput}
            tokenSymbol={tokenIn.symbol}
            allowance={allowanceInCover}
            buttonState={buttonState}
          />
        ) : stateChainName === "arbitrumGoerli" ? (
          <CoverMintButton
            poolAddress={coverPoolAddress}
            tokenSymbol={tokenIn.symbol}
            disabled={disabled}
            to={address}
            lower={coverPositionData.lowerPrice}
            claim={
              tokenOrder
                ? coverPositionData.upperPrice
                : coverPositionData.lowerPrice
            }
            upper={coverPositionData.upperPrice}
            amount={bnInput}
            zeroForOne={tokenOrder}
            tickSpacing={
              coverPoolData.volatilityTier
                ? coverPoolData.volatilityTier.tickSpread
                : 20
            }
            buttonState={buttonState}
            gasLimit={mintGasLimit}
          />
        ) : null}
      </div>
    </>
  );
}
