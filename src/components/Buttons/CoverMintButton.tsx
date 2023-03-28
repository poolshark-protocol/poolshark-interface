import { ethers, BigNumber } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { getPreviousTicksLower, getPreviousTicksUpper } from "../../utils/queries";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { coverPoolAddress } from "../../constants/contractAddresses";
import { useStore } from "../../hooks/useStore";

export default function CoverMintButton({disabled}) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);
  const [ isDisabled, setDisabled ] = useState(disabled);


// const getTicks = async () => {
//    if ((minInput !== undefined && minInput !== "" ) && (maxInput !== undefined && maxInput !== "")){ 
//   let provider = new ethers.providers.JsonRpcProvider(`https://rpc.ankr.com/eth_goerli`)
//   const contract = new ethers.Contract(tickMathAddress,tickMathABI,provider)
//   const min = await contract.getTickAtSqrtRatio(ethers.utils.parseUnits(minInput.toString()).mul(BigNumber.from('2').pow(96)).div(ethers.utils.parseUnits('1')).toString())
//   const max = await contract.getTickAtSqrtRatio(ethers.utils.parseUnits(maxInput.toString()).mul(BigNumber.from('2').pow(96)).div(ethers.utils.parseUnits('1')).toString())
//   console.log(min,max)
//   setTicks([min, max])
//    }
// }


// async function previousTicks() {
//   if (props.token0 !== undefined && props.token1 !== undefined) {
//     if ((minInput !== undefined && minInput !== "" ) && (maxInput !== undefined && maxInput !== "")){ 
//       let provider = new ethers.providers.JsonRpcProvider(`https://rpc.ankr.com/eth_goerli`)
//       const contract = new ethers.Contract(tickMathAddress,tickMathABI,provider)
     
//       const min = await contract.getTickAtSqrtRatio(ethers.utils.parseUnits(minInput.toString()).mul(BigNumber.from('2').pow(96)).div(ethers.utils.parseUnits('1')).toString())
//       const max = await contract.getTickAtSqrtRatio(ethers.utils.parseUnits(maxInput.toString()).mul(BigNumber.from('2').pow(96)).div(ethers.utils.parseUnits('1')).toString())
     
//       const data = await getPreviousTicksLower(props.token0["address"],props.token1["address"], Number(min))
//       const data1 = await getPreviousTicksUpper(props.token0["address"],props.token1["address"],   Number(max))
//        setPrevTicks({lower: data["data"].ticks[0]["index"], upper: data1["data"].ticks[0]["index"]})
//        setTicks({min:min, max:max})

//       console.log(String(prevTicks["lower"]))
//       console.log(String(ticks["min"]))
//       console.log(String(prevTicks["upper"]))
//       console.log(String(ticks["max"]))
//       console.log(String(ticks["min"]))
//       console.log(amount)
   
//   }
  
//   }
// }




    
    useEffect(() => {
      },[disabled])

  const [contractParams] = useStore((state) => [state.contractParams])


    
  const { config } = usePrepareContractWrite({
    address: coverPoolAddress,
    abi: coverPoolABI,
    functionName: "mint",
    args: [
      contractParams.prevLower,
      contractParams.min,
      contractParams.claim,
      contractParams.max,
      contractParams.prevUpper,
      contractParams.amount,
      false,
    ],
    chainId: 421613,
    overrides: {
      gasLimit: BigNumber.from("350000"),
    },
  });

  const { data, write } = useContractWrite(config);

  const {isLoading} = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled}
        className={disabled ? "w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-not-allowed bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50": "w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80" }
        onClick={() => coverPoolAddress ?  write?.() : null}
      >
        Create Cover
      </button>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
      {errorDisplay && (
        <ErrorToast
          hash={data?.hash}
          errorDisplay={errorDisplay}
          setErrorDisplay={setErrorDisplay}
        />
      )}
      {isLoading ? <ConfirmingToast hash={data?.hash} /> : <></>}
      {successDisplay && (
        <SuccessToast
          hash={data?.hash}
          successDisplay={successDisplay}
          setSuccessDisplay={setSuccessDisplay}
        />
      )}
      </div>
    </>
  );
}
