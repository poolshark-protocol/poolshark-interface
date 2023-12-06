import { ChevronDownIcon, ArrowLongRightIcon } from "@heroicons/react/20/solid";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useSigner,
  useBalance,
} from "wagmi";
import DoubleArrowIcon from "../Icons/DoubleArrowIcon";
import CoverMintButton from "../Buttons/CoverMintButton";
import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import JSBI from "jsbi";
import { TickMath, invertPrice } from "../../utils/math/tickMath";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import CoverMintApproveButton from "../Buttons/CoverMintApproveButton";
import CoverCreateAndMintButton from "../Buttons/CoverCreateAndMintButton";
import { fetchCoverTokenUSDPrice } from "../../utils/tokens";
import inputFilter from "../../utils/inputFilter";
import {
  gasEstimateCoverCreateAndMint,
  gasEstimateCoverMint,
} from "../../utils/gas";
import { useCoverStore } from "../../hooks/useCoverStore";
import {
  chainIdsToNames,
  chainProperties,
} from "../../utils/chains";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { coverPoolTypes, volatilityTiers } from "../../utils/pools";
import { useRouter } from "next/router";
import PositionMintModal from "../Modals/PositionMint";
import { useConfigStore } from "../../hooks/useConfigStore";
import { fetchRangePositions } from "../../utils/queries";
import { mapUserRangePositions } from "../../utils/maps";
import { coverPoolFactoryABI } from "../../abis/evm/coverPoolFactory";
export default function CoverExistingPool({ goBack }) {
  const [
    chainId,
    networkName,
    limitSubgraph,
    coverSubgraph,
    coverFactoryAddress,
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.limitSubgraph,
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
    setTokenInCoverAllowance,
    setTokenInAmount,
    tokenOut,
    setTokenOutAmount,
    setTokenInCoverUSDPrice,
    setTokenOutCoverUSDPrice,
    /* setCoverAmountIn,
    setCoverAmountOut, */
    latestTick,
    setLatestTick,
    inputPoolExists,
    setInputPoolExists,
    twapReady,
    setTwapReady,
    pairSelected,
    switchDirection,
    setCoverPoolFromVolatility,
    needsAllowance,
    setNeedsAllowance,
    setMintButtonState,
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
    state.setTokenInCoverAllowance,
    state.setTokenInAmount,
    state.tokenOut,
    state.setTokenOutAmount,
    state.setTokenInCoverUSDPrice,
    state.setTokenOutCoverUSDPrice,
    /* state.setCoverAmountIn,
    state.setCoverAmountOut, */
    state.latestTick,
    state.setLatestTick,
    state.inputPoolExists,
    state.setInputPoolExists,
    state.twapReady,
    state.setTwapReady,
    state.pairSelected,
    state.switchDirection,
    state.setCoverPoolFromVolatility,
    state.needsAllowance,
    state.setNeedsAllowance,
    state.setMintButtonState,
    state.setTokenInBalance,
    state.needsBalance,
    state.setNeedsBalance,
    state.needsLatestTick,
    state.setNeedsLatestTick,
  ]);

  const [rangePositionData, setRangePositionData] = useRangeLimitStore(
    (state) => [state.rangePositionData, state.setRangePositionData]
  );

  // for mint modal
  const [successDisplay, setSuccessDisplay] = useState(false);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState();

  const { data: signer } = useSigner();
  const { address, isConnected, isDisconnected } = useAccount();

  const router = useRouter();

  ////////////////////////////////Chain
  const [stateChainName, setStateChainName] = useState();

  useEffect(() => {
    setStateChainName(chainIdsToNames[chainId]);
  }, [chainId]);

  ////////////////////////////////Token Order
  const [priceOrder, setPriceOrder] = useState(true);

  useEffect(() => {
    if (coverPoolAddress != undefined && coverPoolAddress != ZERO_ADDRESS) {
      setNeedsLatestTick(true);
    }
  }, [coverPoolAddress]);

  ////////////////////////////////Token Allowances

  const { data: allowanceInCover } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties[networkName]["routerAddress"]],
    chainId: chainId,
    watch: needsAllowance && !tokenIn.native,
    enabled: tokenIn.address != ZERO_ADDRESS,
    onSuccess(data) {
      // setNeedsAllowance(false);
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
    token: tokenIn.native ? undefined: tokenIn.address,
    enabled: tokenIn.address != ZERO_ADDRESS && needsBalance,
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
  }, [coverPoolData, tokenIn.callId == 0]);

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
        setLowerPrice('')
        setUpperPrice('')
        setTokenOutAmount(BN_ZERO)
      } else {
        setLatestTick(parseInt(newLatestTick[0].toString()));
      }
      setInputPoolExists(newLatestTick[1]);
      setTwapReady(newLatestTick[2]);
    }
  }, [newLatestTick, router.isReady]);

  //////////////////////////////Cover Pool Data

  useEffect(() => {
    if (
      //updating from empty selected token
      tokenOut.name != "Select Token"
    ) {
      updatePools("1000"); // should match fee tier of position by default
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

  //positionData set at pool data change
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

  // const changePrice = (direction: string, inputId: string) => {
  //   if (!coverPoolData.volatilityTier.tickSpread) return;
  //   const currentTick =
  //     inputId == "minInput"
  //       ? TickMath.getTickAtPriceString(coverPositionData.lowerPrice)
  //       : TickMath.getTickAtPriceString(coverPositionData.upperPrice);
  //   const increment = parseInt(coverPoolData.volatilityTier.tickSpread);
  //   const adjustment =
  //     direction == "plus" || direction == "minus"
  //       ? direction == "plus"
  //         ? -increment
  //         : increment
  //       : 0;
  //   const newTick = roundTick(currentTick - adjustment, increment);
  //   const newPriceString = TickMath.getPriceStringAtTick(
  //     parseFloat(newTick.toString())
  //   );
  //   (document.getElementById(inputId) as HTMLInputElement).value =
  //     parseFloat(newPriceString).toFixed(6);
  //   if (inputId === "minInput") {
  //     setLowerPrice(newPriceString);
  //   }
  //   if (inputId === "maxInput") {
  //     setUpperPrice(newPriceString);
  //   }
  // };

  ////////////////////////////////Position Amount Calculations
  const [sliderValue, setSliderValue] = useState(50);

  // set amount in
  /* useEffect(() => {
    setCoverAmountIn(JSBI.BigInt(coverMintParams.tokenInAmount.toString()));
  }, [coverPositionData.lowerPrice, coverPositionData.upperPrice, tokenIn.callId == 0]); */

  useEffect(() => {
    if (coverPoolData.volatilityTier == undefined) {
      setCoverPoolFromVolatility(tokenIn, tokenOut, "1000", coverSubgraph);
    }
    refetchRangePositionData();
    setCoverAmounts();
  }, [
    coverPoolData,
    coverPositionData,
    sliderValue,
    lowerPrice,
    upperPrice,
    tokenIn.callId == 0,
    rangePositionData != undefined,
    router.isReady,
  ]);

  async function refetchRangePositionData() {
    //refetch rangePositionData frm positionId in router params
    const data = await fetchRangePositions(limitSubgraph, address);
    if (data["data"]) {
      const positions = mapUserRangePositions(data["data"].rangePositions);
      const positionId = router.query.id;
      const position = positions.find(
        (position) => position.id == positionId
      );
      if (position) {
        setRangePositionData(position);
      }
    }
  }

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
      if (rangePositionData?.userLiquidity == undefined) {
        setTokenInAmount(BN_ZERO);
        setTokenOutAmount(BN_ZERO);
        return;
      }
      const liquidityAmount = JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(Math.round(rangePositionData.userLiquidity)),
          JSBI.BigInt(parseFloat(sliderValue.toString()))
        ),
        JSBI.BigInt(100)
      );
      setTokenInAmount(
        BigNumber.from(
          tokenIn.callId == 0
            ? DyDxMath.getDx(
                liquidityAmount,
                lowerSqrtPrice,
                upperSqrtPrice,
                true
              ).toString()
            : DyDxMath.getDy(
                liquidityAmount,
                lowerSqrtPrice,
                upperSqrtPrice,
                true
              ).toString()
        )
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
        parseInt(coverMintParams.tokenInAmount.toString()) &&
      (coverPoolAddress != ZERO_ADDRESS ? twapReady &&
                                          parseInt(coverMintParams.tokenInAmount.toString()) > 0 &&
                                          coverPositionData.lowerPrice > 0 &&
                                          coverPositionData.upperPrice > 0 // twap must be ready if pool exists
                                        : inputPoolExists) // input pool must exist to create pool
    )
      updateGasFee();
  }, [
    coverPoolAddress,
    coverMintParams.tokenInAmount,
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
              parseInt(coverPoolData.volatilityTier.tickSpread ?? 20)
            ),
            TickMath.getTickAtPriceString(
              coverPositionData.lowerPrice,
              tokenIn,
              tokenOut,
              parseInt(coverPoolData.volatilityTier.tickSpread ?? 20)
            ),
            tokenIn,
            tokenOut,
            coverMintParams.tokenInAmount,
            signer,
            networkName
          )
        : await gasEstimateCoverCreateAndMint(
            coverPoolData.volatilityTier
              ? coverPoolData.volatilityTier
              : volatilityTiers[0],
            address,
            TickMath.getTickAtPriceString(
              coverPositionData.upperPrice,
              tokenIn,
              tokenOut,
              parseInt(coverPoolData.volatilityTier.tickSpread ?? 20)
            ),
            TickMath.getTickAtPriceString(
              coverPositionData.lowerPrice,
              tokenIn,
              tokenOut,
              parseInt(coverPoolData.volatilityTier.tickSpread ?? 20)
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
  }, [tokenIn, coverMintParams.tokenInAmount, coverPoolAddress, inputPoolExists, twapReady]);

  ////////////////////////////////Slider Value change
  const [sliderDisplay, setSliderDisplay] = useState(0);
  const [sliderController, setSliderController] = useState(false);

  useEffect(() => {
    setSliderDisplay(50);
  }, [router.isReady]);

  const handleChange = (event: any) => {
    setSliderDisplay(event.target.value);
    if (!sliderController) {
      setSliderController(true);
      setTimeout(() => {
        setSliderController(false);
        setSliderValue(event.target.value);
      }, 1000);
    }
  };

  //////////////////////////////// Switch Price denomination

  const handlePriceSwitch = () => {
    setPriceOrder(!priceOrder);
    setLowerPrice(invertPrice(upperPrice, false));
    setUpperPrice(invertPrice(lowerPrice, false));
  };

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

  return (
    <div className="flex flex-col space-y-8">
      <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
        <div className="flex mb-4 items-center justify-between">
          <h1 className="">SELECT TOKENS</h1>
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

        <div className="flex justify-between md:justify-start gap-x-4 items-center">
          <button className="flex w-full items-center gap-x-3 bg-black border border-grey md:px-4 px-2 py-1.5 rounded-[4px]">
            <div className="flex md:text-base text-sm items-center gap-x-2 w-full">
              <img className="md:w-7 w-6" src={tokenIn.logoURI} />
              {tokenIn.symbol}
            </div>
          </button>
          <ArrowLongRightIcon
            className="w-14 cursor-pointer hover:rotate-180 transition-all"
            onClick={() => {
              switchDirection();
            }}
          />
          <button className="flex w-full items-center gap-x-3 bg-black border border-grey md:px-4 px-2 py-1.5 rounded-[4px]">
            <div className="flex md:text-base text-sm items-center gap-x-2 w-full">
              <img className="md:w-7 w-6" src={tokenOut.logoURI} />
              {tokenOut.symbol}
            </div>
          </button>
        </div>
      </div>
      <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px]">
        <h1 className="mb-4">SELECT AMOUNT</h1>
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
            value={sliderDisplay}
            disabled={!inputPoolExists || !twapReady}
            onChange={handleChange}
            className="w-full styled-slider slider-progress bg-transparent"
          />
        </div>
        <div className="flex justify-between items-center text-sm mt-3">
          <div className="text-[#646464] md:text-sm text-xs">
            Percentage Covered
          </div>
          <div className="flex gap-x-1 items-center ">
            <input
              autoComplete="off"
              type="text"
              id="input"
              onChange={handleChange}
              value={sliderDisplay}
              className="text-right placeholder:text-grey1 text-white text-xl w-20 focus:ring-0 focus:ring-offset-0 focus:outline-none bg-black"
            />
            <div className="mt-1">%</div>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm mt-4">
          <div className="text-[#646464] md:text-sm text-xs">
            Amount to sell
          </div>
          <div className="gap-x-2 flex items-center justify-end">
            <span className="text-lg">
              {Number(
                ethers.utils.formatUnits(
                  coverMintParams.tokenInAmount.toString(),
                  tokenIn.decimals
                )
              ).toPrecision(5)}
            </span>
            <span className="mt-1">{tokenIn.symbol}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="text-[#646464] md:text-sm text-xs">Amount to buy</div>
          <div className="flex items-center justify-end gap-x-2">
            <div className="bg-black text-right w-32 py-1 placeholder:text-grey1 text-white text-lg">
              {Number.parseFloat(
                ethers.utils.formatUnits(
                  String(coverMintParams.tokenOutAmount),
                  tokenOut.decimals
                )
              ).toPrecision(5)}
            </div>

            <div className="">{tokenOut.symbol}</div>
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
        <div className="flex md:flex-row flex-col justify-between mt-8 gap-x-10 gap-y-5">
          {volatilityTiers.map((volatilityTier, volatilityTierIdx) => (
            <div
              onClick={() => {
                handleManualVolatilityChange(
                  volatilityTier.feeAmount.toString()
                );
              }}
              key={volatilityTierIdx}
              className={`bg-black p-4 w-full rounded-[4px] cursor-pointer transition-all ${
                coverPoolData?.volatilityTier?.feeAmount ===
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
            routerAddress={chainProperties[networkName]["routerAddress"]}
            approveToken={tokenIn.address}
            amount={String(coverMintParams.tokenInAmount)}
            tokenSymbol={tokenIn.symbol}
          />
        ) : coverPoolAddress != ZERO_ADDRESS ? (
          <CoverMintButton
            routerAddress={chainProperties[networkName]["routerAddress"]}
            poolAddress={coverPoolAddress}
            disabled={coverMintParams.disabled}
            buttonMessage={coverMintParams.buttonMessage}
            to={address}
            lower={
              coverPositionData.lowerPrice
                ? TickMath.getTickAtPriceString(
                    coverPositionData.lowerPrice ?? "0",
                    tokenIn,
                    tokenOut,
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
                    tokenIn,
                    tokenOut,
                    coverPoolData.volatilityTier
                      ? parseInt(coverPoolData.volatilityTier.tickSpread)
                      : 20
                  )
                : 0
            }
            amount={String(coverMintParams.tokenInAmount)}
            zeroForOne={tokenIn.callId == 0}
            tickSpacing={
              coverPoolData.volatilityTier
                ? coverPoolData.volatilityTier.tickSpread
                : 20
            }
            gasLimit={mintGasLimit}
            setSuccessDisplay={setSuccessDisplay}
            setErrorDisplay={setErrorDisplay}
            setIsLoading={setIsLoading}
            setTxHash={setTxHash}
          />
        ) : (
          <CoverCreateAndMintButton
            routerAddress={chainProperties[networkName]["routerAddress"]}
            poolType={"PSHARK-CPROD"}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            volTier={
              coverPoolData.volatilityTier
                ? coverPoolData.volatilityTier
                : volatilityTiers[0]
            }
            disabled={coverMintParams.disabled}
            buttonMessage={coverMintParams.buttonMessage}
            to={address}
            lower={
              coverPositionData.lowerPrice
                ? TickMath.getTickAtPriceString(
                    coverPositionData.lowerPrice ?? "0",
                    tokenIn,
                    tokenOut,
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
                    tokenIn,
                    tokenOut,
                    coverPoolData.volatilityTier
                      ? parseInt(coverPoolData.volatilityTier.tickSpread)
                      : 20
                  )
                : 0
            }
            amount={String(coverMintParams.tokenInAmount)}
            zeroForOne={tokenIn.callId == 0}
            tickSpacing={
              coverPoolData.volatilityTier
                ? coverPoolData.volatilityTier.tickSpread
                : 20
            }
            gasLimit={mintGasLimit}
            setSuccessDisplay={setSuccessDisplay}
            setErrorDisplay={setErrorDisplay}
            setIsLoading={setIsLoading}
            setTxHash={setTxHash}
          />
        )
      ) : (
        <></>
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
