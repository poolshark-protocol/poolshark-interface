import { BigNumber, Contract, Signer, ethers } from "ethers";
import { rangePoolABI } from "../abis/evm/rangePool";
import { coverPoolABI } from "../abis/evm/coverPool";
import { SwapParams, tokenCover, tokenRangeLimit, tokenSwap } from "./types";
import { TickMath, roundTick } from "./math/tickMath";
import { fetchEthPrice } from "./queries";
import { BN_ZERO } from "./math/constants";
import { limitPoolABI } from "../abis/evm/limitPool";
import { poolsharkRouterABI } from "../abis/evm/poolsharkRouter";
import { chainProperties } from "./chains";
import JSBI from "jsbi";
import { parseUnits } from "./math/valueMath";
import { formatBytes32String } from "ethers/lib/utils.js";
import { coverPoolTypes } from "./pools";

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
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
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
    //NATIVE: if tokenIn.native, send msg.value as amountIn
    //NATIVE: if tokenOut.native, send msg.value as 1 wei
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
    setGasLimit(gasUnits.mul(200).div(100));
  } catch (error) {
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
  setMintGasLimit,
  networkName: string
): Promise<void> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
    );
    const price = await fetchEthPrice();
    const ethUsdPrice = price["data"]["bundles"]["0"]["ethPriceUSD"];
    if (!rangePoolRoute || !provider) {
      setMintGasFee("$0.00");
      setMintGasLimit(BN_ZERO);
    }
    const zeroForOne = token0.address.localeCompare(token1.address) < 0;

    const routerAddress = chainProperties[networkName]["routerAddress"];
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );
    let gasUnits: BigNumber;
    //NATIVE: if tokenIn.native, send msg.value as amountIn
    //NATIVE: if tokenOut.native, send msg.value as 1 wei
    gasUnits = await routerContract.connect(signer).estimateGas.multiMintLimit(
      [rangePoolRoute],
      [
        {
          to: address,
          amount: bnInput,
          mintPercent: parseUnits("1", 24), // skip mint under 1% left after swap
          positionId: BN_ZERO,
          lower: lowerTick,
          upper: upperTick,
          zeroForOne: zeroForOne,
          callbackData: ethers.utils.formatBytes32String(""),
        },
      ]
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
    console.log("gas error limit mint", error);
    setMintGasFee("$0.00");
    setMintGasLimit(BN_ZERO);
  }
};

export const gasEstimateCreateAndMintLimit = async (
  poolTypeId: number,
  feeTier: number,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  token0: tokenSwap,
  token1: tokenSwap,
  bnInput: BigNumber,
  signer,
  setMintGasFee,
  setMintGasLimit,
  networkName: string
): Promise<void> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
    );
    const price = await fetchEthPrice();
    const ethUsdPrice = price["data"]["bundles"]["0"]["ethPriceUSD"];
    if (!provider) {
      setMintGasFee("$0.00");
      setMintGasLimit(BN_ZERO);
    }
    const recipient = address;
    const zeroForOne = token0.address.localeCompare(token1.address) < 0;

    const routerAddress = chainProperties[networkName]["routerAddress"];
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );

    let gasUnits: BigNumber;
    gasUnits = await routerContract
      .connect(signer)
      .estimateGas.createLimitPoolAndMint(
        {
          poolTypeId: poolTypeId,
          tokenIn: token0.address,
          tokenOut: token1.address,
          startPrice: TickMath.getSqrtRatioAtTick(Number(upperTick)),
          swapFee: feeTier,
        }, // pool params
        [], // range positions
        [
          {
            to: recipient,
            amount: bnInput,
            mintPercent: parseUnits("1", 24), // skip mint under 1% left after swap
            positionId: BN_ZERO,
            lower: lowerTick,
            upper: upperTick,
            zeroForOne: zeroForOne,
            callbackData: ethers.utils.formatBytes32String(""),
          },
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
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
    );
    const price = await fetchEthPrice();
    const ethUsdPrice = price["data"]["bundles"]["0"]["ethPriceUSD"];

    if (
      !limitPoolRoute ||
      !provider ||
      signer == undefined ||
      positionId == undefined
    ) {
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
    gasUnits = await contract.connect(signer).estimateGas.burnLimit({
      to: recipient,
      positionId: Number(positionId),
      claim: claim,
      zeroForOne: zeroForOne,
      burnPercent: burnPercent,
    });
    const gasPrice = await provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * Number(ethUsdPrice);
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    setBurnGasFee(formattedPrice);
    setBurnGasLimit(gasUnits.mul(150).div(100));
  } catch (error) {
    console.log(
      "gas error limit burn",
      positionId?.toString(),
      claim.toString(),
      error
    );
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
  networkName: string,
  positionId?: number
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
    );
    if (
      !rangePoolRoute ||
      !provider ||
      (amount0.eq(BN_ZERO) && amount1.eq(BN_ZERO)) ||
      !signer
    ) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const routerAddress = chainProperties[networkName]["routerAddress"];
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );
    const gasUnits = await routerContract
      .connect(signer)
      .estimateGas.multiMintRange(
        [rangePoolRoute],
        [
          {
            to: address,
            lower: lowerTick,
            upper: upperTick,
            positionId: positionId ?? 0, /// @dev - 0 for new position; positionId for existing (i.e. adding liquidity)
            amount0: amount0,
            amount1: amount1,
            callbackData: ethers.utils.formatBytes32String(""),
          },
        ]
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
    console.log("range mint gas error", error);
    return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
  }
};

