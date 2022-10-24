import {
  AdjustmentsHorizontalIcon,
  ArrowSmallDownIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import Head from "next/head";
import Image from "next/image";
import { useState, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [expanded, setExpanded] = useState();

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-2 break-normal transition duration-500 cursor-pointer h-fit">
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
    <div className="flex items-center w-full h-screen text-white ">
      <div className="flex flex-col w-full m-4 max-w-md p-6 mx-auto bg-black border border-[#313131] rounded-lg">
        <div className="flex items-center">
          <div className="flex gap-4 mb-2 text-sm">
            <div className="flex">Swap</div>
            <div className="flex text-gray-500">Limit</div>
          </div>
          <div className="ml-auto">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="px-4 py-2 ml-auto transition cursor-pointer hover:opacity-80"></div>
        <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <span class="absolute flex items-center pl-5 mr-5"></span>
          <div className="flex-col justify-center w-1/2 p-2 ">
            <input
              className=" bg-[#0C0C0C] text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
              placeholder="300"
            />
            <div className="flex">
              <div className="flex text-[10px] text-[#4C4C4C]">-300.50</div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div class="flex justify-center ml-auto">
              <div class="flex-col">
                <div className="flex">
                  <select
                    class="form-select appearance-none block w-32 rounded-md px-3 py-1.5 text-base font-normal text-gray-700bg-clip-padding bg-no-repeat border border-solid bg-black border-[#1D1D1D] transition ease-in-out m-0"
                    aria-label="coin"
                  >
                    // map.coins later
                    <option selected>USDC</option>
                    <option value="1">ETH</option>
                    <option value="2">BTC</option>
                    <option value="3">SOL</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="flex text-[10px] text-[#4C4C4C]">
                    Balance: 420.69
                  </div>
                  <div className="flex text-[10px] uppercase text-[#C9C9C9]">
                    Max
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="items-center -mb-2 -mt-2 p-2 m-auto border border-[#1E1E1E] z-50 bg-black rounded cursor-pointer">
          <ArrowSmallDownIcon className="w-4 h-4" />
        </div>

        <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <span class="absolute flex items-center pl-5 mr-5"></span>
          <div className="flex-col justify-center w-1/2 p-2 ">
            <input
              className=" bg-[#0C0C0C] text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
              placeholder="300"
            />
            <div className="flex">
              <div className="flex text-[10px] text-[#4C4C4C]">-300.50</div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div class="flex justify-center ml-auto">
              <div class="flex-col">
                <div className="flex">
                  <select
                    class="form-select appearance-none block w-32 rounded-md px-3 py-1.5 text-base font-normal text-gray-700bg-clip-padding bg-no-repeat border border-solid bg-black border-[#1D1D1D] transition ease-in-out m-0"
                    aria-label="coin"
                  >
                    // map.coins later
                    <option selected>USDC</option>
                    <option value="1">ETH</option>
                    <option value="2">BTC</option>
                    <option value="3">SOL</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="text-[10px] text-[#4C4C4C]">
                    Balance: 420.69
                  </div>
                  <div className="text-[10px] uppercase text-[#C9C9C9]">
                    Max
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex p-2 my-2">
          <div className="flex-none text-[10px] uppercase text-[#C9C9C9]">
            1 USDC = 1 DAI
          </div>
          <div className="ml-auto text-[10px] uppercase text-[#C9C9C9]">
            <button onClick={() => setExpanded(!expanded)}>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-wrap w-full break-normal transition ">
          <Option />
        </div>
        <div className="px-16 w-full py-5 mx-auto  text-xs font-bold text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
          Swap
        </div>
      </div>
    </div>
  );
}
