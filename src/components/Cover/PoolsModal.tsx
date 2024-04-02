import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import UserRangePool from "../Range/UserRangePool";
import {
  fetchLimitPositions,
  fetchRangePositions,
  fetchUniV3Positions,
} from "../../utils/queries";
import { useAccount } from "wagmi";
import { BigNumber } from "ethers";
import { mapUserRangePositions } from "../../utils/maps";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useShallow } from "zustand/react/shallow";

export default function PoolsModal({ isOpen, setIsOpen, prefill, setParams }) {
  const { address } = useAccount();

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const [limitSubgraph, coverSubgraph, listedTokenList] = useConfigStore(
    useShallow((state) => [
      state.limitSubgraph,
      state.coverSubgraph,
      state.listedtokenList,
    ]),
  );

  const [limitPositions, setLimitPositions] = useState([]);
  const [allRangePositions, setAllRangePositions] = useState([]);

  useEffect(() => {
    if (address != undefined) getUserLimitPositionData();
  }, [address]);

  async function getUserLimitPositionData() {
    //this should be range positions
    const data = await fetchRangePositions(limitSubgraph, address);
    if (data["data"]) {
      const positions = data["data"].rangePositions;
      setAllRangePositions(mapUserRangePositions(positions));
    }
  }

  /* function mapUserLimitPositions() {
    const mappedLimitPositions = [];
    limitPositions.map((limitPosition) => {
      const limitPositionData = {
        id: limitPosition.id,
        poolId: limitPosition.token.position.pool.id,
        tokenZero: limitPosition.token.position.pool.token0,
        valueTokenZero: limitPosition.token.position.pool.token0.usdPrice,
        tokenOne: limitPosition.token.position.pool.token1,
        valueTokenOne: limitPosition.token.position.pool.token1.usdPrice,
        min: limitPosition.token.position.lower,
        max: limitPosition.token.position.upper,
        price: limitPosition.token.position.pool.price,
        tickSpacing: limitPosition.token.position.pool.feeTier.tickSpacing,
        feeTier: limitPosition.token.position.pool.feeTier.feeAmount,
        userTokenAmount: limitPosition.amount,
        userLiquidity: Math.round(
          (limitPosition.amount / limitPosition.token.totalSupply) *
            limitPosition.token.position.liquidity
        ),
        tvlUsd: (
          Number(limitPosition.token.position.pool.totalValueLockedUsd) /
          1_000_000
        ).toFixed(2),
        volumeUsd: (
          Number(limitPosition.token.position.pool.volumeUsd) / 1_000_000
        ).toFixed(2),
        volumeEth: (
          Number(limitPosition.token.position.pool.volumeEth) / 1
        ).toFixed(2),
        userOwnerAddress: limitPosition.owner.replace(/"|'/g, ""),
      };
      mappedLimitPositions.push(limitPositionData);
    });
    setAllRangePositions(mappedLimitPositions);
  } */

  //async so needs to be wrapped

  /*const [uniV3Positions, setUniV3Positions] = useState([])
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
      //console.log('uniV3Position', uniV3Position)
      const uniV3PositionData = {
        id: uniV3Position.id,
        poolId: uniV3Position.id,
        tokenZero: uniV3Position.token0,
        valueTokenZero: uniV3Position.depositedToken0,
        tokenOne: uniV3Position.token1,
        valueTokenOne: uniV3Position.depositedToken1,
        poolAddress: uniV3Position.id,
        liquidity: uniV3Position.liquidity,
        latestTick: uniV3Position.tick,
        min: uniV3Position.withdrawnToken0,
        max: uniV3Position.withdrawnToken1,
        userOwnerAddress: uniV3Position.owner.replace(/"|'/g, ''),
      }

      mappedUniV3Positions.push(uniV3PositionData)
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

  useEffect(() => {
    getUserUniV3PositionData()
  }, [])

  useEffect(() => {
    mapUserUniV3Positions()
  }, [uniV3Positions])

  useEffect(() => {
    checkUserUniV3PositionExists()
  }, [])*/

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
              <Dialog.Panel className="w-full max-w-5xl h-[45rem] transform overflow-y-auto rounded-[4px] bg-black text-white border border-grey text-left align-middle shadow-xl px-6 py-5 transition-all">
                <div className="flex justify-between items-center mb-5">
                  <h1 className="">Select a Pool to Cover</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="w-4 text-grey1 absolute ml-[14px] mt-[10px]" />
                  <input
                    autoComplete="off"
                    className="border border-grey bg-dark rounded-[4px] py-2.5 w-full placeholder:text-grey outline-none pl-12 text-xs uppercase placeholder:text-grey1"
                    placeholder="Search name, symbol or address"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                  />
                </div>
                <div>
                  <h1 className="mb-3 text-xs uppercase">
                    Poolshark Positions
                  </h1>
                  <div>
                    {allRangePositions.length === 0 ? (
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
                          Your Poolshark pools will appear here
                        </div>
                      </div>
                    ) : (
                      <div className="pb-3 lg:pb-0">
                        <div className="w-auto space-y-2">
                          {allRangePositions.map((allRangePosition) => {
                            if (
                              allRangePosition.tokenZero.name.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allRangePosition.tokenZero.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              allRangePosition.tokenOne.name.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allRangePosition.tokenOne.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              allRangePosition.tokenZero.symbol.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allRangePosition.tokenZero.symbol
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              allRangePosition.tokenOne.symbol.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allRangePosition.tokenOne.symbol
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              allRangePosition.tokenZero.id.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              allRangePosition.tokenOne.id.toLowerCase() ===
                                searchTerm.toLowerCase() ||
                              listedTokenList.find(
                                (element) =>
                                  element.address.toLowerCase() ===
                                  searchTerm.toLowerCase(),
                              ) != undefined ||
                              searchTerm === ""
                            ) {
                              return (
                                <div
                                  onClick={() => {
                                    setIsOpen(false);
                                    //prefill('exisingPool')
                                    setParams(allRangePosition);
                                  }}
                                  key={allRangePosition.id}
                                >
                                  <UserRangePool
                                    key={allRangePosition.id}
                                    rangePosition={allRangePosition}
                                    href={"/cover/create"}
                                    isModal={true}
                                  />
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/*<div>
                  <h1 className="mb-3 mt-4">UNI-V3 Positions</h1>
                  <div className="space-y-2">
                    {allUniV3Positions.length === 0 ? (
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
                          Your UNI-V3 pools will appear here
                        </div>
                      </div>
                    ) : (
                      <>
                        {allUniV3Positions.map((allUniV3Position) => {
                          if (
                            allUniV3Position.userOwnerAddress ===
                              address?.toLowerCase() &&
                            (allUniV3Position.tokenZero.name === searchTerm ||
                              allUniV3Position.tokenOne.name === searchTerm ||
                              allUniV3Position.tokenZero.symbol ===
                                searchTerm ||
                              allUniV3Position.tokenOne.symbol === searchTerm ||
                              allUniV3Position.tokenZero.id === searchTerm ||
                              allUniV3Position.tokenOne.id === searchTerm ||
                              searchTerm === '')
                          ) {
                            return (
                              <div
                                onClick={() => {
                                  setIsOpen(false)
                                  //prefill('exisingPool')
                                  setParams(allUniV3Position)
                                }}
                                key={allUniV3Position.id + 'click'}
                              >
                                <UserCoverPool
                                  key={allUniV3Position.id}
                                  account={address}
                                  poolId={allUniV3Position.poolId}
                                  tokenZero={allUniV3Position.tokenZero}
                                  valueTokenZero={
                                    allUniV3Position.valueTokenZero
                                  }
                                  tokenOne={allUniV3Position.tokenOne}
                                  valueTokenOne={allUniV3Position.valueTokenOne}
                                  min={allUniV3Position.min}
                                  max={allUniV3Position.max}
                                  zeroForOne={true}
                                  userFillIn={0}
                                  userFillOut={0}
                                  liquidity={allUniV3Position.liquidity}
                                  feeTier={allUniV3Position.feeTier}
                                  latestTick={allUniV3Position.tick}
                                  //TODO get univ3 spacings
                                  tickSpacing={20}
                                  epochLast={0}
                                  prefill={undefined}
                                  close={undefined}
                                  href={'/cover'}
                                />
                              </div>
                            )
                          }
                        })}
                      </>
                    )}
                  </div>
                </div>*/}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
