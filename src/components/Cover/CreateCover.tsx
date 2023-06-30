import {
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  InformationCircleIcon,
} from '@heroicons/react/20/solid'
import SelectToken from '../SelectToken'
import {
  erc20ABI,
  useAccount,
  useProvider,
  useContractRead,
  useSigner,
} from 'wagmi'
import CoverMintButton from '../Buttons/CoverMintButton'
import { chainIdsToNamesForGitTokenList } from '../../utils/chains'
import { Listbox, Transition } from '@headlessui/react'
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton'
import { Fragment, useEffect, useState } from 'react'
import useInputBox from '../../hooks/useInputBox'
import { tokenOneAddress } from '../../constants/contractAddresses'
import { TickMath, invertPrice, roundTick } from '../../utils/math/tickMath'
import { BigNumber, ethers } from 'ethers'
import { useCoverStore } from '../../hooks/useStore'
import { getCoverPoolFromFactory } from '../../utils/queries'
import JSBI from 'jsbi'
import SwapCoverApproveButton from '../Buttons/SwapCoverApproveButton'
import { useRouter } from 'next/router'
import { BN_ZERO, ZERO, ZERO_ADDRESS } from '../../utils/math/constants'
import { DyDxMath } from '../../utils/math/dydxMath'
import { getBalances } from '../../utils/balances'
import { token } from '../../utils/types'
import { feeTiers, getCoverPoolInfo } from '../../utils/pools'
import { fetchTokenPrices, switchDirection } from '../../utils/tokens'
import inputFilter from '../../utils/inputFilter'
import CoverMintApproveButton from '../Buttons/CoverMintApproveButton'
import TickSpacing from '../Tooltips/TickSpacing'
import { gasEstimateCoverMint } from '../../utils/gas'

