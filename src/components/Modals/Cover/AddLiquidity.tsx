import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import useInputBox from "../../../hooks/useInputBox";
import CoverAddLiqButton from "../../Buttons/CoverAddLiqButton";
import { ethers } from "ethers";
import { BN_ZERO } from "../../../utils/math/constants";
import CoverMintApproveButton from "../../Buttons/CoverMintApproveButton";
import { chainIdsToNames } from "../../../utils/chains";
import { gasEstimateCoverMint } from "../../../utils/gas";
import { useCoverStore } from "../../../hooks/useCoverStore";
import { useConfigStore } from "../../../hooks/useConfigStore";
import { getLogo } from "../../../utils/tokens";
import { getRouterAddress } from "../../../utils/config";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";
import useAllowance from "../../../hooks/contracts/useAllowance";
import useTokenBalance from "../../../hooks/useTokenBalance";
import { useShallow } from "zustand/react/shallow";
import useAccount from "../../../hooks/useAccount";
import useSigner from "../../../hooks/useSigner";

export default function CoverAddLiquidity({ isOpen, setIsOpen, address }) {
  const [chainId, logoMap, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.logoMap, state.networkName]),
  );

  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    coverMintParams,
    tokenIn,
    setTokenInBalance,
    setTokenInAllowance,
    tokenOut,
    setMintButtonState,
  ] = useCoverStore(
    useShallow((state) => [
      state.coverPoolAddress,
      state.coverPoolData,
      state.coverPositionData,
      state.coverMintParams,
      state.tokenIn,
      state.setTokenInBalance,
      state.setTokenInCoverAllowance,
      state.tokenOut,
      state.setMintButtonState,
    ]),
  );

  const { bnInput, inputBox, maxBalance } = useInputBox();
  const { signer } = useSigner();
  const { isConnected } = useAccount();
  const [stateChainName, setStateChainName] = useState();
  const [buttonState, setButtonState] = useState("");
  const [disabled, setDisabled] = useState(true);

  ////////////////////////////////Allowances

  const { allowance: allowanceInCoverInt } = useAllowance({ token: tokenIn });

  const allowanceInCover = useMemo(
    () => deepConvertBigIntAndBigNumber(allowanceInCoverInt),
    [allowanceInCoverInt],
  );

  useEffect(() => {
    if (isConnected && allowanceInCover)
      setTokenInAllowance(allowanceInCover.toString());
  }, [allowanceInCover]);

  ////////////////////////////////Token Balances

  const { data: tokenInBal } = useTokenBalance({ token: tokenIn });

  useEffect(() => {
    if (isConnected && tokenInBal) {
      setTokenInBalance(
        parseFloat(tokenInBal?.formatted?.toString()).toFixed(2),
      );
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
    setStateChainName(chainIdsToNames[chainId]);
  }, [chainId]);

  ////////////////////////////////Gas Fees Estimation
  const [mintGasFee, setMintGasFee] = useState("$0.00");
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (
      coverPositionData.lowerTick &&
      coverPositionData.upperTick &&
      coverPoolData.volatilityTier &&
      allowanceInCover &&
      bnInput
    )
      updateGasFee();
  }, [bnInput, coverPoolAddress, allowanceInCover, coverPositionData]);

  async function updateGasFee() {
    const newMintGasFee = await gasEstimateCoverMint(
      coverPoolAddress,
      address,
      coverPositionData.upperTick,
      coverPositionData.lowerTick,
      tokenIn,
      tokenOut,
      bnInput,
      signer,
      networkName,
      coverPositionData.positionId,
    );
    setMintGasFee(newMintGasFee.formattedPrice);
    setMintGasLimit(newMintGasFee.gasUnits.mul(120).div(100));
  }

  ////////////////////////////////Mint Button Handler

  useEffect(() => {
    setMintButtonState();
  }, [coverMintParams.tokenInAmount]);

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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[4px] bg-black text-white border border-grey text-left align-middle shadow-xl px-7 py-5 transition-all">
                <div className="flex items-center justify-between mb-5">
                  <h1 className="text-lg">Add Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2 mb-5">
                  <div className="flex items-end justify-between text-[11px] text-grey1">
                    <span>
                      ~$
                      {Number(
                        tokenIn.coverUSDPrice *
                          parseFloat(
                            ethers.utils.formatUnits(bnInput, tokenIn.decimals),
                          ),
                      ).toFixed(2)}
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
                      {isConnected && stateChainName === networkName ? (
                        <button
                          onClick={() => {
                            maxBalance(
                              tokenIn.userBalance.toString(),
                              "0",
                              tokenIn.decimals,
                            );
                          }}
                          className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
                        >
                          MAX
                        </button>
                      ) : null}
                      <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                        <img
                          height="28"
                          width="25"
                          src={getLogo(logoMap, tokenIn)}
                        />
                        {tokenIn.symbol}
                      </div>
                    </div>
                  </div>
                </div>
                {isConnected &&
                allowanceInCover?.lt(bnInput) &&
                stateChainName === networkName ? (
                  <CoverMintApproveButton
                    routerAddress={getRouterAddress(networkName)}
                    approveToken={tokenIn.address}
                    amount={bnInput}
                    tokenSymbol={tokenIn.symbol}
                  />
                ) : stateChainName === networkName ? (
                  <CoverAddLiqButton
                    disabled={disabled}
                    toAddress={address}
                    poolAddress={coverPoolAddress}
                    routerAddress={getRouterAddress(networkName)}
                    lower={Number(coverPositionData.min)}
                    upper={Number(coverPositionData.max)}
                    positionId={Number(coverPositionData.positionId)}
                    zeroForOne={Boolean(coverPositionData.zeroForOne)}
                    amount={bnInput}
                    gasLimit={mintGasLimit}
                    //todo put this to store
                    buttonState={buttonState}
                    tokenSymbol={tokenIn.symbol}
                    setIsOpen={setIsOpen}
                  />
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
