import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import CoverRemoveLiqButton from "../../Buttons/CoverRemoveLiqButton";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO } from "../../../utils/math/constants";
import { useRouter } from "next/router";
import { useCoverStore } from "../../../hooks/useCoverStore";

export default function CoverRemoveLiquidity({ isOpen, setIsOpen, address }) {
  const [
    coverPoolAddress,
    coverPositionData,
    coverMintParams,
    tokenIn,
    claimTick,
  ] = useCoverStore((state) => [
    state.coverPoolAddress,
    state.coverPositionData,
    state.coverMintParams,
    state.tokenIn,
    state.claimTick,
  ]);

  const router = useRouter();

  const [burnPercent, setBurnPercent] = useState(
    ethers.utils.parseUnits("5", 37)
  );
  const [sliderValue, setSliderValue] = useState(1);
  const [sliderOutput, setSliderOutput] = useState("1");
  const [amountInDisplay, setAmountInDisplay] = useState(
    ethers.utils.formatUnits(
      BigNumber.from(coverPositionData.userFillOut) ?? BN_ZERO,
      18
    )
  );

  useEffect(() => {
    if (sliderValue == 0) {
      setSliderOutput("");
      return;
    }
    setBurnPercent(ethers.utils.parseUnits(String(sliderValue), 36));
    console.log(
      "setting burn percent",
      ethers.utils.parseUnits(String(sliderValue), 36).toString()
    );
    setSliderOutput(
      ((parseFloat(amountInDisplay) * sliderValue) / 100).toPrecision(6)
    );
  }, [sliderValue]);

  const handleChange = (event: any) => {
    if (Number(event.target.value) != 0) {
      setSliderValue(event.target.value);
    } else {
      setSliderValue(0);
    }
  };

  const handleSliderButton = (percent: number) => {
    setSliderValue(percent);
  };

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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="flex items-center justify-between px-2">
                  <h1 className="text-lg">Remove Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="w-full  bg-[#0C0C0C] border border-[#1C1C1C] gap-4 px-4 py-4 rounded-xl mt-6 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="text-3xl ">{sliderValue}%</div>
                    <div className="flex items-center gap-x-4">
                      <button
                        onClick={() => handleSliderButton(25)}
                        className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => handleSliderButton(50)}
                        className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => handleSliderButton(75)}
                        className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer"
                      >
                        75%
                      </button>
                      <button
                        onClick={() => handleSliderButton(100)}
                        className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer"
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
                    value={sliderValue}
                    onChange={handleChange}
                    className="w-full styled-slider slider-progress bg-transparent mt-6"
                  />
                </div>
                <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl mt-6 mb-6">
                  <div className=" p-2 w-32">
                    <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-1 rounded-xl">
                      <div
                        id="input"
                        className="bg-[#0C0C0C] placeholder:text-grey1 w-full text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      >
                        {sliderOutput}
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex text-xs text-[#4C4C4C]">
                        $
                        {(
                          tokenIn.coverUSDPrice * parseFloat(sliderOutput)
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <div className=" ml-auto">
                      <div>
                        <div className="flex justify-end">
                          <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl ">
                            <div className="flex items-center gap-x-2 w-full">
                              <img className="w-7" src={tokenIn.logoURI} />
                              {tokenIn.symbol}
                            </div>
                          </button>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 px-1 mt-2">
                          <button
                            onClick={() => handleSliderButton(100)}
                            className="text-grey text-xs bg-dark border border-grey1 px-4 py-1 rounded-md"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CoverRemoveLiqButton
                  disabled={coverMintParams.disabled}
                  poolAddress={coverPoolAddress}
                  address={address}
                  lower={BigNumber.from(coverPositionData.min)}
                  claim={BigNumber.from(claimTick)}
                  upper={BigNumber.from(coverPositionData.max)}
                  zeroForOne={Boolean(coverPositionData.zeroForOne)}
                  burnPercent={burnPercent}
                  gasLimit={coverMintParams.gasLimit.mul(250).div(100)}
                  closeModal={() => {
                    if (burnPercent.eq(ethers.utils.parseUnits("1", 38))) {
                      router.push("/pool");
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
