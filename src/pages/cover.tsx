import Navbar from '../components/Navbar'
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid'
import UserCoverPool from '../components/Pools/UserCoverPool'
import { useState, useEffect } from 'react'
import { useAccount, useProvider } from 'wagmi'
import Link from 'next/link'
import { fetchCoverPositions } from '../utils/queries'
import React from 'react'
import useTokenList from '../hooks/useTokenList'
import Initial from '../components/Cover/Initial'
import CreateCover from '../components/Cover/CreateCover'
import { useRouter } from 'next/router'

export default function Cover() {
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const {
    network: { chainId },
  } = useProvider()

  const { address, isDisconnected } = useAccount()

  const [expanded, setExpanded] = useState()
  const [selectedPool, setSelectedPool] = useState(router.query ?? undefined)

  const [coverPositions, setCoverPositions] = useState([])
  const [allCoverPositions, setAllCoverPositions] = useState([])
  const [userPositionExists, setUserPositionExists] = useState(false)

  const coins = useTokenList()[0]
  const [coinsForListing, setCoinsForListing] = useState(coins['listed_tokens'])

  useEffect(() => {
    console.log(coinsForListing)
  }, [coinsForListing])

  async function getUserPositionData() {
    try {
      const data = await fetchCoverPositions(address)
      const positions = data['data'].positions
      setCoverPositions(positions)
    } catch (error) {
      console.log(error)
    }
  }

  function mapUserCoverPositions() {
    const mappedCoverPositions = []
    coverPositions.map((coverPosition) => {
      const coverPositionData = {
        id: coverPosition.id,
        poolId: coverPosition.pool.id,
        latestTick: coverPosition.pool.latestTick,
        tokenZero: coverPosition.inToken,
        valueTokenZero: coverPosition.inAmount,
        tokenOne: coverPosition.outToken,
        valueTokenOne: coverPosition.outAmount,
        min: coverPosition.lower,
        max: coverPosition.upper,
        userFillIn: coverPosition.amountInDeltaMax,
        userFillOut: coverPosition.amountOutDeltaMax,
        liquidity: coverPosition.pool.liquidity,
        feeTier: coverPosition.pool.volatilityTier.feeAmount,
        userOwnerAddress: coverPosition.owner.replace(/"|'/g, ''),
      }
      mappedCoverPositions.push(coverPositionData)
    })

    setAllCoverPositions(mappedCoverPositions)
  }

  function checkUserPositionExists() {
    allCoverPositions.map((allCoverPosition) => {
      if (allCoverPosition.userOwnerAddress === address?.toLowerCase()) {
        setUserPositionExists(true)
      }
    })
  }

  useEffect(() => {
    getUserPositionData()
  }, [])

  useEffect(() => {
    mapUserCoverPositions()
  }, [coverPositions])

  useEffect(() => {
    checkUserPositionExists()
  }, [])

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
      )
    }
  }
  const [state, setState] = useState(router.query.state ?? 'initial')

  const handleDiselectPool = (state) => {
    setState(state)
    setSelectedPool(undefined)
  }

  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white relative min-h-[calc(100vh-76px)] w-full">
        <div className="w-[70rem] absolute bottom-0">
          <div className="flex justify-between mb-6 items-end">
            <h1 className="text-3xl">Cover</h1>
            <span className="bg-black flex items-center gap-x-2 border border-grey2 rounded-lg text-white px-6 py-[9px] cursor-pointer hover:opacity-80">
              <InformationCircleIcon className="w-4 text-grey1" />
              <Link href="https://docs.poolsharks.io/overview/cover-pools/">
                <a target="_blank">How it works?</a>
              </Link>
            </span>
          </div>
          <div className="flex space-x-8">
            <div className="bg-black w-2/3 border border-grey2 w-full rounded-t-xl p-6 gap-y-4">
              {selectedPool != undefined && state != 'initial' ? (
                <CreateCover query={router.query} goBack={handleDiselectPool} />
              ) : (
                <Initial query={router.query} />
              )}
            </div>
            {isDisconnected ? (
              <div className="bg-black w-full border border-grey2 w-full rounded-t-xl p-6 space-y-4 overflow-auto h-[44rem]">
                <h1 className="mb-3">Cover Positions</h1>
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
                    Your cover pools will appear here
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black w-full border border-grey2 w-full rounded-t-xl p-6 space-y-4 overflow-auto h-[44rem]">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 text-grey absolute ml-[14px] mt-[13px]" />
                  <input
                    className="border border-grey2 bg-dark rounded-xl py-2.5 w-full placeholder:text-grey outline-none pl-12"
                    placeholder="Search name, symbol or address"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                  />
                </div>
                <div>
                  <h1 className="mb-3">Cover Positions</h1>
                  <div className="space-y-2">
                    {allCoverPositions.length === 0 ? (
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
                        Your cover pools will appear here
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {allCoverPositions.map((allCoverPosition) => {
                          if (
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
                              searchTerm === '')
                          ) {
                            //console.log('user fill out', allCoverPosition.userFillOut)
                            return (
                              <UserCoverPool
                                key={allCoverPosition.id}
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
                                feeTier={allCoverPosition.feeTier}
                                liquidity={allCoverPosition.liquidity}
                                latestTick={allCoverPosition.latestTick}
                                epochLast={allCoverPosition.epochLast}
                                prefill={undefined}
                                close={undefined}
                                href={'/pool/view/cover'}
                              />
                            )
                          }
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
