import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../useConfigStore";
import { getRouterAddress } from "../../../utils/config";
import { poolsharkRouterABI } from "../../../abis/evm/poolsharkRouter";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";
import { useRangeLimitStore } from "../../useRangeLimitStore";
import { useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { chainProperties } from "../../../utils/chains";
import { hasBalance } from "../../../utils/tokens";
import { limitPoolABI } from "../../../abis/evm/limitPool";
import { BN_ZERO } from "../../../utils/math/constants";

export default function useBurnLimit({
  poolAddress,
  address,
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
        burnPercent: BN_ZERO,
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

  return { config, data, write };
}
