import { Transition, Dialog } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import {
  useSwitchNetwork,
  useAccount,
  erc20ABI,
  useContractRead,
  useProvider,
  useSigner,
} from 'wagmi'
import useInputBox from '../../../hooks/useInputBox'
import RangeAddLiqButton from '../../Buttons/RangeAddLiqButton'
import { BN_ZERO, ZERO } from '../../../utils/math/constants'
import { TickMath } from '../../../utils/math/tickMath'
import { ethers, BigNumber } from 'ethers'
import JSBI from 'jsbi'
import { DyDxMath } from '../../../utils/math/dydxMath'
import { getBalances } from '../../../utils/balances'
import SwapRangeDoubleApproveButton from '../../Buttons/RangeMintDoubleApproveButton'
import { chainIdsToNamesForGitTokenList } from '../../../utils/chains'
import RangeMintDoubleApproveButton from '../../Buttons/RangeMintDoubleApproveButton'
import { gasEstimateRangeMint } from '../../../utils/gas'
import RangeMintApproveButton from '../../Buttons/RangeMintApproveButton'

export default function RangeAddLiquidity({
  isOpen,
  setIsOpen,
  tokenIn,
  tokenOut,
  poolAdd,
  address,
  upperTick,
  liquidity,
  lowerTick,
  rangePrice,
}) {
  const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()
  const { data: signer } = useSigner()
  const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('0.00')
  const [balanceIn, setBalanceIn] = useState('')
  const [balanceOut, setBalanceOut] = useState('')
  const [amount0, setAmount0] = useState(BN_ZERO)
  const [amount1, setAmount1] = useState(BN_ZERO)
  const [allowanceIn, setAllowanceIn] = useState(BN_ZERO)
  const [allowanceOut, setAllowanceOut] = useState(BN_ZERO)
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO)
  const [mintGasFee, setMintGasFee] = useState('$0.00')
  const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(lowerTick)
  const upperSqrtPrice = TickMath.getSqrtRatioAtTick(upperTick)
  const [stateChainName, setStateChainName] = useState()
  const tokenOrder = tokenIn.address.localeCompare(tokenOut.address) < 0
  const { isDisconnected, isConnected } = useAccount()
  const [disabled, setDisabled] = useState(true)
  const [ fetchDelay, setFetchDelay ] = useState(false)
  const [rangeSqrtPrice, setRangeSqrtPrice] = useState(JSBI.BigInt(rangePrice))
  const [doubleApprove, setdoubleApprove] = useState(false)
  const [buttonState, setButtonState] = useState('')
  const [amount0Usd, setAmount0Usd] = useState(0.0)
  const [amount1Usd, setAmount1Usd] = useState(0.0)
  const {
    network: { chainId },
  } = useProvider()


  const { data: tokenInAllowance } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, poolAdd],
    chainId: 421613,
    watch: true,
    enabled:
      isConnected && poolAdd != undefined && tokenIn.address != undefined,
    onSuccess(data) {
      console.log('Success')
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      console.log(
        'allowance check',
        allowanceIn.lt(bnInput),
        allowanceIn.toString(),
      )
      console.log('Allowance Settled', {
        data,
        error,
        poolAdd,
        tokenIn,
      })
    },
  })


  useEffect(() => {
    setTimeout(() => {
      if (tokenInAllowance) setAllowanceIn(tokenInAllowance)
    }, 50)
  }, [tokenInAllowance])

  const { data: tokenOutAllowance } = useContractRead({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, poolAdd],
    chainId: 421613,
    watch: true,
    enabled:
      isConnected && poolAdd != undefined && tokenOut.address != undefined,
    onSuccess(data) {
      console.log('Success')
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      console.log(
        'allowance check out',
        allowanceOut.lt(amount1),
        allowanceOut.toString(),
      )
      console.log('Allowance Settled', {
        data,
        error,
        poolAdd,
        tokenIn,
      })
    },
  })

  useEffect(() => {
    setTimeout(() => {
      if (tokenOutAllowance) {
        console.log('token out allowance check', tokenOutAllowance.toString())
        setAllowanceOut(tokenOutAllowance)
      }
    }, 50)
  }, [tokenOutAllowance])

  useEffect(() => {
    console.log('mint gas updating')
    setAmounts()
  }, [bnInput])

  useEffect(() => {
    updateBalances()
  }, [])

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId])
  }, [chainId])

  async function updateBalances() {
    await getBalances(
      address,
      true,
      tokenIn,
      tokenOut,
      tokenOrder ? setBalanceIn : setBalanceOut,
      tokenOrder ? setBalanceOut : setBalanceIn,
    )
  }

  async function updateMintFee(tokenInAmount: BigNumber, tokenOutAmount: JSBI) {
    const newGasFee = await gasEstimateRangeMint(
      poolAdd,
      address,
      lowerTick,
      upperTick,
      tokenOrder ? tokenInAmount : BigNumber.from(String(tokenOutAmount)),
      tokenOrder ? BigNumber.from(String(tokenOutAmount)) : tokenInAmount,
      signer,
    )
    if (!fetchDelay && newGasFee.gasUnits.gt(BN_ZERO)) setFetchDelay(true)
    setMintGasFee(newGasFee.formattedPrice)
    setMintGasLimit(newGasFee.gasUnits.mul(130).div(100))
    if (newGasFee.gasUnits.gt(0)) setDisabled(false)
    else setDisabled(true)
  }

      // disabled messages
      useEffect(() => {
        
        if (Number(ethers.utils.formatUnits(bnInput)) > Number(balanceIn)) {
          setButtonState('balance0')
        }
        if (Number(ethers.utils.formatUnits(amount1)) > Number(balanceOut)) {
          setButtonState('balance1')
        }
        if (Number(ethers.utils.formatUnits(bnInput)) === 0) {
          setButtonState('amount')
        }
        if (Number(ethers.utils.formatUnits(bnInput)) === 0 ||
            Number(ethers.utils.formatUnits(bnInput)) > Number(balanceIn) ||
            Number(ethers.utils.formatUnits(amount1)) > Number(balanceOut)
        ) {
          setDisabled(true)
        } else if (mintGasLimit.gt(BN_ZERO)) { setDisabled(false)}
      }, [bnInput, balanceIn, balanceOut, disabled])


  function setAmounts() {
    try {
      if (Number(ethers.utils.formatUnits(bnInput)) !== 0) {
        const liquidity =
          JSBI.greaterThanOrEqual(rangeSqrtPrice, lowerSqrtPrice) &&
          JSBI.lessThanOrEqual(rangeSqrtPrice, upperSqrtPrice)
            ? DyDxMath.getLiquidityForAmounts(
                tokenOrder ? rangeSqrtPrice : lowerSqrtPrice,
                tokenOrder ? upperSqrtPrice : rangeSqrtPrice,
                rangeSqrtPrice,
                tokenOrder ? BN_ZERO : bnInput,
                tokenOrder ? bnInput : BN_ZERO,
              )
            : DyDxMath.getLiquidityForAmounts(
                lowerSqrtPrice,
                upperSqrtPrice,
                rangeSqrtPrice,
                tokenOrder ? BN_ZERO : bnInput,
                tokenOrder ? bnInput : BN_ZERO,
              )
        console.log('liquidity check', liquidity)
        const tokenOutAmount = JSBI.greaterThan(liquidity, ZERO)
          ? tokenOrder
            ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
            : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
          : ZERO
        // set amount based on bnInput
        tokenOrder ? setAmount0(bnInput) : setAmount1(bnInput)
        // set amount based on liquidity math
        tokenOrder
          ? setAmount1(BigNumber.from(String(tokenOutAmount)))
          : setAmount0(BigNumber.from(String(tokenOutAmount)))
        updateMintFee(
          bnInput,
          tokenOutAmount
        )
      } else {
        setAmount1(BN_ZERO)
        setAmount0(BN_ZERO)
        setDisabled(true)
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="flex items-center justify-between px-2 mb-5">
                  <h1 className="text-lg">Add Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-y-3 mb-5">
                <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
              <div className=" p-2 w-32">
                {inputBox('0')}
              </div>
              <div className="">
                <div className=" ml-auto">
                  <div>
                    <div className="flex justify-end">
                      <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl">
                        <img className="w-7" src={tokenIn.logoURI} />
                        {tokenIn.symbol}
                      </button>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-1 mt-2">
                      <div className="flex whitespace-nowrap md:text-xs text-[10px] whitespace-nowrap text-[#4C4C4C]" key={balanceIn}>
                        Balance: {balanceIn === 'NaN' ? 0 : balanceIn}
                      </div>
                      <button
                        className="flex md:text-xs text-[10px] uppercase text-[#C9C9C9]"
                        onClick={() => maxBalance(balanceIn, '0')}
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
              <div className=" p-2 bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl  rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none">
              {Number(
                  tokenOrder
                    ? ethers.utils.formatUnits(amount1, 18)
                    : ethers.utils.formatUnits(amount0, 18)
                ).toFixed(2)}
                
              </div>
              <div className="">
                <div className=" ml-auto">
                  <div>
                    <div className="flex justify-end">
                      <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl ">
                        <div className="flex items-center gap-x-2 w-full">
                          <img className="w-7" src={tokenOut.logoURI} />
                          {tokenOut.symbol}
                        </div>
                      </button>
                    </div>
                    <div className="flex whitespace-nowrap items-center justify-end gap-x-2 px-1 mt-2">
                      <div className="flex md:text-xs text-[10px] text-[#4C4C4C]" key={balanceIn}>
                        Balance: {balanceOut === 'NaN' ? 0 : balanceOut}
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                </div>
                {disabled === true ? 
                <button className="opacity-50 w-full cursor-not-allowed py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF]">
        {buttonState === 'amount' ? <>Input Amount</> : <></>}
        {buttonState === 'balance0' ? <>Insufficient {tokenIn.symbol} Balance</> : <></>}
        {buttonState === 'balance1' ? <>Insufficient {tokenOut.symbol} Balance</> : <></>}
            </button>
            :
            <>
                {allowanceIn.gte(amount0) && allowanceOut.gte(amount1) ? (
                  <RangeAddLiqButton
                    poolAddress={poolAdd}
                    address={address}
                    lower={lowerTick}
                    upper={upperTick}
                    amount0={amount0}
                    amount1={amount1}
                    disabled={disabled}
                    gasLimit={mintGasLimit}
                  />
                  ) : (allowanceIn.lt(amount0) &&
                  allowanceOut.lt(amount1)) ||
                doubleApprove ? (
                <RangeMintDoubleApproveButton
                  poolAddress={poolAdd}
                  tokenIn={tokenIn}
                  tokenOut={tokenOut}
                  setAllowanceController={setdoubleApprove}
                />
              ) : !doubleApprove && allowanceIn.lt(amount0) ? (
                <RangeMintApproveButton
                  poolAddress={poolAdd}
                  approveToken={tokenIn}
                />
              ) : !doubleApprove && allowanceOut.lt(amount1) ? (
                <RangeMintApproveButton
                  poolAddress={poolAdd}
                  approveToken={tokenOut}
                />
              ) : null}
              </>
            }
            </div>
              </Dialog.Panel>
            </Transition.Child>
          
        </div>
        </div>
      </Dialog>
    </Transition>
  )
}
