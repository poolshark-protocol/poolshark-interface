import { useState } from 'react';
import { BigNumber, ethers } from "ethers";

export default function useInputBox() {
    const [display, setDisplay] = useState("");
    const [input, setInput] = useState("");
    const [bnInput, setBnInput] = useState(BigNumber.from("0"));
    
    const handleChange = event => {
        const result = event.target.value.replace(/[^0-9\.|\,]/g, '')
        //TODO: do not allow for exceeding max decimals
        setDisplay(result == "" ? "" : result)
        setInput(result == "" ? "" : ethers.utils.parseUnits(result, 18))
        if (result !== "") {
            const valueToBn = ethers.utils.parseUnits(result, 18);
            setBnInput(valueToBn);
          }
    };

    const inputBox = (placeholder) => {
        return (
            <div className="flex gap-x-2">
            <input
                type="number"
                id="input"
                onChange={handleChange}
                value={display}
                placeholder={placeholder}
                className="bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
            />
            </div>
        )
    }
    
    return [bnInput, inputBox]
}