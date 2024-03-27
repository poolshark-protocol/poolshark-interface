import { useAccount, useContractRead } from "wagmi";
import { useConfigStore } from "../useConfigStore";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { getRouterAddress } from "../../utils/config";
import { useTradeStore } from "../useTradeStore";

export default function useMultiSnapshotLimit() {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const tradeStore = useTradeStore((state) => state);

  const { isConnected } = useAccount();

  const { data } = useContractRead({
    address: getRouterAddress(networkName),
    abi: poolsharkRouterABI,
    functionName: "multiSnapshotLimit",
    args: [
      tradeStore.limitPoolAddressList,
      deepConvertBigIntAndBigNumber(tradeStore.limitPositionSnapshotList),
    ],
    chainId: chainId,
    // watch: needsSnapshot,
    enabled:
      isConnected &&
      tradeStore.limitPoolAddressList.length > 0 &&
      getRouterAddress(networkName),
    onSuccess(data) {
      // console.log("Success price filled amount", data);
      // console.log("snapshot address list", limitPoolAddressList);
      // console.log("snapshot params list", limitPositionSnapshotList);
      //   setNeedsSnapshot(false);
    },
    onError(error) {
      console.log("network check", networkName);
      console.log("Error price Limit", error);
    },
  });
  return { data };
}
