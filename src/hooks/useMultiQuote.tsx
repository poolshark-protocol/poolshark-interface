import { useContractRead } from "wagmi";
import { useConfigStore } from "./useConfigStore";
import { getRouterAddress } from "../utils/config";
import { poolsharkRouterABI } from "../abis/evm/poolsharkRouter";
import { deepConvertBigIntAndBigNumber } from "../utils/misc";
import { useTradeStore } from "./useTradeStore";

export default function useMultiQuote({ availablePools, quoteParams }) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const [wethCall] = useTradeStore((s) => [s.wethCall]);

  const { data } = useContractRead({
    address: getRouterAddress(networkName), //contract address,
    abi: poolsharkRouterABI, // contract abi,
    functionName: "multiQuote",
    args: [availablePools, deepConvertBigIntAndBigNumber(quoteParams), true],
    chainId: chainId,
    enabled:
      availablePools != undefined && quoteParams != undefined && !wethCall,
    onError(error) {
      console.log("Error multiquote", error);
    },
    onSuccess(data) {},
  });

  return { data };
}
