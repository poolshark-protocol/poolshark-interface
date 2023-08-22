import { BigNumber, ethers } from 'ethers';
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
import { gasEstimateRangeBurn } from '../../utils/gas';
import { BN_ZERO } from '../../utils/math/constants';
import { useRangeStore } from '../../hooks/useRangeStore';

export default function RangeRemoveLiqButton({poolAddress, address, lower, upper, burnPercent, closeModal, setIsOpen}) {
    const [
      setNeedsRefetch,
      setNeedsBalanceIn,
      setNeedsBalanceOut,
      setNeedsPosRefetch,
    ] = useRangeStore((state) => [
      state.setNeedsRefetch,
      state.setNeedsBalanceIn,
      state.setNeedsBalanceOut,
      state.setNeedsPosRefetch,
    ]);

    const [ errorDisplay, setErrorDisplay ] = useState(false);
    const [ successDisplay, setSuccessDisplay ] = useState(false);

    console.log('burn button args', burnPercent.toString(), lower.toString(), upper.toString())

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
      const newBurnGasFee = await gasEstimateRangeBurn(
        poolAddress,
        address,
        lower,
        upper,
        burnPercent,
        signer
      )
      if (newBurnGasFee.gasUnits.gt(BN_ZERO)) setFetchDelay(true)
      
      setGasLimit(newBurnGasFee.gasUnits.mul(130).div(100))
    }
  
    const { config } = usePrepareContractWrite({
        address: poolAddress,
        abi: rangePoolABI,
        functionName: "burn",
        args:[[
            address,
            lower,
            upper,
            burnPercent
        ]],
        chainId: 421613,
        overrides:{
            gasLimit: gasLimit,
        },
    })

    const { data, write } = useContractWrite(config)

    const {isLoading} = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        setSuccessDisplay(true);
        setTimeout(() => {
          closeModal()
        }, 2000);
        if (burnPercent.eq(ethers.utils.parseUnits('1', 38))) {
          setNeedsRefetch(true);
        }
        setNeedsBalanceIn(true);
        setNeedsBalanceOut(true);
        setNeedsPosRefetch(true);
        setIsOpen(false);
      },
      onError() {
        setErrorDisplay(true);
      },
    });

    return (
        <>
        <button disabled={gasLimit.gt(BN_ZERO) ? false : true} className=" w-full text-sm md:text-base py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
            onClick={() => {
              address ?  write?.() : null
            }}
                >
                Remove liquidity
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