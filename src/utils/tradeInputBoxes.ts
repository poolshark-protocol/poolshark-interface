import { BN_ZERO } from "./math/constants";
import { inputHandler } from "./math/valueMath";

export const tradeInputBoxes = (
  e,
  { tradeStore, setDisplayIn, setDisplayOut, setPriceImpact, setAmounts },
) => {
  if (e.target.name.startsWith("tokenIn")) {
    const [value, bnValue] = inputHandler(
      e,
      tradeStore.tokenIn,
      e.target.name.endsWith("Max"),
    );
    if (!tradeStore.pairSelected) {
      setDisplayIn(value);
      setDisplayOut("");
      tradeStore.setAmountIn(bnValue);
      setPriceImpact("0.00");
    } else if (!bnValue.eq(tradeStore.amountIn)) {
      setDisplayIn(value);
      tradeStore.setAmountIn(bnValue);
      setAmounts(bnValue, true);
    } else {
      setDisplayIn(value);
      if (bnValue.eq(BN_ZERO)) {
        setDisplayOut("");
        setPriceImpact("0.00");
      }
    }
    tradeStore.setExactIn(true);
  } else if (e.target.name.startsWith("tokenOut")) {
    const [value, bnValue] = inputHandler(
      e,
      tradeStore.tokenOut,
      e.target.name.endsWith("Max"),
    );
    if (!tradeStore.pairSelected) {
      setDisplayOut(value);
      setDisplayIn("");
      tradeStore.setAmountOut(bnValue);
      setPriceImpact("0.00");
    } else if (!bnValue.eq(tradeStore.amountOut)) {
      setDisplayOut(value);
      tradeStore.setAmountOut(bnValue);
      setAmounts(bnValue, false);
    } else {
      setDisplayOut(value);
      if (bnValue.eq(BN_ZERO)) {
        setDisplayIn("");
        setPriceImpact("0.00");
      }
    }
    tradeStore.setExactIn(false);
  }
};
