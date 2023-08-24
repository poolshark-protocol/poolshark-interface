import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useSigner,
} from 'wagmi';
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useEffect, useState } from "react";
import { rangePoolABI } from '../../abis/evm/rangePool';
import { BN_ZERO } from '../../utils/math/constants';
import { gasEstimateRangeMint } from '../../utils/gas';
import { useRangeStore } from '../../hooks/useRangeStore';
import { BigNumber } from 'ethers';

export default function RangeAddLiqButton({poolAddress, address, lower, upper, positionId, amount0, amount1, disabled, setIsOpen}) {
    const [
      setNeedsAllowanceIn,
      setNeedsAllowanceOut,
      setNeedsBalanceIn,
      setNeedsBalanceOut,
      setNeedsRefetch,
    ] = useRangeStore((state) => [
      state.setNeedsAllowanceIn,
      state.setNeedsAllowanceOut,
      state.setNeedsBalanceIn,
      state.setNeedsBalanceOut,
      state.setNeedsRefetch,
    ])
    const [ errorDisplay, setErrorDisplay ] = useState(false);
    const [ successDisplay, setSuccessDisplay ] = useState(false);
    const [ fetchDelay, setFetchDelay ] = useState(false)
    const [ gasLimit, setGasLimit ] = useState(BN_ZERO)

    const {data: signer} = useSigner()

    useEffect(() => {
      if (!fetchDelay) {
        updateGasFee()
      } else {
        const interval = setInterval(() => {
          updateGasFee()
        }, 3000)
        return () => clearInterval(interval)
      }
    }, [])
  
    async function updateGasFee() {
      const newBurnGasFee = await gasEstimateRangeMint(
        poolAddress,
        address,
        lower,
        upper,
        amount0,
        amount1,
        signer,
        positionId
      )
      if (newBurnGasFee.gasUnits.gt(BN_ZERO)) setFetchDelay(true)
      
      setGasLimit(newBurnGasFee.gasUnits.mul(130).div(100))
    }
  
    const { config } = usePrepareContractWrite({
      address: poolAddress,
      abi: rangePoolABI,
      functionName: 'mint',
      args: [[
        address,
        lower,
        upper,
        amount0,
        amount1
      ]],
      chainId: 421613,
      overrides: {
        gasLimit: gasLimit,
      },
      onSuccess() {
        console.log('params check', address,
        lower.toString(),
        upper.toString(),
        amount0.toString(),
        amount1.toString())
      },
    })

    const { data, isSuccess, write } = useContractWrite(config)

    const {isLoading} = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        setSuccessDisplay(true);
        setNeedsAllowanceIn(true);
        setNeedsBalanceIn(true);
        setNeedsRefetch(true);
        if (amount1.gt(BigNumber.from(0))) {
          setNeedsAllowanceOut(true);
          setNeedsBalanceOut(true);
        }
        setIsOpen(false);
      },
      onError() {
        setErrorDisplay(true);
      },
    });

    return (
        <>
        <button 
            disabled={gasLimit.lte(BN_ZERO) || disabled} 
            className=" w-full py-4 mx-auto font-medium text-sm md:text-base text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
            onClick={() => {
              address ?  write?.() : null
            }}
                >
                Add liquidity
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
    );
  }