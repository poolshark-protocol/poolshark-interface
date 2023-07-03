import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from 'react'
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useSwitchNetwork, useAccount, erc20ABI, useProvider, useSigner  } from "wagmi";
import useInputBox from '../../../hooks/useInputBox'
import CoverAddLiqButton from '../../Buttons/CoverAddLiqButton'
import { ethers, Contract } from "ethers";
import { useContractRead } from "wagmi";
import { BN_ZERO } from "../../../utils/math/constants";
import CoverMintApproveButton from "../../Buttons/CoverMintApproveButton";
import { chainIdsToNamesForGitTokenList } from "../../../utils/chains";
import { gasEstimateCoverMint } from "../../../utils/gas";
import JSBI from "jsbi";

export default function CoverAddLiquidity({ isOpen, setIsOpen, tokenIn, tokenOut, poolAdd, address, claimTick, upperTick, zeroForOne, liquidity, lowerTick, tickSpacing }) {

  const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()

  const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('0.00')
  const [balanceIn, setBalanceIn] = useState('')
  const [allowanceIn, setAllowanceIn] = useState(BN_ZERO)
  const { isDisconnected, isConnected } = useAccount()
  const [stateChainName, setStateChainName] = useState()
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO)
  const [mintGasFee, setMintGasFee] = useState('$0.00')
  const [fetchDelay, setFetchDelay] = useState(false)
  const [buttonState, setButtonState] = useState('')
  const [disabled, setDisabled] = useState(true)
  const {
    network: { chainId },
  } = useProvider()
  const { data: signer } = useSigner()

  const { data: tokenInAllowance } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, poolAdd],
    chainId: 421613,
    watch: true,
    enabled:
      isConnected &&
      poolAdd != undefined &&
      tokenIn.address != undefined,
    onSuccess(data) {
      console.log('Success')
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      console.log('allowance check', allowanceIn.lt(bnInput))
      console.log('Allowance Settled', {
        data,
        error,
        poolAdd,
        tokenIn,
      })
    },
  })

   // disabled messages
   useEffect(() => {
        
    if (Number(ethers.utils.formatUnits(bnInput)) > Number(balanceIn)) {
      setButtonState('balance')
    }
    if (Number(ethers.utils.formatUnits(bnInput)) === 0) {
      setButtonState('amount')
    }
    if (Number(ethers.utils.formatUnits(bnInput)) === 0 ||
        Number(ethers.utils.formatUnits(bnInput)) > Number(balanceIn)
    ) {
      setDisabled(true)
    } else { setDisabled(false)}
  }, [bnInput, balanceIn, disabled])

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId])
  }, [chainId])

  useEffect(() => {
    if(!fetchDelay) {
      getBalances()
    } else {
      const interval = setInterval(() => {
        getBalances()
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [fetchDelay])

  useEffect(() => {
    setTimeout(() => {
      if (tokenInAllowance) setAllowanceIn(tokenInAllowance)
    }, 50)
  }, [tokenInAllowance])

  useEffect(() => {
    updateMintFee()
  }, [bnInput])

  async function updateMintFee() {
    const newMintFee = await gasEstimateCoverMint(
      poolAdd,
      address,
      upperTick,
      lowerTick,
      tokenIn,
      tokenOut,
      JSBI.BigInt(bnInput.toString()),
      tickSpacing,
      signer,
    )
    
    setMintGasFee(newMintFee.formattedPrice)
    setMintGasLimit(newMintFee.gasUnits.mul(130).div(100))
  }

  const getBalances = async () => {
    setFetchDelay(true)
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
        421613,
      )
      const signer = new ethers.VoidSigner(address, provider)
      const tokenInContract = new ethers.Contract(tokenIn.address, erc20ABI, signer)
      const tokenInBal = await tokenInContract.balanceOf(address)
      setBalanceIn(ethers.utils.formatUnits(tokenInBal, 18))
    } catch (error) {
      console.log(error)
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="flex items-center justify-between px-2">
                  <h1 className="text-lg">Add Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl mt-6 mb-6">
                  <div className=" p-2 ">{inputBox("0")}</div>
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
                  <div className="flex text-xs text-[#4C4C4C]" key={balanceIn}>
                    Balance: {balanceIn === "NaN" ? '0.00' : Number(balanceIn).toPrecision(5)}
                  </div>
                    <button
                      className="flex text-xs uppercase text-[#C9C9C9]"
                      onClick={() => {
                        console.log("max", balanceIn);
                        maxBalance(balanceIn, "0");
                      }}
                    >
                      Max
                    </button>
                </div>
                      </div>
                    </div>
                  </div>
                </div>
                {isConnected &&
                  allowanceIn.lt(bnInput) &&
                  stateChainName === "arbitrumGoerli" ? (
                    <CoverMintApproveButton
                      disabled={disabled}
                      poolAddress={poolAdd}
                      approveToken={tokenIn.address}
                      amount={bnInput}
                      tokenSymbol={tokenIn.symbol}
                      allowance={allowanceIn}
                      buttonState={buttonState}
                    />
                  ) : stateChainName === "arbitrumGoerli" ? (
                    <CoverAddLiqButton
                      disabled={disabled || mintGasFee == '$0.00'}
                      toAddress={address}
                      poolAddress={poolAdd}
                      address={address}
                      lower={lowerTick}
                      claim={claimTick}
                      upper={upperTick}
                      zeroForOne={zeroForOne}
                      amount={bnInput}
                      gasLimit={mintGasLimit}
                      buttonState={buttonState}
                      tokenSymbol={tokenIn.Symbol}
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
