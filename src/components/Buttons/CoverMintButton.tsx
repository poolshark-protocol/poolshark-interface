import { ethers, BigNumber } from 'ethers'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { coverPoolABI } from '../../abis/evm/coverPool'
import { SuccessToast } from '../Toasts/Success'
import { ErrorToast } from '../Toasts/Error'
import { ConfirmingToast } from '../Toasts/Confirming'
import React, { useState, useEffect } from 'react'
import { coverPoolAddress } from '../../constants/contractAddresses'
import { useCoverStore } from '../../hooks/useStore'
import { roundTick } from '../../utils/math/tickMath'

export default function CoverMintButton({
  poolAddress,
  disabled,
  to,
  lower,
  claim,
  upper,
  amount,
  zeroForOne,
  tickSpacing,
}) {
  const [errorDisplay, setErrorDisplay] = useState(false)
  const [successDisplay, setSuccessDisplay] = useState(false)

  /*const [coverContractParams, setCoverContractParams] = useState({
    to: to,
    lower: lower,
    claim: claim,
    upper: upper,
    amount: amount,
    zeroForOne: zeroForOne,
  })
  console.log('cover contract', coverContractParams)

 
  useEffect(() => {
    setCoverContractParams({
    to: to,
    lower: lower,
    claim: claim,
    upper: upper,
    amount: amount,
    zeroForOne: zeroForOne,
    })
  }, [disabled, to, lower, claim, upper, amount, zeroForOne])*/

  /* console.log(
    'mint params',
    to,
    amount.toString(),
    roundTick(Number(lower), 40).toString(),
    roundTick(Number(claim), 40),
    roundTick(Number(upper), 40),
    zeroForOne,
  ) */

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: coverPoolABI,
    functionName: 'mint',
    args: [
      [
        to,
        amount,
        roundTick(Number(lower), 40),
        roundTick(Number(claim), 40),
        roundTick(Number(upper), 40),
        zeroForOne,
      ],
    ],
    chainId: 421613,
    overrides: {
      gasLimit: BigNumber.from('3500000'),
    },
  })

  const { data, write } = useContractWrite(config)

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
      <button
        disabled={disabled}
        className={
          disabled
            ? 'w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-not-allowed bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50'
            : 'w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80'
        }
        onClick={() => (coverPoolAddress && !disabled ? write?.() : null)}
      >
        Create Cover
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
