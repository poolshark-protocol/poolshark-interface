import {
  AdjustmentsHorizontalIcon,
  ArrowSmallDownIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import Head from "next/head";
import Image from "next/image";
import { useState, Fragment } from "react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import {
  ChevronDownIcon,
  InformationCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Swap() {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const [expanded, setExpanded] = useState();

  async function connectToFuel() {
    const isConnected = await window.FuelWeb3.connect();
    console.log("Connection response", isConnected);

    const accounts = await window.FuelWeb3.accounts();
    console.log(accounts);
  }

  async function disconnectFromFuel() {
    await window.FuelWeb3.disconnect();
  }

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div className="ml-auto text-xs">300 DAI</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Price Impact</div>
            <div className="ml-auto text-xs">-0.12%</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Mininum recieved after slippage (0.50%)
            </div>
            <div className="ml-auto text-xs">299.92 DAI</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            <div className="ml-auto text-xs">-0.09$</div>
          </div>
        </div>
      );
    }
  };
  return (
    <div className="pt-[10vh]">
      <div className="flex flex-col w-full md:max-w-md px-6 pt-5 pb-7 mx-auto bg-black border border-grey2 rounded-xl">
        <div className="flex items-center">
          <div className="flex gap-4 mb-1.5 text-sm">
            <div className="flex">Swap</div>
            <div className="flex text-grey">Limit</div>
          </div>
          <div className="ml-auto">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="w-full mt-4 align-middle items-center flex bg-dark border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            <input
              className=" bg-[#0C0C0C] w-min placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
              placeholder="300"
            />
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C]">~300.50</div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div class="flex justify-center ml-auto">
              <div class="flex-col">
                <div className="flex justify-end">
                  <Transition appear show={isOpen} as={Fragment}>
                    <Dialog
                      as="div"
                      className="relative z-50"
                      onClose={closeModal}
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-black border border-grey2 text-left align-middle shadow-xl transition-all">
                              <div className="p-5">
                                <div className="flex justify-between items-center mb-6">
                                  <h1 className="text-white">Select Token</h1>
                                  <XMarkIcon
                                    onClick={() => setIsOpen(false)}
                                    className="w-6 text-white cursor-pointer"
                                  />
                                </div>
                                <MagnifyingGlassIcon className="w-5 text-white absolute mt-[13px] ml-[14px] text-grey" />
                                <input
                                  className="border border-grey2 bg-dark outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white"
                                  placeholder="Search name or paste address"
                                ></input>
                                <div className="flex justify-between flex-wrap mt-4 gap-y-2">
                                  <div className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm">
                                    <img
                                      className="w-6"
                                      src="/static/images/token.png"
                                    />
                                    USDC
                                  </div>
                                  <div className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm">
                                    <img
                                      className="w-6"
                                      src="/static/images/token.png"
                                    />
                                    USDC
                                  </div>
                                  <div className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm">
                                    <img
                                      className="w-6"
                                      src="/static/images/token.png"
                                    />
                                    USDC
                                  </div>
                                  <div className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm">
                                    <img
                                      className="w-6"
                                      src="/static/images/token.png"
                                    />
                                    USDC
                                  </div>
                                  <div className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm">
                                    <img
                                      className="w-6"
                                      src="/static/images/token.png"
                                    />
                                    USDC
                                  </div>
                                  <div className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm">
                                    <img
                                      className="w-6"
                                      src="/static/images/token.png"
                                    />
                                    USDC
                                  </div>
                                  <div className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm">
                                    <img
                                      className="w-6"
                                      src="/static/images/token.png"
                                    />
                                    USDC
                                  </div>
                                  <div className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm">
                                    <img
                                      className="w-6"
                                      src="/static/images/token.png"
                                    />
                                    USDC
                                  </div>
                                </div>
                              </div>
                              <div className="bg-dark text-white">
                                <div className="border border-t-grey1 border-transparent px-5 py-2 flex justify-between items-center">
                                  <div className="flex items-center gap-x-3">
                                    <img
                                      className="w-8 h-8"
                                      src="/static/images/token.png"
                                    />
                                    <div>
                                      <h1 className="w-full text-sm -mb-2">
                                        USD Coin
                                      </h1>
                                      <span className="w-full text-[11px] text-grey">
                                        USDC
                                      </span>
                                    </div>
                                  </div>
                                  200
                                </div>
                                <div className="border border-t-grey1 border-transparent px-5 py-2 flex justify-between items-center">
                                  <div className="flex items-center gap-x-3">
                                    <img
                                      className="w-8 h-8"
                                      src="/static/images/token.png"
                                    />
                                    <div>
                                      <h1 className="w-full text-sm -mb-2">
                                        USD Coin
                                      </h1>
                                      <span className="w-full text-[11px] text-grey">
                                        USDC
                                      </span>
                                    </div>
                                  </div>
                                  200
                                </div>
                                <div className="border border-t-grey1 border-transparent px-5 py-2 flex justify-between items-center">
                                  <div className="flex items-center gap-x-3">
                                    <img
                                      className="w-8 h-8"
                                      src="/static/images/token.png"
                                    />
                                    <div>
                                      <h1 className="w-full text-sm -mb-2">
                                        USD Coin
                                      </h1>
                                      <span className="w-full text-[11px] text-grey">
                                        USDC
                                      </span>
                                    </div>
                                  </div>
                                  200
                                </div>
                              </div>
                            </Dialog.Panel>
                          </Transition.Child>
                        </div>
                      </div>
                    </Dialog>
                  </Transition>
                  <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                  >
                    <div className="flex items-center gap-x-2">
                      <img className="w-7" src="/static/images/token.png" />
                      USDC
                    </div>
                    <ChevronDownIcon className="w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="flex text-xs text-[#4C4C4C]">
                    Balance: 420.69
                  </div>
                  <div className="flex text-xs uppercase text-[#C9C9C9]">
                    Max
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="items-center -mb-2 -mt-2 p-2 m-auto border border-[#1E1E1E] z-30 bg-black rounded-lg cursor-pointer">
          <ArrowSmallDownIcon className="w-4 h-4" />
        </div>

        <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">

          <div className="flex-col justify-center w-1/2 p-2 ">
            <input
              className=" bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
              placeholder="300"
            />
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C]">~300.50</div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div class="flex justify-center ml-auto">
              <div class="flex-col">
                <div className="flex justify-end">
                  <button className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl">
                    <div className="flex items-center gap-x-2">
                      <img className="w-7" src="/static/images/token.png" />
                      USDC
                    </div>
                    <ChevronDownIcon className="w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="text-xs text-[#4C4C4C]">Balance: 420.69</div>
                  <div className="text-xs uppercase text-[#C9C9C9]">Max</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-4">
          <div
            className="flex px-2 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex-none text-xs uppercase text-[#C9C9C9]">
              1 USDC = 1 DA1
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
        <div className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
          Swap
        </div>
      </div>
    </div>
  );
}
