import { useEffect, useState } from "react";
import useTokenBalance from "../hooks/useTokenBalance";

export default function TokenBalance(tokenAddress:string) {
    const [test, setTest] = useState({} as any)
    let balance: string;
    if (tokenAddress == "") balance = "0.00";
    useEffect(() => {
        const [tokenBalanceBox, tokenBalanceInfo] = useTokenBalance(tokenAddress);
        setTest(tokenBalanceInfo)
    },[])

    console.log(test().props.children[1])
    if (Number(test().props.children[1]) >= 1000000) {
        return Number(test().props.children[1]).toExponential(5);
      }
      return Number(test().props.children[1]).toFixed(2)

}