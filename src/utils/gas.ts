import { BigNumber, Contract, Signer, ethers } from "ethers";
import { rangePoolABI } from "../abis/evm/rangePool";
import { coverPoolABI } from "../abis/evm/coverPool";
import { SwapParams, tokenCover, tokenSwap } from "./types";
import { TickMath, roundTick } from "./math/tickMath";
import { fetchPrice } from "./queries";
import JSBI from "jsbi";
import { BN_ZERO } from "./math/constants";
import { limitPoolABI } from "../abis/evm/limitPool";
import { poolsharkRouterABI } from "../abis/evm/poolsharkRouter";

export interface gasEstimateResult {
  formattedPrice: string;
  gasUnits: BigNumber;
}

export const gasEstimateSwap = async (
  poolRouter: string,
  poolAddresses: string[],
  swapParams: SwapParams[],
  tokenIn: tokenSwap,
  tokenOut: tokenSwap,
  signer: Signer,
  isConnected: boolean,
  setGasFee,
  setGasLimit
): Promise<void> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
    );
    const ethUsdQuery = await fetchPrice("ethereum");
    const ethUsdPrice = ethUsdQuery["data"]["bundles"]["0"]["ethPriceUSD"];
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0;
    let gasUnits: BigNumber;
    if (poolRouter && isConnected) {
      const contract = new ethers.Contract(
        poolRouter,
        poolsharkRouterABI,
        provider
      );
      gasUnits = await contract
        .connect(signer)
        .estimateGas.multiSwapSplit(poolAddresses, swapParams);
    } else {
      gasUnits = BigNumber.from(1000000);
    }
    const gasPrice = await provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * Number(ethUsdPrice);
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    setGasFee(formattedPrice);
    setGasLimit(gasUnits.mul(150).div(100));
  } catch (error) {
    console.log("gas error", error);
    setGasFee("$0.00");
    setGasLimit(BigNumber.from(1000000));
  }
};

export const gasEstimateMintLimit = async (
  rangePoolRoute: string,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  token0: tokenSwap,
  token1: tokenSwap,
  bnInput: BigNumber,
  signer,
  setMintGasFee,
  setMintGasLimit
): Promise<void> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
    );
    const price = await fetchPrice("ethereum");
    const ethUsdPrice = price["data"]["bundles"]["0"]["ethPriceUSD"];

    console.log("user address mint", address);
    console.log("range pool route mint", rangePoolRoute);
    console.log("lower tick mint", lowerTick.toString());
    console.log("upper tick mint", upperTick.toString());
    console.log("bnInput", bnInput.toString());

    if (!rangePoolRoute || !provider) {
      setMintGasFee("$0.00");
      setMintGasLimit(BN_ZERO);
    }

    const recipient = address;
    const zeroForOne = token0.address.localeCompare(token1.address) < 0;

    const contract = new ethers.Contract(
      rangePoolRoute,
      rangePoolABI,
      provider
    );

    let gasUnits: BigNumber;
    gasUnits = await contract.connect(signer).estimateGas.mintLimit([
      recipient,
      bnInput,
      ethers.utils.parseUnits("1", 24), // skip mint under 1% left after swap
      BN_ZERO,
      lowerTick,
      upperTick,
      zeroForOne,
    ]);
    console.log("limit gas units", gasUnits.toString());
    const gasPrice = await provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * Number(ethUsdPrice);
    console.log("network fee usd limit", networkFeeUsd);
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    setMintGasFee(formattedPrice);
    setMintGasLimit(gasUnits.mul(150).div(100));
  } catch (error) {
    console.log("gas error limit", error);
    setMintGasFee("$0.00");
    setMintGasLimit(BN_ZERO);
  }
};

