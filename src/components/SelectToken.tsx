import { Fragment, useState, useEffect } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Transition, Dialog } from "@headlessui/react";
import CoinListButton from "./Buttons/CoinListButton";
import CoinListItem from "./CoinListItem";
import { useAccount, useToken } from "wagmi";
import { chainIdsToNamesForGitTokenList } from "../utils/chains";
import axios from "axios";
import { coinsList } from "../utils/types";
import { useConfigStore } from "../hooks/useConfigStore";
import { defaultTokenLogo } from "../utils/tokens";

export default function SelectToken(props) {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [displayTokenList, setDisplayTokenList] = useState([]);
  const [listedTokenList, setListedTokenList] = useState([]);
  const [searchTokenList, setSearchTokenList] = useState([]);
  const [tokenInfo, setTokenInfo] = useState(undefined);

  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  const { data: tokenData, isError, isLoading, refetch: refetchTokenInfo } = useToken({
    address: customInput as `0x${string}`,
    onSuccess() {
      setTokenInfo(tokenData)
    },
  })

  useEffect(() => {
    const fetch = async () => {
      if (tokenInfo != undefined) {
        const customToken = {
          id: tokenInfo.address,
          name: tokenInfo.name,
          address: tokenInfo.address,
          symbol: tokenInfo.symbol,
          logoURI: defaultTokenLogo,
          decimals: tokenInfo.decimals,
        };
        setDisplayTokenList([customToken])
      }
    };
    fetch();
  }, [tokenInfo]);

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
          for (let i = 0; i < coins.listed_tokens?.length; i++) {
            coins.listed_tokens[i].address = coins.listed_tokens[i].id;
          }
          if (coins.listed_tokens != undefined) {
            setListedTokenList(coins.listed_tokens);
            setDisplayTokenList(coins.listed_tokens);
          }
          for (let i = 0; i < coins.search_tokens?.length; i++) {
            coins.search_tokens[i].address = coins.search_tokens[i].id;
          }
          if (coins.search_tokens != undefined) {
            setSearchTokenList(coins.search_tokens);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    fetch();
  }, [chainId, address]);

  useEffect(() => {
    const fetch = async () => {
      // validate address
      const tokenAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if(customInput.match(tokenAddressRegex)?.length == 1 && customInput.length == 42) {
        // if not in listed tokens or search tokens we need to fetch data from the chain
        refetchTokenInfo()
      } else {
        setDisplayTokenList(listedTokenList)
      }
    };
    fetch();
  }, [customInput]);

  const chooseToken = (coin) => {
    coin = {
      name: coin?.name,
      address: coin?.id,
      symbol: coin?.symbol,
      logoURI: coin?.logoURI,
      decimals: coin?.decimals,
    };
    if (props.amount != undefined && props.isAmountIn != undefined) {
      if (props.type === "in") {
        props.setTokenIn(props.tokenOut, {
          name: coin?.name,
          address: coin?.address,
          symbol: coin?.symbol,
          logoURI: coin?.logoURI,
          decimals: coin?.decimals,
        }, props.amount, props.isAmountIn);
      } else {
        props.setTokenOut(props.tokenIn, {
          name: coin?.name,
          address: coin?.address,
          symbol: coin?.symbol,
          logoURI: coin?.logoURI,
          decimals: coin?.decimals,
        }, props.amount, props.isAmountIn);
      }
    } else {
      if (props.type === "in") {
        props.setTokenIn(props.tokenOut, {
          name: coin?.name,
          address: coin?.address,
          symbol: coin?.symbol,
          logoURI: coin?.logoURI,
          decimals: coin?.decimals,
        });
      } else {
        props.setTokenOut(props.tokenIn, {
          name: coin?.name,
          address: coin?.address,
          symbol: coin?.symbol,
          logoURI: coin?.logoURI,
          decimals: coin?.decimals,
        });
      }
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[4px] bg-black border border-grey text-left align-middle shadow-xl transition-all">
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
                      className="border border-grey bg-dark outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white text-sm"
                      placeholder="Search name or paste address"
                      // when inputVal is changed and set to a valid address we should fetch token info and populate the list with that item
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                    ></input>
                    <div className="flex justify-between flex-wrap mt-4 gap-y-2">
                      {displayTokenList.map((coin) => {
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
                    {displayTokenList
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
            ? "w-full whitespace-nowrap flex items-center gap-x-8 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]"
            : "w-full whitespace-nowrap flex items-center gap-x-2 md:gap-x-8 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] text-grey1"
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
