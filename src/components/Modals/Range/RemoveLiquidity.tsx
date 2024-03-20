import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import RangeRemoveLiqButton from "../../Buttons/RangeRemoveLiqButton";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO, ZERO } from "../../../utils/math/constants";
import JSBI from "jsbi";
import { DyDxMath } from "../../../utils/math/dydxMath";
import { TickMath } from "../../../utils/math/tickMath";
import { useRouter } from "next/router";
import { useRangeLimitStore } from "../../../hooks/useRangeLimitStore";
import { useAccount } from "wagmi";
import { gasEstimateRangeBurn } from "../../../utils/gas";
import { parseUnits } from "../../../utils/math/valueMath";
import { useConfigStore } from "../../../hooks/useConfigStore";
import { getLogo, logoMapKey } from "../../../utils/tokens";

export default function RangeRemoveLiquidity({
  isOpen,
  setIsOpen,
  signer,
  staked,
}) {
  const [chainId, networkName, logoMap, limitSubgraph] = useConfigStore(
    (state) => [
      state.chainId,
      state.networkName,
      state.logoMap,
      state.limitSubgraph,
    ],
  );

  const [
    rangePoolAddress,
    rangePositionData,
    rangeMintParams,
    tokenIn,
    tokenOut,
    setMintButtonState,
  ] = useRangeLimitStore((state) => [
    state.rangePoolAddress,
    state.rangePositionData,
    state.rangeMintParams,
    state.tokenIn,
    state.tokenOut,
    state.setMintButtonState,
  ]);

  const router = useRouter();
  const { address } = useAccount();

  const [sliderValue, setSliderValue] = useState(50);
  const [sliderOutput, setSliderOutput] = useState("1");
  const [burnPercent, setBurnPercent] = useState(BN_ZERO);
  const [amount0, setAmount0] = useState(BN_ZERO);
  const [amount1, setAmount1] = useState(BN_ZERO);
  const tokenOrder = tokenIn.address.localeCompare(tokenOut.address) < 0;
  const [rangeSqrtPrice, setRangeSqrtPrice] = useState(
    JSBI.BigInt(rangePositionData.price),
  );
  const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(
    Number(rangePositionData.min),
  );
  const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
    Number(rangePositionData.max),
  );

  useEffect(() => {
    const tokenAmountToBurn = BigNumber.from(sliderValue)
      .mul(BigNumber.from(rangePositionData.userLiquidity))
      .div(BigNumber.from(100));
    setBurnPercent(parseUnits(sliderValue.toString(), 36));
    setAmounts(JSBI.BigInt(tokenAmountToBurn), true);
  }, [sliderValue, rangePositionData.liquidity]);

  const [sliderDisplay, setSliderDisplay] = useState(50);
  const [sliderLastValue, setSliderLastValue] = useState(50);
  const [sliderController, setSliderController] = useState(false);

  const handleChange = (event: any) => {
    setSliderDisplay(event.target.value);
  };

  const handleSliderButton = (percent: number) => {
    setSliderDisplay(percent);
  };

  useEffect(() => {
    setSliderLastValue(sliderDisplay);
    if (!sliderController) {
      setSliderController(true);
      setTimeout(() => {
        setSliderController(false);
      }, 1000);
    }
  }, [sliderDisplay]);

  useEffect(() => {
    if (!sliderController) {
      setSliderValue(sliderLastValue);
    }
  }, [sliderLastValue, sliderController]);

  function setAmounts(liquidity: JSBI, changeDisplay = false) {
    try {
      if (JSBI.greaterThan(liquidity, ZERO)) {
        const amounts = DyDxMath.getAmountsForLiquidity(
          lowerSqrtPrice,
          upperSqrtPrice,
          rangeSqrtPrice,
          liquidity,
          true,
        );
        // set amount based on liquidity math
        const amount0Bn = BigNumber.from(String(amounts.token0Amount));
        const amount1Bn = BigNumber.from(String(amounts.token1Amount));

        if (changeDisplay)
          setSliderOutput(
            Number(
              ethers.utils.formatUnits(
                tokenOrder ? amount0Bn : amount1Bn,
                tokenOrder ? tokenIn.decimals : tokenOut.decimals,
              ),
            ).toPrecision(6),
          );
        setAmount0(amount0Bn);
        setAmount1(amount1Bn);
      }
    } catch (error) {
      console.log(error);
    }
  }

  //////////////////Slider

  useEffect(() => {
    setSliderDisplay(50);
  }, [router.isReady]);

  ////////////////////////////////Gas Fees Estimation
  const [burnGasFee, setBurnGasFee] = useState("$0.00");
  const [burnGasLimit, setBurnGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (
      signer &&
      address &&
      rangePositionData.poolId &&
      rangePositionData.positionId != undefined &&
      burnPercent.gt(BN_ZERO)
    ) {
      updateGasFee();
    }
  }, [
    sliderValue,
    rangePositionData.poolId,
    rangePositionData.positionId,
    signer,
    address,
    burnPercent,
  ]);

  async function updateGasFee() {
    if (rangePositionData.staked == undefined) return;
    const newBurnGasFee = await gasEstimateRangeBurn(
      rangePositionData.poolId,
      address,
      rangePositionData.positionId,
      burnPercent,
      staked,
      networkName,
      signer,
      limitSubgraph,
    );
    if (
      newBurnGasFee.gasUnits.gt(BN_ZERO) &&
      !newBurnGasFee.gasUnits.mul(250).div(100).eq(burnGasLimit)
    ) {
      setBurnGasFee(newBurnGasFee.formattedPrice);
      setBurnGasLimit(newBurnGasFee.gasUnits.mul(250).div(100));
    }
  }

  ////////////////////////////////Mint Button Handler

  useEffect(() => {
    setMintButtonState();
  }, [rangeMintParams.tokenInAmount]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[4px] bg-black text-white border border-grey text-left align-middle shadow-xl py-4 px-3 md:p-5 transition-all">
                <div className="flex items-center justify-between px-2">
                  <h1 className="text-lg">Remove Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="w-full  bg-[#0C0C0C] border border-[#1C1C1C] gap-4 px-4 py-4 rounded-[4px] mt-6 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="text-3xl ">{sliderDisplay}%</div>
                    <div className="md:flex items-center hidden md:text-base text-sm gap-x-4">
                      <button
                        onClick={() => handleSliderButton(25)}
                        className="bg-black p-2 rounded-[4px] border border-grey hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => handleSliderButton(50)}
                        className="bg-black p-2 rounded-[4px] border border-grey hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => handleSliderButton(75)}
                        className="bg-black p-2 rounded-[4px] border border-grey hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer"
                      >
                        75%
                      </button>
                      <button
                        onClick={() => handleSliderButton(100)}
                        className="bg-black p-2 rounded-[4px] border border-grey hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer"
                      >
                        100%
                      </button>
                    </div>
                  </div>
                  <input
                    autoComplete="off"
                    type="range"
                    min="1"
                    max="100"
                    value={sliderDisplay}
                    onChange={handleChange}
                    className="w-full styled-slider slider-progress bg-transparent mt-6"
                  />
                </div>
                <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                  <div className="flex items-end justify-between text-[11px] text-grey1">
                    <span>
                      ~$
                      {Number(
                        tokenIn.USDPrice *
                          parseFloat(
                            ethers.utils.formatUnits(amount0, tokenIn.decimals),
                          ),
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-2 mb-3">
                    <span className="text-3xl">
                      {Number(sliderOutput).toPrecision()}
                    </span>
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={() => handleSliderButton(100)}
                        className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
                      >
                        MAX
                      </button>
                      <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                        <img
                          height="28"
                          width="25"
                          src={getLogo(tokenIn, logoMap)}
                        />
                        {tokenIn.symbol}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2 mb-8">
                  <div className="flex items-end justify-between text-[11px] text-grey1">
                    <span>
                      ~$
                      {(
                        tokenOut.USDPrice *
                        parseFloat(
                          ethers.utils.formatUnits(amount1, tokenOut.decimals),
                        )
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-2 mb-3">
                    <span className="text-3xl">
                      {Number(
                        ethers.utils.formatUnits(amount1, tokenOut.decimals),
                      ).toPrecision(5)}
                    </span>
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={() => handleSliderButton(100)}
                        className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
                      >
                        MAX
                      </button>
                      <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                        <img
                          height="28"
                          width="25"
                          src={getLogo(tokenOut, logoMap)}
                        />
                        {tokenOut.symbol}
                      </div>
                    </div>
                  </div>
                </div>
                <RangeRemoveLiqButton
                  poolAddress={rangePoolAddress}
                  address={address}
                  positionId={rangePositionData.positionId}
                  burnPercent={burnPercent}
                  closeModal={() => {
                    //if (burnPercent==BigNumber.from('0x4b3b4ca85a86c47a098a224000000000')) {
                    if (burnPercent.eq(parseUnits("1", 38))) {
                      router.push("/range");
                    }
                  }}
                  gasLimit={burnGasLimit}
                  setIsOpen={setIsOpen}
                  disabled={burnGasLimit.eq(BN_ZERO)}
                  staked={rangePositionData.staked}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
