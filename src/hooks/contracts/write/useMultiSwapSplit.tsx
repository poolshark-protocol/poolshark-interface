import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../useConfigStore";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";
import { poolsharkRouterABI } from "../../../abis/evm/poolsharkRouter";
import { BN_ZERO } from "../../../utils/math/constants";

export default function useMultiSwapSplit({
  routerAddress,
  poolAddresses,
  swapParams,
  enabled,
  gasLimit,
  msgValue,
  onSuccess,
  onError,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiSwapSplit",
    args: deepConvertBigIntAndBigNumber([
      poolAddresses,
      swapParams[0],
      BN_ZERO,
      1897483712,
    ]),
    enabled: enabled,
    chainId: chainId,
    gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
    value: msgValue,
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
  return { config, data, write, isLoading };
}
