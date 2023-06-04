import {
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
} from '@heroicons/react/20/solid'
import SelectToken from '../SelectToken'
import { erc20ABI, useAccount, useProvider, useContractRead } from 'wagmi'
import CoverMintButton from '../Buttons/CoverMintButton'
import { chainIdsToNamesForGitTokenList } from '../../utils/chains'
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton'
import { useState, useEffect } from 'react'
import useInputBox from '../../hooks/useInputBox'
import { tokenOneAddress } from '../../constants/contractAddresses'
import { coverPoolAddress } from '../../constants/contractAddresses'
import { TickMath, invertPrice, roundTick } from '../../utils/math/tickMath'
import { BigNumber, Contract, ethers } from 'ethers'
import { useCoverStore } from '../../hooks/useStore'
import { getCoverPoolFromFactory } from '../../utils/queries'
import JSBI from 'jsbi'
import SwapCoverApproveButton from '../Buttons/SwapCoverApproveButton'
import { coverPoolABI } from '../../abis/evm/coverPool'
import { useRouter } from 'next/router'
import { BN_ZERO, ZERO, ZERO_ADDRESS } from '../../utils/math/constants'
import { DyDxMath } from '../../utils/math/dydxMath'
import { getBalances } from '../../utils/balances'

export default function CreateCover(props: any) {
  const router = useRouter()
  const [pool, setPool] = useState(props.query ?? undefined)
  const initialBig = BigNumber.from(0)
  const { bnInput, inputBox, maxBalance } = useInputBox()
  const [
    updateCoverContractParams,
    updateCoverAllowance,
    CoverAllowance,
    coverContractParams,
  ] = useCoverStore((state: any) => [
    state.updateCoverContractParams,
    state.updateCoverAllowance,
    state.CoverAllowance,
    state.coverContractParams,
  ])
  const [expanded, setExpanded] = useState(false)
  const [stateChainName, setStateChainName] = useState()
  const [lowerPrice, setLowerPrice] = useState('')
  const [upperPrice, setUpperPrice] = useState('')
  const [lowerTick, setLowerTick] = useState(initialBig)
  const [upperTick, setUpperTick] = useState(initialBig)
  const [latestTick, setLatestTick] = useState(0)
  const [balance0, setBalance0] = useState('')
  const [allowance, setAllowance] = useState('0')
  const { address, isConnected, isDisconnected } = useAccount()
  const [isDisabled, setDisabled] = useState(true)
  const [mktRate, setMktRate] = useState({})
  const [hasSelected, setHasSelected] = useState(
    pool != undefined ? true : false,
  )
  const [queryTokenIn, setQueryTokenIn] = useState(tokenOneAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [tokenIn, setTokenIn] = useState({
    symbol: props.query ? props.query.tokenZeroSymbol : 'USDC',
    logoURI: props.query
      ? props.query.tokenZeroLogoURI
      : '/static/images/token.png',
    address: props.query
      ? props.query.tokenZeroAddress
      : '0xC26906E10E8BDaDeb2cf297eb56DF59775eE52c4',
  })
  const [tokenOut, setTokenOut] = useState({
    symbol: props.query ? props.query.tokenOneSymbol : 'Select Token',
    logoURI: props.query ? props.query.tokenOneLogoURI : '',
    address: props.query ? props.query.tokenOneAddress : '',
  })
  const [coverPrice, setCoverPrice] = useState(undefined)
  const [coverAmountIn, setCoverAmountIn] = useState(ZERO)
  const [coverAmountOut, setCoverAmountOut] = useState(ZERO)
  const [coverPoolRoute, setCoverPoolRoute] = useState(undefined)
  const [tokenOrder, setTokenOrder] = useState(
    tokenIn.address.localeCompare(tokenOut.address) < 0,
  )
  const [tickSpread, setTickSpread] = useState(
    props.query ? props.query.tickSpacing : 20,
  )
  const poolId =
    router.query.poolId === undefined ? '' : router.query.poolId.toString()

  function setParams(query: any) {
    setPool({
      poolId: query.poolId,
    })
  }

  const { data: allowanceValue } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, coverPoolRoute],
    chainId: 421613,
    watch: true,
    enabled:
      isConnected &&
      coverPoolRoute != undefined &&
      tokenIn.address != undefined,
    onSuccess(data) {
      console.log('Success')
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      console.log('Allowance Settled', {
        data,
        error,
        coverPoolRoute,
        tokenIn,
        tokenOut,
      })
    },
  })

  useEffect(() => {
    if (allowanceValue)
      if (
        address != '0x' &&
        mktRate != undefined &&
        coverPoolRoute != ZERO_ADDRESS
      ) {
        setAllowance(ethers.utils.formatUnits(allowanceValue, 18))
      }
  }, [allowanceValue, tokenIn.address, bnInput])

  const {
    network: { chainId },
  } = useProvider()

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId])
  }, [chainId])

  useEffect(() => {
    updateBalances()
  }, [tokenOut, tokenIn])

  async function updateBalances() {
    await getBalances(address, false, tokenIn, tokenOut, setBalance0, () => {})
  }

  useEffect(() => {
    fetchTokenPrice()
  }, [coverPrice])

  useEffect(() => {
    setParams(router.query)
  }, [router])

  useEffect(() => {
    getCoverPool()
  }, [hasSelected, tokenIn.address, tokenOut.address])

  // set disabled
  useEffect(() => {
    setDisabled(
      isNaN(parseFloat(lowerPrice)) ||
        isNaN(parseFloat(upperPrice)) ||
        parseFloat(lowerPrice) >= parseFloat(upperPrice) ||
        Number(ethers.utils.formatUnits(bnInput)) === 0 ||
        tokenOut.symbol === 'Select Token' ||
        hasSelected == false,
    )
  }, [lowerPrice, upperPrice, bnInput, tokenOut, hasSelected])

  // set amount in
  useEffect(() => {
    if (Number(ethers.utils.formatUnits(bnInput)) !== 0) {
      setCoverAmountIn(JSBI.BigInt(bnInput.toString()))
    }
  }, [bnInput, lowerTick, upperTick])

  useEffect(() => {
    if (!isNaN(parseFloat(lowerPrice)) && !isNaN(parseFloat(upperPrice))) {
      setLowerTick(BigNumber.from(TickMath.getTickAtPriceString(lowerPrice, tickSpread)))
      setUpperTick(BigNumber.from(TickMath.getTickAtPriceString(upperPrice, tickSpread)))
    } else {
      console.log('not a number')
    }
  }, [lowerPrice, upperPrice])

  useEffect(() => {
    changeCoverAmounts(true)
  }, [coverAmountIn])

  const getCoverPool = async () => {
    try {
      const pool = tokenOrder
        ? await getCoverPoolFromFactory(tokenIn.address, tokenOut.address)
        : await getCoverPoolFromFactory(tokenOut.address, tokenIn.address)
      const dataLength = pool['data']['coverPools'].length
      if (dataLength != 0) {
        setCoverPoolRoute(pool['data']['coverPools']['0']['id'])
        setTickSpread(
          pool['data']['coverPools']['0']['volatilityTier']['tickSpread'],
        )
        const newLatestTick = pool['data']['coverPools']['0']['latestTick']
        setCoverPrice(TickMath.getPriceStringAtTick(newLatestTick))
      } else {
        setCoverPoolRoute(ZERO_ADDRESS)
        setCoverPrice('1.00')
        setTickSpread(10)
      }
    } catch (error) {
      console.log(error)
    }
  }

  function changeDefault0(token: {
    symbol: string
    logoURI: any
    address: string
  }) {
    if (
      token.symbol === tokenOut.symbol ||
      token.address === tokenOut.address
    ) {
      return
    }
    console.log('default0', token)
    setTokenIn(token)
    setTokenOrder(tokenIn.address.localeCompare(tokenOut.address) < 0)
    console.log('set token order', tokenOrder)
  }

  const changeDefault1 = (token: {
    symbol: string
    logoURI: any
    address: string
  }) => {
    if (token.symbol === tokenIn.symbol || token.address === tokenIn.address) {
      return
    }
    console.log('default1', token)
    setTokenOut(token)
    setHasSelected(true)
    setTokenOrder(tokenIn.address.localeCompare(tokenOut.address) < 0)
    console.log(
      'set token order',
      tokenIn.address.localeCompare(tokenOut.address) < 0,
    )
  }

  function switchDirection() {
    setTokenOrder(!tokenOrder)
    const temp = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(temp)
    const tempBal = queryTokenIn
    setQueryTokenIn(queryTokenOut)
    setQueryTokenOut(tempBal)
  }

  const handleValueChange = () => {
    if (
      (document.getElementById('input') as HTMLInputElement).value === undefined
    ) {
      return
    }
    const current = document.getElementById('input') as HTMLInputElement
  }

  const changePrice = (direction: string, inputId: string) => {
    if (!tickSpread) return
    const currentTick = inputId == 'minInput' || inputId == 'maxInput' ?
                          (inputId == 'minInput' ? Number(lowerTick) : Number(upperTick)) : latestTick;
    const increment = tickSpread
    const adjustment = direction == 'plus' || direction == 'minus' ?
                        (direction == 'plus' ? -increment : increment) : 0;
    const newTick = roundTick(currentTick - adjustment, increment)
    const newPriceString = TickMath.getPriceStringAtTick(newTick);
    (document.getElementById(inputId) as HTMLInputElement).value = Number(newPriceString).toFixed(6)
    if (inputId === 'maxInput') {
      setUpperTick(BigNumber.from(newTick))
      setUpperPrice(newPriceString)
    }
    if (inputId === 'minInput') {
      setLowerTick(BigNumber.from(newTick))
      setLowerPrice(newPriceString)
    }
  }

  const fetchTokenPrice = async () => {
    try {
      setMktRate({
        TOKEN20A:
          '~' +
          Number(coverPrice).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
        WETH:
          '~' +
          Number(coverPrice).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
        TOKEN20B: '~1.00',
        USDC: '~1.00',
      })
    } catch (error) {
      console.log(error)
    }
  }

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

  function changeCoverAmounts(amountInChanged: boolean) {
    console.log(
      'prices set:',
      lowerTick.toString(),
      upperTick.toString(),
      tickSpread,
    )
    console.log('price check', parseFloat(lowerPrice) < parseFloat(upperPrice))
    if (
      !isNaN(parseFloat(lowerPrice)) &&
      !isNaN(parseFloat(upperPrice)) &&
      parseFloat(lowerPrice) > 0 &&
      parseFloat(upperPrice) > 0 &&
      parseFloat(lowerPrice) < parseFloat(upperPrice)
    ) {
      console.log('tick check', lowerTick.toString(), upperTick.toString())
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(Number(lowerTick))
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(Number(upperTick))

      console.log('amount in', coverAmountIn.toString())
      if (amountInChanged) {
        // amountIn changed
        const liquidityAmount = DyDxMath.getLiquidityForAmounts(
          lowerSqrtPrice,
          upperSqrtPrice,
          tokenOrder ? lowerSqrtPrice : upperSqrtPrice,
          tokenOrder ? BN_ZERO : BigNumber.from(String(coverAmountIn)),
          tokenOrder ? BigNumber.from(String(coverAmountIn)) : BN_ZERO,
        )
        console.log('liquidity amount', String(liquidityAmount), tokenOrder)
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
          (tokenOrder
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
              )
          ).toString(),
          liquidityAmount.toString(),
        )
      } else {
        // amountOut changed
        const liquidityAmount = DyDxMath.getLiquidityForAmounts(
          lowerSqrtPrice,
          upperSqrtPrice,
          tokenOrder ? upperSqrtPrice : lowerSqrtPrice,
          tokenOrder ? BigNumber.from(String(coverAmountOut)) : BN_ZERO,
          tokenOrder ? BN_ZERO : BigNumber.from(String(coverAmountOut)),
        )
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
      }
    }
  }

  return isDisconnected ? (
    <>
      <h1 className="mb-5">Connect a Wallet</h1>
      <ConnectWalletButton />
    </>
  ) : (
    <>
      <div className="mb-6">
        <div className="flex flex-row justify-between">
          <h1 className="mb-3">Select Pair</h1>
          {/*  {pool != undefined ? (
            <Link href="/cover">
              <span className="flex gap-x-1 cursor-pointer">
                <ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " />{' '}
                <h1 className="mb-3 opacity-50">Back</h1>{' '}
              </span>
            </Link>
          ) : ( */}
          <span
            className="flex gap-x-1 cursor-pointer"
            onClick={() => props.goBack('initial')}
          >
            <ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " />{' '}
            <h1 className="mb-3 opacity-50">Back</h1>{' '}
          </span>
          {/* )} */}
        </div>

        <div className="flex gap-x-4 items-center">
          <SelectToken
            index="0"
            tokenChosen={changeDefault0}
            displayToken={tokenIn}
            balance={setQueryTokenIn}
            key={queryTokenIn}
          />
          <div className="items-center px-2 py-2 m-auto border border-[#1E1E1E] z-30 bg-black rounded-lg cursor-pointer">
            <ArrowLongRightIcon
              className="w-6 cursor-pointer"
              onClick={() => {
                if (hasSelected) {
                  switchDirection()
                }
              }}
            />
          </div>
          {hasSelected ? (
            <SelectToken
              index="1"
              selected={hasSelected}
              tokenChosen={changeDefault1}
              displayToken={tokenOut}
              balance={setQueryTokenOut}
              key={queryTokenOut + 'selected'}
            />
          ) : (
            <SelectToken
              index="1"
              selected={hasSelected}
              tokenChosen={changeDefault1}
              displayToken={tokenOut}
              balance={setQueryTokenOut}
              key={queryTokenOut + 'unselected'}
            />
          )}
        </div>
      </div>
      <h1 className="mb-3">How much do you want to Cover?</h1>
      <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
        <div className="flex-col justify-center w-1/2 p-2 ">
          {inputBox('0', setCoverAmountIn)}
          <div className="flex text-xs text-[#4C4C4C]">
            ~${Number(ethers.utils.formatUnits(bnInput, 18)).toFixed(2)}
          </div>
        </div>
        <div className="flex w-1/2">
          <div className="flex justify-center ml-auto">
            <div className="flex-col">
              <div className="flex justify-end">
                <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                  <div className="flex items-center gap-x-2 w-full">
                    <img className="w-7" src={tokenIn.logoURI} />
                    {tokenIn.symbol}
                  </div>
                </button>
              </div>
              <div className="flex items-center justify-end gap-2 px-1 mt-2">
                <div className="flex text-xs text-[#4C4C4C]">
                  Balance: {balance0 === 'NaN' ? 0 : balance0}
                </div>
                {isConnected ? (
                  <button
                    className="flex text-xs uppercase text-[#C9C9C9]"
                    onClick={() => maxBalance(balance0, '0')}
                  >
                    Max
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {/* <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Balance</div>
          <div>
            {usdcBalance} {tokenIn.symbol}
          </div>
        </div> */}
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Amount to receive</div>
          <div>
            {/* {amountToPay} {tokenIn.symbol} */}
            {hasSelected &&
            mktRate[tokenIn.symbol] &&
            parseFloat(lowerPrice) < parseFloat(upperPrice) ? (
              (
                parseFloat(
                  ethers.utils.formatUnits(String(coverAmountOut), 18),
                ) * parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''))
              ).toFixed(2)
            ) : (
              <>?</>
            )}{' '}
            {tokenOut.symbol}
          </div>
        </div>
      </div>
      <h1 className="mb-3 mt-4">Set Price Range</h1>
      <div className="flex justify-between w-full gap-x-6">
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Min Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice('minus', 'minInput')}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="minInput"
              type="text"
              value={lowerPrice}
              onChange={() =>
                setLowerPrice(
                  (document.getElementById(
                    'minInput',
                  ) as HTMLInputElement)?.value
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
              <button onClick={() => changePrice('plus', 'minInput')}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <span className="text-xs text-grey">
            {tokenIn.symbol} per{' '}
            {tokenOut.symbol === 'SELECT TOKEN' ? '?' : tokenOut.symbol}
          </span>
        </div>
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Max. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice('minus', 'maxInput')}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="maxInput"
              type="text"
              value={upperPrice}
              onChange={() =>
                setUpperPrice(
                  (document.getElementById(
                    'maxInput',
                  ) as HTMLInputElement)?.value
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
              <button onClick={() => changePrice('plus', 'maxInput')}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <span className="text-xs text-grey">
            {tokenIn.symbol} per{' '}
            {tokenOut.symbol === 'SELECT TOKEN' ? '?' : tokenOut.symbol}
          </span>
        </div>
      </div>
      <div className="py-4">
        <div
          className="flex px-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
            {1} {tokenIn.symbol} ={' '}
            {tokenOut.symbol === 'Select Token' || isNaN(parseFloat(coverPrice))
              ? '?'
              : invertPrice(coverPrice, tokenOrder) + ' ' + tokenOut.symbol}
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
      <div className="mb-3" key={allowance}>
        {isConnected &&
        Number(allowance) < Number(ethers.utils.formatUnits(bnInput, 18)) &&
        stateChainName === 'arbitrumGoerli' ? (
          <SwapCoverApproveButton
            disabled={isDisabled}
            poolAddress={coverPoolRoute}
            approveToken={tokenIn.address}
          />
        ) : stateChainName === 'arbitrumGoerli' ? (
          <CoverMintButton
            poolAddress={coverPoolRoute}
            disabled={isDisabled}
            to={address}
            lower={lowerTick}
            claim={tokenOrder ? upperTick : lowerTick}
            upper={upperTick}
            amount={bnInput}
            zeroForOne={tokenOrder}
            tickSpacing={tickSpread}
          />
        ) : null}
      </div>
    </>
  )
}
