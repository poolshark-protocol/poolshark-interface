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
import { TickMath } from '../../utils/math/tickMath'
import { BigNumber, Contract, ethers } from 'ethers'
import { useCoverStore } from '../../hooks/useStore'
import { getCoverPoolFromFactory } from '../../utils/queries'
import JSBI from 'jsbi'
import SwapCoverApproveButton from '../Buttons/SwapCoverApproveButton'
import { coverPoolABI } from '../../abis/evm/coverPool'
import { useRouter } from 'next/router'
import { ZERO_ADDRESS } from '../../utils/math/constants'

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
  const [minPrice, setMinPrice] = useState('0')
  const [maxPrice, setMaxPrice] = useState('0')
  const [min, setMin] = useState(initialBig)
  const [max, setMax] = useState(initialBig)
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
    symbol: props.query ? props.query.tokenZeroSymbol: 'TOKEN20A',
    logoURI: props.query ? props.query.tokenZeroLogoURI: 'https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    address: props.query ? props.query.tokenZeroAddress: '0x829e4a03A5Bd1EC5b6f5CC1d3A77c8e54A294847',
  })
  const [tokenOut, setTokenOut] = useState({
    symbol: props.query ? props.query.tokenOneSymbol: 'Select Token',
    logoURI: props.query ? props.query.tokenOneLogoURI: undefined,
    address: props.query ? props.query.tokenOneAddress:'0xf853592f1e4ceA2B5e722A17C6f917a4c70d40Ca',
  })
  const [usdcBalance, setUsdcBalance] = useState(0)
  const [amountToPay, setAmountToPay] = useState(0)
  const [prices, setPrices] = useState({ tokenIn: 0, tokenOut: 0 })
  const [coverQuote, setCoverQuote] = useState(undefined)
  const [coverTickPrice, setCoverTickPrice] = useState(undefined)
  const [coverPoolRoute, setCoverPoolRoute] = useState(undefined)
  const [tokenOrder, setTokenOrder] = useState(true)
  const poolId =
    router.query.poolId === undefined ? '' : router.query.poolId.toString()

  function setParams(query: any) {
    setPool({
      poolId: query.poolId,
    })
  }

  const { data } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, coverPoolRoute],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      console.log('Success')
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      console.log('Settled', { data, error })
    },
  })

  const { refetch: refetchcoverQuote, data: priceCover } = useContractRead({
    address: coverPoolRoute,
    abi: coverPoolABI,
    functionName:
      tokenOut.address != '' &&
      tokenIn.address.localeCompare(tokenOut.address) === -1
        ? 'pool1'
        : 'pool0',
    args: [],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      //console.log('Success price Cover', data)
      setCoverQuote(parseFloat(ethers.utils.formatUnits(data[1], 18)))
    },
    onError(error) {
      console.log('Error price Cover', error)
    },
    onSettled(data, error) {
      //console.log('Settled price Cover', { data, error })
    },
  })

  useEffect(() => {
    if (data) {
      setAllowance(ethers.utils.formatUnits(data, 18))
    }
  }, [data, tokenIn.address, bnInput])

  useEffect(() => {
    setCoverParams()
  }, [minPrice, maxPrice, bnInput, coverQuote])

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
    fetchTokenPrice()
  }, [coverQuote])

  useEffect(() => {
    setParams(router.query)
  }, [router])

  useEffect(() => {
    getCoverPool()
  }, [hasSelected, tokenIn.address, tokenOut.address])

  console.log('tokenIn', tokenIn)
  console.log('coverTickPrice', Number(coverTickPrice))
  console.log('mktRatePrice', mktRate[tokenIn.symbol])

  const getCoverPool = async () => {
    try {
      var pool = undefined
      if (tokenIn.address.localeCompare(tokenOut.address) === -1) {
        pool = await getCoverPoolFromFactory(tokenIn.address, tokenOut.address)
      } else {
        pool = await getCoverPoolFromFactory(tokenOut.address, tokenIn.address)
      }
      let id = ZERO_ADDRESS
      let dataLength = pool['data']['coverPools'].length
      if (dataLength != 0) id = pool['data']['coverPools']['0']['id']
      setCoverPoolRoute(id)
    } catch (error) {
      console.log(error)
    }
  }

  async function setCoverParams() {
    try {
      if (
        minPrice !== undefined &&
        minPrice !== '' &&
        maxPrice !== undefined &&
        maxPrice !== '' &&
        Number(ethers.utils.formatUnits(bnInput)) !== 0 &&
        hasSelected == true
      ) {
        const min = TickMath.getTickAtPriceString(minPrice)
        const max = TickMath.getTickAtPriceString(maxPrice)
        /* updateCoverContractParams({
          prevLower: ethers.utils.parseUnits(
            data['data']['ticks'][0]['index'],
            0,
          ),
          min: ethers.utils.parseUnits(String(min), 0),
          prevUpper: ethers.utils.parseUnits(
            data1['data']['ticks'][0]['index'],
            0,
          ),
          max: ethers.utils.parseUnits(String(max), 0),
          claim: ethers.utils.parseUnits(String(min), 0),
          amount: bnInput,
          inverse: false,
        }) */
        setDisabled(false)
        setMin(BigNumber.from(String(min)))
        setMax(BigNumber.from(String(max)))
      }
    } catch (error) {
      console.log(error)
    }

    try {
      if (coverQuote) {
        const price = TickMath.getTickAtPriceString(coverQuote)
        //console.log('price', price)
        setCoverTickPrice(ethers.utils.parseUnits(String(price), 0))
      }
    } catch (error) {
      setCoverTickPrice(ethers.utils.parseUnits(String(coverQuote), 0))
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
    //console.log(token)
    setTokenIn(token)
  }

  const changeDefault1 = (token: {
    symbol: string
    logoURI: any
    address: string
  }) => {
    if (token.symbol === tokenIn.symbol || token.address === tokenIn.address) {
      return
    }
    //console.log(token)
    setTokenOut(token)
    setHasSelected(true)
    setDisabled(false)
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
    setAmountToPay(Number(current.value))
  }

  const changePrice = (direction: string, minMax: string) => {
    if (direction === 'plus' && minMax === 'min') {
      if (
        (document.getElementById('minInput') as HTMLInputElement).value ===
        undefined
      ) {
        const current = document.getElementById('minInput') as HTMLInputElement
        current.value = '1'
      }
      const current = Number(
        (document.getElementById('minInput') as HTMLInputElement).value,
      )
      ;(document.getElementById('minInput') as HTMLInputElement).value = String(
        (current + 0.01).toFixed(3),
      )
    }
    if (direction === 'minus' && minMax === 'min') {
      const current = Number(
        (document.getElementById('minInput') as HTMLInputElement).value,
      )
      if (current === 0 || current - 1 < 0) {
        ;(document.getElementById('minInput') as HTMLInputElement).value = '0'
        return
      }
      ;(document.getElementById('minInput') as HTMLInputElement).value = (
        current - 0.01
      ).toFixed(3)
    }

    if (direction === 'plus' && minMax === 'max') {
      if (
        (document.getElementById('maxInput') as HTMLInputElement).value ===
        undefined
      ) {
        const current = document.getElementById('maxInput') as HTMLInputElement
        current.value = '1'
      }
      const current = Number(
        (document.getElementById('maxInput') as HTMLInputElement).value,
      )
      ;(document.getElementById('maxInput') as HTMLInputElement).value = (
        current + 0.01
      ).toFixed(3)
    }
    if (direction === 'minus' && minMax === 'max') {
      const current = Number(
        (document.getElementById('maxInput') as HTMLInputElement).value,
      )
      if (current === 0 || current - 1 < 0) {
        ;(document.getElementById('maxInput') as HTMLInputElement).value = '0'
        return
      }
      ;(document.getElementById('maxInput') as HTMLInputElement).value = (
        current - 0.01
      ).toFixed(3)
    }
  }

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
      //console.log('bal1', bal1)
      setBalance0(bal1)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchTokenPrice = async () => {
    try {
      setMktRate({
        TOKEN20A:
          '~' +
          Number(coverTickPrice).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
        WETH:
          '~' +
          Number(coverTickPrice).toLocaleString('en-US', {
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
          {inputBox('0', setAmountToPay)}
          <div className="flex text-xs text-[#4C4C4C]">~$1.00</div>
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
          <div className="text-[#646464]">Amount to pay</div>
          <div>
            {/* {amountToPay} {tokenIn.symbol} */}
            {hasSelected && mktRate[tokenIn.symbol] ? (
              (
                parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
                parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, ''))
              ).toFixed(2)
            ) : (
              <>?</>
            )}{' '}
            $
          </div>
        </div>
      </div>
      <h1 className="mb-3 mt-4">Set Price Range</h1>
      <div className="flex justify-between w-full gap-x-6">
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Min. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice('minus', 'min')}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="minInput"
              type="number"
              onChange={() =>
                setMinPrice(
                  (document.getElementById('minInput') as HTMLInputElement)
                    ?.value,
                )
              }
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice('plus', 'min')}>
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
              <button onClick={() => changePrice('minus', 'max')}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="maxInput"
              type="number"
              onChange={() =>
                setMaxPrice(
                  (document.getElementById('maxInput') as HTMLInputElement)
                    ?.value,
                )
              }
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice('plus', 'max')}>
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
            {prices.tokenIn} {tokenIn.symbol} ={' '}
            {tokenOut.symbol === 'Select Token'
              ? '?'
              : prices.tokenOut + ' ' + tokenOut.symbol}
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
            poolAddress={coverPoolAddress}
            approveToken={tokenIn.address}
          />
        ) : stateChainName === 'arbitrumGoerli' ? (
          <CoverMintButton
            poolAddress={poolId}
            disabled={isDisabled}
            to={address}
            lower={min}
            claim={
              tokenOut.address != '' &&
              tokenIn.address.localeCompare(tokenOut.address) === -1
                ? max
                : min
            }
            upper={max}
            amount={bnInput}
            zeroForOne={
              tokenOut.address != '' &&
              tokenIn.address.localeCompare(tokenOut.address) === -1
            }
            tickSpacing={20}
          />
        ) : null}
      </div>
    </>
  )
}
