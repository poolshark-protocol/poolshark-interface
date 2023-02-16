import {
  ChevronDownIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/20/solid";
import { useAccount } from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import CoverApproveButton from "../Buttons/CoverApproveButton";
import { useState } from "react";
import useAllowance from "../../hooks/useAllowance";
import useInputBox from "../../hooks/useInputBox";

export default function CoverExistingPool() {
  const [expanded, setExpanded] = useState();

  const { 
    address,
    isConnected, 
    isDisconnected 
  } = useAccount();

  const [dataState, setDataState] = useAllowance(address);

  for (let e of document.querySelectorAll('input[type="range"].slider-progress')) {
  e.style.setProperty('--value', e.value);
  e.style.setProperty('--min', e.min == '' ? '0' : e.min);
  e.style.setProperty('--max', e.max == '' ? '100' : e.max);
  e.addEventListener('input', () => e.style.setProperty('--value', e.value));
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
    <>
        <div className="mb-6">
        <h1 className="mb-3">Selected Pool</h1>
        <div className="flex gap-x-4 items-center">
                                 <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                    <div className="flex items-center gap-x-2 w-full">
                      <img className="w-7" src="/static/images/token.png" />
                      USDC
                    </div>
                  </button>
         <ArrowLongRightIcon className="w-6" />
                                 <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                    <div className="flex items-center gap-x-2 w-full">
                      <img className="w-7" src="/static/images/token.png" />
                      USDC
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
                <input type="range" className="w-full styled-slider slider-progress bg-transparent"/>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="text-[#646464]">Amount Covered</div>
                  <input className="bg-transparent text-right outline-none" placeholder="50%"/>
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
                <div className="bg-[#0C0C0C] border border-[#1C1C1C] text-center p-2 rounded-lg w-full">
                <span className="text-xs text-grey">Min. Price</span>
                <div className="text-lg">1500</div>
                <span className="text-xs text-grey">USDC per DAI</span>
              </div>
              <div className="bg-[#0C0C0C] border border-[#1C1C1C] text-center p-2 rounded-lg w-full">
                <span className="text-xs text-grey">Max. Price</span>
                  <div className="text-lg">1500</div>
                <span className="text-xs text-grey">USDC per DAI</span>
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
                {isDisconnected ? null : isConnected && dataState === "0x00" ? <CoverApproveButton address={address} amount={"0"}/> : <CoverMintButton address={address} amount={"0"}/>}
              </div>
              </>
    )
}
