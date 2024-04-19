import { ChevronDownIcon, ArrowLongRightIcon } from "@heroicons/react/20/solid";
import { useContractRead, useBalance } from "wagmi";
import DoubleArrowIcon from "../Icons/DoubleArrowIcon";
import CoverMintButton from "../Buttons/CoverMintButton";
import { useEffect, useMemo, useState } from "react";
import { BigNumber, ethers } from "ethers";
import JSBI from "jsbi";
import { TickMath, invertPrice } from "../../utils/math/tickMath";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { DyDxMath } from "../../utils/math/dydxMath";
import CoverMintApproveButton from "../Buttons/CoverMintApproveButton";
import CoverCreateAndMintButton from "../Buttons/CoverCreateAndMintButton";
import { fetchTokenUSDPrice, getLogo } from "../../utils/tokens";
import inputFilter from "../../utils/inputFilter";
import {
  gasEstimateCoverCreateAndMint,
  gasEstimateCoverMint,
} from "../../utils/gas";
import { useCoverStore } from "../../hooks/useCoverStore";
import { chainIdsToNames } from "../../utils/chains";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { coverPoolTypes, volatilityTiers } from "../../utils/pools";
import { useRouter } from "next/router";
import PositionMintModal from "../Modals/PositionMint";
import { useConfigStore } from "../../hooks/useConfigStore";
import { fetchRangePositions } from "../../utils/queries";
import { mapUserRangePositions } from "../../utils/maps";
import { coverPoolFactoryABI } from "../../abis/evm/coverPoolFactory";
import { getRouterAddress } from "../../utils/config";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import useAllowance from "../../hooks/contracts/useAllowance";
import { useShallow } from "zustand/react/shallow";
import useAccount from "../../hooks/useAccount";
import useSigner from "../../hooks/useSigner";

