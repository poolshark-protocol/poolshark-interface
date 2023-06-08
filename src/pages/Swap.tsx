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
import { BigNumber, Contract, Signer, ethers } from 'ethers'
import { chainIdsToNamesForGitTokenList } from '../utils/chains'
import { coverPoolABI } from '../abis/evm/coverPool'
import {
  fetchCoverPools,
  fetchRangePools,
  getCoverPoolFromFactory,
  getRangePoolFromFactory,
} from '../utils/queries'
import { useSwapStore } from '../hooks/useStore'
import SwapRangeApproveButton from '../components/Buttons/SwapRangeApproveButton'
import SwapRangeButton from '../components/Buttons/SwapRangeButton'
import SwapCoverApproveButton from '../components/Buttons/SwapCoverApproveButton'
import SwapCoverButton from '../components/Buttons/SwapCoverButton'
import { rangePoolABI } from '../abis/evm/rangePool'
import { TickMath, invertPrice, roundTick } from '../utils/math/tickMath'
import { ZERO_ADDRESS } from '../utils/math/constants'
import { gasEstimate, gasEstimateLimit } from '../utils/gas'
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
  const [updateSwapAmount] = useSwapStore((state: any) => [
    state.updateSwapAmount,
  ])
  const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()

  const [gasFee, setGasFee] = useState('0')
  const [mintFee, setMintFee] = useState('0')
  const [coverQuote, setCoverQuote] = useState(0)
  const [rangeQuote, setRangeQuote] = useState(0)
  const [coverPrice, setCoverPrice] = useState(0)
  const [rangePrice, setRangePrice] = useState(0)
  const [coverOutput, setCoverOutput] = useState(0)
  const [rangeOutput, setRangeOutput] = useState(0)
  const [hasSelected, setHasSelected] = useState(false)
  const [tokenIn, setTokenIn] = useState({
    symbol: 'WETH',
    logoURI: '/static/images/eth_icon.png',
    address: tokenOneAddress,
  })
  const [tokenOut, setTokenOut] = useState({
    symbol: 'Select Token',
    logoURI: '',
    address: tokenZeroAddress,
  })
  const [queryTokenIn, setQueryTokenIn] = useState(tokenZeroAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [slippage, setSlippage] = useState('0.5')
  const [coverSlippage, setCoverSlippage] = useState('0.5')
  const [rangeSlippage, setRangeSlippage] = useState('0.5')
  const [auxSlippage, setAuxSlippage] = useState('0.5')
  const [modalOpen, setModalOpen] = useState(false)
  const [balanceIn, setBalanceIn] = useState('')
  const [balanceOut, setBalanceOut] = useState('0.00')
  const [stateChainName, setStateChainName] = useState()
  const [LimitActive, setLimitActive] = useState(false)
  const [tokenOrder, setTokenOrder] = useState(true)
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
  const [bnSlippage, setBnSlippage] = useState(BigNumber.from(1))
  const [slippageFetched, setSlippageFetched] = useState(false)
  const [limitPrice, setLimitPrice] = useState('1')
  const [allowanceRangeOut, setAllowanceRangeOut] = useState('0.00')

  console.log('balanceIn', balanceIn)
  console.log('balanceOut', balanceOut)

  /////////////////Start of Contract Hooks//////////////////////

  const { data: dataRange } = useContractRead({
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

  const  { data: dataRangeOut } = useContractRead({
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

  const { data: dataCover } = useContractRead({
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

  const { data: priceRange } = useContractRead({
    address: rangePoolRoute,
    abi: rangePoolABI,
    functionName: 'poolState',
    args: [],
    chainId: 421613,
    watch: true,
    enabled: isConnected && rangePoolRoute != undefined,
    onSuccess(data) {
      console.log('Success price Range', data)
    },
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
    functionName:
      tokenIn.address.localeCompare(tokenOut.address) < 0 ? 'pool1' : 'pool0',
    args: [],
    chainId: 421613,
    watch: true,
    enabled: isConnected && coverPoolRoute != undefined,
    onSuccess(data) {
      console.log('Success price Cover', data)
      console.log('coverPrice', coverPrice)
    },
    onError(error) {
      console.log('Error price Cover', error)
    },
    onSettled(data, error) {
      console.log('Settled price Cover', { data, error })
    },
  })

  const { data: quoteRange } = useContractRead({
    address: rangePoolRoute,
    abi: rangePoolABI,
    functionName: 'quote',
    args: [
      tokenIn.address.localeCompare(tokenOut.address) < 0,
      bnInput,
      tokenIn.address.localeCompare(tokenOut.address) < 0
        ? BigNumber.from(
            TickMath.getSqrtPriceAtPriceString(//@dev entering an NaN case
              rangeBnPrice.sub(rangeBnBaseLimit).toString(),
              18,
            ).toString(),
          )
        : BigNumber.from(
            TickMath.getSqrtPriceAtPriceString(
              rangeBnPrice.add(rangeBnBaseLimit).toString(),
              18,
            ).toString(),
          ),
    ],
    chainId: 421613,
    watch: true,
    enabled: isConnected && rangePoolRoute != undefined,
    onSuccess(data) {
      console.log('Success range wagmi', data)
    },
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
    args: [
      tokenIn.address.localeCompare(tokenOut.address) < 0,
      bnInput,
      tokenIn.address.localeCompare(tokenOut.address) < 0
        ? BigNumber.from(
            TickMath.getSqrtPriceAtPriceString(
              coverBnPrice.sub(coverBnBaseLimit).toString(),
              18,
            ).toString(),
          )
        : BigNumber.from(
            TickMath.getSqrtPriceAtPriceString(
              coverBnPrice.add(coverBnBaseLimit).toString(),
              18,
            ).toString(),
          ),
    ],
    chainId: 421613,
    watch: true,
    enabled: isConnected && coverPoolRoute != undefined,
    onSuccess(data) {
      console.log('Success cover wagmi', data)
    },
    onError(error) {
      console.log('Error cover wagmi', error)
    },
    onSettled(data, error) {
      console.log('Settled', { data, error })
    },
  })

  /////////////////End of Contract Hooks//////////////////////

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId])
  }, [chainId])

  useEffect(() => {
    if (hasSelected) {
      updateBalances()
      updatePools()
    }
  }, [tokenOut.address, tokenIn.address, hasSelected])

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

  async function updatePools() {
    await getRangePool(tokenIn, tokenOut, setRangePoolRoute, setRangeTickSpacing)
    await getCoverPool(tokenIn, tokenOut, setCoverPoolRoute)
  }

  useEffect(() => {
    if (bnInput !== BigNumber.from(0)) {
      if (!LimitActive) {
        updateGasFee()
      } else {
        updateMintFee()
      }
    }
    /* setTimeout(() => {
      updateGasFee()
    }, 10000) */
  }, [
    bnInput,
    tokenIn.address,
    tokenOut.address,
    coverPoolRoute,
    rangePoolRoute,
    LimitActive
  ])

  async function updateGasFee() {
    const newGasFee = await gasEstimate(
      rangePoolRoute,
      coverPoolRoute,
      rangeQuote,
      coverQuote,
      rangeBnPrice,
      rangeBnBaseLimit,
      tokenIn,
      tokenOut,
      bnInput,
      address,
      signer,
    )
    setGasFee(newGasFee)
  }

  async function updateMintFee() {
    const newMintFee = await gasEstimateLimit(
      rangePoolRoute,
      address,
      rangePrice,
      rangeBnPrice,
      rangeBnBaseLimit,
      tokenIn,
      tokenOut,
      bnInput,
      rangeTickSpacing,
      signer
    )
    setMintFee(newMintFee)
  }

  function changeDefaultIn(token: token) {
    if (token.symbol === tokenOut.symbol) {
      return
    }
    setTokenIn(token)
    if (token.address.localeCompare(tokenOut.address) < 0) {
      setTokenIn(token)
      if (hasSelected === true) {
        setTokenOut(tokenOut)
      }
      return
    }
    if (token.address.localeCompare(tokenOut.address) >= 0) {
      if (hasSelected === true) {
        setTokenIn(tokenOut)
      }
      setTokenOut(token)
      return
    }
  }

  const changeDefaultOut = (token: token) => {
    if (token.symbol === tokenIn.symbol) {
      return
    }
    setTokenOut(token)
    setHasSelected(true)
    if (token.address.localeCompare(tokenIn.address) < 0) {
      setTokenIn(token)
      setTokenOut(tokenIn)
      return
    }

    if (token.address.localeCompare(tokenIn.address) >= 0) {
      setTokenIn(tokenIn)
      setTokenOut(token)
      return
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
    console.log('tokenIn after switch', tokenIn)
    console.log('tokenOut after switch', tokenOut)
  }

  const getFeeTier = async () => {
    const coverData = await fetchCoverPools()
    const coverPoolAddress = coverData['data']['coverPools']['0']['id']

    if (coverPoolAddress === coverPoolRoute) {
      const feeTier =
        coverData['data']['coverPools']['0']['volatilityTier']['feeAmount']
      console.log(feeTier, 'fee cover')
      setCoverSlippage((parseFloat(feeTier) / 10000).toString())
    }
    const data = await fetchRangePools()
    const rangePoolAddress = data['data']['rangePools']['0']['id']

    if (rangePoolAddress === rangePoolRoute) {
      const feeTier = data['data']['rangePools']['0']['feeTier']['feeAmount']
      console.log(feeTier, 'fee range')
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

  useEffect(() => {
    if (dataRange && dataCover) {
      setAllowanceRange(ethers.utils.formatUnits(dataRange, 18))
      setAllowanceCover(ethers.utils.formatUnits(dataCover, 18))
    }

    if (LimitActive && dataRangeOut) {
      setAllowanceRangeOut(ethers.utils.formatUnits(dataRangeOut, 18))
    }
  }, [dataRange, dataCover, tokenIn.address, LimitActive])

  useEffect(() => {
    if (priceCover) {
      if (
        priceCover[0].toString() !== BigNumber.from(0).toString() &&
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
        priceRange[5].toString() !== BigNumber.from(0).toString() &&
        tokenIn.address != '' &&
        tokenOut.address != '' &&
        priceRange != undefined
      ) {

        console.log('priceRange', priceRange[5].toString())

        setRangePrice(
          parseFloat(
            invertPrice(
              TickMath.getPriceStringAtSqrtPrice(priceRange[5]),
              tokenIn.address.localeCompare(tokenOut.address) < 0,
            ),
          ),
        )
        console.log('rangePrice after setter', rangePrice)
      }
    }
  }, [coverPoolRoute, rangePoolRoute, priceCover, priceRange])

  useEffect(() => {
    if (quoteRange) {
      if (
        quoteRange[0].toString() !== BigNumber.from(0).toString() &&
        quoteRange[1].toString() !== BigNumber.from(0).toString() &&
        bnInput._hex != '0x00' &&
        rangeBnPrice.toString() !== BigNumber.from(0).toString()
      ) {
        setRangeOutput(parseFloat(ethers.utils.formatUnits(quoteRange[1], 18)))
        setRangeQuote(
          parseFloat(ethers.utils.formatUnits(quoteRange[1], 18)) /
            parseFloat(ethers.utils.formatUnits(quoteRange[0], 18)),
        )
        setRangePriceAfter(
          parseFloat(TickMath.getPriceStringAtSqrtPrice(quoteRange[2])),
        )
      }
    }

    if (quoteCover) {
      if (
        quoteCover[0].toString() !== BigNumber.from(0).toString() &&
        quoteCover[1].toString() !== BigNumber.from(0).toString() &&
        bnInput._hex != '0x00' &&
        coverBnPrice.toString() !== BigNumber.from(0).toString()
      ) {
        setCoverOutput(parseFloat(ethers.utils.formatUnits(quoteCover[1], 18)))
        setCoverQuote(
          parseFloat(ethers.utils.formatUnits(quoteCover[1], 18)) /
            parseFloat(ethers.utils.formatUnits(quoteCover[0], 18)),
        )
        setCoverPriceAfter(
          parseFloat(TickMath.getPriceStringAtSqrtPrice(quoteCover[2])),
        )
      }
    }

    if (quoteCover && quoteRange) {
      if (
        slippageFetched === false &&
        quoteCover[0].toString() !== BigNumber.from(0).toString() &&
        quoteRange[0].toString() !== BigNumber.from(0).toString()
      ) {
        getFeeTier()
        getSlippage()
        setSlippageFetched(true)
      }
    }
  }, [quoteCover, quoteRange, bnInput])

  useEffect(() => {
    updateSwapAmount(bnInput)
  }, [bnInput])

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
    console.log('coverBnPrice', coverBnPrice.toString())
    console.log('rangeBnPrice', rangeBnPrice.toString())
  }, [coverPrice, rangePrice])

  useEffect(() => {
    if (rangeBnPrice) {
      if (rangeBnPrice !== BigNumber.from(0)) {
        setRangeBnBaseLimit(
          rangeBnPrice.mul(parseFloat(slippage) * 100).div(10000),
        )
      }
    }

    if (coverBnPrice) {
      if (coverBnPrice !== BigNumber.from(0)) {
        setCoverBnBaseLimit(
          coverBnPrice.mul(parseFloat(slippage) * 100).div(10000),
        )
      }
    }
    console.log('rangeBnBaseLimit', rangeBnBaseLimit.toString())
    console.log('coverBnBaseLimit', coverBnBaseLimit.toString())
  }, [slippage, rangeBnPrice, coverBnPrice])

  //@dev TO-DO: fetch token Addresses, use for pool quote (smallest fee tier)
  //@dev TO-DO: re-route pool and handle allowances

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div className="ml-auto text-xs">
              {hasSelected ? !LimitActive ? (
                rangeQuote > coverQuote
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
              ) : (
                parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) == 0
                ? '0'
                : (
                  parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                  parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18))
                ).toFixed(2)
              )
              : 'Select Token'}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Minimum received after slippage ({slippage}%)
            </div>
            <div className="ml-auto text-xs">
              {hasSelected ? !LimitActive ? (
                rangeQuote > coverQuote
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
              ) : (
                parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) == 0
                ? '0'
                : (
                parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                  parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) -
                parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) *
                  (parseFloat(slippage) * 0.01)
                  ).toFixed(2)
                )
                : 'Select Token'}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            {!LimitActive ?
            <div className="ml-auto text-xs">{gasFee}</div> :
            <div className="ml-auto text-xs">{mintFee}</div>}
          </div>
          {!LimitActive ? (
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Price Impact</div>
            <div className="ml-auto text-xs">
              {hasSelected
                ? rangeQuote !== 0 && coverQuote !== 0
                  ? rangeQuote > coverQuote
                    ? Math.abs(
                        ((rangePriceAfter - rangePrice) * 100) / rangePrice,
                      ).toFixed(2) + '%'
                    : Math.abs(
                        ((coverPriceAfter - coverPrice) * 100) / coverPrice,
                      ).toFixed(2) + '%'
                  : '0%'
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
                  ? "text-grey cursor-pointer"
                  : "text-white cursor-pointer"
              }`}
            >
              Market
            </div>

            <div
              onClick={() => setLimitActive(true)}
              className={`${
                LimitActive
                  ? "text-white cursor-pointer"
                  : "text-grey cursor-pointer"
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
                          value={auxSlippage + "%"}
                          onChange={(e) =>
                            setAuxSlippage(
                              parseFloat(
                                e.target.value.replace(/[^\d.-]/g, "")
                              ) < 100
                                ? e.target.value.replace(/[^\d.-]/g, "")
                                : ""
                            )
                          }
                        />
                        <button
                          className=" w-full py-2.5 px-12 mx-auto text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
                          onClick={async () => {
                            setSlippage(auxSlippage);
                            close();
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
            {inputBox("0")}
            {rangeQuote !== 0 && coverQuote !== 0 ? (
              <div className="flex">
                <div className="flex text-xs text-[#4C4C4C]">
                  {!LimitActive ? (
                    rangeQuote > coverQuote
                      ? rangeQuote.toFixed(2)
                      : coverQuote.toFixed(2)
                    ) : (
                      parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)).toFixed(2)
                    )}
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
                    selected={hasSelected}
                    tokenChosen={changeDefaultIn}
                    displayToken={tokenIn}
                    balance={setQueryTokenIn}
                    key={queryTokenIn}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="flex text-xs text-[#4C4C4C]" key={balanceIn}>
                    Balance: {balanceIn === "NaN" ? 0 : balanceIn}
                  </div>
                  {isConnected && stateChainName === "arbitrumGoerli" ? (
                    <button
                      className="flex text-xs uppercase text-[#C9C9C9]"
                      onClick={() => {
                        console.log("max", balanceIn);
                        maxBalance(balanceIn, "0");
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
                switchDirection();
              }
            }}
          />
        </div>
        <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            <div className=" bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none">
              {!LimitActive ? (
              hasSelected &&
              coverQuote !== 0 &&
              rangeQuote !== 0 &&
              bnInput._hex != "0x00") ? (
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
              ) : (hasSelected &&
                  parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) != 0 &&
                  bnInput._hex != "0x00") ? (
                <div>
                  {(
                    parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18))
                  ).toFixed(2)}
                </div>
              ) : (
                <div>0</div>
              )}
            </div>
            {rangeQuote !== 0 && coverQuote !== 0 ? (
              <div className="flex">
                <div className="flex text-xs text-[#4C4C4C]">
                  {!LimitActive ? (
                    rangeQuote > coverQuote
                      ? (1 / rangeQuote).toFixed(2)
                      : (1 / coverQuote).toFixed(2)
                    ) : (
                      (1 / parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18))).toFixed(2)
                    )}
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
                  {hasSelected ? (
                    <SelectToken
                      index="1"
                      selected={hasSelected}
                      tokenChosen={changeDefaultOut}
                      displayToken={tokenOut}
                      balance={setQueryTokenOut}
                      key={queryTokenOut}
                    />
                  ) : (
                    //@dev add skeletons on load when switching sides/ initial selection
                    <SelectToken
                      index="2"
                      selected={hasSelected}
                      tokenChosen={changeDefaultOut}
                      displayToken={tokenOut}
                      balance={setQueryTokenOut}
                      key={queryTokenOut}
                    />
                  )}
                </div>
                {hasSelected ? (
                  <div className="flex items-center justify-end gap-2 px-1 mt-2">
                    <div className="flex text-xs text-[#4C4C4C]">
                      Balance: {balanceOut === "NaN" ? 0 : balanceOut}
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
                  value={limitPrice}
                  type="text"
                  onChange={e => {
                    setLimitPrice(inputFilter(e.target.value));
                    (Number(e.target.value) != 0 && e.target.value.toString() != '') ?
                      (
                      setRangeBnPrice(ethers.utils.parseEther(inputFilter(e.target.value)))
                      ) :
                      (setLimitPrice('0'))
                    }
                  }
                />
                <></>
                <div className="flex">
                  <div className="flex text-xs text-[#4C4C4C]"> {/*TODO - fix market price comparion when switch directions*/}
                    {(((parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) /
                    rangePrice) - 1) * 100) > 0 ?
                    (((parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) /
                    rangePrice) - 1) * 100).toFixed(2)+ "% above Market Price" :
                    Math.abs(((parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) /
                    rangePrice) - 1) * 100).toFixed(2)+ "% below Market Price" }
                  </div>
                </div>
              </div>
              <div className="flex w-1/2">
                <div className="flex justify-center ml-auto">
                  <div className="flex-col">
                    <div className="flex justify-end">
                      {tokenOrder && hasSelected === false ? (
                        <button
                          className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                        >
                          {tokenIn.symbol} per ?
                          <ArrowPathIcon className="w-5" />
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                          onClick={() => switchDirection()}
                        >
                          {tokenOut.symbol} per {tokenIn.symbol}
                          <ArrowPathIcon className="w-5" />
                        </button>
                      )
                      }
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
              1 {tokenIn.symbol} ={" "}
              {tokenOut.symbol === "Select Token"
                ? " ?"
                : " " +
                  ((!LimitActive) ? 
                  (rangeQuote != 0 && coverQuote != 0
                    ? rangeQuote > coverQuote
                      ? rangeQuote.toFixed(2)
                      : coverQuote.toFixed(2)
                    : "0")
                  : (
                    parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)) != 0
                    ? parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18)).toFixed(2)
                    : "0"
                  ))}{" "}
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
            {stateChainName !== "arbitrumGoerli" ||
            coverQuote === 0 ||
            rangeQuote === 0 ||
            bnInput._hex == "0x00" ? (
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
                  <div className="flex-none text-xs uppercase text-[#C9C9C9]">
                    Your {tokenIn.symbol} rangePool allowance is missing{" "}
                    {(
                      Number(ethers.utils.formatUnits(bnInput, 18)) -
                      Number(allowanceRange)
                    ).toFixed(2)}{" "}
                    {tokenIn.symbol}
                  </div>

                  <SwapRangeApproveButton
                    disabled={false}
                    poolAddress={rangePoolRoute}
                    approveToken={tokenIn.address}
                  />
                </div>
              ) : (
                <SwapRangeButton
                  poolAddress={rangePoolRoute}
                  zeroForOne={
                    tokenOut.address != "" &&
                    tokenIn.address.localeCompare(tokenOut.address) < 0
                  }
                  amount={bnInput}
                  baseLimit={
                    tokenOut.address != "" &&
                    tokenIn.address.localeCompare(tokenOut.address) < 0
                      ? BigNumber.from(
                          TickMath.getSqrtPriceAtPriceString(
                            rangeBnPrice.sub(rangeBnBaseLimit).toString(),
                            18
                          ).toString()
                        )
                      : BigNumber.from(
                          TickMath.getSqrtPriceAtPriceString(
                            rangeBnPrice.add(rangeBnBaseLimit).toString(),
                            18
                          ).toString()
                        )
                  }
                />
              )
            ) : Number(allowanceCover) <
              Number(ethers.utils.formatUnits(bnInput, 18)) ? (
              <div>
                <div className="flex-none ">
                  Your {tokenIn.symbol} coverPool allowance is missing{" "}
                  {(
                    Number(ethers.utils.formatUnits(bnInput, 18)) -
                    Number(allowanceCover)
                  ).toFixed(2)}{" "}
                  {tokenIn.symbol}
                </div>
                <SwapCoverApproveButton
                  disabled={false}
                  poolAddress={coverPoolRoute}
                  approveToken={tokenIn.address}
                />
              </div>
            ) : (
              <SwapCoverButton
                poolAddress={coverPoolRoute}
                zeroForOne={
                  tokenOut.address != "" &&
                  tokenIn.address.localeCompare(tokenOut.address) < 0
                }
                amount={bnInput}
                baseLimit={
                  tokenOut.address != "" &&
                  tokenIn.address.localeCompare(tokenOut.address) < 0
                    ? BigNumber.from(
                        TickMath.getSqrtPriceAtPriceString(
                          coverBnPrice.sub(coverBnBaseLimit).toString(),
                          18
                        ).toString()
                      )
                    : BigNumber.from(
                        TickMath.getSqrtPriceAtPriceString(
                          coverBnPrice.add(coverBnBaseLimit).toString(),
                          18
                        ).toString()
                      )
                }
              />
            )}
          </>
        ) :
        (
          <>
            {stateChainName !== "arbitrumGoerli" ||
            coverQuote === 0 ||
            rangeQuote === 0 ||
            bnInput._hex == "0x00" ? (
              <button
                disabled
                className="w-full py-4 mx-auto cursor-not-allowed font-medium opacity-20 text-center transition rounded-xl bg-gradient-to-r from-[#344DBF] to-[#3098FF]"
              >
                Swap
              </button>
            ) : (
              Number(allowanceRange) <
                Number(ethers.utils.formatUnits(bnInput, 18)) ||
              Number(allowanceRangeOut) <
                Number(
                  parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                  parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18))) ? (
                Number(allowanceRange) <
                  Number(ethers.utils.formatUnits(bnInput, 18)) &&
                Number(allowanceRangeOut) <
                  Number(
                    parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18))) ? (
                  <SwapRangeDoubleApproveButton
                    poolAddress={rangePoolRoute}
                    tokenIn={tokenIn.address}
                    tokenOut={tokenOut.address}
                  />
                ) : Number(allowanceRange) <
                  Number(ethers.utils.formatUnits(bnInput, 18)) ? (
                  <SwapRangeApproveButton
                    disabled={false}
                    poolAddress={rangePoolRoute}
                    approveToken={tokenIn.address}
                  />
                ) : (
                  <SwapRangeApproveButton
                    disabled={false}
                    poolAddress={rangePoolRoute}
                    approveToken={tokenOut.address}
                  />
                )
            ) : (
                <RangeLimitSwapButton
                  disabled={false}
                  poolAddress={rangePoolRoute}
                  to={address}
                  lower={BigNumber.from(
                    roundTick(
                      TickMath.getTickAtPriceString(
                        (ethers.utils.formatUnits(rangeBnPrice, 18))), rangeTickSpacing).toString())
                    }
                  upper={tokenOut.address != "" &&
                  tokenIn.address.localeCompare(tokenOut.address) < 0 ?
                    BigNumber.from(
                      roundTick(
                        TickMath.getTickAtPriceString(
                          (ethers.utils.formatUnits(rangeBnPrice.add(rangeBnBaseLimit), 18))), rangeTickSpacing).toString()) :
                    BigNumber.from(
                      roundTick(
                        TickMath.getTickAtPriceString(
                          (ethers.utils.formatUnits(rangeBnPrice.sub(rangeBnBaseLimit), 18))), rangeTickSpacing).toString())
                    }
                  amount0={bnInput}
                  amount1={ethers.utils.parseEther(
                    (parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    parseFloat(ethers.utils.formatUnits(rangeBnPrice, 18))).toString()
                    )}
                />
              )
            )}
          </>
          )}
      </div>
    </div>
  );
}
