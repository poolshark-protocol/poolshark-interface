import { useToken } from "wagmi";
import { useConfigStore } from "../useConfigStore";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import { isAddress } from "viem";

export default function useTokenWrapper({ customInput, onSuccess }) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const {
    data: tokenData,
    refetch: refetchTokenInfo,
    isLoading,
  } = useToken({
    address: customInput as `0x${string}`,
    enabled: isAddress(customInput) && customInput != ZERO_ADDRESS,
    chainId: chainId,
    onSuccess() {
      onSuccess();
    },
  });

  return { tokenData, refetchTokenInfo, isLoading };
}
