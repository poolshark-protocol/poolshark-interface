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

  const handleUpperChange = (event, updateValue) => {
    const result = inputFilter(event.target.value)
    //TODO: do not allow for exceeding max decimals
    setDisplayUpper(result == '' ? '' : result)
    if (result == '') {
      setBnInputUpper(BigNumber.from('0'))
    }
    if (updateValue !== undefined) {
      updateValue(result == '' ? 0 : result)
      setInputUpper(
        result == ''
          ? BigNumber.from('0')
          : ethers.utils.parseUnits(result, 18),
      )
      if (result !== '') {
        const valueToBn = ethers.utils.parseUnits(result, 18)
        setBnInputUpper(valueToBn)
      }
    }
    setInputUpper(
      result == '' ? BigNumber.from('0') : ethers.utils.parseUnits(result, 18),
    )
    if (result !== '') {
      const valueToBn = ethers.utils.parseUnits(result, 18)
      setBnInputUpper(valueToBn)
    }
  }

  const handleLowerChange = (event, updateValue) => {
    const result = event.target.value.replace(/[^\d.]/g, '')
    //TODO: do not allow for exceeding max decimals
    setDisplayLower(result == '' ? '' : result)
    if (updateValue !== undefined) {
      updateValue(result == '' ? 0 : result)
      setInputLower(
        result == ''
          ? BigNumber.from('0')
          : ethers.utils.parseUnits(result, 18),
      )
      if (result !== '') {
        const valueToBn = ethers.utils.parseUnits(result, 18)
        setBnInputLower(valueToBn)
      }
    }

    setInputLower(
      result == '' ? BigNumber.from('0') : ethers.utils.parseUnits(result, 18),
    )
    if (result !== '') {
      const valueToBn = ethers.utils.parseUnits(result, 18)
      setBnInputLower(valueToBn)
    }
  }

  //TODO: add an optional param for changing value
  const upperInputBox = (placeholder: string, updateValue?: any) => {
    return (
      <div className="">
        <input
          autoComplete="off"
          type="text"
          id="input"
          onChange={(e) => handleUpperChange(e, updateValue)}
          value={displayUpper}
          placeholder={placeholder}
          className="bg-[#0C0C0C] placeholder:text-grey1 w-full text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
        />
      </div>
    );
  }

  const lowerInputBox = (placeholder: string, updateValue?: any) => {
    return (
      <div className="flex gap-x-2">
        <input
          autoComplete="off"
          type="text"
          id="LimitInput"
          onChange={(e) => handleLowerChange(e, updateValue)}
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
    lowerInputBox 
}
}