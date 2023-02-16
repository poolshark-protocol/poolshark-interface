import { useAccount, useProvider } from "wagmi";
import useInputBox from "../../hooks/useInputBox";
import { chainIdsToNamesForGitTokenList } from "../../utils/chains";

export default function MaxButton(balance0) {
    const [maxBalance] = useInputBox();

    const { isConnected } = useAccount();

    const {
        network: { chainId }, chainId: chainIdFromProvider
      } = useProvider();
    
    const chainName = chainIdsToNamesForGitTokenList[chainId]

    if (isConnected && chainName === "goerli") {
        return (
            <button
                className="flex text-xs uppercase text-[#C9C9C9]"
                onClick={() => maxBalance(balance0, "0")}
            >
                Max
            </button>
        )
    }
}