import { useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import inputFilter from '../utils/inputFilter'
import { BN_ZERO } from '../utils/math/constants'
import { token } from '../utils/types'
import { parseUnits } from '../utils/math/valueMath'

export default function useInputBox() {
  const [display, setDisplay] = useState('')
  const [bnInput, setBnInput] = useState(BigNumber.from('0'))

  const handleChange = (event, tokenDecimals) => {
    tokenDecimals = tokenDecimals ?? 18
    const result = inputFilter(event.target.value)
    setDisplay(result == '' ? '' : result)
    if (result == '') {
      setBnInput(BN_ZERO)
    }
    if (result !== '') {
      const valueToBn = parseUnits(result, tokenDecimals)
      setBnInput(valueToBn)
    }
  }

  const maxBalance = (balance, placeholder, tokenDecimals) => {
    setDisplay(balance)
    if (balance != '') {
      const valueToBn = parseUnits(balance.toString(), tokenDecimals)
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
          onChange={(e) => handler ? handler(e) : handleChange(e, token.decimals)}
          value={display}
          placeholder={placeholder}
          className="bg-transparent placeholder:text-grey1 w-full text-white text-3xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
        />
      </div>
    );
  }

  return { bnInput, display, inputBox, maxBalance, setBnInput, setDisplay }
}
