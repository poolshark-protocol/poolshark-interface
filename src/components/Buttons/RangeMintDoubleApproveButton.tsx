import {
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
} from 'wagmi'
import { erc20ABI } from 'wagmi'
import { SuccessToast } from '../Toasts/Success'
import { ErrorToast } from '../Toasts/Error'
import { ConfirmingToast } from '../Toasts/Confirming'
import React, { useState } from 'react'
import { useSwapStore } from '../../hooks/useStore'

export default function RangeMintDoubleApproveButton({
  poolAddress,
  token0,
  token1,
  amount0,
  amount1,
  approveZero
}) {
  const [errorDisplay, setErrorDisplay] = useState(false)
  const [successDisplay, setSuccessDisplay] = useState(false)

  const [
    Amount,
    SwapParams,
    updateSwapAllowance,
  ] = useSwapStore((state: any) => [
    state.Amount,
    state.SwapParams,
    state.updateSwapAllowance,
  ])

  const { config: t0 } = usePrepareContractWrite({
    address: token0.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [poolAddress, amount0],
    chainId: 421613,
    gas: 1_000_000_000n,
  })

  const { config: t1 } = usePrepareContractWrite({
    address: token1.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [poolAddress, amount1],
    chainId: 421613,
    gas: 1_000_000_000n,
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
      updateSwapAllowance(Amount)
      setSuccessDisplay(true)
    },
    onError() {
      setErrorDisplay(true)
    },
  })

  const { isLoading: isLoadingT1 } = useWaitForTransaction({
    hash: dataT1?.hash,
    onSuccess() {
      updateSwapAllowance(Amount)
      setSuccessDisplay(true)
    },
    onError() {
      setErrorDisplay(true)
    },
  })

  function approve() {
    if (approveZero) writeT0()
    else writeT1()
  }

  return (
    <>
      <div
        className="w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
        onClick={(address) => (address ? approve() : null)}
      >
        Approve {approveZero ? token0.symbol : token1.symbol}
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        { approveZero ? errorDisplay && (
          <ErrorToast
            hash={dataT0?.hash}
            errorDisplay={errorDisplay}
            setErrorDisplay={setErrorDisplay}
          />
        ) :
        errorDisplay && (
          <ErrorToast
            hash={dataT1?.hash}
            errorDisplay={errorDisplay}
            setErrorDisplay={setErrorDisplay}
          />
        )}
        {approveZero ? (isLoadingT0 ? <ConfirmingToast hash={dataT0?.hash} /> : <></>)
                     : (isLoadingT1 ? <ConfirmingToast hash={dataT1?.hash} /> : <></>)}
        {approveZero ? successDisplay && (
          <SuccessToast
            hash={dataT0?.hash}
            successDisplay={successDisplay}
            setSuccessDisplay={setSuccessDisplay}
          />
        )
        : successDisplay && (
          <SuccessToast
            hash={dataT1?.hash}
            successDisplay={successDisplay}
            setSuccessDisplay={setSuccessDisplay}
          />
        )}
      </div>
    </>
  )
}
