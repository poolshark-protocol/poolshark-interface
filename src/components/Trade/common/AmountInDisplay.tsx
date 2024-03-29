import { useShallow } from "zustand/react/shallow";
import { useTradeStore } from "../../../hooks/useTradeStore";

const AmountInDisplay = ({
  displayIn,
  approximate = false,
}: {
  displayIn: string;
  approximate?: boolean;
}) => {
  const [amountIn, tokenIn] = useTradeStore(
    useShallow((state) => [state.amountIn, state.tokenIn]),
  );

  return (
    <span>
      {" "}
      {approximate ? "~$" : "$"}
      {!isNaN(parseInt(amountIn.toString())) &&
      !isNaN(tokenIn.decimals) &&
      !isNaN(tokenIn.USDPrice)
        ? (
            (!isNaN(parseFloat(displayIn)) ? parseFloat(displayIn) : 0) *
            (tokenIn.USDPrice ?? 0)
          ).toFixed(2)
        : (0).toFixed(2)}
    </span>
  );
};

export default AmountInDisplay;
