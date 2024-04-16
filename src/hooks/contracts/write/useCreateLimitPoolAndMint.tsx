import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../useConfigStore";
import { getRouterAddress } from "../../../utils/config";
import { poolsharkRouterABI } from "../../../abis/evm/poolsharkRouter";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";

export default function useCreateLimitPoolAndMint({
  poolConfig,
  rangePositions,
  limitPositions,
  msgValue,
  enabled,
  gasLimit,
  onSuccess,
  onError,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { config } = usePrepareContractWrite({
    address: getRouterAddress(networkName),
    abi: poolsharkRouterABI,
    functionName: "createLimitPoolAndMint",
    args: [
      poolConfig, // pool params
      rangePositions, // range positions
      limitPositions, // limit positions
    ],
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
