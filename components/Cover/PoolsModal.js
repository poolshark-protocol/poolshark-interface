import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import {
  MagnifyingGlassIcon, XMarkIcon,
} from "@heroicons/react/20/solid";
import UserCoverPool from "../Pools/UserCoverPool";
import StaticUniPool from "../Pools/StaticUniPool";
import { fetchPools } from "../../utils/queries";
import { useAccount } from "wagmi";

export default function PoolsModal({ isOpen, setIsOpen, pool, prefill }) {

  const { address } = useAccount();

  const [coverPools, setCoverPools] = useState([]);
  const [allCoverPools, setAllCoverPools] = useState([]);

  async function getPoolData() {
    const data = await fetchPools();
    const pools = data.data.coverPools;

    setCoverPools(pools);
  }

  function mapCoverPools() {
    const mappedCoverPools = [];
    
    coverPools.map((coverPool) => {
      const coverPoolData = {
        tokenOneName: coverPool.token1.name,
        tokenZeroName: coverPool.token0.name,
        tokenOneAddress: coverPool.token1.id,
        tokenZeroAddress: coverPool.token0.id,
        poolAddress: coverPool.id,
      };

      mappedCoverPools.push(coverPoolData);
    });

    setAllCoverPools(mappedCoverPools);
  }

  //async so needs to be wrapped
  useEffect(() => {
    getPoolData();
  }, []);

  // useEffect(() => {
  //  pool(coverParams);
  // },[coverParams])

  useEffect(() => {
    mapCoverPools();
  }, [coverPools]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
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
              <Dialog.Panel className="w-full max-w-3xl h-[45rem] transform overflow-hidden rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl px-6 py-5 transition-all">
                  <div className="flex justify-between items-center mb-5">
                      <h1 className="text-xl">Select a Pool to Cover</h1>
                      <XMarkIcon onClick={() => setIsOpen(false)} className="w-7 cursor-pointer"/>
                  </div>
                                <div className="relative mb-4">
                <MagnifyingGlassIcon className="w-5 text-grey absolute ml-[14px] mt-[13px]" />
                <input
                  className="border border-grey2 bg-dark rounded-xl py-2.5 w-full placeholder:text-grey outline-none pl-12"
                  placeholder="Search name, symbol or address"
                />
              </div>
              <div>
                <h1 className="mb-3">Poolshark Pools</h1>
                <div className="space-y-2">
                {allCoverPools.map((allCoverPool) => {
                    return (
                      <UserCoverPool
                        key={allCoverPool.tokenOneName}
                        tokenOneName={allCoverPool.tokenOneName}
                        tokenZeroName={allCoverPool.tokenZeroName}
                        tokenOneAddress={allCoverPool.tokenOneAddress}
                        tokenZeroAddress={allCoverPool.tokenZeroAddress}
                        poolAddress={allCoverPool.poolAddress}
                      />
                    );
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
