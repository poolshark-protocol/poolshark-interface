import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../useConfigStore";
import { getRangeStakerAddress } from "../../../utils/config";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";
import { ZERO_ADDRESS } from "../../../utils/math/constants";
import config from "next/config";
import { rangePoolABI } from "../../../abis/evm/rangePool";
import { rangeStakerABI } from "../../../abis/evm/rangeStaker";

export default function useBurnRange({
  poolAddress,
  address,
  staked,
  positionId,
  burnPercent,
  onSuccess,
  onError,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { config: burnConfig } = usePrepareContractWrite({
    address: poolAddress,
    abi: rangePoolABI,
    functionName: "burnRange",
    enabled: positionId != undefined && staked != undefined && !staked,
    args: [deepConvertBigIntAndBigNumber([address, positionId, burnPercent])],
    chainId: chainId,
    onError(err) {
      console.log("collect error");
    },
  });

  const { config: burnStakeConfig } = usePrepareContractWrite({
    address: getRangeStakerAddress(networkName),
    abi: rangeStakerABI,
    functionName: "burnRangeStake",
    args: [
      poolAddress,
      deepConvertBigIntAndBigNumber({
        to: address,
        positionId: positionId,
        burnPercent: burnPercent,
      }),
    ],
    chainId: chainId,
    enabled: poolAddress != ZERO_ADDRESS && staked != undefined && staked,
    onError(err) {
      console.log("collect stake error");
    },
  });

  const { data: burnData, write: burnWrite } = useContractWrite(burnConfig);
  const { data: burnStakeData, write: burnStakeWrite } =
    useContractWrite(burnStakeConfig);

  const data = !staked ? burnData : burnStakeData;
  const write = !staked ? burnWrite : burnStakeWrite;

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
