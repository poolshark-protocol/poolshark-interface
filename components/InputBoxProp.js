import { useState } from 'react';
import { ethers } from "ethers";

export default function InputBoxProp() {

    const [input, setInput] = useState();
    
    const handleChange = event => {
        //const valueToBn = ethers.utils.parseUnits(event.target.value, 0);
        //const result = event.target.value.replace(/\D/g, '');
        const result = event.target.value.replace(/[^0-9\.|\,]/g, '')
        setInput(result);
        console.log('value is:', result);
    };

    const inputBox = () => {
        return (
            <div className="flex gap-x-2">
            <input
                className="bg-gray-800 text-white rounded-xl py-2 px-4 w-96"
                type="text"
                value={input}
                onChange={handleChange}
            />
            </div>
        )
    }

    const switchToBn = () => {
        if (input !== null) {
            const valueToBn = ethers.utils.parseUnits(input, 0);
            console.log('valueToBn is:', valueToBn);
            return valueToBn;
        }
    }
    
    return (
        <div className="flex gap-x-2">
        <input
            className="bg-gray-800 text-white rounded-xl py-2 px-4 w-96"
            type="text"
            value={input}
            onChange={handleChange}
        />
        </div>
    )
}

