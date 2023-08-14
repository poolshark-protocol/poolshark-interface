//eventually this functions should merge into one

import { TickMath, invertPrice } from "./math/tickMath";

export const logoMap = {
  TOKEN20A: "/static/images/dai_icon.png",
  TOKEN20B: "/static/images/eth_icon.png",
  USDC: "/static/images/token.png",
  WETH: "/static/images/eth_icon.png",
  DAI: "/static/images/dai_icon.png",
  stkEth: "/static/images/eth_icon.png",
  pStake: "/static/images/eth_icon.png",
  UNI: "/static/images/dai_icon.png",
};

export const fetchRangeTokenUSDPrice = (poolData, token, setTokenUSDPrice) => {
  try {
    setTokenUSDPrice(
      token.callId == 0 ? poolData.token0.usdPrice : poolData.token1.usdPrice
    );
  } catch (error) {
    console.log(error);
  }
};

export const fetchCoverTokenUSDPrice = (poolData, token, setTokenUSDPrice) => {
  const price = TickMath.getPriceStringAtTick(
    parseInt(poolData.latestTick),
    parseInt(poolData.volatilityTier.tickSpread)
  );
  try {
    setTokenUSDPrice(token.callId == 0 ? price : invertPrice(price, false));
  } catch (error) {
    console.log(error);
  }
};
