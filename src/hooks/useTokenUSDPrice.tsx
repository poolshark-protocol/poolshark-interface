import { useEffect } from "react";
import { useConfigStore } from "./useConfigStore";
import { useShallow } from "zustand/react/shallow";
import { useTradeStore } from "./useTradeStore";
import { ZERO_ADDRESS } from "../utils/math/constants";
import {
  fetchLimitTokenUSDPrice,
  getLimitTokenUsdPrice,
} from "../utils/tokens";

const useTokenUSDPrice = (poolData) => {
  const limitSubgraph = useConfigStore((state) => state.limitSubgraph);

  //1. each of these should be passed in
  //2. refactor to use passed in values
  const [
    tokenIn,
    tradePoolData,
    setTokenInTradeUSDPrice,
    tokenOut,
    setTokenOutTradeUSDPrice,
  ] = useTradeStore(
    useShallow((state) => [
      state.tokenIn,
      state.tradePoolData, // change to `poolData`
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

  useEffect(() => {
    if (
      tokenIn.address != ZERO_ADDRESS &&
      tokenOut.address != ZERO_ADDRESS &&
      tradePoolData?.id != ZERO_ADDRESS &&
      tradePoolData?.id != undefined
    ) {
      fetchLimitTokenUSDPrice(tradePoolData, tokenIn, setTokenInTradeUSDPrice);
      fetchLimitTokenUSDPrice(
        tradePoolData,
        tokenOut,
        setTokenOutTradeUSDPrice,
      );
    }
  }, [tradePoolData.poolPrice]);
};

export default useTokenUSDPrice;
