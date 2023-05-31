import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import CoverExistingPool from './CoverExistingPool'
import CreateCover from './CreateCover'
import PoolsModal from './PoolsModal'
import { useAccount } from 'wagmi'
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton'
import { ethers } from 'ethers'

export default function Initial(props: any) {
  type token = {
    name: string
    symbol: string
    logoURI: string
    address: string
    value: string
  }
  const { address, isConnected, isDisconnected } = useAccount()

  const [isOpen, setIsOpen] = useState(false)
  const [pool, setPool] = useState(props.query ?? undefined)
  const [shifted, setIsShifted] = useState('initial')

  const logoMap = {
    TOKEN20A: '/static/images/eth_icon.png',
    TOKEN20B: '/static/images/token.png',
    USDC: '/static/images/token.png',
    WETH: '/static/images/eth_icon.png',
    DAI: '/static/images/dai_icon.png',
    UNI: '/static/images/dai_icon.png',
    stkEth: '/static/images/eth_icon.png',
    pStake: '/static/images/eth_icon.png',
  }

  console.log('shifted', shifted)

  function setParams(query: any) {
    //console.log('query', query)
    setIsShifted('coverExistingPool')
    setPool({
      poolId: query.poolId,
      liquidity: query.liquidity,
      userLiquidity: query.userLiquidity,
      tokenOneName: query.tokenOne.name,
      tokenOneSymbol: query.tokenOne.symbol,
      tokenOneLogoURI: logoMap[query.tokenZero.symbol],
      tokenOneAddress: query.tokenOne.id,
      tokenOneValue: query.valueTokenOne,
      tokenZeroName: query.tokenZero.symbol,
      tokenZeroSymbol: query.tokenZero.symbol,
      tokenZeroLogoURI: logoMap[query.tokenOne.symbol],
      tokenZeroAddress: query.tokenZero.id,
      tokenZeroValue: query.valueTokenZero,
      minLimit: query.min,
      maxLimit: query.max,
      tickSpacing: query.tickSpacing,
      feeTier: query.feeTier,
    })
    console.log('pool', pool)
  }

  return isDisconnected ? (
    <>
      <h1 className="mb-3">Connect your wallet to Cover Pool</h1>
      <ConnectWalletButton xl={true} />
      <div className="opacity-50 cursor-not-allowed">
        <h1 className="mb-3 mt-6">Set Price Range</h1>
        <div className="flex justify-between w-full gap-x-6">
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
            <span className="text-xs text-grey">Min Price</span>
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
    </>
  ) : shifted === "initial" ? (
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
          onClick={() => setIsShifted("createCover")}
        >
          Create my own Cover
        </div>
      </div>
      <div className="opacity-50 cursor-not-allowed">
        <h1 className="mb-3 mt-6">Set Price Range</h1>
        <div className="flex justify-between w-full gap-x-6">
          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
            <span className="text-xs text-grey">Min Price</span>
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
        setParams={setParams}
      />
    </>
  ) : shifted === "createCover" ? (
    <CreateCover goBack={setIsShifted} />
  ) : (
    <CoverExistingPool
      account={"account"}
      key={pool.poolId}
      poolId={pool.poolId}
      tokenOneName={pool.tokenOneName}
      tokenOneSymbol={pool.tokenOneSymbol}
      tokenOneLogoURI={pool.tokenOneLogoURI}
      tokenOneAddress={pool.tokenOneAddress}
      tokenZeroName={pool.tokenZeroName}
      tokenZeroSymbol={pool.tokenZeroSymbol}
      tokenZeroLogoURI={pool.tokenZeroLogoURI}
      tokenZeroAddress={pool.tokenZeroAddress}
      tokenOneValue={pool.tokenOneValue}
      tokenZeroValue={pool.tokenZeroValue}
      zeroForOne={false}
      liquidity={String(pool.liquidity)}
      userLiquidity={String(pool.userLiquidity)}
      goBack={setIsShifted}
      minLimit={pool.minLimit}
      maxLimit={pool.maxLimit}
      tickSpacing={pool.tickSpacing}
      feeTier={pool.feeTier}
    />
  );
}
