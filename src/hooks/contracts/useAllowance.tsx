import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { useConfigStore } from "../useConfigStore";
import { getRouterAddress } from "../../utils/config";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import { useRouter } from "next/router";
import useAddress from "../useAddress";

export default function useAllowance({ token }) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { isDisconnected, isConnected } = useAccount();
  const address = useAddress();
  const router = useRouter();

  const { data: allowance, refetch: refetchAllowanceOut } = useContractRead({
    address: token.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, getRouterAddress(networkName)],
    chainId: chainId,
    watch: true,
    enabled:
      isConnected &&
      token.address &&
      token.address != ZERO_ADDRESS &&
      !token.native,
    onSuccess(data) {
      //setNeedsAllowanceOut(false);
    },
    onError(error) {
      console.log(
        "Error token allowance",
        address,
        token.address,
        getRouterAddress(networkName),
        error,
      );
    },
  });

  return { allowance };
}
