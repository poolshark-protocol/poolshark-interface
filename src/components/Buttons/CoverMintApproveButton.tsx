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
  import { ethers } from 'ethers'
  
  export default function CoverMintApproveButton({
    poolAddress,
    approveToken,
    disabled,
    amount,
    allowance,
    tokenSymbol,
    buttonState
  }) {
    const [errorDisplay, setErrorDisplay] = useState(false)
    const [successDisplay, setSuccessDisplay] = useState(false)

    console.log('approve check', amount, String(allowance))
  
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
        {disabled ? <>
        {buttonState === 'price' ? <>Min. is greater than Max. Price</> : <></>}
        {buttonState === 'amount' ? <>Input Amount</> : <></>}
        {buttonState === 'token' ? <>Output token not selected</> : <></>}
        {buttonState === 'bounds' ? <>Invalid Price Range</> : <></>}
        {buttonState === 'balance' ? <>Insufficient {tokenSymbol} Balance</> : <></>}
        </> : <> Approve {tokenSymbol}</>}
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
  