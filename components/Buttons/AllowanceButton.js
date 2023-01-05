import { useAccount, useContractRead, useWaitForTransaction } from "wagmi";
import { erc20ABI } from "wagmi";
import { ethers } from "ethers";
import CoverApproveButton from "./CoverApproveButton";
import CoverMintButton from "./CoverMintButton";

export default function AllowanceButton() { 
    const { address, isConnected } = useAccount();

    const tokenOneAddress = "0xa9bAd443855B62E21BeF630afCdBa59a58680997";
    const GOERLI_CONTRACT_ADDRESS = "0x87B4784C1a8125dfB9Fb16F8A997128f346f5B13";

    const { data, onSuccess } = useContractRead({
      address: tokenOneAddress,
      abi: erc20ABI,
      functionName: "allowance",
      watch: true,
      args: [address, GOERLI_CONTRACT_ADDRESS],
      chainId: 5,
      onSuccess(data) {
        console.log("Success", data);
        console.log(ethers.utils.formatUnits(data, 18));
        console.log(data._hex);
      },
      onError(error) {
        console.log("Error", error);
      },
      onSettled(data, error) {
        console.log("Settled", { data, error });
      },
    });

    const {isError, isLoading} = useWaitForTransaction({
      hash: data?.hash,
      onSettled(data, error) {
        console.log("Settled", { data, error });
      },
    });

    const buttonState = () => {
      if (isError) {
        return(<></>)
      } else {
        if (data._hex == "0x00") {
              return <CoverApproveButton />;
            } else {
              return <CoverMintButton />;
            }
      }
    }
    
    return (buttonState)

  }


    
