import { Fragment, useEffect, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import RangeMintButton from "../Buttons/RangeMintButton";
import { BigNumber, ethers } from "ethers";
import { erc20ABI, useAccount, useContractRead, useProvider } from "wagmi";
import { TickMath } from "../../utils/math/tickMath";
import RangeMintDoubleApproveButton from "../Buttons/RangeMintDoubleApproveButton";
import { useRouter } from "next/router";
import RangeMintApproveButton from "../Buttons/RangeMintApproveButton";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { gasEstimateRangeMint } from "../../utils/gas";
import RangeCreateAndMintButton from "../Buttons/RangeCreateAndMintButton";
import { chainIdsToNamesForGitTokenList, chainProperties } from "../../utils/chains";
import { feeTiers } from "../../utils/pools";

export default function RangePoolPreview() {
  const [
    rangePoolAddress,
    rangePoolData,
    rangePositionData,
    rangeMintParams,
    tokenIn,
    setTokenInAllowance,
    tokenOut,
    setTokenOutAllowance,
    needsAllowanceIn,
    needsAllowanceOut,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
  ] = useRangeLimitStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangePositionData,
    state.rangeMintParams,
    state.tokenIn,
    state.setTokenInRangeAllowance,
    state.tokenOut,
    state.setTokenOutRangeAllowance,
    state.needsAllowanceIn,
    state.needsAllowanceOut,
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
  ]);

  const { address } = useAccount();
  const {
    network: { chainId },
  } = useProvider();
  const router = useRouter();
  const provider = useProvider();
  const signer = new ethers.VoidSigner(address, provider);

  ////////////////////////////////Allowances
  const { data: allowanceInRange } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      address,
      chainProperties['arbitrumGoerli']['routerAddress']
    ],
    chainId: 421613,
    watch: needsAllowanceIn,
    //enabled: tokenIn.address,
    onSuccess(data) {
      //setNeedsAllowanceIn(false);
    },
    onError(error) {
      console.log("Error allowance", error);
    },
  });

  const { data: allowanceOutRange } = useContractRead({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      address,
      chainProperties['arbitrumGoerli']['routerAddress']
    ],
    chainId: 421613,
    watch: needsAllowanceOut,
    //enabled: pairSelected && rangePoolAddress != ZERO_ADDRESS,
    onSuccess(data) {
      //setNeedsAllowanceOut(false);
    },
    onError(error) {
      console.log("Error allowance", error);
    },
  });

  useEffect(() => {
    setTokenInAllowance(allowanceInRange);
    setTokenOutAllowance(allowanceOutRange);
  }, [allowanceInRange, allowanceOutRange]);

  ///////////////////////////////Modal
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  ////////////////////////////////Mint Gas Fee
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (
      rangeMintParams.tokenInAmount &&
      rangeMintParams.tokenOutAmount &&
      rangePositionData.lowerPrice &&
      rangePositionData.upperPrice &&
      Number(rangePositionData.lowerPrice) <
        Number(rangePositionData.upperPrice) && 
      allowanceInRange?.gte(rangeMintParams.tokenInAmount) && 
      allowanceOutRange?.gte(rangeMintParams.tokenOutAmount)
    ) {
      updateGasFee();
    }
  }, [rangeMintParams.tokenInAmount, tokenOut, rangePositionData]);

  async function updateGasFee() {
    const newGasFee = await gasEstimateRangeMint(
      rangePoolAddress,
      address,
      BigNumber.from(
        TickMath.getTickAtPriceString(
          rangePositionData.lowerPrice,
          parseInt(rangePoolData.feeTier?.tickSpacing ?? 20)
        )
      ),
      BigNumber.from(
        TickMath.getTickAtPriceString(
          rangePositionData.upperPrice,
          parseInt(rangePoolData.feeTier?.tickSpacing ?? 20)
        )
      ),
      rangeMintParams.tokenInAmount,
      rangeMintParams.tokenOutAmount,
      signer
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
                            <img className="w-7" src={tokenIn.logoURI} />
                            {tokenIn.symbol}
                          </button>
                          <button className="flex w-full items-center gap-x-3 bg-dark border border-grey px-4 py-1.5 rounded-[4px]">
                            <img
                              className="w-7 w-full"
                              src={tokenOut.logoURI}
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
                            <span className="block truncate">{(rangePoolData?.feeTier?.feeAmount / 10000).toFixed(2)}%</span>
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
                                    18
                                  )
                                ).toFixed(3)}
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                  $
                                  {(
                                    Number(tokenIn.rangeUSDPrice) *
                                    Number(
                                      ethers.utils.formatUnits(
                                        rangeMintParams.tokenInAmount,
                                        18
                                      )
                                    )
                                  ).toFixed(2)}
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
                                          src={tokenIn.logoURI}
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
                                    18
                                  )
                                ).toFixed(3)}
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                  $
                                  {(
                                    Number(tokenOut.rangeUSDPrice) *
                                    Number(
                                      ethers.utils.formatUnits(
                                        rangeMintParams.tokenOutAmount,
                                        18
                                      )
                                    )
                                  ).toFixed(2)}
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
                                          src={tokenOut.logoURI}
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
                                {rangePositionData.lowerPrice}
                              </span>
                            </div>
                            <span className="md:text-xs text-[10px] text-grey">
                              {tokenOut.symbol} per {tokenIn.symbol}
                            </span>
                          </div>
                          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-[4px]">
                            <span className="md:text-xs text-[10px] text-grey">
                              Max. Price
                            </span>
                            <div className="flex justify-center items-center">
                              <span className="text-lg py-2 outline-none text-center">
                                {rangePositionData.upperPrice}
                              </span>
                            </div>
                            <span className="md:text-xs text-[10px] text-grey">
                              {tokenOut.symbol} per {tokenIn.symbol}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        {tokenIn.userRouterAllowance?.lt(
                          rangeMintParams.tokenInAmount
                        ) &&
                        tokenOut.userRouterAllowance?.lt(
                          rangeMintParams.tokenOutAmount
                        ) ? (
                          <RangeMintDoubleApproveButton
                            routerAddress={
                              chainProperties['arbitrumGoerli']['routerAddress']
                            }
                            tokenIn={tokenIn}
                            tokenOut={tokenOut}
                            amount0={rangeMintParams.tokenInAmount}
                            amount1={rangeMintParams.tokenOutAmount}
                          />
                        ) : tokenIn.userRouterAllowance?.lt(
                            rangeMintParams.tokenInAmount
                          ) ? (
                          <RangeMintApproveButton
                          routerAddress={chainProperties['arbitrumGoerli']['routerAddress']}
                            approveToken={tokenIn}
                            amount={rangeMintParams.tokenInAmount}
                          />
                        ) : tokenOut.userRouterAllowance?.lt(
                            rangeMintParams.tokenOutAmount
                          ) ? (
                          <RangeMintApproveButton
                            routerAddress={chainProperties['arbitrumGoerli']['routerAddress']}
                            approveToken={tokenOut}
                            amount={rangeMintParams.tokenOutAmount}
                          />
                        ) :  ( rangePoolAddress != ZERO_ADDRESS ? 
                          <RangeMintButton
                            routerAddress={chainProperties['arbitrumGoerli']['routerAddress']}
                            to={address}
                            poolAddress={rangePoolAddress}
                            lower={
                              rangePositionData.lowerPrice
                                ? BigNumber.from(
                                    TickMath.getTickAtPriceString(
                                      rangePositionData.lowerPrice,
                                      parseInt(
                                        rangePoolData.feeTier
                                          ? rangePoolData.feeTier.tickSpacing
                                          : 20
                                      )
                                    )
                                  )
                                : BN_ZERO
                            }
                            upper={
                              rangePositionData.upperPrice
                                ? BigNumber.from(
                                    TickMath.getTickAtPriceString(
                                      rangePositionData.upperPrice,
                                      parseInt(
                                        rangePoolData.feeTier
                                          ? rangePoolData.feeTier.tickSpacing
                                          : 20
                                      )
                                    )
                                  )
                                : BN_ZERO
                            }
                            disabled={rangeMintParams.disabled}
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
                            closeModal={() => router.push("/range")}
                            gasLimit={mintGasLimit}
                          /> 
                          : 
                          <RangeCreateAndMintButton
                            routerAddress={chainProperties['arbitrumGoerli']['routerAddress']}
                            poolType={'CONSTANT-PRODUCT'}
                            token0={tokenIn}
                            token1={tokenOut}
                            startPrice={BigNumber.from('3543191142285914205922034323214')} //TODO: for lucas; need input box for this
                            feeTier={rangePoolData.feeTier.feeAmount}
                            to={address}
                            lower={
                              rangePositionData.lowerPrice
                                ? BigNumber.from(
                                    TickMath.getTickAtPriceString(
                                      rangePositionData.lowerPrice,
                                      parseInt(
                                        rangePoolData.feeTier
                                          ? rangePoolData.feeTier.tickSpacing
                                          : 20
                                      )
                                    )
                                  )
                                : BN_ZERO
                            }
                            upper={
                              rangePositionData.upperPrice
                                ? BigNumber.from(
                                    TickMath.getTickAtPriceString(
                                      rangePositionData.upperPrice,
                                      parseInt(
                                        rangePoolData.feeTier
                                          ? rangePoolData.feeTier.tickSpacing
                                          : 20
                                      )
                                    )
                                  )
                                : BN_ZERO
                            }
                            disabled={rangeMintParams.disabled}
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
                            closeModal={() => router.push("/range")}
                            gasLimit={mintGasLimit}
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
      <button
        onClick={() => setIsOpen(true)}
        //disabled={rangeMintParams.disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
      >
        <>Preview</>
      </button>
    </div>
  );
}
