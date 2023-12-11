import { useEffect, useState } from "react";
import { useBalance, useAccount } from "wagmi";
import { useConfigStore } from "./useConfigStore";

export default function useTokenBalance(tokenAddress: string) {
  const { address } = useAccount();
  const [tokenBalanceInfo, setTokenBalanceInfo] = useState({} as any);
  const [queryToken, setQueryToken] = useState(tokenAddress as any);

  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  const tokenBalanceSetting = () => {
    setQueryToken(tokenAddress);
  };

  useEffect(() => {
    tokenBalanceSetting();
  }, [tokenAddress]);

  const { data } = useBalance({
    address: address,
    token: queryToken,
    chainId: chainId,
    watch: true,

    onSuccess(data) {
      setTokenBalanceInfo(data);
    },
  });

  const tokenBalanceBox = () => {
    return (
      <div className="md:text-xs text-[10px] whitespace-nowrap text-[#4C4C4C]">
        Balance: {!isNaN(Number(tokenBalanceInfo?.formatted)) ? Number(tokenBalanceInfo?.formatted).toFixed(3) : '0.00'}
      </div>
    );
  };

  return [tokenBalanceInfo, tokenBalanceBox];
}
