import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useAccount, erc20ABI, useSigner, useBalance } from "wagmi";
import useInputBox from "../../../hooks/useInputBox";
import LimitAddLiqButton from "../../Buttons/LimitAddLiqButton";
import { BigNumber, ethers } from "ethers";
import { useContractRead } from "wagmi";
import { BN_ZERO } from "../../../utils/math/constants";
import SwapRouterApproveButton from "../../Buttons/SwapRouterApproveButton";
import { chainIdsToNames, chainProperties } from "../../../utils/chains";
import { gasEstimateMintLimit } from "../../../utils/gas";
import { useRangeLimitStore } from "../../../hooks/useRangeLimitStore";
import { useConfigStore } from "../../../hooks/useConfigStore";
import { parseUnits } from "../../../utils/math/valueMath";
import { getLogoURI } from "../../../utils/tokens";
import { getRouterAddress } from "../../../utils/config";

export default function LimitAddLiquidity({ isOpen, setIsOpen, address }) {
  const [chainId, logoMap, networkName] = useConfigStore((state) => [
    state.chainId,
    state.logoMap,
    state.networkName,
  ]);

  const [
    limitPoolAddress,
    limitPositionData,
    tokenIn,
    setTokenInBalance,
    tokenOut,
    needsAllowance,
    setNeedsAllowance,
    needsBalance,
    setNeedsBalance,
  ] = useRangeLimitStore((state) => [
    state.limitPoolAddress,
    state.limitPositionData,
    state.tokenIn,
    state.setTokenInBalance,
    state.tokenOut,
    state.needsAllowanceIn,
    state.setNeedsAllowanceIn,
    state.needsBalanceIn,
    state.setNeedsBalanceIn,
  ]);

  const { bnInput, inputBox, maxBalance } = useInputBox();
  const { data: signer } = useSigner();
  const { isConnected } = useAccount();

  const [allowanceIn, setAllowanceIn] = useState(BN_ZERO);
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);
  const [mintGasFee, setMintGasFee] = useState("$0.00");
  const [buttonState, setButtonState] = useState("");
  const [disabled, setDisabled] = useState(true);

  const { data: tokenInAllowance } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, getRouterAddress(networkName)],
    chainId: chainId,
    watch: needsAllowance,
    enabled: isConnected && tokenIn.address != undefined && needsAllowance,
    onSuccess(data) {
      setNeedsAllowance(false);
    },
    onError(error) {
      console.log("Error allowance", error);
    },
    onSettled(data, error) {
      // console.log("current allowance", allowanceIn)
      // console.log("Allowance Settled", {
      //   data,
      //   error,
      //   limitPoolAddress,
      //   tokenIn,
      // });
    },
  });

  ////////////////////////////////Token Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.address,
    enabled: tokenIn.address != undefined && needsBalance,
    watch: needsBalance,
    onSuccess(data) {
      setNeedsBalance(false);
    },
  });

  useEffect(() => {
    if (isConnected) {
      setTokenInBalance(tokenInBal?.formatted.toString());
    }
  }, [tokenInBal]);

  ////////////////////////////////

  // disabled messages
  useEffect(() => {
    if (
      Number(ethers.utils.formatUnits(bnInput)) > Number(tokenIn.userBalance)
    ) {
      setButtonState("balance");
    }
    if (Number(ethers.utils.formatUnits(bnInput)) === 0) {
      setButtonState("amount");
    }
    if (
      Number(ethers.utils.formatUnits(bnInput)) === 0 ||
      Number(ethers.utils.formatUnits(bnInput)) > Number(tokenIn.userBalance)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [bnInput, tokenIn.userBalance, disabled]);

  useEffect(() => {
    if (tokenInAllowance) setAllowanceIn(tokenInAllowance);
  }, [tokenInAllowance]);

  useEffect(() => {
    updateMintFee();
  }, [bnInput]);

  async function updateMintFee() {
    if (bnInput.gt(BN_ZERO) && signer && !limitPositionData.addLiqDisabled) {
      await gasEstimateMintLimit(
        limitPoolAddress,
        address,
        BigNumber.from(limitPositionData.min),
        BigNumber.from(limitPositionData.max),
        tokenIn,
        tokenOut,
        bnInput,
        signer,
        setMintGasFee,
        setMintGasLimit,
        networkName
      );
    }
  }

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
                <div className="flex items-center justify-between px-2">
                  <h1 className="text-lg">Add Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2 mb-5 mt-2">
                  <div className="flex items-end justify-between text-[11px] text-grey1">
                    <span>
                      ~$
                      {!isNaN(tokenIn.USDPrice) &&
                      !isNaN(
                        parseFloat(
                          ethers.utils.formatUnits(bnInput, tokenIn.decimals)
                        )
                      )
                        ? Number(
                            tokenIn.USDPrice *
                              parseFloat(
                                ethers.utils.formatUnits(
                                  bnInput,
                                  tokenIn.decimals
                                )
                              )
                          ).toFixed(2)
                        : "0.00"}
                    </span>
                    <span>
                      BALANCE:{" "}
                      {isNaN(tokenIn.userBalance)
                        ? "0.00"
                        : Number(tokenIn.userBalance).toPrecision(5)}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-2 mb-3">
                    {inputBox("0", tokenIn)}
                    <div className="flex items-center gap-x-2">
                      {isConnected ? (
                        <button
                          onClick={() => {
                            maxBalance(
                              tokenIn.userBalance.toString(),
                              "0",
                              tokenIn.decimals
                            );
                          }}
                          className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
                        >
                          MAX
                        </button>
                      ) : null}
                      <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                        <img height="28" width="25" src={logoMap[logoMapKey(tokenIn)]} />
                        {tokenIn.symbol}
                      </div>
                    </div>
                  </div>
                </div>
                {isConnected ? (
                  allowanceIn.lt(bnInput) ? (
                    <SwapRouterApproveButton
                      routerAddress={
                        getRouterAddress(networkName)
                      }
                      approveToken={tokenIn.address}
                      amount={bnInput}
                      tokenSymbol={tokenIn.symbol}
                    />
                  ) : (
                    <LimitAddLiqButton
                      disabled={disabled || mintGasLimit.lte(BN_ZERO)}
                      to={address}
                      poolAddress={limitPoolAddress}
                      routerAddress={
                        getRouterAddress(networkName)
                      }
                      lower={Number(limitPositionData.min)}
                      upper={Number(limitPositionData.max)}
                      positionId={BigNumber.from(limitPositionData.positionId)}
                      mintPercent={parseUnits("1", 24)}
                      zeroForOne={tokenIn.callId == 0}
                      amount={bnInput}
                      gasLimit={mintGasLimit}
                      buttonState={buttonState}
                      tokenSymbol={tokenIn.symbol}
                      setIsOpen={setIsOpen}
                    />
                  )
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
