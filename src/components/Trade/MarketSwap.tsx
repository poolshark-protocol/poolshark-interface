import { useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useTradeStore } from "../../hooks/useTradeStore";
import useInputBox from "../../hooks/useInputBox";
import { BN_ZERO } from "../../utils/math/constants";
import SelectToken from "../SelectToken";
import { inputHandler } from "../../utils/math/valueMath";
import { getSwapPools } from "../../utils/pools";
import { QuoteParams } from "../../utils/types";
import { maxPriceBn, minPriceBn } from "../../utils/math/tickMath";

export default function MarketSwap() {
  const [chainId, networkName, limitSubgraph, setLimitSubgraph, logoMap] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
      state.setLimitSubgraph,
      state.logoMap,
    ]);

  //CONFIG STORE
  const [stateChainName, setStateChainName] = useState();

  const [
    tradePoolAddress,
    setTradePoolAddress,
    tradePoolData,
    setTradePoolData,
    tradeParams,
    pairSelected,
    setPairSelected,
    tradeSlippage,
    setTradeSlippage,
    tokenIn,
    setTokenIn,
    setTokenInAmount,
    setTokenInBalance,
    setTokenInTradeAllowance,
    setTokenInTradeUSDPrice,
    tokenOut,
    setTokenOut,
    setTokenOutBalance,
    setTokenOutTradeUSDPrice,
    amountIn,
    setAmountIn,
    amountOut,
    setAmountOut,
    needsAllowanceIn,
    setNeedsAllowanceIn,
    needsAllowanceOut,
    setNeedsAllowanceOut,
    needsBalanceIn,
    setNeedsBalanceIn,
    needsBalanceOut,
    setNeedsBalanceOut,
    limitPriceString,
    setLimitPriceString,
    switchDirection,
    setMintButtonState,
    needsRefetch,
    setNeedsRefetch,
    needsPosRefetch,
    setNeedsPosRefetch,
    needsSnapshot,
    setNeedsSnapshot,
  ] = useTradeStore((s) => [
    s.tradePoolAddress,
    s.setTradePoolAddress,
    s.tradePoolData,
    s.setTradePoolData,
    s.tradeParams,
    s.pairSelected,
    s.setPairSelected,
    s.tradeSlippage,
    s.setTradeSlippage,
    s.tokenIn,
    s.setTokenIn,
    s.setTokenInAmount,
    s.setTokenInBalance,
    s.setTokenInTradeAllowance,
    s.setTokenInTradeUSDPrice,
    s.tokenOut,
    s.setTokenOut,
    s.setTokenOutBalance,
    s.setTokenOutTradeUSDPrice,
    s.amountIn,
    s.setAmountIn,
    s.amountOut,
    s.setAmountOut,
    s.needsAllowanceIn,
    s.setNeedsAllowanceIn,
    s.needsAllowanceOut,
    s.setNeedsAllowanceOut,
    s.needsBalanceIn,
    s.setNeedsBalanceIn,
    s.needsBalanceOut,
    s.setNeedsBalanceOut,
    s.limitPriceString,
    s.setLimitPriceString,
    s.switchDirection,
    s.setMintButtonState,
    s.needsRefetch,
    s.setNeedsRefetch,
    s.needsPosRefetch,
    s.setNeedsPosRefetch,
    s.needsSnapshot,
    s.setNeedsSnapshot,
  ]);

  const {
    inputBox: inputBoxIn,
    display: displayIn,
    setDisplay: setDisplayIn,
  } = useInputBox();
  const {
    inputBox: inputBoxOut,
    display: displayOut,
    setDisplay: setDisplayOut,
  } = useInputBox();

  const { address, isDisconnected, isConnected } = useAccount();

  /////////////////////////////Fetch Pools
  const [availablePools, setAvailablePools] = useState(undefined);
  const [quoteParams, setQuoteParams] = useState(undefined);

  async function updatePools(amount: BigNumber, isAmountIn: boolean) {
    const pools = await getSwapPools(
      limitSubgraph,
      tokenIn,
      tokenOut,
      setTradePoolData
    );
    const poolAdresses: string[] = [];
    const quoteList: QuoteParams[] = [];
    if (pools) {
      for (let i = 0; i < pools.length; i++) {
        const params: QuoteParams = {
          priceLimit: tokenIn.callId == 0 ? minPriceBn : maxPriceBn,
          amount: amount,
          exactIn: isAmountIn,
          zeroForOne: tokenIn.callId == 0,
        };
        quoteList[i] = params;
        poolAdresses[i] = pools[i].id;
      }
    }
    setAvailablePools(poolAdresses);
    setQuoteParams(quoteList);
  }

  /////////////////////Double Input Boxes
  const [exactIn, setExactIn] = useState(true);

  const handleInputBox = (e) => {
    if (e.target.name === "tokenIn") {
      const [value, bnValue] = inputHandler(e, tokenIn);
      if (!pairSelected) {
        setDisplayIn(value);
        setDisplayOut("");
        setAmountIn(bnValue);
      }
      if (!bnValue.eq(amountIn)) {
        setDisplayIn(value);
        setAmountIn(bnValue);
        setAmounts(bnValue, true);
      } else {
        setDisplayIn(value);
        if (bnValue.eq(BN_ZERO)) {
          setDisplayOut(value);
        }
      }
      setExactIn(true);
    } else if (e.target.name === "tokenOut") {
      const [value, bnValue] = inputHandler(e, tokenOut);
      if (!pairSelected) {
        setDisplayOut(value);
        setDisplayIn("");
        setAmountOut(bnValue);
      } else if (!bnValue.eq(amountOut)) {
        setDisplayOut(value);
        setAmountOut(bnValue);
        setAmounts(bnValue, false);
      } else {
        setDisplayOut(value);
        if (bnValue.eq(BN_ZERO)) {
          setDisplayIn(value);
        }
      }
      setExactIn(false);
    }
  };

  const setAmounts = (bnValue: BigNumber, isAmountIn: boolean) => {
    if (isAmountIn) {
      if (bnValue.gt(BN_ZERO)) {
        /* if (!limitTabSelected) */
        updatePools(bnValue, true);
        /*  else {
          const tokenOutAmount = getExpectedAmountOutFromInput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            bnValue
          );
          const tokenOutAmountDisplay = parseFloat(
            ethers.utils.formatUnits(
              tokenOutAmount.toString(),
              tokenOut.decimals
            )
          ).toPrecision(6);
          setDisplayOut(tokenOutAmountDisplay);
          setAmountOut(tokenOutAmount);
        } */
      } else {
        setDisplayOut("");
        setAmountOut(BN_ZERO);
      }
    } else {
      if (bnValue.gt(BN_ZERO)) {
        /*  if (!limitTabSelected) */
        updatePools(bnValue, false);
        /* else {
          const tokenInAmount = getExpectedAmountInFromOutput(
            Number(lowerTick),
            Number(upperTick),
            tokenIn.callId == 0,
            bnValue
          );
          const tokenInAmountDisplay = parseFloat(
            ethers.utils.formatUnits(tokenInAmount.toString(), tokenIn.decimals)
          ).toPrecision(6);
          setDisplayIn(tokenInAmountDisplay);
          setAmountIn(tokenInAmount);
        } */
      } else {
        setDisplayIn("");
        setAmountIn(BN_ZERO);
      }
    }
  };

  /////////////////////////////Rendering Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between w-full">
        <span className="text-[11px] text-grey1">FROM</span>
        <div className="cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 hover:opacity-60"
          >
            <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z" />
          </svg>
        </div>
      </div>
      <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
        <div className="flex items-end justify-between text-[11px] text-grey1">
          <span>
            {" "}
            ~$
            {!isNaN(parseInt(amountIn.toString())) &&
            !isNaN(tokenIn.decimals) &&
            !isNaN(tokenOut.USDPrice)
              ? (
                  parseFloat(
                    ethers.utils.formatUnits(
                      amountIn ?? BN_ZERO,
                      tokenIn.decimals
                    )
                  ) * (tokenIn.USDPrice ?? 0)
                ).toFixed(2)
              : (0).toFixed(2)}
          </span>
          <span>BALANCE: {tokenIn.userBalance}</span>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3">
          {inputBoxIn("0", tokenIn, "tokenIn", handleInputBox)}
          <div className="flex items-center gap-x-2">
            {isConnected && stateChainName === networkName ? (
              <button
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tokenIn.userBalance.toString(),
                      name: "tokenIn",
                    },
                  });
                }}
                className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
              >
                MAX
              </button>
            ) : null}
            <SelectToken
              index="0"
              key="in"
              type="in"
              tokenIn={tokenIn}
              setTokenIn={setTokenIn}
              tokenOut={tokenOut}
              setTokenOut={setTokenOut}
              displayToken={tokenIn}
              amount={exactIn ? displayIn : displayOut}
              isAmountIn={exactIn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
