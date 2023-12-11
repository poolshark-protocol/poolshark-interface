import { erc20ABI, useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useState } from "react";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { SuccessToast } from "../Toasts/Success";
import { BN_ZERO } from "../../utils/math/constants";
  
  export default function ApproveBondButton({
    tellerAddress,
    wethAddress,
    inputAmount,
    setNeedsAllowance,
  }) {
    const [
      chainId
    ] = useConfigStore((state) => [
      state.chainId,
    ]);

    const [errorDisplay, setErrorDisplay] = useState(false);
    const [successDisplay, setSuccessDisplay] = useState(false);

    const { address } = useAccount();
    
    const { config } = usePrepareContractWrite({
      address: wethAddress,
      abi: erc20ABI,
      functionName: "approve",
      args: [
        tellerAddress,
        inputAmount,
      ],
      chainId: chainId,
      enabled: tellerAddress != undefined && inputAmount?.gt(BN_ZERO),
      onError() {
        console.log('approve error', tellerAddress, inputAmount)
      }
    });
  
    const { data, write } = useContractWrite(config);
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        setSuccessDisplay(true);
        setNeedsAllowance(true);
      },
      onError() {
        setErrorDisplay(true);
      },
    });

    return (
      <>
        <button
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => {address ? write?.() : null}}
        >
          APPROVE WETH
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