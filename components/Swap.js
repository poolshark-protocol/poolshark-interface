import {
  AdjustmentsHorizontalIcon,
  ArrowSmallDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Popover } from "@headlessui/react";
import {
  ChevronDownIcon,
  ArrowPathIcon
} from "@heroicons/react/20/solid";
import SelectToken from "./SelectToken";
import SwapButton from "./Buttons/SwapButton";
import useInputBox from "../hooks/useInputBox";
import useAllowance from "../hooks/useAllowance";
import { ConnectWalletButton } from "../components/Buttons/ConnectWalletButton";
import CoverApproveButton from "../components/Buttons/CoverApproveButton";
import { useAccount } from "wagmi";
import TokenBalance from "../components/TokenBalance";


export default function Swap() {
  const { address, isConnected } = useAccount();
  const [bnInput, inputBox] = useInputBox();
  const [dataState] = useAllowance();

  const newData = useEffect(() => {
    newData = dataState;
  }, []);

  let [isOpen, setIsOpen] = useState(false);
  const [LimitActive, setLimitActive] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const [expanded, setExpanded] = useState();

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
            <div
              onClick={() => setLimitActive(false)}
              className={`${
                LimitActive
                  ? "text-grey cursor-pointer"
                  : "text-white cursor-pointer"
              }`}
            >
              Swap
            </div>
            <div
              onClick={() => setLimitActive(true)}
              className={`${
                LimitActive
                  ? "text-white cursor-pointer"
                  : "text-grey cursor-pointer"
              }`}
            >
              Limit
            </div>
          </div>
          <div className="ml-auto">
            <Popover className="relative">
              <Popover.Button className="outline-none">
                <AdjustmentsHorizontalIcon className="w-5 h-5 outline-none" />
              </Popover.Button>

              <Popover.Panel className="absolute z-10 ml-20">
              </Popover.Panel>
            </Popover>
          </div>
        </div>
        <div className="w-full mt-4 align-middle items-center flex bg-dark border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            {inputBox()}
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C]">~300.50</div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
                  <SelectToken />
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="flex text-xs text-[#4C4C4C]">
                    <TokenBalance />
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
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
                  <SelectToken />
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <TokenBalance />
                <div className="text-xs uppercase text-[#C9C9C9]">Max</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {LimitActive ? (
          <div>
            <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl mt-4">
              <div className="flex-col justify-center w-1/2 p-2 ">
                <input
                  className=" bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  placeholder="1.90"
                  value="1.67"
                />
                <div className="flex">
                  <div className="flex text-xs text-[#4C4C4C]">
                    98% above Market Price
                  </div>
                </div>
              </div>
              <div className="flex w-1/2">
                <div className="flex justify-center ml-auto">
                  <div className="flex-col">
                    <div className="flex justify-end">
                      <button className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl">
                        USDC per DAI
                        <ArrowPathIcon className="w-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-1 mt-2">
                      <div className="text-xs text-white">
                        Set to Market Price
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="py-4">
          <div
            className="flex px-2 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex-none text-xs uppercase text-[#C9C9C9]">
              1 USDC = 1 DAI
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
          {isConnected ? newData === "0x00" ? <CoverApproveButton amount={bnInput}/> :<SwapButton amount={bnInput}/> : <ConnectWalletButton />}
        </div>
      </div>
  );
}
