import { Fragment, useState } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Transition, Dialog } from "@headlessui/react";
  
  
  export default  function SelectToken() {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

      return (
        <div>
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
                    <div className="flex items-center gap-x-2 w-full">
                      <img className="w-7" src="/static/images/token.png" />
                      USDC
                    </div>
                    <ChevronDownIcon className="w-5" />
                  </button>
        </div>
      );
    }