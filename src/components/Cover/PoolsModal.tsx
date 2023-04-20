import { Transition, Dialog } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid'
import UserCoverPool from '../Pools/UserCoverPool'
import { fetchRangePositions, fetchUniV3Positions } from '../../utils/queries'
import { useAccount } from 'wagmi'
import UserPool from '../Pools/UserPool'

export default function PoolsModal({ isOpen, setIsOpen, prefill }) {
  const { address } = useAccount()

  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value)
  }

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
      //console.log('rangePosition', rangePosition)
      const rangePositionData = {
        poolId: rangePosition.id,
        tokenOne: rangePosition.pool.token1,
        tokenZero: rangePosition.pool.token0,
        tvlUsd: rangePosition.pool.totalValueLockedUsd,
        volumeUsd: rangePosition.pool.volumeUsd,
        volumeEth: rangePosition.pool.volumeEth,
        userOwnerAddress: rangePosition.owner.replace(/"|'/g, ''),
      }
      mappedRangePositions.push(rangePositionData)
      //console.log('mappedRangePositions', mappedRangePositions)
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

  const [uniV3Positions, setUniV3Positions] = useState([])
  const [allUniV3Positions, setAllUniV3Positions] = useState([])
  const [userUniV3PositionExists, setUserUniV3PositionExists] = useState(false)

  async function getUserUniV3PositionData() {
    const data = await fetchUniV3Positions(address)
    const positions = data['data'].positions

    setUniV3Positions(positions)
  }

  function mapUserUniV3Positions() {
    const mappedUniV3Positions = []
    uniV3Positions.map((uniV3Position) => {
      const uniV3PositionData = {
        tokenOne: uniV3Position.token1,
        tokenZero: uniV3Position.token0,
        poolAddress: uniV3Position.id,
        userOwnerAddress: uniV3Position.owner.replace(/"|'/g, ''),
      }

      mappedUniV3Positions.push(uniV3PositionData)
      console.log('mappedUniV3Positions_COVERPAGE: ', mappedUniV3Positions)
    })

    setAllUniV3Positions(mappedUniV3Positions)
  }

  function checkUserUniV3PositionExists() {
    allUniV3Positions.map((allUniV3Position) => {
      if (allUniV3Position.userOwnerAddress === address?.toLowerCase()) {
        setUserUniV3PositionExists(true)
      }
    })
  }

  //async so needs to be wrapped
  useEffect(() => {
    getUserUniV3PositionData()
  }, [])

  useEffect(() => {
    mapUserUniV3Positions()
  }, [uniV3Positions])

  useEffect(() => {
    checkUserUniV3PositionExists()
  }, [])

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
                  <h1 className="mb-3">Poolshark Positions</h1>
                  <div className="space-y-2">
                    {allRangePositions.map((allRangePosition) => {
                      if (
                          /* allRangePosition.userOwnerAddress ===
                            address?.toLowerCase() */true &&
                        (allRangePosition.tokenZero.name === searchTerm ||
                          allRangePosition.tokenOne.name === searchTerm ||
                          allRangePosition.tokenZero.symbol === searchTerm ||
                          allRangePosition.tokenOne.symbol === searchTerm ||
                          allRangePosition.tokenZero.id === searchTerm ||
                          allRangePosition.tokenOne.id === searchTerm ||
                          searchTerm === '')
                      ) {
                        return (
                          <div
                            onClick={() => {
                              setIsOpen(false)
                              prefill('exisingPool')
                            }}
                          >
                            <UserPool
                              poolId={allRangePosition.poolId}
                              account={address}
                              key={allRangePosition.tokenOneName}
                              tokenZero={allRangePosition.tokenZero}
                              tokenOne={allRangePosition.tokenOne}
                              tvlUsd={allRangePosition.tvlUsd}
                              volumeUsd={allRangePosition.volumeUsd}
                              volumeEth={allRangePosition.volumeEth}
                              href={'/cover'}
                            />
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
                <div>
                  <h1 className="mb-3 mt-4">UNI-V3 Positions</h1>
                  <div className="space-y-2">
                    {allUniV3Positions.map((allUniV3Position) => {
                      if (
                        allUniV3Position.userOwnerAddress ===
                          address?.toLowerCase() &&
                        (allUniV3Position.tokenZero.name === searchTerm ||
                          allUniV3Position.tokenOne.name === searchTerm ||
                          allUniV3Position.tokenZero.symbol === searchTerm ||
                          allUniV3Position.tokenOne.symbol === searchTerm ||
                          allUniV3Position.tokenZero.id === searchTerm ||
                          allUniV3Position.tokenOne.id === searchTerm ||
                          searchTerm === '')
                      ) {
                        return (
                          <UserCoverPool
                            account={'account'}
                            key={allUniV3Position.poolId}
                            tokenOne={allUniV3Position.tokenOne}
                            tokenZero={allUniV3Position.tokenZero}
                            poolId={allUniV3Position.poolAddress}
                            prefill={undefined}
                            close={undefined}
                            href={'/pool/view/cover'}
                          />
                        )
                      }
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
