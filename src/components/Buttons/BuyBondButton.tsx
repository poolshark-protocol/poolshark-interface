import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { bondTellerABI } from "../../abis/evm/bondTeller";
import { useState } from "react";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { SuccessToast } from "../Toasts/Success";

  
  export default function BuyBondButton({
    inputAmount,
    setNeedsSubgraph,
    setNeedsBalance,
    setNeedsAllowance,
    marketId,
  }) {
    const [
      chainId
    ] = useConfigStore((state) => [
      state.chainId,
    ]);

    const [errorDisplay, setErrorDisplay] = useState(false);
    const [successDisplay, setSuccessDisplay] = useState(false);

    const TELLER_ADDRESS = "0x007F7735baF391e207E3aA380bb53c4Bd9a5Fed6"
    const NULL_REFERRER = "0x0000000000000000000000000000000000000000"

    const { address } = useAccount();
    
    const { config } = usePrepareContractWrite({
      address: TELLER_ADDRESS,
      abi: bondTellerABI,
      functionName: "purchase",
      args: [
        address,
        NULL_REFERRER,
        marketId,
        inputAmount,
        inputAmount,
      ],
      chainId: chainId,
      onSuccess() {},
      onError() {
        setErrorDisplay(true);
      },
    });
  
    const { data, write } = useContractWrite(config);
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        setNeedsBalance(true);
        setNeedsAllowance(true);
        setNeedsSubgraph(true);
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
        >
          BUY BOND
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
  