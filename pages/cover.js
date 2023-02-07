import Navbar from "../components/Navbar";
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import UserPool from "../components/Pools/UserPool";
import UserCoverPool from "../components/Pools/UserCoverPool";
import StaticUniPool from "../components/Pools/StaticUniPool";
import SelectToken from "../components/SelectToken";
import { useState, useEffect } from "react";
import { useAccount, useProvider } from "wagmi";
import CoverMintButton from "../components/Buttons/CoverMintButton";
import CoverApproveButton from "../components/Buttons/CoverApproveButton";
import CoverBurnButton from "../components/Buttons/CoverBurnButton";
import useAllowance from "../hooks/useAllowance";
import useInputBox from "../hooks/useInputBox";
import Link  from "next/link";
import { fetchPools, fetchPositions } from "../utils/queries";
import useTokenBalance from "../hooks/useTokenBalance";
import React from "react";
import CoverCollectButton from "../components/Buttons/CoverCollectButton";
import { ConnectWalletButton } from "../components/Buttons/ConnectWalletButton";
import useTokenList from "../hooks/useTokenList";
import Initial from "../components/Cover/Initial";
import CreateCover from "../components/Cover/CreateCover";
import CoverExistingPool from "../components/Cover/CoverExistingPool";

export default function Cover() {
  const [maxPrice, setMaxPrice] = useState(0);
  const [disabled, setDisabled] = useState(true);

  const increaseMaxPrice = () => {
    setMaxPrice(count => count + 1);
  };

  const [minPrice, setMinPrice] = useState(0);
 
  const increaseMinPrice = () => {
    setMinPrice(count => count + 1);
  };

  const decreaseMinPrice = () => {
  if (minPrice > 0) {
    setMinPrice(count => count - 1);
  }
};
  const decreaseMaxPrice = () => {
  if (maxPrice > 0) {
    setMaxPrice(count => count - 1);
  }
};


const handleChange = event => {
    //const valueToBn = ethers.utils.parseUnits(event.target.value, 0);
    //const result = event.target.value.replace(/\D/g, '');
    const result = event.target.value.replace(/[^0-9\.|\,]/g, '')
    //TODO: make 
    setMaxPrice(result);
    setMinPrice(result);
    // console.log('value is:', result);
};
 
  const {
    network: { chainId }, chainId: chainIdFromProvider
  } = useProvider();
  
  const { 
    address,
    isConnected, 
    isDisconnected 
  } = useAccount();

  const [expanded, setExpanded] = useState();
  /*const [tokenOneName, setTokenOneName] = useState();
  const [tokenZeroName, setTokenZeroName] = useState();
  const [tokenOneAddress, setTokenOneAddress] = useState();
  const [tokenZeroAddress, setTokenZeroAddress] = useState();
  const [poolAddress, setPoolAddress] = useState();*/
  
  const [userPositions, setUserPositions] = useState([]);
  const [allCoverPools, setAllCoverPools] = useState([]);

  const coins = useTokenList()[0];
  const [coinsForListing, setCoinsForListing] = useState(coins.listed_tokens);

  useEffect(() => {
    console.log(coinsForListing)
  },[coinsForListing])

  /*async function getPoolData() {
    const data = await fetchPools()
    console.log(data.data.coverPools[0].id)
    console.log(data.data.coverPools[0].token1.name)
    console.log(data.data.coverPools[0].token0.name)
    const token1 = JSON.stringify(data.data.coverPools[0].token1.name);
    const token0 = JSON.stringify(data.data.coverPools[0].token0.name);
    const token1Address = JSON.stringify(data.data.coverPools[0].token1.id);
    const token0Address = JSON.stringify(data.data.coverPools[0].token0.id);
    const poolAddress = JSON.stringify(data.data.coverPools[0].id);
    setTokenOneName(token1);
    setTokenZeroName(token0);
    setTokenOneAddress(token1Address);
    setTokenZeroAddress(token0Address);
    setPoolAddress(poolAddress);
  }*/

  async function getUserPositionData() {
    const data = await fetchPositions(address)
    const positions = data.data.positions

    setUserPositions(positions)
    console.log(userPositions)
  }

function renderUserCoverPools() {
    const coverPools = []
    userPositions.map(userPosition => {

    const coverPosition = {
      tokenOneName: userPosition.pool.token1.name,
      tokenZeroName: userPosition.pool.token0.name,
      tokenOneAddress: userPosition.pool.token1.id,
      tokenZeroAddress: userPosition.pool.token0.id,
      poolAddress: userPosition.pool.id,
      userOwnerAddress: userPosition.owner.replace(/"|'/g, '')
    }

    coverPools.push(coverPosition)
    console.log("coverPools inside: ", coverPools)

    })

    console.log("coverPools: ", coverPools)
    setAllCoverPools(coverPools)
    console.log("allUserPools: ", allCoverPools)
  }      


  //async so needs to be wrapped
  useEffect(() => {
    //getPoolData();
    getUserPositionData();
  },[])

  useEffect(() => {
    renderUserCoverPools();
  },[userPositions])

  useEffect(() => {
    console.log("chainId: ", chainId)
  }, [chainId])
  
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
              Mininum received after slippage (0.50%)
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
              <Initial/>
              {/*<CreateCover/> */}
              {/*<CoverExistingPool/> */}
              {/*
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
                          {tokenBalanceBox()}
                        </div>
                        <button className="text-xs uppercase text-[#C9C9C9]">
                          Max
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h1 className="mb-3 mt-6">Set Price Range</h1>
              <div className="flex justify-between w-full gap-x-6">
                <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
                <span className="text-xs text-grey">Min. Price</span>
                <div className="flex justify-center items-center">
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600" onClick={decreaseMinPrice}>
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </div>
                  <input className="bg-[#0C0C0C] py-2 outline-none text-center w-full" placeholder="0" onChange={handleChange} value={minPrice}/>
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600" onClick={increaseMinPrice}>
                    <PlusIcon className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-xs text-grey">USDC per DAI</span>
              </div>
              <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
                <span className="text-xs text-grey">Max. Price</span>
                <div className="flex justify-center items-center">
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600" onClick={decreaseMaxPrice}>
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </div>
                  <input className="bg-[#0C0C0C] py-2 outline-none text-center w-full" placeholder="0" onChange={handleChange} value={maxPrice}/>
                  <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600" onClick={increaseMaxPrice}>
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
                {isDisconnected ? null : isConnected && dataState === "0x00" ? <CoverApproveButton address={address} amount={bnInput}/> : <CoverMintButton address={address} amount={bnInput}/>}
                {isDisconnected || positionOwner === null ? null : <CoverBurnButton address={address} />}
                {isDisconnected ? null : <CoverCollectButton address={address} />}
              </div>
              */}
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
                <h1 className="mb-3">Cover Pools</h1>
                <div className="space-y-2">
                  {allCoverPools.map(allCoverPool => {
                    if(allCoverPool.userOwnerAddress === address?.toLowerCase()){
                      return(
                      <UserCoverPool
                    key={allCoverPool.tokenOneName}
                      tokenOneName={allCoverPool.tokenOneName}
                      tokenZeroName={allCoverPool.tokenZeroName}
                      tokenOneAddress={allCoverPool.tokenOneAddress}
                      tokenZeroAddress={allCoverPool.tokenZeroAddress}
                      poolAddress={allCoverPool.poolAddress}
                    />)
                    }
                  })}
                </div>
              </div>
              <div>
                <h1 className="mb-3 mt-4">UNI-V3 Pools</h1>
                <div className="space-y-2">
                  <StaticUniPool 
                />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
