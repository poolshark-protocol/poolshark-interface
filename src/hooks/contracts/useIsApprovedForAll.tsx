import { useAccount, useContractRead } from "wagmi";
import { limitPoolABI } from "../../abis/evm/limitPool";
import { useConfigStore } from "../useConfigStore";
import { useRangeLimitStore } from "../useRangeLimitStore";
import { BigNumber } from "ethers";
import router from "next/router";
import { parseUnits } from "viem";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { positionERC1155ABI } from "../../abis/evm/positionerc1155";
import { getRangeStakerAddress } from "../../utils/config";

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
