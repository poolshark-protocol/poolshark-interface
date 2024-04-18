import { useContractRead } from "wagmi";
import { useConfigStore } from "../useConfigStore";
import { useRangeLimitStore } from "../useRangeLimitStore";
import { positionERC1155ABI } from "../../abis/evm/positionerc1155";
import { getRangeStakerAddress } from "../../utils/config";
import useAccount from "../useAccount";

export default function useIsApprovedForAll() {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const rangeStore = useRangeLimitStore((state) => state);

  const { address } = useAccount();

  const { data: stakeApproveStatus } = useContractRead({
    address: rangeStore.rangePoolData.poolToken,
    abi: positionERC1155ABI,
    functionName: "isApprovedForAll",
    args: [address, getRangeStakerAddress(networkName)],
    chainId: chainId,
    watch: true,
    enabled:
      rangeStore.rangePositionData.staked != undefined &&
      !rangeStore.rangePositionData.staked,
    onSuccess() {
      // console.log('approval erc1155 fetched')
    },
    onError(error) {
      console.log(
        "Error isApprovedForAll",
        rangeStore.rangePoolData.poolToken,
        error,
      );
    },
  });

  return { stakeApproveStatus };
}
