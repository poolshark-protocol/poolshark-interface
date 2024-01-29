import { ZERO_ADDRESS } from "../../utils/math/constants";
import { numFormat } from "../../utils/math/valueMath";

function BalanceDisplay({ token }) {
    return (<span>{token?.address != ZERO_ADDRESS ? ("Balance: " +
        (
          !isNaN(token?.userBalance) && token.userBalance > 0
            ? numFormat(token.userBalance, 5)
            : "0.00"
        )
    ) : (
        <></>
    )}</span>)
}

export default BalanceDisplay