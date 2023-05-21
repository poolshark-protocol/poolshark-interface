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
import { erc20ABI, useAccount, useSigner } from 'wagmi'
import {
  tokenZeroAddress,
  tokenOneAddress,
} from '../constants/contractAddresses'
import { useProvider, useContractRead } from 'wagmi'
import { BigNumber, Contract, ethers } from 'ethers'
import { chainIdsToNamesForGitTokenList } from '../utils/chains'
import { coverPoolABI } from '../abis/evm/coverPool'
import {
  fetchCoverPools,
  fetchPrice,
  fetchRangePools,
  getCoverPoolFromFactory,
  getRangePoolFromFactory,
} from '../utils/queries'
import { useSwapStore } from '../hooks/useStore'
import SwapRangeApproveButton from '../components/Buttons/SwapRangeApproveButton'
import SelectTokenButton from '../components/Buttons/SelectTokenButtonSwap'
import SwapRangeButton from '../components/Buttons/SwapRangeButton'
import SwapCoverApproveButton from '../components/Buttons/SwapCoverApproveButton'
import SwapCoverButton from '../components/Buttons/SwapCoverButton'
import useSwapAllowance from '../hooks/useSwapAllowance'
import { rangePoolABI } from '../abis/evm/rangePool'
import { TickMath, invertPrice } from '../utils/math/tickMath'
import JSBI from 'jsbi'
import { ZERO_ADDRESS } from '../utils/math/constants'

type token = {
  symbol: string
  logoURI: string
  address: string
}

