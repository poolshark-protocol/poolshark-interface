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
import { BigNumber, ethers } from "ethers";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { useConfigStore } from "../../hooks/useConfigStore";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { getLimitSwapButtonMsgValue } from "../../utils/buttons";
  
  export default function LimitCreateAndMintButton({
    disabled,
    routerAddress,
    poolTypeId,
    tokenIn,
    tokenOut,
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
      startPrice,
      tradePoolData,
      setNeedsRefetch,
      setNeedsAllowanceIn,
      setNeedsBalanceIn,
      setNeedsSnapshot,
    ] = useTradeStore((state) => [
      state.startPrice,
      state.tradePoolData,
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
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            startPrice: BigNumber.from(String(TickMath.getSqrtPriceAtPriceString(
              !isNaN(parseFloat(startPrice)) ? startPrice : '1.00',
              tokenIn, tokenOut,
              tradePoolData?.feeTier?.tickSpacing ?? 30
            ))),
            swapFee: feeTier ?? 3000
        },  // pool params
        [], // range positions
        [
            {
                to: to,
                amount: amount,
                mintPercent: mintPercent,
                positionId: BN_ZERO,
                lower: lower,
                upper: upper,
                zeroForOne: zeroForOne,
                callbackData: ethers.utils.formatBytes32String('')
            }
        ], // limit positions
      ],
      enabled: feeTier != undefined && gasLimit.gt(BN_ZERO),
      chainId: chainId,
      overrides: {
        gasLimit: gasLimit,
        value: getLimitSwapButtonMsgValue(
          tokenIn.native,
          amount
        )
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
          disabled={disabled || gasLimit.lte(BN_ZERO)}
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => write?.()}
        >
          LIMIT SWAP
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
  