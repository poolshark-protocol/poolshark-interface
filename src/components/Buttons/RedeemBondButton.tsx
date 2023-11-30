import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { bondTellerABI } from "../../abis/evm/bondTeller";
import { useState } from "react";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { SuccessToast } from "../Toasts/Success";

export default function RedeemBondButton({
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

  const TELLER_ADDRESS = "0x007F7735baF391e207E3aA380bb53c4Bd9a5Fed6"
  
  const { config } = usePrepareContractWrite({
    address: TELLER_ADDRESS,
    abi: bondTellerABI,
    functionName: "redeem",
    args: [
      tokenId,
      amount,
    ],
    chainId: chainId,
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
          className="bg-main1 border border-main text-xs py-1 px-5 rounded-[4px] disabled:opacity-50 hover:opacity-80"
          disabled={disabled}>
          REDEEM
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
  