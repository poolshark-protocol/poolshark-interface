import { BigNumber } from 'ethers'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { rangePoolABI } from '../../abis/evm/rangePool'
import { SuccessToast } from '../Toasts/Success'
import { ErrorToast } from '../Toasts/Error'
import { ConfirmingToast } from '../Toasts/Confirming'
import React, { useState, useEffect } from 'react'

export default function RangeMintButton({
  disabled,
  poolAddress,
  to,
  lower,
  upper,
  amount0,
  amount1,
  closeModal,
  gasLimit
}) {
  const [errorDisplay, setErrorDisplay] = useState(false)
  const [successDisplay, setSuccessDisplay] = useState(false)
  const [isDisabled, setDisabled] = useState(disabled)

  useEffect(() => {}, [disabled])

  console.log('mint gas limit', gasLimit)

  /*const [rangeContractParams, setRangeContractParams] = useState({
    to: to,
    min: lower,
    max: upper,
    amount0: amount0,
    amount1: amount1,
    fungible: fungible,
  })
  console.log('range contract', rangeContractParams)

  useEffect(() => {
    setRangeContractParams({
      to: to,
      min: lower,
      max: upper,
      amount0: amount0,
      amount1: amount1,
      fungible: fungible,
    })
  }, [to, lower, upper, amount0, amount1, fungible])*/

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: rangePoolABI,
    functionName: 'mint',
    args: [[to, lower, upper, amount0, amount1]],
    chainId: 421613,
    overrides: {
      gasLimit: gasLimit,
    },
    onSuccess() {
      console.log(
        'params check',
        to,
        lower.toString(),
        upper.toString(),
        amount0.toString(),
        amount1.toString(),
      )
    },
  })

  const { data, write } = useContractWrite(config)

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true)
      setTimeout(() => {
        closeModal()
      }, 2000)
    },
    onError() {
      setErrorDisplay(true)
    },
  })

  return (
    <>
      <button
        disabled={disabled}
        className={'w-full py-4 mx-auto text-center font-medium transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80'}
        onClick={() => write?.()}
      >
        Mint Position
      </button>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        {errorDisplay && (
          <ErrorToast
            hash={data?.hash}
            errorDisplay={errorDisplay}
            setErrorDisplay={setErrorDisplay}
          />
        )}
        {isLoading ? <ConfirmingToast hash={data?.hash} /> : <></>}
        {successDisplay && (
          <SuccessToast
            hash={data?.hash}
            successDisplay={successDisplay}
            setSuccessDisplay={setSuccessDisplay}
          />
        )}
      </div>
    </>
  )
}
