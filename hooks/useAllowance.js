import { useAccount, useContractRead, useWaitForTransaction } from "wagmi";
import { erc20ABI } from "wagmi";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { ConnectWalletButton } from "../components/Buttons/ConnectWalletButton";
import CoverMintButton from "../components/Buttons/CoverMintButton";
import CoverBurnButton from "../components/Buttons/CoverBurnButton";
import CoverApproveButton from "../components/Buttons/CoverApproveButton";
import useInputBox from "../hooks/useInputBox";

export default function useAllowance(address, isConnected, isDisconnected) { 
  const [dataState, setDataState] = useState();
  const tokenOneAddress = "0xa9bAd443855B62E21BeF630afCdBa59a58680997";
  const GOERLI_CONTRACT_ADDRESS = "0x87B4784C1a8125dfB9Fb16F8A997128f346f5B13";
  
  const { data, onSuccess } = useContractRead({
    address: tokenOneAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, GOERLI_CONTRACT_ADDRESS],
    chainId: 5,
    onSuccess(data) {
      console.log("Success", data);
      console.log(ethers.utils.formatUnits(data, 18));
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },
  }, []);

  useEffect(() => {
    setDataState(data?._hex);
  }, []);
  
  return [dataState];

}



    
