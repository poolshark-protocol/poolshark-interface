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
import { toast } from "sonner";
import { positionERC1155ABI } from "../../../abis/evm/positionerc1155";
import { chainProperties } from "../../../utils/chains";

export default function useRangeStake({
  rangePoolAddress,
  rangePoolTokenAddress,
  address,
  stakeApproved,
  stakeGasLimit,
  positionId,
  onSuccess,
  onError,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  //* hook wrapper
  const { config: stakeConfig } = usePrepareContractWrite({
    address: getRangeStakerAddress(networkName),
    abi: rangeStakerABI,
    functionName: "stakeRange",
    args: [
      deepConvertBigIntAndBigNumber({
        to: address,
        pool: rangePoolAddress,
        positionId: positionId,
      }),
    ],
    chainId: chainId,
    enabled: positionId != undefined && stakeApproved,
    gasLimit: deepConvertBigIntAndBigNumber(stakeGasLimit),
    onSuccess() {},
    onError() {
      console.log("error stake");
    },
  });

  const { data: stakeData, write: stakeWrite } = useContractWrite(stakeConfig);

  //* hook wrapper
  const { config: approveConfig } = usePrepareContractWrite({
    address: rangePoolTokenAddress,
    abi: positionERC1155ABI,
    functionName: "setApprovalForAll",
    args: [getRangeStakerAddress(networkName), true],
    chainId: chainId,
    enabled: rangePoolTokenAddress != ZERO_ADDRESS && !stakeApproved,
    onSuccess() {},
    onError() {
      console.log("error approve all");
    },
  });

  const { data: approveData, write: approveWrite } =
    useContractWrite(approveConfig);

  const data = stakeApproved ? stakeData : approveData;
  const write = stakeApproved ? stakeWrite : approveWrite;

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
