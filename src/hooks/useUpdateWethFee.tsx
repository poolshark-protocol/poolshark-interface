import { useShallow } from "zustand/react/shallow";

import { gasEstimateWethCall } from "../utils/gas";
import { chainProperties } from "../utils/chains";
import { useConfigStore } from "./useConfigStore";
import { useEthersSigner } from "../utils/viemEthersAdapters";
import { useAccount } from "wagmi";
import { useTradeStore } from "./useTradeStore";
import { BigNumber } from "ethers";

const useUpdateWethFee = ({
  setSwapGasFee,
  setSwapGasLimit,
}: {
  setSwapGasFee: (s: string) => void;
  setSwapGasLimit: (s: BigNumber) => void;
}) => {
  const signer = useEthersSigner();
  const { isConnected } = useAccount();

  const [tokenIn, tokenOut, amountIn] = useTradeStore(
    useShallow((state) => [state.tokenIn, state.tokenOut, state.amountIn]),
  );
  const [networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [state.networkName, state.limitSubgraph]),
  );

  const updateWethFee = async () => {
    if (tokenIn.userRouterAllowance?.gte(amountIn) || tokenIn.native) {
      await gasEstimateWethCall(
        chainProperties[networkName]["wethAddress"],
        tokenIn,
        tokenOut,
        amountIn,
        signer,
        isConnected,
        setSwapGasFee,
        setSwapGasLimit,
        limitSubgraph,
      );
    }
  };

  return updateWethFee;
};

export default useUpdateWethFee;
