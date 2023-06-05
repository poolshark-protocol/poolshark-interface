//eventually this functions should merge into one

import { invertPrice } from './math/tickMath'

export const fetchTokenPrices = async (price: string, setMktRate) => {
  try {
    setMktRate({
      TOKEN20A: Number(price).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
      WETH:
        '~' +
        Number(price).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
      TOKEN20B: '1.00',
      USDC: '~1.00',
    })
  } catch (error) {
    console.log(error)
  }
}

export const fetchTokenPriceWithInvert = async (price: string, setMktRate) => {
  if (isNaN(parseFloat(price))) return
  try {
    const price0 = price
    const price1: any = invertPrice(price, false)
    setMktRate({
      TOKEN20A: Number(price1).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
      TOKEN20B: Number(price0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
    })
  } catch (error) {
    console.log(error)
  }
}
