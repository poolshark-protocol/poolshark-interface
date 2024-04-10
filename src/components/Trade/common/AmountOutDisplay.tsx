import { tokenSwap } from "../../../utils/types";

const AmountOutDisplay = ({
  displayOut,
  tokenOut,
  approximate = false,
}: {
  displayOut: string;
  tokenOut: tokenSwap;
  approximate?: boolean;
}) => {
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
