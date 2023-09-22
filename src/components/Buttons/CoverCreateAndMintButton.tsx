import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
  } from "wagmi";
  import { coverPoolABI } from "../../abis/evm/coverPool";
  import { SuccessToast } from "../Toasts/Success";
  import { ErrorToast } from "../Toasts/Error";
  import { ConfirmingToast } from "../Toasts/Confirming";
  import React, { useState, useEffect } from "react";
  import { roundTick } from "../../utils/math/tickMath";
  import { BigNumber, ethers } from "ethers";
  import { useCoverStore } from "../../hooks/useCoverStore";
  import router from "next/router";
import { coverPoolFactoryABI } from "../../abis/evm/coverPoolFactory";
  
  export default function CoverCreateAndMintButton({
    factoryAddress,
    poolType,
    token0,
    token1,
    feeTier,
    tickSpread,
    twapLength,
    disabled,
    to,
    lower,
    upper,
    amount,
    zeroForOne,
    tickSpacing,
    buttonMessage,
    gasLimit,
  }) {
    const [errorDisplay, setErrorDisplay] = useState(false);
    const [successDisplay, setSuccessDisplay] = useState(false);
  
    const [setNeedsRefetch, setNeedsAllowance, setNeedsBalance] = useCoverStore(
      (state) => [
        state.setNeedsRefetch,
        state.setNeedsAllowance,
        state.setNeedsBalance,
      ]
    );
  
    const newPositionId = 0;
  
    const { config } = usePrepareContractWrite({
      address: factoryAddress,
      abi: coverPoolFactoryABI,
      functionName: "createCoverPoolAndMint",
      args: [
        {
            poolType: ethers.utils.formatBytes32String(poolType),
            tokenIn: token0.address,
            tokenOut: token1.address,
            feeTier: feeTier,
            tickSpread: tickSpread,
            twapLength: twapLength  
        }, // pool params
        [
            {
                to: to,
                amount: amount,
                positionId: newPositionId,
                lower: BigNumber.from(roundTick(Number(lower), tickSpacing)),
                upper: BigNumber.from(roundTick(Number(upper), tickSpacing)),
                zeroForOne: zeroForOne,
            }
        ] // cover positions
      ],
      overrides: {
        gasLimit: gasLimit,
      },
      enabled: !disabled,
      chainId: 421613,
    });
  
    const { data, write } = useContractWrite(config);
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        setSuccessDisplay(true);
        setNeedsRefetch(true);
        setNeedsAllowance(true);
        setNeedsBalance(true);
        console.log("refetch setted");
        router.push("/cover");
      },
      onError() {
        setErrorDisplay(true);
      },
    });
  
    return (
      <>
        <button
          disabled={disabled}
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => write?.()}
        >
          {buttonMessage}
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
  