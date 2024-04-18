import { useRouter } from "next/router";
import { useTradeStore } from "../useTradeStore";
import { chainProperties } from "../../utils/chains";
import { ZERO_ADDRESS } from "../../utils/math/constants";
import { useConfigStore } from "../useConfigStore";
import useToken from "./useToken";

export default function useTokenOutInfo() {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const tradeStore = useTradeStore((state) => state);

  const router = useRouter();

  const onSuccess = () => {
    if (tokenOutData) {
      const newTokenOut = {
        ...tokenOutData,
        native:
          router.query.toSymbol ==
          chainProperties[networkName].nativeCurrency.symbol
            ? true
            : false,
        symbol: router.query.toSymbol ?? tokenOutData.symbol,
      };
      tradeStore.setTokenOutInfo(newTokenOut);
    } else {
      refetchTokenOutInfo();
    }
  };

  const {
    tokenData: tokenOutData,
    refetchTokenInfo: refetchTokenOutInfo,
    isLoading: isTokenOutLoading,
  } = useToken({
    tokenAddress:
      (router.query.to as `0x${string}`) ?? (ZERO_ADDRESS as `0x${string}`),
    onSuccess,
  });

  return { tokenOutData, refetchTokenOutInfo, isTokenOutLoading };
}
