import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
  } from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { useTradeStore } from "../../hooks/useTradeStore";
import { TickMath } from "../../utils/math/tickMath";
import { ethers } from "ethers";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { useConfigStore } from "../../hooks/useConfigStore";
  
  export default function LimitCreateAndMintButton({
    disabled,
    routerAddress,
    poolTypeId,
    token0,
    token1,
    feeTier,
    to,
    amount,
    mintPercent,
    lower,
    upper,
    zeroForOne,
    closeModal,
    gasLimit,
  }) {
    const [
      chainId
    ] = useConfigStore((state) => [
      state.chainId,
    ]);

    const [
      setNeedsRefetch,
      setNeedsAllowanceIn,
      setNeedsBalanceIn,
      setNeedsSnapshot,
    ] = useTradeStore((state) => [
      state.setNeedsRefetch,
      state.setNeedsAllowanceIn,
      state.setNeedsBalanceIn,
      state.setNeedsSnapshot,
    ]);
    const [errorDisplay, setErrorDisplay] = useState(false);
    const [successDisplay, setSuccessDisplay] = useState(false);
  
    useEffect(() => {}, [disabled]);
  
    const { config } = usePrepareContractWrite({
      address: routerAddress,
      abi: poolsharkRouterABI,
      functionName: "createLimitPoolAndMint",
      args: [
        {
            poolTypeId: poolTypeId,
            tokenIn: token0.address,
            tokenOut: token1.address,
            startPrice: TickMath.getSqrtRatioAtTick(upper),
            swapFee: feeTier ?? 3000
        }, // pool params
        [], // range positions
        [
            {
                to: to,
                amount: amount,
                mintPercent: mintPercent,
                lower: lower,
                upper: upper,
                zeroForOne: zeroForOne,
                callbackData: ethers.utils.formatBytes32String('')
            }
        ] // limit positions
      ],
      chainId: chainId,
      overrides: {
        gasLimit: gasLimit,
      },
      onSuccess() {},
      onError() {
        setErrorDisplay(true);
      },
    });
  
    const { data, write } = useContractWrite(config);
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        setSuccessDisplay(true);
        setNeedsBalanceIn(true);
        setNeedsAllowanceIn(true);
        setNeedsSnapshot(true);
        setTimeout(() => {
          setNeedsRefetch(true);
          closeModal();
        }, 1000);
      },
      onError() {
        setErrorDisplay(true);
      },
    });
  
    return (
      <>
        <button
          disabled={disabled /* || gasLimit.lte(BN_ZERO) */}
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => write?.()}
        >
          Mint Position
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
  