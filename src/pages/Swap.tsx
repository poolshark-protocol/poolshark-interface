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
  rangePoolAddress,
  coverPoolAddress,
} from '../constants/contractAddresses'
import { useProvider, useContractRead } from 'wagmi'
import { BigNumber, Contract, ethers } from 'ethers'
import { chainIdsToNamesForGitTokenList } from '../utils/chains'
import { coverPoolABI } from '../abis/evm/coverPool'
import {
  fetchPrice,
  getCoverPoolFromFactory,
  getCoverPrice,
  getCoverQuote,
  getRangePoolFromFactory,
  getRangePrice,
  getRangeQuote,
} from '../utils/queries'
import { useSwapStore } from '../hooks/useStore'
import SwapRangeApproveButton from '../components/Buttons/SwapRangeApproveButton'
import SelectTokenButton from '../components/Buttons/SelectTokenButtonSwap'
import SwapRangeButton from '../components/Buttons/SwapRangeButton'
import SwapCoverApproveButton from '../components/Buttons/SwapCoverApproveButton'
import SwapCoverButton from '../components/Buttons/SwapCoverButton'
import {
  getCoverQuoteWagmi,
  getCoverPriceWagmi,
} from '../utils/getPriceAndQuotes'
import CoverQuote from '../components/CoverQuote'
import useSwapAllowance from '../hooks/useSwapAllowance'
import { rangePoolABI } from '../abis/evm/rangePool'

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
  /* const rangeAllowance = useAllowance(address)
  const coverAllowance = useAllowance(address) */
  /* const [allowance, setAllowance] = useState('0') */
  const [gasFee, setGasFee] = useState('')
  const [rangeBaseLimit, setRangeBaseLimit] = useState(undefined)
  const [coverBaseLimit, setCoverBaseLimit] = useState(undefined)
  const [coverQuote, setCoverQuote] = useState(undefined)
  const [rangeQuote, setRangeQuote] = useState(undefined)
  const [coverPrice, setCoverPrice] = useState(undefined)
  const [rangePrice, setRangePrice] = useState(undefined)
  const [coverCurrentPrice, setCoverCurrentPrice] = useState(undefined)
  const [rangeCurrentPrice, setRangeCurrentPrice] = useState(undefined)
  const [zeroForOne, setZeroForOne] = useState(true)
  const [hasSelected, setHasSelected] = useState(false)
  const [mktRate, setMktRate] = useState({})
  const [tokenIn, setTokenIn] = useState({
    symbol: 'WETH',
    logoURI: '/static/images/eth_icon.png',
    //address: tokenZeroAddress,
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

  const { data: signer } = useSigner()
  const provider = useProvider()

  const { data: dataRange } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, rangePoolAddress],
    chainId: 421613,
    watch: true,
    onError(error) {
      console.log('Error', error)
    },
  })
  const { data: dataCover } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, coverPoolAddress],
    chainId: 421613,
    watch: true,
    onError(error) {
      console.log('Error', error)
    },
  })

  const { data: priceCover } = useContractRead({
    address: coverPoolAddress,
    abi: coverPoolABI,
    functionName: zeroForOne ? "pool1" : "pool0",
    args: [],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      console.log("Success price Cover", data);
      setCoverPrice(parseFloat(ethers.utils.formatUnits(data[4], 18)))
    },
    onError(error) {
      console.log("Error price Cover", error);
    },
    onSettled(data, error) {
      console.log("Settled price Cover", { data, error });
    },
  });

  const { data: priceRange } = useContractRead({
    address: rangePoolAddress,
    abi: rangePoolABI,
    functionName: zeroForOne ? "pool1" : "pool0",
    args: [],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      console.log("Success price Range", data);
      setRangePrice(parseFloat(ethers.utils.formatUnits(data[4], 18)))
    },
    onError(error) {
      console.log("Error price Range", error);
    },
    onSettled(data, error) {
      console.log("Settled price Range", { data, error });
    },
  });

  const {
    network: { chainId },
  } = useProvider()

  useEffect(() => {
    setAllowanceRange(ethers.utils.formatUnits(dataRange, 18))
    setAllowanceCover(ethers.utils.formatUnits(dataCover, 18))
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
  }, [tokenOut, tokenIn])

  useEffect(() => {
    updateSwapAmount(bnInput)
  }, [bnInput])

  /* useEffect(() => {
    getAllowance()
  }, [tokenIn]) */

  useEffect(() => {
    getRangePool()
  }, [hasSelected, tokenIn.address, tokenOut.address, bnInput, bnInputLimit])

  useEffect(() => {
    getCoverPool()
  }, [hasSelected, tokenIn.address, tokenOut.address, bnInput, bnInputLimit])

  useEffect(() => {
    fetchTokenPrice()
  }, [rangeQuote, coverQuote, tokenIn, tokenOut])

  // useEffect(() => {
  //   if (isConnected && stateChainName === "arbitrumGoerli") {
  //     if (Number(balanceZero().props.children[1]) >= 1000000)
  //       setBalance0(Number(balanceZero().props.children[1]).toExponential(5));
  //     }
  //     setBalance0(Number(balanceZero().props.children[1]).toFixed(2));
  //   }
  // }, [queryTokenIn]);

  // useEffect(() => {
  //   if (isConnected && stateChainName === "arbitrumGoerli") {
  //     if (Number(balanceOne().props.children[1]) >= 1000000) {
  //       setBalance1(Number(balanceOne().props.children[1]).toExponential(5));
  //     }
  //     setBalance1(Number(balanceOne().props.children[1]).toFixed(2));
  //   }
  // }, [queryTokenOut, balanceOne]);

  function closeModal() {
    setIsOpen(false)
  }

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
        /* if (Number(ethers.utils.formatEther(balance1)) >= 1000000) {
          bal1 = Number(ethers.utils.formatEther(balance1)).toExponential(5)
        }
        if (
          0 < Number(ethers.utils.formatEther(balance1)) &&
          Number(ethers.utils.formatEther(balance1)) < 1000000
        ) {
          console.log('here')
          bal1 = Number(ethers.utils.formatEther(balance1)).toFixed(2)
        }
        if (Number(ethers.utils.formatEther(balance2)) >= 1000000) {
          console.log('here2')
          bal2 = Number(ethers.utils.formatEther(balance2)).toExponential(5)
        }
        if (
          0 < Number(ethers.utils.formatEther(balance2)) &&
          Number(ethers.utils.formatEther(balance2)) < 1000000
        ) {
          console.log('here3')
          bal2 = Number(ethers.utils.formatEther(balance2)).toFixed(2)
        } */

        setBalance1(bal2)
      }
      /* let bal1 = await tokenOutBal.balanceOf(address)
      let displayBal1: string
      if (Number(ethers.utils.formatEther(bal1)) >= 1000000) {
        displayBal1 = Number(ethers.utils.formatEther(bal1)).toExponential(5)
      }
      if (
        0 < Number(ethers.utils.formatEther(bal1)) &&
        Number(ethers.utils.formatEther(bal1)) < 1000000
      ) {
        displayBal1 = Number(ethers.utils.formatEther(bal1)).toFixed(2)
      }
       */
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

  /* const getAllowance = async () => {
    const allowance = await useSwapAllowance(address)
    console.log('allowance', allowance)
    setAllowance(allowance)
  } */

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
      const contract = new ethers.Contract(
        coverPoolAddress,
        coverPoolABI,
        provider,
      )
      const recipient = address
      const zeroForOne =
        tokenOut.address != '' && tokenIn.address < tokenOut.address
      // const priceLimit =
      const estimation = await contract.estimateGas.swap(
        recipient,
        zeroForOne,
        bnInput,
        BigNumber.from('79228162514264337593543950336'), // price of 1.00
      )
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
    } catch (error) {
      console.log(error)
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
        const price = await getRangeQuote(
          rangePoolAddress,
          bnInput,
          BigNumber.from('4295128739'),
          tokenIn.address,
          tokenOut.address,
        )

        /*const currentPrice = await getRangePrice(
          rangePoolAddress,
          true
        )*/

        setRangeQuote(price)
        setRangeBaseLimit(price)
        //setRangeCurrentPrice(currentPrice)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getCoverPool = async () => {
    try {
      if (hasSelected === true) {
        /* console.log(tokenIn, tokenOut) */

        const pool = await getCoverPoolFromFactory(
          tokenIn.address,
          tokenOut.address,
        )

        const id = pool['data']['coverPools']['0']['id']
        console.log('pool ID', id)

        const price = await getCoverQuote(
          coverPoolAddress,
          bnInput,
          BigNumber.from('4295128739'),
          tokenIn.address,
          tokenOut.address,
        )

        /*const currentPrice = await getCoverPrice(
          coverPoolAddress,
          true
        )*/

        setCoverQuote(price)
        setCoverBaseLimit(price)
        //setCoverCurrentPrice(currentPrice)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchTokenPrice = async () => {
    try {
      //const price = await fetchPrice('0x000')
      if (Number(rangeQuote) > Number(coverQuote)) {
        const price = rangeQuote
        setMktRate({
          WETH:
            '~' +
            Number(price).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
          USDC: '~1.00',
        })
      } else {
        const price = coverQuote
        setMktRate({
          WETH:
            '~' +
            Number(price).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
          USDC: '~1.00',
        })
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
                  : (parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    (parseFloat(
                      mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                    ) /
                      parseFloat(
                        mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                      ))).toFixed(2)
                : coverQuote === undefined
                ? 'Select Token'
                : (parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                  (parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, '')) /
                    parseFloat(
                      mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                    ))).toFixed(2)}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Price Impact</div>
            <div className="ml-auto text-xs">-{
            Number(rangePrice) < Number(coverPrice) ?
          (((parseFloat(rangePrice) - parseFloat(rangeQuote)) * 100) / rangePrice).toFixed(2) :
          (((parseFloat(coverPrice) - parseFloat(coverQuote)) * 100) / coverPrice).toFixed(2)}</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Minimum received after slippage ({slippage}%)
            </div>
            <div className="ml-auto text-xs">
              {Number(rangeQuote) < Number(coverQuote)
                ? (parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
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
                    (parseFloat(slippage) * 0.01)).toFixed(2)
                : (parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
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
                    (parseFloat(slippage) * 0.01)).toFixed(2)}
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
            {LimitActive ? null
            : 
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
                    <h1>Range Tolerance</h1>
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
            </Popover>}
          </div>
        </div>
        <div className="w-full mt-4 align-middle items-center flex bg-dark border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            {inputBox('0')}
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C]">
                {mktRate[tokenIn.symbol]}
              </div>
            </div>
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
                  ) 
                  : null}
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
              {hasSelected ? (
                <div>
                  {(parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                    (parseFloat(
                      mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                    ) /
                      parseFloat(
                        mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                      ))).toFixed(2)}
                </div>
              ) : (
                <div>0</div>
              )}
            </div>
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C] ">
                {mktRate[tokenOut.symbol]}
              </div>
            </div>
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
                      index="1"
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
                {tokenOrder && hasSelected === false ? (
                  <div>Select Token</div>
                ) : tokenOrder && hasSelected === true ? (
                  <div>
                    {parseFloat(
                      mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                    ) /
                      parseFloat(
                        mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                      )}
                  </div>
                ) : (
                  <div>
                    {parseFloat(
                      mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''),
                    ) /
                      parseFloat(
                        mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                      )}
                  </div>
                )}
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
                  parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, '')) /
                    parseFloat(
                      mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                    )}{' '}
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
        {isDisconnected ? <ConnectWalletButton /> : null}
        {isDisconnected ||
        stateChainName !== 'arbitrumGoerli' ||
        bnInput._hex == '0x00' ? null : hasSelected === false ? (
          <SelectTokenButton />
        ) : Number(rangeQuote) < Number(coverQuote) ? (
          Number(allowanceRange) <
          Number(ethers.utils.formatUnits(bnInput, 18)) ? (
            <div>
              <div className="flex-none text-xs uppercase text-[#C9C9C9]">
                Your {tokenIn.symbol} rangePool allowance is missing {' '}
                {Number(ethers.utils.formatUnits(bnInput, 18)) -
                  Number(allowanceRange)}{' '}
                {tokenIn.symbol}
              </div>
              <SwapRangeApproveButton approveToken={tokenIn.address} />
            </div>
          ) : (
            <SwapRangeButton
              zeroForOne={
                tokenOut.address != '' && tokenIn.address < tokenOut.address
              }
              amount={bnInput}
              baseLimit={rangeBaseLimit}
            />
          )
        ) : Number(allowanceCover) <
          Number(ethers.utils.formatUnits(bnInput, 18)) ? (
          <div>
            <div className="flex-none ">
              Your {tokenIn.symbol} coverPool allowance is missing {' '}
              {Number(ethers.utils.formatUnits(bnInput, 18)) -
                Number(allowanceCover)}{' '}
              {tokenIn.symbol}
            </div>
            <SwapCoverApproveButton approveToken={tokenIn.address} />
          </div>
        ) : (
          <SwapCoverButton
            zeroForOne={
              tokenOut.address != '' && tokenIn.address < tokenOut.address
            }
            amount={bnInput}
            baseLimit={coverBaseLimit}
          />
        )}
      </div>
    </div>
  )
}

/* ? (  &&
          
        ) */

/*  stateChainName !== 'arbitrumGoerli' ? Number(rangePrice) <
          Number(coverPrice) ? (
          
        ) : Number(coverPrice) < rangePrice ? (
          
        ) : <div>Ola</div> : */

/* 
        Number(allowance) < Number(bnInput) ? (
          Number(rangePrice) < Number(coverPrice) ? (
            <SwapRangeApproveButton approveToken={tokenIn.address} />
          ) : (
            <SwapCoverApproveButton approveToken={tokenIn.address} />
          )
        ) : Number(rangePrice) < Number(coverPrice) ? (
          <SwapRangeButton
            zeroForOne={
              tokenOut.address != '' && tokenIn.address < tokenOut.address
            }
            amount={bnInput}
            baseLimit={rangeBaseLimit}
          />
        ) : (
          <SwapCoverButton
            zeroForOne={
              tokenOut.address != '' && tokenIn.address < tokenOut.address
            }
            amount={bnInput}
            baseLimit={coverBaseLimit}
          />
        ) */
