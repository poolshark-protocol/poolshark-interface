import {
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function UserPool({
  poolId,
  account,
  tokenOne,
  tokenZero,
  tvlUsd,
  volumeUsd,
  volumeEth,
}) {
  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    tokenZero.name?.substring(0, 6) +
      '...' +
      tokenZero.name?.substring(
        tokenZero.name?.length - 4,
        tokenZero.name?.length,
      ),
  )
  const [tokenOneDisplay, setTokenOneDisplay] = useState(
    tokenOne.id?.substring(0, 6) +
      '...' +
      tokenOne.id?.substring(tokenOne.id?.length - 4, tokenOne.id?.length),
  )
  const [poolDisplay, setPoolDisplay] = useState(
    poolId?.substring(0, 6) +
      '...' +
      poolId?.substring(poolId?.length - 4, poolId?.length),
  )

  //useEffect

  /* TODO@retraca create constant file for this */
  const logoMap = {
    TOKEN20A: '/static/images/eth_icon.png',
    TOKEN20B: '/static/images/token.png',
    USDC: '/static/images/token.png',
    WETH: '/static/images/eth_icon.png',
    DAI: '/static/images/dai_icon.png',
  }

  return (
    <>
      <Link
        href={{
          pathname: '/pool/view/range',
          query: {
            ccount: account,
            poolId: poolId,
            tokenOneName: tokenOne.name,
            tokenOneSymbol: tokenOne.symbol,
            tokenOneLogoURI: logoMap[tokenOne.symbol],
            tokenOneAddress: tokenOne.id,
            tokenZeroName: tokenZero.name,
            tokenZeroSymbol: tokenZero.symbol,
            tokenZeroLogoURI: logoMap[tokenZero.symbol],
            tokenZeroAddress: tokenZero.id,
          },
        }}
      >
        <div className="w-full cursor-pointer flex justify-between items-center bg-dark border border-grey2 rounded-xl py-3.5 pl-5 h-24 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-x-5">
              <div className="flex items-center ">
                <img height="30" width="30" src={logoMap[tokenZero.symbol]} />
                <img
                  height="30"
                  width="30"
                  className="ml-[-8px]"
                  src={logoMap[tokenOne.symbol]}
                />
              </div>
              <div className="flex gap-x-2">
                {tokenZero.name}
                <ArrowLongRightIcon className="w-5" />
                {tokenOne.name}
              </div>
              <div className="bg-black px-2 py-1 rounded-lg text-grey">1%</div>
            </div>
            <div className="text-sm flex items-center gap-x-3">
              <span>
                {/* TODO@retraca Xmin and Xmax set dynamic */}
                <span className="text-grey">Min:</span> Xmin {tokenZero.symbol}{' '}
                per {tokenOne.symbol}
              </span>
              <ArrowsRightLeftIcon className="w-4 text-grey" />
              <span>
                <span className="text-grey">Max:</span> Xmax {tokenOne.symbol}{' '}
                per {tokenZero.symbol}
              </span>
            </div>
          </div>{' '}
          <div className="pr-5">
            <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              In Range
            </div>
            {/* WHEN POSITION IS OUT OF RANGE
      
      <div cl</div>assName="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
        <Excl</div>amationTriangleIcon className="w-4 text-yellow-600"/>
        Out of Range
        </div> */}
          </div>
        </div>
      </Link>
    </>
  )
}
