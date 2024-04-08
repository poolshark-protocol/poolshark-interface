import { useEffect, useState } from "react";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useTradeStore } from "../../hooks/useTradeStore";
import useInputBox from "../../hooks/useInputBox";
import { useAccount } from "wagmi";
import { useShallow } from "zustand/react/shallow";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import SwapRouterApproveButton from "../Buttons/SwapRouterApproveButton";
import LimitSwapButton from "../Buttons/LimitSwapButton";
import SelectToken from "../SelectToken";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { BigNumber, ethers } from "ethers";
import {
  inputHandler,
  numFormat,
  parseUnits,
} from "../../utils/math/valueMath";
import {
  getLimitPoolForFeeTier,
  getSwapPools,
  limitPoolTypeIds,
} from "../../utils/pools";

import { TickMath, invertPrice } from "../../utils/math/tickMath";
import {
  getExpectedAmountInFromOutput,
  getExpectedAmountOutFromInput,
  getMarketPriceAboveBelowString,
} from "../../utils/math/priceMath";
import { chainProperties } from "../../utils/chains";
import LimitCreateAndMintButton from "../Buttons/LimitCreateAndMintButton";
import inputFilter from "../../utils/inputFilter";
import {
  gasEstimateLimitCreateAndMint,
  gasEstimateMintLimit,
} from "../../utils/gas";
import JSBI from "jsbi";
import { fetchRangeTokenUSDPrice, hasAllowance } from "../../utils/tokens";
import BalanceDisplay from "../Display/BalanceDisplay";
import { getRouterAddress } from "../../utils/config";
import { useEthersSigner } from "../../utils/viemEthersAdapters";
import SwitchDirection from "./common/SwitchDirection";
import AmountInDisplay from "./common/AmountInDisplay";
import MaxButton from "./common/MaxButton";
import AmountOutDisplay from "./common/AmountOutDisplay";
import InputBoxContainer from "./common/InputBoxContainer";
import FeeTierBox from "./common/FeeTierBox";
import PriceRangeBox from "./common/PriceRangeBox";
import Option from "./common/Option";
import useUpdateWethFee from "../../hooks/useUpdateWethFee";
import SwapNativeButtons from "./common/SwapNativeButtons";
import { tradeInputBoxes } from "../../utils/tradeInputBoxes";

