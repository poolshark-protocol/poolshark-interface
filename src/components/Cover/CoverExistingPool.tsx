import {
  ChevronDownIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/20/solid'
import { erc20ABI, useAccount, useContractRead } from 'wagmi'
import CoverMintButton from '../Buttons/CoverMintButton'
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import JSBI from 'jsbi'
import { getCoverPoolFromFactory } from '../../utils/queries'
import {
  TickMath,
  getDefaultLowerPrice,
  getDefaultLowerTick,
  getDefaultUpperPrice,
  getDefaultUpperTick,
  roundTick,
} from '../../utils/math/tickMath'
import { coverPoolABI } from '../../abis/evm/coverPool'
import { ZERO, ZERO_ADDRESS } from '../../utils/math/constants'
import { DyDxMath } from '../../utils/math/dydxMath'
import CoverMintApproveButton from '../Buttons/CoverMintApproveButton'

export default function CoverExistingPool({
  account,
  poolId,
  tokenOneName,
  tokenOneSymbol,
  tokenOneLogoURI,
  tokenOneAddress,
  tokenOneValue,
  tokenZeroName,
  tokenZeroSymbol,
  tokenZeroLogoURI,
  tokenZeroAddress,
  tokenZeroValue,
  minLimit,
  maxLimit,
  tickSpacing,
  zeroForOne,
  liquidity,
  userLiquidity,
  feeTier,
  goBack,
}) {
  type token = {
    name: string
    symbol: string
    logoURI: string
    address: string
    value: string
  }
  const { address, isConnected, isDisconnected } = useAccount()
  const [expanded, setExpanded] = useState(false)
  const [fetchDelay, setFetchDelay] = useState(false)
  const [tickSpread, setTickSpread] = useState(20)
  const [tokenOrder, setTokenOrder] = useState(zeroForOne)
  const [latestTick, setLatestTick] = useState(0)
  const [lowerTick, setLowerTick] = useState(
    getDefaultLowerTick(minLimit, maxLimit, zeroForOne),
  )
  const [upperTick, setUpperTick] = useState(
    getDefaultUpperTick(minLimit, maxLimit, zeroForOne),
  )
  const [lowerPrice, setLowerPrice] = useState(
    getDefaultLowerPrice(minLimit, maxLimit, zeroForOne),
  )
  const [upperPrice, setUpperPrice] = useState(
    getDefaultUpperPrice(minLimit, maxLimit, zeroForOne),
  )
  const [hasSelected, setHasSelected] = useState(true)
  const [queryTokenIn, setQueryTokenIn] = useState(tokenOneAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [isDisabled, setDisabled] = useState(true)
  const [amountToPay, setAmountToPay] = useState(0)
  const [tokenIn, setTokenIn] = useState({
    name: zeroForOne ? tokenZeroName : tokenOneName,
    symbol: zeroForOne ? tokenZeroSymbol : tokenOneSymbol,
    logoURI: zeroForOne ? tokenZeroLogoURI : tokenOneLogoURI,
    address: zeroForOne ? tokenZeroAddress : tokenOneAddress,
    value: zeroForOne ? tokenZeroValue : tokenOneValue,
  } as token)
  const [tokenOut, setTokenOut] = useState({
    name: zeroForOne ? tokenOneName : tokenZeroName,
    symbol: zeroForOne ? tokenOneSymbol : tokenZeroSymbol,
    logoURI: zeroForOne ? tokenOneLogoURI : tokenZeroLogoURI,
    address: zeroForOne ? tokenOneAddress : tokenZeroAddress,
    value: zeroForOne ? tokenOneValue : tokenZeroValue,
  } as token)

  const [sliderValue, setSliderValue] = useState(50)
  const [coverValue, setCoverValue] = useState(
    Number(Number(Number(tokenOut.value) / 2).toFixed(5)),
  )
  const [coverPrice, setCoverPrice] = useState(undefined)
  const [coverTickPrice, setCoverTickPrice] = useState(undefined)
  const [coverPoolRoute, setCoverPoolRoute] = useState(undefined)
  const [coverAmountIn, setCoverAmountIn] = useState(ZERO)
  const [coverAmountOut, setCoverAmountOut] = useState(ZERO)
  const [allowance, setAllowance] = useState(ZERO)
  const [mktRate, setMktRate] = useState({})

  const { data } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, coverPoolRoute],
    chainId: 421613,
    watch: true,
    enabled: isConnected && coverPoolRoute != undefined
  })

  const { data: priceCover } = useContractRead({
    address: coverPoolRoute,
    abi: coverPoolABI,
    functionName:
      tokenOut.address != '' &&
      tokenIn.address.localeCompare(tokenOut.address) < 0
        ? 'pool1'
        : 'pool0',
    args: [],
    chainId: 421613,
    watch: true,
    enabled: isConnected && coverPoolRoute != undefined
  })

  const getCoverPool = async () => {
    try {
      const pool = tokenOrder ?
                        await getCoverPoolFromFactory(tokenIn.address, tokenOut.address)
                      : await getCoverPoolFromFactory(tokenOut.address, tokenIn.address)
      const dataLength = pool['data']['coverPools'].length
      if (dataLength != 0) {
        setCoverPoolRoute(pool['data']['coverPools']['0']['id'])
        setTickSpread(['data']['coverPools']['0']['volatilityTier']['tickSpread'])
        setLatestTick(pool['data']['coverPools']['0']['latestTick'])
      } else {
        setCoverPoolRoute(ZERO_ADDRESS)
        setTickSpread(10)
        setLatestTick(0)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchTokenPrice = async () => {
    try {
      setMktRate({
        TOKEN20A: Number(coverTickPrice).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
        TOKEN20B: '1.00',
      })
      console.log('market rate set', mktRate)
    } catch (error) {
      console.log(error)
    }
  }

  function switchDirection() {
    setTokenOrder(!tokenOrder)
    const temp = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(temp)
    const tempBal = queryTokenIn
    setQueryTokenIn(queryTokenOut)
    setQueryTokenOut(tempBal)
    setSliderValue(50)
  }

  const changePrice = (direction: string, inputId: string) => {
    console.log('setting price', inputId, direction, inputId == 'minInput' || inputId == 'maxInput' ?
    (inputId == 'minInput' ? lowerTick : upperTick) : latestTick)
    const currentTick = inputId == 'minInput' || inputId == 'maxInput' ?
                          (inputId == 'minInput' ? lowerTick : upperTick) : latestTick;
    console.log('current tick', currentTick, upperTick)
    if (!tickSpread && !tickSpacing) return
    const increment = tickSpread ?? tickSpacing
    const adjustment = direction == 'plus' || direction == 'minus' ?
                        (direction == 'plus' ? increment : -increment) : 0;
    console.log('adjustment', adjustment, currentTick + adjustment)
    const newTick = roundTick(currentTick + adjustment, increment)
    const newPriceString = TickMath.getPriceStringAtTick(newTick);
    (document.getElementById(inputId) as HTMLInputElement).value = Number(newPriceString).toFixed(6)
    if (inputId === 'maxInput') {
      setUpperTick(newTick)
      setUpperPrice(newPriceString)
    }
    if (inputId === 'minInput') {
      setLowerTick(newTick)
      setLowerPrice(newPriceString)
    }
  }

  function changeCoverAmounts() {
    console.log('prices set:', lowerTick, upperTick, tickSpread)
    console.log('liquidity check', String(JSBI.BigInt(Math.round(parseFloat(userLiquidity)))))
    if (
      !isNaN(parseFloat(lowerPrice)) &&
      !isNaN(parseFloat(upperPrice)) &&
      !isNaN(parseInt(userLiquidity)) &&
      parseFloat(lowerPrice) > 0 &&
      parseFloat(upperPrice) > 0 &&
      parseFloat(lowerPrice) < parseFloat(upperPrice)
    ) {
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(lowerTick)
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(upperTick)
      const liquidityAmount = JSBI.divide(JSBI.multiply(JSBI.BigInt(Math.round(parseFloat(userLiquidity))), JSBI.BigInt(sliderValue)), JSBI.BigInt(100))
      setCoverAmountIn(
        tokenOrder
          ? DyDxMath.getDx(
              liquidityAmount,
              lowerSqrtPrice,
              upperSqrtPrice,
              true,
            )
          : DyDxMath.getDy(
              liquidityAmount,
              lowerSqrtPrice,
              upperSqrtPrice,
              true,
            ),
      )
      setCoverAmountOut(
        tokenOrder
          ? DyDxMath.getDy(
              liquidityAmount,
              lowerSqrtPrice,
              upperSqrtPrice,
              true,
            )
          : DyDxMath.getDx(
              liquidityAmount,
              lowerSqrtPrice,
              upperSqrtPrice,
              true,
            ),
      )
      console.log(
        'amount in set:',
        coverAmountIn.toString(),
        coverAmountOut.toString(),
        String(liquidityAmount),
      )
    }
  }

  const handleChange = (event: any) => {
    setSliderValue(event.target.value)
  }

  useEffect(() => {
    if (data) {
      if (coverPoolRoute != undefined && tokenOut.address != '') {
        console.log('Success allowance', data.toString())
        setAllowance(JSBI.BigInt(data.toString()))
        console.log('allowance check', data.toString(), JSBI.toNumber(coverAmountIn))
      }
    }
  }, [data, tokenIn.address, coverAmountIn])

  useEffect(() => {
    if (priceCover) {
      if (coverPoolRoute != undefined && tokenOut.address != '') {
        console.log('price cover:', priceCover[0])
        setCoverPrice(priceCover[0])

        const price = TickMath.getPriceStringAtSqrtPrice(priceCover[0])
        setCoverTickPrice(price)
      }
    }
  }, [priceCover, tokenIn.address])

  useEffect(() => {
    setCoverValue(
      Number(Number(Number(tokenOut.value)).toFixed(5)) * sliderValue,
    )
  }, [sliderValue, tokenOut.value])

  useEffect(() => {
    setFetchDelay(false)
  }, [coverPoolRoute])

  useEffect(() => {
    setFetchDelay(true)
  }, [])

  // fetches
  // - coverPoolRoute => pool address
  // - tickSpread => pool tick spacing
  // - latestTick => current TWAP tick
  useEffect(() => {
    if(!fetchDelay) {
      getCoverPool()
    } else {
      const interval = setInterval(() => {
        getCoverPool()
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchDelay])

  useEffect(() => {
    changeCoverAmounts()
  }, [coverValue, lowerTick, upperTick])

  // check for valid inputs
  useEffect(() => {
    setDisabled(
      isNaN(parseFloat(lowerPrice)) ||
      isNaN(parseFloat(upperPrice)) ||
      parseFloat(lowerPrice) >= parseFloat(upperPrice) ||
      hasSelected == false
    )
  }, [lowerPrice, upperPrice, coverAmountIn])

  useEffect(() => {
    fetchTokenPrice()
  }, [coverPrice])

  useEffect(() => {
    if (!isNaN(parseFloat(lowerPrice)) && !isNaN(parseFloat(upperPrice))) {
      console.log('setting lower tick')
      setLowerTick(TickMath.getTickAtPriceString(lowerPrice, tickSpread))
    }
    if (!isNaN(parseFloat(upperPrice))) {
      console.log('setting upper tick')
      setUpperTick(TickMath.getTickAtPriceString(upperPrice, tickSpread))
    }
  }, [lowerPrice, upperPrice])

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
              Mininum recieved after slippage (0.50%)
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

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-row justify-between">
          <h1 className="mb-3">Selected Pool</h1>
          <span
            className="flex gap-x-1 cursor-pointer"
            onClick={() => goBack("initial")}
          >
            <ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " />
            <h1 className="mb-3 opacity-50">Back</h1>
          </span>
        </div>
        <div className="flex gap-x-4 items-center">
          <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
            <div className="flex items-center gap-x-2 w-full">
              <img className="w-7" src={tokenIn.logoURI} />
              {tokenIn.name}
            </div>
          </button>
          <ArrowLongRightIcon
            className="w-6 cursor-pointer"
            onClick={() => {
              if (hasSelected) {
                switchDirection();
              }
            }}
          />
          <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
            <div className="flex items-center gap-x-2 w-full">
              <img className="w-7" src={tokenOut.logoURI} />
              {tokenOut.name}
            </div>
          </button>
        </div>
      </div>
      <h1 className="mb-3">How much do you want to Cover?</h1>
      <div className="w-full flex items-center justify-between text-xs text-[#646464]">
        <div>0</div>
        <div>Full</div>
      </div>
      <div className="w-full flex items-center mt-2">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleChange}
          className="w-full styled-slider slider-progress bg-transparent"
        />
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <div className="text-[#646464]">Percentage Covered</div>
          <div className="flex gap-x-2 items-center">
            <input
              type="text"
              id="input"
              onChange={(e) => {
                setSliderValue(
                  Number(
                    e.target.value
                      .replace(/^0+(?=[^.0-9]|$)/, (match) =>
                        match.length > 1 ? "0" : match
                      )
                      .replace(/^(\.)+/, '0.')
                      .replace(/(?<=\..*)\./g, '')
                      .replace(/^0+(?=\d)/, '')
                      .replace(/[^\d.]/g, '')
 
                  ),
                )
                console.log('slider value', sliderValue)
              }}
              value={sliderValue}
              className="text-right placeholder:text-grey1 text-white text-2xl w-20 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none bg-black"
            />
            %
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="text-[#646464]">Amount Covered</div>
          <div className='flex items-center justify-end gap-x-3'>
            <input
              type="text"
              id="input"
              onChange={(e) => {
                console.log("cover amount changed", coverAmountOut);
                if (
                  Number(
                    e.target.value
                      .replace(/^0+(?=[^.0-9]|$)/, (match) =>
                        match.length > 1 ? "0" : match
                      )
                      .replace(/^(\.)+/, "0")
                      .replace(/(?<=\..*)\./g, "")
                      .replace(/^0+(?=\d)/, "")
                      .replace(/[^\d.]/g, "")
                  ) /
                    Number(ethers.utils.formatUnits(coverAmountOut, 18)) <
                  100
                ) {
                  setSliderValue(
                    Number(
                      e.target.value
                        .replace(/^0+(?=[^.0-9]|$)/, (match) =>
                          match.length > 1 ? "0" : match
                        )
                        .replace(/^(\.)+/, "0")
                        .replace(/(?<=\..*)\./g, "")
                        .replace(/^0+(?=\d)/, "")
                        .replace(/[^\d.]/g, "")
                    ) / Number(ethers.utils.formatUnits(coverAmountOut, 18))
                  );
                } else {
                  setSliderValue(100);
                }
                setCoverValue(
                  Number(
                    e.target.value
                      .replace(/^0+(?=[^.0-9]|$)/, (match) =>
                        match.length > 1 ? "0" : match
                      )
                      .replace(/^(\.)+/, "0")
                      .replace(/(?<=\..*)\./g, "")
                      .replace(/^0+(?=\d)/, "")
                      .replace(/[^\d.]/g, "")
                  )
                );
              }}
              value={Number.parseFloat(
                ethers.utils.formatUnits(String(coverAmountOut), 18)
              ).toPrecision(3)}
              className="bg-[#0C0C0C] border border-grey2 w-32 px-2 py-1 placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
            />
            <div>{tokenOut.symbol}</div>
          </div>
        </div>
        {mktRate[tokenIn.symbol] ? (
          <div className="flex justify-between text-sm">
            <div className="text-[#646464]">Amount to pay</div>
            <div>
              {Number(
                ethers.utils.formatUnits(coverAmountIn.toString(), 18)
              ).toFixed(2)}
              $
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <h1 className="mb-3 mt-4">Set Price Range</h1>
      <div className="flex justify-between w-full gap-x-6">
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Min Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("minus", "minInput")}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="minInput"
              type="text"
              value={
                lowerPrice.toString().includes("e")
                  ? Number(lowerPrice).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    }).length > 6
                    ? "-∞"
                    : Number(lowerPrice).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })
                  : lowerPrice
              }
              onChange={() =>
                setLowerPrice(
                  (document.getElementById('minInput') as HTMLInputElement)
                    ?.value
                    .replace(/^0+(?=[^.0-9]|$)/, (match) =>
                      match.length > 1 ? '0' : match,
                    )
                    .replace(/^(\.)+/, '0.')
                    .replace(/(?<=\..*)\./g, '')
                    .replace(/^0+(?=\d)/, '')
                    .replace(/[^\d.]/g, ''),
                )
              }
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "minInput")}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Max. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("minus", "maxInput")}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="maxInput"
              type="text"
              //TODO find alternative for scientific notation
              value={
                upperPrice.toString().includes("e")
                  ? Number(upperPrice).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    }).length > 6
                    ? "∞"
                    : Number(upperPrice).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })
                  : upperPrice
              }
              onChange={() =>
                setUpperPrice(
                  (document.getElementById('maxInput') as HTMLInputElement)
                    ?.value
                    .replace(/^0+(?=[^.0-9]|$)/, (match) =>
                      match.length > 1 ? '0' : match,
                    )
                    .replace(/^(\.)+/, '0.')
                    .replace(/(?<=\..*)\./g, '')
                    .replace(/^0+(?=\d)/, '')
                    .replace(/[^\d.]/g, ''),
                )
              }
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "maxInput")}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="py-4">
        <div
          className="flex px-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
            1 {tokenIn.name} = 1 {tokenOut.name}
          </div>
          <div className="ml-auto text-xs uppercase text-[#C9C9C9]">
            <button>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-wrap w-full break-normal transition ">
          <Option />
        </div>
      </div>
      <div className="space-y-3">
        {isDisconnected ? <ConnectWalletButton /> : null}
        {isDisconnected || JSBI.lessThanOrEqual(allowance, coverAmountIn) ? (
          <CoverMintApproveButton
            disabled={isDisabled}
            poolAddress={coverPoolRoute}
            approveToken={tokenIn.address}
            amount={String(coverAmountIn)}
          />
        ) : (
          <CoverMintButton
            poolAddress={coverPoolRoute}
            disabled={isDisabled}
            to={address}
            lower={lowerTick}
            claim={
              tokenOut.address != "" &&
              tokenIn.address.localeCompare(tokenOut.address) < 0
                ? upperTick
                : lowerTick
            }
            upper={upperTick}
            amount={String(coverAmountIn)}
            zeroForOne={
              tokenOut.address != "" &&
              tokenIn.address.localeCompare(tokenOut.address) < 0
            }
            tickSpacing={tickSpread}
          />
        )}
      </div>
    </>
  );
}
