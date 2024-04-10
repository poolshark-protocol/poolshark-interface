import { BigNumber } from "ethers";
import { tokenSwap } from "../../../utils/types";

const AmountInDisplay = ({
  displayIn,
  amountIn,
  tokenIn,
  approximate = false,
}: {
  displayIn: string;
  amountIn: BigNumber;
  tokenIn: tokenSwap;
  approximate?: boolean;
}) => {
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
