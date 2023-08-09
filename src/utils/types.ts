export type tokenCover = {
  callId: number
  name: string
  symbol: string
  logoURI: string
  address: `0x${string}`
  userBalance: number
  userPoolAllowance: number
  coverUSDPrice: number
}

export type tokenLimit = {
  callId: number
  name: string
  symbol: string
  logoURI: string
  address: `0x${string}`
  userBalance: number
  userPoolAllowance: number
  limitUSDPrice: number
}

export type token = {
  callId: number
  name: string
  symbol: string
  logoURI: string
  address: `0x${string}`
}


