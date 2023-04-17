import { Transition, Dialog } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid'
import UserCoverPool from '../Pools/UserCoverPool'
import { fetchCoverPools, fetchUniV3Pools } from '../../utils/queries'
import { useAccount } from 'wagmi'

export default function PoolsModal({ isOpen, setIsOpen, prefill }) {
  const { address } = useAccount()

  const [coverPools, setCoverPools] = useState([])
  const [allCoverPools, setAllCoverPools] = useState([])

  async function getPoolData() {
    try {
      const data = await fetchCoverPools()
      const pools = data['data'].coverPools

      setCoverPools(pools)
    } catch (error) {
      console.log(error)
    }
  }

  function mapCoverPools() {
    const mappedCoverPools = []

    coverPools.map((coverPool) => {
      const coverPoolData = {
        tokenOne: coverPool.token1,
        tokenZero: coverPool.token0,
        poolAddress: coverPool.id,
      }

      mappedCoverPools.push(coverPoolData)
    })

    setAllCoverPools(mappedCoverPools)
  }

  //async so needs to be wrapped
  useEffect(() => {
    getPoolData()
  }, [])

  // useEffect(() => {
  //  pool(coverParams);
  // },[coverParams])

  useEffect(() => {
    mapCoverPools()
  }, [coverPools])

  const [univ3Pools, setUniv3Pools] = useState([])
  const [allUniv3Pools, setAllUniv3Pools] = useState([])

  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value)
  }

  async function getUniv3PoolData() {
    const data = await fetchUniV3Pools()
    const pools = data['data'].pools

    setUniv3Pools(pools)
  }

  function mapUniv3Pools() {
    const mappedUniV3Pools = []

    univ3Pools.map((univ3Pool) => {
      const coverPoolData = {
        tokenOne: univ3Pool.token1,
        tokenZero: univ3Pool.token0,
        poolAddress: univ3Pool.id,
      }

      mappedUniV3Pools.push(coverPoolData)
    })

    setAllUniv3Pools(mappedUniV3Pools)
  }

  //async so needs to be wrapped
  useEffect(() => {
    getUniv3PoolData()
  }, [])

  // useEffect(() => {
  //  pool(coverParams);
  // },[coverParams])

  useEffect(() => {
    mapUniv3Pools()
  }, [univ3Pools])

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl h-[45rem] transform overflow-y-auto rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl px-6 py-5 transition-all">
                <div className="flex justify-between items-center mb-5">
                  <h1 className="text-xl">Select a Pool to Cover</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="w-5 text-grey absolute ml-[14px] mt-[13px]" />
                  <input
                    className="border border-grey2 bg-dark rounded-xl py-2.5 w-full placeholder:text-grey outline-none pl-12"
                    placeholder="Search name, symbol or address"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                  />
                </div>
                <div>
                  <h1 className="mb-3">Poolshark Pools</h1>
                  <div className="space-y-2">
                    {allCoverPools.map((allCoverPool) => {
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
                          <UserCoverPool
                            account={'account'}
                            key={allCoverPool.poolId}
                            tokenOne={allCoverPool.tokenOne}
                            tokenZero={allCoverPool.tokenZero}
                            poolId={allCoverPool.poolId}
                            prefill={undefined}
                            close={undefined}
                            href={'/pool/view/cover'}
                          />
                        )
                    })}
                  </div>
                </div>
                <div>
                  <h1 className="mb-3 mt-4">UNI-V3 Pools</h1>
                  <div className="space-y-2">
                    {allUniv3Pools.map((allUniv3Pool) => {
                      if (
                        allUniv3Pool.tokenZero.name === searchTerm ||
                        allUniv3Pool.tokenOne.name === searchTerm ||
                        allUniv3Pool.tokenZero.symbol === searchTerm ||
                        allUniv3Pool.tokenOne.symbol === searchTerm ||
                        allUniv3Pool.tokenZero.id === searchTerm ||
                        allUniv3Pool.tokenOne.id === searchTerm ||
                        searchTerm === ''
                      )
                        return (
                          <UserCoverPool
                            account={'account'}
                            key={allUniv3Pool.poolId}
                            tokenOne={allUniv3Pool.tokenOne}
                            tokenZero={allUniv3Pool.tokenZero}
                            poolId={allUniv3Pool.poolId}
                            prefill={undefined}
                            close={undefined}
                            href={'/pool/view'}
                          />
                        )
                    })}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
