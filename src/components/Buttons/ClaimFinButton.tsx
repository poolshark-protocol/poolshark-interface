import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useState } from "react";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { SuccessToast } from "../Toasts/Success";
import { vFinABI } from "../../abis/evm/vFin";
  
  export default function ClaimFinButton({
    vFinAddress,
    positionId,
    claimAmount,
  }) {
    const [
      chainId
    ] = useConfigStore((state) => [
      state.chainId,
    ]);

    const [errorDisplay, setErrorDisplay] = useState(false);
    const [successDisplay, setSuccessDisplay] = useState(false);

    const { config } = usePrepareContractWrite({
      address: vFinAddress,
      abi: vFinABI,
      functionName: "claim",
      args: [
        positionId,
      ],
      chainId: chainId,
      enabled: vFinAddress != undefined && positionId != undefined,
      onError() {
        console.log('vFIN claim error',)
      }
    });
  
    const { data, write } = useContractWrite(config);

    const disabled = claimAmount == undefined || claimAmount < 0.005
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        // we could refetch viewClaim
      },
      onError() {
        setErrorDisplay(true);
      },
    });

    return (
      <>
        <button
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => write?.()}
          disabled={false}
        >
          {disabled ? "NOTHING TO CLAIM" : "CLAIM VESTED FIN"}
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
  