export default function CoverExistingPool({ goBack }) {
  const [
    chainId,
    networkName,
    limitSubgraph,
    coverSubgraph,
    coverFactoryAddress,
    logoMap,
  ] = useConfigStore(
    useShallow((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
      state.coverSubgraph,
      state.coverFactoryAddress,
      state.logoMap,
    ]),
  );

  const coverStore = useCoverStore();

  const [rangePositionData, setRangePositionData] = useRangeLimitStore(
    (state) => [state.rangePositionData, state.setRangePositionData],
  );

  // for mint modal
  const [successDisplay, setSuccessDisplay] = useState(false);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState();

  const { signer } = useSigner();
  const { address, isConnected } = useAccount();

  const router = useRouter();

  ////////////////////////////////Token Order
  const [priceOrder, setPriceOrder] = useState(true);

  useEffect(() => {
    if (
      coverStore.coverPoolAddress != undefined &&
      coverStore.coverPoolAddress != ZERO_ADDRESS
    ) {
      coverStore.setNeedsLatestTick(true);
    }
  }, [coverStore.coverPoolAddress]);

  ////////////////////////////////Token Allowances

  const { allowance: allowanceInCoverInt } = useAllowance({
    token: coverStore.tokenIn,
  });

  const allowanceInCover = useMemo(
    () => deepConvertBigIntAndBigNumber(allowanceInCoverInt),
    [allowanceInCoverInt],
  );

  useEffect(() => {
    if (allowanceInCover) {
      coverStore.setTokenInCoverAllowance(allowanceInCover.toString());
    }
  }, [allowanceInCover]);

  ////////////////////////////////Token Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: coverStore.tokenIn.native ? undefined : coverStore.tokenIn.address,
    enabled:
      coverStore.tokenIn.address != ZERO_ADDRESS && coverStore.needsBalance,
    watch: coverStore.needsBalance,
    onSuccess(data) {
      coverStore.setNeedsBalance(false);
    },
  });

  useEffect(() => {
    if (isConnected) {
      coverStore.setTokenInBalance(
        parseFloat(tokenInBal?.formatted).toFixed(2),
      );
    }
  }, [tokenInBal]);

  ////////////////////////////////Token Prices

  useEffect(() => {
    if (coverStore.coverPoolData.token0 && coverStore.coverPoolData.token1) {
      if (coverStore.tokenIn.address) {
        fetchTokenUSDPrice(
          coverStore.coverPoolData,
          coverStore.tokenIn,
          coverStore.setTokenInCoverUSDPrice,
        );
      }
      if (coverStore.tokenOut.address) {
        fetchTokenUSDPrice(
          coverStore.coverPoolData,
          coverStore.tokenOut,
          coverStore.setTokenOutCoverUSDPrice,
        );
      }
    }
  }, [coverStore.coverPoolData, coverStore.tokenIn.callId == 0]);

  ////////////////////////////////Latest Tick
  const { data: newLatestTick } = useContractRead({
    address: coverFactoryAddress,
    abi: coverPoolFactoryABI,
    functionName: "syncLatestTick",
    args: [
      {
        poolType: coverPoolTypes["constant-product"]["poolshark"],
        tokenIn: coverStore.tokenIn.address,
        tokenOut: coverStore.tokenOut.address,
        feeTier: coverStore.coverPoolData.volatilityTier?.feeAmount,
        tickSpread: coverStore.coverPoolData.volatilityTier?.tickSpread,
        twapLength: coverStore.coverPoolData.volatilityTier?.twapLength,
      },
    ],
    chainId: chainId,
    enabled: coverStore.coverPoolData.volatilityTier != undefined,
    watch: coverStore.needsLatestTick,
    onSuccess(data) {
      coverStore.setNeedsLatestTick(false);
      // console.log('Success syncLatestTick', newLatestTick, tokenIn.address, tokenOut.address, coverPoolData.volatilityTier)
    },
    onError(error) {
      console.log(
        "Error syncLatestTick",
        coverStore.tokenIn.address,
        coverStore.tokenOut.address,
        coverStore.coverPoolData.volatilityTier.feeAmount,
        coverStore.coverPoolData.volatilityTier.tickSpread,
        coverStore.coverPoolData.volatilityTier.twapLength,
        error,
      );
    },
    onSettled(data, error) {},
  });

  useEffect(() => {
    if (newLatestTick) {
      // if underlying pool does not exist or twap not ready
      if (!newLatestTick[1] || !newLatestTick[2]) {
        setLowerPrice("");
        setUpperPrice("");
        coverStore.setTokenOutAmount(BN_ZERO);
      } else {
        coverStore.setLatestTick(parseInt(newLatestTick[0].toString()));
      }
      coverStore.setInputPoolExists(newLatestTick[1]);
      coverStore.setTwapReady(newLatestTick[2]);
    }
  }, [newLatestTick, router.isReady]);

  //////////////////////////////Cover Pool Data

  useEffect(() => {
    if (
      //updating from empty selected token
      coverStore.tokenOut.name != "Select Token"
    ) {
      updatePools("1000"); // should match fee tier of position by default
      coverStore.setNeedsLatestTick(true);
    }
  }, [coverStore.tokenIn.name, coverStore.tokenOut.name]);

  async function updatePools(feeAmount: string) {
    coverStore.setCoverPoolFromVolatility(
      coverStore.tokenIn,
      coverStore.tokenOut,
      feeAmount,
      coverSubgraph,
    );
  }

  //sames as updatePools but triggered from the html
  const handleManualVolatilityChange = async (feeAmount: string) => {
    updatePools(feeAmount);
    coverStore.setNeedsLatestTick(true);
  };

  ////////////////////////////////Init Position Data

  //positionData set at pool data change
  useEffect(() => {
    if (
      coverStore.latestTick != undefined &&
      coverStore.coverPoolData.volatilityTier &&
      coverStore.inputPoolExists &&
      coverStore.twapReady
    ) {
      updatePositionData();
    }
  }, [
    coverStore.tokenIn.address,
    coverStore.tokenOut.address,
    coverStore.coverPoolData,
    coverStore.latestTick,
    coverStore.inputPoolExists,
    coverStore.twapReady,
  ]);

  async function updatePositionData() {
    const tickAtPrice = Number(coverStore.latestTick);
    const tickSpread = Number(
      coverStore.coverPoolData.volatilityTier.tickSpread,
    );
    const priceLower = TickMath.getPriceStringAtTick(
      coverStore.tokenIn.callId == 0
        ? tickAtPrice + -tickSpread * 16
        : tickAtPrice + tickSpread * 8,
      coverStore.tokenIn,
      coverStore.tokenOut,
      tickSpread,
    );
    const priceUpper = TickMath.getPriceStringAtTick(
      coverStore.tokenIn.callId == 0
        ? tickAtPrice - tickSpread * 6
        : tickAtPrice + tickSpread * 18,
      coverStore.tokenIn,
      coverStore.tokenOut,
      tickSpread,
    );
    setLowerPrice(
      invertPrice(priceOrder ? priceLower : priceUpper, priceOrder),
    );
    setUpperPrice(
      invertPrice(priceOrder ? priceUpper : priceLower, priceOrder),
    );
    coverStore.setCoverPositionData({
      ...coverStore.coverPositionData,
      tickAtPrice: tickAtPrice,
      lowerPrice: priceLower,
      upperPrice: priceUpper,
    });
  }

  ////////////////////////////////Position Price Delta
  const [lowerPrice, setLowerPrice] = useState("0");
  const [upperPrice, setUpperPrice] = useState("0");

  useEffect(() => {
    coverStore.setCoverPositionData({
      ...coverStore.coverPositionData,
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
    if (coverStore.coverPoolData.volatilityTier == undefined) {
      coverStore.setCoverPoolFromVolatility(
        coverStore.tokenIn,
        coverStore.tokenOut,
        "1000",
        coverSubgraph,
      );
    }
    refetchRangePositionData();
    setCoverAmounts();
  }, [
    coverStore.coverPoolData,
    coverStore.coverPositionData,
    sliderValue,
    lowerPrice,
    upperPrice,
    coverStore.tokenIn.callId == 0,
    rangePositionData != undefined,
    router.isReady,
  ]);

  async function refetchRangePositionData() {
    //refetch rangePositionData frm positionId in router params
    const data = await fetchRangePositions(limitSubgraph, address);
    if (data["data"]) {
      const positions = mapUserRangePositions(data["data"].rangePositions);
      const positionId = router.query.id;
      const position = positions.find((position) => position.id == positionId);
      if (position) {
        setRangePositionData(position);
      }
    }
  }

  function setCoverAmounts() {
    if (
      coverStore.coverPositionData.lowerPrice &&
      coverStore.coverPositionData.upperPrice &&
      parseFloat(coverStore.coverPositionData.lowerPrice) > 0 &&
      parseFloat(coverStore.coverPositionData.upperPrice) > 0 &&
      parseFloat(coverStore.coverPositionData.lowerPrice) <
        parseFloat(coverStore.coverPositionData.upperPrice)
    ) {
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(
        TickMath.getTickAtPriceString(
          coverStore.coverPositionData.lowerPrice,
          coverStore.tokenIn,
          coverStore.tokenOut,
        ),
      );
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
        TickMath.getTickAtPriceString(
          coverStore.coverPositionData.upperPrice,
          coverStore.tokenIn,
          coverStore.tokenOut,
        ),
      );
      if (rangePositionData?.userLiquidity == undefined) {
        coverStore.setTokenInAmount(BN_ZERO);
        coverStore.setTokenOutAmount(BN_ZERO);
        return;
      }
      const liquidityAmount = JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(Math.round(rangePositionData.userLiquidity)),
          JSBI.BigInt(parseFloat(sliderValue.toString())),
        ),
        JSBI.BigInt(100),
      );
      coverStore.setTokenInAmount(
        BigNumber.from(
          coverStore.tokenIn.callId == 0
            ? DyDxMath.getDx(
                liquidityAmount,
                lowerSqrtPrice,
                upperSqrtPrice,
                true,
              ).toString()
            : DyDxMath.getDy(
                liquidityAmount,
                lowerSqrtPrice,
                upperSqrtPrice,
                true,
              ).toString(),
        ),
      );
      coverStore.setTokenOutAmount(
        BigNumber.from(
          coverStore.tokenIn.callId == 0
            ? DyDxMath.getDy(
                liquidityAmount,
                lowerSqrtPrice,
                upperSqrtPrice,
                true,
              ).toString()
            : DyDxMath.getDx(
                liquidityAmount,
                lowerSqrtPrice,
                upperSqrtPrice,
                true,
              ).toString(),
        ),
      );
    }
  }

  ////////////////////////////////Valid Bounds Flag
  const [validBounds, setValidBounds] = useState(false);

  useEffect(() => {
    if (
      coverStore.coverPositionData.lowerPrice &&
      coverStore.coverPositionData.upperPrice &&
      coverStore.coverPoolData.volatilityTier &&
      coverStore.latestTick != undefined
    )
      changeValidBounds();
  }, [
    coverStore.coverPositionData.lowerPrice,
    coverStore.coverPositionData.upperPrice,
    coverStore.latestTick,
  ]);

  const changeValidBounds = () => {
    if (
      coverStore.coverPositionData.lowerPrice &&
      coverStore.coverPositionData.upperPrice
    ) {
      setValidBounds(
        BigNumber.from(parseInt(coverStore.coverPositionData.lowerPrice)).lt(
          BigNumber.from(coverStore.latestTick).sub(
            BigNumber.from(
              parseInt(coverStore.coverPoolData.volatilityTier.tickSpread),
            ),
          ),
        ),
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
      !coverStore.needsLatestTick &&
      coverStore.coverPositionData.lowerPrice &&
      coverStore.coverPositionData.upperPrice &&
      coverStore.coverPoolData.volatilityTier &&
      coverStore.coverMintParams.tokenInAmount &&
      coverStore.tokenIn.userRouterAllowance &&
      coverStore.tokenIn.userRouterAllowance >=
        parseInt(coverStore.coverMintParams.tokenInAmount.toString()) &&
      (coverStore.coverPoolAddress != ZERO_ADDRESS
        ? coverStore.twapReady &&
          parseInt(coverStore.coverMintParams.tokenInAmount.toString()) > 0 &&
          coverStore.coverPositionData.lowerPrice > 0 &&
          coverStore.coverPositionData.upperPrice > 0 // twap must be ready if pool exists
        : coverStore.inputPoolExists) // input pool must exist to create pool
    )
      updateGasFee();
  }, [
    coverStore.coverPoolAddress,
    coverStore.coverMintParams.tokenInAmount,
    coverStore.coverPositionData.lowerPrice,
    coverStore.coverPositionData.upperPrice,
    coverStore.coverMintParams.tokenInAmount,
    coverStore.coverMintParams.tokenOutAmount,
    coverStore.tokenIn.userRouterAllowance,
    coverStore.tokenIn,
    coverStore.tokenOut,
    coverStore.latestTick,
    coverStore.needsLatestTick,
  ]);

  async function updateGasFee() {
    const newMintGasFee =
      coverStore.coverPoolAddress != ZERO_ADDRESS
        ? await gasEstimateCoverMint(
            coverStore.coverPoolAddress,
            address,
            TickMath.getTickAtPriceString(
              coverStore.coverPositionData.upperPrice,
              coverStore.tokenIn,
              coverStore.tokenOut,
              parseInt(
                coverStore.coverPoolData.volatilityTier.tickSpread ?? 20,
              ),
            ),
            TickMath.getTickAtPriceString(
              coverStore.coverPositionData.lowerPrice,
              coverStore.tokenIn,
              coverStore.tokenOut,
              parseInt(
                coverStore.coverPoolData.volatilityTier.tickSpread ?? 20,
              ),
            ),
            coverStore.tokenIn,
            coverStore.tokenOut,
            coverStore.coverMintParams.tokenInAmount,
            signer,
            networkName,
          )
        : await gasEstimateCoverCreateAndMint(
            coverStore.coverPoolData.volatilityTier
              ? coverStore.coverPoolData.volatilityTier
              : volatilityTiers[0],
            address,
            TickMath.getTickAtPriceString(
              coverStore.coverPositionData.upperPrice,
              coverStore.tokenIn,
              coverStore.tokenOut,
              parseInt(
                coverStore.coverPoolData.volatilityTier.tickSpread ?? 20,
              ),
            ),
            TickMath.getTickAtPriceString(
              coverStore.coverPositionData.lowerPrice,
              coverStore.tokenIn,
              coverStore.tokenOut,
              parseInt(
                coverStore.coverPoolData.volatilityTier.tickSpread ?? 20,
              ),
            ),
            coverStore.tokenIn,
            coverStore.tokenOut,
            coverStore.coverMintParams.tokenInAmount,
            signer,
            networkName,
            coverStore.twapReady,
          );
    if (!newMintGasFee.gasUnits.mul(120).div(100).eq(mintGasLimit)) {
      setMintGasFee(newMintGasFee.formattedPrice);
      setMintGasLimit(newMintGasFee.gasUnits.mul(120).div(100));
    }
  }

  ////////////////////////////////Mint Button Handler

  useEffect(() => {
    coverStore.setMintButtonState();
  }, [
    coverStore.tokenIn,
    coverStore.coverMintParams.tokenInAmount,
    coverStore.coverPoolAddress,
    coverStore.inputPoolExists,
    coverStore.twapReady,
  ]);

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
                    String(coverStore.coverMintParams.tokenOutAmount),
                    coverStore.tokenOut.decimals,
                  ),
                ) *
                (1 - coverStore.coverPoolData.volatilityTier.tickSpread / 10000)
              ).toPrecision(5) +
                " " +
                coverStore.tokenOut.symbol}
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
              coverStore.switchDirection();
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
              <img
                className="md:w-7 w-6"
                src={getLogo(logoMap, coverStore.tokenIn)}
              />
              {coverStore.tokenIn.symbol}
            </div>
          </button>
          <ArrowLongRightIcon
            className="w-14 cursor-pointer hover:rotate-180 transition-all"
            onClick={() => {
              coverStore.switchDirection();
            }}
          />
          <button className="flex w-full items-center gap-x-3 bg-black border border-grey md:px-4 px-2 py-1.5 rounded-[4px]">
            <div className="flex md:text-base text-sm items-center gap-x-2 w-full">
              <img
                className="md:w-7 w-6"
                src={getLogo(logoMap, coverStore.tokenOut)}
              />
              {coverStore.tokenOut.symbol}
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
            disabled={!coverStore.inputPoolExists || !coverStore.twapReady}
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
                  coverStore.coverMintParams.tokenInAmount.toString(),
                  coverStore.tokenIn.decimals,
                ),
              ).toPrecision(5)}
            </span>
            <span className="mt-1">{coverStore.tokenIn.symbol}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="text-[#646464] md:text-sm text-xs">Amount to buy</div>
          <div className="flex items-center justify-end gap-x-2">
            <div className="bg-black text-right w-32 py-1 placeholder:text-grey1 text-white text-lg">
              {Number.parseFloat(
                ethers.utils.formatUnits(
                  String(coverStore.coverMintParams.tokenOutAmount),
                  coverStore.tokenOut.decimals,
                ),
              ).toPrecision(5)}
            </div>

            <div className="">{coverStore.tokenOut.symbol}</div>
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
            {priceOrder == (coverStore.tokenIn.callId == 0) ? (
              <>{coverStore.tokenOut.symbol}</>
            ) : (
              <>{coverStore.tokenIn.symbol}</>
            )}{" "}
            per{" "}
            {priceOrder == (coverStore.tokenIn.callId == 0) ? (
              <>{coverStore.tokenIn.symbol}</>
            ) : (
              <>{coverStore.tokenOut.symbol}</>
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
                    disabled={
                      !coverStore.inputPoolExists || !coverStore.twapReady
                    }
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
                    disabled={
                      !coverStore.inputPoolExists || !coverStore.twapReady
                    }
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
                {priceOrder == (coverStore.tokenIn.callId == 0)
                  ? coverStore.tokenIn.symbol
                  : coverStore.tokenOut.symbol}{" "}
                =
                {" " +
                  (coverStore.twapReady
                    ? parseFloat(
                        invertPrice(
                          TickMath.getPriceStringAtTick(
                            coverStore.latestTick,
                            coverStore.tokenIn,
                            coverStore.tokenOut,
                          ),
                          priceOrder,
                        ),
                      ).toPrecision(5)
                    : "?.??") +
                  " " +
                  (priceOrder == (coverStore.tokenIn.callId == 0)
                    ? coverStore.tokenOut.symbol
                    : coverStore.tokenIn.symbol)}
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
                  volatilityTier.feeAmount.toString(),
                );
              }}
              key={volatilityTierIdx}
              className={`bg-black p-4 w-full rounded-[4px] cursor-pointer transition-all ${
                coverStore.coverPoolData?.volatilityTier?.feeAmount ===
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
        allowanceInCover.lt(coverStore.coverMintParams.tokenInAmount) &&
        !coverStore.tokenIn.native ? (
          <CoverMintApproveButton
            routerAddress={getRouterAddress(networkName)}
            approveToken={coverStore.tokenIn.address}
            amount={String(coverStore.coverMintParams.tokenInAmount)}
            tokenSymbol={coverStore.tokenIn.symbol}
          />
        ) : coverStore.coverPoolAddress != ZERO_ADDRESS ? (
          <CoverMintButton
            routerAddress={getRouterAddress(networkName)}
            poolAddress={coverStore.coverPoolAddress}
            disabled={coverStore.coverMintParams.disabled}
            buttonMessage={coverStore.coverMintParams.buttonMessage}
            to={address}
            lower={
              coverStore.coverPositionData.lowerPrice
                ? TickMath.getTickAtPriceString(
                    coverStore.coverPositionData.lowerPrice ?? "0",
                    coverStore.tokenIn,
                    coverStore.tokenOut,
                    coverStore.coverPoolData.volatilityTier
                      ? parseInt(
                          coverStore.coverPoolData.volatilityTier.tickSpread,
                        )
                      : 20,
                  )
                : 0
            }
            upper={
              coverStore.coverPositionData.upperPrice
                ? TickMath.getTickAtPriceString(
                    coverStore.coverPositionData.upperPrice ?? "0",
                    coverStore.tokenIn,
                    coverStore.tokenOut,
                    coverStore.coverPoolData.volatilityTier
                      ? parseInt(
                          coverStore.coverPoolData.volatilityTier.tickSpread,
                        )
                      : 20,
                  )
                : 0
            }
            amount={String(coverStore.coverMintParams.tokenInAmount)}
            zeroForOne={coverStore.tokenIn.callId == 0}
            tickSpacing={
              coverStore.coverPoolData.volatilityTier
                ? coverStore.coverPoolData.volatilityTier.tickSpread
                : 20
            }
            gasLimit={mintGasLimit}
            setSuccessDisplay={setSuccessDisplay}
            setIsLoading={setIsLoading}
            setTxHash={setTxHash}
          />
        ) : (
          <CoverCreateAndMintButton
            routerAddress={getRouterAddress(networkName)}
            poolType={"PSHARK-CPROD"}
            tokenIn={coverStore.tokenIn}
            tokenOut={coverStore.tokenOut}
            volTier={
              coverStore.coverPoolData.volatilityTier
                ? coverStore.coverPoolData.volatilityTier
                : volatilityTiers[0]
            }
            disabled={coverStore.coverMintParams.disabled}
            buttonMessage={coverStore.coverMintParams.buttonMessage}
            to={address}
            lower={
              coverStore.coverPositionData.lowerPrice
                ? TickMath.getTickAtPriceString(
                    coverStore.coverPositionData.lowerPrice ?? "0",
                    coverStore.tokenIn,
                    coverStore.tokenOut,
                    coverStore.coverPoolData.volatilityTier
                      ? parseInt(
                          coverStore.coverPoolData.volatilityTier.tickSpread,
                        )
                      : 20,
                  )
                : 0
            }
            upper={
              coverStore.coverPositionData.upperPrice
                ? TickMath.getTickAtPriceString(
                    coverStore.coverPositionData.upperPrice ?? "0",
                    coverStore.tokenIn,
                    coverStore.tokenOut,
                    coverStore.coverPoolData.volatilityTier
                      ? parseInt(
                          coverStore.coverPoolData.volatilityTier.tickSpread,
                        )
                      : 20,
                  )
                : 0
            }
            amount={String(coverStore.coverMintParams.tokenInAmount)}
            zeroForOne={coverStore.tokenIn.callId == 0}
            tickSpacing={
              coverStore.coverPoolData.volatilityTier
                ? coverStore.coverPoolData.volatilityTier.tickSpread
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
