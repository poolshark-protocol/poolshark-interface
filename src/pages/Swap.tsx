import {
  AdjustmentsHorizontalIcon,
  ArrowSmallDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon, ArrowPathIcon } from "@heroicons/react/20/solid";
import SelectToken from "../components/SelectToken";
import SwapButton from "../components/Buttons/SwapButton";
import useInputBox from "../hooks/useInputBox";
import useAllowance from "../hooks/useAllowance";
import { ConnectWalletButton } from "../components/Buttons/ConnectWalletButton";
import CoverApproveButton from "../components/Buttons/CoverApproveButton";
import { useAccount } from "wagmi";
import {
  coverPoolAddress,
  tokenOneAddress,
} from "../constants/contractAddresses";
import TokenBalance from "../components/TokenBalance";
import { useProvider } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { chainIdsToNamesForGitTokenList } from "../utils/chains";
import { coverPoolABI } from "../abis/evm/coverPool";
import { fetchPrice } from "../utils/queries";

export default function Swap() {
  const { address, isDisconnected, isConnected } = useAccount();
  const { bnInput, inputBox, maxBalance } = useInputBox();
  const allowance = useAllowance(address);
  const [hasSelected, setHasSelected] = useState(false);
  const [mktRate, setMktRate] = useState({});
  const [queryToken0, setQueryToken0] = useState(tokenOneAddress);
  const [queryToken1, setQueryToken1] = useState(tokenOneAddress);

  const [tokenIn, setToken0] = useState({
    symbol: "ETH",
    logoURI: "/static/images/eth_icon.png",
    address: "0x7024879Eda80577Cbc0Cb039ad3c7081f38ABb41"
  });
  const [tokenOut, setToken1] = useState({
    symbol: "Select Token",
    logoURI: "",
    address: ""
  });

  const balanceZero = TokenBalance(tokenIn.address);
  const balanceOne = TokenBalance(tokenOut.address);

  const [balance0, setBalance0] = useState("");
  const [balance1, setBalance1] = useState("0.00");
  const [stateChainName, setStateChainName] = useState();

  const {
    network: { chainId },
  } = useProvider();

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId]);
  }, [chainId]);

  useEffect(() => {
    if (isConnected && stateChainName === "arbitrumGoerli") {
      if (Number(balanceZero().props.children[1]) >= 1000000) {
        setBalance0(Number(balanceZero().props.children[1]).toExponential(5));
      }
      setBalance0(Number(balanceZero().props.children[1]).toFixed(2));
    }
  }, [queryToken0, balanceZero]);

  useEffect(() => {
    if (isConnected && stateChainName === "arbitrumGoerli") {
      if (Number(balanceOne().props.children[1]) >= 1000000) {
        setBalance1(Number(balanceOne().props.children[1]).toExponential(5));
      }
      setBalance1(Number(balanceOne().props.children[1]).toFixed(2));
    }
  }, [queryToken1, balanceOne]);

  function changeDefault0(token) {
    if (token.symbol === tokenOut.symbol) {
      return;
    }
    setToken0(token);
  }

  const [tokenOrder, setTokenOrder] = useState(true);

  const changeDefault1 = (token) => {
    if (token.symbol === tokenIn.symbol) {
      return;
    }
    setToken1(token);
    setHasSelected(true);
  };

  let [isOpen, setIsOpen] = useState(false);
  const [LimitActive, setLimitActive] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function switchDirection() {
    setTokenOrder(!tokenOrder);
    const temp = tokenIn;
    setToken0(tokenOut);
    setToken1(temp);
    const tempBal = queryToken0;
    setQueryToken0(queryToken1);
    setQueryToken1(tempBal);
    setMktRate({eth: mktRate["usdc"], usdc: mktRate["eth"]})
  }

  function openModal() {
    setIsOpen(true);
  }

  const [expanded, setExpanded] = useState(false);

  // const getAllowance = async () => {
  //  let provider = new ethers.providers.JsonRpcProvider(`https://rpc.ankr.com/eth_arbitrumGoerli`)
  //  const signer = new ethers.VoidSigner(address, provider)
  //   const contract = new ethers.Contract(tokenOneAddress,TokenOneAbi,signer)
  //   const allowance = await contract.allowance(tokenOneAddress,coverPoolAddress)
  // //  setAllowance(signer)
  // console.log("here", allowance.toNumber())
  // }

  const gasEstimate = async () => {
    const provider = new ethers.providers.JsonRpcProvider("https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594");
    const contract = new ethers.Contract(
      coverPoolAddress,
      coverPoolABI,
      provider
    );
    const recipient = address;
    const zeroForOne = (tokenOut.address != "") && (tokenIn.address < tokenOut.address);
    // const priceLimit = 
    const estimation = await contract.estimateGas.swap(
      recipient,
      zeroForOne,
      bnInput,
      BigNumber.from("79228162514264337593543950336") // price of 1.00
    );
    console.log('test estimate gas:', ethers.utils.formatEther(estimation));
  };

  useEffect(() => {
    fetchTokenPrice();
  }, []);

  useEffect(() => {
    gasEstimate();
  }, []);

  const fetchTokenPrice = async () => {
    try {
      const price = await fetchPrice("0x000");
      setMktRate({
        eth: "~" + Number(
          price["data"]["bundles"]["0"]["ethPriceUSD"]
        ).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }),
        usdc: "~1.00"
      });
    } catch (error) {
      console.log(error);
    }
  };

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
    <div className="pt-[10vh]">
      <div className="flex flex-col w-full md:max-w-md px-6 pt-5 pb-7 mx-auto bg-black border border-grey2 rounded-xl">
        <div className="flex items-center">
          <div className="flex gap-4 mb-1.5 text-sm">
            <div
              onClick={() => setLimitActive(false)}
              className={`${
                LimitActive
                  ? "text-grey cursor-pointer"
                  : "text-white cursor-pointer"
              }`}
            >
              Swap
            </div>
            <div
              onClick={() => setLimitActive(true)}
              className={`${
                LimitActive
                  ? "text-white cursor-pointer"
                  : "text-grey cursor-pointer"
              }`}
            >
              Limit
            </div>
          </div>
          <div className="ml-auto">
            <Popover className="relative">
              <Popover.Button className="outline-none">
                <AdjustmentsHorizontalIcon className="w-5 h-5 outline-none" />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Popover.Panel className="absolute z-10 ml-14 -mt-[48px] bg-black border border-grey2 rounded-xl p-5">
                  <div className="w-full">
                    <h1>Slippage Tolerance</h1>
                    <div className="flex mt-3 gap-x-3">
                      <input
                        placeholder="0%"
                        className="bg-dark rounded-xl outline-none border border-grey1 pl-3 placeholder:text-grey1"
                      />
                      <button className=" w-full py-2.5 px-12 mx-auto text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
                        Auto
                      </button>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          </div>
        </div>
        <div className="w-full mt-4 align-middle items-center flex bg-dark border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            {inputBox("0")}
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C]">{mktRate["eth"]}</div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
                  <SelectToken
                    index="0"
                    selected={hasSelected}
                    tokenChosen={changeDefault0}
                    displayToken={tokenIn}
                    balance={setQueryToken0}
                    key={queryToken0}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="flex text-xs text-[#4C4C4C]">
                    Balance: {balance0 === "NaN" ? 0 : balance0}
                  </div>
                  {isConnected && stateChainName === "arbitrumGoerli" ? (
                    <button
                      className="flex text-xs uppercase text-[#C9C9C9]"
                      onClick={() => maxBalance(balance0, "0")}
                    >
                      Max
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="items-center -mb-2 -mt-2 p-2 m-auto border border-[#1E1E1E] z-30 bg-black rounded-lg cursor-pointer">
          <ArrowSmallDownIcon
            className="w-4 h-4"
            onClick={() => {
              if (hasSelected) {
                switchDirection()
              }
             
            }}
          />
        </div>

        <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
          <div className="flex-col justify-center w-1/2 p-2 ">
            <input
              className=" bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
              placeholder="0"
            />
            <div className="flex">
              <div className="flex text-xs text-[#4C4C4C] ">{mktRate["usdc"]}</div>
            </div>
          </div>
          <div className="flex w-1/2">
            <div className="flex justify-center ml-auto">
              <div className="flex-col">
                <div className="flex justify-end">
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
                {hasSelected ? (
                  <div className="flex items-center justify-end gap-2 px-1 mt-2">
                    <div className="flex text-xs text-[#4C4C4C]">
                      Balance: {balanceOne}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
        {LimitActive ? (
          <div>
            <div className="w-full align-middle items-center flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl mt-4">
              <div className="flex-col justify-center w-1/2 p-2 ">
                {inputBox("1.90")}
                <div className="flex">
                  <div className="flex text-xs text-[#4C4C4C]">
                    98% above Market Price
                  </div>
                </div>
              </div>
              <div className="flex w-1/2">
                <div className="flex justify-center ml-auto">
                  <div className="flex-col">
                    <div className="flex justify-end">
                      {tokenOrder ? (
                        <button
                          className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                          onClick={() => setTokenOrder(false)}
                        >
                          {tokenIn.symbol} per {tokenOut.symbol}
                          <ArrowPathIcon className="w-5" />
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                          onClick={() => setTokenOrder(true)}
                        >
                          {tokenOut.symbol} per {tokenIn.symbol}
                          <ArrowPathIcon className="w-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 px-1 mt-2">
                      <div className="text-xs text-white">
                        Set to Market Price
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="py-4">
          <div
            className="flex px-2 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex-none text-xs uppercase text-[#C9C9C9]">
              1 {tokenIn.symbol} =
              {tokenOut.symbol === "Select Token" ? " ?" : " " + mktRate["eth"] + " " + tokenOut.symbol}
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
        {isDisconnected ? <ConnectWalletButton /> : null}
        {isDisconnected ? null : allowance === "0.0" &&
          stateChainName === "arbitrumGoerli" ? (
          <CoverApproveButton address={address} />
        ) : stateChainName === "arbitrumGoerli" ? (
          <SwapButton amount={bnInput} />
        ) : null}
      </div>
    </div>
  );
}
