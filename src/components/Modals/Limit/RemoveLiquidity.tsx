import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import LimitRemoveLiqButton from "../../Buttons/LimitRemoveLiqButton";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { useRangeLimitStore } from "../../../hooks/useRangeLimitStore";
import { parseUnits } from "../../../utils/math/valueMath";
import { getLogo, logoMapKey } from "../../../utils/tokens";
import { useConfigStore } from "../../../hooks/useConfigStore";

export default function LimitRemoveLiquidity({ isOpen, setIsOpen, address }) {
  const [
    limitPoolAddress,
    limitPositionData,
    limitMintParams,
    tokenIn,
    claimTick,
    currentAmountOut,
    setMintButtonState,
  ] = useRangeLimitStore((state) => [
    state.limitPoolAddress,
    state.limitPositionData,
    state.limitMintParams,
    state.tokenIn,
    state.claimTick,
    state.currentAmountOut,
    state.setMintButtonState,
  ]);

  const [
    chainId,
    logoMap,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.logoMap,
    state.networkName
  ]);

  const router = useRouter();

  const [burnPercent, setBurnPercent] = useState(parseUnits("5", 37));

  const [sliderValue, setSliderValue] = useState(1);
  const [sliderOutput, setSliderOutput] = useState("1");
  const [sliderDisplay, setSliderDisplay] = useState(50);
  const [sliderLastValue, setSliderLastValue] = useState(50);
  const [sliderController, setSliderController] = useState(false);

  useEffect(() => {
    setBurnPercent(parseUnits(String(sliderValue), 36));
    setSliderOutput(
      ((parseFloat(currentAmountOut) * sliderValue) / 100).toPrecision(6)
    );
  }, [currentAmountOut, sliderValue]);

  useEffect(() => {
    setMintButtonState();
  }, [burnPercent]);

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
                      {!isNaN(tokenIn.USDPrice) &&
                        !isNaN(parseFloat(sliderOutput))
                          ? (
                              tokenIn.USDPrice * parseFloat(sliderOutput)
                            ).toFixed(2)
                          : "0.00"}
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
                        <img height="28" width="25" src={getLogo(tokenIn, logoMap)} />
                        {tokenIn.symbol}
                      </div>
                    </div>
                  </div>
                </div>
                <LimitRemoveLiqButton
                  poolAddress={limitPoolAddress}
                  address={address}
                  positionId={Number(limitPositionData.positionId)}
                  zeroForOne={tokenIn.callId == 0}
                  burnPercent={burnPercent}
                  epochLast={Number(limitPositionData.epochLast)}
                  lower={BigNumber.from(limitPositionData.min)}
                  upper={BigNumber.from(limitPositionData.max)}
                  closeModal={() => {
                    if (burnPercent.eq(parseUnits("1", 38))) {
                      router.push("/");
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
