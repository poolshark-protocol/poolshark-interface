import Navbar from "../components/Navbar";
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import UserPool from "../components/UserPool";
import SelectToken from "../components/SelectToken";
import { useState, useEffect } from "react";
import { useAccount, useProvider } from "wagmi";
import CoverMintButton from "../components/Buttons/CoverMintButton";
import CoverApproveButton from "../components/Buttons/CoverApproveButton";
import CoverBurnButton from "../components/Buttons/CoverBurnButton";
import { ConnectWalletButton } from "../components/Buttons/ConnectWalletButton";
import useAllowance from "../hooks/useAllowance";
import useInputBox from "../hooks/useInputBox";
import Link  from "next/link";
import { fetchPools } from "../utils/queries";
import TokenBalance from "../components/TokenBalance";
import { useLazyQuery } from "@apollo/client";
import { POOLS_QUERY } from "../constants/subgraphQueries";
import React from "react";

export default function Cover() {
  const {
    network: { chainId },
  } = useProvider();
  const { 
    address,
    isConnected, 
    isDisconnected 
  } = useAccount();

  useEffect(() => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    if (!isDisconnected) {
      try {
        fetchActiveItems();
      } catch (error) {
        console.error(`Fetch active item error: ${error}`);
      }
    }
  }, [isDisconnected]);

  const [bnInput, inputBox] = useInputBox();
  const [dataState] = useAllowance(address, isConnected, isDisconnected);

  const newData = useEffect(() => {
    newData = dataState;
  }, []);

  const [expanded, setExpanded] = useState();
  const [tokenOneName, setTokenOneName] = useState();

  //const allowance = allowanceFunction();

  async function getPoolData() {
    const data = await fetchPools()
    console.log(data.data.hedgePools[0].id)
    console.log(data.data.hedgePools[0].token0.name)
    console.log(data.data.hedgePools[0].token1.name)
    console.log(data.data.hedgePools)
    const token1 = JSON.stringify(data.data.hedgePools[0].token1.name);
    console.log('token1',token1)
    setTokenOneName(token1);
  }

  //async so needs to be wrapped
  useEffect(() => {
    console.log('test')
    getPoolData();
  },[])

  const [fetchActiveItems, { loading, error: fetchActiveItemError, data}] =
    useLazyQuery(POOLS_QUERY);
  


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
<div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-DMSans">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[70rem]">
          <div className="flex justify-between mb-6 items-end">
            <h1 className="text-3xl">Cover</h1>
            <span className="bg-black flex items-center gap-x-2 border border-grey2 rounded-lg text-white px-6 py-[9px] cursor-pointer hover:opacity-80">
              <InformationCircleIcon className="w-4 text-grey1"  />
              <Link href="https://docs.poolsharks.io/introduction/cover-pools/">
                <a target="_blank">
                  How it works?
                </a>
              </Link>
            </span>
          </div>
          <div className="flex space-x-8">
            <div className="bg-black w-2/3 border border-grey2 w-full rounded-t-xl p-6 gap-y-4">
              <h1 className="mb-3">How much do you want to Cover?</h1>
              <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
                <div className="flex-col justify-center w-1/2 p-2 ">
                  {inputBox("0")}
                  <div className="flex">
                    <div className="flex text-xs text-[#4C4C4C]">~300.56</div>
                  </div>
                </div>
                <div className="flex w-1/2">
                  <div className="flex justify-center ml-auto">
                    <div className="flex-col">
                      <div className="flex justify-end">
                        <SelectToken />
                      </div>
                      <div className="flex items-center justify-end gap-2 px-1 mt-2">
                        <div className="text-xs text-[#4C4C4C]">
                          <TokenBalance />
                        </div>
                        <div className="text-xs uppercase text-[#C9C9C9]">
                          Max
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h1 className="mb-3 mt-6">Set Price Range</h1>
              <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg mb-4">
                <span className="text-xs text-grey">Min. Price</span>
                <div className="flex justify-center items-center">
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </div>
                  <input className="bg-[#0C0C0C] py-2 outline-none text-center" />
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-xs text-grey">USDC per DAI</span>
              </div>
              <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
                <span className="text-xs text-grey">Max. Price</span>
                <div className="flex justify-center items-center">
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </div>
                  <input className="bg-[#0C0C0C] py-2 outline-none text-center" />
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-xs text-grey">USDC per DAI</span>
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
                {isConnected && newData === "0x00" ? <CoverApproveButton amount={bnInput}/> : <CoverMintButton amount={bnInput}/>}
                <CoverBurnButton />
              </div>
            </div>
            <div className="bg-black w-full border border-grey2 w-full rounded-t-xl p-6 space-y-4 overflow-auto h-[44rem]">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 text-grey absolute ml-[14px] mt-[13px]" />
                <input
                  className="border border-grey2 bg-dark rounded-xl py-2.5 w-full placeholder:text-grey outline-none pl-12"
                  placeholder="Search name, symbol or address"
                />
              </div>
              <div>
                <h1 className="mb-3">Poolshark Pools</h1>
                <div className="space-y-2">
                  <UserPool key={tokenOneName} name={tokenOneName}/>
                </div>
              </div>
              <div>
                <h1 className="mb-3 mt-4">UNI-V3 Pools</h1>
                <div className="space-y-2">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
