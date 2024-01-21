import { useEffect, useState } from "react";
import { useBalance, useAccount } from "wagmi";
import { useConfigStore } from "./useConfigStore";
import {
  chainProperties,
  supportedChainIds,
  supportedNetworkNames,
} from "../utils/chains";

export default function useTokenBalance(tokenAddress: `0x${string}`) {
  const { address } = useAccount();
  const [tokenBalanceInfo, setTokenBalanceInfo] = useState({} as any);

  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const { data } = useBalance({
    address: address,
    token: tokenAddress,
    chainId: chainId,
    enabled:
      chainProperties[supportedNetworkNames[supportedChainIds[chainId]]]
        .sdkSupport.alchemy === false,
    watch: true,
    onSuccess(data) {
      console.log('token balance:', data)
      setTokenBalanceInfo(data);
    },
  });
  if (!tokenAddress)
    console.log("token check", tokenAddress)

  const tokenBalanceBox = () => {
    return (
      <div className="md:text-xs text-[10px] whitespace-nowrap text-[#4C4C4C]">
        Balance:{" "}
        {!isNaN(Number(tokenBalanceInfo?.formatted))
          ? Number(tokenBalanceInfo?.formatted).toFixed(3)
          : "0.00"}
      </div>
    );
  };

  return [tokenBalanceInfo, tokenBalanceBox];
}
