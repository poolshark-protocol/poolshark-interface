import { ChevronDownIcon, ArrowLongRightIcon } from "@heroicons/react/20/solid";
import SelectToken from "../SelectToken";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useWalletClient,
  useBalance,
} from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import {
  chainIdsToNames,
  chainProperties,
} from "../../utils/chains";
import { useEffect, useMemo, useState } from "react";
import useInputBox from "../../hooks/useInputBox";
import { TickMath, invertPrice, roundTick } from "../../utils/math/tickMath";
import { BigNumber, ethers } from "ethers";
import { useCoverStore } from "../../hooks/useCoverStore";
import { BN_ZERO, ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import { fetchCoverTokenUSDPrice } from "../../utils/tokens";
import inputFilter from "../../utils/inputFilter";
import CoverMintApproveButton from "../Buttons/CoverMintApproveButton";
import {
  gasEstimateCoverCreateAndMint,
  gasEstimateCoverMint,
} from "../../utils/gas";
import { coverPoolTypes, volatilityTiers } from "../../utils/pools";
import router from "next/router";
import CoverCreateAndMintButton from "../Buttons/CoverCreateAndMintButton";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { getExpectedAmountOutFromInput } from "../../utils/math/priceMath";
import PositionMintModal from "../Modals/PositionMint";
import { useConfigStore } from "../../hooks/useConfigStore";
import { coverPoolFactoryABI } from "../../abis/evm/coverPoolFactory";
import { getRouterAddress } from "../../utils/config";
import { convertBigIntAndBigNumber } from "../../utils/misc";

export default function CreateCover(props: any) {
  const [chainId, networkName, coverSubgraph, coverFactoryAddress] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.coverSubgraph,
    state.coverFactoryAddress,
  ]);

  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    coverMintParams,
    setCoverPositionData,
    tokenIn,
    setTokenIn,
    setTokenInAmount,
    setTokenInCoverAllowance,
    //setCoverAmountIn,
    tokenOut,
    setTokenOut,
    setTokenOutAmount,
    setTokenOutCoverUSDPrice,
    //setCoverAmountOut,
    latestTick,
    setLatestTick,
    inputPoolExists,
    setInputPoolExists,
    twapReady,
    setTwapReady,
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
    needsLatestTick,
    setNeedsLatestTick,
  ] = useCoverStore((state) => [
    state.coverPoolAddress,
    state.coverPoolData,
    state.coverPositionData,
    state.coverMintParams,
    state.setCoverPositionData,
    state.tokenIn,
    state.setTokenIn,
    state.setTokenInAmount,
    state.setTokenInCoverAllowance,
    //state.setCoverAmountIn,
    state.tokenOut,
    state.setTokenOut,
    state.setTokenOutAmount,
    state.setTokenOutCoverUSDPrice,
    //state.setCoverAmountOut,
    state.latestTick,
    state.setLatestTick,
    state.inputPoolExists,
    state.setInputPoolExists,
    state.twapReady,
    state.setTwapReady,
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
    state.needsLatestTick,
    state.setNeedsLatestTick,
  ]);

  const { data: signer } = useWalletClient();
  const { address, isConnected, isDisconnected } = useAccount();
  const { setBnInput, bnInput, inputBox, setDisplay, display } = useInputBox();
  const [loadingPrices, setLoadingPrices] = useState(true);

  // for mint modal
  const [successDisplay, setSuccessDisplay] = useState(false);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState();

  ////////////////////////////////Chain
  const [stateChainName, setStateChainName] = useState();

  useEffect(() => {
    setStateChainName(chainIdsToNames[chainId]);
  }, [chainId]);

  ////////////////////////////////TokenOrder
  const [priceOrder, setPriceOrder] = useState(true);

  useEffect(() => {
    if (coverPoolAddress != undefined && coverPoolAddress != ZERO_ADDRESS) {
      setNeedsLatestTick(true);
    }
  }, [coverPoolAddress, router.isReady]);

  ////////////////////////////////Token Allowances

  const { data: allowanceInCoverInt } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, getRouterAddress(networkName)],
    chainId: chainId,
    watch: needsAllowance && !tokenIn.native,
    enabled: tokenIn.address != undefined,
    onSuccess(data) {
      // setNeedsAllowance(false);
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {},
  });

  const allowanceInCover = useMemo(() =>convertBigIntAndBigNumber(allowanceInCoverInt), [allowanceInCoverInt]);

  useEffect(() => {
    if (allowanceInCover) {
      setTokenInCoverAllowance(allowanceInCover.toString());
    }
  }, [allowanceInCover]);

  ////////////////////////////////Token Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.native ? undefined : tokenIn.address,
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
  }, [coverPoolData, tokenIn.callId, tokenOut.callId]);

  ////////////////////////////////Latest Tick

  const { data: newLatestTick } = useContractRead({
    address: coverFactoryAddress,
    abi: coverPoolFactoryABI,
    functionName: "syncLatestTick",
    args: [
      {
        poolType: coverPoolTypes['constant-product']['poolshark'],
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        feeTier: coverPoolData.volatilityTier?.feeAmount,
        tickSpread: coverPoolData.volatilityTier?.tickSpread,
        twapLength: coverPoolData.volatilityTier?.twapLength
      }
    ],
    chainId: chainId,
    enabled: coverPoolData.volatilityTier != undefined,
    watch: needsLatestTick,
    onSuccess(data) {
      setNeedsLatestTick(false);
      // console.log('Success syncLatestTick', newLatestTick, tokenIn.address, tokenOut.address, coverPoolData.volatilityTier)
    },
    onError(error) {
      console.log("Error syncLatestTick", tokenIn.address, tokenOut.address, coverPoolData.volatilityTier.feeAmount, coverPoolData.volatilityTier.tickSpread, coverPoolData.volatilityTier.twapLength, error);
    },
    onSettled(data, error) {},
  });

  useEffect(() => {
    if (newLatestTick) {
      // if underlying pool does not exist or twap not ready
      if (!newLatestTick[1] || !newLatestTick[2]) {
        setBnInput(BN_ZERO)
        setDisplay('')
        setLowerPrice('')
        setUpperPrice('')
      } else {
        setLatestTick(parseInt(newLatestTick[0].toString()));
      }
      setInputPoolExists(newLatestTick[1]);
      setTwapReady(newLatestTick[2]);
    }
  }, [newLatestTick]);

  //////////////////////////////Cover Pool Data

  useEffect(() => {
    if (
      //updating from empty selected token
      tokenOut.name != "Select Token"
    ) {
      updatePools("1000");
      setNeedsLatestTick(true);
    }
  }, [tokenIn.name, tokenOut.name]);

  async function updatePools(feeAmount: string) {
    setCoverPoolFromVolatility(tokenIn, tokenOut, feeAmount, coverSubgraph);
  }

  //sames as updatePools but triggered from the html
  const handleManualVolatilityChange = async (feeAmount: string) => {
    updatePools(feeAmount);
    setNeedsLatestTick(true);
  };

  ////////////////////////////////Init Position Data

  useEffect(() => {
    if (latestTick != undefined && coverPoolData.volatilityTier && inputPoolExists && twapReady) {
      updatePositionData();
    }
  }, [tokenIn.address, tokenOut.address, coverPoolData, latestTick, inputPoolExists, twapReady]);

  async function updatePositionData() {
    const tickAtPrice = Number(latestTick);
    const tickSpread = Number(coverPoolData.volatilityTier.tickSpread);
    const priceLower = TickMath.getPriceStringAtTick(
      tokenIn.callId == 0
        ? tickAtPrice + -tickSpread * 16
        : tickAtPrice + tickSpread * 8,
      tokenIn,
      tokenOut,
      tickSpread
    );
    const priceUpper = TickMath.getPriceStringAtTick(
      tokenIn.callId == 0
        ? tickAtPrice - tickSpread * 6
        : tickAtPrice + tickSpread * 18,
      tokenIn,
      tokenOut,
      tickSpread
    );
    setLowerPrice(
      invertPrice(priceOrder ? priceLower : priceUpper, priceOrder)
    );
    setUpperPrice(
      invertPrice(priceOrder ? priceUpper : priceLower, priceOrder)
    );
    setCoverPositionData({
      ...coverPositionData,
      tickAtPrice: tickAtPrice,
      lowerPrice: priceLower,
      upperPrice: priceUpper,
    });
  }

  ////////////////////////////////Position Price Delta
  const [lowerPrice, setLowerPrice] = useState("0");
  const [upperPrice, setUpperPrice] = useState("0");

  useEffect(() => {
    setCoverPositionData({
      ...coverPositionData,
      lowerPrice: invertPrice(priceOrder ? lowerPrice : upperPrice, priceOrder),
      upperPrice: invertPrice(priceOrder ? upperPrice : lowerPrice, priceOrder),
    });
  }, [lowerPrice, upperPrice]);

  /* const changePrice = (direction: string, inputId: string) => {
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
  }; */

  ////////////////////////////////Position Amount Calculations

  // set amount in
  useEffect(() => {
    setTokenInAmount(bnInput);
  }, [bnInput, tokenIn.address]);

  useEffect(() => {
    setCoverAmounts();
  }, [tokenIn.address, coverPositionData]);

  function setCoverAmounts() {
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
          tokenOut
        )
      );
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
        TickMath.getTickAtPriceString(
          coverPositionData.upperPrice,
          tokenIn,
          tokenOut
        )
      );
      const liquidityAmount = DyDxMath.getLiquidityForAmounts(
        lowerSqrtPrice,
        upperSqrtPrice,
        lowerSqrtPrice,
        bnInput,
        BigNumber.from(String(coverMintParams.tokenInAmount))
      );
      setTokenOutAmount(
        BigNumber.from(
          tokenIn.callId == 0
            ? DyDxMath.getDy(
                liquidityAmount,
                lowerSqrtPrice,
                upperSqrtPrice,
                true
              ).toString()
            : DyDxMath.getDx(
                liquidityAmount,
                lowerSqrtPrice,
                upperSqrtPrice,
                true
              ).toString()
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
      coverPoolData.volatilityTier &&
      latestTick != undefined
    )
      changeValidBounds();
  }, [coverPositionData.lowerPrice, coverPositionData.upperPrice, latestTick]);

  const changeValidBounds = () => {
    if (coverPositionData.lowerPrice && coverPositionData.upperPrice) {
      setValidBounds(
        BigNumber.from(parseInt(coverPositionData.lowerPrice)).lt(
          BigNumber.from(latestTick).sub(
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
      !needsLatestTick &&
      coverPositionData.lowerPrice &&
      coverPositionData.upperPrice &&
      coverPoolData.volatilityTier &&
      coverMintParams.tokenInAmount &&
      tokenIn.userRouterAllowance &&
      tokenIn.userRouterAllowance >= 
        parseInt(bnInput.toString()) &&
      (coverPoolAddress != ZERO_ADDRESS ? twapReady &&
                                          bnInput.gt(BN_ZERO) &&
                                          coverPositionData.lowerPrice > 0 &&
                                          coverPositionData.upperPrice > 0 // twap must be ready if pool exists
                                        : inputPoolExists) // input pool must exist to create pool
    )
      updateGasFee();
  }, [
    coverPoolAddress,
    coverPositionData.lowerPrice,
    coverPositionData.upperPrice,
    coverMintParams.tokenInAmount,
    coverMintParams.tokenOutAmount,
    tokenIn.userRouterAllowance,
    tokenIn,
    tokenOut,
    latestTick,
    needsLatestTick,
  ]);

  async function updateGasFee() {
    const newMintGasFee =
      coverPoolAddress != ZERO_ADDRESS
        ? await gasEstimateCoverMint(
            coverPoolAddress,
            address,
            TickMath.getTickAtPriceString(
              coverPositionData.upperPrice,
              tokenIn,
              tokenOut,
              parseInt(coverPoolData.volatilityTier.tickSpread)
            ),
            TickMath.getTickAtPriceString(
              coverPositionData.lowerPrice,
              tokenIn,
              tokenOut,
              parseInt(coverPoolData.volatilityTier.tickSpread)
            ),
            tokenIn,
            tokenOut,
            coverMintParams.tokenInAmount,
            signer,
            networkName
          )
        : await gasEstimateCoverCreateAndMint(
            coverPoolData.volatilityTier,
            address,
            TickMath.getTickAtPriceString(
              coverPositionData.upperPrice,
              tokenIn,
              tokenOut,
              parseInt(coverPoolData.volatilityTier.tickSpread)
            ),
            TickMath.getTickAtPriceString(
              coverPositionData.lowerPrice,
              tokenIn,
              tokenOut,
              parseInt(coverPoolData.volatilityTier.tickSpread)
            ),
            tokenIn,
            tokenOut,
            coverMintParams.tokenInAmount,
            signer,
            networkName,
            twapReady
          );

    if (!newMintGasFee.gasUnits.mul(120).div(100).eq(mintGasLimit)) {
      setMintGasFee(newMintGasFee.formattedPrice);
      setMintGasLimit(newMintGasFee.gasUnits.mul(120).div(100));
    }
  }

  ////////////////////////////////Mint Button Handler

  useEffect(() => {
    setMintButtonState();
  }, [tokenIn, coverMintParams.tokenInAmount, coverMintParams.tokenOutAmount, twapReady, inputPoolExists, coverPoolAddress]);

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
                    tokenOut.decimals
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

  ///////////////////// Switch Price denomination

  const handlePriceSwitch = () => {
    setPriceOrder(!priceOrder);
    setLowerPrice(invertPrice(upperPrice, false));
    setUpperPrice(invertPrice(lowerPrice, false));
  };

  return (
    <div className="flex flex-col space-y-8">
      <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
        <div className="flex mb-4 items-center justify-between">
          <h1 className="">SELECT TOKEN & AMOUNT</h1>
          <div
            onClick={() => {
              switchDirection();
            }}
            className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
          >
            Switch directions
            <DoubleArrowIcon />
          </div>
        </div>
        <span className="text-[11px] text-grey1">AMOUNT TO SELL</span>
        <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
          <div className="flex items-end justify-between text-[11px] text-grey1">
            <span>
              ~$
              {(
                parseFloat(
                  ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                ) * tokenIn.coverUSDPrice
              ).toFixed(2)}
            </span>
            <span>BALANCE: {tokenIn.userBalance ?? 0}</span>
          </div>
          <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
            {inputBox("0", tokenIn, undefined, undefined, !inputPoolExists || !twapReady)}
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
                amount={display}
                isAmountIn={true}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center w-full pt-7 pb-4">
          <ArrowLongRightIcon
            className="w-7 cursor-pointer hover:-rotate-90 rotate-90 transition-all"
            onClick={() => {
              switchDirection();
            }}
          />
        </div>
        <span className="text-[11px] text-grey1">AMOUNT TO BUY</span>
        <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
          <div className="flex items-end justify-between text-[11px] text-grey1">
            <span>
              ~$
              {(
                parseFloat(
                  ethers.utils.formatUnits(
                    getExpectedAmountOutFromInput(
                      TickMath.getTickAtPriceString(
                        coverPositionData.lowerPrice,
                        tokenIn,
                        tokenOut
                      ),
                      TickMath.getTickAtPriceString(
                        coverPositionData.upperPrice,
                        tokenIn,
                        tokenOut
                      ),
                      tokenIn.callId == 0, // direction is reversed for cover
                      bnInput
                    ),
                    tokenOut.decimals
                  )
                ) * (!isNaN(tokenOut.coverUSDPrice) ? tokenOut.coverUSDPrice : 0)
              ).toFixed(2)}
            </span>
          </div>
          <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
            {parseFloat(coverPositionData.lowerPrice) <
              parseFloat(coverPositionData.upperPrice) &&
            bnInput.toString() != "0" ? (
              // 1
              parseFloat(
                ethers.utils.formatUnits(
                  getExpectedAmountOutFromInput(
                    TickMath.getTickAtPriceString(
                      coverPositionData.lowerPrice,
                      tokenIn,
                      tokenOut
                    ),
                    TickMath.getTickAtPriceString(
                      coverPositionData.upperPrice,
                      tokenIn,
                      tokenOut
                    ),
                    tokenIn.callId == 0, // direction is reversed for cover
                    bnInput
                  ),
                  tokenOut.decimals
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
                amount={display}
                isAmountIn={true}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
        <div className="flex mb-4 items-center justify-between">
          <h1 className="">SET A PRICE RANGE</h1>
          <div
            onClick={handlePriceSwitch}
            className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
          >
            {priceOrder == (tokenIn.callId == 0) ? (
              <>{tokenOut.symbol}</>
            ) : (
              <>{tokenIn.symbol}</>
            )}{" "}
            per{" "}
            {priceOrder == (tokenIn.callId == 0) ? (
              <>{tokenIn.symbol}</>
            ) : (
              <>{tokenOut.symbol}</>
            )}{" "}
            <DoubleArrowIcon />
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div className="flex md:flex-row flex-col items-center gap-5 mt-3">
            <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
              <span className="text-grey1 text-xs">MIN. PRICE</span>
              <span className="text-white text-3xl">
                {
                  <input
                    autoComplete="off"
                    className="bg-black py-2 outline-none text-center w-full"
                    placeholder="0"
                    id="minInput"
                    type="text"
                    disabled={!inputPoolExists || !twapReady}
                    value={lowerPrice}
                    onChange={(e) => setLowerPrice(inputFilter(e.target.value))}
                  />
                }
              </span>
            </div>
            <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
              <span className="text-grey1 text-xs">MAX. PRICE</span>
              <span className="text-white text-3xl">
                {
                  <input
                    autoComplete="off"
                    className="bg-black py-2 outline-none text-center w-full"
                    placeholder="0"
                    id="maxInput"
                    type="text"
                    disabled={!inputPoolExists || !twapReady}
                    value={upperPrice}
                    onChange={(e) => setUpperPrice(inputFilter(e.target.value))}
                  />
                }
              </span>
            </div>
          </div>
          <div className="py-2">
            <div
              className="flex px-2 cursor-pointer"
              onClick={() => setExpanded(!expanded)}
            >
              <div className="flex-none text-xs uppercase text-[#C9C9C9]">
                {1}{" "}
                {priceOrder == (tokenIn.callId == 0)
                  ? tokenIn.symbol
                  : tokenOut.symbol}{" "}
                =
                {" " +
                  (twapReady ? parseFloat(
                    invertPrice(
                      TickMath.getPriceStringAtTick(
                        latestTick,
                        tokenIn,
                        tokenOut
                      ),
                      priceOrder
                    )
                  ).toPrecision(5)
                : '?.??') +
                  " " +
                  (priceOrder == (tokenIn.callId == 0)
                    ? tokenOut.symbol
                    : tokenIn.symbol)}
                {/* {!tokenIn.coverUSDPrice
                  ? "?" + " " + tokenOut.symbol
                  : (tokenIn.callId == 0
                      ? TickMath.getPriceStringAtTick(
                          parseInt(latestTick),
                          parseInt(coverPoolData.volatilityTier.tickSpread)
                        )
                      : invertPrice(
                          TickMath.getPriceStringAtTick(
                            parseInt(latestTick),
                            parseInt(coverPoolData.volatilityTier.tickSpread)
                          ),
                          false
                        )) +
                    " " +
                    tokenOut.symbol} */}
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
      <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
        <h1 className="mb-4">CHOOSE A VOLATILITY TIER</h1>
        <div className="flex md:flex-row flex-col justify-between mt-8 gap-x-10 gap-y-4">
          {volatilityTiers.map((volatilityTier, volatilityTierIdx) => (
            <div
              onClick={() => {
                handleManualVolatilityChange(
                  volatilityTier.feeAmount.toString()
                );
              }}
              key={volatilityTierIdx}
              className={`bg-black p-4 w-full rounded-[4px] cursor-pointer transition-all ${
                coverPoolData?.volatilityTier?.feeAmount.toString() ===
                volatilityTier.feeAmount.toString()
                  ? "border-grey1 border bg-grey/20"
                  : "border border-grey"
              }`}
            >
              <h1>{volatilityTier.tier}</h1>
              <h2 className="text-[11px] uppercase text-grey1 mt-2">
                {volatilityTier.text}
              </h2>
            </div>
          ))}
        </div>
      </div>
      {allowanceInCover ? (
        allowanceInCover.lt(coverMintParams.tokenInAmount) && !tokenIn.native ? (
          <CoverMintApproveButton
            routerAddress={getRouterAddress(networkName)}
            approveToken={tokenIn.address}
            amount={bnInput}
            tokenSymbol={tokenIn.symbol}
          />
        ) : coverPoolAddress != ZERO_ADDRESS ? (
          <CoverMintButton
            routerAddress={getRouterAddress(networkName)}
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
            zeroForOne={tokenIn.callId == 0}
            tickSpacing={
              coverPoolData.volatilityTier
                ? coverPoolData.volatilityTier.tickSpread
                : 20
            }
            buttonMessage={coverMintParams.buttonMessage}
            gasLimit={mintGasLimit}
            setSuccessDisplay={setSuccessDisplay}
            setErrorDisplay={setErrorDisplay}
            setIsLoading={setIsLoading}
            setTxHash={setTxHash}
          />
        ) : (
          <CoverCreateAndMintButton
            routerAddress={getRouterAddress(networkName)}
            poolType={coverPoolTypes['constant-product']['poolshark']}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            volTier={
              coverPoolData.volatilityTier
                ? coverPoolData.volatilityTier
                : volatilityTiers[0]
            }
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
            zeroForOne={tokenIn.callId == 0}
            tickSpacing={
              coverPoolData.volatilityTier
                ? coverPoolData.volatilityTier.tickSpread
                : 20
            }
            buttonMessage={coverMintParams.buttonMessage}
            gasLimit={mintGasLimit}
            setSuccessDisplay={setSuccessDisplay}
            setErrorDisplay={setErrorDisplay}
            setIsLoading={setIsLoading}
            setTxHash={setTxHash}
          />
        )
      ) : (
        <> </>
      )}
      <PositionMintModal
        hash={txHash}
        type={"cover"}
        errorDisplay={errorDisplay}
        successDisplay={successDisplay}
        isLoading={isLoading}
      />
    </div>
  );
}
