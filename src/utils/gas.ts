import { BigNumber, Signer, ethers } from "ethers";
import { rangePoolABI } from "../abis/evm/rangePool";
import { coverPoolABI } from "../abis/evm/coverPool";
import {
  LimitSubgraph,
  SwapParams,
  token,
  tokenCover,
  tokenRangeLimit,
  tokenSwap,
} from "./types";
import { TickMath } from "./math/tickMath";
import { fetchEthPrice } from "./queries";
import { BN_ZERO, ZERO_ADDRESS } from "./math/constants";
import { limitPoolABI } from "../abis/evm/limitPool";
import { poolsharkRouterABI } from "../abis/evm/poolsharkRouter";
import { chainProperties } from "./chains";
import JSBI from "jsbi";
import { parseUnits } from "./math/valueMath";
import { coverPoolTypes } from "./pools";
import {
  getCoverMintButtonMsgValue,
  getLimitSwapButtonMsgValue,
  getRangeMintButtonMsgValue,
  getRangeMintInputData,
  getSwapRouterButtonMsgValue,
} from "./buttons";
import { weth9ABI } from "../abis/evm/weth9";
import { rangeStakerABI } from "../abis/evm/rangeStaker";
import { getRangeStakerAddress, getRouterAddress } from "./config";
import { hasAllowance } from "./tokens";

export interface gasEstimateResult {
  formattedPrice: string;
  gasUnits: BigNumber;
}

