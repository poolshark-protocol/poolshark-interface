import {
  ChevronDownIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import { useAccount } from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import {ConnectWalletButton} from "../Buttons/ConnectWalletButton";
import useAllowance from "../../hooks/useAllowance";
import CoverApproveButton from "../Buttons/CoverApproveButton";
import { useEffect, useState } from "react";
import {useStore} from "../../hooks/useStore"

export default function CoverExistingPool({goBack}) {
  const [pool, updatePool] = useStore((state:any) => [state.pool, state.updatePool] )
  const [expanded, setExpanded] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { 
    address,
    isConnected, 
    isDisconnected 
  } = useAccount();

  const changePrice = (direction: string, minMax: string) => {
    if (direction === "plus" && minMax === "min") {
      if (
        (document.getElementById("minInput") as HTMLInputElement).value ===
        undefined
      ) {
        const current = document.getElementById("minInput") as HTMLInputElement;
        current.value = "1";
      }
      const current = Number(
        (document.getElementById("minInput") as HTMLInputElement).value
      );
      (document.getElementById("minInput") as HTMLInputElement).value = String(
        (current + 0.01).toFixed(3)
      );
    }
    if (direction === "minus" && minMax === "min") {
      const current = Number(
        (document.getElementById("minInput") as HTMLInputElement).value
      );
      if (current === 0 || current - 1 < 0) {
        (document.getElementById("minInput") as HTMLInputElement).value = "0";
        return;
      }
      (document.getElementById("minInput") as HTMLInputElement).value = (
        current - 0.01
      ).toFixed(3);
    }

    if (direction === "plus" && minMax === "max") {
      if (
        (document.getElementById("maxInput") as HTMLInputElement).value ===
        undefined
      ) {
        const current = document.getElementById("maxInput") as HTMLInputElement;
        current.value = "1";
      }
      const current = Number(
        (document.getElementById("maxInput") as HTMLInputElement).value
      );
      (document.getElementById("maxInput") as HTMLInputElement).value = (
        current + 0.01
      ).toFixed(3);
    }
    if (direction === "minus" && minMax === "max") {
      const current = Number(
        (document.getElementById("maxInput") as HTMLInputElement).value
      );
      if (current === 0 || current - 1 < 0) {
        (document.getElementById("maxInput") as HTMLInputElement).value = "0";
        return;
      }
      (document.getElementById("maxInput") as HTMLInputElement).value = (
        current - 0.01
      ).toFixed(3);
    }
  };



const allowance = useAllowance(address);

const [sliderValue, setSliderValue] = useState(50);

const handleChange = (event: any) => {
  setSliderValue(event.target.value);
};


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
    <>
         <div className="mb-6">
        <div className="flex flex-row justify-between">
        <h1 className="mb-3">Selected Pool</h1>
        <span className="flex gap-x-1 cursor-pointer" onClick={() => goBack("initial")}><ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " /> <h1 className="mb-3 opacity-50">Back</h1> </span>
      </div>
        <div className="flex gap-x-4 items-center">
                                 <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                    <div className="flex items-center gap-x-2 w-full">
                      <img className="w-7" src="/static/images/dai_icon.png" />
                      {pool.tokenZeroName}
                    </div>
                  </button>
         <ArrowLongRightIcon className="w-6" />
                                 <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                    <div className="flex items-center gap-x-2 w-full">
                      <img className="w-7" src="/static/images/token.png" />
                      {pool.tokenOneName}
                    </div>
                  </button>
        </div>
        </div>
              <h1 className="mb-3">How much do you want to Cover?</h1>
              <div className="w-full flex items-center justify-between text-xs text-[#646464]">
                <div>0</div>
                <div>Full</div>
              </div>
              <div className="w-full flex items-center -mt-2">
                <input type="range" min="0" max="100" value={sliderValue} onChange={handleChange} className="w-full styled-slider slider-progress bg-transparent"/>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="text-[#646464]">Amount Covered</div>
                  <input className="bg-transparent text-right outline-none" placeholder="50%" value={sliderValue + '%'}/>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-[#646464]">Cover Size</div>
                  <div>500 USDC</div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-[#646464]">Amount to pay</div>
                  <div>301 USDC</div>
                </div>
              </div>
      <h1 className="mb-3 mt-4">Set Price Range</h1>
      <div className="flex justify-between w-full gap-x-6">
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Min. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("minus", "min")}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="minInput"
              type="number"
              onChange={() =>
                setMinPrice(
                  (document.getElementById("minInput") as HTMLInputElement)
                    ?.value
                )
              }
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "min")}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Max. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("minus", "max")}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="maxInput"
              type="number"
              onChange={() =>
                setMaxPrice(
                  (document.getElementById("maxInput") as HTMLInputElement)
                    ?.value
                )
              }
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "max")}>
                <PlusIcon className="w-5 h-5" />
              </button>
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
              <div className="space-y-3" >
                {isDisconnected ? <ConnectWalletButton /> : null}
                {/*  && dataState === "0x00" */}
                {isDisconnected ? null : allowance === "0.0" ? <CoverApproveButton address={address} /> : <CoverMintButton disabled={false} />}
              </div>
              </>
    )
}
