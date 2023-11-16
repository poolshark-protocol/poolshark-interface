import { useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useTradeStore } from "../../hooks/useTradeStore";
import useInputBox from "../../hooks/useInputBox";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import SelectToken from "../SelectToken";
import { inputHandler } from "../../utils/math/valueMath";
import { getSwapPools } from "../../utils/pools";
import { QuoteParams } from "../../utils/types";
import { maxPriceBn, minPriceBn } from "../../utils/math/tickMath";
import { displayPoolPrice } from "../../utils/math/priceMath";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Range from "../Icons/RangeIcon";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import SwapRouterApproveButton from "../Buttons/SwapRouterApproveButton";
import SwapRouterButton from "../Buttons/SwapRouterButton";
import { chainProperties } from "../../utils/chains";

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
        updatePools(bnValue, true);
      } else {
        setDisplayOut("");
        setAmountOut(BN_ZERO);
      }
    } else {
      if (bnValue.gt(BN_ZERO)) {
        updatePools(bnValue, false);
      } else {
        setDisplayIn("");
        setAmountIn(BN_ZERO);
      }
    }
  };

  ///////////////////////////////Swap Params
  const [swapPoolAddresses, setSwapPoolAddresses] = useState<string[]>([]);
  const [swapParams, setSwapParams] = useState<any[]>([]);

  const resetAfterSwap = () => {
    setDisplayIn("");
    setDisplayOut("");
    setAmountIn(BN_ZERO);
    setAmountOut(BN_ZERO);
  };

  /////////////////////////////Ticks
  const [lowerTick, setLowerTick] = useState(BN_ZERO);
  const [upperTick, setUpperTick] = useState(BN_ZERO);

  ////////////////////////////////FeeTiers & Slippage
  const [priceImpact, setPriceImpact] = useState("0.00");

  ////////////////////////////////Gas
  const [swapGasFee, setSwapGasFee] = useState("$0.00");
  const [swapGasLimit, setSwapGasLimit] = useState(BN_ZERO);

  ////////////////////////////////
  const [expanded, setExpanded] = useState(false);

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div className="ml-auto text-xs">
              {pairSelected
                ? parseFloat(
                    ethers.utils.formatUnits(
                      amountOut ?? BN_ZERO,
                      tokenOut.decimals
                    )
                  ).toPrecision(6)
                : "Select Token"}
            </div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            <div className="ml-auto text-xs">{swapGasFee}</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Minimum received after slippage ({tradeSlippage}%)
            </div>
            <div className="ml-auto text-xs">
              {(
                (parseFloat(
                  ethers.utils.formatUnits(amountOut, tokenOut.decimals)
                ) *
                  (100 - parseFloat(tradeSlippage))) /
                100
              ).toPrecision(6)}
            </div>
          </div>

          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Price Impact</div>
            <div className="ml-auto text-xs">
              {pairSelected
                ? priceImpact
                  ? priceImpact + "%"
                  : "0.00%"
                : "Select Token"}
            </div>
          </div>
        </div>
      );
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
            ) : (
              <></>
            )}
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
      <div className="flex items-center justify-center w-full pt-7 pb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 cursor-pointer"
          onClick={() => {
            switchDirection(
              exactIn,
              exactIn ? displayIn : displayOut,
              exactIn ? setAmountIn : setAmountOut
            );
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
          />
        </svg>
      </div>
      <span className="text-[11px] text-grey1">TO</span>
      <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
        <div className="flex items-end justify-between text-[11px] text-grey1">
          <span>
            ~$
            {pairSelected &&
            !amountIn.eq(BN_ZERO) &&
            amountIn != undefined &&
            lowerTick != undefined &&
            upperTick != undefined &&
            tokenOut.address != ZERO_ADDRESS &&
            !isNaN(tokenOut.decimals) &&
            !isNaN(parseInt(amountOut.toString())) &&
            !isNaN(tokenOut.USDPrice) ? (
              (
                parseFloat(
                  ethers.utils.formatUnits(
                    amountOut ?? BN_ZERO,
                    tokenOut.decimals
                  )
                ) * (tokenOut.USDPrice ?? 0)
              ).toFixed(2)
            ) : (
              <>{(0).toFixed(2)}</>
            )}
          </span>
          <span>
            {pairSelected ? "Balance: " + tokenOut.userBalance : <></>}
          </span>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
          {<div>{inputBoxOut("0", tokenOut, "tokenOut", handleInputBox)}</div>}
          <div className="flex items-center gap-x-2">
            <SelectToken
              key={"out"}
              type="out"
              tokenIn={tokenIn}
              setTokenIn={setTokenIn}
              tokenOut={tokenOut}
              setTokenOut={setTokenOut}
              setPairSelected={setPairSelected}
              displayToken={tokenOut}
              amount={exactIn ? displayIn : displayOut}
              isAmountIn={exactIn}
            />
          </div>
        </div>
      </div>
      <div className="py-4">
        <div
          className="flex px-2 cursor-pointer py-2 rounded-[4px]"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
            {"1 " + tokenIn.symbol} ={" "}
            {displayPoolPrice(
              pairSelected,
              tradePoolData?.poolPrice,
              tokenIn,
              tokenOut
            ) +
              " " +
              tokenOut.symbol}
          </div>
          <div className="ml-auto text-xs uppercase text-[#C9C9C9]">
            <button>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-wrap w-full break-normal transition ">
          <Option />
        </div>
      </div>
      {tokenIn.address != ZERO_ADDRESS &&
      tokenOut.address != ZERO_ADDRESS &&
      tradePoolData?.id == ZERO_ADDRESS ? (
        <div className="flex gap-x-5 rounded-[4px] items-center text-xs p-2 border bg-dark border-grey mb-5">
          <Range className="text-main2" />{" "}
          <span className="text-grey3 flex flex-col gap-y-[-2px]">
            There are currently no pools for this token pair.{" "}
            <a className=" hover:underline text-main2 cursor-pointer">
              Click here to create a range pool
            </a>
          </span>
        </div>
      ) : (
        <></>
      )}
      {isDisconnected ? (
        <ConnectWalletButton xl={true} />
      ) : (
        <>
          {tokenIn.userRouterAllowance?.lt(amountIn) ? (
            <div>
              <SwapRouterApproveButton
                routerAddress={chainProperties[networkName]["routerAddress"]}
                approveToken={tokenIn.address}
                tokenSymbol={tokenIn.symbol}
                amount={amountIn}
              />
            </div>
          ) : (
            <SwapRouterButton
              disabled={
                tradeParams.disabled ||
                needsAllowanceIn ||
                swapGasLimit.eq(BN_ZERO)
              }
              routerAddress={chainProperties[networkName]["routerAddress"]}
              poolAddresses={swapPoolAddresses}
              swapParams={swapParams ?? {}}
              gasLimit={swapGasLimit}
              resetAfterSwap={resetAfterSwap}
            />
          )}
        </>
      )}
    </div>
  );
}