export const gasEstimateWethCall = async (
  wethAddress: string,
  tokenIn: tokenSwap,
  tokenOut: tokenSwap,
  amountIn: BigNumber,
  signer: Signer,
  isConnected: boolean,
  setGasFee,
  setGasLimit,
  limitSubgraph: LimitSubgraph,
): Promise<void> => {
  try {
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0;
    let gasUnits: BigNumber;
    if (wethAddress && isConnected) {
      const contract = new ethers.Contract(
        wethAddress,
        weth9ABI,
        signer.provider,
      );
      if (tokenIn.native) {
        gasUnits = await contract.connect(signer).estimateGas.deposit({
          value: amountIn,
        });
      } else if (tokenOut.native) {
        gasUnits = await contract
          .connect(signer)
          .estimateGas.withdraw(amountIn);
      }
    } else {
      gasUnits = BigNumber.from(1000000);
    }
    const gasPrice = await signer.provider.getGasPrice();
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

export const gasEstimateSwap = async (
  poolRouter: string,
  poolAddresses: string[],
  swapParams: SwapParams[],
  tokenIn: tokenSwap,
  tokenOut: tokenSwap,
  amountIn: BigNumber,
  amountOut: BigNumber,
  signer: Signer,
  isConnected: boolean,
  setGasFee,
  setGasLimit,
  limitSubgraph: LimitSubgraph,
): Promise<void> => {
  try {
    if (
      poolAddresses?.length == 0 ||
      !signer?.provider ||
      swapParams?.length == 0
    ) {
      setGasFee("$0.00");
      setGasLimit(BN_ZERO);
      return;
    }
    // check for params and input mismatch
    if (
      (swapParams[0].exactIn && !swapParams[0].amount.eq(amountIn)) ||
      (!swapParams[0].exactIn && !swapParams[0].amount.eq(amountOut))
    ) {
      return;
    }
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0;
    let gasUnits: BigNumber;
    if (
      poolAddresses?.length == 0 ||
      !signer.provider ||
      swapParams?.length == 0
    ) {
      setGasFee("$0.00");
      setGasLimit(BN_ZERO);
    }
    if (poolRouter && isConnected) {
      const contract = new ethers.Contract(
        poolRouter,
        poolsharkRouterABI,
        signer.provider,
      );
      gasUnits = await contract
        .connect(signer)
        .estimateGas.multiSwapSplit(
          poolAddresses,
          swapParams[0],
          BN_ZERO,
          1897483712,
          {
            value: getSwapRouterButtonMsgValue(
              tokenIn.native,
              tokenOut.native,
              amountIn,
            ),
          },
        );
    } else {
      return;
    }
    const gasPrice = await signer.provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * Number(ethUsdPrice);
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    setGasFee(formattedPrice);
    setGasLimit(gasUnits.mul(110).div(100));
    console.log("swap gas estimate", gasUnits.toString());
  } catch (error) {
    console.log(
      "swap gas error",
      swapParams[0].amount.toString(),
      amountIn.toString(),
      error,
    );
    setGasFee("$0.00");
    setGasLimit(BN_ZERO);
  }
};

export const gasEstimateMintLimit = async (
  rangePoolRoute: string,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  tokenIn: tokenSwap,
  tokenOut: tokenSwap,
  bnInput: BigNumber,
  signer,
  setMintGasFee,
  setMintGasLimit,
  networkName: string,
  limitSubgraph: LimitSubgraph,
): Promise<void> => {
  try {
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    if (
      !rangePoolRoute ||
      rangePoolRoute == ZERO_ADDRESS ||
      !signer.provider ||
      !hasAllowance(tokenIn, bnInput)
    ) {
      setMintGasFee("$0.00");
      setMintGasLimit(BN_ZERO);
    }
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0;

    const routerAddress = getRouterAddress(networkName);
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      signer.provider,
    );
    let gasUnits: BigNumber;
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
      ],
      {
        value: getLimitSwapButtonMsgValue(tokenIn.native, bnInput),
      },
    );

    const gasPrice = await signer.provider.getGasPrice();
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

export const gasEstimateLimitCreateAndMint = async (
  poolTypeId: number,
  feeTier: number,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  tokenIn: tokenSwap,
  tokenOut: tokenSwap,
  bnInput: BigNumber,
  tickSpacing: number,
  startPrice: string,
  signer,
  setMintGasFee,
  setMintGasLimit,
  networkName: string,
  limitSubgraph: LimitSubgraph,
): Promise<void> => {
  try {
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    if (
      !signer.provider ||
      !isNaN(parseFloat(startPrice)) ||
      !hasAllowance(tokenIn, bnInput)
    ) {
      setMintGasFee("$0.00");
      setMintGasLimit(BN_ZERO);
    }
    const sqrtStartPrice = TickMath.getSqrtPriceAtPriceString(
      startPrice,
      tokenIn,
      tokenOut,
    );
    if (
      JSBI.lessThanOrEqual(sqrtStartPrice, TickMath.MIN_SQRT_RATIO) ||
      JSBI.greaterThanOrEqual(sqrtStartPrice, TickMath.MAX_SQRT_RATIO)
    ) {
      console.log("invalid price");
      setMintGasFee("$0.00");
      setMintGasLimit(BN_ZERO);
    }
    const recipient = address;
    const zeroForOne = tokenIn.callId == 0;

    const routerAddress = getRouterAddress(networkName);
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      signer.provider,
    );
    let gasUnits: BigNumber;
    gasUnits = await routerContract
      .connect(signer)
      .estimateGas.createLimitPoolAndMint(
        {
          poolTypeId: poolTypeId,
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          // startPrice: BigNumber.from(String(sqrtStartPrice)),
          startPrice: BigNumber.from(
            String(
              TickMath.getSqrtRatioAtTick(
                Number(zeroForOne ? lowerTick : upperTick),
              ),
            ),
          ),
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
        ], // limit positions
        {
          value: getLimitSwapButtonMsgValue(tokenIn.native, bnInput),
        },
      );
    const gasPrice = await signer.provider.getGasPrice();
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
    console.log(
      "gas error limit create and mint",
      lowerTick.toString(),
      upperTick.toString(),
      feeTier,
      error,
    );
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
  setBurnGasLimit,
  limitSubgraph: LimitSubgraph,
): Promise<void> => {
  try {
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    if (
      !limitPoolRoute ||
      !signer.provider ||
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
      signer.provider,
    );

    let gasUnits: BigNumber;
    gasUnits = await contract.connect(signer).estimateGas.burnLimit({
      to: recipient,
      positionId: Number(positionId),
      claim: claim,
      zeroForOne: zeroForOne,
      burnPercent: burnPercent,
    });
    const gasPrice = await signer.provider.getGasPrice();
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
      zeroForOne.toString(),
      error,
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
  tokenIn: token,
  tokenOut: token,
  amountIn: BigNumber,
  amountOut: BigNumber,
  signer,
  stakeFlag: boolean,
  networkName: string,
  limitSubgraph: LimitSubgraph,
  positionId?: number,
): Promise<gasEstimateResult> => {
  try {
    if (
      !rangePoolRoute ||
      !signer ||
      !signer.provider ||
      (amountIn.eq(BN_ZERO) && amountOut.eq(BN_ZERO))
    ) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const tokenInBalance = parseUnits(
      tokenIn.userBalance.toString(),
      tokenIn.decimals,
    );
    const tokenOutBalance = parseUnits(
      tokenOut.userBalance.toString(),
      tokenOut.decimals,
    );
    if (amountIn.gt(tokenInBalance) || amountOut.gt(tokenOutBalance)) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const routerAddress = getRouterAddress(networkName);
    const rangeStakerAddress = getRangeStakerAddress(networkName);
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      signer.provider,
    );
    if (amountIn.lt(BN_ZERO)) amountIn = BN_ZERO;
    if (amountOut.lt(BN_ZERO)) amountOut = BN_ZERO;
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
            amount0: tokenIn.callId == 0 ? amountIn : amountOut,
            amount1: tokenIn.callId == 0 ? amountOut : amountIn,
            callbackData: getRangeMintInputData(stakeFlag, rangeStakerAddress),
          },
        ],
        {
          value: getRangeMintButtonMsgValue(
            tokenIn.native,
            tokenOut.native,
            amountIn,
            amountOut,
          ),
        },
      );
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    const gasPrice = await signer.provider.getGasPrice();
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
  tokenIn: tokenRangeLimit,
  tokenOut: tokenRangeLimit,
  amountIn: BigNumber,
  amountOut: BigNumber,
  signer,
  stakeFlag: boolean,
  networkName: string,
  limitSubgraph: LimitSubgraph,
): Promise<gasEstimateResult> => {
  try {
    if (!signer?.provider || (amountIn.eq(BN_ZERO) && amountOut.eq(BN_ZERO))) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    if (
      JSBI.lessThan(
        JSBI.BigInt(startPrice.toString()),
        TickMath.MIN_SQRT_RATIO,
      ) ||
      JSBI.greaterThanOrEqual(
        JSBI.BigInt(startPrice.toString()),
        TickMath.MAX_SQRT_RATIO,
      )
    ) {
      console.log("invalid price", startPrice.toString());
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const routerAddress = getRouterAddress(networkName);
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      signer.provider,
    );
    const gasUnits = await routerContract
      .connect(signer)
      .estimateGas.createLimitPoolAndMint(
        {
          poolTypeId: poolTypeId,
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          startPrice: startPrice,
          swapFee: feeTier,
        }, // pool params
        [
          {
            to: address,
            lower: lowerTick,
            upper: upperTick,
            positionId: 0, /// @dev - 0 for new position; positionId for existing (i.e. adding liquidity)
            amount0: tokenIn.callId == 0 ? amountIn : amountOut,
            amount1: tokenIn.callId == 0 ? amountOut : amountIn,
            callbackData: getRangeMintInputData(
              stakeFlag,
              getRangeStakerAddress(networkName),
            ),
          },
        ], // range positions
        [], // limit positions
        {
          value: getRangeMintButtonMsgValue(
            tokenIn.native,
            tokenOut.native,
            amountIn,
            amountOut,
          ),
        },
      );
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    const gasPrice = await signer.provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * ethUsdPrice;
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return { formattedPrice, gasUnits };
  } catch (error) {
    console.log("create and mint gas error", error);
    return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
  }
};

