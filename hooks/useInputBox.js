import { useState } from 'react';
import { BigNumber, ethers } from "ethers";

export default function useInputBox() {
    const [display, setDisplay] = useState("");
    const [input, setInput] = useState("");
    const [bnInput, setBnInput] = useState(BigNumber.from("0"));
    
    const handleChange = (event, updateValue) => {
        const result = event.target.value.replace(/[^0-9\.|\,]/g, '')
        //TODO: do not allow for exceeding max decimals
        setDisplay(result == "" ? "" : result)
        if (updateValue !== undefined) {
          updateValue(result == "" ? 0 : result)
          setInput(result == "" ? "" : ethers.utils.parseUnits(result, 18))
          if (result !== "") {
              const valueToBn = ethers.utils.parseUnits(result, 18);
              setBnInput(valueToBn);
            }
        }
        
        setInput(result == "" ? "" : ethers.utils.parseUnits(result, 18))
        if (result !== "") {
            const valueToBn = ethers.utils.parseUnits(result, 18);
            setBnInput(valueToBn);
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
    const inputBox = (placeholder, updateValue) => {
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
    
    return [bnInput, inputBox, maxBalance]
}