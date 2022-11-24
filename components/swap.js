import {
  AdjustmentsHorizontalIcon,
  ArrowSmallDownIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import Head from "next/head";
import Image from "next/image";
import { useState, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Swap() {
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
      <div className="flex flex-col w-full max-w-md px-6 pt-5 pb-7 mx-auto bg-black border border-grey2 rounded-xl">
        <div className="flex items-center">
          <div className="flex gap-4 mb-1.5 text-sm">
            <div className="flex">Swap</div>
            <div className="flex text-grey">Limit</div>
            <div className="flex" onClick={() => connectToFuel()}>Connect wallet</div>
            <div className="flex" onClick={() => disconnectFromFuel()}>Disconnect wallet</div>
          </div>
          <div className="ml-auto">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="px-4 py-2 ml-auto transition cursor-pointer hover:opacity-80"></div>
        <div className="w-full align-middle items-center flex bg-dark border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <span class="absolute flex items-center pl-5 mr-5"></span>
          <div className="flex-col justify-center w-1/2 p-2 ">
            <input
              className=" bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
              placeholder="300"
            />
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C]">-300.50</div>
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
        <div className="items-center -mb-2 -mt-2 p-2 m-auto border border-[#1E1E1E] z-50 bg-black rounded-lg cursor-pointer">
          <ArrowSmallDownIcon className="w-4 h-4" />
        </div>

        <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <span class="absolute flex items-center pl-5 mr-5"></span>
          <div className="flex-col justify-center w-1/2 p-2 ">
            <input
              className=" bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
              placeholder="300"
            />
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C]">-300.50</div>
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
