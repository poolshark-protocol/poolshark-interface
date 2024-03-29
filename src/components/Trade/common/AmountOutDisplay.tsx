import { useShallow } from "zustand/react/shallow";
import { useTradeStore } from "../../../hooks/useTradeStore";

const AmountOutDisplay = ({
  displayOut,
  approximate = false,
}: {
  displayOut: string;
  approximate?: boolean;
}) => {
  const tokenOut = useTradeStore(useShallow((state) => state.tokenOut));

  return (
    <span>
      {approximate ? "~$" : "$"}
      {!isNaN(tokenOut.decimals) && !isNaN(tokenOut.USDPrice) ? (
        (
          (!isNaN(parseFloat(displayOut)) ? parseFloat(displayOut) : 0) *
          (tokenOut.USDPrice ?? 0)
        ).toFixed(2)
      ) : (
        <>{(0).toFixed(2)}</>
      )}
    </span>
  );
};

export default AmountOutDisplay;
