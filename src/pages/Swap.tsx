import {
  AdjustmentsHorizontalIcon,
  ArrowSmallDownIcon,
} from '@heroicons/react/24/outline'
import { useState, useEffect, Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/20/solid'
import SelectToken from '../components/SelectToken'
import useInputBox from '../hooks/useInputBox'
import { ConnectWalletButton } from '../components/Buttons/ConnectWalletButton'
import {
  erc20ABI,
  useAccount,
  useSigner,
  useProvider,
  useContractRead,
} from 'wagmi'
import {
  tokenZeroAddress,
  tokenOneAddress,
} from '../constants/contractAddresses'
import { BigNumber, ethers } from 'ethers'
import { chainIdsToNamesForGitTokenList } from '../utils/chains'
import { coverPoolABI } from '../abis/evm/coverPool'
import { fetchCoverPools, fetchRangePools } from '../utils/queries'
import SwapRangeApproveButton from '../components/Buttons/SwapRangeApproveButton'
import SwapRangeButton from '../components/Buttons/SwapRangeButton'
import SwapCoverApproveButton from '../components/Buttons/SwapCoverApproveButton'
import SwapCoverButton from '../components/Buttons/SwapCoverButton'
import { rangePoolABI } from '../abis/evm/rangePool'
import {
  TickMath,
  invertPrice,
  maxPriceBn,
  minPriceBn,
} from '../utils/math/tickMath'
import { BN_ZERO } from '../utils/math/constants'
import { gasEstimateSwap, gasEstimateSwapLimit } from '../utils/gas'
import { token } from '../utils/types'
import { getCoverPool, getRangePool } from '../utils/pools'
import { getBalances } from '../utils/balances'
import inputFilter from '../utils/inputFilter'
import RangeLimitSwapButton from '../components/Buttons/RangeLimitSwapButton'
import SwapRangeDoubleApproveButton from '../components/Buttons/SwapRangeDoubleApproveButton'

export default function Swap() {
  const { address, isDisconnected, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const {
    network: { chainId },
  } = useProvider()
  const {
    bnInput,
    inputBox,
    maxBalance,
    setBnInput,
    setDisplay,
  } = useInputBox()

  const [gasFee, setGasFee] = useState('0')
  const [mintFee, setMintFee] = useState('0')
  const [coverQuote, setCoverQuote] = useState(0)
  const [rangeQuote, setRangeQuote] = useState(0)
  const [coverPrice, setCoverPrice] = useState(0)
  const [rangePrice, setRangePrice] = useState(0)
  const [hasSelected, setHasSelected] = useState(false)
  const [tokenIn, setTokenIn] = useState({
    symbol: 'WETH',
    logoURI: '/static/images/eth_icon.png',
    address: tokenOneAddress,
    usdPrice: 0,
  } as token)
  const [tokenOut, setTokenOut] = useState({
    symbol: 'Select Token',
    logoURI: '',
    address: tokenZeroAddress,
    usdPrice: 0,
  } as token)
  const [ethUsdPrice, setEthUsdPrice] = useState(0)
  const [queryTokenIn, setQueryTokenIn] = useState(tokenZeroAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [slippage, setSlippage] = useState('0.5')
  const [coverSlippage, setCoverSlippage] = useState('0.5')
  const [rangeSlippage, setRangeSlippage] = useState('0.5')
  const [auxSlippage, setAuxSlippage] = useState('0.5')
  const [balanceIn, setBalanceIn] = useState('0.00')
  const [balanceOut, setBalanceOut] = useState('0.00')
  const [stateChainName, setStateChainName] = useState()
  const [LimitActive, setLimitActive] = useState(false)
  const [tokenOrder, setTokenOrder] = useState(
    tokenIn.address.localeCompare(tokenOut.address) < 0,
  )
  const [expanded, setExpanded] = useState(false)
  const [allowanceRange, setAllowanceRange] = useState('0.00')
  const [allowanceCover, setAllowanceCover] = useState('0.00')
  const [coverPoolRoute, setCoverPoolRoute] = useState(undefined)
  const [rangePoolRoute, setRangePoolRoute] = useState(undefined)
  const [rangeTickSpacing, setRangeTickSpacing] = useState(undefined)
  const [coverPriceAfter, setCoverPriceAfter] = useState(undefined)
  const [rangePriceAfter, setRangePriceAfter] = useState(undefined)
  const [coverBnPrice, setCoverBnPrice] = useState(BigNumber.from(0))
  const [rangeBnPrice, setRangeBnPrice] = useState(BigNumber.from(0))
  const [coverBnBaseLimit, setCoverBnBaseLimit] = useState(BigNumber.from(0))
  const [rangeBnBaseLimit, setRangeBnBaseLimit] = useState(BigNumber.from(0))
  const [rangeBnPriceLimit, setRangeBnPriceLimit] = useState(BN_ZERO)
  const [coverBnPriceLimit, setCoverBnPriceLimit] = useState(BN_ZERO)
  const [slippageFetched, setSlippageFetched] = useState(false)
  const [limitPrice, setLimitPrice] = useState('0')
  const [allowanceRangeOut, setAllowanceRangeOut] = useState('0.00')
  const [lowerTick, setLowerTick] = useState(BN_ZERO)
  const [upperTick, setUpperTick] = useState(BN_ZERO)
  const [limitPriceSwitch, setLimitPriceSwitch] = useState(false)
  const [limitOrderPrice, setLimitOrderPrice] = useState('0')

  ////////////////////////////////ChainId

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId])
  }, [chainId])

  ////////////////////////////////Pools and Balances

  useEffect(() => {
    if (hasSelected) {
      updatePools()
      setTokenOrder(tokenIn.address.localeCompare(tokenOut.address) < 0)
    }
    if (isConnected) {
      updateBalances()
    }
  }, [tokenOut.address, tokenIn.address, hasSelected, isConnected])

  useEffect(() => {
    if (rangeBnPrice) {
      if (!rangeBnPrice.eq(BN_ZERO)) {
        const baseLimit = rangeBnPrice
          .mul(parseFloat((parseFloat(slippage) * 100).toFixed(6)))
          .div(10000)
        setRangeBnBaseLimit(baseLimit)
      }
    }
  }, [
    bnInput,
    tokenIn.address,
    tokenOut.address,
    coverPoolRoute,
    rangePoolRoute,
  ])

  async function updatePools() {
    await getRangePool(
      tokenIn,
      tokenOut,
      setRangePoolRoute,
      setRangeTickSpacing,
      setTokenIn,
      setTokenOut,
      setEthUsdPrice,
    )
    await getCoverPool(tokenIn, tokenOut, setCoverPoolRoute)
  }

  async function updateBalances() {
    await getBalances(
      address,
      hasSelected,
      tokenIn,
      tokenOut,
      setBalanceIn,
      setBalanceOut,
    )
  }

  ////////////////////////////////Allowances

  const { data: allowanceInRange } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, rangePoolRoute],
    chainId: 421613,
    watch: true,
    enabled: isConnected && rangePoolRoute != undefined,
    onError(error) {
      console.log('Error allowance', error)
    },
    onSuccess(data) {
      console.log('Success allowance', data)
    },
  })

  const { data: allowanceOutRange } = useContractRead({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, rangePoolRoute],
    chainId: 421613,
    watch: true,
    enabled: isConnected && rangePoolRoute != undefined && LimitActive == true,
    onError(error) {
      console.log('Error allowance out', error)
    },
    onSuccess(data) {
      console.log('Success allowance out', data)
    },
  })

  const { data: allowanceInCover } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, coverPoolRoute],
    chainId: 421613,
    watch: true,
    enabled: isConnected && coverPoolRoute != undefined,
    onError(error) {
      console.log('Error allowance', error)
    },
    onSuccess(data) {
      console.log('Success allowance', data)
    },
  })

  useEffect(() => {
    if (allowanceInRange && allowanceInCover) {
      setAllowanceRange(ethers.utils.formatUnits(allowanceInRange, 18))
      setAllowanceCover(ethers.utils.formatUnits(allowanceInCover, 18))
    }

    if (LimitActive && allowanceOutRange) {
      setAllowanceRangeOut(ethers.utils.formatUnits(allowanceOutRange, 18))
    }
  }, [allowanceInRange, allowanceInCover, tokenIn.address, LimitActive])

  ////////////////////////////////Prices

  const { data: priceRange } = useContractRead({
    address: rangePoolRoute,
    abi: rangePoolABI,
    functionName: 'poolState',
    args: [],
    chainId: 421613,
    watch: true,
    enabled: rangePoolRoute != undefined,
    onError(error) {
      console.log('Error price Range', error)
    },
    onSettled(data, error) {
      console.log('Settled price Range', { data, error })
    },
  })

  const { data: priceCover } = useContractRead({
    address: coverPoolRoute,
    abi: coverPoolABI,
    functionName: tokenOrder ? 'pool1' : 'pool0',
    args: [],
    chainId: 421613,
    watch: true,
    enabled: coverPoolRoute != undefined,
    onError(error) {
      console.log('Error price Cover', error)
    },
    onSettled(data, error) {
      console.log('Settled price Cover', { data, error })
    },
  })

  useEffect(() => {
    if (priceCover) {
      if (
        priceCover[0].gt(BN_ZERO) &&
        tokenIn.address != '' &&
        tokenOut.address != '' &&
        priceCover != undefined
      ) {
        setCoverPrice(
          parseFloat(TickMath.getPriceStringAtSqrtPrice(priceCover[0])),
        )
      }
    }

    if (priceRange) {
      if (
        priceRange[5].gt(BN_ZERO) &&
        tokenIn.address != '' &&
        tokenOut.address != '' &&
        priceRange != undefined
      ) {
        setRangePrice(
          parseFloat(
            TickMath.getPriceStringAtSqrtPrice(priceRange[5])
          ),
        )
        if (parseFloat(limitPrice) == 0)
        setLimitPrice(
          parseFloat(
            TickMath.getPriceStringAtSqrtPrice(priceRange[5])
          ).toPrecision(5)
        )
      }
    }
  }, [coverPoolRoute, rangePoolRoute, priceCover, priceRange])

  useEffect(() => {
    if (coverPrice) {
      if (coverPrice !== 0) {
        setCoverBnPrice(ethers.utils.parseEther(coverPrice.toString()))
      }
    }

    if (rangePrice) {
      if (rangePrice !== 0) {
        setRangeBnPrice(ethers.utils.parseEther(rangePrice.toString()))
      }
    }
  }, [coverPrice, rangePrice])

  useEffect(() => {
    if (coverBnPrice) {
      if (!coverBnPrice.eq(BN_ZERO)) {
        const baseLimit = coverBnPrice
          .mul(parseFloat((parseFloat(slippage) * 100).toFixed(6)))
          .div(10000)
        setCoverBnBaseLimit(baseLimit)
      }
    }
  }, [slippage, rangeBnPrice, coverBnPrice])

  //limit price for limit Tab
  useEffect(() => {
    setLimitOrderPrice(
      limitPriceSwitch
        ? (tokenIn.usdPrice / tokenOut.usdPrice).toFixed(10)
        : (tokenOut.usdPrice / tokenIn.usdPrice).toFixed(10),
    )
  }, [tokenIn, tokenOut, limitPriceSwitch])

  ////////////////////////////////Quotes

  const { data: quoteRange } = useContractRead({
    address: rangePoolRoute,
    abi: rangePoolABI,
    functionName: 'quote',
    args: [tokenOrder, bnInput, tokenOrder ? minPriceBn : maxPriceBn],
    chainId: 421613,
    watch: true,
    enabled: rangePoolRoute != undefined,
    onError(error) {
      console.log('Error range wagmi', error)
    },
    onSettled(data, error) {
      console.log('Settled range wagmi', { data, error })
    },
  })

  const { data: quoteCover } = useContractRead({
    address: coverPoolRoute,
    abi: coverPoolABI,
    functionName: 'quote',
    args: [tokenOrder, bnInput, tokenOrder ? minPriceBn : maxPriceBn],
    chainId: 421613,
    watch: true,
    enabled: coverPoolRoute != undefined,
    onError(error) {
      console.log('Error cover wagmi', error)
    },
    onSettled(data, error) {
      console.log('Settled', { data, error })
    },
  })

  useEffect(() => {
    if (quoteRange) {
      if (
        quoteRange[0].gt(BN_ZERO) &&
        quoteRange[1].gt(BN_ZERO) &&
        !bnInput.eq(BN_ZERO)
      ) {
        setRangeQuote(
          parseFloat(ethers.utils.formatUnits(quoteRange[1], 18)) /
            parseFloat(ethers.utils.formatUnits(quoteRange[0], 18)),
        )
        const priceAfter = parseFloat(
          TickMath.getPriceStringAtSqrtPrice(quoteRange[2]),
        )
        setRangePriceAfter(priceAfter)
        const priceSlippage = parseFloat(
          ((priceAfter * parseFloat(slippage) * 100) / 10000).toFixed(6),
        )
        const priceAfterSlippage = String(
          priceAfter - (tokenOrder ? priceSlippage : -priceSlippage),
        )
        const rangePriceLimit = TickMath.getSqrtPriceAtPriceString(
          priceAfterSlippage,
        )
        setRangeBnPriceLimit(BigNumber.from(String(rangePriceLimit)))
      }
    }

    if (quoteCover) {
      if (
        quoteCover[0].gt(BN_ZERO) &&
        quoteCover[1].gt(BN_ZERO) &&
        !bnInput.eq(BN_ZERO)
      ) {
        setCoverQuote(
          parseFloat(ethers.utils.formatUnits(quoteCover[1], 18)) /
            parseFloat(ethers.utils.formatUnits(quoteCover[0], 18)),
        )
        const priceAfter = parseFloat(
          TickMath.getPriceStringAtSqrtPrice(quoteCover[2]),
        )
        const priceSlippage = parseFloat(
          ((priceAfter * parseFloat(slippage) * 100) / 10000).toFixed(6),
        )
        const priceAfterSlippage = String(
          priceAfter - (tokenOrder ? priceSlippage : -priceSlippage),
        )
        setCoverPriceAfter(priceAfter)
        const coverPriceLimit = TickMath.getSqrtPriceAtPriceString(
          priceAfterSlippage,
        )
        setCoverBnPriceLimit(BigNumber.from(String(coverPriceLimit)))
      }
    }
    if (quoteCover && quoteRange) {
      if (
        slippageFetched === false &&
        quoteCover[0].gt(BN_ZERO) &&
        quoteRange[0].gt(BN_ZERO)
      ) {
        updateTierFee()
        getSlippage()
        setSlippageFetched(true)
      }
    }
  }, [quoteCover, quoteRange, bnInput, slippage])

  async function updateTierFee() {
    await getFeeTier()
  }

  const getFeeTier = async () => {
    const coverData = await fetchCoverPools()
    const coverPoolAddress = coverData['data']['coverPools']['0']['id']

    if (coverPoolAddress === coverPoolRoute) {
      const feeTier =
        coverData['data']['coverPools']['0']['volatilityTier']['feeAmount']
      setCoverSlippage((parseFloat(feeTier) / 10000).toString())
    }
    const data = await fetchRangePools()
    const rangePoolAddress = data['data']['rangePools']['0']['id']

    if (rangePoolAddress === rangePoolRoute) {
      const feeTier = data['data']['rangePools']['0']['feeTier']['feeAmount']
      setRangeSlippage((parseFloat(feeTier) / 10000).toString())
    }
  }

  const getSlippage = () => {
    if (rangeQuote > coverQuote) {
      setSlippage(rangeSlippage)
      setAuxSlippage(rangeSlippage)
    } else {
      setSlippage(coverSlippage)
      setAuxSlippage(coverSlippage)
    }
  }

  ////////////////////////////////Limit Ticks

  useEffect(() => {
    if (
      !isNaN(parseFloat(limitPrice)) &&
      !isNaN(parseFloat(slippage)) &&
      !isNaN(parseInt(rangeTickSpacing))
    )
      updateLimitTicks()
  }, [limitPrice, slippage])

  function updateLimitTicks() {
    if (parseFloat(slippage) * 100 > rangeTickSpacing) {
      const limitPriceTolerance =
        (parseFloat(limitPrice) *
          parseFloat((parseFloat(slippage) * 100).toFixed(6))) /
        10000
      if (tokenOrder) {
        const endPrice = parseFloat(limitPrice) - -limitPriceTolerance
        setLowerTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(limitPrice, rangeTickSpacing),
          ),
        )
        setUpperTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(String(endPrice), rangeTickSpacing),
          ),
        )
      } else {
        const endPrice = parseFloat(limitPrice) - limitPriceTolerance
        setLowerTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(String(endPrice), rangeTickSpacing),
          ),
        )
        setUpperTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(limitPrice, rangeTickSpacing),
          ),
        )
      }
    } else {
      if (tokenOrder) {
        const endTick =
          TickMath.getTickAtPriceString(limitPrice, rangeTickSpacing) -
          -rangeTickSpacing
        setLowerTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(limitPrice, rangeTickSpacing),
          ),
        )
        setUpperTick(BigNumber.from(String(endTick)))
      } else {
        const endTick =
          TickMath.getTickAtPriceString(limitPrice, rangeTickSpacing) -
          rangeTickSpacing
        setLowerTick(BigNumber.from(String(endTick)))
        setUpperTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(limitPrice, rangeTickSpacing),
          ),
        )
      }
    }
  }
  ////////////////////////////////Fees

  useEffect(() => {
    if (!bnInput.eq(BN_ZERO)) {
      if (!LimitActive) {
        updateGasFee()
      } else {
        updateMintFee()
      }
    }
  }, [
    bnInput,
    tokenIn.address,
    tokenOut.address,
    coverPoolRoute,
    rangePoolRoute,
    LimitActive,
  ])

  async function updateGasFee() {
    const newGasFee = await gasEstimateSwap(
      rangePoolRoute,
      coverPoolRoute,
      rangeQuote,
      coverQuote,
      rangeBnPrice,
      rangeBnBaseLimit,
      tokenIn,
      tokenOut,
      bnInput,
      ethers.utils.parseUnits(allowanceRange, 18),
      ethers.utils.parseUnits(allowanceRange, 18),
      ethUsdPrice,
      address,
      signer,
      isConnected,
    )
    setGasFee(newGasFee)
  }

  async function updateMintFee() {
    const newMintFee = await gasEstimateSwapLimit(
      rangePoolRoute,
      address,
      rangePrice,
      rangeBnPrice,
      rangeBnBaseLimit,
      tokenIn,
      tokenOut,
      bnInput,
      rangeTickSpacing,
      signer,
    )
    setMintFee(newMintFee)
  }
  ////////////////////////////////

  function switchDirection() {
    setTokenOrder(!tokenOrder)
    const temp = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(temp)
    const tempBal = queryTokenIn
    setQueryTokenIn(queryTokenOut)
    setQueryTokenOut(tempBal)
    setBnInput(
      ethers.utils.parseUnits(
        (rangeQuote > coverQuote ? rangeQuote : coverQuote).toPrecision(10),
        18,
      ),
    )
    setDisplay(
      (rangeQuote > coverQuote ? rangeQuote : coverQuote)
        .toPrecision(7)
        .replace(/0+$/, '')
        .replace(/(\.)(?!\d)/g, ''),
    )
    if (rangeQuote > 0 && rangeQuote > coverQuote) {
      setRangeQuote(
        parseFloat(
          parseFloat(ethers.utils.formatUnits(bnInput, 18)).toPrecision(5),
        ),
      )
    } else {
      setCoverQuote(
        parseFloat(
          parseFloat(ethers.utils.formatUnits(bnInput, 18)).toPrecision(5),
        ),
      )
    }
    const oldBalanceIn = balanceIn
    setBalanceIn(balanceOut)
    setBalanceOut(oldBalanceIn)
    if (!LimitActive) {
      console.log('lower upper tick')
    }
  }

  ////////////////////////////////

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div className="ml-auto text-xs">
              {hasSelected
                ? !LimitActive
                  ? rangeQuote > coverQuote
                    ? rangeQuote === 0
                      ? '0'
                      : (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          rangeQuote
                        ).toFixed(2)
                    : coverQuote === 0
                    ? '0'
                    : (
                        parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                        coverQuote
                      ).toFixed(2)
                  : parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) == 0
                  ? '0'
                  : (
                      parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                      parseFloat(limitPrice)
                    ).toFixed(2)
                : 'Select Token'}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            {!LimitActive ? (
              <div className="ml-auto text-xs">{gasFee}</div>
            ) : (
              <div className="ml-auto text-xs">{mintFee}</div>
            )}
          </div>
          {!LimitActive ? (
            <div className="flex p-1">
              <div className="text-xs text-[#4C4C4C]">
                Minimum received after slippage ({slippage}%)
              </div>
              <div className="ml-auto text-xs">
                {hasSelected
                  ? !LimitActive
                    ? rangeQuote > coverQuote
                      ? rangeQuote === 0
                        ? '0'
                        : (
                            parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                              rangeQuote -
                            parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                              rangeQuote *
                              (parseFloat(slippage) * 0.01)
                          ).toFixed(2)
                      : coverQuote === 0
                      ? '0'
                      : (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                            coverQuote -
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                            coverQuote *
                            (parseFloat(slippage) * 0.01)
                        ).toFixed(2)
                    : parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) ==
                      0
                    ? '0'
                    : (
                        parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          parseFloat(
                            ethers.utils.formatUnits(rangeBnPrice, 18),
                          ) -
                        parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          parseFloat(
                            ethers.utils.formatUnits(rangeBnPrice, 18),
                          ) *
                          (parseFloat(slippage) * 0.01)
                      ).toFixed(2)
                  : 'Select Token'}
              </div>
            </div>
          ) : (
            <></>
          )}
          {!LimitActive ? (
            <div className="flex p-1">
              <div className="text-xs text-[#4C4C4C]">Price Impact</div>
              <div className="ml-auto text-xs">
                {hasSelected
                  ? rangeQuote > coverQuote
                    ? (
                        Math.abs((rangePrice - rangePriceAfter) * 100) /
                        rangePrice
                      ).toFixed(2) + '%'
                    : (
                        Math.abs((coverPrice - coverPriceAfter) * 100) /
                        coverPrice
                      ).toFixed(2) + '%'
                  : 'Select Token'}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      )
    }
  }
  return (
    <div className="pt-[10vh]">
      <div className="flex flex-col w-full md:max-w-md px-6 pt-5 pb-7 mx-auto bg-black border border-grey2 rounded-xl">
        <div className="flex items-center">
          <div className="flex gap-4 mb-1.5 text-sm">
            <div
              onClick={() => setLimitActive(false)}
              className={`${
                LimitActive
                  ? 'text-grey cursor-pointer'
                  : 'text-white cursor-pointer'
              }`}
            >
              Market
            </div>

            <div
              onClick={() => setLimitActive(true)}
              className={`${
                LimitActive
                  ? 'text-white cursor-pointer'
                  : 'text-grey cursor-pointer'
              }`}
            >
              Limit
            </div>
          </div>
          <div className="ml-auto">
            <Popover className="relative">
              <Popover.Button className="outline-none">
                <AdjustmentsHorizontalIcon className="w-5 h-5 outline-none" />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Popover.Panel className="absolute z-10 ml-14 -mt-[48px] bg-black border border-grey2 rounded-xl p-5">
                  {({ close }) => (
                    <div className="w-full">
                      <h1>
                        {LimitActive ? (
                          <>Range Tolerance</>
                        ) : (
                          <>Slippage Tolerance</>
                        )}
                      </h1>
                      <div className="flex mt-3 gap-x-3">
                        <input
                          autoComplete="off"
                          placeholder="0%"
                          className="bg-dark rounded-xl outline-none border border-grey1 pl-3 placeholder:text-grey1"
                          value={auxSlippage + '%'}
                          onChange={(e) =>
                            setAuxSlippage(
                              parseFloat(
                                e.target.value.replace(/[^\d.-]/g, ''),
                              ) < 100
                                ? e.target.value.replace(/[^\d.-]/g, '')
                                : '',
                            )
                          }
                        />
                        <button
                          className=" w-full py-2.5 px-12 mx-auto text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
                          onClick={async () => {
                            setSlippage(parseFloat(auxSlippage).toFixed(2))
                            close()
                          }}
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  )}
                </Popover.Panel>
              </Transition>
            </Popover>
          </div>
        </div>
        <div className="w-full mt-4 align-middle items-center flex bg-dark border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            {inputBox('0')}
            {tokenIn.address != '' ? (
              <div className="flex">
                <div className="flex text-xs text-[#4C4C4C]">
                  $
                  {(
                    Number(ethers.utils.formatUnits(bnInput, 18)) *
                    tokenIn.usdPrice
                  ).toFixed(2)}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="flex w-1/2">
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
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
                    key={queryTokenIn}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="flex text-xs text-[#4C4C4C]" key={balanceIn}>
                    Balance: {balanceIn === '0.00' ? 0 : balanceIn}
                  </div>
                  {isConnected && stateChainName === 'arbitrumGoerli' ? (
                    <button
                      className="flex text-xs uppercase text-[#C9C9C9]"
                      onClick={() => {
                        maxBalance(balanceIn, '0')
                      }}
                    >
                      Max
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="items-center -mb-2 -mt-2 p-2 m-auto border border-[#1E1E1E] z-30 bg-black rounded-lg cursor-pointer">
          <ArrowSmallDownIcon
            className="w-4 h-4"
            onClick={() => {
              if (hasSelected) {
                switchDirection()
              }
            }}
          />
        </div>
        <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            <div className=" bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none">
              {!LimitActive ? (
                hasSelected && !bnInput.eq(BN_ZERO) ? (
                  <div>
                    {rangeQuote > coverQuote
                      ? (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          rangeQuote
                        ).toFixed(2)
                      : (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          coverQuote
                        ).toFixed(2)}
                  </div>
                ) : (
                  <div>0</div>
                )
              ) : hasSelected &&
                parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) != 0 &&
                bnInput._hex != '0x00' ? (
                <div>
                  {(
                    parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    parseFloat(limitPrice)
                  ).toFixed(2)}
                </div>
              ) : (
                <div>0</div>
              )}
            </div>
            {hasSelected ? (
              <div className="flex">
                <div className="flex text-xs text-[#4C4C4C]">
                  $
                  {!LimitActive
                    ? rangeQuote > coverQuote
                      ? (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          rangeQuote *
                          tokenOut.usdPrice
                        ).toFixed(2)
                      : (
                          parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                          coverQuote *
                          tokenOut.usdPrice
                        ).toFixed(2)
                    : (
                        parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                        parseFloat(limitPrice) *
                        tokenOut.usdPrice
                      ).toFixed(2)}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="flex w-1/2">
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
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
                    key={queryTokenOut}
                  />
                </div>
                {hasSelected ? (
                  <div className="flex items-center justify-end gap-2 px-1 mt-2">
                    <div className="flex text-xs text-[#4C4C4C]">
                      Balance: {balanceOut === '0.00' ? 0 : balanceOut}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
        {LimitActive ? (
          <div>
            <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl mt-4">
              <div className="flex-col justify-center w-1/2 p-2 ">
                <input
                  autoComplete="off"
                  className="bg-[#0C0C0C] outline-none"
                  placeholder="0"
                  value={hasSelected ? limitOrderPrice : 0}
                  type="text"
                  onChange={(e) => {
                    setLimitPrice(inputFilter(e.target.value))
                  }}
                />
                <></>
                {/*TODO - fix market price comparion when switch directions*/}
                <div className="flex">
                  <div className="flex text-xs text-[#4C4C4C]">
                    {hasSelected ? (
                      (parseFloat(limitPrice) / rangePrice - 1) * 100 > 0 ? (
                        (
                          (parseFloat(limitPrice) / rangePrice - 1) *
                          100
                        ).toFixed(2) + '% above Market Price'
                      ) : (
                        Math.abs(
                          (parseFloat(limitPrice) / rangePrice - 1) * 100,
                        ).toFixed(2) + '% below Market Price'
                      )
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex w-1/2">
                <div className="flex justify-center ml-auto">
                  <div className="flex-col">
                    <div className="flex justify-end">
                      {tokenOrder && hasSelected === false ? (
                        <button className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl">
                          {tokenIn.symbol} per ?
                          <ArrowPathIcon className="w-5" />
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                          onClick={() => setLimitPriceSwitch(!limitPriceSwitch)}
                        >
                          {limitPriceSwitch
                            ? tokenOut.symbol + ' per ' + tokenIn.symbol
                            : tokenIn.symbol + ' per ' + tokenOut.symbol}

                          <ArrowPathIcon className="w-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 px-1 mt-2">
                      {/* <div className="text-xs text-white">
                        Set to Market Price //@dev doesn't look like it's needed as its redundant
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="py-4">
          <div
            className="flex px-2 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex-none text-xs uppercase text-[#C9C9C9]">
              1 {tokenIn.symbol} ={' '}
              {tokenOut.symbol === 'Select Token'
                ? ' ?'
                : ' ' +
                  (!LimitActive
                    ? !isNaN(rangeQuote) && !isNaN(coverQuote)
                      ? rangeQuote > coverQuote
                        ? rangeQuote.toFixed(3)
                        : coverQuote.toFixed(3)
                      : '0'
                    : parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) !=
                      0
                    ? parseFloat(
                        ethers.utils.formatUnits(rangeBnPrice, 18),
                      ).toFixed(3)
                    : '0')}{' '}
              {tokenOut.symbol}
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
        {isDisconnected ? (
          <ConnectWalletButton xl={true} />
        ) : !LimitActive ? (
          <>
            {stateChainName !== 'arbitrumGoerli' ||
            (coverQuote == 0 && rangeQuote == 0) ||
            bnInput.eq(BN_ZERO) ? (
              <button
                disabled
                className="w-full py-4 mx-auto cursor-not-allowed font-medium opacity-20 text-center transition rounded-xl bg-gradient-to-r from-[#344DBF] to-[#3098FF]"
              >
                Swap
              </button>
            ) : rangeQuote > coverQuote ? (
              Number(allowanceRange) <
              Number(ethers.utils.formatUnits(bnInput, 18)) ? (
                <div>
                  <SwapRangeApproveButton
                    disabled={false}
                    poolAddress={rangePoolRoute}
                    approveToken={tokenIn.address}
                    tokenSymbol={tokenIn.symbol}
                    bnInput={bnInput}
                    allowanceRange={allowanceRange}
                  />
                </div>
              ) : (
                <SwapRangeButton
                  poolAddress={rangePoolRoute}
                  zeroForOne={
                    tokenOut.address != '' &&
                    tokenIn.address.localeCompare(tokenOut.address) < 0
                  }
                  amount={bnInput}
                  priceLimit={rangeBnPriceLimit}
                />
              )
            ) : Number(allowanceCover) <
              Number(ethers.utils.formatUnits(bnInput, 18)) ? (
              <div>
                <SwapCoverApproveButton
                  disabled={false}
                  poolAddress={coverPoolRoute}
                  approveToken={tokenIn.address}
                  tokenSymbol={tokenIn.symbol}
                  allowanceCover={allowanceCover}
                  bnInput={bnInput}
                />
              </div>
            ) : (
              <SwapCoverButton
                poolAddress={coverPoolRoute}
                zeroForOne={
                  tokenOut.address != '' &&
                  tokenIn.address.localeCompare(tokenOut.address) < 0
                }
                amount={bnInput}
                priceLimit={coverBnPriceLimit}
              />
            )}
          </>
        ) : (
          <>
            {stateChainName !== 'arbitrumGoerli' || bnInput._hex == '0x00' ? (
              <button
                disabled
                className="w-full py-4 mx-auto cursor-not-allowed font-medium opacity-20 text-center transition rounded-xl bg-gradient-to-r from-[#344DBF] to-[#3098FF]"
              >
                Swap
              </button>
            ) : Number(allowanceRange) <
                Number(ethers.utils.formatUnits(bnInput, 18)) ||
              Number(allowanceRangeOut) <
                Number(
                  parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)),
                ) ? (
              Number(allowanceRange) <
                Number(ethers.utils.formatUnits(bnInput, 18)) &&
              Number(allowanceRangeOut) <
                Number(
                  parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)),
                ) ? (
                <SwapRangeDoubleApproveButton
                  poolAddress={rangePoolRoute}
                  tokenIn={tokenIn.address}
                  tokenOut={tokenOut.address}
                  tokenSymbol={tokenIn.symbol}
                  allowanceRange={allowanceRange}
                  bnInput={bnInput}
                />
              ) : Number(allowanceRange) <
                Number(ethers.utils.formatUnits(bnInput, 18)) ? (
                <SwapRangeApproveButton
                  disabled={false}
                  poolAddress={rangePoolRoute}
                  approveToken={tokenIn.address}
                  tokenSymbol={tokenIn.symbol}
                  allowanceRange={allowanceRange}
                  bnInput={bnInput}
                />
              ) : (
                <SwapRangeApproveButton
                  disabled={false}
                  poolAddress={rangePoolRoute}
                  approveToken={tokenOut.address}
                  tokenSymbol={tokenIn.symbol}
                  allowanceRange={allowanceRange}
                  bnInput={bnInput}
                />
              )
            ) : (
              <RangeLimitSwapButton
                disabled={false}
                poolAddress={rangePoolRoute}
                to={address}
                lower={lowerTick}
                upper={upperTick}
                amount0={tokenOrder ? bnInput : BN_ZERO}
                amount1={tokenOrder ? BN_ZERO : bnInput}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
