import {
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
} from "@heroicons/react/20/solid";
import SelectToken from "../SelectToken";
import { useAccount, useProvider } from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import CoverApproveButton from "../Buttons/CoverApproveButton";
import CoverBurnButton from "../Buttons/CoverBurnButton";
import CoverCollectButton from "../Buttons/CoverCollectButton";
import { chainIdsToNamesForGitTokenList } from "../../utils/chains";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import { useState, useEffect } from "react";
import useAllowance from "../../hooks/useAllowance";
import useInputBox from "../../hooks/useInputBox";
import { tokenOneAddress } from "../../constants/contractAddresses";
import TokenBalance from "../TokenBalance";

export default function CreateCover(props:any) {
  const [expanded, setExpanded] = useState(false);
  const {bnInput, inputBox} = useInputBox();
  const [stateChainName, setStateChainName] = useState();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  const {
    network: { chainId }
  } = useProvider();

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId])
  }, [chainId])
  
  const { 
    address,
    isConnected, 
    isDisconnected 
  } = useAccount();
  
  const [isDisabled, setDisabled] = useState(true);
  const [hasSelected, setHasSelected] = useState(false);
  const [queryToken0, setQueryToken0] = useState(tokenOneAddress);
  const [queryToken1, setQueryToken1] = useState(tokenOneAddress);

  const [token0, setToken0] = useState({
    symbol: "TOKEN20A",
    logoURI:
    "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
    address:"0xdcf62d25fd6ad48277989e93827fd9ccf650975f"
  });
  const [token1, setToken1] = useState({
    symbol: "Select Token",
  });
  const collateralBalance = TokenBalance(tokenOneAddress);
  const balanceZero = TokenBalance(queryToken0);
  const balanceOne = TokenBalance(queryToken1);

  const [usdcBalance, setUsdcBalance] = useState("");
  const [balance0, setBalance0] = useState("");
  const [balance1, setBalance1] = useState("");
  const [amountToPay, setAmountToPay] = useState(0);
  const [prices, setPrices] = useState({token0: 0, token1: 0});

  const allowance = useAllowance(address);
  // useEffect(() => {  
  // },[allowance])

