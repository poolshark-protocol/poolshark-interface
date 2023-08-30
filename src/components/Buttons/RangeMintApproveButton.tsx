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
import { useSwapStore as useRangeLimitStore } from '../../hooks/useSwapStore'

export default function RangeMintApproveButton({ poolAddress, approveToken, amount }) {
  const [errorDisplay, setErrorDisplay] = useState(false)
  const [successDisplay, setSuccessDisplay] = useState(false)

  const [
    setNeedsRangeAllowanceIn,
  ] = useRangeLimitStore((state) => [
    state.setNeedsRangeAllowanceIn,
  ])

  const { config: t0 } = usePrepareContractWrite({
    address: approveToken.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [poolAddress, amount],
    chainId: 421613,
  })

  const {
    data: dataT0,
    isSuccess: isSuccesT0,
    write: writeT0,
  } = useContractWrite(t0)

  const { isLoading: isLoadingT0 } = useWaitForTransaction({
    hash: dataT0?.hash,
    onSuccess() {
      setSuccessDisplay(true)
      setNeedsRangeAllowanceIn(true)
    },
    onError() {
      setErrorDisplay(true)
    },
  })


  return (
    <>
      <div
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => writeT0?.()}
      >
        Approve {approveToken.symbol}
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <ErrorToast
          key={dataT0?.hash + 'error'}
          hash={dataT0?.hash}
          errorDisplay={errorDisplay}
          setErrorDisplay={setErrorDisplay}
        />
        {isLoadingT0 ? <ConfirmingToast hash={dataT0?.hash} /> : <></>}
        <SuccessToast
          key={dataT0?.hash + 'success'}
          hash={dataT0?.hash}
          successDisplay={successDisplay}
          setSuccessDisplay={setSuccessDisplay}
        />
      </div>
    </>
  )
}
