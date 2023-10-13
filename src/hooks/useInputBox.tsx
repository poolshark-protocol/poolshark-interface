import { useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import inputFilter from '../utils/inputFilter'
import { BN_ZERO } from '../utils/math/constants'
import { token } from '../utils/types'

export default function useInputBox() {
  const [display, setDisplay] = useState('')
  const [input, setInput] = useState(BigNumber.from('0'))
  const [bnInput, setBnInput] = useState(BigNumber.from('0'))

  const handleChange = (event, updateValue, tokenDecimals, handler?) => {
    tokenDecimals = tokenDecimals ?? 18
    const result = inputFilter(event.target.value)
    //TODO: do not allow for exceeding max decimals
    setDisplay(result == '' ? '' : result)
    if (result == '') {
      setBnInput(BN_ZERO)
    }
    if (updateValue !== undefined) {
      updateValue(result == '' ? 0 : result)
      setInput(
        result == ''
          ? BN_ZERO
          : ethers.utils.parseUnits(result, tokenDecimals),
      )
      if (result !== '') {
        const valueToBn = ethers.utils.parseUnits(result, tokenDecimals)
        setBnInput(valueToBn)
      }
    }
    setInput(
      result == '' ? BN_ZERO : ethers.utils.parseUnits(result, tokenDecimals),
    )
    if (result !== '') {
      const valueToBn = ethers.utils.parseUnits(result, tokenDecimals)
      setBnInput(valueToBn)
    }
    if (handler)
      handler(inputFilter(event.target.value))
  }

  const maxBalance = (balance, placeholder, tokenDecimals) => {
    setDisplay(balance)
    setInput(ethers.utils.parseUnits(balance.toString(), tokenDecimals))
    if (balance != '') {
      const valueToBn = ethers.utils.parseUnits(balance.toString(), tokenDecimals)
      setBnInput(valueToBn)
    }
    inputBox(placeholder, tokenDecimals)
  }

  const inputBox = (placeholder: string, token: token, inputName?: string, handler?: any, disabled?: boolean) => {
    return (
      <div className="">
        <input
          autoComplete="off"
          type="text"
          id="input"
          name={inputName ?? "input"}
          disabled={disabled ?? false}
          onChange={(e) => handler ? handler(e) : handleChange(e, token.decimals, undefined)}
          value={display}
          placeholder={placeholder}
          className="bg-transparent placeholder:text-grey1 w-full text-white text-3xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
        />
      </div>
    );
  }

  return { bnInput, display, inputBox, maxBalance, setBnInput, setDisplay }
}
