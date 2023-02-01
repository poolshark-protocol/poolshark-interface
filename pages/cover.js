import Navbar from "../components/Navbar";
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import UserPool from "../components/UserPool";
import UserCoverPool from "../components/UserCoverPool";
import StaticUniPool from "../components/StaticUniPool";
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

  const [bnInput, inputBox] = useInputBox();
  const [tokenBalanceInfo, tokenBalanceBox] = useTokenBalance();
  const [dataState, setDataState] = useAllowance(address);

  const [expanded, setExpanded] = useState();
  const [tokenOneName, setTokenOneName] = useState();
  const [tokenZeroName, setTokenZeroName] = useState();
  const [tokenOneAddress, setTokenOneAddress] = useState();
  const [tokenZeroAddress, setTokenZeroAddress] = useState();
  const [poolAddress, setPoolAddress] = useState();

  const [userTokenOneName, setUserTokenOneName] = useState();
  const [userTokenZeroName, setUserTokenZeroName] = useState();
  const [userTokenOneAddress, setUserTokenOneAddress] = useState();
  const [userTokenZeroAddress, setUserTokenZeroAddress] = useState();
  const [userPoolAddress, setUserPoolAddress] = useState();
  const [positionOwner, setPositionOwner] = useState(null);

  const [coins] = useTokenList();

  async function getPoolData() {
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
  }

  async function getPositionData() {
    const data = await fetchPositions(address)
    const positions = data.data.positions

    const ownerAddress = JSON.stringify(data.data.positions[0].owner).replace(/"|'/g, '');
    const idAddress = JSON.stringify(data.data.positions[0].id);
    console.log('positionOwner: ', ownerAddress)
    console.log('address: ', address?.toLowerCase())

    if (ownerAddress === address?.toLowerCase()){
        console.log("matched address with position owner")
        setPositionOwner(ownerAddress);
        setUserTokenOneName()
        setUserTokenZeroName()
        setUserTokenOneAddress()
        setUserTokenZeroAddress()
        setUserPoolAddress()
    }
  }

function renderUserPositions() {
  return(useEffect(() => {
    async function fetchUserPositions() {
      const data = await fetchPositions(address)
      return(
        <div>
          {data.data.positions.map((position) => {
            <UserCoverPool
          key={JSON.stringify(position.pool.token1.name)}
            tokenOneName={JSON.stringify(position.pool.token1.name)}
            tokenZeroName={JSON.stringify(position.pool.token0.name)}
            tokenOneAddress={JSON.stringify(position.pool.token1.id)}
            tokenZeroAddress={JSON.stringify(position.pool.token0.id)}
            poolAddress={JSON.stringify(position.pool.id)}
          />})}
        </div>
      )
    }

    fetchUserPositions()
  },[]))
}

  //async so needs to be wrapped
  useEffect(() => {
    getPoolData();
    getPositionData();
  },[])

  useEffect(() => {
    console.log("chainId: ", chainId)
  }, [chainId])

  useEffect(() => {
    console.log("coin list; ", coins)
    const tokenOneFromCoins = coins.map((coin, index) => {
      return(
        <div key={index}>
          {coin.name}
          {coin.symbol}
          {coin.id}
          {coin.decimals}
          {coin.coingecko_url}
          {coin.market_cap_usd}
          {coin.market_cap_rank}
          {coin.logoURI}
        </div>
      )
    })
    console.log("tokenOneFromCoins: ", tokenOneFromCoins)
    const slicedCoins = coins.slice(0, 10);
    console.log("slicedCoins: ", slicedCoins)
  }, [coins])
  
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
                <h1 className="mb-3">Poolshark Cover Pools</h1>
                <div className="space-y-2">
                  {/*<UserCoverPool
                key={tokenOneName} 
                  tokenOneName={tokenOneName}
                  tokenZeroName={tokenZeroName} 
                  tokenOneAddress={tokenOneAddress} 
                  tokenZeroAddress={tokenZeroAddress} 
                  poolAddress={poolAddress}
                />*/}
                  {renderUserPositions()}
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
