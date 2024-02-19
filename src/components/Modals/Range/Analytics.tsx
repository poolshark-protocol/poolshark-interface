import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { LineChart } from "lucide-react";
import TVLChart from "../../Charts/TVLChart";

export default function Analytics({ isOpen, setIsOpen }) {
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[4px] bg-black text-white border border-grey text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="flex items-center justify-between px-2 mb-5">
                  <h1 className="flex items-center gap-x-2">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18 9C18.5523 9 19 9.44772 19 10V20C19 20.5523 18.5523 21 18 21C17.4477 21 17 20.5523 17 20V10C17 9.44772 17.4477 9 18 9Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6 13C6.55228 13 7 13.4477 7 14V20C7 20.5523 6.55228 21 6 21C5.44772 21 5 20.5523 5 20V14C5 13.4477 5.44772 13 6 13Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C12.5523 3 13 3.44772 13 4V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V4C11 3.44772 11.4477 3 12 3Z" fill="currentColor"/>
</svg>
                    Analytics <span className="text-grey1">- (All Chains)</span>
                  </h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-start gap-4 h-full">
                  <div className="border border-grey p-4 w-full flex justify-between flex-col rounded-[4px]">
                    <div className="flex flex-col gap-y-1">
                      <span className="text-sm text-grey1">TVL</span>
                      <span className="text-3xl">$200.3k</span>
                    </div>
                    <TVLChart />
                  </div>
                  <div className="flex flex-col items-center justify-between w-[60%] gap-4 h-[341px]">
                  <div className="border bg-dark/80 border-grey h-full rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3">
                    <span className="text-grey1 text-sm">VOLUME</span>
                    <span className="text-white text-2xl md:text-3xl">
                      $25k
                    </span>
                  </div>
                  <div className="border bg-dark/80 border-grey h-full rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3">
                    <span className="text-grey1 text-sm">FEES</span>
                    <span className="text-white text-2xl md:text-3xl">
                      $2.5k
                    </span>
                  </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
