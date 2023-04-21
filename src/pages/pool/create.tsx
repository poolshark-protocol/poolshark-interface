import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Listbox, Transition } from '@headlessui/react'
import ConcentratedPool from '../../components/Pools/ConcentratedPool'
import { useRouter } from 'next/router'
import DirectionalPool from '../../components/Pools/DirectionalPool'

export default function CreatePool() {
  const poolTypes = [
    { id: 1, type: 'Range Pools', unavailable: false },
    { id: 2, type: 'Cover Pools', unavailable: false },
  ]
  const router = useRouter()
  const poolAddress =
    router.query.poolId === undefined ? '' : router.query.poolId.toString()

  const [poolDisplay, setPoolDisplay] = useState(
    poolAddress.substring(0, 6) +
      '...' +
      poolAddress.substring(poolAddress.length - 4, poolAddress.length),
  )
  const [isPoolCopied, setIsPoolCopied] = useState(false)
  const [selected, setSelected] = useState(poolTypes[0])

  useEffect(() => {
    if (copyPoolAddress) {
      const timer = setTimeout(() => {
        setIsPoolCopied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  })

  function copyPoolAddress() {
    navigator.clipboard.writeText(
      router.query.poolId === undefined ? '' : router.query.poolId.toString(),
    )
    setIsPoolCopied(true)
  }

  function SelectPool() {
    return (
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
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
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[55rem]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-x-6">
              <h1 className="text-3xl">
                Create {selected.id == 2 ? <>Cover</> : <>Range</>} Pool
              </h1>
              <SelectPool />
            </div>
            <Link href="/pool">
              <span className="bg-black border border-grey2 rounded-lg text-white px-7 py-[9px] cursor-pointer hover:opacity-80">
                Cancel
              </span>
            </Link>
          </div>
          <div className="mb-6">
            <div className="flex justify-end text-[#646464]">
              <h1
                onClick={() => copyPoolAddress()}
                className="text-xs cursor-pointer flex items-center"
              >
                Pool:
                {isPoolCopied ? (
                  <span className="ml-1">Copied</span>
                ) : (
                  <span className="ml-1">{poolDisplay}</span>
                )}
              </h1>
            </div>
          </div>
          {selected.id == 2 ? (
            <DirectionalPool
              key={undefined}
              account={undefined}
              poolId={undefined}
              tokenOneName={undefined}
              tokenOneSymbol={undefined}
              tokenOneLogoURI={undefined}
              tokenOneAddress={undefined}
              tokenZeroName={undefined}
              tokenZeroSymbol={undefined}
              tokenZeroLogoURI={undefined}
              tokenZeroAddress={undefined}
            />
          ) : (
            <ConcentratedPool
              key={undefined}
              account={undefined}
              poolId={undefined}
              tokenOneName={undefined}
              tokenOneSymbol={undefined}
              tokenOneLogoURI={undefined}
              tokenOneAddress={undefined}
              tokenZeroName={undefined}
              tokenZeroSymbol={undefined}
              tokenZeroLogoURI={undefined}
              tokenZeroAddress={undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}
