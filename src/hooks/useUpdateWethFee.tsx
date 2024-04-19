import { useShallow } from "zustand/react/shallow";
import { gasEstimateWethCall } from "../utils/gas";
import { chainProperties } from "../utils/chains";
import { useConfigStore } from "./useConfigStore";
import { useTradeStore } from "./useTradeStore";
import { BigNumber } from "ethers";
import { hasAllowance } from "../utils/tokens";
import useAccount from "./useAccount";
import useSigner from "./useSigner";

const useUpdateWethFee = ({
  setSwapGasFee,
  setSwapGasLimit,
}: {
  setSwapGasFee: (s: string) => void;
  setSwapGasLimit: (s: BigNumber) => void;
}) => {
  const { signer } = useSigner();
  const { isConnected } = useAccount();

  const [tokenIn, tokenOut, amountIn] = useTradeStore(
    useShallow((state) => [state.tokenIn, state.tokenOut, state.amountIn]),
  );
  const [networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [state.networkName, state.limitSubgraph]),
  );

  const updateWethFee = async () => {
    if (hasAllowance(tokenIn, amountIn)) {
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
