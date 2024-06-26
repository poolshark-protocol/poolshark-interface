import { Fragment, useEffect, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import RangeMintButton from "../Buttons/RangeMintButton";
import { BigNumber, ethers } from "ethers";
import { TickMath, invertPrice } from "../../utils/math/tickMath";
import RangeMintDoubleApproveButton from "../Buttons/RangeMintDoubleApproveButton";
import { useRouter } from "next/router";
import RangeMintApproveButton from "../Buttons/RangeMintApproveButton";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { BN_ZERO, ONE, ZERO_ADDRESS } from "../../utils/math/constants";
import {
  gasEstimateRangeCreateAndMint,
  gasEstimateRangeMint,
} from "../../utils/gas";
import RangeCreateAndMintButton from "../Buttons/RangeCreateAndMintButton";
import { limitPoolTypeIds } from "../../utils/pools";
import PositionMintModal from "../Modals/PositionMint";
import { useConfigStore } from "../../hooks/useConfigStore";
import JSBI from "jsbi";
import { hasAllowance, getLogo } from "../../utils/tokens";
import { getRouterAddress } from "../../utils/config";
import { useShallow } from "zustand/react/shallow";
import useAccount from "../../hooks/useAccount";
import useSigner from "../../hooks/useSigner";

export default function RangePoolPreview() {
  const [logoMap, networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [
      state.logoMap,
      state.networkName,
      state.limitSubgraph,
    ]),
  );

  const [
    rangePoolAddress,
    rangePoolData,
    rangePositionData,
    rangeMintParams,
    tokenIn,
    tokenOut,
    priceOrder,
  ] = useRangeLimitStore(
    useShallow((state) => [
      state.rangePoolAddress,
      state.rangePoolData,
      state.rangePositionData,
      state.rangeMintParams,
      state.tokenIn,
      state.tokenOut,
      state.priceOrder,
    ]),
  );
  // fee amount

  // for mint modal
  const [successDisplay, setSuccessDisplay] = useState(false);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState();
  const { address } = useAccount();
  const { signer } = useSigner();

  ///////////////////////////////Modal
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  ////////////////////////////////Mint Gas Fee
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (
      (rangeMintParams.tokenInAmount?.gt(BN_ZERO) || // amounts not empty
        rangeMintParams.tokenOutAmount?.gt(BN_ZERO)) &&
      Number(rangePositionData.lowerPrice) <
        Number(rangePositionData.upperPrice) && // valid price range
      hasAllowance(tokenIn, rangeMintParams.tokenInAmount) && // allowance in
      hasAllowance(tokenOut, rangeMintParams.tokenOutAmount) && // allowance out
      JSBI.greaterThan(rangeMintParams.liquidityAmount, ONE) // non-zero liquidity
    ) {
      updateGasFee();
    }
  }, [
    rangeMintParams.stakeFlag,
    rangeMintParams.liquidityAmount,
    tokenIn.userRouterAllowance,
    tokenOut.userRouterAllowance,
    rangePositionData.lowerPrice,
    rangePositionData.upperPrice,
    rangePoolData?.poolPrice,
    rangePoolData?.feeTier,
  ]);

  async function updateGasFee() {
    const newGasFee =
      rangePoolAddress != ZERO_ADDRESS
        ? await gasEstimateRangeMint(
            rangePoolAddress,
            address,
            BigNumber.from(
              TickMath.getTickAtPriceString(
                rangePositionData.lowerPrice,
                tokenIn,
                tokenOut,
                parseInt(rangePoolData.feeTier?.tickSpacing ?? 20),
              ),
            ),
            BigNumber.from(
              TickMath.getTickAtPriceString(
                rangePositionData.upperPrice,
                tokenIn,
                tokenOut,
                parseInt(rangePoolData.feeTier?.tickSpacing ?? 20),
              ),
            ),
            tokenIn,
            tokenOut,
            rangeMintParams.tokenInAmount,
            rangeMintParams.tokenOutAmount,
            signer,
            rangeMintParams.stakeFlag,
            networkName,
            limitSubgraph,
          )
        : await gasEstimateRangeCreateAndMint(
            limitPoolTypeIds["constant-product-1.1"],
            rangePoolData.feeTier?.feeAmount,
            address,
            BigNumber.from(
              TickMath.getTickAtPriceString(
                rangePositionData.lowerPrice,
                tokenIn,
                tokenOut,
                parseInt(rangePoolData.feeTier?.tickSpacing ?? 20),
              ),
            ),
            BigNumber.from(
              TickMath.getTickAtPriceString(
                rangePositionData.upperPrice,
                tokenIn,
                tokenOut,
                parseInt(rangePoolData.feeTier?.tickSpacing ?? 20),
              ),
            ),
            // pool price set using start price input box
            BigNumber.from(String(rangePoolData?.poolPrice ?? "0")),
            tokenIn,
            tokenOut,
            rangeMintParams.tokenInAmount,
            rangeMintParams.tokenOutAmount,
            signer,
            rangeMintParams.stakeFlag,
            networkName,
            limitSubgraph,
          );
    setMintGasLimit(newGasFee.gasUnits.mul(130).div(100));
  }

  return (
    <div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                <Dialog.Panel className="max-w-[55rem] w-full text-white text-left overflow-hidden rounded-[4px] shadow-xl transition-all">
                  <div className="bg-black flex md:flex-row flex-col gap-x-20 justify-between border border-grey w-full rounded-[4px] py-6 px-7">
                    <div className="md:w-1/2">
                      <div>
                        <div className="flex items-center gap-x-4">
                          <h1>Pair</h1>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-x-5 gap-y-3 mt-3 w-full">
                          <button className="flex w-full items-center gap-x-3 bg-dark border border-grey px-4 py-1.5 rounded-[4px]">
                            <img
                              className="w-7"
                              src={getLogo(tokenIn, logoMap)}
                            />
                            {tokenIn.symbol}
                          </button>
                          <button className="flex w-full items-center gap-x-3 bg-dark border border-grey px-4 py-1.5 rounded-[4px]">
                            <img
                              className="w-7 w-full"
                              src={getLogo(tokenOut, logoMap)}
                            />
                            {tokenOut.symbol}
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="gap-x-4 mt-8">
                          <h1>Fee tier</h1>
                        </div>
                        <div className="mt-3">
                          <button className="relative cursor-default rounded-[4px] bg-black text-white cursor-pointer bg-dark border border-grey py-2 pl-3 w-full text-left shadow-md focus:outline-none">
                            <span className="block truncate">
                              {(
                                rangePoolData?.feeTier?.feeAmount / 10000
                              ).toFixed(2)}
                              %
                            </span>
                            <span className="block truncate text-xs text-grey">
                              {/* {fee.text} */}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="gap-x-4 mt-8">
                          <h1>Deposited amounts</h1>
                        </div>
                        <div className="mt-3 space-y-3">
                          <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-[4px]">
                            <div className=" p-2 ">
                              <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-[4px]">
                                {parseFloat(
                                  ethers.utils.formatUnits(
                                    rangeMintParams.tokenInAmount,
                                    tokenIn.decimals,
                                  ),
                                ).toPrecision(6)}
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                  $
                                  {!isNaN(tokenIn.USDPrice)
                                    ? (
                                        tokenIn.USDPrice *
                                        Number(
                                          ethers.utils.formatUnits(
                                            rangeMintParams.tokenInAmount,
                                            tokenIn.decimals,
                                          ),
                                        )
                                      ).toFixed(2)
                                    : "?.??"}
                                </div>
                              </div>
                            </div>
                            <div className="">
                              <div className=" ml-auto">
                                <div>
                                  <div className="flex justify-end">
                                    <button className="flex items-center gap-x-3 bg-black border border-grey px-3 py-1.5 rounded-[4px]">
                                      <div className="flex items-center gap-x-2 w-full">
                                        <img
                                          className="w-7"
                                          src={getLogo(tokenIn, logoMap)}
                                        />
                                        {tokenIn.symbol}
                                      </div>
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-end gap-x-2 px-1 mt-2 ">
                                    <div className="text-xs text-dark">-</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-[4px]">
                            <div className=" p-2 ">
                              <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-[4px]">
                                {parseFloat(
                                  ethers.utils.formatUnits(
                                    rangeMintParams.tokenOutAmount,
                                    tokenOut.decimals,
                                  ),
                                ).toPrecision(6)}
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                  $
                                  {!isNaN(tokenOut.USDPrice)
                                    ? (
                                        Number(tokenOut.USDPrice) *
                                        Number(
                                          ethers.utils.formatUnits(
                                            rangeMintParams.tokenOutAmount,
                                            tokenOut.decimals,
                                          ),
                                        )
                                      ).toFixed(2)
                                    : "?.??"}
                                </div>
                              </div>
                            </div>
                            <div className="">
                              <div className=" ml-auto">
                                <div>
                                  <div className="flex justify-end">
                                    <button className="flex items-center gap-x-3 bg-black border border-grey px-3 py-1.5 rounded-[4px]">
                                      <div className="flex items-center gap-x-2 w-full">
                                        <img
                                          className="w-7"
                                          src={getLogo(tokenOut, logoMap)}
                                        />
                                        {tokenOut.symbol}
                                      </div>
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-end gap-x-2 px-1 mt-2">
                                    <div className="text-xs text-dark">-</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-1/2">
                      <div>
                        <div className="flex justify-between items-center">
                          <h1>Price range</h1>
                        </div>
                        <div className="mt-3 space-y-3">
                          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-[4px]">
                            <span className="md:text-xs text-[10px] text-grey">
                              Min. Price
                            </span>
                            <div className="flex justify-center items-center">
                              <span className="text-lg py-2 outline-none text-center">
                                {invertPrice(
                                  priceOrder
                                    ? rangePositionData.lowerPrice
                                    : rangePositionData.upperPrice,
                                  priceOrder,
                                )}
                              </span>
                            </div>
                            <span className="md:text-xs text-[10px] text-grey">
                              {(priceOrder ? tokenOut : tokenIn).symbol} per{" "}
                              {(priceOrder ? tokenIn : tokenOut).symbol}
                            </span>
                          </div>
                          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-[4px]">
                            <span className="md:text-xs text-[10px] text-grey">
                              Max. Price
                            </span>
                            <div className="flex justify-center items-center">
                              <span className="text-lg py-2 outline-none text-center">
                                {invertPrice(
                                  priceOrder
                                    ? rangePositionData.upperPrice
                                    : rangePositionData.lowerPrice,
                                  priceOrder,
                                )}
                              </span>
                            </div>
                            <span className="md:text-xs text-[10px] text-grey">
                              {(priceOrder ? tokenOut : tokenIn).symbol} per{" "}
                              {(priceOrder ? tokenIn : tokenOut).symbol}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        {!hasAllowance(
                          tokenIn,
                          rangeMintParams.tokenInAmount,
                        ) &&
                        !hasAllowance(
                          tokenOut,
                          rangeMintParams.tokenOutAmount,
                        ) ? (
                          <RangeMintDoubleApproveButton
                            routerAddress={getRouterAddress(networkName)}
                            tokenIn={tokenIn}
                            tokenOut={tokenOut}
                            amount0={rangeMintParams.tokenInAmount}
                            amount1={rangeMintParams.tokenOutAmount}
                          />
                        ) : !hasAllowance(
                            tokenIn,
                            rangeMintParams.tokenInAmount,
                          ) ? (
                          <RangeMintApproveButton
                            routerAddress={getRouterAddress(networkName)}
                            approveToken={tokenIn}
                            amount={rangeMintParams.tokenInAmount}
                          />
                        ) : !hasAllowance(
                            tokenOut,
                            rangeMintParams.tokenOutAmount,
                          ) ? (
                          <RangeMintApproveButton
                            routerAddress={getRouterAddress(networkName)}
                            approveToken={tokenOut}
                            amount={rangeMintParams.tokenOutAmount}
                          />
                        ) : rangePoolAddress != ZERO_ADDRESS ? (
                          <RangeMintButton
                            routerAddress={getRouterAddress(networkName)}
                            poolAddress={rangePoolAddress}
                            lower={
                              rangePositionData.lowerPrice
                                ? BigNumber.from(
                                    TickMath.getTickAtPriceString(
                                      rangePositionData.lowerPrice,
                                      tokenIn,
                                      tokenOut,
                                      parseInt(
                                        rangePoolData.feeTier
                                          ? rangePoolData.feeTier.tickSpacing
                                          : 30,
                                      ),
                                    ),
                                  )
                                : BN_ZERO
                            }
                            upper={
                              rangePositionData.upperPrice
                                ? BigNumber.from(
                                    TickMath.getTickAtPriceString(
                                      rangePositionData.upperPrice,
                                      tokenIn,
                                      tokenOut,
                                      parseInt(
                                        rangePoolData.feeTier
                                          ? rangePoolData.feeTier.tickSpacing
                                          : 30,
                                      ),
                                    ),
                                  )
                                : BN_ZERO
                            }
                            disabled={
                              rangeMintParams.disabled ||
                              mintGasLimit.lte(BN_ZERO)
                            }
                            buttonMessage={rangeMintParams.buttonMessage}
                            amount0={
                              tokenIn.callId === 0
                                ? rangeMintParams.tokenInAmount
                                : rangeMintParams.tokenOutAmount
                            }
                            amount1={
                              tokenIn.callId === 0
                                ? rangeMintParams.tokenOutAmount
                                : rangeMintParams.tokenInAmount
                            }
                            gasLimit={mintGasLimit}
                            setSuccessDisplay={setSuccessDisplay}
                            setErrorDisplay={setErrorDisplay}
                            setIsLoading={setIsLoading}
                            setTxHash={setTxHash}
                          />
                        ) : (
                          <RangeCreateAndMintButton
                            routerAddress={getRouterAddress(networkName)}
                            poolTypeId={
                              limitPoolTypeIds["constant-product-1.1"]
                            }
                            token0={tokenIn}
                            token1={tokenOut}
                            startPrice={BigNumber.from(
                              rangePoolData?.poolPrice ?? "0",
                            )}
                            feeTier={rangePoolData.feeTier?.feeAmount ?? 3000}
                            to={address}
                            lower={
                              rangePositionData.lowerPrice
                                ? BigNumber.from(
                                    TickMath.getTickAtPriceString(
                                      rangePositionData.lowerPrice,
                                      tokenIn,
                                      tokenOut,
                                      parseInt(
                                        rangePoolData.feeTier
                                          ? rangePoolData.feeTier.tickSpacing
                                          : 30,
                                      ),
                                    ),
                                  )
                                : BN_ZERO
                            }
                            upper={
                              rangePositionData.upperPrice
                                ? BigNumber.from(
                                    TickMath.getTickAtPriceString(
                                      rangePositionData.upperPrice,
                                      tokenIn,
                                      tokenOut,
                                      parseInt(
                                        rangePoolData.feeTier
                                          ? rangePoolData.feeTier.tickSpacing
                                          : 30,
                                      ),
                                    ),
                                  )
                                : BN_ZERO
                            }
                            disabled={
                              rangeMintParams.disabled ||
                              mintGasLimit.lte(BN_ZERO)
                            }
                            buttonMessage={rangeMintParams.buttonMessage}
                            amount0={
                              tokenIn.callId === 0
                                ? rangeMintParams.tokenInAmount
                                : rangeMintParams.tokenOutAmount
                            }
                            amount1={
                              tokenIn.callId === 0
                                ? rangeMintParams.tokenOutAmount
                                : rangeMintParams.tokenInAmount
                            }
                            closeModal={() => {}}
                            gasLimit={mintGasLimit}
                            setSuccessDisplay={setSuccessDisplay}
                            setErrorDisplay={setErrorDisplay}
                            setIsLoading={setIsLoading}
                            setTxHash={setTxHash}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <PositionMintModal
        hash={txHash}
        type={"range"}
        errorDisplay={errorDisplay}
        successDisplay={successDisplay}
        isLoading={isLoading}
      />
      <button
        onClick={() => setIsOpen(true)}
        disabled={rangeMintParams.disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
      >
        <>
          {rangeMintParams.disabled ? rangeMintParams.buttonMessage : "Preview"}
        </>
      </button>
    </div>
  );
}
