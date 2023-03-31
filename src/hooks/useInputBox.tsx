import { useState } from 'react';
import { BigNumber, ethers } from "ethers";
import { useSwapStore } from './useStore';

export default function useInputBox() {
    const [display, setDisplay] = useState("");
    const [displayLimit, setDisplayLimit] = useState("");
    const [input, setInput] = useState(BigNumber.from("0"));
    const [bnInput, setBnInput] = useState(BigNumber.from("0"));
    const [updateLimitAmount, updateSwapAmount] = useSwapStore((state: any) => [
        state.updateLimitAmount, state.updateSwapAmount
      ]);

    const [inputLimit, setInputLimit] = useState(BigNumber.from("0"));
    const [bnInputLimit, setBnInputLimit] = useState(BigNumber.from("0"));
    
    const handleChange = (event, updateValue) => {
        const result = event.target.value.replace(/[^0-9\.|\,]/g, '')
        //TODO: do not allow for exceeding max decimals
        setDisplay(result == "" ? "" : result)
        if (updateValue !== undefined) {
          updateValue(result == "" ? 0 : result)
          setInput(result == "" ? BigNumber.from("0") : ethers.utils.parseUnits(result, 18))
          if (result !== "") {
              const valueToBn = ethers.utils.parseUnits(result, 18);
              setBnInput(valueToBn);
              updateSwapAmount(valueToBn);
            }
        }
        
        setInput(result == "" ?  BigNumber.from("0") : ethers.utils.parseUnits(result, 18))
        if (result !== "") {
            const valueToBn = ethers.utils.parseUnits(result, 18);
            setBnInput(valueToBn);
            updateSwapAmount(valueToBn);
          }
    };


    const handleChangeLimit = (event, updateValue) => {
        const result = event.target.value.replace(/[^0-9\.|\,]/g, '')
        //TODO: do not allow for exceeding max decimals
        setDisplayLimit(result == "" ? "" : result)
        if (updateValue !== undefined) {
          updateValue(result == "" ? 0 : result)
          setInputLimit(result == "" ? BigNumber.from("0") : ethers.utils.parseUnits(result, 18))
          if (result !== "") {
              const valueToBn = ethers.utils.parseUnits(result, 18);
              setBnInputLimit(valueToBn);
              updateLimitAmount(valueToBn);
            }
        }
        
        setInputLimit(result == "" ?  BigNumber.from("0") : ethers.utils.parseUnits(result, 18))
        if (result !== "") {
            const valueToBn = ethers.utils.parseUnits(result, 18);
            setBnInputLimit(valueToBn);
            updateLimitAmount(valueToBn);
          }
    };

    const maxBalance = (balance, placeholder) => {
        setDisplay(balance)
        setInput(ethers.utils.parseUnits(balance, 18))
        if (balance != "") {
            const valueToBn = ethers.utils.parseUnits(balance, 18);
            setBnInput(valueToBn);
          }
        inputBox(placeholder)
    }
    
    //TODO: add an optional param for changing value
    const inputBox = (placeholder:string, updateValue?:any) => {
        return (
            <div className="flex gap-x-2">
            <input
                type="number"
                id="input"
                onChange={(e) => handleChange(e, updateValue)}
                value={display}
                placeholder={placeholder}
                className="bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
            />
            </div>
        )
    }

    const LimitInputBox = (placeholder:string, updateValue?:any) => {
        return (
            <div className="flex gap-x-2">
            <input
                type="number"
                id="LimitInput"
                onChange={(e) => handleChangeLimit(e, updateValue)}
                value={displayLimit}
                placeholder={placeholder}
                className="bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
            />
            </div>
        )
    }
    
    return {bnInput, bnInputLimit, LimitInputBox, inputBox, maxBalance}
}