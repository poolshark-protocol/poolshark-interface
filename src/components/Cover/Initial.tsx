import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import CoverExistingPool from './CoverExistingPool'
import CreateCover from './CreateCover'
import PoolsModal from './PoolsModal'
import { useAccount } from 'wagmi'
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton'

export default function Initial() {
  const { address, isConnected, isDisconnected } = useAccount()

  const [isOpen, setIsOpen] = useState(false)
  const [pool, setPool] = useState({})
  const [shifted, setIsShifted] = useState('initial')
  return isDisconnected ? (
    <>
      <h1 className="mb-5">Create a Cover Pool</h1>
      <ConnectWalletButton />
    </>
  ) : shifted === 'initial' ? (
    <>
      <h1 className="mb-3">How much do you want to Cover?</h1>
      <div className="space-y-2">
        <div
          onClick={() => setIsOpen(true)}
          className="w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
        >
          Select Pool to Cover
        </div>
        <div
          className="w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer border border-[#3174E0] from-[#344DBF] to-[#3098FF] hover:opacity-80"
          onClick={() => setIsShifted('createCover')}
        >
          Create my own Cover
        </div>
      </div>
      <div className="opacity-50 cursor-not-allowed">
        <h1 className="mb-3 mt-6">Set Price Range</h1>
        <div className="flex justify-between w-full gap-x-6">
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
            <span className="text-xs text-grey">Min. Price</span>
            <div className="flex justify-center items-center">
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </div>
              <input
                className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                placeholder="0"
                disabled
              />
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white ">
                <PlusIcon className="w-5 h-5" />
              </div>
            </div>
            <span className="text-xs text-grey">USDC per DAI</span>
          </div>
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
            <span className="text-xs text-grey">Max. Price</span>
            <div className="flex justify-center items-center">
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </div>
              <input
                className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                placeholder="0"
                disabled
              />
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                <PlusIcon className="w-5 h-5" />
              </div>
            </div>
            <span className="text-xs text-grey">USDC per DAI</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full py-4 mx-auto font-medium text-center transition rounded-xl  bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
            Create Cover
          </div>
        </div>
      </div>
      <PoolsModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        prefill={setIsShifted}
      />
    </>
  ) : shifted === 'createCover' ? (
    <CreateCover goBack={setIsShifted} />
  ) : (
    <CoverExistingPool goBack={setIsShifted} />
  )
}
