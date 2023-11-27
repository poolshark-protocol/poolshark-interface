import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { bondTellerABI } from "../../abis/evm/bondTeller";
import { useState } from "react";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { SuccessToast } from "../Toasts/Success";
import { methABI } from "../../abis/evm/meth";

  
  export default function ApproveBondButton({
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

    const TELLER_ADDRESS = "0x007F7735baF391e207E3aA380bb53c4Bd9a5Fed6"
    const WETH_ADDRESS = "0x251f7eacde75458b52dbc4995c439128b9ef98ca"

    const { address } = useAccount();
    
    const { config } = usePrepareContractWrite({
      address: WETH_ADDRESS,
      abi: methABI,
      functionName: "approve",
      args: [
        TELLER_ADDRESS,
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
          onClick={() => write?.()}
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