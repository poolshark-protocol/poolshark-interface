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
  useBalance,
} from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import { chainIdsToNamesForGitTokenList } from "../../utils/chains";
import { Listbox, Transition } from "@headlessui/react";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import { Fragment, useEffect, useState } from "react";
import useInputBox from "../../hooks/useInputBox";
import { TickMath, invertPrice, roundTick } from "../../utils/math/tickMath";
import { BigNumber, ethers } from "ethers";
import { useCoverStore } from "../../hooks/useCoverStore";
import JSBI from "jsbi";
import { BN_ZERO, ZERO } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import { fetchCoverTokenUSDPrice } from "../../utils/tokens";
import inputFilter from "../../utils/inputFilter";
import CoverMintApproveButton from "../Buttons/CoverMintApproveButton";
import TickSpacing from "../Tooltips/TickSpacing";
import { gasEstimateCoverMint } from "../../utils/gas";
import { volatilityTiers } from "../../utils/pools";

export default function CreateCover(props: any) {
  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    coverMintParams,
    volatilityTierId,
    setCoverPositionData,
    tokenIn,
    setTokenIn,
    setCoverAmountIn,
    tokenOut,
    setTokenOut,
    setTokenOutCoverUSDPrice,
    setCoverAmountOut,
    pairSelected,
    switchDirection,
    setCoverPoolFromVolatility,
    setMintButtonState,
    needsAllowance,
    setNeedsAllowance,
    setTokenInCoverUSDPrice,
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
    state.setTokenIn,
    state.setCoverAmountIn,
    state.tokenOut,
    state.setTokenOut,
    state.setTokenOutCoverUSDPrice,
    state.setCoverAmountOut,
    state.pairSelected,
    state.switchDirection,
    state.setCoverPoolFromVolatility,
    state.setMintButtonState,
    state.needsAllowance,
    state.setNeedsAllowance,
    state.setTokenInCoverUSDPrice,
    state.setTokenInBalance,
    state.needsBalance,
    state.setNeedsBalance,
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
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {},
  });

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

  const [selectedVolatility, setSelectedVolatility] = useState(
    volatilityTiers[0]
  );

  useEffect(() => {
    setSelectedVolatility(volatilityTiers[volatilityTierId]);
  }, [volatilityTierId]);

  //sames as updatePools but triggered from the html
  const handleManualVolatilityChange = async (volatility: any) => {
    setCoverPoolFromVolatility(tokenIn, tokenOut, volatility);
  };

  ////////////////////////////////Init Position Data

  useEffect(() => {
    if (coverPoolData.latestTick && coverPoolData.volatilityTier) {
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

  // set amount in
  useEffect(() => {
    if (!bnInput.eq(BN_ZERO)) {
      setCoverAmountIn(JSBI.BigInt(bnInput.toString()));
    } else {
      setCoverAmountIn(JSBI.BigInt(BN_ZERO.toString()));
    }
  }, [
    bnInput,
    coverPositionData.lowerPrice,
    coverPositionData.upperPrice,
    tokenOrder,
  ]);

  useEffect(() => {
    changeCoverAmounts();
  }, [tokenOrder, coverPositionData]);

  function changeCoverAmounts() {
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
      const liquidityAmount = DyDxMath.getLiquidityForAmounts(
        lowerSqrtPrice,
        upperSqrtPrice,
        lowerSqrtPrice,
        bnInput,
        BigNumber.from(String(coverMintParams.tokenInAmount))
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
      coverPoolData.volatilityTier
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
  }, [
    coverPositionData.lowerPrice,
    coverPositionData.upperPrice,
    coverMintParams.tokenInAmount,
    coverMintParams.tokenOutAmount,
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
      coverMintParams.tokenInAmount,
      signer
    );

    setMintGasFee(newMintGasFee.formattedPrice);
    setMintGasLimit(newMintGasFee.gasUnits.mul(120).div(100));
  }

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

  ////////////////////////////////Mint Button Handler

  useEffect(() => {
    setMintButtonState();
  }, [tokenIn, coverMintParams.tokenInAmount]);

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
          <span
            className="flex gap-x-1 cursor-pointer"
            onClick={() => props.goBack("initial")}
          >
            <ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " />
            <h1 className="mb-3 opacity-50 md:text-base text-sm">Back</h1>
          </span>
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
                switchDirection();
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
              tokenIn.coverUSDPrice
            ).toPrecision(6)}
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
                  Balance: {tokenIn.userBalance ?? 0}
                </div>
                {isConnected ? (
                  <button
                    className="flex md:text-xs text-[10px] uppercase text-[#C9C9C9]"
                    onClick={() => maxBalance(tokenIn.userBalance, "0")}
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
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Amount to receive</div>
          <div>
            {parseFloat(coverPositionData.lowerPrice) <
            parseFloat(coverPositionData.upperPrice) ? (
              (
                (tokenIn.coverUSDPrice / tokenOut.coverUSDPrice) *
                parseFloat(ethers.utils.formatUnits(bnInput, 18))
              ).toPrecision(6)
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
      <div className="mb-3">
        {allowanceInCover && isConnected ? (
          allowanceInCover.lt(
            BigNumber.from(coverMintParams.tokenInAmount.toString())
          ) ? (
            <CoverMintApproveButton
              poolAddress={coverPoolAddress}
              approveToken={tokenIn.address}
              amount={bnInput}
              tokenSymbol={tokenIn.symbol}
            />
          ) : (
            <CoverMintButton
              poolAddress={coverPoolAddress}
              disabled={coverMintParams.disabled}
              to={address}
              lower={TickMath.getTickAtPriceString(
                coverPositionData.lowerPrice ?? "0",
                coverPoolData.volatilityTier
                  ? parseInt(coverPoolData.volatilityTier.tickSpread)
                  : 20
              )}
              upper={TickMath.getTickAtPriceString(
                coverPositionData.upperPrice ?? "0",
                coverPoolData.volatilityTier
                  ? parseInt(coverPoolData.volatilityTier.tickSpread)
                  : 20
              )}
              amount={bnInput}
              zeroForOne={tokenOrder}
              tickSpacing={
                coverPoolData.volatilityTier
                  ? coverPoolData.volatilityTier.tickSpread
                  : 20
              }
              buttonMessage={coverMintParams.buttonMessage}
              gasLimit={mintGasLimit}
            />
          )
        ) : (
          <> </>
        )}
      </div>
    </>
  );
}
