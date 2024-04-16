import { useAccount, useContractRead } from "wagmi";
import { useConfigStore } from "../useConfigStore";
import { useRangeLimitStore } from "../useRangeLimitStore";
import { rangePoolABI } from "../../abis/evm/rangePool";
import { ZERO_ADDRESS } from "../../utils/math/constants";

export default function useSnapshotRange() {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const rangeStore = useRangeLimitStore((state) => state);

  const { isConnected } = useAccount();

  const { refetch: refetchSnapshot, data: feesOwed } = useContractRead({
    address: rangeStore.rangePoolAddress,
    abi: rangePoolABI,
    functionName: "snapshotRange",
    args: [rangeStore.rangePositionData.positionId],
    chainId: chainId,
    watch: true,
    enabled:
      isConnected &&
      rangeStore.rangePositionData.positionId != undefined &&
      rangeStore.rangePoolAddress != ZERO_ADDRESS,
    onError(error) {
      console.log("Error snapshot Range", error);
    },
  });

  return { refetchSnapshot, feesOwed };
}
