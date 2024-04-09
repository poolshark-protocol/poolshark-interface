import { useEffect } from "react";
import { useConfigStore } from "./useConfigStore";
import { useShallow } from "zustand/react/shallow";
import { useTradeStore } from "./useTradeStore";
import { ZERO_ADDRESS } from "../utils/math/constants";
import { getLimitTokenUsdPrice } from "../utils/tokens";

const useTokenUSDPrice = () => {
  const limitSubgraph = useConfigStore((state) => state.limitSubgraph);
  const [
    tokenIn,
    tradePoolData,
    setTokenInTradeUSDPrice,
    tokenOut,
    setTokenOutTradeUSDPrice,
  ] = useTradeStore(
    useShallow((state) => [
      state.tokenIn,
      state.tradePoolData,
      state.setTokenInTradeUSDPrice,
      state.tokenOut,
      state.setTokenOutTradeUSDPrice,
    ]),
  );

  useEffect(() => {
    if (
      tokenIn.address != ZERO_ADDRESS &&
      (tradePoolData?.id == ZERO_ADDRESS || tradePoolData?.id == undefined)
    ) {
      getLimitTokenUsdPrice(
        tokenIn.address,
        setTokenInTradeUSDPrice,
        limitSubgraph,
      );
    }
  }, [tokenIn.address]);

  useEffect(() => {
    if (
      tokenOut.address != ZERO_ADDRESS &&
      (tradePoolData?.id == ZERO_ADDRESS || tradePoolData?.id == undefined)
    ) {
      getLimitTokenUsdPrice(
        tokenOut.address,
        setTokenOutTradeUSDPrice,
        limitSubgraph,
      );
    }
  }, [tokenOut.address]);
};

export default useTokenUSDPrice;
