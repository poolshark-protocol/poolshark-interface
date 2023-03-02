import { ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { tickMathABI } from "../../abis/evm/tickMath";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { coverPoolAddress, tickMathAddress } from "../../constants/contractAddresses";

export default function CoverMintButton(props) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);
  const [ minInput, setMinInput ] = useState(0);
  const [ maxInput, setMaxInput ] = useState(0);
  const [ disabled, setDisabled ] = useState(false);
  const [ amount, setAmount ] = useState(0);



const tick = useContractRead({
  address: tickMathAddress,
  abi: tickMathABI,
  functionName: "getTickAtSqrtRatio",
  args: [
    minInput * (2 ** 96)
  ]
})

console.log(tick.data)

// const getTicks = () => {
// const bothTicks = [];
// lowHigh.map(input => {

// allTicks.push(tick)
// })
// setAllTicks(bothTicks);
// }

useEffect(() => {
setMinInput(props.MinInput)
console.log(props.MinInput)
},[props.MinInput])

useEffect(() => {
  setMaxInput(props.MaxInput)
  console.log(props.MaxInput)
  },[props.MaxInput])

  
  useEffect(() => {
    setAmount(props.amount)
    console.log(amount)
    },[props.amount])

    
    useEffect(() => {
      setDisabled(props.disabled)
      },[props.disabled])
      

    
  const { config } = usePrepareContractWrite({
    address: coverPoolAddress,
    abi: coverPoolABI,
    functionName: "mint",
    args: [
      // props?.MinInput * 2 ** 96,


      ethers.utils.parseUnits("0"),
      ethers.utils.parseUnits("20", 0),
      ethers.utils.parseUnits("887272", 0),
      ethers.utils.parseUnits("30", 0),
      ethers.utils.parseUnits("20", 0),
      props?.amount,
      false,
    ],
    chainId: 5,
    overrides: {
      gasLimit: 350000,
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
        disabled={props?.disabled}
        className={props?.disabled ? "w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50": "w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80" }
        onClick={() => props?.address ?  write?.() : null}
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
