import SwapUnwrapNativeButton from "../../Buttons/SwapUnwrapNativeButton";
import SwapWrapNativeButton from "../../Buttons/SwapWrapNativeButton";
import { SwapNativeButtonsProps } from "../../../utils/types";

const SwapNativeButtons = ({
  native,
  ...rest
}: {
  native: boolean;
} & SwapNativeButtonsProps) => {
  return native ? (
    <SwapWrapNativeButton {...rest} />
  ) : (
    <SwapUnwrapNativeButton {...rest} />
  );
};

export default SwapNativeButtons;
