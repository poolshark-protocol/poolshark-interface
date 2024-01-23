import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { bondTellerABI } from "../../abis/evm/bondTeller";
import { useEffect, useState } from "react";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { SuccessToast } from "../Toasts/Success";
import { BigNumber } from "ethers";
import { BN_ZERO } from "../../utils/math/constants";
import { vFinABI } from "../../abis/evm/vFin";
import { parseUnits } from "../../utils/math/valueMath";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
  
  export default function VestFinButton({
    vFinAddress,
    tellerAddress,
    bondTokenId,
    needsVestingPosition,
    setNeedsVestingPosition,
  }) {
    const [
      chainId,
      networkName
    ] = useConfigStore((state) => [
      state.chainId,
      state.networkName
    ]);

    const [bondBalance, setBondBalance] = useState(BN_ZERO);
    const [bondApproved, setBondApproved] = useState(false);

    const { address } = useAccount();

    const { data: bondBalanceData } = useContractRead({
      address: tellerAddress,
      abi: bondTellerABI,
      functionName: "balanceOf",
      args: [address, bondTokenId],
      chainId: chainId,
      watch: true,
      enabled: tellerAddress != undefined
                && vFinAddress != undefined
                && address != undefined,
      onError() {
        console.log('balanceOf error',)
      },
    });

    useEffect(() => {
      if (bondBalanceData) {
        setBondBalance(BigNumber.from(bondBalanceData.toString()));
      }
    }, [bondBalanceData]);

    const { data: bondApprovalData, refetch: refetchBondApproval } = useContractRead({
      address: tellerAddress,
      abi: bondTellerABI,
      functionName: "isApprovedForAll",
      args: [address, vFinAddress],
      chainId: chainId,
      watch: true,
      enabled: tellerAddress != undefined
                && vFinAddress != undefined
                && address != undefined,
      onError() {
        console.log('isApprovedForAll error',)
      },
    });

    useEffect(() => {
      if (bondApprovalData != undefined) {
        setBondApproved(Boolean(bondApprovalData));
      }
    }, [bondApprovalData]);
    
    const { config: exchangeConfig } = usePrepareContractWrite({
      address: vFinAddress,
      abi: vFinABI,
      functionName: "exchangeBond",
      args: [
        bondBalance, // exchange entire balance
        0            // creates new vFIN position
      ],
      chainId: chainId,
      enabled: bondBalance != undefined
                && bondApproved
                && bondTokenId != undefined
                && vFinAddress != undefined,
      onSuccess() {
      },
      onError() {
        console.log('exchangeBonds error', bondBalance.toString(), bondApproved, bondTokenId, vFinAddress)
      },
    });

    const { data: exchangeData, write: exchangeWrite } = useContractWrite(exchangeConfig);

    const { config: approvalConfig } = usePrepareContractWrite({
      address: tellerAddress,
      abi: bondTellerABI,
      functionName: "setApprovalForAll",
      args: [
        vFinAddress,
        true
      ],
      chainId: chainId,
      enabled: vFinAddress != undefined 
                && tellerAddress != undefined,
      onError() {
        console.log('setApprovalForAll error',)
      }
    });

    const { data: approveData, write: approveWrite } = useContractWrite(approvalConfig);
  
    const data = bondApproved ? exchangeData : approveData
    const write = bondApproved ? exchangeWrite : approveWrite
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        toast.success("Your transaction was successful",{
          action: {
            label: "View",
            onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
          },
        });
        if (bondApproved) {
          setTimeout(() => {
            setNeedsVestingPosition(true)
          }, 3000);
        } else {
          refetchBondApproval();
        }
      },
      onError() {
        toast.error("Your transaction failed",{
          action: {
            label: "View",
            onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
          },
        });
      },
    });

    useEffect(() => {
      if(isLoading) {
        toast.loading("Your transaction is being confirmed...",{
          action: {
            label: "View",
            onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
          },
        });
      }
    }, [isLoading]);

    return (
      <>
        <button
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-[4px]  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => write?.()}
          disabled={bondBalance?.eq(BN_ZERO)}
        >
          {bondBalance?.eq(BN_ZERO) ?
            "BOND BALANCE EMPTY"
            : (!bondApproved ? "APPROVE VEST" : "VEST MY FIN")}
        </button>
      </>
    );
  }
  