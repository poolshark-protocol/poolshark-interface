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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-md bg-black text-white border border-grey text-left align-middle shadow-xl px-5 py-5 transition-all">
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
                      setNetworkName("mode");
                      switchNetwork(34443);
                    }}
                    className={`${
                      chainId === 34443
                        ? " bg-main1 border-main2/20"
                        : "hover:bg-[#0C0C0C] hover:border-[#1C1C1C]"
                    } flex justify-between items-center w-full p-2 rounded-md border border-black cursor-pointer`}
                  >
                    <div className="flex gap-x-2 items-center">
                      <img
                        src="https://poolshark-token-lists.s3.amazonaws.com/images/mode_icon.svg"
                        width="28"
                        height="28"
                      />
                      Mode Mainnet
                    </div>
                    <div
                      className={`${
                        chainId === 34443
                          ? " flex gap-x-2 items-center text-main2 text-xs"
                          : "hidden"
                      }`}
                    >
                      Connected
                      <div className="h-1.5 w-1.5 bg-main2 rounded-full" />
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setNetworkName("injective-evm");
                      switchNetwork(2525);
                    }}
                    className={`${
                      chainId === 2525
                        ? " bg-main1 border-main2/20"
                        : "hover:bg-[#0C0C0C] hover:border-[#1C1C1C]"
                    } flex justify-between items-center w-full p-2 rounded-md border border-black cursor-pointer`}
                  >
                    <div className="flex gap-x-2 items-center">
                      <img
                        src="https://poolshark-token-lists.s3.amazonaws.com/images/in_evm_alt.svg"
                        width="28"
                        height="28"
                      />
                      Injective EVM
                    </div>
                    <div
                      className={`${
                        chainId === 2525
                          ? " flex gap-x-2 items-center text-main2 text-xs"
                          : "hidden"
                      }`}
                    >
                      Connected
                      <div className="h-1.5 w-1.5 bg-main2 rounded-full" />
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setNetworkName("arbitrum-one");
                      switchNetwork(42161);
                    }}
                    className={`${
                      chainId === 42161
                        ? " bg-main1 border-main2/20"
                        : "hover:bg-[#0C0C0C] hover:border-[#1C1C1C]"
                    } flex justify-between items-center w-full p-2 rounded-md border border-black cursor-pointer`}
                  >
                    <div className="flex gap-x-2 items-center">
                      <img src="https://poolshark-token-lists.s3.amazonaws.com/images/arb_icon.svg" />
                      Arbitrum Mainnet
                    </div>
                    <div
                      className={`${
                        chainId === 42161
                          ? " flex gap-x-2 items-center text-main2 text-xs"
                          : "hidden"
                      }`}
                    >
                      Connected
                      <div className="h-1.5 w-1.5 bg-main2 rounded-full" />
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setNetworkName("scroll");
                      switchNetwork(534352);
                    }}
                    className={`${
                      chainId === 534352
                        ? " bg-main1 border-main2/20"
                        : "hover:bg-[#0C0C0C] hover:border-[#1C1C1C]"
                    } flex justify-between items-center w-full p-2 rounded-md border border-black cursor-pointer`}
                  >
                    <div className="flex gap-x-2 items-center">
                      <img
                        src="https://scroll-tech.github.io/token-list/scroll.png"
                        width="28"
                        height="28"
                      />
                      Scroll Mainnet
                    </div>
                    <div
                      className={`${
                        chainId === 534352
                          ? " flex gap-x-2 items-center text-main2 text-xs"
                          : "hidden"
                      }`}
                    >
                      Connected
                      <div className="h-1.5 w-1.5 bg-main2 rounded-full" />
                    </div>
                  </div>
                  {process.env.NEXT_PUBLIC_isPRODUCTION === "false" && (
                    <div
                      onClick={() => {
                        setNetworkName("arbitrum-sepolia");
                        switchNetwork(421614);
                      }}
                      className={`${
                        chainId === 421614
                          ? " bg-main1 border-main2/20"
                          : "hover:bg-[#0C0C0C] hover:border-[#1C1C1C]"
                      } flex justify-between items-center w-full p-2 rounded-md border border-black cursor-pointer`}
                    >
                      <div className="flex gap-x-2 items-center">
                        <img
                          className="saturate-0"
                          src="https://poolshark-token-lists.s3.amazonaws.com/images/arb_icon.svg"
                        />
                        <span className="opacity-70">Arbitrum Sepolia</span>
                      </div>
                      <div
                        className={`${
                          chainId === 421614
                            ? " flex gap-x-2 items-center text-main2 text-xs"
                            : "hidden"
                        }`}
                      >
                        Connected
                        <div className="h-1.5 w-1.5 bg-main2 rounded-full" />
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
