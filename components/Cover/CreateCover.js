import {
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/20/solid";
import SelectToken from "../SelectToken";
import { useAccount } from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import CoverApproveButton from "../Buttons/CoverApproveButton";
import { useState, useEffect } from "react";
// import useAllowance from "../../hooks/useAllowance";
import useInputBox from "../../hooks/useInputBox";
import { tokenOneAddress } from "../../constants/contractAddresses";
import TokenBalance from "../TokenBalance";

export default function CreateCover() {
  const [expanded, setExpanded] = useState();
  const [bnInput, inputBox] = useInputBox();

  const { address, isConnected, isDisconnected } = useAccount();
  const [hasSelected, setHasSelected] = useState(false);
  const [queryToken0, setQueryToken0] = useState(tokenOneAddress);
  const [queryToken1, setQueryToken1] = useState(tokenOneAddress);

  const [token0, setToken0] = useState({
    symbol: "USDC",
    logoURI:
      "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  });
  const [token1, setToken1] = useState({
    symbol: "SELECT TOKEN",
  });
  const collateralBalance = TokenBalance(tokenOneAddress)
  const balanceZero = TokenBalance(queryToken0);
  const balanceOne = TokenBalance(queryToken1);

  const [usdcBalance, setUsdcBalance] = useState();
  const [balance0, setBalance0] = useState();
  const [balance1, setBalance1] = useState();
  const [amountToPay, setAmountToPay] = useState(0);

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
      setUsdcBalance(Number(collateralBalance().props.children[1]).toExponential(5));
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
  };

  const handleValueChange = () => {
      if (document.getElementById("input").value === undefined) {
        return;
      }
      const current = document.getElementById("input");
        setAmountToPay(Number(current.value))
    }

  const changePrice = (direction, minMax) => {
    if (direction === "plus" && minMax === "min") {
      if (document.getElementById("minInput").value === undefined) {
        const current = document.getElementById("minInput");
        current.value = 1;
      }
      const current = Number(document.getElementById("minInput").value)
      document.getElementById("minInput").value = current + 1;
    }
    if (direction === "minus" && minMax === "min") {
      const current = Number(document.getElementById("minInput").value);
      if (current === 0) {
        return;
      }
      document.getElementById("minInput").value = current - 1;
    }

    if (direction === "plus" && minMax === "max") {
      if (document.getElementById("maxInput").value === undefined) {
        const current = document.getElementById("maxInput");
        current.value = 1;
      }
      const current = Number(document.getElementById("maxInput").value)
      document.getElementById("maxInput").value = current + 1;
    }
    if (direction === "minus" && minMax === "max") {
      const current = Number(document.getElementById("maxInput").value);
      if (current === 0) {
        return;
      }
      document.getElementById("maxInput").value = current - 1;
    }
  };

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

  return (
    <>
      <div className="mb-6">
        <h1 className="mb-3">Select Pair</h1>
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
                    <img className="w-7" src="/static/images/token.png" />
                    USDC
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
          <div>{usdcBalance} USDC</div>
        </div>
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Amount to pay</div>
          <div>{amountToPay} USDC</div>
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
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "min")}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <span className="text-xs text-grey">USDC per DAI</span>
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
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "max")}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <span className="text-xs text-grey">USDC per DAI</span>
        </div>
      </div>
      <div className="py-4">
        <div
          className="flex px-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
            1 USDC = 1 DAI
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
      <div className="space-y-3">
        {isDisconnected ? <ConnectWalletButton /> : null}

        {isDisconnected ? null : isConnected ? (
          <CoverApproveButton address={address} amount={bnInput} />
        ) : (
          <CoverMintButton address={address} amount={bnInput} />
        )}
      </div>
    </>
  );
}

//Line 265 after is connected
//&& dataState === "0x00"
