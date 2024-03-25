import { useAccount, useContractRead } from "wagmi";
import { limitPoolABI } from "../../abis/evm/limitPool";
import { useConfigStore } from "../useConfigStore";
import { useRangeLimitStore } from "../useRangeLimitStore";
import { BigNumber } from "ethers";
import router from "next/router";
import { parseUnits } from "viem";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";

export default function useSnapshotLimit() {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const limitStore = useRangeLimitStore((state) => state);

  const { address, isDisconnected, isConnected } = useAccount();

  const { data } = useContractRead({
    address: limitStore.limitPoolAddress,
    abi: limitPoolABI,
    functionName: "snapshotLimit",
    args: [
      {
        owner: address,
        burnPercent: deepConvertBigIntAndBigNumber(parseUnits("1", 38)),
        positionId: Number(limitStore.limitPositionData.positionId),
        claim: limitStore.claimTick ?? 0,
        zeroForOne: limitStore.tokenIn.callId == 0,
      },
    ],
    chainId: chainId,
    watch: limitStore.needsSnapshot,
    enabled:
      isConnected &&
      limitStore.limitPositionData.positionId != undefined &&
      limitStore.claimTick != undefined &&
      limitStore.claimTick >= Number(limitStore.limitPositionData.min) &&
      limitStore.claimTick <= Number(limitStore.limitPositionData.max),
    onSuccess(data) {
      console.log("Success price filled amount", data);
      limitStore.setNeedsSnapshot(false);
    },
    onError(error) {
      console.log("Error price Limit", error);
      console.log(
        "claim tick snapshot args",
        address,
        BigNumber.from("0").toString(),
        limitStore.limitPositionData?.min?.toString(),
        limitStore.limitPositionData?.max?.toString(),
        limitStore.claimTick.toString(),
        limitStore.tokenIn.callId == 0,
        router.isReady,
      );
    },
    onSettled(data, error) {
      //console.log('Settled price Limit', { data, error })
    },
  });
  return { data };
}
