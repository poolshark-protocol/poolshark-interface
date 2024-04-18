import { erc20ABI, useContractRead } from "wagmi";
import { useConfigStore } from "../useConfigStore";
import { getRouterAddress } from "../../utils/config";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import { useRouter } from "next/router";
import useAccount from "../useAccount";

export default function useAllowance({ token }) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { address, isConnected } = useAccount();
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
