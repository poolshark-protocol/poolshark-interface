import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../useConfigStore";
import { getRouterAddress } from "../../../utils/config";
import { poolsharkRouterABI } from "../../../abis/evm/poolsharkRouter";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";
import { useRangeLimitStore } from "../../useRangeLimitStore";
import {
  getRangeMintInputData,
  getRangeMintButtonMsgValue,
} from "../../../utils/buttons";
import { getRangeStakerAddress } from "../../../utils/config";
import { useEffect } from "react";

export default function useMultiMintRange({
  positionId,
  lower,
  upper,
  disabled,
  amount0,
  amount1,
  gasLimit,
  setIsLoading,
  setTxHash,
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
    rangePoolAddress,
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
    state.rangePoolAddress,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
  ]);

  const { address } = useAccount();

  const { config } = usePrepareContractWrite({
    address: getRouterAddress(networkName),
    abi: poolsharkRouterABI,
    functionName: "multiMintRange",
    args: [
      [rangePoolAddress],
      [
        deepConvertBigIntAndBigNumber({
          to: address,
          lower: lower,
          upper: upper,
          positionId: positionId,
          amount0: amount0,
          amount1: amount1,
          callbackData: getRangeMintInputData(
            rangeMintParams.stakeFlag,
            getRangeStakerAddress(networkName),
          ),
        }),
      ],
    ],
    chainId: chainId,
    gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
    value: deepConvertBigIntAndBigNumber(
      getRangeMintButtonMsgValue(
        tokenIn.native,
        tokenOut.native,
        rangeMintParams.tokenInAmount,
        rangeMintParams.tokenOutAmount,
      ),
    ),
    onSuccess() {},
    onError() {},
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
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    setTxHash(data?.hash);
  }, [data]);

  return { config, data, write, isLoading };
}
