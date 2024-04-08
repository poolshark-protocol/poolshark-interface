import { BigNumber } from "ethers";
import { BN_ZERO } from "./math/constants";
import { inputHandler } from "./math/valueMath";
import { TradeLimitAction, TradeState } from "../hooks/useTradeStore";

type TradeInputBoxesType = {
  tradeStore: TradeState & TradeLimitAction;
  setDisplayIn: (s: string) => void;
  setDisplayOut: (s: string) => void;
  setAmounts: (bnValue: BigNumber, isAmountIn: boolean) => void;
  setPriceImpact?: (s: string) => void;
};

export const tradeInputBoxes = (
  e: { target: { value: string; name: string } },
  {
    tradeStore,
    setDisplayIn,
    setDisplayOut,
    setAmounts,
    setPriceImpact,
  }: TradeInputBoxesType,
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
      if (typeof setPriceImpact === "function") {
        setPriceImpact("0.00");
      }
    } else if (!bnValue.eq(tradeStore.amountIn)) {
      setDisplayIn(value);
      tradeStore.setAmountIn(bnValue);
      setAmounts(bnValue, true);
    } else {
      setDisplayIn(value);
      if (bnValue.eq(BN_ZERO)) {
        setDisplayOut("");
        if (typeof setPriceImpact === "function") {
          setPriceImpact("0.00");
        }
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
      if (typeof setPriceImpact === "function") {
        setPriceImpact("0.00");
      }
    } else if (!bnValue.eq(tradeStore.amountOut)) {
      setDisplayOut(value);
      tradeStore.setAmountOut(bnValue);
      setAmounts(bnValue, false);
    } else {
      setDisplayOut(value);
      if (bnValue.eq(BN_ZERO)) {
        setDisplayIn("");
        if (typeof setPriceImpact === "function") {
          setPriceImpact("0.00");
        }
      }
    }
    tradeStore.setExactIn(false);
  }
};