export default function Swap() {
  const [updateSwapAmount] = useSwapStore((state: any) => [
    state.updateSwapAmount,
  ])
  const { address, isDisconnected, isConnected } = useAccount()
  const allowance = useSwapAllowance(address)
  const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()
  const [gasFee, setGasFee] = useState('')
  const [coverQuote, setCoverQuote] = useState(undefined)
  const [rangeQuote, setRangeQuote] = useState(undefined)
  const [coverPrice, setCoverPrice] = useState(0)
  const [rangePrice, setRangePrice] = useState(0)
  const [hasSelected, setHasSelected] = useState(false)
  const [mktRate, setMktRate] = useState({})
  const [tokenIn, setTokenIn] = useState({
    symbol: 'WETH',
    logoURI: '/static/images/eth_icon.png',
    address: tokenZeroAddress,
  })
  const [tokenOut, setTokenOut] = useState({
    symbol: 'Select Token',
    logoURI: '',
    address: tokenOneAddress,
  })
  const [queryTokenIn, setQueryTokenIn] = useState(tokenZeroAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [slippage, setSlippage] = useState('0.5')
  const [auxSlippage, setAuxSlippage] = useState('0.5')
  const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('0.00')
  const [stateChainName, setStateChainName] = useState()
  let [isOpen, setIsOpen] = useState(false)
  const [LimitActive, setLimitActive] = useState(false)
  const [tokenOrder, setTokenOrder] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [allowanceRange, setAllowanceRange] = useState('0.00')
  const [allowanceCover, setAllowanceCover] = useState('0.00')
  const [coverPoolRoute, setCoverPoolRoute] = useState(undefined)
  const [rangePoolRoute, setRangePoolRoute] = useState(undefined)
  const [coverPriceAfter, setCoverPriceAfter] = useState(undefined)
  const [rangePriceAfter, setRangePriceAfter] = useState(undefined)
  const [coverBnPrice, setCoverBnPrice] = useState(BigNumber.from(0))
  const [rangeBnPrice, setRangeBnPrice] = useState(BigNumber.from(0))
  const [coverBnBaseLimit, setCoverBnBaseLimit] = useState(BigNumber.from(0))
  const [rangeBnBaseLimit, setRangeBnBaseLimit] = useState(BigNumber.from(0))
  const [bnSlippage, setBnSlippage] = useState(BigNumber.from(1))

  const { data: signer } = useSigner()
  const provider = useProvider()

  const { data: dataRange } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, rangePoolRoute],
    chainId: 421613,
    watch: true,
    enabled: coverPoolRoute != undefined && tokenIn.address != '',
    onError(error) {
      console.log('Error allowance', error)
    },
    onSuccess(data) {
      console.log('Success allowance', data)
    }

  })
  const { data: dataCover } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, coverPoolRoute],
    chainId: 421613,
    watch: true,
    enabled: coverPoolRoute != undefined && tokenIn.address != '',
    onError(error) {
      console.log('Error allowance', error)
    },
    onSuccess(data) {
      console.log('Success allowance', data)
    }
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
    onSuccess(data) {
      console.log('Success price Cover', data)
      setCoverPrice(parseFloat(TickMath.getPriceStringAtSqrtPrice(data[0])))
      console.log('coverPrice', coverPrice)
    },
    onError(error) {
      console.log('Error price Cover', error)
    },
    onSettled(data, error) {
      console.log('Settled price Cover', { data, error })
    },
  })

  const { data: priceRange } = useContractRead({
    address: rangePoolRoute,
    abi: rangePoolABI,
    functionName: 'poolState',
    args: [],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      console.log('Success price Range', data)
      setRangePrice(
        parseFloat(
          invertPrice(
            TickMath.getPriceStringAtSqrtPrice(data[5]),
            tokenOut.address != '' &&
              tokenIn.address.localeCompare(tokenOut.address) < 0,
          ),
        ),
      )
      console.log('rangePrice if inverted', rangePrice)
    },
    onError(error) {
      console.log('Error price Range', error)
    },
    onSettled(data, error) {
      console.log('Settled price Range', { data, error })
    },
  })

  const { refetch: refetchCoverQuote, data: quoteCover } = useContractRead({
    address: coverPoolRoute,
    abi: coverPoolABI,
    functionName: 'quote',
    args: [
      tokenOut.address != '' &&
        tokenIn.address.localeCompare(tokenOut.address) < 0,
      bnInput,
      tokenOut.address != '' &&
      tokenIn.address.localeCompare(tokenOut.address) < 0
      ? BigNumber.from(TickMath.getSqrtPriceAtPriceString((coverBnPrice.sub(coverBnBaseLimit)).toString(), 18).toString())
      : BigNumber.from(TickMath.getSqrtPriceAtPriceString((coverBnPrice.add(coverBnBaseLimit)).toString(), 18).toString())
    ],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      console.log('Success cover wagmi', data)
      console.log('cover quote to number', data[1].toString())
      console.log('amountIn to number', data[0].toString())
      console.log('priceLimit conversion', (TickMath.getSqrtPriceAtPriceString((coverBnPrice.sub(coverBnBaseLimit)).toString(), 18).toString()))
      setCoverQuote(
        parseFloat(ethers.utils.formatUnits(data[1], 18)
      ))
      setCoverPriceAfter(
        parseFloat(
          TickMath.getPriceStringAtSqrtPrice(data[2]),
        ),
      )
      console.log('coverQuote', coverQuote)
      console.log('coverPriceAfter', coverPriceAfter)
    },
    onError(error) {
      console.log('Error cover wagmi', error)
    },
    onSettled(data, error) {
      console.log('Settled', { data, error })
    },
  })
  const { refetch: refetchRangeQuote, data: quoteRange } = useContractRead({
    address: rangePoolRoute,
    abi: rangePoolABI,
    functionName: 'quote',
    args: [
      tokenOut.address != '' &&
        tokenIn.address.localeCompare(tokenOut.address) < 0,
      bnInput,
      tokenOut.address != '' &&
      tokenIn.address.localeCompare(tokenOut.address) < 0
        ? BigNumber.from(TickMath.getSqrtPriceAtPriceString((rangeBnPrice.sub(rangeBnBaseLimit)).toString(), 18).toString())
        : BigNumber.from(TickMath.getSqrtPriceAtPriceString((rangeBnPrice.add(rangeBnBaseLimit)).toString(), 18).toString())
    ],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      console.log('Success range wagmi', data)
      setRangeQuote(
        parseFloat(
          ethers.utils.formatUnits(data[1], 18),
        ),
      )
      console.log('rangeQuote', rangeQuote)
    },
    onError(error) {
      console.log('Error range wagmi', error)
    },
    onSettled(data, error) {
      console.log('Settled range wagmi', { data, error })
    },
  })

  const {
    network: { chainId },
  } = useProvider()

  useEffect(() => {
    if (dataRange && dataCover) {
      setAllowanceRange(ethers.utils.formatUnits(dataRange, 18))
      setAllowanceCover(ethers.utils.formatUnits(dataCover, 18))
    }
  }, [dataRange, dataCover, tokenIn.address, tokenOut.address, bnInput])

  useEffect(() => {
    setTimeout(() => {
      gasEstimate()
    }, 10000)
  }, [])

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId])
  }, [chainId])

  useEffect(() => {
    getBalances()
  }, [tokenOut.address, tokenIn.address])

  useEffect(() => {
    updateSwapAmount(bnInput)
  }, [bnInput])

  useEffect(() => {
    getRangePool()
  }, [hasSelected, tokenIn.address, tokenOut.address])

  useEffect(() => {
    getCoverPool()
  }, [hasSelected, tokenIn.address, tokenOut.address])

  useEffect(() => {
    fetchTokenPrice()
  }, [rangeQuote, coverQuote, tokenIn.address, tokenOut.address, tokenOrder])

  useEffect(() => {
    getFeeTier()
  }, [rangeQuote, coverQuote])

  useEffect(() => {
    getBnSlippage()
  }, [slippage])

  useEffect(() => {
    setRangeBnPrice(ethers.utils.parseUnits(rangePrice.toString(), 18))
  }, [rangePrice, tokenIn, tokenOut])

  useEffect(() => {
    setRangeBnBaseLimit(rangeBnPrice.div(bnSlippage).div(BigNumber.from(100)))
  }, [rangeBnPrice])

  useEffect(() => {
    setCoverBnPrice(ethers.utils.parseUnits(coverPrice.toString(), 18))
  }, [coverPrice, tokenIn, tokenOut])

  useEffect(() => {
    setCoverBnBaseLimit(coverBnPrice.div(bnSlippage).div(BigNumber.from(100)))
  }, [coverBnPrice])

  function closeModal() {
    setIsOpen(false)
  }

  console.log('tokenIn', tokenIn)
  console.log('rangeBnPrice', rangeBnPrice.toString())
  console.log('rangeBnBaseLimit', rangeBnBaseLimit.toString())
  console.log('tokenOut', tokenOut)

  //@dev put balanc
  const getBalances = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://arb-goerli.g.alchemy.com/v2/M8Dr_KQx46ghJ93XDQe7j778Qa92HRn2',
        421613,
      )
      const signer = new ethers.VoidSigner(address, provider)
      const tokenOutBal = new ethers.Contract(tokenIn.address, erc20ABI, signer)
      const balance1 = await tokenOutBal.balanceOf(address)
      let token2Bal: Contract
      let bal1: string
      bal1 = Number(ethers.utils.formatEther(balance1)).toFixed(2)
      if (hasSelected === true) {
        token2Bal = new ethers.Contract(tokenOut.address, erc20ABI, signer)
        const balance2 = await token2Bal.balanceOf(address)
        let bal2: string
        bal2 = Number(ethers.utils.formatEther(balance2)).toFixed(2)

        setBalance1(bal2)
      }

      setBalance0(bal1)
    } catch (error) {
      console.log(error)
    }
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
  }

  function openModal() {
    setIsOpen(true)
  }

  const gasEstimate = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
      )
      if (!coverPoolRoute || !provider) {
        setGasFee('0')
        return
      }
      const contract = new ethers.Contract(
        coverPoolRoute,
        coverPoolABI,
        provider,
      )

      console.log('estimate route', coverPoolRoute)
      const recipient = address
      const zeroForOne =
        tokenOut.address != '' &&
        tokenIn.address.localeCompare(tokenOut.address) < 0

      const estimation = await contract.estimateGas.swap(
        recipient,
        recipient,
        zeroForOne,
        bnInput,
        BigNumber.from('79228162514264337593543950336'), // price of 1.00
      )

      console.log('gas estimation', estimation)
      const price = await fetchPrice('0x000')
      const ethPrice: number =
        Number(price['data']['bundles']['0']['ethPriceUSD']) *
        Number(ethers.utils.formatEther(estimation))
      const formattedPrice: string =
        '~' +
        ethPrice.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })
      setGasFee(formattedPrice)
      console.log('formatted price', formattedPrice)
    } catch (error) {
      console.log(error)
    }
  }

  const getFeeTier = async () => {
    if (Number(rangeQuote) > Number(coverQuote)) {
      const data = await fetchCoverPools()
      const poolAddress = data['data']['coverPools']['0']['id']

      console.log('cover pool subgraph address', poolAddress)

      if (poolAddress === coverPoolRoute) {
        const feeTier =
          data['data']['coverPools']['0']['volatilityTier']['feeAmount']
        console.log(feeTier, 'fee cover')
        setSlippage((parseFloat(feeTier) / 10000).toString())
        setAuxSlippage((parseFloat(feeTier) / 10000).toString())
      }
    } else {
      const data = await fetchRangePools()
      const poolAddress = data['data']['rangePools']['0']['id']

      if (poolAddress === rangePoolRoute) {
        const feeTier = data['data']['rangePools']['0']['feeTier']['feeAmount']
        console.log(feeTier, 'fee range')
        setSlippage((parseFloat(feeTier) / 10000).toString())
        setAuxSlippage((parseFloat(feeTier) / 10000).toString())
      }
    }
  }

  const getBnSlippage = () => {
    if (Number(slippage) >= 0.05 && Number(slippage) < 0.1) {
      const convertedSlippage = BigNumber.from(
        (1 / parseFloat(slippage)).toFixed(0),
      )
      setBnSlippage(convertedSlippage)
    }
    if (Number(slippage) >= 0.1 && Number(slippage) < 1) {
      const convertedSlippage = BigNumber.from(
        (1 / parseFloat(slippage)).toFixed(0),
      )
      setBnSlippage(convertedSlippage)
    }
    if (Number(slippage) >= 1 && Number(slippage) < 10) {
      const convertedSlippage = BigNumber.from(
        (1 / parseFloat(slippage)).toFixed(0),
      )
      setBnSlippage(convertedSlippage)
    }
    if (Number(slippage) >= 10 && Number(slippage) < 100) {
      const convertedSlippage = BigNumber.from(
        (1 / parseFloat(slippage)).toFixed(0),
      )
      setBnSlippage(convertedSlippage)
    }
  }

  const getRangePool = async () => {
    try {
      if (hasSelected === true) {
        const pool = await getRangePoolFromFactory(
          tokenIn.address,
          tokenOut.address,
        )
        const id = pool['data']['rangePools']['0']['id']

        setRangePoolRoute(id)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getCoverPool = async () => {
    try {
      if (hasSelected === true) {
        const pool = await getCoverPoolFromFactory(
          tokenIn.address,
          tokenOut.address,
        )
        let id = ZERO_ADDRESS
        let dataLength = pool['data']['coverPools'].length
        if(dataLength != 0) id = pool['data']['coverPools']['0']['id']
        setCoverPoolRoute(id)
        console.log('cover pool route', coverPoolRoute)
      }
    } catch (error) {
      console.log(error)
    }
  }

  //@dev TO-DO: fetch token Addresses, use for pool quote (smallest fee tier)
  //@dev TO-DO: re-route pool and handle allowances

  const fetchTokenPrice = () => {
    try {
      if (Number(rangeQuote) < Number(coverQuote)) {
        setMktRate({
          WETH:
            '~' +
            rangeQuote.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
          USDC: '~1.00',
        })
        console.log('mkt rate token in', mktRate[tokenIn.symbol])
        console.log('mkt rate token out', mktRate[tokenOut.symbol])
      } else {
        setMktRate({
          WETH:
            '~' +
            coverQuote.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
          USDC: '~1.00',
        })
        console.log('mkt rate token in', mktRate[tokenIn.symbol])
        console.log('mkt rate token out', mktRate[tokenOut.symbol])
      }
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
            <div className="ml-auto text-xs">
              {Number(rangeQuote) < Number(coverQuote)
                ? rangeQuote === undefined
                  ? 'Select Token'
                  : (
                      parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                      (parseFloat(
                        mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                      ) /
                        parseFloat(
                          mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                        ))
                    ).toFixed(2)
                : coverQuote === undefined
                ? 'Select Token'
                : (
                    parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    (parseFloat(
                      mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                    ) /
                      parseFloat(
                        mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                      ))
                  ).toFixed(2)}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Price Impact</div>
            <div className="ml-auto text-xs">
              {Number(rangePrice) < Number(coverPrice)
                ? (
                    (rangePrice - parseFloat(rangePriceAfter)) /
                    rangePrice
                  ).toFixed(2)
                : (
                    (coverPrice - parseFloat(coverPriceAfter)) /
                    coverPrice
                  ).toFixed(2)}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Minimum received after slippage ({slippage}%)
            </div>
            <div className="ml-auto text-xs">
              {Number(rangeQuote) < Number(coverQuote)
                ? (
                    parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                      (parseFloat(
                        mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                      ) /
                        parseFloat(
                          mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                        )) -
                    parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                      (parseFloat(
                        mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                      ) /
                        parseFloat(
                          mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                        )) *
                      (parseFloat(slippage) * 0.01)
                  ).toFixed(2)
                : (
                    parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                      (parseFloat(
                        mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                      ) /
                        parseFloat(
                          mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                        )) -
                    parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                      (parseFloat(
                        mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                      ) /
                        parseFloat(
                          mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                        )) *
                      (parseFloat(slippage) * 0.01)
                  ).toFixed(2)}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            <div className="ml-auto text-xs">{gasFee}</div>
          </div>
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
                        placeholder="0%"
                        className="bg-dark rounded-xl outline-none border border-grey1 pl-3 placeholder:text-grey1"
                        value={auxSlippage + '%'}
                        onChange={(e) =>
                          setAuxSlippage(
                            parseFloat(e.target.value.replace(/[^\d.-]/g, '')) <
                              100
                              ? e.target.value.replace(/[^\d.-]/g, '')
                              : '',
                          )
                        }
                      />
                      <button
                        className=" w-full py-2.5 px-12 mx-auto text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
                        onClick={(e) => setSlippage(auxSlippage)}
                      >
                        Set
                      </button>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          </div>
        </div>
        <div className="w-full mt-4 align-middle items-center flex bg-dark border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            {inputBox('0')}
            {mktRate[tokenIn.symbol] != '~$NaN' ? (
              <div className="flex">
                <div className="flex text-xs text-[#4C4C4C]">
                  {mktRate[tokenIn.symbol]}
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
                  <div className="flex text-xs text-[#4C4C4C]" key={balance0}>
                    Balance: {balance0 === 'NaN' ? 0 : balance0}
                  </div>
                  {isConnected && stateChainName === 'arbitrumGoerli' ? (
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
              {hasSelected &&
              mktRate[tokenIn.symbol] != '~$NaN' &&
              mktRate[tokenOut.symbol] != '~$NaN' &&
              bnInput._hex != '0x00' ? (
                <div>
                  {(
                    parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    (parseFloat(
                      mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                    ) /
                      parseFloat(
                        mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                      ))
                  ).toFixed(2)}
                </div>
              ) : (
                <div>0</div>
              )}
            </div>
            {mktRate[tokenOut.symbol] != '~$NaN' ? (
              <div className="flex">
                <div className="flex text-xs text-[#4C4C4C]">
                  {mktRate[tokenOut.symbol]}
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
                      Balance: {balance1 === 'NaN' ? 0 : balance1}
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
                  className="bg-[#0C0C0C] outline-none"
                  placeholder="0"
                  type="number"
                />
                <>
                  {/* 
                {hasSelected === false ||
                String(
                  parseFloat(mktRate[tokenOut.symbol].replace(/[^\d.-]/g, "")) /
                    parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ""))
                ) == "NaN" ? (
                  <div>?</div>
                ) : tokenOrder && hasSelected === true ? (
                  <div>
                    {parseFloat(
                      mktRate[tokenOut.symbol].replace(/[^\d.-]/g, "")
                    ) /
                      parseFloat(
                        mktRate[tokenIn.symbol].replace(/[^\d.-]/g, "")
                      )}
                  </div>
                ) : (
                  <div>
                    {parseFloat(
                      mktRate[tokenIn.symbol].replace(/[^\d.-]/g, "")
                    ) /
                      parseFloat(
                        mktRate[tokenOut.symbol].replace(/[^\d.-]/g, "")
                      )}
                  </div>
                )}
                 */}
                </>
                <div className="flex">
                  {/* <div className="flex text-xs text-[#4C4C4C]"> // Implement later 
                    98% above Market Price
                  </div> */}
                </div>
              </div>
              <div className="flex w-1/2">
                <div className="flex justify-center ml-auto">
                  <div className="flex-col">
                    <div className="flex justify-end">
                      {tokenOrder && hasSelected === false ? (
                        <button
                          className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                          onClick={() => setTokenOrder(false)}
                        >
                          {tokenIn.symbol} per ?
                          <ArrowPathIcon className="w-5" />
                        </button>
                      ) : tokenOrder && hasSelected === true ? (
                        <button
                          className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                          onClick={() => setTokenOrder(false)}
                        >
                          {tokenIn.symbol} per {tokenOut.symbol}
                          <ArrowPathIcon className="w-5" />
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                          onClick={() => setTokenOrder(true)}
                        >
                          {tokenOut.symbol} per {tokenIn.symbol}
                          <ArrowPathIcon className="w-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 px-1 mt-2">
                      {/* <div className="text-xs text-white">
                        Set to Market Price // Implement later
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
              1 {tokenIn.symbol} =
              {tokenOut.symbol === 'Select Token'
                ? ' ?'
                : ' ' +
                  (parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, '')) /
                    parseFloat(
                      mktRate[tokenOut.symbol].replace(/[^\d.-]/g, '')
                    )).toFixed(2)}{' '}
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
        {isDisconnected ? <ConnectWalletButton xl={true} /> : 
        (
          <>
        {
        stateChainName !== 'arbitrumGoerli' ||
        mktRate[tokenIn.symbol] === '~$NaN' ||
        mktRate[tokenOut.symbol] === '~$NaN' ||
        String(
          parseFloat(mktRate[tokenOut.symbol].replace(/[^\d.-]/g, '')) /
            parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, '')),
        ) == 'NaN' ||
        bnInput._hex == '0x00' ? (
          <button 
          disabled
        className="w-full py-4 mx-auto cursor-not-allowed font-medium opacity-20 text-center transition rounded-xl bg-gradient-to-r from-[#344DBF] to-[#3098FF]"
      >
        Swap
      </button>
        ) : Number(rangeQuote) < Number(coverQuote) ? (
          Number(allowanceRange) <
          Number(ethers.utils.formatUnits(bnInput, 18)) ? (
            <div>
              <div className="flex-none text-xs uppercase text-[#C9C9C9]">
                Your {tokenIn.symbol} rangePool allowance is missing{' '}
                {Number(ethers.utils.formatUnits(bnInput, 18)) -
                  Number(allowanceRange)}{' '}
                {tokenIn.symbol}
              </div>
              <SwapRangeApproveButton
                poolAddress={rangePoolRoute}
                approveToken={tokenIn.address}
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
              baseLimit={
                tokenOut.address != '' &&
                tokenIn.address.localeCompare(tokenOut.address) < 0
              ? BigNumber.from(TickMath.getSqrtPriceAtPriceString((rangeBnPrice.sub(rangeBnBaseLimit)).toString(), 18).toString())
              : BigNumber.from(TickMath.getSqrtPriceAtPriceString((rangeBnPrice.add(rangeBnBaseLimit)).toString(), 18).toString())
              }
            />
          )
        ) : Number(allowanceCover) <
          Number(ethers.utils.formatUnits(bnInput, 18)) ? (
          <div>
            <div className="flex-none ">
              Your {tokenIn.symbol} coverPool allowance is missing{' '}
              {Number(ethers.utils.formatUnits(bnInput, 18)) -
                Number(allowanceCover)}{' '}
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
              tokenOut.address != '' &&
              tokenIn.address.localeCompare(tokenOut.address) < 0
            }
            amount={bnInput}
            baseLimit={
              tokenOut.address != '' &&
              tokenIn.address.localeCompare(tokenOut.address) < 0
            ? BigNumber.from(TickMath.getSqrtPriceAtPriceString((coverBnPrice.sub(coverBnBaseLimit)).toString(), 18).toString())
            : BigNumber.from(TickMath.getSqrtPriceAtPriceString((coverBnPrice.add(coverBnBaseLimit)).toString(), 18).toString())
            }
          />
        )}
        </>
        )}
      </div>
    </div>
  )
}
