import { useBalance } from "wagmi";
import { useConfigStore } from "./useConfigStore";
import { ZERO_ADDRESS } from "../utils/math/constants";
import { useRouter } from "next/router";
import useAccount from "./useAccount";

export default function useTokenBalance({
  token,
  watch = true,
  enabled = true,
  onSuccess,
  onError,
}: {
  token: any;
  watch?: boolean;
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { address, isConnected } = useAccount();
  const router = useRouter();

  const { data } = useBalance({
    address: address,
    token: token.native ? undefined : token.address,
    chainId: chainId,
    watch: router.isReady && watch,
    enabled:
      isConnected && token.address && token.address != ZERO_ADDRESS && enabled,
    onSuccess,
    onError,
  });

  return { data };
}
