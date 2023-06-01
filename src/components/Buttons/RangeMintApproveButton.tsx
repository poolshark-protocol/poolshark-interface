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
  
  export default function RangeMintApproveButton({
    poolAddress,
    approveToken,
    disabled,
    amount
  }) {
    const [errorDisplay, setErrorDisplay] = useState(false)
    const [successDisplay, setSuccessDisplay] = useState(false)
  
    const { config } = usePrepareContractWrite({
      address: approveToken.address,
      abi: erc20ABI,
      functionName: 'approve',
      args: [poolAddress, amount],
      chainId: 421613,
    })
  
    const { data, isSuccess, write } = useContractWrite(config)
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        setSuccessDisplay(true)
      },
      onError() {
        setErrorDisplay(true)
      },
    })
  
    return (
      <>
        <div
          className={
            disabled
              ? 'w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-not-allowed bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50'
              : 'w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80'
          }
          onClick={(address) => (address && !disabled ? write?.() : null)}
        >
          Approve {approveToken.symbol}
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
  