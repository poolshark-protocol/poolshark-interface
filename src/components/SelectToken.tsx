import { Fragment, useState, useEffect } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Transition, Dialog } from "@headlessui/react";
import CoinListButton from "./Buttons/CoinListButton";
import CoinListItem from "./CoinListItem";
import { useConfigStore } from "../hooks/useConfigStore";
import { defaultTokenLogo, getLogo } from "../utils/tokens";
import { isAddress } from "@ethersproject/address";
import { useShallow } from "zustand/react/shallow";
import useToken from "../hooks/contracts/useToken";
import { deepConvertBigIntAndBigNumber } from "../utils/misc";

export default function SelectToken(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [tokenInfo, setTokenInfo] = useState(undefined);

  const [
    logoMap,
    listedTokenList,
    searchtokenList,
    displayTokenList,
    setDisplayTokenList,
  ] = useConfigStore(
    useShallow((state) => [
      state.logoMap,
      state.listedtokenList,
      state.searchtokenList,
      state.displayTokenList,
      state.setDisplayTokenList,
    ]),
  );

  const onSuccess = () => {
    if (tokenData) setTokenInfo(deepConvertBigIntAndBigNumber(tokenData));
    else refetchTokenInfo();
  };

  const { tokenData, refetchTokenInfo } = useToken({
    tokenAddress: customInput,
    onSuccess,
  });

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
          native: false,
        };
        setDisplayTokenList([customToken]);
      }
    };
    fetch();
  }, [tokenInfo]);

  useEffect(() => {
    const fetch = async () => {
      // validate address
      if (isAddress(customInput)) {
        // if not in listed tokens or search tokens we need to fetch data from the chain
        refetchTokenInfo();
      } else {
        setDisplayTokenList(listedTokenList);
      }
    };
    fetch();
  }, [customInput, listedTokenList]);

  useEffect(() => {
    if (isOpen) {
      setCustomInput("");
      setDisplayTokenList(listedTokenList);
    }
  }, [isOpen]);

  const chooseToken = (coin) => {
    coin = {
      name: coin?.name,
      address: coin?.id,
      symbol: coin?.symbol,
      logoURI: coin?.logoURI,
      decimals: coin?.decimals,
      native: coin?.native ?? false,
      userBalance: coin?.balance ?? coin.userBalance ?? 0,
    };

    if (props.amount != undefined && props.isAmountIn != undefined) {
      if (props.type === "in") {
        props.setTokenIn(
          props.tokenOut,
          {
            name: coin?.name,
            address: coin?.address,
            symbol: coin?.symbol,
            logoURI: coin?.logoURI,
            decimals: coin?.decimals,
            native: coin?.native ?? false,
            userBalance: coin?.userBalance ?? 0,
          },
          props.amount,
          props.isAmountIn,
        );
      } else {
        props.setTokenOut(
          props.tokenIn,
          {
            name: coin?.name,
            address: coin?.address,
            symbol: coin?.symbol,
            logoURI: coin?.logoURI,
            decimals: coin?.decimals,
            native: coin?.native ?? false,
            userBalance: coin?.userBalance ?? 0,
          },
          props.amount,
          props.isAmountIn,
        );
      }
    } else {
      if (props.type === "in") {
        props.setTokenIn(props.tokenOut, {
          name: coin?.name,
          address: coin?.address,
          symbol: coin?.symbol,
          logoURI: coin?.logoURI,
          decimals: coin?.decimals,
          native: coin?.native ?? false,
          userBalance: coin?.userBalance ?? 0,
        });
      } else {
        props.setTokenOut(props.tokenIn, {
          name: coin?.name,
          address: coin?.address,
          symbol: coin?.symbol,
          logoURI: coin?.logoURI,
          decimals: coin?.decimals,
          native: coin?.native ?? false,
          userBalance: coin?.userBalance ?? 0,
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
                        onClick={() => closeModal()}
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
                    <div className="grid grid-cols-3 gap-x-4 mt-4 grid-rows-2 gap-y-2">
                      {displayTokenList?.slice(0, 6).map((coin) => {
                        if (
                          customInput.toLowerCase() === "" ||
                          customInput.toLowerCase() === " " ||
                          coin.symbol
                            .toLowerCase()
                            .includes(customInput.toLowerCase()) ||
                          coin.name
                            .toLowerCase()
                            .includes(customInput.toLowerCase()) ||
                          coin.address
                            .toLowerCase()
                            .includes(customInput.toLowerCase())
                        ) {
                          return (
                            <CoinListButton
                              key={coin.id + coin.symbol}
                              coin={coin}
                              chooseToken={chooseToken}
                            />
                          );
                        }
                      })}
                    </div>
                  </div>
                  <div className="h-[360px] overflow-y-auto">
                    {customInput == ""
                      ? listedTokenList
                          ?.sort((a, b) => b.balance - a.balance)
                          ?.map((coin) => {
                            if (
                              customInput.toLowerCase() == "" ||
                              customInput.toLowerCase() == " " ||
                              coin.symbol
                                .toLowerCase()
                                .includes(customInput.toLowerCase()) ||
                              coin.name
                                .toLowerCase()
                                .includes(customInput.toLowerCase()) ||
                              coin.address.toLowerCase() ==
                                customInput.toLowerCase()
                            ) {
                              return (
                                <CoinListItem
                                  key={coin.id + coin.symbol}
                                  coin={coin}
                                  chooseToken={chooseToken}
                                />
                              );
                            }
                          })
                      : searchtokenList
                          ?.sort((a, b) => b.balance - a.balance)
                          ?.map((coin) => {
                            if (
                              customInput.toLowerCase() == "" ||
                              customInput.toLowerCase() == " " ||
                              coin.symbol
                                .toLowerCase()
                                .includes(customInput.toLowerCase()) ||
                              coin.name
                                .toLowerCase()
                                .includes(customInput.toLowerCase()) ||
                              coin.address.toLowerCase() ==
                                customInput.toLowerCase()
                            ) {
                              return (
                                <CoinListItem
                                  key={coin.id + coin.symbol}
                                  coin={coin}
                                  chooseToken={chooseToken}
                                />
                              );
                            }
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
            <img
              className="md:w-6 w-6"
              src={
                props.type == "in"
                  ? getLogo(props.tokenIn, logoMap)
                  : getLogo(props.tokenOut, logoMap)
              }
            />
          ) : (
            <></>
          )}
          <span className="text-xs uppercase">
            {props.displayToken?.symbol}
          </span>
        </div>
        <ChevronDownIcon className="w-6" />
      </button>
    </div>
  );
}
