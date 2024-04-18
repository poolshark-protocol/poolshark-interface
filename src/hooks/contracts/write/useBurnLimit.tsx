import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../useConfigStore";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";
import { limitPoolABI } from "../../../abis/evm/limitPool";

export default function useBurnLimit({
  poolAddress,
  address,
  burnPercent,
  positionId,
  claim,
  zeroForOne,
  gasLimit,
  onSuccess,
  onError,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: limitPoolABI,
    functionName: "burnLimit",
    args: [
      deepConvertBigIntAndBigNumber({
        to: address,
        burnPercent: burnPercent,
        positionId: positionId,
        claim: claim,
        zeroForOne: zeroForOne,
      }),
    ],
    chainId: chainId,
    enabled: positionId != undefined,
    gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
  });

  const { data, isSuccess, write } = useContractWrite(config);

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
