import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import {
  useAccount,
  erc20ABI,
  useSigner,
  useBalance,
} from "wagmi";
import useInputBox from "../../../hooks/useInputBox";
import LimitAddLiqButton from "../../Buttons/LimitAddLiqButton";
import { BigNumber, ethers } from "ethers";
import { useContractRead } from "wagmi";
import { BN_ZERO } from "../../../utils/math/constants";
import SwapRouterApproveButton from "../../Buttons/SwapRouterApproveButton";
import { chainIdsToNamesForGitTokenList, chainProperties } from "../../../utils/chains";
import { gasEstimateMintLimit } from "../../../utils/gas";
import { useRangeLimitStore } from "../../../hooks/useRangeLimitStore";
import { useConfigStore } from "../../../hooks/useConfigStore";
import { parseUnits } from "../../../utils/math/valueMath";

export default function LimitAddLiquidity({ isOpen, setIsOpen, address }) {
  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
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

  const [allowanceIn, setAllowanceIn] = useState(BN_ZERO);
  const { isConnected } = useAccount();
  const [stateChainName, setStateChainName] = useState();

  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);
  const [mintGasFee, setMintGasFee] = useState("$0.00");
  
  const [fetchDelay, setFetchDelay] = useState(false);
  const [buttonState, setButtonState] = useState("");
  const [disabled, setDisabled] = useState(true);

  const { data: tokenInAllowance } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties[networkName]["routerAddress"]],
    chainId: chainId,
    watch: needsAllowance,
    enabled:
      isConnected &&
      tokenIn.address != undefined && needsAllowance,
    onSuccess(data) {
      console.log("Success");
      setNeedsAllowance(false);
      console.log("Allowance", data);
    },
    onError(error) {
      console.log("Error allowance", error);
    },
    onSettled(data, error) {
      console.log("current allowance", allowanceIn)
      console.log("Allowance Settled", {
        data,
        error,
        limitPoolAddress,
        tokenIn,
      });
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
    }
  });

  useEffect(() => {
    if (isConnected) {
      setTokenInBalance(
        parseFloat(tokenInBal?.formatted.toString()).toFixed(2)
      );
    }
  }, [tokenInBal]);

  ////////////////////////////////

  // disabled messages
  useEffect(() => {
    if (Number(ethers.utils.formatUnits(bnInput)) > Number(tokenIn.userBalance)) {
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
    setStateChainName(chainIdsToNamesForGitTokenList[chainId]);
  }, [chainId]);

  useEffect(() => {
    if (tokenInAllowance) setAllowanceIn(tokenInAllowance);
  }, [tokenInAllowance]);

  useEffect(() => {
    updateMintFee();
  }, [bnInput]);

  async function updateMintFee() {
    if (bnInput.gt(BN_ZERO) && signer) {
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
                <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl mt-6 mb-6">
                  <div className=" p-2 w-32">
                    <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-1 rounded-xl">
                      {inputBox("0", tokenIn)}
                    </div>
                    <div className="flex">
                      <div className="flex text-xs text-[#4C4C4C]">
                        $
                        {!isNaN(tokenIn.USDPrice) && !isNaN(parseFloat(ethers.utils.formatUnits(bnInput, tokenIn.decimals))) ?
                          Number(
                            tokenIn.USDPrice *
                              parseFloat(ethers.utils.formatUnits(bnInput, tokenIn.decimals))
                          ).toFixed(2)
                        : "0.00"}
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <div className=" ml-auto">
                      <div>
                        <div className="flex justify-end">
                          <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl ">
                            <div className="flex items-center gap-x-2 w-full">
                              <img className="w-7" src={tokenIn.logoURI} />
                              {tokenIn.symbol}
                            </div>
                          </button>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-1 mt-2">
                          <div
                            className="flex whitespace-nowrap md:text-xs text-[10px] text-[#4C4C4C]"
                            key={tokenIn.userBalance}
                          >
                            Balance:{" "}
                            {isNaN(tokenIn.userBalance)
                              ? "0.00"
                              : Number(tokenIn.userBalance).toPrecision(5)}
                          </div>
                          <button
                            className="flex md:text-xs text-[10px] uppercase text-[#C9C9C9]"
                            onClick={() => {
                              maxBalance(tokenIn.userBalance.toString(), "0", tokenIn);
                            }}
                          >
                            Max
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {isConnected && stateChainName === networkName ? (
                  allowanceIn.lt(bnInput) ? (
                    <SwapRouterApproveButton
                      routerAddress={chainProperties[networkName]["routerAddress"]}
                      approveToken={tokenIn.address}
                      amount={bnInput}
                      tokenSymbol={tokenIn.symbol}
                    />
                  ) : (
                    <LimitAddLiqButton
                      disabled={disabled || mintGasFee == "$0.00"}
                      to={address}
                      poolAddress={limitPoolAddress}
                      routerAddress={chainProperties[networkName]["routerAddress"]}
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
                )) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
