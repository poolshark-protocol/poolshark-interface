import Navbar from '../../components/Navbar'
import {
  PlusSmallIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import UserPool from '../../components/Pools/UserPool'
import UserCoverPool from '../../components/Pools/UserCoverPool'
import PoolList from '../../components/Pools/PoolList'
import Link from 'next/link'
import { Listbox, Transition } from '@headlessui/react'
import {
  fetchRangePools,
  fetchRangePositions,
  fetchCoverPools,
  fetchCoverPositions,
} from '../../utils/queries'
import { Fragment, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import {
  mapCoverPools,
  mapRangePools,
  mapUserCoverPositions,
  mapUserRangePositions,
} from '../../utils/maps'
import { TickMath } from '../../utils/math/tickMath'

export default function Pool() {
  const poolTypes = [
    { id: 1, type: 'Range Pools', unavailable: false },
    { id: 2, type: 'Cover Pools', unavailable: false },
  ]
  const { address, isDisconnected } = useAccount()

  const [selected, setSelected] = useState(poolTypes[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [allRangePositions, setAllRangePositions] = useState([])
  const [allCoverPositions, setAllCoverPositions] = useState([])
  const [allRangePools, setAllRangePools] = useState([])
  const [allCoverPools, setAllCoverPools] = useState([])

  //////////////////////Get Pools Data
  useEffect(() => {
    getRangePoolData()
    getCoverPoolData()
  }, [])

  useEffect(() => {
    if (address) {
      getUserRangePositionData()
      getUserCoverPositionData()
    }
  }, [address])

  useEffect(() => {
    setTimeout(() => {
      if (allRangePositions) {
        if(selected.id === 1) {
          getUserRangePositionData()
        }
      }
    }, 2000)
  }, [allRangePositions])

  useEffect(() => {
    setTimeout(() => {
      if (allCoverPositions) {
        if(selected.id === 2) {
          getUserCoverPositionData()
        }
      }
    }, 2000)
  }, [allCoverPositions])

  async function getUserRangePositionData() {
    try {
      const data = await fetchRangePositions(address)
      if (data['data'])
        setAllRangePositions(
          mapUserRangePositions(data['data'].positionFractions),
        )
    } catch (error) {
      console.log(error)
    }
  }

  async function getUserCoverPositionData() {
    const data = await fetchCoverPositions(address)
    if (data['data']) {
      const positions = data['data'].positions
      console.log('positions length', positions.length)
      const positionData = mapUserCoverPositions(positions)
      setAllCoverPositions(positionData)
    }
  }

  async function getRangePoolData() {
    const data = await fetchRangePools()
    if (data['data']) {
      const pools = data['data'].rangePools
      setAllRangePools(mapRangePools(pools))
    }
  }

  async function getCoverPoolData() {
    const data = await fetchCoverPools()
    if (data['data']) {
      const pools = data['data'].coverPools
      setAllCoverPools(mapCoverPools(pools))
    }
  }

  //////////////////////

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value)
  }

  function SelectPool() {
    return (
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1 z-50">
          <Listbox.Button className="relative w-40 md:w-52 cursor-default cursor-pointer rounded-lg bg-black text-white border border-grey1 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
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
                      active ? 'text-white' : 'text-grey'
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
    )
  }

  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white relative min-h-[calc(100vh-76px)] w-full  px-3 md:px-0">
        <div className="w-[60rem] mt-[10vh] mb-[15vh]">
          <div className="flex w-full justify-between mb-6 items-end">
            <div className="flex md:flex-row gap-y-4 flex-col w-full justify-start md:items-center items-start gap-x-4">
              <h1 className="text-3xl">Pools</h1>
              <div className="cursor-pointer flex flex-row-reverse md:flex-row gap-x-3">
                <SelectPool />
              </div>
            </div>
            <span className="bg-black whitespace-nowrap md:text-base text-sm flex items-center gap-x-2 border border-grey2 rounded-lg text-white px-6 py-[10px] md:py-[9px] cursor-pointer hover:opacity-80">
              <InformationCircleIcon className="w-4 text-grey1" />
              <Link
                href={
                  selected.id == 1
                    ? "https://docs.poolsharks.io/overview/range-pools/"
                    : "https://docs.poolsharks.io/overview/cover-pools/"
                }
              >
                <>
                <a target="_blank" className="md:block hidden">How it works?</a>
                <a target="_blank" className="md:hidden block">Docs</a>
                </>
              </Link>
            </span>
            {/* <Link
              // href={{
              //   pathname:
              //     selected.id == 1 ? "/pool/concentrated" : "/pool/directional",
              //   query: {
              //     account: "",
              //     poolId: selected.id.toString(),
              //     tokenOneName: "",
              //     tokenOneSymbol: "",
              //     tokenOneLogoURI: "",
              //     tokenOneAddress: "",
              //     tokenZeroName: "",
              //     tokenZeroSymbol: "",
              //     tokenZeroLogoURI: "",
              //     tokenZeroAddress: "",
              //   },
              // }}
            > */}
            {/*<button className="flex items-center gap-x-1.5 px-7 py-[9px] text-white text-sm transition whitespace-nowrap rounded-lg cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
              <PlusSmallIcon className="w-6" />
              Create Pool
            </button>*/}
            {/* </Link> */}
          </div>
          <div className="bg-black  border border-grey2 w-full rounded-xl md:p-6 p-3 space-y-4 min-h-[70vh]">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 text-grey absolute ml-[14px] mt-[13px]" />
              <input
                autoComplete="off"
                className="border border-grey2 bg-dark rounded-xl py-2.5 w-full placeholder:text-grey outline-none pl-12 md:text-base text-sm"
                placeholder="Search name, symbol or address"
                value={searchTerm}
                onChange={handleSearchTermChange}
              />
            </div>
            <div className="">
              <h1 className="mb-3">My Positions</h1>
              <div className="space-y-2">
                {/* // allRangePositions.length === 0 || 
                // allCoverPositions.length=== 0 */}
                {isDisconnected ? (
                  <div className="space-y-2">
                    <div className="text-grey text-sm border-grey2 border bg-dark rounded-lg py-10 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-14 py-4 mx-auto text-grey"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h9.454a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73zm3.068-5.852A1.25 1.25 0 015.273 4.5h9.454a1.25 1.25 0 011.205.918l1.523 5.52c.006.02.01.041.015.062H14a1 1 0 00-.86.49l-.606 1.02a1 1 0 01-.86.49H8.236a1 1 0 01-.894-.553l-.448-.894A1 1 0 006 11H2.53l.015-.062 1.523-5.52z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {/* Your {selected.id === 1 ? <>range</> : <>cover</>} pools
                      will appear here.  */}
                      Please Connect Wallet.
                    </div>
                  </div>
                ) : (
                  <>
                    {selected.id === 1 ? (
                      allRangePositions.length === 0 ? (
                        <div className="space-y-2">
                          <div className="text-grey text-sm border-grey2 border bg-dark rounded-lg py-10 text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="md:w-14 w-10 py-4 mx-auto text-grey"
                            >
                              <path
                                fillRule="evenodd"
                                d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h9.454a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73zm3.068-5.852A1.25 1.25 0 015.273 4.5h9.454a1.25 1.25 0 011.205.918l1.523 5.52c.006.02.01.041.015.062H14a1 1 0 00-.86.49l-.606 1.02a1 1 0 01-.86.49H8.236a1 1 0 01-.894-.553l-.448-.894A1 1 0 006 11H2.53l.015-.062 1.523-5.52z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Your range positions will appear here.
                          </div>
                        </div>
                      ) : (
                        allRangePositions.map((allRangePosition) => {
                          console.log('user liquidity check 2', allRangePosition.userLiquidity)
                          if (
                            allRangePosition.id != undefined &&
                            allRangePosition.userOwnerAddress ===
                              address?.toLowerCase() &&
                            (allRangePosition.tokenZero.name.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                              allRangePosition.tokenOne.name.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allRangePosition.tokenZero.symbol.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allRangePosition.tokenOne.symbol.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allRangePosition.tokenZero.id.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allRangePosition.tokenOne.id.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              searchTerm === "")
                          ) {
                            return (
                              <UserPool
                                key={allRangePosition.id + "rangePosition"}
                                account={address}
                                poolId={allRangePosition.poolId}
                                tokenZero={allRangePosition.tokenZero}
                                tokenOne={allRangePosition.tokenOne}
                                valueTokenZero={allRangePosition.valueTokenZero}
                                valueTokenOne={allRangePosition.valueTokenOne}
                                min={allRangePosition.min}
                                max={allRangePosition.max}
                                price={allRangePosition.price}
                                userLiquidity={allRangePosition.userLiquidity}
                                userTokenAmount={allRangePosition.userTokenAmount}
                                feeTier={allRangePosition.feeTier}
                                tickSpacing={allRangePosition.tickSpacing}
                                tvlUsd={allRangePosition.tvlUsd}
                                volumeUsd={allRangePosition.volumeUsd}
                                volumeEth={allRangePosition.volumeEth}
                                href={"/pool/view/range"}
                              />
                            );
                          }
                        })
                      )
                    ) : allCoverPositions.length === 0 ? (
                      <div className="space-y-2">
                        <div className="text-grey text-sm border-grey2 border bg-dark rounded-lg py-10 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="md:w-14 w-10 py-4 mx-auto text-grey"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h9.454a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73zm3.068-5.852A1.25 1.25 0 015.273 4.5h9.454a1.25 1.25 0 011.205.918l1.523 5.52c.006.02.01.041.015.062H14a1 1 0 00-.86.49l-.606 1.02a1 1 0 01-.86.49H8.236a1 1 0 01-.894-.553l-.448-.894A1 1 0 006 11H2.53l.015-.062 1.523-5.52z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Your cover positions will appear here.
                        </div>
                      </div>
                    ) : (
                      allCoverPositions.map((allCoverPosition) => {
                        if (
                          allCoverPosition.id != undefined &&
                          allCoverPosition.userOwnerAddress ===
                            address?.toLowerCase() &&
                          (allCoverPosition.tokenZero.name.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                            allCoverPosition.tokenOne.name.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPosition.tokenZero.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPosition.tokenOne.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPosition.tokenZero.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPosition.tokenOne.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            searchTerm === "")
                        ) {
                          console.log('claimTick', allCoverPosition.claim)
                          return (
                            <UserCoverPool
                              key={allCoverPosition.id + "coverPosition"}
                              account={address}
                              poolId={allCoverPosition.poolId}
                              tokenZero={allCoverPosition.tokenZero}
                              valueTokenZero={allCoverPosition.valueTokenZero}
                              tokenOne={allCoverPosition.tokenOne}
                              valueTokenOne={allCoverPosition.valueTokenOne}
                              min={allCoverPosition.min}
                              max={allCoverPosition.max}
                              zeroForOne={allCoverPosition.zeroForOne}
                              userFillIn={allCoverPosition.userFillIn}
                              userFillOut={allCoverPosition.userFillOut}
                              epochLast={allCoverPosition.epochLast}
                              liquidity={allCoverPosition.liquidity}
                              lowerPrice={parseFloat(
                                TickMath.getPriceStringAtTick(
                                  allCoverPosition.lowerTick
                                )
                              )}
                              upperPrice={parseFloat(
                                TickMath.getPriceStringAtTick(
                                  allCoverPosition.upperTick
                                )
                              )}
                              latestTick={allCoverPosition.latestTick}
                              tickSpacing={allCoverPosition.tickSpacing}
                              feeTier={allCoverPosition.feeTier}
                              prefill={undefined}
                              close={undefined}
                              href={"/pool/view/cover"}
                            />
                          );
                        }
                      })
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="pb-20">
              <h1 className="mb-3 ">All Pools</h1>
              <div className="space-y-2">
                <table className="w-full table-auto">
                  <thead className="mb-3">
                    <tr className="text-xs text-grey">
                      <th className="text-left font-light">Name</th>
                      <th className="text-right font-light">TVL</th>
                      <th className="text-right font-light md:block hidden">Volume(USD)</th>
                      <th className="text-right font-light">Volume(ETH)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.id === 1
                      ? allRangePools.map((allRangePool) => {
                          if (
                            allRangePool.tokenZero.name.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allRangePool.tokenOne.name.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allRangePool.tokenZero.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allRangePool.tokenOne.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allRangePool.tokenZero.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allRangePool.tokenOne.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            searchTerm === ""
                          )
                            return (
                              <PoolList
                                account={address}
                                key={allRangePool.poolId}
                                poolId={allRangePool.poolId}
                                tokenZero={allRangePool.tokenZero}
                                tokenOne={allRangePool.tokenOne}
                                liquidity={allRangePool.liquidity}
                                auctionLenght={undefined}
                                feeTier={allRangePool.feeTier}
                                tickSpacing={allRangePool.tickSpacing}
                                tvlUsd={allRangePool.tvlUsd}
                                volumeUsd={allRangePool.volumeUsd}
                                volumeEth={allRangePool.volumeEth}
                                href="/pool/concentrated"
                              />
                            );
                        })
                      : allCoverPools.map((allCoverPool) => {
                          if (
                            allCoverPool.tokenZero.name.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPool.tokenOne.name.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPool.tokenZero.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPool.tokenOne.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPool.tokenZero.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPool.tokenOne.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            searchTerm === ""
                          )
                            return (
                              <PoolList
                                account={address}
                                key={allCoverPool.poolId}
                                poolId={allCoverPool.poolId}
                                tokenZero={allCoverPool.tokenZero}
                                tokenOne={allCoverPool.tokenOne}
                                liquidity={allCoverPool.liquidity}
                                auctionLenght={allCoverPool.auctionLenght}
                                feeTier={allCoverPool.feeTier}
                                tickSpacing={allCoverPool.tickSpacing}
                                tvlUsd={allCoverPool.tvlUsd}
                                volumeUsd={allCoverPool.volumeUsd}
                                volumeEth={allCoverPool.volumeEth}
                                href="/cover"
                              />
                            );
                        })}
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