export default function LimitSwap({
  quoteRefetchDelay,
}: {
  quoteRefetchDelay: number;
}) {
  const [networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [state.networkName, state.limitSubgraph]),
  );
  const tradeStore = useTradeStore();

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
  const signer = useEthersSigner();
  const [priceRangeSelected, setPriceRangeSelected] = useState(false);

  /////////////////////////////Fetch Pools
  const [selectedFeeTier, setSelectedFeeTier] = useState("3000");

  useEffect(() => {
    if (!tradeStore.limitTabSelected) return;
    if (tradeStore.exactIn) {
      setDisplayIn("");
      tradeStore.setAmountIn(BN_ZERO);
    } else {
      setDisplayOut("");
      tradeStore.setAmountOut(BN_ZERO);
    }
  }, [tradeStore.limitTabSelected]);

  const [feeTierManual, setFeeTierManual] = useState(false);

  useEffect(() => {
    if (!feeTierManual) {
      const interval = setInterval(async () => {
        // Code to run every 5 seconds
        if (
          tradeStore.exactIn
            ? tradeStore.amountIn.gt(BN_ZERO)
            : tradeStore.amountOut.gt(BN_ZERO)
        ) {
          await getSwapPools(
            limitSubgraph,
            tradeStore.tokenIn,
            tradeStore.tokenOut,
            tradeStore.tradePoolData,
            tradeStore.setTradePoolData,
            tradeStore.setTokenInTradeUSDPrice,
            tradeStore.setTokenOutTradeUSDPrice,
            tradeStore.setTradePoolPrice,
            tradeStore.setTradePoolLiquidity,
            limitPoolTypeIds["constant-product-1.1"],
          );
          setSelectedFeeTier(tradeStore.tradePoolData?.feeTier?.id);
        }
      }, quoteRefetchDelay);
      // Clear the interval when the component unmounts
      return () => clearInterval(interval);
    }
  }, [
    tradeStore.exactIn ? tradeStore.amountIn : tradeStore.amountOut,
    tradeStore.tradePoolData?.id,
  ]);

  useEffect(() => {
    if (!tradeStore.needsPairUpdate) return;
    else {
      setFeeTierManual(false);
      setDisplayOut("");
    }
    if (
      tradeStore.tokenIn.address &&
      tradeStore.tokenOut.address !== ZERO_ADDRESS
    ) {
      // adjust decimals when switching directions
      if (!tradeStore.wethCall)
        // only update pools if !wethCall
        updatePools();
    }
    tradeStore.setNeedsPairUpdate(false);
    tradeStore.setNeedsSetAmounts(true);
  }, [tradeStore.needsPairUpdate]);

  useEffect(() => {
    if (!tradeStore.needsSetAmounts) return;
    if (
      tradeStore.tokenIn.address &&
      tradeStore.tokenOut.address !== ZERO_ADDRESS
    ) {
      if (tradeStore.exactIn) {
        if (!isNaN(parseFloat(displayIn))) {
          const bnValue = parseUnits(displayIn, tradeStore.tokenIn.decimals);
          tradeStore.setAmountIn(bnValue);
          setAmounts(bnValue, true);
        }
      } else {
        if (!isNaN(parseFloat(displayOut))) {
          const bnValue = parseUnits(displayOut, tradeStore.tokenOut.decimals);
          tradeStore.setAmountOut(bnValue);
          setAmounts(bnValue, false);
        }
      }
      if (!tradeStore.tokenIn.native) tradeStore.setNeedsAllowanceIn(true);
    }
    tradeStore.setNeedsSetAmounts(false);
  }, [tradeStore.needsSetAmounts, tradeStore.tradePoolData?.id]);

  //can go to utils
  async function updatePools() {
    const pools = await getSwapPools(
      limitSubgraph,
      tradeStore.tokenIn,
      tradeStore.tokenOut,
      tradeStore.tradePoolData,
      tradeStore.setTradePoolData,
      tradeStore.setTokenInTradeUSDPrice,
      tradeStore.setTokenOutTradeUSDPrice,
      undefined,
      undefined,
      limitPoolTypeIds["constant-product-1.1"],
      setSelectedFeeTier,
    );
    if (pools?.length >= 1) {
      setSelectedFeeTier(pools[0].feeTier.id);
    }
  }

  const handleManualFeeTierChange = async (feeAmount: number) => {
    setFeeTierManual(true);
    const pool = await getLimitPoolForFeeTier(
      limitSubgraph,
      tradeStore.tokenIn,
      tradeStore.tokenOut,
      feeAmount,
      limitPoolTypeIds["constant-product-1.1"],
    );
    setSelectedFeeTier(feeAmount.toString());
    tradeStore.setTradePoolData(pool);
    if (pool.id != ZERO_ADDRESS) {
      fetchRangeTokenUSDPrice(
        pool,
        tradeStore.tokenIn,
        tradeStore.setTokenInTradeUSDPrice,
      );
      fetchRangeTokenUSDPrice(
        pool,
        tradeStore.tokenOut,
        tradeStore.setTokenOutTradeUSDPrice,
      );
    }
    tradeStore.setNeedsAllowanceIn(true);
  };

  /////////////////////Double Input Boxes
  const handleInputBox = (e) =>
    tradeInputBoxes(e, {
      tradeStore,
      setDisplayIn,
      setDisplayOut,
      setPriceImpact,
      setAmounts,
    });

  ///////////////////////////////Limit Params
  const [lowerPriceString, setLowerPriceString] = useState("0");
  const [upperPriceString, setUpperPriceString] = useState("0");

  useEffect(() => {
    if (tradeStore.needsPairUpdate) return;
    if (
      tradeStore.tradePoolData != ZERO_ADDRESS &&
      tradeStore.tradePoolData?.poolPrice != undefined
    ) {
      var newPrice = numFormat(
        parseFloat(
          invertPrice(
            TickMath.getPriceStringAtSqrtPrice(
              JSBI.BigInt(tradeStore.tradePoolData.poolPrice),
              tradeStore.tokenIn,
              tradeStore.tokenOut,
            ),
            tradeStore.limitPriceOrder,
          ),
        ),
        5,
      );
      tradeStore.setLimitPriceString(newPrice);
    } else {
      tradeStore.setLimitPriceString("0.00");
    }
  }, [tradeStore.tradePoolData?.id, tradeStore.needsPairUpdate]);

  useEffect(() => {
    if (priceRangeSelected) {
      const tickSpacing = tradeStore.tradePoolData?.feeTier?.tickSpacing;
      if (!isNaN(parseFloat(lowerPriceString))) {
        const priceLower = invertPrice(
          tradeStore.limitPriceOrder ? lowerPriceString : upperPriceString,
          tradeStore.limitPriceOrder,
        );
        setLowerTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(
              priceLower,
              tradeStore.tokenIn,
              tradeStore.tokenOut,
              tickSpacing,
            ),
          ),
        );
      }
      if (!isNaN(parseFloat(upperPriceString))) {
        const priceUpper = invertPrice(
          tradeStore.limitPriceOrder ? upperPriceString : lowerPriceString,
          tradeStore.limitPriceOrder,
        );
        setUpperTick(
          BigNumber.from(
            TickMath.getTickAtPriceString(
              priceUpper,
              tradeStore.tokenIn,
              tradeStore.tokenOut,
              tickSpacing,
            ),
          ),
        );
      }
    }
  }, [
    lowerPriceString,
    upperPriceString,
    priceRangeSelected,
    tradeStore.tokenIn,
    tradeStore.tokenOut,
  ]);

  const handlePriceSwitch = () => {
    tradeStore.setLimitPriceOrder(!tradeStore.limitPriceOrder);
    tradeStore.setLimitPriceString(
      invertPrice(tradeStore.limitPriceString, false),
    );
    setLowerPriceString(invertPrice(upperPriceString, false));
    setUpperPriceString(invertPrice(lowerPriceString, false));
    if (tradeStore.tradePoolData.id == ZERO_ADDRESS) {
      tradeStore.setStartPrice(invertPrice(tradeStore.startPrice, false));
    }
  };

  const resetAfterSwap = () => {
    setDisplayIn("");
    setDisplayOut("");
    tradeStore.setAmountIn(BN_ZERO);
    tradeStore.setAmountOut(BN_ZERO);
  };

  /////////////////////////////Ticks
  const [lowerTick, setLowerTick] = useState(BN_ZERO);
  const [upperTick, setUpperTick] = useState(BN_ZERO);

  useEffect(() => {
    if (
      !priceRangeSelected &&
      tradeStore.tradeSlippage &&
      tradeStore.limitPriceString &&
      tradeStore.tradePoolData?.feeTier?.tickSpacing
    ) {
      updateLimitTicks();
    }
  }, [
    tradeStore.limitPriceString,
    tradeStore.tradeSlippage,
    priceRangeSelected,
    tradeStore.tradePoolData?.feeTier?.tickSpacing,
  ]);

  function updateLimitTicks() {
    const tickSpacing = tradeStore.tradePoolData.feeTier?.tickSpacing ?? 30;
    const priceString = invertPrice(
      tradeStore.limitPriceString,
      tradeStore.limitPriceOrder,
    );
    if (
      isFinite(parseFloat(tradeStore.limitPriceString)) &&
      parseFloat(priceString) > 0
    ) {
      if (
        parseFloat(tradeStore.tradeSlippage) * 100 > tickSpacing &&
        parseFloat(priceString) > 0
      ) {
        const limitPriceTolerance =
          (parseFloat(priceString) *
            parseFloat(
              (parseFloat(tradeStore.tradeSlippage) * 100).toFixed(5),
            )) /
          10000;
        if (tradeStore.tokenIn.callId == 0) {
          const endPrice = parseFloat(priceString) - -limitPriceTolerance;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                priceString,
                tradeStore.tokenIn,
                tradeStore.tokenOut,
                tickSpacing,
              ),
            ),
          );
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                String(endPrice),
                tradeStore.tokenIn,
                tradeStore.tokenOut,
                tickSpacing,
              ),
            ),
          );
        } else {
          const endPrice = parseFloat(priceString) - limitPriceTolerance;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                String(endPrice),
                tradeStore.tokenIn,
                tradeStore.tokenOut,
                tickSpacing,
              ),
            ),
          );
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                priceString,
                tradeStore.tokenIn,
                tradeStore.tokenOut,
                tickSpacing,
              ),
            ),
          );
        }
      } else {
        if (tradeStore.tokenIn.callId == 0) {
          const endTick =
            TickMath.getTickAtPriceString(
              priceString,
              tradeStore.tokenIn,
              tradeStore.tokenOut,
              tickSpacing,
            ) - -tickSpacing;
          setLowerTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                priceString,
                tradeStore.tokenIn,
                tradeStore.tokenOut,
                tickSpacing,
              ),
            ),
          );
          setUpperTick(BigNumber.from(String(endTick)));
        } else {
          const endTick =
            TickMath.getTickAtPriceString(
              priceString,
              tradeStore.tokenIn,
              tradeStore.tokenOut,
              tickSpacing,
            ) - tickSpacing;
          setLowerTick(BigNumber.from(String(endTick)));
          setUpperTick(
            BigNumber.from(
              TickMath.getTickAtPriceString(
                priceString,
                tradeStore.tokenIn,
                tradeStore.tokenOut,
                tickSpacing,
              ),
            ),
          );
        }
      }
    }
  }

  useEffect(() => {
    if (tradeStore.exactIn) {
      if (!isNaN(parseFloat(tradeStore.limitPriceString))) {
        if (tradeStore.wethCall) {
          setDisplayOut(displayIn);
          tradeStore.setAmountOut(tradeStore.amountIn);
        } else {
          const tokenOutAmount = getExpectedAmountOutFromInput(
            Number(lowerTick),
            Number(upperTick),
            tradeStore.tokenIn.callId == 0,
            tradeStore.amountIn,
          );
          const tokenOutAmountDisplay = numFormat(
            parseFloat(
              ethers.utils.formatUnits(
                tokenOutAmount.toString(),
                tradeStore.tokenOut.decimals,
              ),
            ),
            5,
          );
          if (tokenOutAmount.gt(BN_ZERO)) {
            setDisplayOut(tokenOutAmountDisplay);
            tradeStore.setAmountOut(tokenOutAmount);
          } else {
            setDisplayOut("");
            tradeStore.setAmountOut(BN_ZERO);
          }
        }
      } else {
        setDisplayOut("");
        tradeStore.setAmountOut(BN_ZERO);
      }
    } else {
      if (!isNaN(parseFloat(tradeStore.limitPriceString))) {
        if (tradeStore.wethCall) {
          setDisplayIn(displayOut);
          tradeStore.setAmountIn(tradeStore.amountOut);
        } else {
          const tokenInAmount = getExpectedAmountInFromOutput(
            Number(lowerTick),
            Number(upperTick),
            tradeStore.tokenIn.callId == 0,
            tradeStore.amountOut,
          );
          const tokenInAmountDisplay = numFormat(
            parseFloat(
              ethers.utils.formatUnits(
                tokenInAmount.toString(),
                tradeStore.tokenIn.decimals,
              ),
            ),
            5,
          );
          setDisplayIn(tokenInAmountDisplay);
          tradeStore.setAmountIn(tokenInAmount);
        }
      } else {
        setDisplayIn("");
        tradeStore.setAmountIn(BN_ZERO);
      }
    }
  }, [lowerTick, upperTick]);

  const setAmounts = (bnValue: BigNumber, isAmountIn: boolean) => {
    if (isAmountIn) {
      if (bnValue.gt(BN_ZERO)) {
        if (tradeStore.wethCall) {
          setDisplayOut(
            ethers.utils.formatUnits(bnValue, tradeStore.tokenIn.decimals),
          );
          tradeStore.setAmountOut(bnValue);
        } else {
          const tokenOutAmount = getExpectedAmountOutFromInput(
            Number(lowerTick),
            Number(upperTick),
            tradeStore.tokenIn.callId == 0,
            bnValue,
          );
          const tokenOutAmountDisplay = numFormat(
            parseFloat(
              ethers.utils.formatUnits(
                tokenOutAmount.toString(),
                tradeStore.tokenOut.decimals,
              ),
            ),
            5,
          );
          setDisplayOut(tokenOutAmountDisplay);
          tradeStore.setAmountOut(tokenOutAmount);
        }
      } else {
        setDisplayOut("");
        tradeStore.setAmountOut(BN_ZERO);
      }
    } else {
      if (bnValue.gt(BN_ZERO)) {
        if (tradeStore.wethCall) {
          setDisplayIn(
            ethers.utils.formatUnits(bnValue, tradeStore.tokenOut.decimals),
          );
          tradeStore.setAmountIn(bnValue);
        } else {
          const tokenInAmount = getExpectedAmountInFromOutput(
            Number(lowerTick),
            Number(upperTick),
            tradeStore.tokenIn.callId == 0,
            bnValue,
          );
          const tokenInAmountDisplay = numFormat(
            parseFloat(
              ethers.utils.formatUnits(
                tokenInAmount.toString(),
                tradeStore.tokenIn.decimals,
              ),
            ),
            5,
          );
          setDisplayIn(tokenInAmountDisplay);
          tradeStore.setAmountIn(tokenInAmount);
        }
      } else {
        setDisplayIn("");
        tradeStore.setAmountIn(BN_ZERO);
      }
    }
  };

  ////////////////////////////////FeeTiers & Slippage
  const [priceImpact, setPriceImpact] = useState("0.00");

  useEffect(() => {
    if (
      tradeStore.tradePoolData?.id == ZERO_ADDRESS &&
      tradeStore.startPrice &&
      !isNaN(parseFloat(tradeStore.startPrice))
    ) {
      tradeStore.setTradePoolData({
        id: ZERO_ADDRESS,
        poolPrice: String(
          TickMath.getSqrtPriceAtPriceString(
            invertPrice(tradeStore.startPrice, tradeStore.limitPriceOrder),
            tradeStore.tokenIn,
            tradeStore.tokenOut,
          ),
        ),
        tickAtPrice: TickMath.getTickAtPriceString(
          invertPrice(tradeStore.startPrice, tradeStore.limitPriceOrder),
          tradeStore.tokenIn,
          tradeStore.tokenOut,
        ),
        // hard set at 0.3% tier
        feeTier: {
          feeAmount: 3000,
          tickSpacing: 30,
        },
      });
    }
  }, [tradeStore.tradePoolData?.id, tradeStore.startPrice]);

  ////////////////////////////////Gas
  const [mintFee, setMintFee] = useState("$0.00");
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);
  ////////////////////////////////Gas
  const [swapGasFee, setSwapGasFee] = useState("$0.00");
  const [swapGasLimit, setSwapGasLimit] = useState(BN_ZERO);

  const updateWethFee = useUpdateWethFee({
    setSwapGasFee,
    setSwapGasLimit,
  });

  useEffect(() => {
    if (
      !tradeStore.amountIn.eq(BN_ZERO) &&
      (!tradeStore.needsAllowanceIn || tradeStore.tokenIn.native) &&
      tradeStore.tradePoolData != undefined &&
      !tradeStore.wethCall
    ) {
      updateMintFee();
    } else if (tradeStore.wethCall) {
      updateWethFee();
    }
  }, [
    tradeStore.tokenIn.address,
    tradeStore.tokenOut.address,
    tradeStore.tokenIn.native,
    tradeStore.tokenIn.userBalance,
    tradeStore.tokenIn.userRouterAllowance,
    lowerTick,
    upperTick,
    tradeStore.needsAllowanceIn,
    tradeStore.wethCall,
    tradeStore.amountIn,
  ]);

  async function updateMintFee() {
    if (
      hasAllowance(tradeStore.tokenIn, tradeStore.amountIn) &&
      lowerTick?.lt(upperTick)
    )
      if (tradeStore.tradePoolData?.id != ZERO_ADDRESS) {
        await gasEstimateMintLimit(
          tradeStore.tradePoolData.id,
          address,
          lowerTick,
          upperTick,
          tradeStore.tokenIn,
          tradeStore.tokenOut,
          tradeStore.amountIn,
          signer,
          setMintFee,
          setMintGasLimit,
          networkName,
          limitSubgraph,
        );
      } else {
        await gasEstimateLimitCreateAndMint(
          limitPoolTypeIds["constant-product-1.1"],
          tradeStore.tradePoolData?.feeTier?.feeAmount ?? 3000,
          address,
          lowerTick,
          upperTick,
          tradeStore.tokenIn,
          tradeStore.tokenOut,
          tradeStore.amountIn,
          tradeStore.tradePoolData?.feeTier?.tickSpacing ?? 30,
          tradeStore.startPrice,
          signer,
          setMintFee,
          setMintGasLimit,
          networkName,
          limitSubgraph,
        );
      }
  }

  return (
    <div>
      <InputBoxContainer>
        <div className="flex items-end justify-between text-[11px] text-grey1">
          <AmountInDisplay
            displayIn={displayIn}
            amountIn={tradeStore.amountIn}
            tokenIn={tradeStore.tokenIn}
            approximate
          />
          <BalanceDisplay token={tradeStore.tokenIn}></BalanceDisplay>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3">
          {inputBoxIn("0", tradeStore.tokenIn, "tokenIn", handleInputBox)}
          <div className="flex items-center gap-x-2">
            {isConnected && tradeStore.tokenIn.address != ZERO_ADDRESS ? (
              <MaxButton
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tradeStore.tokenIn.userBalance.toString(),
                      name: "tokenIn",
                    },
                  });
                }}
              />
            ) : null}
            <SelectToken
              index="0"
              key="in"
              type="in"
              tokenIn={tradeStore.tokenIn}
              setTokenIn={tradeStore.setTokenIn}
              tokenOut={tradeStore.tokenOut}
              setTokenOut={tradeStore.setTokenOut}
              displayToken={tradeStore.tokenIn}
              amount={tradeStore.exactIn ? displayIn : displayOut}
              isAmountIn={tradeStore.exactIn}
            />
          </div>
        </div>
      </InputBoxContainer>

      <SwitchDirection
        displayIn={displayIn}
        displayOut={displayOut}
        switchDirection={tradeStore.switchDirection}
        exactIn={tradeStore.exactIn}
        setAmountIn={tradeStore.setAmountIn}
        setAmountOut={tradeStore.setAmountOut}
      />

      <span className="text-[11px] text-grey1">TO</span>
      <InputBoxContainer>
        <div className="flex items-end justify-between text-[11px] text-grey1">
          <AmountOutDisplay
            displayOut={displayOut}
            tokenOut={tradeStore.tokenOut}
            approximate
          />
          <span>
            {tradeStore.pairSelected ? (
              "Balance: " +
              (!isNaN(tradeStore.tokenOut?.userBalance)
                ? tradeStore.tokenOut.userBalance
                : "0")
            ) : (
              <></>
            )}
          </span>
        </div>
        <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
          <div>
            {inputBoxOut("0", tradeStore.tokenOut, "tokenOut", handleInputBox)}
          </div>

          <div className="flex items-center gap-x-2">
            {isConnected && tradeStore.tokenOut.address != ZERO_ADDRESS ? (
              <MaxButton
                onClick={() => {
                  handleInputBox({
                    target: {
                      value: tradeStore.tokenOut.userBalance.toString(),
                      name: "tokenOut",
                    },
                  });
                }}
              />
            ) : null}
            <SelectToken
              key={"out"}
              type="out"
              tokenIn={tradeStore.tokenIn}
              setTokenIn={tradeStore.setTokenIn}
              tokenOut={tradeStore.tokenOut}
              setTokenOut={tradeStore.setTokenOut}
              setPairSelected={tradeStore.setPairSelected}
              displayToken={tradeStore.tokenOut}
              amount={tradeStore.exactIn ? displayIn : displayOut}
              isAmountIn={tradeStore.exactIn}
            />
          </div>
        </div>
      </InputBoxContainer>
      {tradeStore.pairSelected ? (
        <div className="flex gap-y-4 w-full items-center mt-5 justify-between bg-dark border-grey/80 p-2 border rounded-[4px]">
          <div className="bg-dark text-sm uppercase pl-2 rounded-[4px] flex items-center gap-x-2">
            <span className="md:block hidden">SELECT A</span> Fee tier:
          </div>
          <div className="grid grid-cols-3 gap-x-3">
            <FeeTierBox
              selected={selectedFeeTier == "1000"}
              onClick={() => handleManualFeeTierChange(1000)}
            >
              0.1%
            </FeeTierBox>
            <FeeTierBox
              selected={selectedFeeTier == "3000"}
              onClick={() => handleManualFeeTierChange(3000)}
            >
              0.3%
            </FeeTierBox>
            <FeeTierBox
              selected={selectedFeeTier == "10000"}
              onClick={() => handleManualFeeTierChange(10000)}
            >
              1.0%
            </FeeTierBox>
          </div>
        </div>
      ) : null}
      <div className="mt-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-3 text-sm">
            <span className="md:block hidden">PRICE:</span>
            <div className="md:text-xs text-[10px]">
              <button
                className={`md:px-5 px-3 py-2 ${
                  priceRangeSelected
                    ? "bg-black border-l border-t border-b border-grey"
                    : "bg-main1 border border-main"
                }`}
                onClick={() => setPriceRangeSelected(false)}
              >
                EXACT PRICE
              </button>
              <button
                className={`md:px-5 px-3 py-2 ${
                  priceRangeSelected
                    ? "bg-main1 border border-main"
                    : "bg-black border-r border-t border-b border-grey"
                }`}
                onClick={() => setPriceRangeSelected(true)}
              >
                PRICE RANGE
              </button>
            </div>
          </div>
          <span
            className=" text-xs flex items-center gap-x-2 group cursor-pointer"
            onClick={handlePriceSwitch}
          >
            <span className="text-grey1 group-hover:text-white transition-all">
              {tradeStore.tokenIn.callId == 0 &&
              tradeStore.pairSelected === false ? (
                <div>{tradeStore.tokenIn.symbol} per ?</div>
              ) : (
                <div>
                  {" "}
                  {tradeStore.limitPriceOrder ==
                  (tradeStore.tokenIn.callId == 0)
                    ? tradeStore.tokenOut.symbol +
                      " per " +
                      tradeStore.tokenIn.symbol
                    : tradeStore.tokenIn.symbol +
                      " per " +
                      tradeStore.tokenOut.symbol}
                </div>
              )}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="text-white w-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          </span>
        </div>
        {priceRangeSelected ? (
          <div className="flex items-center justify-between gap-x-10 mt-4">
            <PriceRangeBox
              value={lowerPriceString}
              onChange={(e) => {
                setLowerPriceString(inputFilter(e.target.value));
              }}
            >
              MIN. PRICE
            </PriceRangeBox>

            <PriceRangeBox
              value={upperPriceString}
              onChange={(e) => {
                setUpperPriceString(inputFilter(e.target.value));
              }}
            >
              MAX. PRICE
            </PriceRangeBox>
          </div>
        ) : (
          <div className="bg-dark py-3 px-5 border border-grey rounded-[4px] mt-4">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>
                {getMarketPriceAboveBelowString(
                  tradeStore.limitPriceString,
                  tradeStore.pairSelected,
                  tradeStore.limitPriceOrder,
                  tradeStore.tradePoolData,
                  tradeStore.tokenIn,
                  tradeStore.tokenOut,
                )}
              </span>
            </div>
            <input
              autoComplete="off"
              className="bg-dark outline-none text-3xl my-3 w-60 md:w-auto"
              placeholder="0"
              value={tradeStore.limitPriceString}
              type="text"
              disabled={tradeStore.wethCall}
              onChange={(e) => {
                if (e.target.value !== "" && e.target.value !== "0") {
                  tradeStore.setLimitPriceString(inputFilter(e.target.value));
                } else {
                  tradeStore.setLimitPriceString("0");
                }
              }}
            />
          </div>
        )}
      </div>
      {tradeStore.tokenIn.address != ZERO_ADDRESS &&
      tradeStore.tokenOut.address != ZERO_ADDRESS &&
      tradeStore.tradePoolData?.id == ZERO_ADDRESS &&
      !tradeStore.wethCall ? (
        <div className="bg-dark border rounded-[4px] border-grey/50 p-5 mt-5">
          <p className="text-xs text-grey1 flex items-center gap-x-4 mb-5">
            This pool does not exist so a start price must be set.
          </p>
          <div className="border bg-black border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
            <span className="text-grey1 text-xs">STARTING PRICE</span>
            <span className="text-white text-3xl">
              <input
                autoComplete="off"
                className="bg-black py-2 outline-none text-center w-full"
                placeholder="0"
                id="startPrice"
                value={tradeStore.startPrice}
                type="text"
                onChange={(e) => {
                  tradeStore.setStartPrice(inputFilter(e.target.value));
                }}
              />
            </span>
          </div>
        </div>
      ) : (
        <></>
      )}

      <Option>
        <div className="flex p-1">
          <div className="text-xs text-[#4C4C4C]">
            Minimum received after slippage ({tradeStore.tradeSlippage}%)
          </div>
          <div className="ml-auto text-xs">
            {numFormat(
              (parseFloat(
                ethers.utils.formatUnits(
                  tradeStore.amountOut,
                  tradeStore.tokenOut.decimals,
                ),
              ) *
                (100 - parseFloat(tradeStore.tradeSlippage))) /
                100,
              5,
            )}
          </div>
        </div>
      </Option>

      {isDisconnected ? (
        <ConnectWalletButton xl={true} />
      ) : (
        <>
          {!hasAllowance(tradeStore.tokenIn, tradeStore.amountIn) &&
          tradeStore.pairSelected ? (
            <SwapRouterApproveButton
              routerAddress={getRouterAddress(networkName)}
              approveToken={tradeStore.tokenIn.address}
              tokenSymbol={tradeStore.tokenIn.symbol}
              amount={tradeStore.amountIn}
            />
          ) : !tradeStore.wethCall ? (
            tradeStore.tokenOut.address == ZERO_ADDRESS ||
            tradeStore.tradePoolData?.id != ZERO_ADDRESS ? (
              <LimitSwapButton
                routerAddress={getRouterAddress(networkName)}
                disabled={
                  mintGasLimit.lt(BigNumber.from("100000")) ||
                  tradeStore.tradeButton.disabled
                }
                poolAddress={tradeStore.tradePoolData?.id}
                to={address}
                amount={tradeStore.amountIn}
                mintPercent={parseUnits("1", 24)}
                lower={lowerTick}
                upper={upperTick}
                closeModal={() => {}}
                zeroForOne={tradeStore.tokenIn.callId == 0}
                gasLimit={mintGasLimit}
                resetAfterSwap={resetAfterSwap}
              />
            ) : (
              <LimitCreateAndMintButton
                disabled={
                  mintGasLimit.eq(BN_ZERO) || tradeStore.tradeButton.disabled
                }
                routerAddress={getRouterAddress(networkName)}
                poolTypeId={limitPoolTypeIds["constant-product-1.1"]}
                tokenIn={tradeStore.tokenIn}
                tokenOut={tradeStore.tokenOut}
                feeTier={tradeStore.tradePoolData?.feeTier?.feeAmount}
                to={address}
                amount={tradeStore.amountIn}
                mintPercent={parseUnits("1", 24)}
                lower={lowerTick}
                upper={upperTick}
                closeModal={() => {}}
                zeroForOne={tradeStore.tokenIn.callId == 0}
                gasLimit={mintGasLimit}
              />
            )
          ) : (
            <SwapNativeButtons
              native={tradeStore.tokenIn.native}
              disabled={
                swapGasLimit.eq(BN_ZERO) || tradeStore.tradeButton.disabled
              }
              routerAddress={getRouterAddress(networkName)}
              wethAddress={chainProperties[networkName]["wethAddress"]}
              tokenInSymbol={tradeStore.tokenIn.symbol}
              amountIn={tradeStore.amountIn}
              gasLimit={swapGasLimit}
              resetAfterSwap={resetAfterSwap}
            />
          )}
        </>
      )}
    </div>
  );
}
