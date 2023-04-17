import Navbar from '../../components/Navbar'
import {
  PlusSmallIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
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

export default function Pool() {
  const poolTypes = [
    { id: 1, type: 'Range Pools', unavailable: false },
    { id: 2, type: 'Cover Pools', unavailable: false },
  ]

  const { address, isConnected, isDisconnected } = useAccount()

  const [rangePools, setRangePools] = useState([])
  const [allRangePools, setAllRangePools] = useState([])
  const [selected, setSelected] = useState(poolTypes[0])
  const [searchTerm, setSearchTerm] = useState('')

  async function getRangePoolData() {
    const data = await fetchRangePools()
    //console.log('rangepool from graphql data', data)
    const pools = data['data'].rangePools
    setRangePools(pools)
  }

  function mapRangePools() {
    const mappedRangePools = []

    rangePools.map((rangePool) => {
      const rangePoolData = {
        poolId: rangePool.id,
        tokenOne: rangePool.token1,
        tokenZero: rangePool.token0,
        tvlUsd: rangePool.totalValueLockedUsd,
        volumeUsd: rangePool.volumeUsd,
        volumeEth: rangePool.volumeEth,
      }
      mappedRangePools.push(rangePoolData)
      console.log('mappedRangePools', mappedRangePools)
    })
    setAllRangePools(mappedRangePools)
  }

  //async so needs to be wrapped
  useEffect(() => {
    getRangePoolData()
  }, [])

  useEffect(() => {
    mapRangePools()
  }, [rangePools])

  const [coverPools, setCoverPools] = useState([])
  const [allCoverPools, setAllCoverPools] = useState([])

  async function getCoverPoolData() {
    const data = await fetchCoverPools()
    const pools = data['data'].coverPools
    setCoverPools(pools)
  }

  function mapCoverPools() {
    const mappedCoverPools = []
    coverPools.map((coverPool) => {
      const coverPoolData = {
        poolId: coverPool.id,
        tokenOne: coverPool.token1,
        tokenZero: coverPool.token0,
        tvlUsd: coverPool.totalValueLockedUsd,
        volumeUsd: coverPool.volumeUsd,
        volumeEth: coverPool.volumeEth,
      }
      mappedCoverPools.push(coverPoolData)
      console.log('mappedCoverPools', mappedCoverPools)
    })

    setAllCoverPools(mappedCoverPools)
  }

  //async so needs to be wrapped
  useEffect(() => {
    getCoverPoolData()
  }, [])

  useEffect(() => {
    mapCoverPools()
  }, [coverPools])

  const [rangePositions, setRangePositions] = useState([])
  const [allRangePositions, setAllRangePositions] = useState([])

  async function getUserRangePositionData() {
    const data = await fetchRangePositions(address)
    const positions = data['data'].positions
    setRangePositions(positions)
  }

  function mapUserRangePositions() {
    const mappedRangePositions = []
    rangePositions.map((rangePosition) => {
      const rangePositionData = {
        poolId: rangePosition.pool.id,
        tokenOne: rangePosition.pool.token1,
        tokenZero: rangePosition.pool.token0,
        tvlUsd: rangePosition.pool.totalValueLockedUsd,
        volumeUsd: rangePosition.pool.volumeUsd,
        volumeEth: rangePosition.pool.volumeEth,
        userOwnerAddress: rangePosition.owner.replace(/"|'/g, ''),
      }
      mappedRangePositions.push(rangePositionData)
      console.log('mappedRangePositions', mappedRangePositions)
    })
    setAllRangePositions(mappedRangePositions)
  }

  //async so needs to be wrapped
  useEffect(() => {
    getUserRangePositionData()
  }, [])

  useEffect(() => {
    mapUserRangePositions()
  }, [rangePositions])

  const [coverPositions, setCoverPositions] = useState([])
  const [allCoverPositions, setAllCoverPositions] = useState([])

  async function getUserCoverPositionData() {
    const data = await fetchCoverPositions(address)
    const positions = data['data'].positions
    setCoverPositions(positions)
  }

  function mapUserCoverPositions() {
    const mappedCoverPositions = []
    coverPositions.map((coverPosition) => {
      const coverPositionData = {
        poolId: coverPosition.pool.id,
        tokenOne: coverPosition.pool.token1,
        tokenZero: coverPosition.pool.token0,
        tvlUsd: coverPosition.pool.totalValueLockedUsd,
        volumeUsd: coverPosition.pool.volumeUsd,
        volumeEth: coverPosition.pool.volumeEth,
        userOwnerAddress: coverPosition.owner.replace(/"|'/g, ''),
      }
      mappedCoverPositions.push(coverPositionData)
      console.log('mappedCoverPositions', mappedCoverPositions)
    })
    setAllCoverPositions(mappedCoverPositions)
  }

  //async so needs to be wrapped
  useEffect(() => {
    getUserCoverPositionData()
  }, [])

  useEffect(() => {
    mapUserCoverPositions()
  }, [coverPositions])

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value)
  }

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
      <div className="flex justify-center w-full text-white relative min-h-[calc(100vh-76px)] w-full">
        <div className="w-[55rem] absolute bottom-0">
          <div className="flex justify-between mb-6 items-end">
            <div className="flex items-center gap-x-4">
              <h1 className="text-3xl">Pools</h1>
              <div className="cursor-pointer">
                <SelectPool />
              </div>
            </div>
            <Link
              href={{
                pathname:
                  selected.id === 1
                    ? '/pool/concentrated'
                    : '/pool/directional',
                query: {
                  account: 'account',
                  poolId: 'poolId',
                  tokenOneName: '',
                  tokenOneSymbol: '',
                  tokenOneLogoURI: '',
                  tokenOneAddress: '',
                  tokenZeroName: '',
                  tokenZeroSymbol: '',
                  tokenZeroLogoURI: '',
                  tokenZeroAddress: '',
                },
              }}
            >
              <button className="flex items-center gap-x-1.5 px-7 py-[9px] text-white text-sm transition whitespace-nowrap rounded-lg cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
                <PlusSmallIcon className="w-6" />
                Create Pool
              </button>
            </Link>
          </div>
          <div className="bg-black  border border-grey2 w-full rounded-t-xl p-6 space-y-4 h-[70vh] overflow-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 text-grey absolute ml-[14px] mt-[13px]" />
              <input
                className="border border-grey2 bg-dark rounded-xl py-2.5 w-full placeholder:text-grey outline-none pl-12"
                placeholder="Search name, symbol or address"
                value={searchTerm}
                onChange={handleSearchTermChange}
              />
            </div>
            <div className="">
              <h1 className="mb-3">My Positions</h1>
              <div className="space-y-2">
                {selected.id === 1
                  ? allRangePositions.map((allRangePosition) => {
                      if (
                        allRangePosition.userOwnerAddress ===
                          address?.toLowerCase() &&
                        (allRangePosition.tokenZero.name === searchTerm ||
                          allRangePosition.tokenOne.name === searchTerm ||
                          allRangePosition.tokenZero.symbol === searchTerm ||
                          allRangePosition.tokenOne.symbol === searchTerm ||
                          allRangePosition.tokenZero.id === searchTerm ||
                          allRangePosition.tokenOne.id === searchTerm ||
                          searchTerm === '')
                      ) {
                        return (
                          <UserPool
                            poolId={allRangePosition.poolId}
                            account={'account'}
                            key={allRangePosition.tokenOneName}
                            tokenZero={allRangePosition.tokenZero}
                            tokenOne={allRangePosition.tokenOne}
                            tvlUsd={allRangePosition.tvlUsd}
                            volumeUsd={allRangePosition.volumeUsd}
                            volumeEth={allRangePosition.volumeEth}
                          />
                        )
                      }
                    })
                  : allCoverPositions.map((allCoverPosition) => {
                      if (
                        allCoverPosition.userOwnerAddress ===
                          address?.toLowerCase() &&
                        (allCoverPosition.tokenZero.name === searchTerm ||
                          allCoverPosition.tokenOne.name === searchTerm ||
                          allCoverPosition.tokenZero.symbol === searchTerm ||
                          allCoverPosition.tokenOne.symbol === searchTerm ||
                          allCoverPosition.tokenZero.id === searchTerm ||
                          allCoverPosition.tokenOne.id === searchTerm ||
                          searchTerm === '')
                      ) {
                        return (
                          <UserCoverPool
                            account={'account'}
                            poolId={allCoverPosition.poolAddress}
                            key={allCoverPosition.tokenOneName}
                            tokenZero={allCoverPosition.tokenZero}
                            tokenOne={allCoverPosition.tokenOne}
                            prefill={undefined}
                            close={undefined}
                            href={'/pool/view/cover'}
                          />
                        )
                      }
                    })}
              </div>
            </div>
            <div className="">
              <h1 className="mb-3 ">All Pools</h1>
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
                    {selected.id === 1
                      ? allRangePools.map((allRangePool) => {
                          if (
                            allRangePool.tokenZero.name === searchTerm ||
                            allRangePool.tokenOne.name === searchTerm ||
                            allRangePool.tokenZero.symbol === searchTerm ||
                            allRangePool.tokenOne.symbol === searchTerm ||
                            allRangePool.tokenZero.id === searchTerm ||
                            allRangePool.tokenOne.id === searchTerm ||
                            searchTerm === ''
                          )
                            return (
                              <PoolList
                                account={'account'}
                                key={allRangePool.tokenOneName}
                                poolId={allRangePool.poolId}
                                tokenZero={allRangePool.tokenZero}
                                tokenOne={allRangePool.tokenOne}
                                tvlUsd={allRangePool.tvlUsd}
                                volumeUsd={allRangePool.volumeUsd}
                                volumeEth={allRangePool.volumeEth}
                                href="/pool/concentrated"
                              />
                            )
                        })
                      : allCoverPools.map((allCoverPool) => {
                          if (
                            allCoverPool.tokenZero.name === searchTerm ||
                            allCoverPool.tokenOne.name === searchTerm ||
                            allCoverPool.tokenZero.symbol === searchTerm ||
                            allCoverPool.tokenOne.symbol === searchTerm ||
                            allCoverPool.tokenZero.id === searchTerm ||
                            allCoverPool.tokenOne.id === searchTerm ||
                            searchTerm === ''
                          )
                            return (
                              <PoolList
                                account={'account'}
                                key={allCoverPool.tokenOneName}
                                poolId={allCoverPool.poolId}
                                tokenZero={allCoverPool.tokenZero}
                                tokenOne={allCoverPool.tokenOne}
                                tvlUsd={allCoverPool.tvlUsd}
                                volumeUsd={allCoverPool.volumeUsd}
                                volumeEth={allCoverPool.volumeEth}
                                href="/pool/directional"
                              />
                            )
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
