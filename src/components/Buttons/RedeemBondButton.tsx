import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { bondTellerABI } from "../../abis/evm/bondTeller";
import { useState } from "react";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { SuccessToast } from "../Toasts/Success";

export default function RedeemBondButton({
  tellerAddress,
  tokenId,
  amount,
  disabled,
  setNeedsBondTokenData,
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
    address: tellerAddress,
    abi: bondTellerABI,
    functionName: "redeem",
    args: [
      tokenId,
      amount,
    ],
    chainId: chainId,
    onError() {
      console.log('redeem error')
    }
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsBondTokenData(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

    return (
      <>
        <button
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-[4px]  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => write?.()}
          disabled={disabled}
        >
          {"REDEEM BONDS"}
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
  