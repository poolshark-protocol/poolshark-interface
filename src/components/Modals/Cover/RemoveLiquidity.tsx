import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import CoverRemoveLiqButton from "../../Buttons/CoverRemoveLiqButton";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO } from "../../../utils/math/constants";
import { useRouter } from "next/router";
import { useCoverStore } from "../../../hooks/useCoverStore";
import { gasEstimateCoverBurn } from "../../../utils/gas";
import { useSigner } from "wagmi";
import { parseUnits } from "../../../utils/math/valueMath";
import { useConfigStore } from "../../../hooks/useConfigStore";
import { getLogoURI } from "../../../utils/tokens";

export default function CoverRemoveLiquidity({
  isOpen,
  setIsOpen,
  address,
  signer,
}) {
  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    coverMintParams,
    tokenIn,
    claimTick,
    setTokenInAmount,
    setMintButtonState,
  ] = useCoverStore((state) => [
    state.coverPoolAddress,
    state.coverPoolData,
    state.coverPositionData,
    state.coverMintParams,
    state.tokenIn,
    state.claimTick,
    state.setTokenInAmount,
    state.setMintButtonState,
  ]);

  const [
    logoMap,
  ] = useConfigStore((state) => [
    state.logoMap,
  ]);

  const router = useRouter();

  const [burnPercent, setBurnPercent] = useState(parseUnits("5", 37));
  const [sliderValue, setSliderValue] = useState(1);
  const [sliderOutput, setSliderOutput] = useState("1");

  useEffect(() => {
    setTokenInAmount(parseUnits(String(sliderOutput), tokenIn.decimals));
  }, [sliderOutput]);

  useEffect(() => {
    setBurnPercent(parseUnits(String(sliderValue), 36));
    setSliderOutput(
      (
        (parseFloat(
          ethers.utils.formatUnits(
            BigNumber.from(coverPositionData.userFillOut) ?? BN_ZERO,
            tokenIn.decimals
          )
        ) *
          sliderValue) /
        100
      ).toPrecision(6)
    );
  }, [sliderValue, coverPositionData.userFillOut]);

  useEffect(() => {
    setMintButtonState();
  }, [burnPercent]);

  //////////////////Slider

  const [sliderDisplay, setSliderDisplay] = useState(50);
  const [sliderLastValue, setSliderLastValue] = useState(50);
  const [sliderController, setSliderController] = useState(false);

  const handleChange = (event: any) => {
    if (Number(event.target.value) != 0) {
      setSliderDisplay(event.target.value);
    } else {
      setSliderDisplay(1);
    }
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

  useEffect(() => {
    setSliderDisplay(50);
  }, [router.isReady]);

  ////////////////////////////////Gas Fees Estimation
  const [burnGasFee, setBurnGasFee] = useState("$0.00");
  const [burnGasLimit, setBurnGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (
      coverPositionData.lowerTick &&
      coverPositionData.upperTick &&
      coverPoolData.volatilityTier &&
      sliderValue &&
      signer &&
      claimTick &&
      claimTick >= coverPositionData.lowerTick &&
      claimTick <= coverPositionData.upperTick &&
      coverPositionData.positionId != undefined
    ) {
      updateGasFee();
    }
  }, [
    router.isReady,
    signer,
    sliderValue,
    burnPercent,
    coverPoolData,
    coverPositionData,
    claimTick,
  ]);

  async function updateGasFee() {
    const newBurnGasFee = await gasEstimateCoverBurn(
      coverPoolAddress,
      address,
      coverPositionData.positionId,
      burnPercent,
      BigNumber.from(claimTick),
      coverPositionData.zeroForOne,
      signer
    );
    setBurnGasFee(newBurnGasFee.formattedPrice);
    setBurnGasLimit(newBurnGasFee.gasUnits.mul(250).div(100));
  }

  ////////////////////////////////Mint Button Handler

  useEffect(() => {
    setMintButtonState();
  }, [coverMintParams.tokenInAmount]);

  ////////////////////////////////

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
                <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2 mb-5">
                  <div className="flex items-end justify-between text-[11px] text-grey1">
                    <span>
                      ~$
                      {(
                        tokenIn.coverUSDPrice * parseFloat(sliderOutput)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-2 mb-3">
                    <span className="text-3xl">{sliderOutput}</span>
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={() => handleSliderButton(100)}
                        className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
                      >
                        MAX
                      </button>
                      <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                        <img height="28" width="25" src={getLogoURI(logoMap, tokenIn)} />
                        {tokenIn.symbol}
                      </div>
                    </div>
                  </div>
                </div>
                <CoverRemoveLiqButton
                  disabled={coverMintParams.disabled}
                  poolAddress={coverPoolAddress}
                  address={address}
                  positionId={Number(coverPositionData.positionId)}
                  claim={BigNumber.from(claimTick ?? 0)}
                  zeroForOne={Boolean(coverPositionData.zeroForOne)}
                  burnPercent={burnPercent ?? BN_ZERO}
                  gasLimit={burnGasLimit}
                  closeModal={() => {
                    if (burnPercent.eq(parseUnits("1", 38))) {
                      router.push("/cover");
                    }
                  }}
                  setIsOpen={setIsOpen}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
