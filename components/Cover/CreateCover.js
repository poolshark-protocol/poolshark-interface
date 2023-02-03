import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowLongRightIcon
} from "@heroicons/react/20/solid";
import SelectToken from "../SelectToken";
import { useAccount, useProvider } from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import CoverApproveButton from "../Buttons/CoverApproveButton";
import CoverBurnButton from "../Buttons/CoverBurnButton";
import { useState, useEffect } from "react";
import useAllowance from "../../hooks/useAllowance";
import useInputBox from "../../hooks/useInputBox";

export default function CreateCover() {
  const [expanded, setExpanded] = useState();
  const [bnInput, inputBox] = useInputBox();

  const { 
    address,
    isConnected, 
    isDisconnected 
  } = useAccount();


  const [dataState, setDataState] = useAllowance(address);


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

    return(
        <>
        <div className="mb-6">
        <h1 className="mb-3">Select Pair</h1>
        <div className="flex gap-x-4 items-center">
         <SelectToken />
         <ArrowLongRightIcon className="w-6" />
         <SelectToken />
        </div>
        </div>
              <h1 className="mb-3">How much do you want to Cover?</h1>
              <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
                <div className="flex-col justify-center w-1/2 p-2 ">
                  {inputBox("0")}
                    <div className="flex text-xs text-[#4C4C4C]">~300.56</div>
                </div>
                <div className="flex w-1/2">
                  <div className="flex justify-center ml-auto">
                    <div className="flex-col">
                      <div className="flex justify-end">
                        <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                    <div className="flex items-center gap-x-2 w-full">
                      <img className="w-7" src="/static/images/token.png" />
                      USDC
                    </div>
                  </button>
                      </div>
                      <div className="flex items-center justify-end gap-2 px-1 mt-2">
                        <button className="text-xs uppercase cursor-default text-[#0C0C0C]">
                          {/*this text is just here for styling purposes*/}
                          Max
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="text-[#646464]">Balance</div>
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
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </div>
                  <input className="bg-[#0C0C0C] py-2 outline-none text-center w-full" placeholder="0"/>
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-xs text-grey">USDC per DAI</span>
              </div>
              <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
                <span className="text-xs text-grey">Max. Price</span>
                <div className="flex justify-center items-center">
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </div>
                  <input className="bg-[#0C0C0C] py-2 outline-none text-center w-full" placeholder="0"/>
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                </div>
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
