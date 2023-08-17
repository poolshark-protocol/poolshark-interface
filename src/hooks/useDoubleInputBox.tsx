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

  const handleUpperChange = (event, inputLower, updateValue) => {
    const result = inputFilter(event.target.value)
    //TODO: do not allow for exceeding max decimals
    setDisplayUpper(result == '' ? '' : result)
    setDisplayLower(result == '' ? '' : inputLower)

    if (result == '') {
      setBnInputUpper(BigNumber.from('0'))
      setBnInputLower(BigNumber.from('0'))
    }
    if (updateValue !== undefined) {
      updateValue(result == '' ? 0 : result)

      setInputUpper(
        result == ''
          ? BigNumber.from('0')
          : ethers.utils.parseUnits(result, 18),
      )
      setInputLower(
        result == ''
        ? BigNumber.from('0')
        : ethers.utils.parseUnits(inputLower, 18),
      )
      if (result !== '') {
        const valueToBn = ethers.utils.parseUnits(result, 18)
        const valueLowerToBn = ethers.utils.parseUnits(inputLower, 18)

        setBnInputUpper(valueToBn)
        setBnInputLower(valueLowerToBn)
      }
    }
    setInputUpper(
      result == '' ? BigNumber.from('0') : ethers.utils.parseUnits(result, 18),
    )
    setInputLower(
        result == '' ? BigNumber.from('0') : ethers.utils.parseUnits(inputLower, 18),
    )

    if (result !== '') {
      const valueToBn = ethers.utils.parseUnits(result, 18)
      const valueLowerToBn = ethers.utils.parseUnits(inputLower, 18)

      setBnInputUpper(valueToBn)
      setBnInputLower(valueLowerToBn)
    }
  }

  const handleLowerChange = (event, inputUpper, updateValue) => {
    const result = inputFilter(event.target.value)
    //TODO: do not allow for exceeding max decimals
    setDisplayLower(result == '' ? '' : result)
    setDisplayUpper(result == '' ? '' : inputUpper)

    if (result == '') {
        setBnInputLower(BigNumber.from('0'))
        setBnInputUpper(BigNumber.from('0'))
    }
    if (updateValue !== undefined) {
      updateValue(result == '' ? 0 : result)

      setInputLower(
        result == ''
          ? BigNumber.from('0')
          : ethers.utils.parseUnits(result, 18),
      )
      setInputUpper(
        result == ''
        ? BigNumber.from('0')
        : ethers.utils.parseUnits(inputUpper, 18),
      )
      if (result !== '') {
        const valueToBn = ethers.utils.parseUnits(result, 18)
        const valueUpperToBn = ethers.utils.parseUnits(inputUpper, 18)

        setBnInputLower(valueToBn)
        setBnInputUpper(valueUpperToBn)
      }
    }

    setInputLower(
      result == '' ? BigNumber.from('0') : ethers.utils.parseUnits(result, 18),
    )
    setInputUpper(
        result == '' ? BigNumber.from('0') : ethers.utils.parseUnits(inputUpper, 18),
    )
    if (result !== '') {
      const valueToBn = ethers.utils.parseUnits(result, 18)
      const valueUpperToBn = ethers.utils.parseUnits(inputUpper, 18)

      setBnInputLower(valueToBn)
      setBnInputUpper(valueUpperToBn)
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
  const upperInputBox = (placeholder: string, inputLower?: any, updateValue?: any) => {
    return (
      <div className="">
        <input
          autoComplete="off"
          type="text"
          id="input"
          onChange={(e) => handleUpperChange(e, inputLower, updateValue)}
          value={displayUpper}
          placeholder={placeholder}
          className="bg-[#0C0C0C] placeholder:text-grey1 w-full text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
        />
      </div>
    );
  }

  const lowerInputBox = (placeholder: string, inputUpper?: any, updateValue?: any) => {
    return (
      <div className="flex gap-x-2">
        <input
          autoComplete="off"
          type="text"
          id="LimitInput"
          onChange={(e) => handleLowerChange(e, inputUpper, updateValue)}
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