export const gasEstimateRangeStake = async (
  rangePoolAddress: string,
  address: string,
  positionId: number,
  networkName: string,
  signer,
  limitSubgraph: LimitSubgraph,
): Promise<gasEstimateResult> => {
  try {
    if (!rangePoolAddress || !signer.provider || !signer || !positionId) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const rangeStakerAddress = getRangeStakerAddress(networkName);
    const contract = new ethers.Contract(
      rangeStakerAddress,
      rangeStakerABI,
      signer.provider,
    );
    const gasUnits = await contract.connect(signer).estimateGas.stakeRange({
      to: address,
      pool: rangePoolAddress,
      positionId: positionId,
    });
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    const gasPrice = await signer.provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * ethUsdPrice;
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return { formattedPrice, gasUnits };
  } catch (error) {
    console.log("stake gas error", error);
    return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
  }
};

export const gasEstimateRangeUnstake = async (
  rangePoolAddress: string,
  address: string,
  positionId: number,
  networkName: string,
  signer,
  limitSubgraph: LimitSubgraph,
): Promise<gasEstimateResult> => {
  try {
    if (!rangePoolAddress || !signer || !signer.provider || !positionId) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const provider = signer?.provider;
    const rangeStakerAddress = getRangeStakerAddress(networkName);
    const contract = new ethers.Contract(
      rangeStakerAddress,
      rangeStakerABI,
      provider,
    );
    const gasUnits = await contract.connect(signer).estimateGas.unstakeRange({
      to: address,
      pool: rangePoolAddress,
      positionId: positionId,
    });
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    const gasPrice = await provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * ethUsdPrice;
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return { formattedPrice, gasUnits };
  } catch (error) {
    console.log("unstake gas error", error);
    return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
  }
};

