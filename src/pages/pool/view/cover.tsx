import Navbar from '../../../components/Navbar'
import {
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/20/solid'
import { useState, useEffect } from 'react'
import CoverBurnButton from '../../../components/Buttons/CoverBurnButton'
import CoverCollectButton from '../../../components/Buttons/CoverCollectButton'
import { useRouter } from 'next/router'

export default function Cover() {
  const [is0Copied, setIs0Copied] = useState(false)
  const [is1Copied, setIs1Copied] = useState(false)
  const [isPoolCopied, setIsPoolCopied] = useState(false)

  const router = useRouter();

  function copyAddress0() {
    navigator.clipboard.writeText(router.query.tokenZeroAddress.toString())
    setIs0Copied(true)
  }
  useEffect(() => {
    if (copyAddress0) {
      const timer = setTimeout(() => {
        setIs0Copied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  })

  function copyAddress1() {
    navigator.clipboard.writeText(router.query.tokenOneAddress.toString())
    setIs1Copied(true)
  }
  useEffect(() => {
    if (copyAddress1) {
      const timer = setTimeout(() => {
        setIs1Copied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  })

  function copyPoolAddress() {
    navigator.clipboard.writeText(router.query.poolId.toString())
    setIsPoolCopied(true)
  }
  useEffect(() => {
    if (copyPoolAddress) {
      const timer = setTimeout(() => {
        setIsPoolCopied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  })

  const zeroAddress = router.query.tokenZeroAddress.toString()
  const oneAddress = router.query.tokenOneAddress.toString()
  const poolAddress = router.query.poolId.toString()

  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    zeroAddress.substring(0, 6) 
  + "..."  
  + zeroAddress.substring(
    zeroAddress.length-4, 
    zeroAddress.length
  ));
const [tokenOneDisplay, setTokenOneDisplay]  = useState(
  oneAddress.substring(0, 6) 
  + "..."  
  + oneAddress.substring(
      oneAddress.length-4, 
      oneAddress.length
  ));
const [poolDisplay, setPoolDisplay] = useState(
    poolAddress.substring(0, 6) 
  + "..."  
  + poolAddress.substring(
    poolAddress.length-4, 
    poolAddress.length
  ));

  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white relative min-h-[calc(100vh-76px)] w-full">
        <div className="w-[55rem] absolute bottom-0">
          <div className="flex justify-between items-center mb-2">
            <div className="text-left flex items-center gap-x-5 py-2.5">
              <div className="flex items-center">
                <img height="50" width="50" src={router.query.tokenZeroLogoURI.toString()} />
                <img
                  height="50"
                  width="50"
                  className="ml-[-12px]"
                  src={router.query.tokenOneLogoURI.toString()}
                />
              </div>
              <span className="text-3xl flex items-center gap-x-3">
               {router.query.tokenZeroName} <ArrowLongRightIcon className="w-5 " /> {router.query.tokenOneName}
              </span>
              <span className="bg-white text-black rounded-md px-3 py-0.5">
                1%
              </span>
              <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                In Range
              </div>
            </div>
            <a href="#">
              <span className="gap-x-2 flex items-center text-white cursor-pointer hover:opacity-80">
                View on Etherscan
                <ArrowTopRightOnSquareIcon className="w-5 " />
              </span>
            </a>
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-[#646464]">
              <div className="grid grid-cols-2 gap-x-10 pl-2 ">
                <h1
                  onClick={() => copyAddress0()}
                  className="text-xs cursor-pointer w-32"
                >
                  {router.query.tokenOneName}:
                  {is0Copied ? (
                    <span className="ml-1">Copied</span>
                  ) : (
                    <span className="ml-1">{tokenZeroDisplay}</span>
                  )}
                </h1>
                <h1
                  onClick={() => copyAddress1()}
                  className="text-xs cursor-pointer"
                >
                 {router.query.tokenZeroName}:
                  {is1Copied ? (
                    <span className="ml-1">Copied</span>
                  ) : (
                    <span className="ml-1">{tokenOneDisplay}</span>
                  )}
                </h1>
              </div>
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
          <div className="bg-black  border border-grey2 border-b-none w-full rounded-t-xl py-6 px-7 h-[70vh] overflow-y-auto">
            <div className="flex gap-x-20 justify-between">
              <div className="w-1/2">
                <h1 className="text-lg mb-3">Cover Size</h1>
                <span className="text-4xl">$603.43</span>

                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img
                        height="30"
                        width="30"
                        src={router.query.tokenZeroLogoURI.toString()}
                      />
                     {router.query.tokenZeroName}
                    </div>
                    300
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img
                        height="30"
                        width="30"
                        src={router.query.tokenOneLogoURI.toString()}
                      />
                      {router.query.tokenOneName}
                    </div>
                    303
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <button className="bg-[#032851] w-full py-3 px-4 rounded-xl">
                    Add Liquidity
                  </button>
                </div>
              </div>
              <div className="w-1/2">
                <h1 className="text-lg mb-3">Filled Position</h1>
                <span className="text-4xl">
                  $300<span className="text-grey">/$603.43</span>
                </span>
                <div className="text-grey mt-3">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img
                        height="30"
                        width="30"
                        src={router.query.tokenZeroLogoURI.toString()}
                      />
                     {router.query.tokenZeroName}
                    </div>
                    <span className="text-white">
                      298<span className="text-grey">/600</span>
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="space-y-3">
                    <CoverBurnButton address={'address'} />

                    <CoverCollectButton address={'address'} />

                    {/*TO-DO: add positionOwner ternary again*/}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex mt-7 gap-x-6 items-center">
                <h1 className="text-lg">Price Range </h1>
                <div className="flex items-center rounded-lg gap-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  In Range
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 gap-x-6">
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Min Price.</div>
                <div className="text-white text-2xl my-2 w-full">1.0323</div>
                <div className="text-grey text-xs w-full">DAI per {router.query.tokenOneName}</div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100%{router.query.tokenZeroName} at this price.
                </div>
              </div>
              <ArrowsRightLeftIcon className="w-12 text-grey" />
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Max Price.</div>
                <div className="text-white text-2xl my-2 w-full">1.064</div>
                <div className="text-grey text-xs w-full">DAI per {router.query.tokenOneName}</div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100%{router.query.tokenZeroName} at this price.
                </div>
              </div>
            </div>
            <div className="border border-grey1 rounded-xl py-2 text-center w-full mt-4 bg-dark">
              <div className="text-grey text-xs w-full">Current Price</div>
              <div className="text-white text-2xl my-2 w-full">1.064</div>
              <div className="text-grey text-xs w-full">DAI per {router.query.tokenOneName}</div>
            </div>
            <div>
              <div className="flex justify-between items-center mt-10 mb-5">
                <h1 className="text-lg">Original pool being covered </h1>
                <h1 className="text-grey">
                  Type: <span className="text-white">UNI-V3</span>
                </h1>
              </div>
              <div className="w-full cursor-pointer flex justify-between items-center bg-dark border border-grey2 rounded-xl py-3.5 pl-5 h-24 relative">
                <div className="space-y-2">
                  <div className="flex items-center gap-x-5">
                    <div className="flex items-center ">
                      <img
                        height="30"
                        width="30"
                        src="/static/images/eth_icon.png"
                      />
                      <img
                        height="30"
                        width="30"
                        className="ml-[-8px]"
                        src={router.query.tokenZeroLogoURI.toString()}
                      />
                    </div>
                    <div className="flex gap-x-2">WETH -{router.query.tokenZeroName}</div>
                    <div className="bg-black px-2 py-1 rounded-lg text-grey">
                      0.5%
                    </div>
                  </div>
                  <div className="text-sm flex items-center gap-x-3">
                    <span>
                      <span className="text-grey">Min:</span> 1203{router.query.tokenZeroName} per ETH
                    </span>
                    <ArrowsRightLeftIcon className="w-4 text-grey" />
                    <span>
                      <span className="text-grey">Max:</span> 1643{router.query.tokenZeroName} per ETH
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