//   async function getTokenPrices() {
//     //default 1/2
//     const data = await tickMath()
//     const price0 = (Number(data.data.ticks[0].price0)).toFixed(3)
//     const price1 = (Number(data.data.ticks[0].price1)).toFixed(3)
//     console.log({token0: price0, token1: price1})
//     setPrices({token0: price0, token1: price1})
//   }
//   useEffect(() => {
//   getTokenPrices();
// },
//   [])

  useEffect(() => {
    if (Number(balanceZero().props.children[1]) >= 1000000) {
      setBalance0(Number(balanceZero().props.children[1]).toExponential(5));
    }
    setBalance0(Number(balanceZero().props.children[1]).toFixed(2));
  }, [queryToken0, balanceZero]);

  useEffect(() => {
    if (Number(balanceOne().props.children[1]) >= 1000000) {
      setBalance1(Number(balanceOne().props.children[1]).toExponential(5));
    }
    setBalance1(Number(balanceOne().props.children[1]).toFixed(2));
  }, [queryToken1, balanceOne]);

  useEffect(() => {
    if (Number(collateralBalance().props.children[1]) >= 1000000) {
      setUsdcBalance(
        Number(collateralBalance().props.children[1]).toExponential(5)
      );
    }
    setUsdcBalance(Number(collateralBalance().props.children[1]).toFixed(2));
  }, [collateralBalance]);

  function changeDefault0(token) {
    if (token.symbol === token1.symbol) {
      return;
    }
    setToken0(token);
  }

  const [tokenOrder, setTokenOrder] = useState(true);

  const changeDefault1 = (token) => {
    if (token.symbol === token0.symbol) {
      return;
    }
    setToken1(token);
    setHasSelected(true);
    setDisabled(false);
  };

  const handleValueChange = () => {
    if ((document.getElementById("input") as HTMLInputElement).value === undefined) {
      return;
    }
    const current = document.getElementById("input") as HTMLInputElement;
    setAmountToPay(Number(current.value));
  };

  const changePrice = (direction:string, minMax:string) => {
    if (direction === "plus" && minMax === "min") {
      if ((document.getElementById("minInput")  as HTMLInputElement).value === undefined) {
        const current = (document.getElementById("minInput")  as HTMLInputElement);
        current.value = "1";
      }
      const current = Number((document.getElementById("minInput") as HTMLInputElement).value);
      (document.getElementById("minInput") as HTMLInputElement).value = String(current + 1);
    }
    if (direction === "minus" && minMax === "min") {
      const current = Number((document.getElementById("minInput") as HTMLInputElement).value);
      if (current === 0 || current - 1 < 0) {
       (document.getElementById("minInput") as HTMLInputElement).value = "0"
        return;
      }
      (document.getElementById("minInput") as HTMLInputElement).value = (current - 1).toFixed(3);
    }

    if (direction === "plus" && minMax === "max") {
      if ((document.getElementById("maxInput") as HTMLInputElement).value === undefined) {
        const current = document.getElementById("maxInput") as HTMLInputElement;
        current.value = "1";
      }
      const current = Number((document.getElementById("maxInput") as HTMLInputElement).value);
      (document.getElementById("maxInput") as HTMLInputElement).value = String(current + 1);
    }
    if (direction === "minus" && minMax === "max") {
      const current = Number((document.getElementById("maxInput") as HTMLInputElement).value);
      if (current === 0 || current - 1 < 0) {
        (document.getElementById("maxInput") as HTMLInputElement).value = "0"
        return;
      }
      (document.getElementById("maxInput") as HTMLInputElement).value = (current - 1).toFixed(3);
    }
  };


  useEffect(() => {
    },[bnInput, (document.getElementById('minInput') as HTMLInputElement)?.value, (document.getElementById('maxInput') as HTMLInputElement)?.value])

  // const [dataState, setDataState] = useAllowance(address);

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div className="ml-auto text-xs">300 DAI</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Price Impact</div>
            <div className="ml-auto text-xs">-0.12%</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Mininum recieved after slippage (0.50%)
            </div>
            <div className="ml-auto text-xs">299.92 DAI</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            <div className="ml-auto text-xs">-0.09$</div>
          </div>
        </div>
      );
    }
  };

  return isDisconnected ? (
    <>
    <h1 className="mb-5">Connect a Wallet</h1>
    <ConnectWalletButton />
    </>
  ) : (
    <>
      <div className="mb-6">
        <div className="flex flex-row justify-between">
        <h1 className="mb-3">Select Pair</h1>
        <span className="flex gap-x-1 cursor-pointer" onClick={() => props.goBack("initial")}><ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " /> <h1 className="mb-3 opacity-50">Back</h1> </span>
        </div>
        
        <div className="flex gap-x-4 items-center">
          <SelectToken
            index="0"
            tokenChosen={changeDefault0}
            displayToken={token0}
            balance={setQueryToken0}
            key={queryToken0}
          />
          <ArrowLongRightIcon className="w-6" />
          {hasSelected ? (
            <SelectToken
              index="1"
              selected={hasSelected}
              tokenChosen={changeDefault1}
              displayToken={token1}
              balance={setQueryToken1}
              key={queryToken1}
            />
          ) : (
            <SelectToken
              index="1"
              selected={hasSelected}
              tokenChosen={changeDefault1}
              displayToken={token1}
              balance={setQueryToken1}
            />
          )}
        </div>
      </div>
      <h1 className="mb-3">How much do you want to Cover?</h1>
      <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
        <div className="flex-col justify-center w-1/2 p-2 ">
          {inputBox("0", setAmountToPay)}
          <div className="flex text-xs text-[#4C4C4C]">~$1.00</div>
        </div>
        <div className="flex w-1/2">
          <div className="flex justify-center ml-auto">
            <div className="flex-col">
              <div className="flex justify-end">
                <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                  <div className="flex items-center gap-x-2 w-full">
                    <img className="w-7" src={token0.logoURI}/>
                    {token0.symbol}
                  </div>
                </button>
              </div>
              <div className="flex items-center justify-end gap-2 px-1 mt-2">
                <button className="text-xs uppercase cursor-default text-[#0C0C0C]">
                  Max
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Balance</div>
          <div>{usdcBalance} {token0.symbol}</div>
        </div>
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Amount to pay</div>
          <div>{amountToPay} {token0.symbol}</div>
        </div>
      </div>
      <h1 className="mb-3 mt-4">Set Price Range</h1>
      <div className="flex justify-between w-full gap-x-6">
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Min. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("minus", "min")}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="minInput"
              type="number"
              onChange={() => setMinPrice((document.getElementById('minInput') as HTMLInputElement)?.value)}
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "min")}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <span className="text-xs text-grey">{token0.symbol} per {token1.symbol === "SELECT TOKEN" ? "?": token1.symbol}</span>
        </div>
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Max. Price</span>
          <div className="flex justify-center items-center">
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("minus", "max")}>
                <MinusIcon className="w-5 h-5 ml-[2.5px]" />
              </button>
            </div>
            <input
              className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
              placeholder="0"
              id="maxInput"
              type="number"
              onChange={() => setMaxPrice((document.getElementById('maxInput') as HTMLInputElement)?.value)}
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "max")}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <span className="text-xs text-grey">{token0.symbol} per {token1.symbol === "SELECT TOKEN" ? "?": token1.symbol}</span>
        </div>
      </div>
      <div className="py-4">
        <div
          className="flex px-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
          {prices.token0} {token0.symbol} =  {token1.symbol === "Select Token" ? "?": prices.token1 + " " + token1.symbol}
          </div>
          <div className="ml-auto text-xs uppercase text-[#C9C9C9]">
            <button>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-wrap w-full break-normal transition ">
          <Option />
        </div>
      </div>
      <div className="mb-3" key={allowance}>
      { isConnected &&  (Number(allowance) <= amountToPay)  && stateChainName === "goerli" ? (
         <CoverApproveButton address={tokenOneAddress} amount={bnInput} />
        ) : stateChainName === "goerli" ? ( 
          <CoverMintButton disabled={isDisabled} token0={token0} token1={token1} amount={bnInput} MinInput={minPrice} MaxInput={maxPrice} />
       ) : null}
      </div>
      <div className="space-y-3">
        {isDisconnected ? null : stateChainName === "goerli" ? <CoverBurnButton address={address} /> : null}
        {isDisconnected ? null : stateChainName === "goerli" ? <CoverCollectButton address={address} /> : null}
        {/*TO-DO: add positionOwner ternary again*/}
      </div>
    </>
  );
}

//Line 265 after is connected
//&& dataState === "0x00"

//Make lines 303 - 305 ynamic and pull from current selected token