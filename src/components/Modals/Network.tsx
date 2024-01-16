import { Transition, Dialog } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useSwitchNetwork } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";

export default function Network({
  isOpen,
  setIsOpen,
  chainUnsupported,
  chainId,
}) {
  const [setNetworkName, setChainId] = useConfigStore((state) => [
    state.setNetworkName,
    state.setChainId,
  ]);

  const {
    chains,
    error: networkError,
    switchNetwork,
  } = useSwitchNetwork({
    onSuccess(data) {
      setIsOpen(false);
    },
  });

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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="flex items-center justify-between px-2">
                  <h1 className="text-lg">Switch Networks</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                {chainUnsupported ? (
                  <h2 className="text-sm text-grey2 mt-2 px-2">
                    Wrong network detected, switch or disconnect to continue.
                  </h2>
                ) : (
                  ""
                )}
                <div className="mt-4 space-y-1">
                  <div
                    onClick={() => {
                      setNetworkName("arbitrum-one");
                      switchNetwork(42161);
                      setChainId(42161);
                    }}
                    className={`${
                      chainId === 42161
                        ? " bg-background"
                        : "hover:bg-[#0C0C0C] hover:border-[#1C1C1C]"
                    } flex justify-between items-center w-full p-2 rounded-xl  border border-black cursor-pointer`}
                  >
                    <div className="flex gap-x-2 items-center">
                      <img src="/static/images/arb_icon.svg" />
                      Arbitrum Mainnet
                    </div>
                    <div
                      className={`${
                        chainId === 42161
                          ? " flex gap-x-2 items-center text-main text-xs"
                          : "hidden"
                      }`}
                    >
                      Connected
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    </div>
                  </div>
                  {process.env.NEXT_PUBLIC_isPRODUCTION === "false" && (
                    <div
                      onClick={() => {
                        setNetworkName("arbitrum-sepolia");
                        switchNetwork(421614);
                        setChainId(421614);
                      }}
                      className={`${
                        chainId === 421614
                          ? " bg-background"
                          : "hover:bg-[#0C0C0C] hover:border-[#1C1C1C]"
                      } flex justify-between items-center w-full p-2 rounded-xl  border border-black cursor-pointer`}
                    >
                      <div className="flex gap-x-2 items-center">
                        <img
                          className="saturate-0"
                          src="/static/images/arb_icon.svg"
                        />
                        <span className="opacity-70">Arbitrum Sepolia</span>
                      </div>
                      <div
                        className={`${
                          chainId === 421614
                            ? " flex gap-x-2 items-center text-main text-xs"
                            : "hidden"
                        }`}
                      >
                        Connected
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
