import { useEffect } from "react";
import { useConfigStore } from "./useConfigStore";
import { ZERO_ADDRESS } from "../utils/math/constants";
import { fetchTokenUSDPrice, getLimitTokenUsdPrice } from "../utils/tokens";
import { tokenSwap } from "../utils/types";

const useTokenUSDPrice = ({
  poolData,
  tokenIn,
  tokenOut,
  setTokenInUSDPrice,
  setTokenOutUSDPrice,
}: {
  poolData: any;
  tokenIn: tokenSwap;
  tokenOut: tokenSwap;
  setTokenInUSDPrice: (n: number) => void;
  setTokenOutUSDPrice: (n: number) => void;
}) => {
  const limitSubgraph = useConfigStore((state) => state.limitSubgraph);

  useEffect(() => {
    if (
      tokenIn.address != ZERO_ADDRESS &&
      (poolData?.id == ZERO_ADDRESS || poolData?.id == undefined)
    ) {
      getLimitTokenUsdPrice(tokenIn.address, setTokenInUSDPrice, limitSubgraph);
    }
  }, [tokenIn.address]);

  useEffect(() => {
    if (
      tokenOut.address != ZERO_ADDRESS &&
      (poolData?.id == ZERO_ADDRESS || poolData?.id == undefined)
    ) {
      getLimitTokenUsdPrice(
        tokenOut.address,
        setTokenOutUSDPrice,
        limitSubgraph,
      );
    }
  }, [tokenOut.address]);

  useEffect(() => {
    if (
      tokenIn.address != ZERO_ADDRESS &&
      tokenOut.address != ZERO_ADDRESS &&
      poolData?.id != ZERO_ADDRESS &&
      poolData?.id != undefined
    ) {
      fetchTokenUSDPrice(poolData, tokenIn, setTokenInUSDPrice);
      fetchTokenUSDPrice(poolData, tokenOut, setTokenOutUSDPrice);
    }
  }, [poolData.poolPrice, poolData?.token0?.price, poolData?.token1?.price]);
};

export default useTokenUSDPrice;