export default function CreateCover(props: any) {
  const router = useRouter()
  const { data: signer } = useSigner()
  const [pool, setPool] = useState(props.query ?? undefined)
  const initialBig = BigNumber.from(0)
  const { bnInput, inputBox, maxBalance } = useInputBox()
  const [validBounds, setValidBounds] = useState(false)
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
  const [showTooltip, setShowTooltip] = useState(false)
  const [tokenIn, setTokenIn] = useState({
    symbol: props.query ? props.query.tokenZeroSymbol : 'WETH',
    logoURI: props.query
      ? props.query.tokenZeroLogoURI
      : '/static/images/eth_icon.png',
    address: props.query
      ? props.query.tokenZeroAddress
      : '0x6774be1a283Faed7ED8e40463c40Fb33A8da3461',
  } as token)
  const [tokenOut, setTokenOut] = useState({
    symbol: props.query ? props.query.tokenOneSymbol : 'Select Token',
    logoURI: props.query ? props.query.tokenOneLogoURI : '',
    address: props.query ? props.query.tokenOneAddress : '',
  } as token)
  const [coverPrice, setCoverPrice] = useState(undefined)
  const [buttonState, setButtonState] = useState('')
  const [coverAmountIn, setCoverAmountIn] = useState(ZERO)
  const [coverAmountOut, setCoverAmountOut] = useState(ZERO)
  const [coverPoolRoute, setCoverPoolRoute] = useState(undefined)
  const [tokenOrder, setTokenOrder] = useState(
    tokenIn.address.localeCompare(tokenOut.address) < 0,
  )
  const [tokenInUsdPrice, setTokenInUsdPrice] = useState(1)
  const [tickSpread, setTickSpread] = useState(
    props.query ? props.query.tickSpacing : 20,
  )
  const [feeTier, setFeeTier] = useState(props.query?.feeTier ?? 0.01)
  const [auctionLength, setAuctionLength] = useState(
    props.query?.auctionLength ?? 0,
  )

  const [volatility, setVolatility] = useState(
    (parseFloat(tickSpread) * (60 / parseFloat(auctionLength))).toFixed(2),
  )

  console.log(
    'volatility check',
    tickSpread,
    auctionLength,
    tickSpread * (60 / auctionLength),
  )

  function updateSelectedFeeTier(): any {
    if (feeTier == 0.01) {
      return feeTiers[0]
    } else if (feeTier == 0.05) {
      return feeTiers[1]
    } else if (feeTier == 0.3) {
      return feeTiers[2]
    } else if (feeTier == 1) {
      return feeTiers[3]
    } else return feeTiers[0]
  }
  const [mintGasFee, setMintGasFee] = useState('$0.00')
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO)

  /////////////////

  const { data: allowanceIn } = useContractRead({
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
      //console.log('Success')
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      /* console.log('Allowance Settled', {
        data,
        error,
        coverPoolRoute,
        tokenIn,
        tokenOut,
      }) */
    },
  })

  //////////////////

  useEffect(() => {
    setTimeout(() => {
      if (allowanceIn)
        if (address != '0x' && coverPoolRoute != ZERO_ADDRESS) {
          setAllowance(ethers.utils.formatUnits(allowanceIn, 18))
        }
    }, 50)
  }, [allowanceIn, tokenIn.address, bnInput])

  const {
    network: { chainId },
  } = useProvider()

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId])
  }, [chainId])

  useEffect(() => {
    updateBalances()
    setTokenOrder(tokenIn.address.localeCompare(tokenOut.address) < 0)
  }, [tokenOut, tokenIn])

  async function updateBalances() {
    await getBalances(address, false, tokenIn, tokenOut, setBalance0, () => {})
  }

  useEffect(() => {
    fetchTokenPrices(coverPrice, setMktRate)
  }, [coverPrice])

  useEffect(() => {
    setParams(router.query)
  }, [router])

  useEffect(() => {
    getCoverPoolInfo(
      tokenOrder,
      tokenIn,
      tokenOut,
      tickSpread,
      setCoverPoolRoute,
      setCoverPrice,
      setTokenInUsdPrice,
      setLatestTick,
      lowerPrice,
      upperPrice,
      setLowerPrice,
      setUpperPrice,
    )
  }, [hasSelected, tokenIn.address, tokenOut.address, tokenOrder])

  // disabled messages
  useEffect(() => {
    if (!validBounds) {
      setButtonState('bounds')
    }
    if (parseFloat(lowerPrice) >= parseFloat(upperPrice)) {
      setButtonState('price')
    }
    if (Number(ethers.utils.formatUnits(bnInput)) === 0) {
      setButtonState('amount')
    }
    if (hasSelected == false) {
      setButtonState('token')
    }
  }, [bnInput, hasSelected, validBounds, lowerPrice, upperPrice])

  // set disabled
  useEffect(() => {
    const disabledFlag =
      isNaN(parseFloat(lowerPrice)) ||
      isNaN(parseFloat(upperPrice)) ||
      lowerTick.gte(upperTick) ||
      Number(ethers.utils.formatUnits(bnInput)) === 0 ||
      tokenOut.symbol === 'Select Token' ||
      hasSelected == false ||
      !validBounds ||
      parseFloat(mintGasFee) == 0
    console.log('disabled flag check', disabledFlag)
    setDisabled(disabledFlag)
    if (!disabledFlag) {
      updateGasFee()
    }
  }, [
    lowerPrice,
    upperPrice,
    lowerTick,
    mintGasFee,
    upperTick,
    bnInput,
    tokenOut,
    hasSelected,
    validBounds,
  ])

  // set amount in
  useEffect(() => {
    if (!bnInput.eq(BN_ZERO)) {
      setCoverAmountIn(JSBI.BigInt(bnInput.toString()))
    }
    changeValidBounds()
  }, [bnInput, lowerTick, upperTick, tokenOrder])

  useEffect(() => {
    if (!isNaN(parseFloat(lowerPrice))) {
      setLowerTick(
        BigNumber.from(TickMath.getTickAtPriceString(lowerPrice, tickSpread)),
      )
    }
    if (!isNaN(parseFloat(upperPrice))) {
      setUpperTick(
        BigNumber.from(TickMath.getTickAtPriceString(upperPrice, tickSpread)),
      )
    }
  }, [lowerPrice, upperPrice])

  useEffect(() => {
    changeCoverAmounts(true)
  }, [coverAmountIn])

  //////////////////////

  const changePrice = (direction: string, inputId: string) => {
    if (!tickSpread) return
    const currentTick =
      inputId == 'minInput' || inputId == 'maxInput'
        ? inputId == 'minInput'
          ? Number(lowerTick)
          : Number(upperTick)
        : latestTick
    const increment = tickSpread
    const adjustment =
      direction == 'plus' || direction == 'minus'
        ? direction == 'plus'
          ? -increment
          : increment
        : 0
    const newTick = roundTick(currentTick - adjustment, increment)
    const newPriceString = TickMath.getPriceStringAtTick(newTick)
    ;(document.getElementById(inputId) as HTMLInputElement).value = Number(
      newPriceString,
    ).toFixed(6)
    if (inputId === 'maxInput') {
      setUpperTick(BigNumber.from(newTick))
      setUpperPrice(newPriceString)
    }
    if (inputId === 'minInput') {
      setLowerTick(BigNumber.from(newTick))
      setLowerPrice(newPriceString)
    }
  }

  const changeValidBounds = () => {
    console.log(
      'changing valid bounds',
      tokenOrder ? lowerTick.lt(latestTick) : upperTick.gt(latestTick),
    )
    setValidBounds(
      tokenOrder
        ? lowerTick.lt(
            BigNumber.from(latestTick).sub(BigNumber.from(tickSpread)),
          )
        : upperTick.gt(
            BigNumber.from(latestTick).add(BigNumber.from(tickSpread)),
          ),
    )
  }

  async function updateGasFee() {
    const newMintGasFee = await gasEstimateCoverMint(
      coverPoolRoute,
      address,
      Number(upperTick.toString()),
      Number(lowerTick.toString()),
      tokenIn,
      tokenOut,
      coverAmountIn,
      tickSpread,
      signer,
    )
    console.log('mint gas estimate', newMintGasFee.gasUnits.toString())
    setMintGasFee(newMintGasFee.formattedPrice)
    if (newMintGasFee.gasUnits.gt(BN_ZERO)) {
      setMintGasLimit(newMintGasFee.gasUnits.mul(120).div(100))
    }
  }

  function setParams(query: any) {
    setPool({
      poolId: query.poolId,
    })
  }

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Mininum filled</div>
            <div className="ml-auto text-xs">
              {(
                parseFloat(
                  ethers.utils.formatUnits(String(coverAmountOut), 18),
                ) *
                (1 - tickSpread / 10000)
              ).toPrecision(5) +
                ' ' +
                tokenOut.symbol}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            <div className="ml-auto text-xs">{mintGasFee}</div>
          </div>
        </div>
      )
    }
  }

  function changeCoverAmounts(amountInChanged: boolean) {
    if (
      !isNaN(parseFloat(lowerPrice)) &&
      !isNaN(parseFloat(upperPrice)) &&
      parseFloat(lowerPrice) > 0 &&
      parseFloat(upperPrice) > 0 &&
      parseFloat(lowerPrice) < parseFloat(upperPrice)
    ) {
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(Number(lowerTick))
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(Number(upperTick))
      if (amountInChanged) {
        // amountIn changed
        console.log('amount in check', String(coverAmountIn))
        const liquidityAmount = DyDxMath.getLiquidityForAmounts(
          lowerSqrtPrice,
          upperSqrtPrice,
          tokenOrder ? lowerSqrtPrice : upperSqrtPrice,
          tokenOrder ? BN_ZERO : BigNumber.from(String(coverAmountIn)),
          tokenOrder ? BigNumber.from(String(coverAmountIn)) : BN_ZERO,
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

  const volatilityTiers = [
    {
      id: 0,
      tier: '1.7% per min',
      text: 'Best for most pairs',
      unavailable: false,
    },
    {
      id: 1,
      tier: '2.4% per min',
      text: 'Best for most pairs',
      unavailable: false,
    },
  ]

  const [selected, setSelected] = useState(volatilityTiers[0])

  function SelectVolatility() {
    return (
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1 w-full">
          <Listbox.Button className="relative cursor-default rounded-lg bg-black text-white cursor-pointer border border-grey1 py-2 pl-3 w-full text-left shadow-md focus:outline-none">
            <span className="block truncate">{selected.tier}</span>
            <span className="block truncate text-xs text-grey mt-1">
              {selected.text}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon className="w-7 text-grey" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 z-50 max-h-60 w-full overflow-auto rounded-md bg-black border border-grey1 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {volatilityTiers.map((volatilityTier, volatilityTierIdx) => (
                <Listbox.Option
                  key={volatilityTierIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-4 cursor-pointer ${
                      active ? 'opacity-80 bg-dark' : 'opacity-100'
                    }`
                  }
                  value={volatilityTier}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate text-white ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {volatilityTier.tier}
                      </span>
                      <span
                        className={`block truncate text-grey text-xs mt-1 ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {volatilityTier.text}
                      </span>
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
            type="in"
            selected={hasSelected}
            setHasSelected={setHasSelected}
            tokenIn={tokenIn}
            setTokenIn={setTokenIn}
            tokenOut={tokenOut}
            setTokenOut={setTokenOut}
            displayToken={tokenIn}
            balance={setQueryTokenIn}
            queryTokenIn={queryTokenIn}
            queryTokenOut={queryTokenOut}
            setQueryTokenIn={setQueryTokenIn}
            setQueryTokenOut={setQueryTokenOut}
            key={queryTokenIn + 'in'}
          />
          <div className="items-center px-2 py-2 m-auto border border-[#1E1E1E] z-30 bg-black rounded-lg cursor-pointer">
            <ArrowLongRightIcon
              className="w-6 cursor-pointer"
              onClick={() => {
                if (hasSelected) {
                  switchDirection(
                    tokenOrder,
                    setTokenOrder,
                    tokenIn,
                    setTokenIn,
                    tokenOut,
                    setTokenOut,
                    queryTokenIn,
                    setQueryTokenIn,
                    queryTokenOut,
                    setQueryTokenOut,
                  )
                }
              }}
            />
          </div>
          <SelectToken
            type="out"
            selected={hasSelected}
            setHasSelected={setHasSelected}
            tokenIn={tokenIn}
            setTokenIn={setTokenIn}
            tokenOut={tokenOut}
            setTokenOut={setTokenOut}
            displayToken={tokenOut}
            balance={setQueryTokenOut}
            queryTokenIn={queryTokenIn}
            queryTokenOut={queryTokenOut}
            setQueryTokenIn={setQueryTokenIn}
            setQueryTokenOut={setQueryTokenOut}
            key={queryTokenOut + 'out'}
          />
        </div>
      </div>
      <h1 className="mb-3">How much do you want to Cover?</h1>
      <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
        <div className="flex-col justify-center w-1/2 p-2 ">
          {inputBox('0')}
          <div className="flex text-xs text-[#4C4C4C]">
            $
            {(
              parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
              tokenInUsdPrice
            ).toFixed(2)}
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
              parseFloat(
                parseFloat(ethers.utils.formatUnits(String(coverAmountOut), 18))
                  .toPrecision(6)
                  .replace(/0+$/, '')
                  .replace(/(\.)(?!\d)/g, ''),
              )
            ) : (
              <>?</>
            )}{' '}
            {tokenOut.symbol}
          </div>
        </div>
      </div>
      <div className="gap-x-4 mt-5">
        <div>
          <h1>Volatility tier</h1>
        </div>
        <div className="mt-3">
          <SelectVolatility />
        </div>
      </div>
      <div className="flex items-center w-full mb-3 mt-4 gap-x-2 relative">
        <h1 className="">Set Price Range</h1>
        <InformationCircleIcon
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-5 h-5 mt-[1px] text-grey cursor-pointer"
        />
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="absolute mt-32 pt-8"
        >
          {showTooltip ? <TickSpacing /> : null}
        </div>
      </div>
      <div className="flex justify-between w-full gap-x-6">
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Min. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice('minus', 'minInput')}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              autoComplete="off"
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="minInput"
              type="text"
              value={lowerPrice}
              onChange={() =>
                setLowerPrice(
                  inputFilter(
                    (document.getElementById('minInput') as HTMLInputElement)
                      ?.value,
                  ),
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
              autoComplete="off"
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="maxInput"
              type="text"
              value={upperPrice}
              onChange={() =>
                setUpperPrice(
                  inputFilter(
                    (document.getElementById('maxInput') as HTMLInputElement)
                      ?.value,
                  ),
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
              ? '?' + ' ' + tokenOut.symbol
              : parseFloat(
                  parseFloat(invertPrice(coverPrice, tokenOrder)).toPrecision(
                    6,
                  ),
                ) +
                ' ' +
                tokenOut.symbol}
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
          <CoverMintApproveButton
            disabled={false}
            poolAddress={coverPoolRoute}
            approveToken={tokenIn.address}
            amount={bnInput}
            tokenSymbol={tokenIn.symbol}
            allowance={allowance}
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
            buttonState={buttonState}
            gasLimit={mintGasLimit}
          />
        ) : null}
      </div>
    </>
  )
}
