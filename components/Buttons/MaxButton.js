import useInputBox from "../../hooks/useInputBox";

export default function MaxButton(balance) {
    const [maxBalance] = useInputBox();

    return (
        <button
            className="flex text-xs uppercase text-[#C9C9C9]"
            onClick={() => maxBalance(balance, "0")}
        >
            Max
        </button>
    )
}