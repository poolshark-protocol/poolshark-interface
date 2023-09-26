import { BigNumber, Contract, Signer, ethers } from "ethers";
import { rangePoolABI } from "../abis/evm/rangePool";
import { coverPoolABI } from "../abis/evm/coverPool";
import { SwapParams, tokenCover, tokenRangeLimit, tokenSwap } from "./types";
import { TickMath, roundTick } from "./math/tickMath";
import { fetchEthPrice } from "./queries";
import JSBI from "jsbi";
import { BN_ZERO } from "./math/constants";
import { limitPoolABI } from "../abis/evm/limitPool";
import { poolsharkRouterABI } from "../abis/evm/poolsharkRouter";
import { chainProperties } from "./chains";

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
    const ethUsdQuery = await fetchEthPrice();
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
    const price = await fetchEthPrice()
    const ethUsdPrice = price["data"]["bundles"]["0"]["ethPriceUSD"];
    if (!rangePoolRoute || !provider) {
      setMintGasFee("$0.00");
      setMintGasLimit(BN_ZERO);
    }
    const recipient = address;
    const zeroForOne = token0.address.localeCompare(token1.address) < 0;

    const routerAddress = chainProperties['arbitrumGoerli']['routerAddress']
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );

    let gasUnits: BigNumber;
    gasUnits = await routerContract.connect(signer).estimateGas.multiMintLimit(
    [rangePoolRoute],
    [{
      to: recipient,
      amount: bnInput,
      mintPercent: ethers.utils.parseUnits("1", 24), // skip mint under 1% left after swap
      positionId: BN_ZERO,
      lower: lowerTick,
      upper: upperTick,
      zeroForOne: zeroForOne,
    }]);
    const gasPrice = await provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * Number(ethUsdPrice);
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    setMintGasFee(formattedPrice);
    setMintGasLimit(gasUnits.mul(150).div(100));
    console.log("gas units", gasUnits.toString())
  } catch (error) {
    console.log("gas error limit mint", error);
    setMintGasFee("$0.00");
    setMintGasLimit(BN_ZERO);
  }
};

export const gasEstimateCreateAndMintLimit = async (
  poolType: string,
  feeTier: number,
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
    const price = await fetchEthPrice()
    const ethUsdPrice = price["data"]["bundles"]["0"]["ethPriceUSD"];
    if (!provider) {
      setMintGasFee("$0.00");
      setMintGasLimit(BN_ZERO);
    }
    const recipient = address;
    const zeroForOne = token0.address.localeCompare(token1.address) < 0;

    const routerAddress = chainProperties['arbitrumGoerli']['routerAddress']
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );

    let gasUnits: BigNumber;
    gasUnits = await routerContract.connect(signer).estimateGas.createLimitPoolAndMint(
      {
        poolType: ethers.utils.formatBytes32String(poolType),
        tokenIn: token0.address,
        tokenOut: token1.address,
        startPrice: TickMath.getSqrtRatioAtTick(Number(upperTick)),
        swapFee: feeTier
      }, // pool params
      [], // range positions
      [
          {
              to: recipient,
              amount: bnInput,
              mintPercent: ethers.utils.parseUnits("1", 24), // skip mint under 1% left after swap
              positionId: BN_ZERO,
              lower: lowerTick,
              upper: upperTick,
              zeroForOne: zeroForOne,
              callbackData: ethers.utils.formatBytes32String('')
          }
      ] // limit positions
    );
    const gasPrice = await provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * Number(ethUsdPrice);
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    setMintGasFee(formattedPrice);
    setMintGasLimit(gasUnits.mul(150).div(100));
  } catch (error) {
    console.log("gas error limit create and mint", error);
    setMintGasFee("$0.00");
    setMintGasLimit(BN_ZERO);
  }
};

