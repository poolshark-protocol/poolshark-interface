import {
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
} from "@heroicons/react/20/solid";
import SelectToken from "../SelectToken";
import { erc20ABI, useAccount, useBalance, useProvider } from "wagmi";
import CoverMintButton from "../Buttons/CoverMintButton";
import CoverApproveButton from "../Buttons/CoverApproveButton";
import CoverBurnButton from "../Buttons/CoverBurnButton";
import CoverCollectButton from "../Buttons/CoverCollectButton";
import { chainIdsToNamesForGitTokenList } from "../../utils/chains";
import { ConnectWalletButton } from "../Buttons/ConnectWalletButton";
import { useState, useEffect } from "react";
import useInputBox from "../../hooks/useInputBox";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../../constants/contractAddresses";
import { coverPoolAddress } from "../../constants/contractAddresses";
import { TickMath } from "../../utils/tickMath";
import { ethers } from "ethers";
import { useStore } from "../../hooks/useStore";
import {
  getPreviousTicksLower,
  getPreviousTicksUpper,
} from "../../utils/queries";
import JSBI from "jsbi";
import { erc20 } from "../../abis/evm/erc20";
import useAllowance from "../../hooks/useAllowance";

export default function CreateCover(props: any) {
  const [expanded, setExpanded] = useState(false);
  const { bnInput, inputBox } = useInputBox();
  const [stateChainName, setStateChainName] = useState();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [updateContractParams, updateCoverAllowance, CoverAllowance, contractParams] =
    useStore((state: any) => [
      state.updateContractParams,
      state.updateCoverAllowance,
      state.CoverAllowance,
      state.contractParams,
    ]);

  async function setParams() {
    try {
      if (
        minPrice !== undefined &&
        minPrice !== "" &&
        maxPrice !== undefined &&
        maxPrice !== "" &&
       Number(ethers.utils.formatUnits(bnInput)) !== 0 &&
        hasSelected == true
      ) {
        const min = TickMath.getTickAtSqrtRatio(
          JSBI.divide(
            JSBI.multiply(
              JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96)),
              JSBI.BigInt(
                String(
                  Math.sqrt(Number(parseFloat(minPrice).toFixed(30))).toFixed(
                    30
                  )
                )
                  .split(".")
                  .join("")
              )
            ),
            JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(30))
          )
        );
        const max = TickMath.getTickAtSqrtRatio(
          JSBI.divide(
            JSBI.multiply(
              JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96)),
              JSBI.BigInt(
                String(
                  Math.sqrt(Number(parseFloat(maxPrice).toFixed(30))).toFixed(
                    30
                  )
                )
                  .split(".")
                  .join("")
              )
            ),
            JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(30))
          )
        );
        const data = await getPreviousTicksLower(
          tokenIn["address"],
          tokenOut["address"],
          min
        );
        const data1 = await getPreviousTicksUpper(
          tokenIn["address"],
          tokenOut["address"],
          max
        );
        updateContractParams({
          prevLower: ethers.utils.parseUnits(
            data["data"]["ticks"][0]["index"],
            0
          ),
          min: ethers.utils.parseUnits(String(min), 0),
          prevUpper: ethers.utils.parseUnits(
            data1["data"]["ticks"][0]["index"],
            0
          ),
          max: ethers.utils.parseUnits(String(max), 0),
          claim: ethers.utils.parseUnits(String(min), 0),
          amount: bnInput,
          inverse: false,
        });
        setDisabled(false)
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setParams();
  }, [minPrice, maxPrice, bnInput]);

  const {
    network: { chainId },
  } = useProvider();

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId]);
  }, [chainId]);

  const { address, isConnected, isDisconnected } = useAccount();

  const [isDisabled, setDisabled] = useState(true);
  const [hasSelected, setHasSelected] = useState(false);
  const [queryToken0, setQueryToken0] = useState(tokenOneAddress);
  const [queryToken1, setQueryToken1] = useState(tokenOneAddress);

  const [tokenIn, setToken0] = useState({
    symbol: "TOKEN20A",
    logoURI:
      "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
    address: "0x8fa1fdd860e3c56dafd09a048ffda4965376945e",
  });
  const [tokenOut, setToken1] = useState({
    symbol: "Select Token",
    logoURI: undefined,
    address: "0xc3a0736186516792c88e2c6d9b209471651aa46e",
  });

  const [usdcBalance, setUsdcBalance] = useState(0);
  const [amountToPay, setAmountToPay] = useState(0);
  const [prices, setPrices] = useState({ tokenIn: 0, tokenOut: 0 });

  const tokenInAllowance = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://arb-goerli.g.alchemy.com/v2/M8Dr_KQx46ghJ93XDQe7j778Qa92HRn2/"
    );
    const contract = new ethers.Contract(tokenIn.address, erc20, provider);
    const allowance = await contract.allowance(address, coverPoolAddress);
    return ethers.utils.formatUnits(allowance);
  };

  const { data, isError, isLoading } = useBalance({
    token: `0x${tokenIn.address.split("0x")[1]}`,
    chainId: 421613,
    address: address,
    onSuccess: () => {
      setUsdcBalance(Number(data?.formatted))
    },
    onError: (error) => {
      console.log(error);
    },
  });

  /*const balanceAndAllowance = async () => {
    updateAllowance(await token0Allowance());
  };

  useEffect(() => {
    try {
      balanceAndAllowance();
    } catch (error) {
      console.log(error);
    }
  }, []);*/

  function changeDefault0(token: {
    symbol: string;
    logoURI: any;
    address: string;
  }) {
    if (token.symbol === tokenOut.symbol || token.address === tokenOut.address) {
      return;
    }
    console.log(token)
    setToken0(token);
  }

  const [tokenOrder, setTokenOrder] = useState(true);

  const newAllowance = useAllowance(address);

  const changeDefault1 = (token:{
    symbol: string;
    logoURI: any;
    address: string;
  }) => {
    if (token.symbol === tokenIn.symbol || token.address === tokenIn.address) {
      return;
    }
    console.log(token)
    setToken1(token);
    setHasSelected(true);
    setDisabled(false);
  };

  const handleValueChange = () => {
    if (
      (document.getElementById("input") as HTMLInputElement).value === undefined
    ) {
      return;
    }
    const current = document.getElementById("input") as HTMLInputElement;
    setAmountToPay(Number(current.value));
  };

  const changePrice = (direction: string, minMax: string) => {
    if (direction === "plus" && minMax === "min") {
      if (
        (document.getElementById("minInput") as HTMLInputElement).value ===
        undefined
      ) {
        const current = document.getElementById("minInput") as HTMLInputElement;
        current.value = "1";
      }
      const current = Number(
        (document.getElementById("minInput") as HTMLInputElement).value
      );
      (document.getElementById("minInput") as HTMLInputElement).value = String(
        (current + 0.01).toFixed(3)
      );
    }
    if (direction === "minus" && minMax === "min") {
      const current = Number(
        (document.getElementById("minInput") as HTMLInputElement).value
      );
      if (current === 0 || current - 1 < 0) {
        (document.getElementById("minInput") as HTMLInputElement).value = "0";
        return;
      }
      (document.getElementById("minInput") as HTMLInputElement).value = (
        current - 0.01
      ).toFixed(3);
    }

    if (direction === "plus" && minMax === "max") {
      if (
        (document.getElementById("maxInput") as HTMLInputElement).value ===
        undefined
      ) {
        const current = document.getElementById("maxInput") as HTMLInputElement;
        current.value = "1";
      }
      const current = Number(
        (document.getElementById("maxInput") as HTMLInputElement).value
      );
      (document.getElementById("maxInput") as HTMLInputElement).value = (
        current + 0.01
      ).toFixed(3);
    }
    if (direction === "minus" && minMax === "max") {
      const current = Number(
        (document.getElementById("maxInput") as HTMLInputElement).value
      );
      if (current === 0 || current - 1 < 0) {
        (document.getElementById("maxInput") as HTMLInputElement).value = "0";
        return;
      }
      (document.getElementById("maxInput") as HTMLInputElement).value = (
        current - 0.01
      ).toFixed(3);
    }
  };

  // useEffect(() => {
  // if ()

  //   },[bnInput, (document.getElementById('minInput') as HTMLInputElement)?.value, (document.getElementById('maxInput') as HTMLInputElement)?.value])

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
          <span
            className="flex gap-x-1 cursor-pointer"
            onClick={() => props.goBack("initial")}
          >
            <ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " />{" "}
            <h1 className="mb-3 opacity-50">Back</h1>{" "}
          </span>
        </div>

        <div className="flex gap-x-4 items-center">
          <SelectToken
            index="0"
            tokenChosen={changeDefault0}
            displayToken={tokenIn}
            balance={setQueryToken0}
            key={queryToken0}
          />
          <ArrowLongRightIcon className="w-6" />
          {hasSelected ? (
            <SelectToken
              index="1"
              selected={hasSelected}
              tokenChosen={changeDefault1}
              displayToken={tokenOut}
              balance={setQueryToken1}
              key={queryToken1}
            />
          ) : (
            <SelectToken
              index="1"
              selected={hasSelected}
              tokenChosen={changeDefault1}
              displayToken={tokenOut}
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
                    <img className="w-7" src={tokenIn.logoURI} />
                    {tokenIn.symbol}
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
          <div>
            {usdcBalance} {tokenIn.symbol}
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Amount to pay</div>
          <div>
            {amountToPay} {tokenIn.symbol}
          </div>
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
              onChange={() =>
                setMinPrice(
                  (document.getElementById("minInput") as HTMLInputElement)
                    ?.value
                )
              }
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "min")}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <span className="text-xs text-grey">
            {tokenIn.symbol} per{" "}
            {tokenOut.symbol === "SELECT TOKEN" ? "?" : tokenOut.symbol}
          </span>
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
              onChange={() =>
                setMaxPrice(
                  (document.getElementById("maxInput") as HTMLInputElement)
                    ?.value
                )
              }
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice("plus", "max")}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <span className="text-xs text-grey">
            {tokenIn.symbol} per{" "}
            {tokenOut.symbol === "SELECT TOKEN" ? "?" : tokenOut.symbol}
          </span>
        </div>
      </div>
      <div className="py-4">
        <div
          className="flex px-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
            {prices.tokenIn} {tokenIn.symbol} ={" "}
            {tokenOut.symbol === "Select Token"
              ? "?"
              : prices.tokenOut + " " + tokenOut.symbol}
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
      <div className="mb-3" key={newAllowance}>
        {isConnected &&
       newAllowance === 0.0 &&
        stateChainName === "arbitrumGoerli" ? (
          <CoverApproveButton address={tokenZeroAddress} />
        ) : stateChainName === "arbitrumGoerli" ? (
          <CoverMintButton disabled={isDisabled} />
        ) : null}
      </div>
      <div className="space-y-3">
        {isDisconnected ? null : stateChainName === "arbitrumGoerli" ? (
          <CoverBurnButton address={address} />
        ) : null}
        {isDisconnected ? null : stateChainName === "arbitrumGoerli" ? (
          <CoverCollectButton address={address} />
        ) : null}
        {/*TO-DO: add positionOwner ternary again*/}
      </div>
    </>
  );
}

//Line 265 after is connected
//&& dataState === "0x00"

//Make lines 303 - 305 ynamic and pull from current selected token
