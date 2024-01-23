import {
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
} from 'wagmi'
import { erc20ABI } from 'wagmi'
import React, { useState } from 'react'
import { useCoverStore } from '../../hooks/useCoverStore'
import { useConfigStore } from '../../hooks/useConfigStore'

export default function CoverMintApproveButton({
  routerAddress,
  approveToken,
  amount,
  tokenSymbol
}) {
  const [errorDisplay, setErrorDisplay] = useState(false)
  const [successDisplay, setSuccessDisplay] = useState(false)

  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  const [setNeedsAllowance] = useCoverStore((state) => [
    state.setNeedsAllowance,
  ])

  const { config } = usePrepareContractWrite({
    address: approveToken,
    abi: erc20ABI,
    functionName: 'approve',
    args: [routerAddress, amount],
    enabled: approveToken != undefined && routerAddress != undefined,
    chainId: chainId,
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
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={(address) => (address ? write?.() : null)}
      >
      <> Approve {tokenSymbol}</>
      </div>
    </>
  )
}
  