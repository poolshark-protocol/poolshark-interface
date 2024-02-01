import { useEffect, useState } from "react";
import { useBalance, useAccount } from "wagmi";
import { useConfigStore } from "./useConfigStore";
import {
  chainProperties,
  supportedChainIds,
  supportedNetworkNames,
} from "../utils/chains";
import { isAlchemySDKSupported } from "../utils/config";
import axios from "axios";

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
      !isAlchemySDKSupported(chainId),
    watch: true,
    onSuccess(data) {
      //console.log('token balance:', data)
      setTokenBalanceInfo(data);
    },
  });

  // useEffect(() => {
  //   const intervalId = setInterval(async () => {
  //     if (!address) {
  //       alchemyFetchEthBalance()
  //     }
  //     try {
  //       const response = await axios.post('https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_ID', {
  //         jsonrpc: "2.0",
  //         method: "eth_getBalance",
  //         params: [address, "latest"],
  //         id: 1
  //       });
  //       const balanceWei = response.data.result;
  //       const balanceEther = alchemyWeb3.utils.fromWei(balanceWei, 'ether');
  //       setTokenBalanceInfo(balanceEther);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }, 5000); // 5000 milliseconds = 5 seconds

  //   return () => clearInterval(intervalId);
  // }, [address]);

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