export const gasEstimateBurnLimit = async (
  limitPoolRoute: string,
  address: string,
  burnPercent: BigNumber,
  positionId: BigNumber,
  claim: BigNumber,
  zeroForOne: boolean,
  signer,
  setBurnGasFee,
  setBurnGasLimit
): Promise<void> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
    );
    const price = await fetchEthPrice()
    const ethUsdPrice = price["data"]["bundles"]["0"]["ethPriceUSD"];

    console.log("user address burn", address);
    console.log("limit pool route burn", limitPoolRoute);
    console.log("position id burn", positionId.toString());
    console.log("burn pct", burnPercent.toString());
    console.log("claim tick burn", claim.toString());
    console.log("zeroForOne", zeroForOne.toString());

    if (!limitPoolRoute || !provider) {
      setBurnGasFee("$0.00");
      setBurnGasLimit(BN_ZERO);
    }

    const recipient = address;

    const contract = new ethers.Contract(
      limitPoolRoute,
      limitPoolABI,
      provider
    );

    let gasUnits: BigNumber;
    gasUnits = await contract.connect(signer).estimateGas.burnLimit([
      recipient,
      burnPercent,
      positionId, // skip mint under 1% left after swap
      claim,
      zeroForOne,
      true
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

    setBurnGasFee(formattedPrice);
    setBurnGasLimit(gasUnits.mul(150).div(100));
  } catch (error) {
    console.log("gas error limit burn", error);
    setBurnGasFee("$0.00");
    setBurnGasLimit(BN_ZERO);
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
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
    );
    if (
      !rangePoolRoute ||
      !provider ||
      (amount0.eq(BN_ZERO) && amount1.eq(BN_ZERO))
    ) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const routerAddress = chainProperties['arbitrumGoerli']['routerAddress']
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );
    const gasUnits = await routerContract.connect(signer).estimateGas.multiMintRange(
      [rangePoolRoute],
      [{
        to: address,
        lower: lowerTick,
        upper: upperTick,
        positionId: positionId ?? 0, /// @dev - 0 for new position; positionId for existing (i.e. adding liquidity)
        amount0: amount0,
        amount1: amount1,
        callbackData: ethers.utils.formatBytes32String('')
      }]
    );
    const price = await fetchEthPrice();
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

export const gasEstimateRangeCreateAndMint = async (
  poolType: string,
  feeTier: number,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  token0: tokenRangeLimit,
  token1: tokenRangeLimit,
  amount0: BigNumber,
  amount1: BigNumber,
  signer,
  positionId?: number
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594"
    );
    if (
      !provider ||
      (amount0.eq(BN_ZERO) && amount1.eq(BN_ZERO))
    ) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const routerAddress = chainProperties['arbitrumGoerli']['routerAddress']
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );
    const gasUnits = await routerContract.connect(signer).estimateGas.createLimitPoolAndMint(
        {
          poolType: ethers.utils.formatBytes32String(poolType),
          tokenIn: token0.address,
          tokenOut: token1.address,
          startPrice: TickMath.getSqrtRatioAtTick(Number(upperTick)),
          swapFee: feeTier
        }, // pool params
        [
          {
            to: address,
            lower: lowerTick,
            upper: upperTick,
            positionId: positionId ?? 0, /// @dev - 0 for new position; positionId for existing (i.e. adding liquidity)
            amount0: amount0,
            amount1: amount1,
            callbackData: ethers.utils.formatBytes32String('')
          }
        ], // range positions
        [] // limit positions
    );
    const price = await fetchEthPrice();
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
    const gasUnits = await contract.connect(signer).estimateGas.burnRange({
      to: address,
      positionId: positionId,
      burnPercent: burnPercent,
    });
    const price = await fetchEthPrice()
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
    const routerAddress = chainProperties['arbitrumGoerli']['routerAddress']
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );
    console.log('estimating cover gas')
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0;
    const amountIn = BigNumber.from(String(inAmount));
    const gasUnits: BigNumber = await routerContract
      .connect(signer)
      .estimateGas.multiMintCover(
      [coverPoolRoute],
      [{
        to: address,
        positionId: positionId ?? 0,
        amount: amountIn,
        lower: lowerTick,
        upper: upperTick,
        zeroForOne: zeroForOne,
        callbackData: ethers.utils.formatBytes32String('')
      }]);
    const price = await fetchEthPrice();
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

export const gasEstimateCoverCreateAndMint = async (
  poolType: string,
  feeAmount: number,
  tickSpread: number,
  twapLength: number,
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
    const routerAddress = chainProperties['arbitrumGoerli']['routerAddress']
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0;
    const amountIn = BigNumber.from(String(inAmount));
    const gasUnits: BigNumber = await routerContract
      .connect(signer)
      .estimateGas.createCoverPoolAndMint(
        {
          poolType: ethers.utils.formatBytes32String(poolType),
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          feeTier: feeAmount,
          tickSpread: tickSpread,
          twapLength: twapLength  
      }, // pool params
      [
          {
              to: address,
              amount: inAmount,
              positionId: BN_ZERO,
              lower: lowerTick,
              upper: upperTick,
              zeroForOne: zeroForOne,
              callbackData: ethers.utils.formatBytes32String('')
          }
      ] // cover positions
    );
    const price = await fetchEthPrice();
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
    console.log("cover burn", address, positionId, burnPercent, claimTick);
    const gasUnits = await contract.connect(signer).estimateGas.burn({
      to: address,
      burnPercent: burnPercent,
      positionId: positionId,
      claim: claimTick,
      zeroForOne: zeroForOne,
      sync: true,
    });
    const price = await fetchEthPrice();
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
