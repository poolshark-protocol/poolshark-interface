import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
  } from "wagmi";
import React, { useState, useEffect } from "react";
import { useTradeStore } from "../../hooks/useTradeStore";
import { TickMath } from "../../utils/math/tickMath";
import { BigNumber, ethers } from "ethers";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { useConfigStore } from "../../hooks/useConfigStore";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { getLimitSwapButtonMsgValue } from "../../utils/buttons";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { convertBigIntAndBigNumber, deepConvertBigIntAndBigNumber } from "../../utils/misc";
  
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
      chainId,
      networkName,
    ] = useConfigStore((state) => [
      state.chainId,
      state.networkName,
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
    const [toastId, setToastId] = useState(null);
  
    useEffect(() => {}, [disabled]);
  
    const { config } = usePrepareContractWrite({
      address: routerAddress,
      abi: poolsharkRouterABI,
      functionName: "createLimitPoolAndMint",
      args: [
        deepConvertBigIntAndBigNumber({
            poolTypeId: poolTypeId,
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            startPrice: BigNumber.from(String(TickMath.getSqrtRatioAtTick(
              Number(zeroForOne ? lower : upper)
            ))),
            swapFee: feeTier ?? 3000
        }), // pool params
        [], // range positions
        [
            deepConvertBigIntAndBigNumber({
                to: to,
                amount: amount,
                mintPercent: mintPercent,
                positionId: BN_ZERO,
                lower: lower,
                upper: upper,
                zeroForOne: zeroForOne,
                callbackData: ethers.utils.formatBytes32String('')
            })
        ], // limit positions
      ],
      enabled: feeTier != undefined && gasLimit.gt(BN_ZERO),
      chainId: chainId,
      gasLimit: convertBigIntAndBigNumber(gasLimit),
      value: convertBigIntAndBigNumber(getLimitSwapButtonMsgValue(
        tokenIn.native,
        amount
      )),
    });
  
    const { data, write } = useContractWrite(config);
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        toast.success("Your transaction was successful",{
          id: toastId,
          action: {
            label: "View",
            onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
          },
        });
        setNeedsBalanceIn(true);
        setNeedsAllowanceIn(true);
        setNeedsSnapshot(true);
        setTimeout(() => {
          setNeedsRefetch(true);
          closeModal();
        }, 1000);
      },
      onError() {
        toast.error("Your transaction failed",{
          id: toastId,
          action: {
            label: "View",
            onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
          },
        });
      },
    });

    useEffect(() => {
      if(isLoading) {
        const newToastId = toast.loading("Your transaction is being confirmed...",{
          action: {
            label: "View",
            onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
          },
        });
        newToastId
        setToastId(newToastId);
      }
    }, [isLoading]);
  
    return (
      <>
        <button
          disabled={disabled || gasLimit.lte(BN_ZERO)}
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => write?.()}
        >
          LIMIT SWAP
        </button>
      </>
    );
  }
  