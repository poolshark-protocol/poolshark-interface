import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function SetLimitTick({ isOpen, setIsOpen }) {
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[4px] bg-black text-white border border-grey text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="flex items-center justify-between px-2 mb-3">
                  <h1 className="">Create Limit Pool</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <p className="text-grey1 text-xs px-2">
                  A Limit Pool with this pair does not exist yet. Please select
                  a price tick size to set on this pool and confirm the transaction to
                  create the pool.
                </p>
                <div className="flex flex-col gap-y-3 mb-5">
                  <div className="bg-dark w-full p-6 border border-grey mt-8 rounded-[4px] mb-3">
                    <h1 className="mb-4">CHOOSE A PRICE TICK SIZE TIER</h1>
                    <div className="flex md:flex-row flex-col justify-between mt-3 gap-x-16 gap-y-4">
                      {volatilityTiers.map(
                        (volatilityTier, volatilityTierIdx) => (
                          <div
                            onClick={() =>
                              setSelectedVolatility(volatilityTier)
                            }
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
                        )
                      )}
                    </div>
                  </div>
                  <button className="w-full py-4 mx-auto text-center transition rounded-full  border border-main bg-main1 uppercase text-sm cursor-pointer">Create Limit Pool</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
