import { useBalance, useAccount } from "wagmi";
import { useConfigStore } from "./useConfigStore";
import { ZERO_ADDRESS } from "../utils/math/constants";
import { useRouter } from "next/router";
import useAddress from "./useAddress";

export default function useTokenBalance({ token }) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { isConnected } = useAccount();
  const address = useAddress();
  const router = useRouter();

  const { data } = useBalance({
    address: address,
    token: token.native ? undefined : token.address,
    chainId: chainId,
    watch: router.isReady,
    enabled: isConnected && token.address && token.address != ZERO_ADDRESS,
  });

  return { data };
}
