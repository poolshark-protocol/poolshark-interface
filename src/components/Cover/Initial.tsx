import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import CoverExistingPool from './CoverExistingPool'
import CreateCover from './CreateCover'
import PoolsModal from './PoolsModal'
import { useAccount } from 'wagmi'
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton'

export default function Initial(props: any) {
  const { address, isConnected, isDisconnected } = useAccount()

  const [isOpen, setIsOpen] = useState(false)
  const [pool, setPool] = useState(props.query ?? undefined)
  const [shifted, setIsShifted] = useState('initial')

  useEffect(() => {
    if (props.query.state === 'nav') {
      setIsShifted('initial')
    }
  }, [props.query])

  function setParams(query: any) {
    setIsShifted('coverExistingPool')
    const feeTierPercentage = query.feeTier / 10000
  }
  
  return isDisconnected ? (
    <>
      <h1 className="mb-3">Connect your wallet to Cover Pool</h1>
      <ConnectWalletButton xl={true} />
      <div className="opacity-50 cursor-not-allowed">
        <h1 className="mb-3 mt-6 md:text-base text-sm">Set Price Range</h1>
        <div className="flex justify-between w-full gap-x-6">
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
            <span className="md:text-xs text-[10px] text-grey">Min. Price</span>
            <div className="flex justify-center items-center">
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </div>
              <input
                autoComplete="off"
                className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                placeholder="0"
                disabled
              />
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white ">
                <PlusIcon className="w-5 h-5" />
              </div>
            </div>
            <span className="md:text-xs text-[10px] text-grey">USDC per DAI</span>
          </div>
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
            <span className="md:text-xs text-[10px] text-grey">Max. Price</span>
            <div className="flex justify-center items-center">
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </div>
              <input
                autoComplete="off"
                className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                placeholder="0"
                disabled
              />
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                <PlusIcon className="w-5 h-5" />
              </div>
            </div>
            <span className="md:text-xs text-[10px] text-grey">USDC per DAI</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full py-4 mx-auto font-medium text-center transition rounded-xl  bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
            Create Cover
          </div>
        </div>
      </div>
    </>
  ) : shifted === 'initial' ? (
    <>
      <h1 className="mb-3 md:text-base text-sm">How much do you want to Cover?</h1>
      <div className="space-y-2">
        <div
          onClick={() => setIsOpen(true)}
          className="w-full text-sm md:text-base py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
        >
          Select Pool to Cover
        </div>
        <div
          className="w-full text-sm md:text-base py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer border border-[#3174E0] from-[#344DBF] to-[#3098FF] hover:opacity-80"
          onClick={() => setIsShifted('createCover')}
        >
          Create my own Cover
        </div>
      </div>
      <div className="opacity-50 cursor-not-allowed">
        <h1 className="mb-3 mt-6 md:text-base text-sm">Set Price Range</h1>
        <div className="flex justify-between w-full gap-x-6">
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
            <span className="md:text-xs text-[10px] text-grey">Min. Price</span>
            <div className="flex justify-center items-center">
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </div>
              <input
                autoComplete="off"
                className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                placeholder="0"
                disabled
              />
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white ">
                <PlusIcon className="w-5 h-5" />
              </div>
            </div>
            <span className="md:text-xs text-[10px] text-grey">USDC per DAI</span>
          </div>
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
            <span className="md:text-xs text-[10px] text-grey">Max. Price</span>
            <div className="flex justify-center items-center">
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </div>
              <input
                autoComplete="off"
                className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                placeholder="0"
                disabled
              />
              <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white">
                <PlusIcon className="w-5 h-5" />
              </div>
            </div>
            <span className="md:text-xs text-[10px] text-grey">USDC per DAI</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full text-sm md:text-base py-4 mx-auto font-medium text-center transition rounded-xl  bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
            Create Cover
          </div>
        </div>
      </div>
      <PoolsModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        prefill={setIsShifted}
        setParams={setParams}
      />
    </>
  ) : shifted === 'createCover' ? (
    <CreateCover goBack={setIsShifted} />
  ) : (
    <CoverExistingPool
      goBack={setIsShifted}
    />
  )
}
