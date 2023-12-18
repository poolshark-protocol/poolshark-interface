import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import {
  useAccount,
  erc20ABI,
  useContractRead,
  useBalance,
  useSigner,
  useProvider,
} from "wagmi";
import useInputBox from "../../../hooks/useInputBox";
import RangeAddLiqButton from "../../Buttons/RangeAddLiqButton";
import { BN_ZERO, ZERO } from "../../../utils/math/constants";
import { TickMath } from "../../../utils/math/tickMath";
import { ethers, BigNumber } from "ethers";
import JSBI from "jsbi";
import { DyDxMath } from "../../../utils/math/dydxMath";
import {
  chainIdsToNames,
  chainProperties,
} from "../../../utils/chains";
import RangeMintDoubleApproveButton from "../../Buttons/RangeMintDoubleApproveButton";
import RangeMintApproveButton from "../../Buttons/RangeMintApproveButton";
import { useRangeLimitStore } from "../../../hooks/useRangeLimitStore";
import { gasEstimateRangeMint } from "../../../utils/gas";
import { useRouter } from "next/router";
import { inputHandler } from "../../../utils/math/valueMath";
import { useConfigStore } from "../../../hooks/useConfigStore";
import { getLogoURI } from "../../../utils/tokens";

export default function RangeAddLiquidity({ isOpen, setIsOpen }) {
  const [
    chainId,
    networkName,
    logoMap
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.logoMap,
  ]);

  const [
    rangePoolAddress,
    rangePoolData,
    rangeMintParams,
    pairSelected,
    setPairSelected,
    tokenIn,
    setTokenInAllowance,
    setTokenInBalance,
    setTokenInAmount,
    tokenOut,
    setTokenOutAllowance,
    setTokenOutBalance,
    setTokenOutAmount,
    setLiquidityAmount,
    rangePositionData,
    needsAllowanceIn,
    setNeedsAllowanceIn,
    needsAllowanceOut,
    setNeedsAllowanceOut,
    needsBalanceIn,
    setNeedsBalanceIn,
    needsBalanceOut,
    setNeedsBalanceOut,
    setMintButtonState,
  ] = useRangeLimitStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangeMintParams,
    state.pairSelected,
    state.setPairSelected,
    state.tokenIn,
    state.setTokenInRangeAllowance,
    state.setTokenInBalance,
    state.setTokenInAmount,
    state.tokenOut,
    state.setTokenOutRangeAllowance,
    state.setTokenOutBalance,
    state.setTokenOutAmount,
    state.setLiquidityAmount,
    state.rangePositionData,
    state.needsAllowanceIn,
    state.setNeedsAllowanceIn,
    state.needsAllowanceOut,
    state.setNeedsAllowanceOut,
    state.needsBalanceIn,
    state.setNeedsBalanceIn,
    state.needsBalanceOut,
    state.setNeedsBalanceOut,
    state.setMintButtonState,
  ]);

  const { bnInput, inputBox, setDisplay } = useInputBox();
  const { bnInput: bnInput2, inputBox: inputBox2, setDisplay: setDisplay2 } = useInputBox();
  const router = useRouter();
  const provider = useProvider();
  const { address } = useAccount();
  const signer = new ethers.VoidSigner(address, provider);

  const [disabled, setDisabled] = useState(false);
  const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(
    Number(rangePositionData.min)
  );
  const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
    Number(rangePositionData.max)
  );
  const [stateChainName, setStateChainName] = useState();
  const [tokenOrder, setTokenOrder] = useState(
    tokenIn.address.localeCompare(tokenOut.address) < 0
  );
  const { isConnected } = useAccount();
  const [rangeSqrtPrice, setRangeSqrtPrice] = useState(
    JSBI.BigInt(rangePositionData.price)
  );
  const [doubleApprove, setdoubleApprove] = useState(false);
  const [buttonState, setButtonState] = useState("");

  useEffect(() => {
    setTokenInAmount(BN_ZERO)
    setTokenOutAmount(BN_ZERO)
    setStateChainName(chainIdsToNames[chainId]);
  }, [chainId]);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setPairSelected(true)
    }
  }, [tokenIn, tokenOut]);

  ////////////////////////////////Allowances

  const { data: tokenInAllowance } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties[networkName]["routerAddress"]],
    chainId: chainId,
    watch: router.isReady,
    enabled: isConnected,
    onSuccess(data) {
      //console.log("Success");
      setNeedsAllowanceIn(false);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const { data: tokenOutAllowance } = useContractRead({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties[networkName]["routerAddress"]],
    chainId: chainId,
    watch: router.isReady,
    enabled: isConnected,
    onSuccess(data) {
      //console.log("Success");
      setNeedsAllowanceOut(false);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  useEffect(() => {
    setTokenInAllowance(tokenInAllowance);
    setTokenOutAllowance(tokenOutAllowance);
  }, [tokenInAllowance, tokenOutAllowance]);

  ////////////////////////////////Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.address,
    enabled: tokenIn.address != undefined,
    watch: true,
    chainId: chainId,
    onSuccess(data) {
      setNeedsBalanceIn(false);
    },
  });

  const { data: tokenOutBal } = useBalance({
    address: address,
    token: tokenOut.address,
    enabled: tokenOut.address != undefined && needsBalanceOut,
    watch: true,
    chainId: chainId,
    onSuccess(data) {
      setNeedsBalanceOut(false);
    },
  });

  useEffect(() => {
    if (isConnected) {
      setTokenInBalance(
        tokenInBal?.formatted.toString()
      );
      if (pairSelected) {
        setTokenOutBalance(
          tokenOutBal?.formatted.toString()
        );
      }
    }
  }, [tokenInBal, tokenOutBal]);

  //////////////////////////////Button states -> to be removed (on store)

  // disabled messages
  useEffect(() => {
    if (
      Number(ethers.utils.formatUnits(rangeMintParams.tokenInAmount, tokenIn.decimals)) >
      Number(tokenIn.userBalance)
    ) {
      setButtonState("balance0");
    }
    if (
      Number(ethers.utils.formatUnits(rangeMintParams.tokenOutAmount, tokenIn.decimals)) >
      Number(tokenOut.userBalance)
    ) {
      setButtonState("balance1");
    }
    if (rangeMintParams.tokenInAmount.eq(BN_ZERO) &&
        rangeMintParams.tokenOutAmount.eq(BN_ZERO)) {
      setButtonState("amount");
    }
    if (
      rangeMintParams.tokenInAmount.eq(BN_ZERO) ||
      Number(ethers.utils.formatUnits(rangeMintParams.tokenInAmount, tokenIn.decimals)) >
        Number(tokenIn.userBalance) ||
      Number(ethers.utils.formatUnits(rangeMintParams.tokenOutAmount, tokenOut.decimals)) >
        Number(tokenOut.userBalance)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [bnInput, tokenIn.userBalance, tokenOut.userBalance, disabled]);

  ////////////////////////////////Amounts

  const [amountInDisabled, setAmountInDisabled] = useState(undefined)
  const [amountOutDisabled, setAmountOutDisabled] = useState(undefined)

  useEffect(() => {
    if (amountInDisabled == undefined) {
      const token0Disabled = JSBI.lessThanOrEqual(upperSqrtPrice, rangeSqrtPrice)
      const token1Disabled = JSBI.greaterThanOrEqual(lowerSqrtPrice, rangeSqrtPrice)
      const tokenInDisabled = tokenIn.callId == 0 ? token0Disabled : token1Disabled
      const tokenOutDisabled = tokenOut.callId == 0 ? token0Disabled : token1Disabled
      setAmountInDisabled(tokenInDisabled)
      setAmountOutDisabled(tokenOutDisabled)
    }
  }, [lowerSqrtPrice, upperSqrtPrice]);

  const handleInput1 = (e) => {
    if (e.target.name === "tokenIn") {
      const [value, bnValue] = inputHandler(e, tokenIn)
      setDisplay(value)
      if (!amountOutDisabled)
        setAmounts(true, bnValue)
      else {
        setTokenInAmount(bnValue)
        setDisplay2('')
      }
    } else if (e.target.name === "tokenOut") {
      const [value, bnValue] = inputHandler(e, tokenOut)
      setDisplay2(value)
      if (!amountInDisabled)
        setAmounts(false, bnValue)
      else {
        setTokenOutAmount(bnValue)
        setDisplay('')
      }
    }
  };

  function setAmounts(amountInSet: boolean, amountSet: BigNumber) {
    try {
        const isToken0 = amountInSet ? tokenIn.callId == 0
                                     : tokenOut.callId == 0
        const inputBn = amountSet
        if (amountSet.gt(BN_ZERO)) {
          let liquidity = ZERO;
          if(JSBI.greaterThanOrEqual(rangeSqrtPrice, lowerSqrtPrice) &&
             JSBI.lessThan(rangeSqrtPrice, upperSqrtPrice)) {
              liquidity = DyDxMath.getLiquidityForAmounts(
                isToken0 ? rangeSqrtPrice : lowerSqrtPrice,
                isToken0 ? upperSqrtPrice : rangeSqrtPrice,
                rangeSqrtPrice,
                isToken0 ? BN_ZERO : inputBn,
                isToken0 ? inputBn : BN_ZERO
              )
          } else if (JSBI.lessThan(rangeSqrtPrice, lowerSqrtPrice)) {
              // only token0 input allowed
              if (isToken0) {
                liquidity = DyDxMath.getLiquidityForAmounts(
                  lowerSqrtPrice,
                  upperSqrtPrice,
                  rangeSqrtPrice,
                  BN_ZERO,
                  inputBn
                )
              } else {
                // warn the user the input is invalid
              }
          } else if (JSBI.greaterThanOrEqual(rangeSqrtPrice, upperSqrtPrice)) {
              if (!isToken0) {
                liquidity = DyDxMath.getLiquidityForAmounts(
                  lowerSqrtPrice,
                  upperSqrtPrice,
                  rangeSqrtPrice,
                  inputBn,
                  BN_ZERO
                )
              } else {
                // warn the user the input is invalid
              }
          }
          setLiquidityAmount(liquidity)
          const outputJsbi = JSBI.greaterThan(liquidity, ZERO)
            ? isToken0
              ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
              : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
            : ZERO;
          const outputBn = BigNumber.from(String(outputJsbi))
          // set amount based on inputBn
          if (amountInSet) {
            setTokenInAmount(inputBn);
            setTokenOutAmount(outputBn);
            setDisplay2(parseFloat(ethers.utils.formatUnits(outputBn, tokenOut.decimals)).toPrecision(6))
          } else {
            setTokenInAmount(BigNumber.from(String(outputJsbi)));
            setTokenOutAmount(inputBn);
            setDisplay(parseFloat(ethers.utils.formatUnits(outputBn, tokenIn.decimals)).toPrecision(6))
          }
          setDisabled(false);
        } else {
          setTokenInAmount(BN_ZERO);
          setTokenOutAmount(BN_ZERO);
          if (amountInSet) {
            setDisplay2('')
          } else {
            setDisplay('')
          }
          setDisabled(true);
        }
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////Mint Gas Fee
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (
      rangeMintParams.tokenInAmount &&
      rangeMintParams.tokenOutAmount &&
      (
        rangeMintParams.tokenInAmount.gt(BN_ZERO) ||
        rangeMintParams.tokenOutAmount.gt(BN_ZERO)
      ) &&
      rangePositionData.min &&
      rangePositionData.max &&
      Number(rangePositionData.min) < Number(rangePositionData.max) &&
      tokenIn.userRouterAllowance?.gte(rangeMintParams.tokenInAmount) &&
      tokenOut.userRouterAllowance?.gte(rangeMintParams.tokenOutAmount)
    ) {
      updateGasFee();
    }
  }, [tokenIn.userRouterAllowance, tokenOut.userRouterAllowance, rangeMintParams.tokenInAmount, rangeMintParams.tokenOutAmount, rangePositionData]);

  async function updateGasFee() {
    const newGasFee = await gasEstimateRangeMint(
      rangePoolAddress,
      address,
      rangePositionData.min,
      rangePositionData.max,
      tokenIn,
      tokenOut,
      rangeMintParams.tokenInAmount,
      rangeMintParams.tokenOutAmount,
      signer,
      rangePositionData.staked,
      networkName,
      rangePositionData.positionId
    );
    setMintGasLimit(newGasFee.gasUnits.mul(130).div(100));
  }

  ////////////////////////////////Mint Button State

  useEffect(() => {
    setMintButtonState();
  }, [rangeMintParams.liquidityAmount, rangePositionData.lowerPrice, rangePositionData.upperPrice]);

  ////////////////////////////////

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[4px] bg-black text-white border border-grey text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="flex items-center justify-between px-2 mb-5">
                  <h1 className="">Add Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-y-3 mb-5">
                  <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                    <div className="flex items-end justify-between text-[11px] text-grey1">
                      <span>
                        ~$
                        {Number(
                              tokenIn.USDPrice *
                                parseFloat(
                                  ethers.utils.formatUnits(
                                    rangeMintParams.tokenInAmount,
                                    tokenIn.decimals
                                  )
                                )
                            ).toFixed(2)}
                      </span>
                      <span>
                        BALANCE: {tokenIn.userBalance ? tokenIn.userBalance : 0}
                      </span>
                    </div>
                    <div className="flex items-end justify-between mt-2 mb-3">
                      {inputBox("0", tokenIn, "tokenIn", handleInput1, amountInDisabled)}
                      <div className="flex items-center gap-x-2">
                        {isConnected && stateChainName === networkName ? (
                          <button
                            onClick={() => {handleInput1({target: {value: tokenIn.userBalance.toString(), name: "tokenIn"}})}}
                            disabled={amountInDisabled}
                            className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
                          >
                            MAX
                          </button>
                        ) : null}
                        <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                          <img height="28" width="25" src={getLogoURI(logoMap, tokenIn)} />
                          {tokenIn.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2 flex flex-col gap-y-2">
                    <div className="flex items-end justify-between text-[11px] text-grey1">
                      <span>
                        ~$
                        {(
                          Number(tokenOut.USDPrice) *
                          Number(
                            ethers.utils.formatUnits(
                              rangeMintParams.tokenOutAmount,
                              18
                            )
                          )
                        ).toFixed(2)}
                      </span>
                      <span>
                        BALANCE:{" "}
                        {tokenOut.userBalance ? tokenOut.userBalance : 0}
                      </span>
                    </div>
                    <div className="flex items-end justify-between mt-2 mb-3">
                      <span className="text-3xl">
                        {inputBox2("0", tokenOut, "tokenOut", handleInput1, amountOutDisabled)}
                      </span>
                      <div className="flex items-center gap-x-2">
                      {isConnected && stateChainName === networkName ? (
                          <button
                            onClick={() => {handleInput1({target: {value: tokenOut.userBalance.toString(), name: "tokenOut"}})}}
                            disabled={amountOutDisabled}
                            className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
                          >
                            MAX
                          </button>
                        ) : null}
                        <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                          <img height="28" width="25" src={getLogoURI(logoMap, tokenOut)} />
                          {tokenOut.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!tokenInAllowance || !tokenOutAllowance ? (
                    <button
                      disabled={disabled}
                      className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
                    >
                      {buttonState === "amount" ? <>Input Amount</> : <></>}
                      {buttonState === "balance0" ? (
                        <>Low {tokenIn.symbol} Balance</>
                      ) : (
                        <></>
                      )}
                      {buttonState === "balance1" ? (
                        <>Low {tokenOut.symbol} Balance</>
                      ) : (
                        <></>
                      )}
                    </button>
                  ) : (
                    <>
                      {tokenInAllowance?.gte(rangeMintParams.tokenInAmount) &&
                      tokenOutAllowance?.gte(rangeMintParams.tokenOutAmount) ? (
                        <RangeAddLiqButton
                          routerAddress={
                            chainProperties[networkName]["routerAddress"]
                          }
                          poolAddress={rangePoolAddress}
                          address={address}
                          lower={rangePositionData.min}
                          upper={rangePositionData.max}
                          amount0={rangeMintParams.tokenInAmount}
                          amount1={rangeMintParams.tokenOutAmount}
                          disabled={rangeMintParams.disabled}
                          setIsOpen={setIsOpen}
                          positionId={rangePositionData.positionId}
                          gasLimit={mintGasLimit}
                        />
                      ) : (tokenInAllowance.lt(rangeMintParams.tokenInAmount) &&
                          tokenOutAllowance.lt(
                            rangeMintParams.tokenOutAmount
                          )) ||
                        doubleApprove ? (
                        <RangeMintDoubleApproveButton
                          routerAddress={
                            chainProperties[networkName]["routerAddress"]
                          }
                          tokenIn={tokenIn}
                          tokenOut={tokenOut}
                          amount0={rangeMintParams.tokenInAmount}
                          amount1={rangeMintParams.tokenOutAmount}
                        />
                      ) : !doubleApprove &&
                        tokenInAllowance.lt(rangeMintParams.tokenInAmount) ? (
                        <RangeMintApproveButton
                          routerAddress={
                            chainProperties[networkName]["routerAddress"]
                          }
                          approveToken={tokenIn}
                          amount={rangeMintParams.tokenInAmount}
                        />
                      ) : !doubleApprove &&
                        tokenOutAllowance.lt(rangeMintParams.tokenOutAmount) ? (
                        <RangeMintApproveButton
                          routerAddress={
                            chainProperties[networkName]["routerAddress"]
                          }
                          approveToken={tokenOut}
                          amount={rangeMintParams.tokenOutAmount}
                        />
                      ) : null}
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
