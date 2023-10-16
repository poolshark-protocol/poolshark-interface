import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";
import PoolsModal from "../../components/Cover/PoolsModal";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import SelectToken from "../../components/SelectToken";
import {
  erc20ABI,
  useAccount,
  useProvider,
  useContractRead,
  useSigner,
  useBalance,
} from "wagmi";
import CoverMintButton from "../../components/Buttons/CoverMintButton";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import {
  chainIdsToNamesForGitTokenList,
  chainProperties,
} from "../../utils/chains";
import useInputBox from "../../hooks/useInputBox";
import { TickMath, invertPrice, roundTick } from "../../utils/math/tickMath";
import { BigNumber, ethers } from "ethers";
import { useCoverStore } from "../../hooks/useCoverStore";
import JSBI from "jsbi";
import { BN_ZERO, ZERO } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import { fetchCoverTokenUSDPrice } from "../../utils/tokens";
import inputFilter from "../../utils/inputFilter";
import CoverMintApproveButton from "../../components/Buttons/CoverMintApproveButton";
import { gasEstimateCoverMint } from "../../utils/gas";
import { volatilityTiers } from "../../utils/pools";

export default function CoverCreate() {
  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    coverMintParams,
    setCoverPositionData,
    tokenIn,
    setTokenIn,
    setTokenInCoverAllowance,
    tokenOut,
    setTokenOut,
    setTokenOutCoverUSDPrice,
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
    state.setCoverPositionData,
    state.tokenIn,
    state.setTokenIn,
    state.setTokenInCoverAllowance,
    state.tokenOut,
    state.setTokenOut,
    state.setTokenOutCoverUSDPrice,
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
  const [loadingPrices, setLoadingPrices] = useState(true);

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
  const [priceOrder, setPriceOrder] = useState(true);

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

  useEffect(() => {
    if (allowanceInCover) {
      setTokenInCoverAllowance(allowanceInCover.toString());
    }
  }, [allowanceInCover]);

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
  const [selectFromEmptyFlag, setSelectFromEmptyFlag] = useState(true);

  useEffect(() => {
    if (
      //updating feeTiers
      selectedVolatility.tickSpread == 20 ||
      selectedVolatility.tickSpread == 40 ||
      //updating from empty selected token
      (tokenOut.name != "Select Token" && selectFromEmptyFlag)
    ) {
      updatePools();
      if (selectFromEmptyFlag) {
        setSelectFromEmptyFlag(false);
      }
    }
  }, [selectedVolatility, tokenIn.name, tokenOut.name]);

  async function updatePools() {
    setCoverPoolFromVolatility(tokenIn, tokenOut, selectedVolatility);
  }

  //sames as updatePools but triggered from the html
  const handleManualVolatilityChange = async (volatility: any) => {
    setSelectedVolatility(volatility);
  };
  ////////////////////////////////Init Position Data

  useEffect(() => {
    if (coverPoolData.latestTick && coverPoolData.volatilityTier) {
      updatePositionData();
    }
  }, [tokenIn, tokenOut, coverPoolData, tokenOrder]);

  async function updatePositionData() {
    const tickAtPrice = Number(coverPoolData.latestTick);
    const tickSpread = Number(coverPoolData.volatilityTier.tickSpread);
    const lowerPrice = TickMath.getPriceStringAtTick(
      tokenOrder
        ? tickAtPrice + -tickSpread * 16
        : tickAtPrice + tickSpread * 8,
      tokenIn,
      tokenOut,
      tickSpread
    );
    const upperPrice = TickMath.getPriceStringAtTick(
      tokenOrder ? tickAtPrice - tickSpread * 6 : tickAtPrice + tickSpread * 18,
      tokenIn,
      tokenOut,
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
        ? TickMath.getTickAtPriceString(
            coverPositionData.lowerPrice,
            tokenIn,
            tokenOut,
            coverPoolData.volatilityTier.tickSpread
          )
        : TickMath.getTickAtPriceString(
            coverPositionData.upperPrice,
            tokenIn,
            tokenOut,
            coverPoolData.volatilityTier.tickSpread
          );
    const increment = parseInt(coverPoolData.volatilityTier.tickSpread);
    const adjustment =
      direction == "plus" || direction == "minus"
        ? direction == "plus"
          ? -increment
          : increment
        : 0;
    const newTick = roundTick(currentTick - adjustment, increment);
    const newPriceString = TickMath.getPriceStringAtTick(
      parseFloat(newTick.toString()),
      tokenIn,
      tokenOut,
      coverPoolData.volatilityTier.tickSpread
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
      console.log("bnInput", bnInput.toString());
      //setCoverAmountIn(JSBI.BigInt(bnInput.toString()));
    }
  }, [bnInput]);

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
        TickMath.getTickAtPriceString(
          coverPositionData.lowerPrice,
          tokenIn,
          tokenOut,
          coverPoolData.volatilityTier.tickSpread
        )
      );
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
        TickMath.getTickAtPriceString(
          coverPositionData.upperPrice,
          tokenIn,
          tokenOut,
          coverPoolData.volatilityTier.tickSpread
        )
      );
      const liquidityAmount = DyDxMath.getLiquidityForAmounts(
        lowerSqrtPrice,
        upperSqrtPrice,
        lowerSqrtPrice,
        bnInput,
        BigNumber.from(String(coverMintParams.tokenInAmount))
      );
      /*setCoverAmountOut(
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
          );*/
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
      coverPoolData.volatilityTier
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
        tokenIn,
        tokenOut,
        coverPoolData.volatilityTier.tickSpread
      ),
      TickMath.getTickAtPriceString(
        coverPositionData.lowerPrice,
        tokenIn,
        tokenOut,
        coverPoolData.volatilityTier.tickSpread
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

  const [showTooltip, setShowTooltip] = useState(false);

  /////////////////////Logic for switching price denomination

  const [minInput, setMinInput] = useState(lowerPrice);
  const [maxInput, setMaxInput] = useState(upperPrice);

  const handlePriceSwitch = () => {
    setPriceOrder(!priceOrder);
    setMaxInput(invertPrice(maxInput, false));
    setMinInput(invertPrice(minInput, false));
  };

  useEffect(() => {
    setUpperPrice(invertPrice(maxInput, priceOrder));
    setLowerPrice(invertPrice(minInput, priceOrder));
  }, [maxInput, minInput]);

  useEffect(() => {
    if (lowerPrice !== "0" && upperPrice !== "0" && loadingPrices) {
      setLoadingPrices(false);
      setMinInput(lowerPrice);
      setMaxInput(upperPrice);
    }
  }, [lowerPrice, upperPrice]);
  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="flex flex-col space-y-8 mx-auto max-w-2xl text-white pb-20">
        <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
          <h1 className="mb-4">SELECT TOKEN & AMOUNT</h1>
          <span className="text-[11px] text-grey1">AMOUNT TO SELL</span>
          <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>
                ~$
                {(
                  parseFloat(
                    ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                  ) * tokenIn.coverUSDPrice
                ).toPrecision(6)}
              </span>
              <span>BALANCE: {tokenIn.userBalance ?? 0}</span>
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              {inputBox("0", tokenIn)}
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
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center w-full pt-7 pb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 cursor-pointer"
              onClick={() => {
                switchDirection();
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
              />
            </svg>
          </div>
          <span className="text-[11px] text-grey1">AMOUNT TO BUY</span>
          <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>
                ~$
                {(
                  parseFloat(
                    ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                  ) * tokenIn.coverUSDPrice
                ).toPrecision(6)}
              </span>
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              {parseFloat(coverPositionData.lowerPrice) <
                parseFloat(coverPositionData.upperPrice) &&
              bnInput.toString() != "0" ? (
                (
                  (tokenIn.coverUSDPrice / tokenOut.coverUSDPrice) *
                  parseFloat(
                    ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                  )
                ).toPrecision(6)
              ) : (
                <>0</>
              )}
              <div className="flex items-center gap-x-2">
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
          </div>
        </div>
        <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
          <h1 className="mb-4">CHOOSE A VOLATILITY TIER</h1>
          <div className="flex md:flex-row flex-col justify-between mt-8 gap-x-10 gap-y-4">
            {volatilityTiers.map((volatilityTier, volatilityTierIdx) => (
              <div
                onClick={() => setSelectedVolatility(volatilityTier)}
                key={volatilityTierIdx}
                className={`bg-black p-4 w-full rounded-[4px] cursor-pointer transition-all ${
                  selectedVolatility === volatilityTier
                    ? "border-grey1 border bg-grey/20"
                    : "border border-grey"
                }`}
              >
                <h1>{volatilityTier.tier} FEE</h1>
                <h2 className="text-[11px] uppercase text-grey1 mt-2">
                  {volatilityTier.text}
                </h2>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
          <div className="flex mb-4 items-center justify-between">
            <h1 className="">SET A PRICE RANGE</h1>
            <div
              onClick={handlePriceSwitch}
              className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
            >
              {priceOrder ? <>{tokenIn.symbol}</> : <>{tokenOut.symbol}</>} per{" "}
              {priceOrder ? <>{tokenOut.symbol}</> : <>{tokenIn.symbol}</>}{" "}
              <DoubleArrowIcon />
            </div>
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="flex md:flex-row flex-col items-center gap-5 mt-3">
              <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                <span className="text-grey1 text-xs">MIN. PRICE</span>
                <span className="text-white text-3xl">
                  {priceOrder ? (
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
                  {priceOrder ? (
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
            {coverPoolAddress === ZERO_ADDRESS && (
            <div className="bg-black border rounded-[4px] border-grey/50 p-5">
              <p className="text-xs text-grey1 flex items-center gap-x-4 mb-5">
                This pool does not exist so you must set a starting price in order to initialize the pool before being able to add liquidity to it.
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
                    />
                </span>
              </div>
            </div>
            )}
            <div className="py-2">
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
                            coverPositionData.latestPrice,
                            tokenIn,
                            tokenOut,
                            coverPoolData.volatilityTier.tickSpread
                          )
                        : invertPrice(
                            TickMath.getPriceStringAtTick(
                              coverPositionData.latestPrice,
                              tokenIn,
                              tokenOut,
                              coverPoolData.volatilityTier.tickSpread
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
          </div>
        </div>
        {/*
      {allowanceInCover ? (
        allowanceInCover.lt(
          BigNumber.from(coverMintParams.tokenInAmount.toString())
        ) ? (
          <CoverMintApproveButton
            routerAddress={chainProperties["arbitrumGoerli"]["routerAddress"]}
            approveToken={tokenIn.address}
            amount={bnInput}
            tokenSymbol={tokenIn.symbol}
          />
        ) : (
          <CoverMintButton
                routerAddress={chainProperties["arbitrumGoerli"]["routerAddress"]}
                poolAddress={coverPoolAddress}
                disabled={coverMintParams.disabled}
                to={address}
                lower={TickMath.getTickAtPriceString(
                  coverPositionData.lowerPrice ?? "0",
                  tokenIn,
                  tokenOut,
                  coverPoolData.volatilityTier
                    ? parseInt(coverPoolData.volatilityTier.tickSpread)
                    : 20
                )}
                upper={TickMath.getTickAtPriceString(
                  coverPositionData.upperPrice ?? "0",
                  tokenIn,
                  tokenOut,
                  coverPoolData.volatilityTier
                    ? parseInt(coverPoolData.volatilityTier.tickSpread)
                    : 20
                )}
                amount={bnInput}
                zeroForOne={tokenOrder}
                tickSpacing={coverPoolData.volatilityTier
                  ? coverPoolData.volatilityTier.tickSpread
                  : 20}
                buttonMessage={coverMintParams.buttonMessage}
                gasLimit={mintGasLimit} 
                setSuccessDisplay={undefined} 
                setErrorDisplay={undefined} 
                setIsLoading={undefined} 
                setTxHash={undefined}          />
        )
      ) : (
        <> </>
      )} */}
      </div>
    </div>
  );
}
