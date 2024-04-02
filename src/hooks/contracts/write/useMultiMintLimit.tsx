import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../useConfigStore";
import { getRouterAddress } from "../../../utils/config";
import { poolsharkRouterABI } from "../../../abis/evm/poolsharkRouter";
import { deepConvertBigIntAndBigNumber } from "../../../utils/misc";
import { BN_ZERO } from "../../../utils/math/constants";
import { useRangeLimitStore } from "../../useRangeLimitStore";
import {
  getRangeMintInputData,
  getRangeMintButtonMsgValue,
} from "../../../utils/buttons";
import { getRangeStakerAddress } from "../../../utils/config";
import { useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { chainProperties } from "../../../utils/chains";

export default function useMultiMintLimit({
  positionId,
  lower,
  upper,
  disabled,
  amount,
  gasLimit,
  toastId,
  setTxHash,
  setNeedsSnapshot,
  setIsOpen,
  setIsLoading,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const [
    tokenIn,
    tokenOut,
    rangeMintParams,
    limitPoolAddress,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
  ] = useRangeLimitStore((state) => [
    state.tokenIn,
    state.tokenOut,
    state.rangeMintParams,
    state.limitPoolAddress,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
  ]);

  const { address } = useAccount();

  const { config } = usePrepareContractWrite({
    address: getRouterAddress(networkName),
    abi: poolsharkRouterABI,
    functionName: "multiMintLimit",
    args: [
      [limitPoolAddress],
      [
        deepConvertBigIntAndBigNumber({
          to: address,
          amount: amount,
          mintPercent: parseUnits("1", 24),
          positionId: positionId,
          lower: lower,
          upper: upper,
          zeroForOne: tokenIn.callId == 0,
          callbackData: ethers.utils.formatBytes32String(""),
        }),
      ],
    ],
    chainId: chainId,
    enabled: positionId != undefined,
    gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      toast.success("Your transaction was successful", {
        id: toastId,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`,
              "_blank",
            ),
        },
      });
      setNeedsSnapshot(true);
      setNeedsAllowanceIn(true);
      setNeedsBalanceIn(true);
      setTimeout(() => {
        setNeedsRefetch(true);
        setIsOpen(false);
      }, 2000);
    },
    onError() {
      toast.error("Your transaction failed", {
        id: toastId,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`,
              "_blank",
            ),
        },
      });
    },
  });

  useEffect(() => {
    if (isLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    setTxHash(data?.hash);
  }, [data]);

  return { config, data, write };
}
