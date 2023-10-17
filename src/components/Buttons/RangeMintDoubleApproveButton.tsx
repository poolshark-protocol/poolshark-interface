import {
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
} from 'wagmi'
import { erc20ABI } from 'wagmi'
import { SuccessToast } from '../Toasts/Success'
import { ErrorToast } from '../Toasts/Error'
import { ConfirmingToast } from '../Toasts/Confirming'
import React, { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import { useRangeLimitStore } from '../../hooks/useRangeLimitStore'
import { useConfigStore } from '../../hooks/useConfigStore'

export default function RangeMintDoubleApproveButton({
  routerAddress,
  tokenIn,
  tokenOut,
  amount0,
  amount1,
}) {
  const [errorDisplay0, setErrorDisplay0] = useState(false)
  const [successDisplay0, setSuccessDisplay0] = useState(false)
  const [errorDisplay1, setErrorDisplay1] = useState(false)
  const [successDisplay1, setSuccessDisplay1] = useState(false)

  const [
    chainId
  ] = useConfigStore((state) => [
    state.chainId,
  ]);

  const [
    setNeedsAllowanceIn,
    setNeedsAllowanceOut
  ] = useRangeLimitStore((state) => [
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut
  ])

  const gasLimit = BigNumber.from(100000)

  const { config: t0 } = usePrepareContractWrite({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [routerAddress, amount0],
    chainId: chainId,
    overrides: {
      gasLimit: gasLimit
    },
  })

  const { config: t1 } = usePrepareContractWrite({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [routerAddress, amount1],
    chainId: chainId,
    overrides: {
      gasLimit: gasLimit
    },
  })

  const {
    data: dataT0,
    isSuccess: isSuccesT0,
    write: writeT0,
  } = useContractWrite(t0)

  const {
    data: dataT1,
    isSuccess: isSuccesT1,
    write: writeT1,
  } = useContractWrite(t1)

  const { isLoading: isLoadingT0 } = useWaitForTransaction({
    hash: dataT0?.hash,
    onSuccess() {
      setSuccessDisplay0(true)
      setNeedsAllowanceIn(true)
    },
    onError() {
      setErrorDisplay0(true)
    },
  })

  const { isLoading: isLoadingT1 } = useWaitForTransaction({
    hash: dataT1?.hash,
    onSuccess() {
      setSuccessDisplay0(true)
      setNeedsAllowanceOut(true)
    },
    onError() {
      setErrorDisplay0(true)
    },
  })

  function approve() {
    writeT0()
    writeT1()
  }


  return (
    <>
      <div
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={(address) => (address ? approve() : null)}
      >
        Approve Both Tokens
      </div>
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
        {errorDisplay0 && (
          <ErrorToast
            key={dataT0?.hash + 'doubleApprove_error'}
            hash={dataT0?.hash}
            errorDisplay={errorDisplay0}
            setErrorDisplay={setErrorDisplay0}
          />
        )}
        {errorDisplay1 && (
          <ErrorToast
            hash={dataT1?.hash}
            errorDisplay={errorDisplay1}
            setErrorDisplay={setErrorDisplay1}
          />
        )}
        {isLoadingT0 ? <ConfirmingToast hash={dataT0?.hash} /> : <></>}
        {isLoadingT1 ? <ConfirmingToast hash={dataT1?.hash} /> : <></>}
        {successDisplay0 && (
          <SuccessToast
            key={dataT0?.hash + 'doubleApprove_success'}
            hash={dataT0?.hash}
            successDisplay={successDisplay0}
            setSuccessDisplay={setSuccessDisplay0}
          />
        )}
        {successDisplay1 && (
          <SuccessToast
            key={dataT1?.hash + 'doubleApprove_success'}
            hash={dataT1?.hash}
            successDisplay={successDisplay1}
            setSuccessDisplay={setSuccessDisplay1}
          />
        )}
      </div>
    </>
  )
}
