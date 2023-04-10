import {
  AdjustmentsHorizontalIcon,
  ArrowSmallDownIcon,
} from '@heroicons/react/24/outline'
import { useState, useEffect, Fragment, SetStateAction } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/20/solid'
import SelectToken from '../components/SelectToken'
import useInputBox from '../hooks/useInputBox'
import { ConnectWalletButton } from '../components/Buttons/ConnectWalletButton'
import { erc20ABI, useAccount } from 'wagmi'
import {
  coverPoolAddress,
  rangePoolAddress,
  rangeTokenZero,
  tokenOneAddress,
  tokenZeroAddress,
} from '../constants/contractAddresses'
import { useProvider } from 'wagmi'
import { BigNumber, Contract, ethers } from 'ethers'
import { chainIdsToNamesForGitTokenList } from '../utils/chains'
import { coverPoolABI } from '../abis/evm/coverPool'
import {
  fetchPrice,
  getCoverPoolFromFactory,
  getCoverQuote,
  getRangePoolFromFactory,
  getRangeQuote,
} from '../utils/queries'
import { useSwapStore } from '../hooks/useStore'
import SwapRangeApproveButton from '../components/Buttons/SwapRangeApproveButton'
import { bn } from 'fuels'
import SelectTokenButton from '../components/Buttons/SelectTokenButtonSwap'
import useRangeAllowance from '../hooks/useRangeAllowance'
import useCoverAllowance from '../hooks/useCoverAllowance'
import SwapRangeButton from '../components/Buttons/SwapRangeButton'
import SwapCoverApproveButton from '../components/Buttons/SwapCoverApproveButton'
import SwapCoverButton from '../components/Buttons/SwapCoverButton'

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
  const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()
  const rangeAllowance = useRangeAllowance(address)
  const coverAllowance = useCoverAllowance(address)
  const [gasFee, setGasFee] = useState('')
  const [rangeBaseLimit, setRangeBaseLimit] = useState('')
  const [coverBaseLimit, setCoverBaseLimit] = useState('')
  const [coverPrice, setCoverPrice] = useState(undefined)
  const [rangePrice, setRangePrice] = useState(undefined)
  const [hasSelected, setHasSelected] = useState(false)
  const [mktRate, setMktRate] = useState({})
  const [queryToken0, setQueryToken0] = useState(tokenOneAddress)
  const [queryToken1, setQueryToken1] = useState(tokenOneAddress)
  const [token0, setToken0] = useState({
    symbol: 'WETH',
    logoURI: '/static/images/eth_icon.png',
    address: rangeTokenZero,
  } as token)
  const [token1, setToken1] = useState({} as token)
  const [tokenIn, setTokenIn] = useState({
    symbol: 'WETH',
    logoURI: '/static/images/eth_icon.png',
    address: rangeTokenZero,
  })
  const [tokenOut, setTokenOut] = useState({
    symbol: 'Select Token',
    logoURI: '',
    address: '',
  })
  const [slipage, setSlipage] = useState('0.5')

  //@dev put balanc

  const getBalances = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://arb-goerli.g.alchemy.com/v2/M8Dr_KQx46ghJ93XDQe7j778Qa92HRn2',
        421613,
      )
      const signer = new ethers.VoidSigner(address, provider)
      console.log(tokenIn)
      const token1Bal = new ethers.Contract(tokenIn.address, erc20ABI, signer)
      let token2Bal: Contract
      if (hasSelected === true) {
        token2Bal = new ethers.Contract(tokenOut.address, erc20ABI, signer)
        const balance2 = await token2Bal.balanceOf(address)
        const balance1 = await token1Bal.balanceOf(address)
        let bal1: string
        let bal2: string
        if (Number(ethers.utils.formatEther(balance1)) >= 1000000) {
          bal1 = Number(ethers.utils.formatEther(balance1)).toExponential(5)
        }
        if (
          0 < Number(ethers.utils.formatEther(balance1)) &&
          Number(ethers.utils.formatEther(balance1)) < 1000000
        ) {
          bal1 = Number(ethers.utils.formatEther(balance1)).toFixed(2)
        }
        if (Number(ethers.utils.formatEther(balance2)) >= 1000000) {
          bal2 = Number(ethers.utils.formatEther(balance2)).toExponential(5)
        }
        if (
          0 < Number(ethers.utils.formatEther(balance2)) &&
          Number(ethers.utils.formatEther(balance2)) < 1000000
        ) {
          bal2 = Number(ethers.utils.formatEther(balance2)).toFixed(2)
        }
        setBalance0(bal1)
        setBalance1(bal2)
      }
      let bal1 = await token1Bal.balanceOf(address)
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
      setBalance0(displayBal1)
    } catch (error) {
      console.log(error)
    }
  }

  const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('0.00')
  const [stateChainName, setStateChainName] = useState()

  const {
    network: { chainId },
  } = useProvider()

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId])
  }, [chainId])

  useEffect(() => {
    getBalances()
  }, [tokenOut, tokenIn])

  useEffect(() => {
    updateSwapAmount(bnInput)
  }, [bnInput])

  // useEffect(() => {
  //   if (isConnected && stateChainName === "arbitrumGoerli") {
  //     if (Number(balanceZero().props.children[1]) >= 1000000)
  //       setBalance0(Number(balanceZero().props.children[1]).toExponential(5));
  //     }
  //     setBalance0(Number(balanceZero().props.children[1]).toFixed(2));
  //   }
  // }, [queryToken0]);

  // useEffect(() => {
  //   if (isConnected && stateChainName === "arbitrumGoerli") {
  //     if (Number(balanceOne().props.children[1]) >= 1000000) {
  //       setBalance1(Number(balanceOne().props.children[1]).toExponential(5));
  //     }
  //     setBalance1(Number(balanceOne().props.children[1]).toFixed(2));
  //   }
  // }, [queryToken1, balanceOne]);

  function changeDefaultIn(token: token) {
    if (token.symbol === tokenOut.symbol) {
      return
    }
    setTokenIn(token)
    if (token.address.localeCompare(tokenOut.address) < 0) {
      setToken0(token)
      if (hasSelected === true) {
        setToken1(tokenOut)
      }
      return
    }
    if (token.address.localeCompare(tokenOut.address) >= 0) {
      if (hasSelected === true) {
        setToken0(tokenOut)
      }
      setToken1(token)
      return
    }
  }

  const [tokenOrder, setTokenOrder] = useState(true)

  const changeDefaultOut = (token: token) => {
    if (token.symbol === tokenIn.symbol) {
      return
    }
    setTokenOut(token)
    setHasSelected(true)
    if (token.address.localeCompare(tokenIn.address) < 0) {
      setToken0(token)
      setToken1(tokenIn)
      return
    }

    if (token.address.localeCompare(tokenIn.address) >= 0) {
      setToken0(tokenIn)
      setToken1(token)
      return
    }
  }

  let [isOpen, setIsOpen] = useState(false)
  const [LimitActive, setLimitActive] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function switchDirection() {
    setTokenOrder(!tokenOrder)
    const temp = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(temp)
    console.log(tokenIn)
    console.log(tokenOut)
    // const tempBal = queryToken0;
    // setQueryToken0(queryToken1);
    // setQueryToken1(tempBal);
    //setMktRate({ eth: mktRate['usdc'], usdc: mktRate['eth'] })
  }

  function openModal() {
    setIsOpen(true)
  }

  const [expanded, setExpanded] = useState(false)

  /*const getAllowance = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
      );
      const signer = new ethers.VoidSigner(address, provider);
      const contract = new ethers.Contract(tokenIn.address, erc20ABI, signer);
      const allowance = await contract.allowance(
        address,
        rangePoolAddress
      );
      setAllowance(allowance);
      console.log("here", allowance.toString());
    } catch (error) {
      console.log(error);
    }
  };*/

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

  useEffect(() => {
    fetchTokenPrice()
  }, [])

  useEffect(() => {
    setTimeout(() => {
      gasEstimate()
    }, 10000)
  }, [])

  /*useEffect(() => {
    getAllowance();
  }, [tokenIn.address]);*/
  // or allowance from Zustand

  const getRangePool = async () => {
    try {
      if (hasSelected === true) {
        console.log(token0, token1)
        const pool = await getRangePoolFromFactory(
          token0.address,
          token1.address,
        )
        const id = pool['data']['rangePools']['0']['id']
        const price = await getRangeQuote(
          id,
          bnInput,
          bnInputLimit,
          token0.address,
          token1.address,
        )
        setRangePrice(price)
        setRangeBaseLimit(price)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getCoverPool = async () => {
    try {
      if (hasSelected === true) {
        console.log(token0, token1)
        const pool = await getCoverPoolFromFactory(
          token0.address,
          token1.address,
        )
        const id = pool['data']['coverPools']['0']['id']
        const price = await getCoverQuote(
          id,
          bnInput,
          bnInputLimit,
          token0.address,
          token1.address,
        )
        setCoverPrice(price)
        setCoverBaseLimit(price)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getRangePool()
  }, [hasSelected, token0.address, token1.address, bnInput, bnInputLimit])

  useEffect(() => {
    getCoverPool()
  }, [hasSelected, token0.address, token1.address, bnInput, bnInputLimit])

  const fetchTokenPrice = async () => {
    try {
      const price = await fetchPrice('0x000')
      setMktRate({
        WETH:
          '~' +
          Number(price['data']['bundles']['0']['ethPriceUSD']).toLocaleString(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            },
          ),
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
            <div className="ml-auto text-xs">
              {rangePrice === undefined ? 'Select Token' : rangePrice}
            </div>
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
              Swap
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
                    <h1>Slippage Tolerance</h1>
                    <div className="flex mt-3 gap-x-3">
                      <input
                        placeholder="0%"
                        className="bg-dark rounded-xl outline-none border border-grey1 pl-3 placeholder:text-grey1"
                        value={slipage}
                        onChange={(e) => setSlipage(e.target.value)}
                      />
                      <button className=" w-full py-2.5 px-12 mx-auto text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
                        Auto
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
                    balance={setQueryToken0}
                    key={queryToken0}
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
            <input
              className=" bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
              placeholder="0"
            />
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
                      balance={setQueryToken1}
                      key={queryToken1}
                    />
                  ) : (
                    //@dev add skeletons on load when switching sides/ initial selection
                    <SelectToken
                      index="1"
                      selected={hasSelected}
                      tokenChosen={changeDefaultOut}
                      displayToken={tokenOut}
                      balance={setQueryToken1}
                      key={queryToken1}
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
                {/*TODO@retraca here mkt rate from fetch price */}
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
        {isDisconnected ? null : hasSelected === false ? (
          <SelectTokenButton />
        ) : stateChainName !== 'arbitrumGoerli' ? null : Number(rangePrice) <
            Number(coverPrice) && rangeAllowance === '0.0' ? (
          <SwapRangeApproveButton approveToken={tokenIn.address} />
        ) : Number(coverPrice) < rangePrice && coverAllowance === '0.0' ? (
          <SwapCoverApproveButton approveToken={tokenIn.address} />
        ) : stateChainName !== 'arbitrumGoerli' ? null : Number(rangePrice) <
          Number(coverPrice) ? (
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
        )}
      </div>
    </div>
  )
}