export const gasEstimateRangeBurn = async (
  rangePoolRoute: string,
  address: string,
  positionId: number,
  burnPercent: BigNumber,
  staked: boolean,
  networkName: string,
  signer,
  limitSubgraph: LimitSubgraph,
): Promise<gasEstimateResult> => {
  try {
    if (
      !rangePoolRoute ||
      !signer.provider ||
      !signer ||
      burnPercent.eq(BN_ZERO) ||
      !positionId
    ) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const rangeStakerAddress = getRangeStakerAddress(networkName);
    const contract = new ethers.Contract(
      !staked ? rangePoolRoute : rangeStakerAddress,
      !staked ? rangePoolABI : rangeStakerABI,
      signer.provider,
    );
    const gasUnits = !staked
      ? await contract.connect(signer).estimateGas.burnRange({
          to: address,
          positionId: positionId,
          burnPercent: burnPercent,
        })
      : await contract
          .connect(signer)
          .estimateGas.burnRangeStake(rangePoolRoute, {
            to: address,
            positionId: positionId,
            burnPercent: burnPercent,
          });
    const ethUsdPrice = await fetchEthPrice(limitSubgraph);
    const gasPrice = await signer.provider.getGasPrice();
    const networkFeeWei = gasPrice.mul(gasUnits);
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18));
    const networkFeeUsd = networkFeeEth * ethUsdPrice;
    const formattedPrice: string = networkFeeUsd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return { formattedPrice, gasUnits };
  } catch (error) {
    console.log("burn gas error", error);
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
  positionId?: number,
): Promise<gasEstimateResult> => {
  try {
    if (!coverPoolRoute || !signer.provider || !signer) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    if (inAmount.eq(BN_ZERO))
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    const routerAddress = getRouterAddress(networkName);
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      signer.provider,
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
        ],
        {
          value: getCoverMintButtonMsgValue(tokenIn.native, amountIn),
        },
      );
    const ethUsdPrice = 0;
    const gasPrice = await signer.provider.getGasPrice();
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
    if (!signer.provider || !signer) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const routerAddress = getRouterAddress(networkName);
    const routerContract = new ethers.Contract(
      routerAddress,
      poolsharkRouterABI,
      signer.provider,
    );
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0;
    const amountIn = BigNumber.from(String(inAmount));
    const gasUnits: BigNumber = await routerContract
      .connect(signer)
      .estimateGas.createCoverPoolAndMint(
        {
          poolType: coverPoolTypes["constant-product"]["poolshark"],
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          feeTier: volatilityTier.feeAmount,
          tickSpread: volatilityTier.tickSpread,
          twapLength: volatilityTier.twapLength,
        }, // pool params
        twapReady
          ? [
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
          : [], // skip mint if !twapReady
        {
          value: getCoverMintButtonMsgValue(tokenIn.native, amountIn),
        },
      );
    const ethUsdPrice = 0;
    const gasPrice = await signer.provider.getGasPrice();
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
  signer,
): Promise<gasEstimateResult> => {
  try {
    if (!coverPoolRoute || !signer.provider) {
      return { formattedPrice: "$0.00", gasUnits: BN_ZERO };
    }
    const contract = new ethers.Contract(
      coverPoolRoute,
      coverPoolABI,
      signer.provider,
    );
    const gasUnits = await contract.connect(signer).estimateGas.burn({
      to: address,
      burnPercent: burnPercent,
      positionId: positionId,
      claim: claimTick,
      zeroForOne: zeroForOne,
      sync: true,
    });
    const ethUsdPrice = 0;
    const gasPrice = await signer.provider.getGasPrice();
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
