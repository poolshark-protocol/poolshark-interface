import useTokenBalance from "../hooks/useTokenBalance";

export default function TokenBalance(tokenAddress) {

const [tokenBalanceBox, tokenBalanceInfo] = useTokenBalance(tokenAddress);
const balance = tokenBalanceInfo;
return balance;

}