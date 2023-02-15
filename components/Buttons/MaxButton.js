import { useAccount } from "wagmi";
import useInputBox from "../../hooks/useInputBox";

export default function MaxButton() {
    const [maxBalance] = useInputBox();
    const { isConnected } = useAccount();

    if (isConnected) {
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