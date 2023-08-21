import { useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import inputFilter from '../utils/inputFilter'

export default function useDoubleInputBox() {
  const [displayUpper, setDisplayUpper] = useState('')
  const [inputUpper, setInputUpper] = useState(BigNumber.from('0'))
  const [bnInputUpper, setBnInputUpper] = useState(BigNumber.from('0'))

  const [displayLower, setDisplayLower] = useState('')
  const [inputLower, setInputLower] = useState(BigNumber.from('0'))
  const [bnInputLower, setBnInputLower] = useState(BigNumber.from('0'))

  const handleUpperChange = (event) => {
    const result = inputFilter(event.target.value)
    //TODO: do not allow for exceeding max decimals
    setDisplayUpper(result == '' ? '' : result)

    if (result == '') {
      setBnInputUpper(BigNumber.from('0'))
    }
    setInputUpper(
      result == '' ? BigNumber.from('0') : ethers.utils.parseUnits(result, 18),
    )

    if (result !== '') {
      const valueToBn = ethers.utils.parseUnits(result, 18)

      setBnInputUpper(valueToBn)
    }
  }

  const handleLowerChange = (event) => {
    const result = inputFilter(event.target.value)
    //TODO: do not allow for exceeding max decimals
    setDisplayLower(result == '' ? '' : result)

    if (result == '') {
      setBnInputLower(BigNumber.from('0'))
    }

    setInputLower(
      result == '' ? BigNumber.from('0') : ethers.utils.parseUnits(result, 18),
    )
    if (result !== '') {
      const valueToBn = ethers.utils.parseUnits(result, 18)

      setBnInputLower(valueToBn)
    }
  }

  const upperMaxBalance = (balance, placeholder) => {
    setDisplayUpper(balance)
    setInputUpper(ethers.utils.parseUnits(balance, 18))
    if (balance != '') {
      const valueToBn = ethers.utils.parseUnits(balance, 18)
      setBnInputUpper(valueToBn)
    }
    upperInputBox(placeholder)
  }

  const lowerMaxBalance = (balance, placeholder) => {
    setDisplayLower(balance)
    setInputLower(ethers.utils.parseUnits(balance, 18))
    if (balance != '') {
      const valueToBn = ethers.utils.parseUnits(balance, 18)
      setBnInputLower(valueToBn)
    }
    lowerInputBox(placeholder)
  }

  //TODO: add an optional param for changing value
  const upperInputBox = (placeholder: string) => {
    return (
      <div className="flex gap-x-2">
        <input
          autoComplete="off"
          type="text"
          id="upperInput"
          onChange={(e) => handleUpperChange(e)}
          value={displayUpper}
          placeholder={placeholder}
          className="bg-[#0C0C0C] placeholder:text-grey1 w-full text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
        />
      </div>
    );
  }

  const lowerInputBox = (placeholder: string) => {
    return (
      <div className="flex gap-x-2">
        <input
          autoComplete="off"
          type="text"
          id="lowerInput"
          onChange={(e) => handleLowerChange(e)}
          value={displayLower}
          placeholder={placeholder}
          className="bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
        />
      </div>
    );
  }

  return { 
    bnInputUpper, 
    bnInputLower, 
    displayUpper,
    displayLower,
    inputUpper,
    inputLower,
    setBnInputUpper,
    setBnInputLower,
    setDisplayUpper,
    setDisplayLower,
    setInputUpper,
    setInputLower,
    upperInputBox, 
    lowerInputBox,
    upperMaxBalance,
    lowerMaxBalance,
}
}