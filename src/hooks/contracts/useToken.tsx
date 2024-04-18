import { useToken as useTokenWagmi } from "wagmi";
import { useConfigStore } from "../useConfigStore";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import { isAddress } from "viem";

export default function useToken({ tokenAddress, onSuccess }) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const {
    data: tokenData,
    refetch: refetchTokenInfo,
    isLoading,
  } = useTokenWagmi({
    address: tokenAddress as `0x${string}`,
    enabled: isAddress(tokenAddress) && tokenAddress != ZERO_ADDRESS,
    chainId: chainId,
    onSuccess() {
      onSuccess();
    },
  });

  return { tokenData, refetchTokenInfo, isLoading };
}
