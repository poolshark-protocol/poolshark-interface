import { Fragment, useState, useEffect } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Transition, Dialog } from "@headlessui/react";
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
  const [rawCoinList, setRawCoinList] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const chainName = chainIdsToNamesForGitTokenList[chainId];
      axios
        .get(
          `https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/${
            chainName === undefined ? "ethereum" : "arbitrum-goerli"
          }/tokenlist.json`
        )
        .then(function (response) {
          const coins = {
            listed_tokens: response.data.listed_tokens,
            search_tokens: response.data.search_tokens,
          } as coinsList;
          for (let i = 0; i < coins.listed_tokens.length; i++) {
            coins.listed_tokens[i].address = coins.listed_tokens[i].id;
            setRawCoinList(coins.listed_tokens);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    fetch();
  }, [chainId, address]);

  const chooseToken = (coin) => {
    coin = {
      name: coin?.name,
      address: coin?.id,
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
                      {rawCoinList.map((coin) => {
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
                    {rawCoinList
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
            ? "w-full whitespace-nowrap flex items-center gap-x-8 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]"
            : "w-full whitespace-nowrap flex items-center gap-x-8 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] text-grey1"
        }
      >
        <div className="flex items-center gap-x-2 w-full">
          {(props.tokenIn.symbol != "Select Token" && props.type == "in") ||
          (props.tokenOut.symbol != "Select Token" && props.type == "out") ? (
            <img className="md:w-6 w-6" src={props.displayToken?.logoURI} />
          ) : (
            <></>
          )}
          <span className="text-xs uppercase">{props.displayToken?.symbol}</span>
        </div>
        <ChevronDownIcon className="w-6" />
      </button>
    </div>
  );
}
