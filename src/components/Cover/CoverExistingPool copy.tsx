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
  useBalance,
} from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import { Fragment, useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import JSBI from "jsbi";
import { Listbox, Transition } from "@headlessui/react";
import { TickMath, invertPrice, roundTick } from "../../utils/math/tickMath";
import { BN_ZERO, ZERO } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import CoverMintApproveButton from "../Buttons/CoverMintApproveButton";
import { fetchCoverTokenUSDPrice } from "../../utils/tokens";
import inputFilter from "../../utils/inputFilter";
import TickSpacing from "../Tooltips/TickSpacing";
import { gasEstimateCoverMint } from "../../utils/gas";
import { useCoverStore } from "../../hooks/useCoverStore";
import { chainIdsToNamesForGitTokenList } from "../../utils/chains";
import useInputBox from "../../hooks/useInputBox";
import { useRangeStore } from "../../hooks/useRangeStore";
import { volatilityTiers } from "../../utils/pools";

export default function CoverExistingPool({ goBack }) {
  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    coverMintParams,
    volatilityTierId,
    setCoverPositionData,
    tokenIn,
    setTokenInCoverAllowance,
    tokenOut,
    setTokenInCoverUSDPrice,
    setTokenOutCoverUSDPrice,
    setCoverAmountIn,
    setCoverAmountOut,
    pairSelected,
    switchDirection,
    setCoverPoolFromVolatility,
    needsAllowance,
    setNeedsAllowance,
    setMintButtonState,
    setTokenInBalance,
    needsBalance,
    setNeedsBalance,
  ] = useCoverStore((state) => [
    state.coverPoolAddress,
    state.coverPoolData,
    state.coverPositionData,
    state.coverMintParams,
    state.volatilityTierId,
    state.setCoverPositionData,
    state.tokenIn,
    state.setTokenInCoverAllowance,
    state.tokenOut,
    state.setTokenInCoverUSDPrice,
    state.setTokenOutCoverUSDPrice,
    state.setCoverAmountIn,
    state.setCoverAmountOut,
    state.pairSelected,
    state.switchDirection,
    state.setCoverPoolFromVolatility,
    state.needsAllowance,
    state.setNeedsAllowance,
    state.setMintButtonState,
    state.setTokenInBalance,
    state.needsBalance,
    state.setNeedsBalance,
  ]);

  const [rangePositionData] = useRangeStore((state) => [
    state.rangePositionData,
  ]);

  const { data: signer } = useSigner();
  const { address, isConnected, isDisconnected } = useAccount();

  ////////////////////////////////Chain
  const [stateChainName, setStateChainName] = useState();

  const {
    network: { chainId },
  } = useProvider();

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId]);
  }, [chainId]);

  ////////////////////////////////Token Order
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
    watch: needsAllowance,
    enabled: isConnected && coverPoolAddress != "0x00" && needsAllowance,
    onSuccess(data) {
      setNeedsAllowance(false);
      //console.log('Success')
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {},
  });

  useEffect(() => {
    if (allowanceInCover) {
      setTokenInCoverAllowance(allowanceInCover.toString());
    }
  }, [allowanceInCover]);

  ////////////////////////////////Token Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.address,
    enabled: tokenIn.address != undefined && needsBalance,
    watch: needsBalance,
    onSuccess(data) {
      setNeedsBalance(false);
    },
  });

  useEffect(() => {
    if (isConnected) {
      setTokenInBalance(parseFloat(tokenInBal?.formatted).toFixed(2));
    }
  }, [tokenInBal]);

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

  //////////////////////////////Cover Pool Data
  //initial volatility Tier set to 1.7% when selected from list of range pools
  const [selectedVolatility, setSelectedVolatility] = useState(
    volatilityTiers[0]
  );

  useEffect(() => {
    if (
      (selectedVolatility.tickSpread == 20 && volatilityTierId != 0) ||
      (selectedVolatility.tickSpread == 40 && volatilityTierId != 1)
    )
      updatePools();
  }, [tokenIn, tokenOut, selectedVolatility]);

  async function updatePools() {
    setCoverPoolFromVolatility(tokenIn, tokenOut, selectedVolatility);
  }

  //sames as updatePools but triggered from the html
  const handleManualVolatilityChange = async (volatility: any) => {
    setSelectedVolatility(volatility);
  };

  ////////////////////////////////Init Position Data

  //positionData set at pool data change
  useEffect(() => {
    if (coverPoolData.latestTick) {
      updatePositionData();
    }
  }, [coverPoolData, tokenOrder]);

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
  const [sliderValue, setSliderValue] = useState(50);

  // set amount in
  /* useEffect(() => {
    setCoverAmountIn(JSBI.BigInt(coverMintParams.tokenInAmount.toString()));
  }, [coverPositionData.lowerPrice, coverPositionData.upperPrice, tokenOrder]); */

  useEffect(() => {
    updateCoverAmounts();
  }, [sliderValue, lowerPrice, upperPrice, tokenOrder]);

  function updateCoverAmounts() {
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
      coverPoolData.volatilityTier &&
      coverMintParams.tokenInAmount.length > 0
    )
      updateGasFee();
  }, [coverMintParams.tokenInAmount, coverPoolAddress]);

  async function updateGasFee() {
    const newMintGasFee = await gasEstimateCoverMint(
      coverPoolAddress,
      address,
      TickMath.getTickAtPriceString(
        coverPositionData.upperPrice,
        parseInt(coverPoolData.volatilityTier.tickSpread ?? 20)
      ),
      TickMath.getTickAtPriceString(
        coverPositionData.lowerPrice,
        parseInt(coverPoolData.volatilityTier.tickSpread ?? 20)
      ),
      tokenIn,
      tokenOut,
      coverMintParams.tokenInAmount,
      signer
    );
    setMintGasFee(newMintGasFee.formattedPrice);
    setMintGasLimit(newMintGasFee.gasUnits.mul(120).div(100));
  }

  ////////////////////////////////Mint Button Handler

  useEffect(() => {
    setMintButtonState();
  }, [tokenIn, coverMintParams.tokenInAmount]);

  ////////////////////////////////

  const handleChange = (event: any) => {
    setSliderValue(event.target.value);
  };

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
                          selected ? "" : ""
                        }`}
                      >
                        {volatilityTier.tier}
                      </span>
                      <span
                        className={`block truncate text-grey text-xs mt-1 ${
                          selected ? "" : ""
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
                  ethers.utils.formatUnits(
                    String(coverMintParams.tokenOutAmount),
                    18
                  )
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
            <div className="bg-black text-right w-32 py-1 placeholder:text-grey1 text-white text-lg">
              {Number.parseFloat(
                ethers.utils.formatUnits(
                  String(coverMintParams.tokenOutAmount),
                  18
                )
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
                ethers.utils.formatUnits(
                  coverMintParams.tokenInAmount.toString(),
                  18
                )
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
            {!tokenIn.coverUSDPrice
              ? "?" + " " + tokenOut.symbol
              : (tokenOrder
                  ? TickMath.getPriceStringAtTick(
                      parseInt(coverPoolData.latestTick),
                      parseInt(coverPoolData.volatilityTier.tickSpread)
                    )
                  : invertPrice(
                      TickMath.getPriceStringAtTick(
                        parseInt(coverPoolData.latestTick),
                        parseInt(coverPoolData.volatilityTier.tickSpread)
                      ),
                      false
                    )) +
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
        {allowanceInCover ? (
          allowanceInCover.lt(
            BigNumber.from(coverMintParams.tokenInAmount.toString())
          ) ? (
            <CoverMintApproveButton
              poolAddress={coverPoolAddress}
              approveToken={tokenIn.address}
              amount={String(coverMintParams.tokenInAmount)}
              tokenSymbol={tokenIn.symbol}
            />
          ) : (
            <CoverMintButton
              poolAddress={coverPoolAddress}
              disabled={coverMintParams.disabled}
              buttonMessage={coverMintParams.buttonMessage}
              to={address}
              lower={
                coverPositionData.lowerPrice
                  ? TickMath.getTickAtPriceString(
                      coverPositionData.lowerPrice ?? "0",
                      coverPoolData.volatilityTier
                        ? parseInt(coverPoolData.volatilityTier.tickSpread)
                        : 20
                    )
                  : 0
              }
              upper={
                coverPositionData.upperPrice
                  ? TickMath.getTickAtPriceString(
                      coverPositionData.upperPrice ?? "0",
                      coverPoolData.volatilityTier
                        ? parseInt(coverPoolData.volatilityTier.tickSpread)
                        : 20
                    )
                  : 0
              }
              amount={String(coverMintParams.tokenInAmount)}
              zeroForOne={tokenOrder}
              tickSpacing={
                coverPoolData.volatilityTier
                  ? coverPoolData.volatilityTier.tickSpread
                  : 20
              }
              gasLimit={mintGasLimit}
            />
          )
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
