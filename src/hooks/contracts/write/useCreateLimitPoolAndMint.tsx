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
import { BigNumber, ethers } from "ethers";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { chainProperties } from "../../../utils/chains";
import { hasBalance } from "../../../utils/tokens";
import { limitPoolABI } from "../../../abis/evm/limitPool";
import { BN_ZERO } from "../../../utils/math/constants";
import { getLimitSwapButtonMsgValue } from "../../../utils/buttons";
import { TickMath } from "../../../utils/math/tickMath";

export default function useCreateLimitPoolAndMint({
  poolConfig,
  rangePositions,
  limitPositions,
  msgValue,
  disabled,
  gasLimit,
  onSuccess,
  onError,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { config } = usePrepareContractWrite({
    address: getRouterAddress(networkName),
    abi: poolsharkRouterABI,
    functionName: "createLimitPoolAndMint",
    args: [
      poolConfig, // pool params
      rangePositions, // range positions
      limitPositions, // limit positions
    ],
    enabled: !disabled,
    chainId: chainId,
    gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
    value: msgValue,
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

  return { config, data, write };
}
