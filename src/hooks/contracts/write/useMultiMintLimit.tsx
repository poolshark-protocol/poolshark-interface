import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../useConfigStore";
import { getRouterAddress } from "../../../utils/config";
import { poolsharkRouterABI } from "../../../abis/evm/poolsharkRouter";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";
import { useRangeLimitStore } from "../../useRangeLimitStore";
import { useEffect } from "react";
import { ethers } from "ethers";
import { parseUnits } from "viem";
import { hasBalance } from "../../../utils/tokens";
import useAddress from "../../useAddress";

export default function useMultiMintLimit({
  positionId,
  lower,
  upper,
  disabled,
  amount,
  gasLimit,
  setTxHash,
  setIsLoading,
  onSuccess,
  onError,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const [
    tokenIn,
    tokenOut,
    rangeMintParams,
    limitPoolAddress,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
  ] = useRangeLimitStore((state) => [
    state.tokenIn,
    state.tokenOut,
    state.rangeMintParams,
    state.limitPoolAddress,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
  ]);

  const address = useAddress();

  const { config } = usePrepareContractWrite({
    address: getRouterAddress(networkName),
    abi: poolsharkRouterABI,
    functionName: "multiMintLimit",
    args: [
      [limitPoolAddress],
      [
        deepConvertBigIntAndBigNumber({
          to: address,
          amount: amount,
          mintPercent: parseUnits("1", 24),
          positionId: positionId,
          lower: lower,
          upper: upper,
          zeroForOne: tokenIn.callId == 0,
          callbackData: ethers.utils.formatBytes32String(""),
        }),
      ],
    ],
    chainId: chainId,
    enabled: positionId != undefined && hasBalance(tokenIn, amount),
    gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      onSuccess();
    },
    onError() {
      onError();
    },
  });

  useEffect(() => {
    if (isLoading) {
      if (typeof setIsLoading === "function") setIsLoading(true);
    } else {
      if (typeof setIsLoading === "function") setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (typeof setTxHash === "function") setTxHash(data?.hash);
  }, [data]);

  return { config, data, write, isLoading };
}
