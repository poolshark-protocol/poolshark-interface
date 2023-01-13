import { useState } from 'react';
import { BigNumber, ethers } from "ethers";

export default function useInputBox() {

    const [input, setInput] = useState(BigNumber.from("0"));
    const [bnInput, setBnInput] = useState(BigNumber.from("0"));
    
    const handleChange = event => {
        const result = event.target.value.replace(/[^0-9\.|\,]/g, '')
        setInput(result);
        console.log('value is:', result);
        if (result !== "") {
            const valueToBn = ethers.utils.parseUnits(result, 18);
            setBnInput(valueToBn);
          }
    };

    const inputBox = () => {
        return (
            <div className="flex gap-x-2">
            <input
                className="bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
                type="text"
                value={input}
                placeholder="0.0"
                onChange={handleChange}
            />
            </div>
        )
    }
    
    return [bnInput, inputBox]
}