import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { bondTellerABI } from "../../abis/evm/bondTeller";
import { useState } from "react";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { SuccessToast } from "../Toasts/Success";
  
  export default function BuyBondButton({
    startTime,
    nullReferrer,
    tellerAddress,
    inputAmount,
    setNeedsSubgraph,
    setNeedsBalance,
    setNeedsAllowance,
    setNeedsBondTokenData,
    marketId,
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
      functionName: "purchase",
      args: [
        address,
        nullReferrer,
        marketId,
        inputAmount,
        inputAmount,
      ],
      chainId: chainId,
      enabled: nullReferrer != undefined && startTime != undefined,
      onError() {
        console.log('purchase error', address, tellerAddress, nullReferrer, marketId.toString(), startTime)
      }
    });
  
    const { data, write } = useContractWrite(config);
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        setTimeout(() => {
          setNeedsSubgraph(true);
        }, 2000);
        setSuccessDisplay(true); 
        setNeedsBalance(true);
        setNeedsAllowance(true);
        setNeedsBondTokenData(true);
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
          disabled={(Date.now() / 1000) < startTime}
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
  