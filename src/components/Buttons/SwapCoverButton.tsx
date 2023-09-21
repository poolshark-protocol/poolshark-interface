import { BigNumber } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { useTradeStore } from "../../hooks/useTradeStore";

export default function SwapCoverButton({
  disabled,
  poolAddress,
  amount,
  zeroForOne,
  priceLimit,
  gasLimit,
}) {
  /*const [Limit] = useTradeStore((state: any) => [
    state.Limit
  ]);*/

  const [setNeedsAllowanceIn, setNeedsBalanceIn] = useTradeStore((state) => [
    state.setNeedsAllowanceIn,
    state.setNeedsBalanceIn,
  ]);

  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const { address } = useAccount();
  const userAddress = address;

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: coverPoolABI,
    functionName: "swap",
    args: [[userAddress, userAddress, priceLimit, amount, zeroForOne]],
    chainId: 421613,
    overrides: {
      gasLimit: gasLimit,
      //gasPrice: ethers.utils.parseUnits('20', 'gwei')
    },
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsAllowanceIn(true);
      setNeedsBalanceIn(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        disabled={disabled}
        onClick={() => (address ? write?.() : null)}
      >
        Swap
      </button>
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
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
