import { getTickIfNotZeroForOne, getTickIfZeroForOne } from './queries'

export const getClaimTick = async (
  coverPoolAddress: string,
  minLimit: number,
  maxLimit: number,
  zeroForOne: boolean,
  epochLast: number,
) => {
  let claimTick = zeroForOne ? maxLimit : minLimit
  if (zeroForOne) {
    const claimTickQuery = await getTickIfZeroForOne(
      Number(maxLimit),
      coverPoolAddress,
      Number(epochLast),
    )
    const claimTickDataLength = claimTickQuery['data']['ticks'].length
    if (claimTickDataLength > 0)
      claimTick = claimTickQuery['data']['ticks'][0]['index']
  } else {
    const claimTickQuery = await getTickIfNotZeroForOne(
      Number(minLimit),
      coverPoolAddress,
      Number(epochLast),
    )
    const claimTickDataLength = claimTickQuery['data']['ticks'].length
    if (claimTickDataLength > 0)
      claimTick = claimTickQuery['data']['ticks'][0]['index']
    if (claimTick != undefined) {
      return claimTick
    } else {
      return minLimit
    }
  }
  console.log('claim tick found:', claimTick)
  return claimTick
}