export const gasEstimateRangeCreateAndMint = async (
  poolTypeId: number,
  feeTier: number,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  startPrice: BigNumber,
  token0: tokenRangeLimit,
  token1: tokenRangeLimit,
  amount0: BigNumber,
  amount1: BigNumber,
  signer,
  networkName: string,
  positionId?: number
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
    );
    if (!provider || (amount0.eq(BN_ZERO) && amount1.eq(BN_ZERO))) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    if (
      JSBI.lessThan(
        JSBI.BigInt(startPrice.toString()),
        TickMath.MIN_SQRT_RATIO
      ) ||
      JSBI.greaterThanOrEqual(
        JSBI.BigInt(startPrice.toString()),
        TickMath.MAX_SQRT_RATIO
      )
    ) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const routerAddress = chainProperties[networkName]["routerAddress"];
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );
    const gasUnits = await routerContract
      .connect(signer)
      .estimateGas.createLimitPoolAndMint(
        {
          poolTypeId: poolTypeId,
          tokenIn: token0.address,
          tokenOut: token1.address,
          startPrice: startPrice,
          swapFee: feeTier,
        }, // pool params
        [
          {
            to: address,
            lower: lowerTick,
            upper: upperTick,
            positionId: positionId ?? 0, /// @dev - 0 for new position; positionId for existing (i.e. adding liquidity)
            amount0: amount0,
            amount1: amount1,
            callbackData: ethers.utils.formatBytes32String(""),
          },
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
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
    );
    if (
      !rangePoolRoute ||
      !provider ||
      !signer ||
      burnPercent.eq(BN_ZERO) ||
      !positionId
    ) {
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
    const price = await fetchEthPrice();
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
  networkName: string,
  positionId?: number
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
    );
    if (!coverPoolRoute || !provider || !signer) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    if (inAmount.eq(BN_ZERO))
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    const routerAddress = chainProperties[networkName]["routerAddress"];
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      provider
    );
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0;
    const amountIn = BigNumber.from(String(inAmount));
    const gasUnits: BigNumber = await routerContract
      .connect(signer)
      .estimateGas.multiMintCover(
        [coverPoolRoute],
        [
          {
            to: address,
            positionId: positionId ?? 0,
            amount: amountIn,
            lower: lowerTick,
            upper: upperTick,
            zeroForOne: zeroForOne,
            callbackData: ethers.utils.formatBytes32String(""),
          },
        ]
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

export const gasEstimateCoverCreateAndMint = async (
  volatilityTier: any,
  address: string,
  upperTick: number,
  lowerTick: number,
  tokenIn: tokenCover,
  tokenOut: tokenCover,
  inAmount: BigNumber,
  signer,
  networkName: string,
  twapReady: boolean,
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
    );
    if (!provider || !signer) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const routerAddress = chainProperties[networkName]["routerAddress"];
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
          poolType: coverPoolTypes['constant-product']['poolshark'],
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          feeTier: volatilityTier.feeAmount,
          tickSpread: volatilityTier.tickSpread,
          twapLength: volatilityTier.twapLength,
        }, // pool params
        twapReady ? [
          {
            to: address,
            amount: inAmount,
            positionId: BN_ZERO,
            lower: lowerTick,
            upper: upperTick,
            zeroForOne: zeroForOne,
            callbackData: ethers.utils.formatBytes32String(""),
          },
        ] 
        : [] // skip mint if !twapReady
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
    console.log("gas error Create and Mint", error);
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
      "https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/"
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
