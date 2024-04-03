import { useToken } from "wagmi";
import { useRouter } from "next/router";
import { useTradeStore } from "../useTradeStore";
import { chainProperties } from "../../utils/chains";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import { useConfigStore } from "../useConfigStore";

export default function useTokenInInfo() {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const tradeStore = useTradeStore((state) => state);

  const router = useRouter();

  const {
    data: tokenInData,
    refetch: refetchTokenInInfo,
    isLoading: isTokenInLoading,
  } = useToken({
    address:
      (router.query.from as `0x${string}`) ?? (ZERO_ADDRESS as `0x${string}`),
    enabled: router.query.from != ZERO_ADDRESS,
    onSuccess() {
      if (tokenInData) {
        const newTokenIn = {
          ...tradeStore.tokenIn,
          ...tokenInData,
          native:
            router.query.fromSymbol ==
            chainProperties[networkName].nativeCurrency.symbol
              ? true
              : false,
          symbol: router.query.fromSymbol ?? tokenInData.symbol,
        };
        tradeStore.setTokenInInfo(newTokenIn);
      } else {
        refetchTokenInInfo();
      }
    },
  });

  return { tokenInData, refetchTokenInInfo, isTokenInLoading };
}
