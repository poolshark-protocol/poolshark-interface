import Navbar from "../../components/Navbar";
import {
  PlusSmallIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import UserPool from "../../components/Pools/UserPool";
import UserCoverPool from "../../components/Pools/UserCoverPool";
import PoolList from "../../components/Pools/PoolList";
import Link from "next/link";
import { Listbox, Transition } from "@headlessui/react";
import { fetchRangePools, fetchRangePositions, fetchPools, fetchPositions } from "../../utils/queries";
import { Fragment, useState, useEffect } from "react";
import { useAccount } from "wagmi";


export default function Pool() {

    const poolTypes = [
      { id: 1, type: "Range Pools", unavailable: false },
      { id: 2, type: "Cover Pools", unavailable: false },
    ];

    const { address, isConnected, isDisconnected } = useAccount();
  
    const [rangePools, setRangePools] = useState([]);
    const [allRangePools, setAllRangePools] = useState([]);
  
    async function getRangePoolData() {
      const data = await fetchRangePools();
      const pools = data["data"].rangePools;
  
      setRangePools(pools);
    }
  
    function mapRangePools() {
      const mappedRangePools = [];
      
      rangePools.map((rangePool) => {
        const rangePoolData = {
          tokenOneName: rangePool.token1.name,
          tokenZeroName: rangePool.token0.name,
          tvlUsd: rangePool.totalValueLockedUsd,
          volumeUsd: rangePool.volumeUsd,
          volumeEth: rangePool.volumeEth,
        };
  
        mappedRangePools.push(rangePoolData);
      });
  
      setAllRangePools(mappedRangePools);
    }
  
    //async so needs to be wrapped
    useEffect(() => {
      getRangePoolData();
    }, []);
  
    useEffect(() => {
      mapRangePools();
    }, [rangePools]);

    const [coverPools, setCoverPools] = useState([]);
    const [allCoverPools, setAllCoverPools] = useState([]);

  async function getCoverPoolData() {
    const data = await fetchPools();
    const pools = data["data"].coverPools;

    setCoverPools(pools);
  }

  function mapCoverPools() {
    const mappedCoverPools = [];
    
    coverPools.map((coverPool) => {
      const coverPoolData = {
        tokenOneName: coverPool.token1.name,
        tokenZeroName: coverPool.token0.name,
        tvlUsd: coverPool.totalValueLockedUsd,
        volumeUsd: coverPool.volumeUsd,
        volumeEth: coverPool.volumeEth,
      };

      mappedCoverPools.push(coverPoolData);
    });

    setAllCoverPools(mappedCoverPools);
  }

  //async so needs to be wrapped
  useEffect(() => {
    getCoverPoolData();
  }, []);

  useEffect(() => {
    mapCoverPools();
  }, [coverPools]);

    const [rangePositions, setRangePositions] = useState([]);
    const [allRangePositions, setAllRangePositions] = useState([]);

    async function getUserRangePositionData() {
      const data = await fetchRangePositions(address)
      const positions = data["data"].positions
  
      setRangePositions(positions)
    }
  
  function mapUserRangePositions() {
      const mappedRangePositions = []
      rangePositions.map(rangePosition => {
  
      const rangePositionData = {
        tokenOneName: rangePosition.pool.token1.name,
        tokenZeroName: rangePosition.pool.token0.name,
        tokenOneAddress: rangePosition.pool.token1.id,
        tokenZeroAddress: rangePosition.pool.token0.id,
        poolAddress: rangePosition.pool.id,
        userOwnerAddress: rangePosition.owner.replace(/"|'/g, '')
      }
      
      mappedRangePositions.push(rangePositionData)
      })
  
      setAllRangePositions(mappedRangePositions)
    }

    //async so needs to be wrapped
    useEffect(() => {
      getUserRangePositionData();
    },[])
  
    useEffect(() => {
      mapUserRangePositions();
    },[rangePositions])
  
  const [coverPositions, setCoverPositions] = useState([]);
  const [allCoverPositions, setAllCoverPositions] = useState([]);

  async function getUserCoverPositionData() {
    const data = await fetchPositions(address)
    const positions = data["data"].positions

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

  //async so needs to be wrapped
  useEffect(() => {
    getUserCoverPositionData();
  },[])

  useEffect(() => {
    mapUserCoverPositions();
  },[coverPositions])

const [selected, setSelected] = useState(poolTypes[0]);

function SelectPool() {

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative mt-1 z-50">
        <Listbox.Button className="relative w-52 cursor-default cursor-pointer rounded-lg bg-black text-white border border-grey1 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <span className="block truncate">{selected.type}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 cursor-pointer w-full text-white overflow-auto rounded-md bg-black border border-grey1 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {poolTypes.map((poolType, poolTypeIdx) => (
              <Listbox.Option
                key={poolTypeIdx}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 px-4 ${
                    active ? "text-white" : "text-grey"
                  }`
                }
                value={poolType}
              >
                {({ selected }) => (
                  <>
                    <span>{poolType.type}</span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}


  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-range min-h-screen font-DMSans">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[55rem]">
          <div className="flex justify-between mb-6 items-end">
            <div className="flex items-center gap-x-4">
              <h1 className="text-3xl">Pools</h1>
              <div className="cursor-pointer">
                <SelectPool />
              </div>
            </div>
            <Link href="/pool/create">
              <button className="flex items-center gap-x-1.5 px-7 py-[9px] text-white text-sm transition whitespace-nowrap rounded-lg cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
                <PlusSmallIcon className="w-6" />
                Create Pool
              </button>
            </Link>
          </div>
          <div className="bg-black border border-grey2 w-full rounded-t-xl p-6 space-y-4 h-[44rem] overflow-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 text-grey absolute ml-[14px] mt-[13px]" />
              <input
                className="border border-grey2 bg-dark rounded-xl py-2.5 w-full placeholder:text-grey outline-none pl-12"
                placeholder="Search name, symbol or address"
              />
            </div>
            <div className="">
              <h1 className="mb-3">My Positions</h1>
              <div className="space-y-2">
              {selected.id === 2 ? (
              allRangePositions.map(allRangePosition => {
                      if(allRangePosition.userOwnerAddress === address?.toLowerCase()){
                        return(
                        <UserPool
                      key={allRangePosition.tokenOneName}
                        tokenOneName={allRangePosition.tokenOneName}
                        tokenZeroName={allRangePosition.tokenZeroName}
                        tokenOneAddress={allRangePosition.tokenOneAddress}
                        tokenZeroAddress={allRangePosition.tokenZeroAddress}
                        poolAddress={allRangePosition.poolAddress}
                      />)
                      }
                    })) : (
                  allCoverPositions.map(allCoverPosition => {
                    if(allCoverPosition.userOwnerAddress === address?.toLowerCase()){
                      return(
                      <UserCoverPool
                    key={allCoverPosition.tokenOneName}
                      tokenOneName={allCoverPosition.tokenOneName}
                      tokenZeroName={allCoverPosition.tokenZeroName}
                      tokenOneAddress={allCoverPosition.tokenOneAddress}
                      tokenZeroAddress={allCoverPosition.tokenZeroAddress}
                      poolAddress={allCoverPosition.poolAddress}
                      prefill={undefined}
                      close={undefined}
                    />)
                    }
                  }))
                  }
              </div>
            </div>
            <div className="">
              <h1 className="mb-3">All Pools</h1>
              <div className="space-y-2">
                <table className="w-full table-auto">
                  <thead className="mb-3">
                    <tr className="text-xs text-grey">
                      <th className="text-left font-light">Name</th>
                      <th className="text-right font-light">TVL</th>
                      <th className="text-right font-light">Volume(USD)</th>
                      <th className="text-right font-light">Volume(ETH)</th>
                    </tr>
                  </thead>
                  <tbody>
                  {selected.id === 1 ? (
                    allRangePools.map(allRangePool => {
                          return(
                          <PoolList
                        key={allRangePool.tokenOneName}
                          tokenOneName={allRangePool.tokenOneName}
                          tokenZeroName={allRangePool.tokenZeroName}
                          tvlUsd={allRangePool.tvlUsd}
                          volumeUsd={allRangePool.volumeUsd}
                          volumeEth={allRangePool.volumeEth}
                        />)
                        })) : (
                          allCoverPools.map(allCoverPool => {
                            return(
                            <PoolList
                          key={allCoverPool.tokenOneName}
                            tokenOneName={allCoverPool.tokenOneName}
                            tokenZeroName={allCoverPool.tokenZeroName}
                            tvlUsd={allCoverPool.tvlUsd}
                            volumeUsd={allCoverPool.volumeUsd}
                            volumeEth={allCoverPool.volumeEth}
                          />)
                          }))
                      }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
