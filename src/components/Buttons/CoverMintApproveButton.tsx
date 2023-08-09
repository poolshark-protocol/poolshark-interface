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
import { useCoverStore } from '../../hooks/useCoverStore'

export default function CoverMintApproveButton({
  poolAddress,
  approveToken,
  amount,
  tokenSymbol
}) {
  const [errorDisplay, setErrorDisplay] = useState(false)
  const [successDisplay, setSuccessDisplay] = useState(false)

  const [setNeedsAllowance] = useCoverStore((state) => [
    state.setNeedsAllowance,
  ])

  const { config } = usePrepareContractWrite({
    address: approveToken,
    abi: erc20ABI,
    functionName: 'approve',
    args: [poolAddress, amount],
    enabled: approveToken != undefined && poolAddress != undefined,
    chainId: 421613,
  })

  const { data, isSuccess, write } = useContractWrite(config)

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true)
      setNeedsAllowance(true)
    },
    onError() {
      setErrorDisplay(true)
    },
  })

  return (
    <>
      <div
        className={
          'w-full py-4 mx-auto font-medium text-center text-sm md:text-base transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80'
        }
        onClick={(address) => (address ? write?.() : null)}
      >
      <> Approve {tokenSymbol}</>
      </div>
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
  