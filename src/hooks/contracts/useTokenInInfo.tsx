import { useRouter } from "next/router";
import { useTradeStore } from "../useTradeStore";
import { chainProperties } from "../../utils/chains";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import { useConfigStore } from "../useConfigStore";
import useToken from "./useToken";

export default function useTokenInInfo() {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const tradeStore = useTradeStore((state) => state);

  const router = useRouter();

  const onSuccess = () => {
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
  };

  const {
    tokenData: tokenInData,
    refetchTokenInfo: refetchTokenInInfo,
    isLoading: isTokenInLoading,
  } = useToken({
    tokenAddress:
      (router.query.from as `0x${string}`) ?? (ZERO_ADDRESS as `0x${string}`),
    onSuccess,
  });

  return { tokenInData, refetchTokenInInfo, isTokenInLoading };
}
