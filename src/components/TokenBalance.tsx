import useTokenBalance from "../hooks/useTokenBalance";

export default function TokenBalance(tokenAddress) {
    let balance;
    if (tokenAddress == "") balance = "0.00";
    const [tokenBalanceBox, tokenBalanceInfo] = useTokenBalance(tokenAddress);
    balance = tokenBalanceInfo;
    return balance;
}