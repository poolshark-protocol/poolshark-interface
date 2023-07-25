import { ethers, BigNumber } from "ethers";
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
import { coverPoolAddress } from "../../constants/contractAddresses";
import { useCoverStore } from "../../hooks/useStore";
import { roundTick } from "../../utils/math/tickMath";
import { BN_ZERO } from "../../utils/math/constants";

export default function CoverMintButton({
  poolAddress,
  disabled,
  to,
  lower,
  claim,
  upper,
  amount,
  zeroForOne,
  tickSpacing,
  buttonState,
  gasLimit,
  tokenSymbol,
}) {
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  console.log(
    "contract info",
    to,
    lower,
    upper,
    amount,
    zeroForOne,
    tickSpacing
  );

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: coverPoolABI,
    functionName: "mint",
    args: [
      [
        to,
        amount,
        roundTick(Number(lower), tickSpacing),
        roundTick(Number(upper), tickSpacing),
        zeroForOne,
      ],
    ],
    enabled: !disabled,
    chainId: 421613,
    overrides: {
      gasLimit: BigNumber.from("3000000"),
    },
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled}
        className={
          disabled
            ? "w-full py-4 mx-auto font-medium text-center text-sm md:text-base transition rounded-xl cursor-not-allowed bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50"
            : "w-full py-4 mx-auto font-medium text-center text-sm md:text-base transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
        }
        onClick={() => (!disabled ? write?.() : null)}
      >
        {disabled ? (
          <>
            {buttonState === "price" ? (
              <>Min. is greater than Max. Price</>
            ) : (
              <></>
            )}
            {buttonState === "amount" ? <>Input Amount</> : <></>}
            {buttonState === "token" ? <>Output token not selected</> : <></>}
            {buttonState === "bounds" ? <>Invalid Price Range</> : <></>}
            {buttonState === "balance" ? (
              <>Insufficient {tokenSymbol} Balance</>
            ) : (
              <></>
            )}
          </>
        ) : (
          <>Create Cover</>
        )}
      </button>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
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
