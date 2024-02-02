import { ZERO_ADDRESS } from "../../utils/math/constants";
import { numFormat } from "../../utils/math/valueMath";

function USDPriceDisplay({ token, display }) {
  return (
    <span>
      ~$
      {!isNaN(token.decimals) && !isNaN(token.USDPrice)
        ? (
            (!isNaN(parseFloat(display)) ? parseFloat(display) : 0) *
            (token.USDPrice ?? 0)
          ).toFixed(2)
        : (0).toFixed(2)}
    </span>
  );
}

export default USDPriceDisplay;
