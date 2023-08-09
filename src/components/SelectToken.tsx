import { Fragment, useState, useEffect } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Transition, Dialog } from "@headlessui/react";
import {
  tokenZeroAddress,
  tokenOneAddress,
} from "../constants/contractAddresses";
import useTokenList from "../hooks/useTokenList";
import CoinListButton from "./Buttons/CoinListButton";
import CoinListItem from "./CoinListItem";
import { useAccount, useBalance, useProvider } from "wagmi";
import { chainIdsToNamesForGitTokenList } from "../utils/chains";
import axios from "axios";
import { coinsList } from "../utils/types";

export default function SelectToken(props) {
  const { address } = useAccount();
  const {
    network: { chainId },
  } = useProvider();

  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const coins = useTokenList() as coinsList;

  useEffect(() => {
    //iterate coind and add balance field
    if (coins?.listed_tokens ) {
      coins.listed_tokens.forEach((coin) => {
        coin.balance = Number(
          useBalance({
            address: address,
            token: coin?.id,
            chainId: 421613,
            watch: true,
          }).data?.formatted
        );
      });
    }
  }, [coins]);

  /* const [rawCoinList, setRawCoinList] = useState([
    {
      name: "WETH",
      address: tokenOneAddress,
      symbol: "WETH",
      logoURI: "/static/images/eth_icon.png",
      decimals: 18,
      balance: Number(
        useBalance({
          address: address,
          token: tokenOneAddress,
          chainId: 421613,
          watch: true,
        }).data?.formatted
      ),
    },
    {
      name: "USDC",
      address: tokenZeroAddress,
      symbol: "USDC",
      logoURI: "/static/images/token.png",
      decimals: 18,
      balance: Number(
        useBalance({
          address: address,
          token: tokenZeroAddress,
          chainId: 421613,
          watch: true,
        }).data?.formatted
      ),
    },
  ]); */

  const chooseToken = (coin) => {
    coin = {
      name: coin?.name,
      address: coin?.address, //@dev use id for address in production like so address: coin?.id because thats what coin [] will have instead of address
      symbol: coin?.symbol,
      logoURI: coin?.logoURI,
    };
    if (props.type === "in") {
      props.setTokenIn(props.tokenOut, {
        name: coin?.name,
        address: coin?.address,
        symbol: coin?.symbol,
        logoURI: coin?.logoURI,
      });
    } else {
      props.setTokenOut(props.tokenIn, {
        name: coin?.name,
        address: coin?.address,
        symbol: coin?.symbol,
        logoURI: coin?.logoURI,
      });
    }
    closeModal();
  };

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div className="w-full">
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-black border border-grey2 text-left align-middle shadow-xl transition-all">
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-white">Select Token</h1>
                      <XMarkIcon
                        onClick={() => setIsOpen(false)}
                        className="w-6 text-white cursor-pointer"
                      />
                    </div>
                    <MagnifyingGlassIcon className="w-5 text-white absolute mt-[13px] ml-[14px] text-grey" />
                    <input
                      autoComplete="off"
                      className="border border-grey2 bg-dark outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white md:text-base text-sm"
                      placeholder="Search name or paste address"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                    ></input>
                    <div className="flex justify-between flex-wrap mt-4 gap-y-2">
                      {coins?.map((coin) => {
                        return (
                          <CoinListButton
                            key={coin.symbol + "top"}
                            coin={coin}
                            chooseToken={chooseToken}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    {coins
                      .sort((a, b) => b.balance - a.balance)
                      .map((coin) => {
                        return (
                          <CoinListItem
                            key={coin.symbol}
                            coin={coin}
                            chooseToken={chooseToken}
                          />
                        );
                      })}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <button
        onClick={() => openModal()}
        className={
          (props.tokenIn.symbol != "Select Token" && props.type == "in") ||
          (props.tokenOut.symbol != "Select Token" && props.type == "out")
            ? "w-full md:text-base text-sm whitespace-nowrap flex items-center uppercase gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
            : "w-full md:text-base text-sm whitespace-nowrap flex items-center bg-background text-main gap-x-1 md:gap-x-3 hover:opacity-80  md:px-4 px-3 py-2 rounded-xl"
        }
      >
        <div className="flex items-center gap-x-2 w-full">
          {(props.tokenIn.symbol != "Select Token" && props.type == "in") ||
          (props.tokenOut.symbol != "Select Token" && props.type == "out") ? (
            <img className="md:w-7 w-6" src={props.displayToken?.logoURI} />
          ) : (
            <></>
          )}
          {props.displayToken?.symbol}
        </div>
        <ChevronDownIcon className="w-5" />
      </button>
    </div>
  );
}