export const gasEstimateRangeMint = async (
  rangePoolRoute: string,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  amount0: BigNumber,
  amount1: BigNumber,
  signer,
  positionId?: number
): Promise<gasEstimateResult> => {
  console.log("gas estimate range mint");
  console.log("range pool route", rangePoolRoute);
  console.log("address", address);
  console.log("lower tick", lowerTick.toString());
  console.log("upper tick", upperTick.toString());
  console.log("amount0", amount0.toString());
  console.log("amount1", amount1.toString());
  console.log("positionId", positionId);
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
    );
    if (
      !rangePoolRoute ||
      !provider ||
      (amount0.eq(BN_ZERO) && amount1.eq(BN_ZERO))
    ) {
      console.log("early return", rangePoolRoute, provider);
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const contract = new ethers.Contract(
      rangePoolRoute,
      rangePoolABI,
      provider
    );
    const gasUnits = await contract.connect(signer).estimateGas.mintRange({
      to: address,
      lower: lowerTick,
      upper: upperTick,
      positionId: positionId ?? 0, /// @dev - 0 for new position; positionId for existing (i.e. adding liquidity)
      amount0: amount0,
      amount1: amount1,
    });
    //console.log('new mint gas limit', gasUnits.toString(), lowerTick.toString(), upperTick.toString())
    const price = await fetchPrice("0x000");
    const gasPrice = await provider.getGasPrice();
    const ethUsdPrice = Number(price["data"]["bundles"]["0"]["ethPriceUSD"]);
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * ethUsdPrice;
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    //console.log('gas estimate mint', lowerTick.toString(), upperTick.toString(), gasUnits.toString())
    return { formattedPrice, gasUnits };
  } catch (error) {
    console.log("gas error", error);
    return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
  }
};

export const gasEstimateRangeBurn = async (
  rangePoolRoute: string,
  address: string,
  positionId: number,
  burnPercent: BigNumber,
  signer
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
    );
    if (!rangePoolRoute || !provider) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const contract = new ethers.Contract(
      rangePoolRoute,
      rangePoolABI,
      provider
    );
    const recipient = address;
    const gasUnits = await contract
      .connect(signer)
      .estimateGas.burnRange([recipient, positionId, burnPercent]);
    const price = await fetchPrice("ethereum");
    const gasPrice = await provider.getGasPrice();
    const ethUsdPrice = price["data"]["bundles"]["0"]["ethPriceUSD"];
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * ethUsdPrice;
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return { formattedPrice, gasUnits };
  } catch (error) {
    console.log("gas error", error);
    return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
  }
};

export const gasEstimateCoverMint = async (
  coverPoolRoute: string,
  address: string,
  upperTick: number,
  lowerTick: number,
  tokenIn: tokenCover,
  tokenOut: tokenCover,
  inAmount: BigNumber,
  signer,
  positionId?: number
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
    );
    if (!coverPoolRoute || !provider || !signer) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const contract = new ethers.Contract(
      coverPoolRoute,
      coverPoolABI,
      provider
    );
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0;
    const amountIn = BigNumber.from(String(inAmount));
    const gasUnits: BigNumber = await contract
      .connect(signer)
      .estimateGas.mint({
        to: address,
        positionId: positionId ?? 0,
        amount: amountIn,
        lower: lowerTick,
        upper: upperTick,
        zeroForOne: zeroForOne,
      });
    const price = await fetchPrice("0x000");
    const gasPrice = await provider.getGasPrice();
    const ethUsdPrice = Number(price["data"]["bundles"]["0"]["ethPriceUSD"]);
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * ethUsdPrice;
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    return { formattedPrice, gasUnits };
  } catch (error) {
    console.log("gas error", error);
    return { formattedPrice: "Unable to Estimate Gas", gasUnits: BN_ZERO };
  }
};

export const gasEstimateCoverBurn = async (
  coverPoolRoute: string,
  address: string,
  positionId: number,
  burnPercent: BigNumber,
  claimTick: BigNumber,
  zeroForOne: boolean,
  signer
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
    );

    if (!coverPoolRoute || !provider) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const contract = new ethers.Contract(
      coverPoolRoute,
      coverPoolABI,
      provider
    );
    const gasUnits = await contract.connect(signer).estimateGas.burn({
      to: address,
      burnPercent: burnPercent,
      positionId: positionId,
      claim: claimTick,
      zeroForOne: zeroForOne,
      sync: true,
    });
    const price = await fetchPrice("0x000");
    const gasPrice = await provider.getGasPrice();
    const ethUsdPrice = Number(price["data"]["bundles"]["0"]["ethPriceUSD"]);
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * ethUsdPrice;
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return { formattedPrice, gasUnits };
  } catch (error) {
    console.log("gas error", error);
    return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
  }
};
