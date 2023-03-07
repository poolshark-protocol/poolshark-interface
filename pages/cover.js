import Navbar from "../components/Navbar";
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  ArrowLongLeftIcon
} from "@heroicons/react/20/solid";
import UserCoverPool from "../components/Pools/UserCoverPool";
import StaticUniPool from "../components/Pools/StaticUniPool";
import { useState, useEffect } from "react";
import { useAccount, useProvider } from "wagmi";
import Link from "next/link";
import { fetchPositions, tickMath } from "../utils/queries";
import React from "react";
import useTokenList from "../hooks/useTokenList";
import Initial from "../components/Cover/Initial";
import CreateCover from "../components/Cover/CreateCover";
import CoverExistingPool from "../components/Cover/CoverExistingPool";

export default function Cover() {
  const [maxPrice, setMaxPrice] = useState(0);
  const [disabled, setDisabled] = useState(true);


  const increaseMaxPrice = () => {
    setMaxPrice((count) => count + 1);
  };

  const [minPrice, setMinPrice] = useState(0);

  const increaseMinPrice = () => {
    setMinPrice((count) => count + 1);
  };

  const decreaseMinPrice = () => {
    if (minPrice > 0) {
      setMinPrice((count) => count - 1);
    }
  };
  const decreaseMaxPrice = () => {
    if (maxPrice > 0) {
      setMaxPrice((count) => count - 1);
    }
  };

  const handleChange = (event) => {
    //const valueToBn = ethers.utils.parseUnits(event.target.value, 0);
    //const result = event.target.value.replace(/\D/g, '');
    const result = event.target.value.replace(/[^0-9\.|\,]/g, "");
    //TODO: make
    setMaxPrice(result);
    setMinPrice(result);
    // console.log('value is:', result);
  };

  const {
    network: { chainId },
    chainId: chainIdFromProvider,
  } = useProvider();

  const { address, isConnected, isDisconnected } = useAccount();

  const [expanded, setExpanded] = useState();

  const [coverPositions, setCoverPositions] = useState([]);
  const [allCoverPositions, setAllCoverPositions] = useState([]);
  const [userPositionExists, setUserPositionExists] = useState(false);

  const coins = useTokenList()[0];
  const [coinsForListing, setCoinsForListing] = useState(coins.listed_tokens);

  useEffect(() => {
    console.log(coinsForListing);
  }, [coinsForListing]);

  async function getUserPositionData() {
    const data = await fetchPositions(address)
    const positions = data.data.positions

    setCoverPositions(positions)
  }

function mapUserCoverPositions() {
    const mappedCoverPositions = []
    coverPositions.map(coverPosition => {

    const coverPositionData = {
      tokenOneName: coverPosition.pool.token1.name,
      tokenZeroName: coverPosition.pool.token0.name,
      tokenOneAddress: coverPosition.pool.token1.id,
      tokenZeroAddress: coverPosition.pool.token0.id,
      poolAddress: coverPosition.pool.id,
      userOwnerAddress: coverPosition.owner.replace(/"|'/g, '')
    }
    
    mappedCoverPositions.push(coverPositionData)
    })

    setAllCoverPositions(mappedCoverPositions)
  }

function checkUserPositionExists() {
  allCoverPositions.map(allCoverPosition => {
    if(allCoverPosition.userOwnerAddress === address?.toLowerCase()){
      setUserPositionExists(true)
    }
  })}


  //async so needs to be wrapped
  useEffect(() => {
    getUserPositionData();
  },[])

  useEffect(() => {
    mapUserCoverPositions();
  },[coverPositions])

  useEffect(() => {
    checkUserPositionExists();
  },[])

  useEffect(() => {
    console.log("chainId: ", chainId);
  }, [chainId]);

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
              <InformationCircleIcon className="w-4 text-grey1" />
              <Link href="https://docs.poolsharks.io/introduction/cover-pools/">
                <a target="_blank">How it works?</a>
              </Link>
            </span>
          </div>
          <div className="flex space-x-8">
            <div className="bg-black w-2/3 border border-grey2 w-full rounded-t-xl p-6 gap-y-4">
              {userPositionExists ? <CreateCover /> : <Initial />}
            </div>
            {isDisconnected ? (
   
            <div className="bg-black w-full border border-grey2 w-full rounded-t-xl p-6 space-y-4 overflow-auto h-[44rem]">
    <ArrowLongLeftIcon className="flex flex-row h-1/2 w-1/2 justify-center items-center m-auto" />
    </div>
  ) : (
    <div className="bg-black w-full border border-grey2 w-full rounded-t-xl p-6 space-y-4 overflow-auto h-[44rem]">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 text-grey absolute ml-[14px] mt-[13px]" />
                <input
                  className="border border-grey2 bg-dark rounded-xl py-2.5 w-full placeholder:text-grey outline-none pl-12"
                  placeholder="Search name, symbol or address"
                />
              </div>
              <div>
                <h1 className="mb-3">User Cover Positions</h1>
                <div className="space-y-2">
                  {allCoverPositions.map(allCoverPosition => {
                      if(allCoverPosition.userOwnerAddress === address?.toLowerCase()){
                        return(
                        <UserCoverPool
                      key={allCoverPosition.tokenOneName}
                        tokenOneName={allCoverPosition.tokenOneName}
                        tokenZeroName={allCoverPosition.tokenZeroName}
                        tokenOneAddress={allCoverPosition.tokenOneAddress}
                        tokenZeroAddress={allCoverPosition.tokenZeroAddress}
                        poolAddress={allCoverPosition.poolAddress}
                      />)
                      }
                    })}
                </div>
              </div>
              <div>
                <h1 className="mb-3 mt-4">User UNI-V3 Positions</h1>
                <div className="space-y-2">
                  <StaticUniPool />
                </div>
              </div>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
