import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../useConfigStore";
import { getRangeStakerAddress } from "../../../utils/config";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";
import { rangeStakerABI } from "../../../abis/evm/rangeStaker";

export default function useRangeUnstake({
  rangePoolAddress,
  address,
  unstakeGasLimit,
  positionId,
  onSuccess,
  onError,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { config } = usePrepareContractWrite({
    address: getRangeStakerAddress(networkName),
    abi: rangeStakerABI,
    functionName: "unstakeRange",
    args: [
      deepConvertBigIntAndBigNumber({
        to: address,
        pool: rangePoolAddress,
        positionId: positionId,
      }),
    ],
    chainId: chainId,
    enabled: rangePoolAddress != undefined,
    gasLimit: deepConvertBigIntAndBigNumber(unstakeGasLimit),
    onSuccess() {},
    onError() {
      console.log("error unstaked", rangePoolAddress, positionId);
    },
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
