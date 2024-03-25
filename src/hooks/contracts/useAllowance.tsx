import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { useConfigStore } from "../useConfigStore";
import { getRouterAddress } from "../../utils/config";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { useTradeStore } from "../useTradeStore";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import { useRouter } from "next/router";

export default function useAllowance({ token }) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { address, isDisconnected, isConnected } = useAccount();

  const router = useRouter();

  const { data: allowance, refetch: refetchAllowanceOut } = useContractRead({
    address: token.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, getRouterAddress(networkName)],
    chainId: chainId,
    watch: !token.native && router.isReady,
    enabled:
      isConnected &&
      token.address &&
      token.address != ZERO_ADDRESS &&
      !token.native,
    onSuccess(data) {
      //console.log("allowance fetched", allowanceOutRange?.toString());
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
