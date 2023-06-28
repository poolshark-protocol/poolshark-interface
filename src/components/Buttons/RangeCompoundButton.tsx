import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useSigner,
} from 'wagmi';
import { rangePoolABI } from "../../abis/evm/rangePool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { gasEstimateCoverMint, gasEstimateRangeBurn } from '../../utils/gas';
import { BN_ZERO } from '../../utils/math/constants';

export default function RangeCompoundButton({ poolAddress, address, lower, upper }) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);
  const [ fetchDelay, setFetchDelay ] = useState(false)
  const [ gasLimit, setGasLimit ] = useState(BN_ZERO)
  const [ gasFee, setGasFee ] = useState("0")

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
      BN_ZERO,
      signer
    )
    if (newBurnGasFee.gasUnits.gt(BN_ZERO)) setFetchDelay(true)
    setGasLimit(newBurnGasFee.gasUnits.mul(130).div(100))
    setGasFee(newBurnGasFee.formattedPrice)
  }

  //TO-DO: assess if collectFees() or collect true in burn
  const { config } = usePrepareContractWrite({
      address: poolAddress,
      abi: rangePoolABI,
      functionName: "burn",
      args:[[
          address,
          lower,
          upper,
          BN_ZERO
        ]],
      chainId: 421613,
      overrides:{
          gasLimit: gasLimit
      },
  })

  const { data, isSuccess, write } = useContractWrite(config)

  const {isLoading} = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });
    
  return (
      <>
      <button className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
          onClick={() => {
            address ?  write?.() : null
          }}
          disabled={parseFloat(gasFee) == 0}
              >
              Compound position
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